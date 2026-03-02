(function() {
  const FIELD_IDS = {
    service: window.CONSULT_FIELDS?.serviceType || null,
    memberType: window.CONSULT_FIELDS?.membershipIntent || null,
    openClasses: window.CONSULT_FIELDS?.joinClasses || null
  };

  const STEP_CONFIG = {
    service: {
      key: 'service',
      fieldId: FIELD_IDS.service,
      title: 'Which service are you looking for?',
      description: '',
      showProgress: false,
      options: [
        { value: '1-1 Personal Training', label: '1-1 Personal Training', hint: 'Work 1-1 with a BombersPT coach.' },
        {
          value: 'Coached group sessions',
          label: 'Coached group training',
          hint: 'Any coached sessions on our schedule: Foundations, Bombers Blueprint, Strong Mums, Weightlifting etc.',
          subOptions: [
            { label: 'Strong Mums club', action: 'strongMums', memberTypeValue: 'Membership enquiry' },
            { label: 'All other programmes', action: 'default' }
          ]
        },
        { value: 'Open Gym', label: 'Open gym access', hint: 'Open gym access only, no coached sessions.' },
        { value: 'Physio & Rehab', label: 'Physio & Rehab', hint: 'Work with Venture Sports Physio.', redirect: 'https://physio.bomberspt.co.uk' }
      ]
    },
    memberType: {
      key: 'memberType',
      fieldId: FIELD_IDS.memberType,
      title: 'Which option best describes your enquiry?',
      description: '',
      options: [
        { value: 'Membership enquiry', label: 'Membership enquiry', hint: "I'm interested in a recurring membership." },
        { value: 'Drop-in sessions (non-recurring)', label: 'Drop-in sessions (non-recurring)', hint: 'I’m just looking for drop-ins or short-term passes.' }
      ]
    }
  };

  const state = {
    fields: null,
    contactId: null,
    hints: {},
    pending: false,
    resolve: null,
    active: false,
    forceMask: null,
    forceValues: {}
  };

  const els = {
    overlay: null,
    question: null,
    description: null,
    options: null,
    progress: null,
    error: null,
    spinner: null,
    back: null
  };

  function ensureElements() {
    if (els.overlay) return;
    els.overlay = document.getElementById('enquiry-flow-overlay');
    els.question = document.getElementById('enquiry-flow-question');
    els.description = document.getElementById('enquiry-flow-description');
    els.options = document.getElementById('enquiry-flow-options');
    els.progress = document.getElementById('enquiry-flow-progress');
    els.error = document.getElementById('enquiry-flow-error');
    els.spinner = document.getElementById('enquiry-flow-spinner');
    els.back = document.getElementById('enquiry-flow-back');
    if (els.back && !els.back.dataset.bound) {
      els.back.dataset.bound = '1';
      els.back.addEventListener('click', () => {
        handleBack();
      });
    }
  }

  function handleSubOptionSelect(step, parentOption, subOption) {
    if (!step || !parentOption || !subOption || state.pending) return;
    const meta = {};
    const additionalPayload = {};
    if (subOption.memberTypeValue && FIELD_IDS.memberType) {
      additionalPayload[FIELD_IDS.memberType] = subOption.memberTypeValue;
    }
    if (Object.keys(additionalPayload).length) {
      meta.additionalPayload = additionalPayload;
    }
    if (subOption.action === 'strongMums') {
      meta.onSuccess = async () => {
        await tagStrongMumsLead();
        if (typeof window.markStrongMumsRedirectHint === 'function') {
          window.markStrongMumsRedirectHint();
        } else {
          window._strongMumsRedirectHint = true;
        }
        completeFlow();
        setTimeout(() => {
          if (typeof window.renderStrongMumsFlow === 'function') {
            try {
              window.renderStrongMumsFlow(window._latestContactFields || state.fields || {});
              return;
            } catch (err) {
              console.warn('[EnquiryFlow] Strong Mums render failed, reloading', err);
            }
          }
          window.location.reload();
        }, 120);
      };
    } else if (typeof subOption.onSuccess === 'function') {
      meta.onSuccess = subOption.onSuccess;
    }
    handleOptionSelect(step, parentOption, meta);
  }

  function escapeHtml(str) {
    if (typeof window.escapeHtml === 'function') return window.escapeHtml(str);
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getFieldValue(fieldId, fields = state.fields) {
    if (!fieldId || !fields) return '';
    if (state.forceMask && state.forceMask.has(fieldId)) {
      return state.forceValues[fieldId] || '';
    }
    const raw = fields[fieldId];
    return typeof raw === 'string' ? raw.trim() : raw ? String(raw).trim() : '';
  }

  function setFieldValue(fieldId, value) {
    if (!fieldId) return;
    if (state.fields) state.fields[fieldId] = value;
    if (window._latestContactFields) {
      window._latestContactFields[fieldId] = value;
    }
    if (state.forceMask && state.forceMask.has(fieldId)) {
      state.forceMask.delete(fieldId);
      delete state.forceValues[fieldId];
    }
  }

  function normalizeService(value) {
    return String(value || '').trim().toLowerCase();
  }

  function requiresMemberQuestion(serviceValue) {
    const normalized = normalizeService(serviceValue);
    if (!normalized) return false;
    return normalized.includes('coach') || normalized.includes('open');
  }

  function isOpenGymService(serviceValue) {
    return normalizeService(serviceValue).includes('open');
  }

  function canGoBack() {
    if (!FIELD_IDS.service) return false;
    const serviceVal = getFieldValue(FIELD_IDS.service);
    if (!serviceVal) return false;
    const memberVal = FIELD_IDS.memberType ? getFieldValue(FIELD_IDS.memberType) : '';
    if (memberVal && requiresMemberQuestion(serviceVal)) return true;
    return true;
  }

  function updateBackButtonState(forceDisabled) {
    if (!els.back) return;
    const show = canGoBack();
    els.back.style.visibility = show ? 'visible' : 'hidden';
    els.back.style.opacity = show ? '1' : '0';
    els.back.disabled = forceDisabled || !show;
  }

  function toggleParentOption(element) {
    if (!element || !els.options) return;
    const already = element.classList.contains('is-expanded');
    els.options.querySelectorAll('.enquiry-flow-option--parent').forEach((node) => {
      node.classList.remove('is-expanded');
      node.setAttribute('aria-expanded', 'false');
    });
    if (!already) {
      element.classList.add('is-expanded');
      element.setAttribute('aria-expanded', 'true');
    }
  }

  function buildRedirectUrl(base) {
    if (!base) return base;
    const contactId = state.contactId || window.contactId || '';
    if (!contactId) return base;
    try {
      const dest = new URL(base, window.location.origin);
      dest.searchParams.set('contactId', contactId);
      return dest.toString();
    } catch (_) {
      const sep = base.includes('?') ? '&' : '?';
      return `${base}${sep}contactId=${encodeURIComponent(contactId)}`;
    }
  }

  function nextStepKey(fields = state.fields) {
    if (!FIELD_IDS.service) return null;
    const serviceVal = getFieldValue(FIELD_IDS.service, fields);
    if (!serviceVal) return 'service';
    if (requiresMemberQuestion(serviceVal)) {
      if (FIELD_IDS.memberType && !getFieldValue(FIELD_IDS.memberType, fields)) {
        return 'memberType';
      }
    }
    return null;
  }

  function shouldRunFlow(fields) {
    return !!nextStepKey(fields);
  }

  function openOverlay() {
    ensureElements();
    if (!els.overlay) return;
    els.overlay.hidden = false;
    els.overlay.classList.add('is-active');
    els.overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('enquiry-flow-open');
    state.active = true;
  }

  function closeOverlay() {
    if (!els.overlay) return;
    els.overlay.classList.remove('is-active');
    els.overlay.setAttribute('aria-hidden', 'true');
    els.overlay.hidden = true;
    document.body.classList.remove('enquiry-flow-open');
    state.active = false;
  }

  function setLoading(isLoading) {
    if (!els.overlay) return;
    if (isLoading) {
      els.overlay.classList.add('is-loading');
    } else {
      els.overlay.classList.remove('is-loading');
    }
    updateBackButtonState(isLoading);
  }

  function showError(message) {
    if (!els.error) return;
    if (!message) {
      els.error.textContent = '';
      els.error.classList.remove('is-visible');
      return;
    }
    els.error.textContent = message;
    els.error.classList.add('is-visible');
  }

  function getCompletedSteps() {
    if (!state.fields) return 0;
    let count = 0;
    const serviceVal = getFieldValue(FIELD_IDS.service);
    if (serviceVal) count += 1;
    if (serviceVal && requiresMemberQuestion(serviceVal) && getFieldValue(FIELD_IDS.memberType)) {
      count += 1;
    }
    return count;
  }

  function getTotalSteps() {
    const serviceVal = getFieldValue(FIELD_IDS.service);
    let total = 1;
    if (serviceVal && requiresMemberQuestion(serviceVal)) total += 1;
    return total;
  }

  function handleOptionSelect(step, option, meta = {}) {
    if (!step || !option || state.pending) return;
    if (option.redirect) {
      const destination = buildRedirectUrl(option.redirect);
      try {
        window.location.assign(destination);
      } catch (_) {
        window.open(destination, '_blank');
      }
      return;
    }
    if (!step.fieldId) {
      // Nothing to store; skip ahead.
      renderStep();
      return;
    }
    state.pending = true;
    setLoading(true);
    showError('');

    const payload = {};
    payload[step.fieldId] = option.value;
    if (meta.additionalPayload && typeof meta.additionalPayload === 'object') {
      Object.assign(payload, meta.additionalPayload);
    }

    if (step.key === 'service') {
      if (!requiresMemberQuestion(option.value) && FIELD_IDS.memberType) {
        payload[FIELD_IDS.memberType] = '';
      }
      if (FIELD_IDS.openClasses) {
        payload[FIELD_IDS.openClasses] = isOpenGymService(option.value) ? 'No' : '';
      }
    }

    const persist = async () => {
      if (!state.contactId || typeof window.updateFieldsBatch !== 'function') {
        Object.entries(payload).forEach(([field, value]) => setFieldValue(field, value));
        state.pending = false;
        setLoading(false);
        renderStep();
        return;
      }
      try {
        await window.updateFieldsBatch(state.contactId, payload);
        Object.entries(payload).forEach(([field, value]) => setFieldValue(field, value));
        state.pending = false;
        setLoading(false);
        if (typeof meta.onSuccess === 'function') {
          await meta.onSuccess();
        } else {
          renderStep();
        }
      } catch (err) {
        console.error('[EnquiryFlow] Failed to update field', err);
        state.pending = false;
        setLoading(false);
        showError(err?.message || 'Save failed. Please try again.');
      }
    };

    persist();
  }

  function renderStep() {
    const stepKey = nextStepKey();
    if (!stepKey) {
      completeFlow();
      return;
    }

    if (!state.active) {
      openOverlay();
    }

    const config = STEP_CONFIG[stepKey];
    if (!config) {
      completeFlow();
      return;
    }

    showError('');

    const completed = getCompletedSteps();
    const total = getTotalSteps();
    if (els.progress) {
      if (config.showProgress === false) {
        els.progress.style.display = 'none';
        els.progress.textContent = '';
      } else {
        els.progress.style.display = '';
        const stepNumber = Math.min(completed + 1, (total || completed + 1));
        els.progress.textContent = total ? `Question ${stepNumber} of ${total}` : `Question ${stepNumber}`;
      }
    }
    if (els.question) {
      els.question.textContent = config.title || '';
    }
    if (els.description) {
      if (config.description) {
        els.description.textContent = config.description;
        els.description.style.display = 'block';
      } else {
        els.description.textContent = '';
        els.description.style.display = 'none';
      }
    }
    if (els.options) {
      const optionsHtml = (config.options || []).map((opt, idx) => {
        if (!opt) return '';
        const hasChildren = Array.isArray(opt.subOptions) && opt.subOptions.length;
        if (!hasChildren) {
          return `
            <button type="button" class="enquiry-flow-option" data-option-index="${idx}">
              <span class="enquiry-flow-option__label">${escapeHtml(opt.label || opt.value)}</span>
              ${opt.hint ? `<span class="enquiry-flow-option__hint">${escapeHtml(opt.hint)}</span>` : ''}
            </button>
          `;
        }
        const childButtons = opt.subOptions.map((child, childIdx) => `
          <button type="button" class="enquiry-flow-suboption" data-parent-index="${idx}" data-sub-index="${childIdx}">
            <span class="enquiry-flow-suboption__label">${escapeHtml(child.label || child.value || '')}</span>
            ${child.hint ? `<span class="enquiry-flow-suboption__hint">${escapeHtml(child.hint)}</span>` : ''}
          </button>
        `).join('');
        return `
          <div class="enquiry-flow-option enquiry-flow-option--parent" data-option-index="${idx}" role="button" tabindex="0" aria-expanded="false">
            <div class="enquiry-flow-option__label">${escapeHtml(opt.label || opt.value)}</div>
            ${opt.hint ? `<div class="enquiry-flow-option__hint">${escapeHtml(opt.hint)}</div>` : ''}
            <div class="enquiry-flow-suboptions">
              ${childButtons}
            </div>
          </div>
        `;
      }).join('');
      els.options.innerHTML = optionsHtml || '<p style="color:#4f5d7e;">No options available.</p>';
      const buttons = els.options.querySelectorAll('button.enquiry-flow-option');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.getAttribute('data-option-index'));
          const option = (config.options || [])[idx] || null;
          handleOptionSelect(config, option);
        });
      });
      const parentBlocks = els.options.querySelectorAll('.enquiry-flow-option--parent');
      parentBlocks.forEach(block => {
        block.addEventListener('click', (event) => {
          if (event.target.closest('.enquiry-flow-suboption')) return;
          toggleParentOption(block);
        });
        block.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleParentOption(block);
          }
        });
      });
      const subButtons = els.options.querySelectorAll('.enquiry-flow-suboption');
      subButtons.forEach(btn => {
        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          const parentIdx = Number(btn.getAttribute('data-parent-index'));
          const subIdx = Number(btn.getAttribute('data-sub-index'));
          const parentOption = (config.options || [])[parentIdx];
          const childOption = parentOption?.subOptions?.[subIdx];
          handleSubOptionSelect(config, parentOption, childOption);
        });
      });
    }

    setLoading(false);
    updateBackButtonState(false);
  }

  async function handleBack() {
    if (state.pending) return;
    const serviceVal = getFieldValue(FIELD_IDS.service);
    if (!serviceVal) {
      closeOverlay();
      return;
    }
    const memberVal = FIELD_IDS.memberType ? getFieldValue(FIELD_IDS.memberType) : '';
    let fieldToClear = null;
    if (FIELD_IDS.memberType && memberVal && requiresMemberQuestion(serviceVal)) {
      fieldToClear = FIELD_IDS.memberType;
    } else {
      fieldToClear = FIELD_IDS.service;
    }
    if (!fieldToClear) return;

    const payload = {};
    payload[fieldToClear] = '';
    if (fieldToClear === FIELD_IDS.service) {
      if (FIELD_IDS.memberType) payload[FIELD_IDS.memberType] = '';
      if (FIELD_IDS.openClasses) payload[FIELD_IDS.openClasses] = '';
    }

    state.pending = true;
    setLoading(true);
    showError('');
    try {
      if (state.contactId && typeof window.updateFieldsBatch === 'function') {
        await window.updateFieldsBatch(state.contactId, payload);
      }
      Object.entries(payload).forEach(([field, value]) => setFieldValue(field, value));
      state.pending = false;
      setLoading(false);
      renderStep();
    } catch (err) {
      console.error('[EnquiryFlow] Failed to go back', err);
      state.pending = false;
      setLoading(false);
      showError(err?.message || 'Unable to go back right now.');
    }
  }

  function completeFlow() {
    closeOverlay();
    state.forceMask = null;
    state.forceValues = {};
    try {
      if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS?.ENQUIRY_FORM) {
        window.forceChecklistFlag(window.OPPORTUNITY_LABELS.ENQUIRY_FORM, true);
      }
    } catch (err) {
      console.warn('[EnquiryFlow] Unable to mark enquiry checklist', err);
    }
    if (typeof state.resolve === 'function') {
      state.resolve();
    }
    if (typeof window.renderChecklist === 'function') {
      setTimeout(() => window.renderChecklist(), 300);
    }
    state.resolve = null;
    state.pending = false;
  }

  async function tagStrongMumsLead() {
    const tag = window.TAGS?.STRONG_MUMS_LEAD || 'strong mums lead';
    if (!tag || !state.contactId || typeof window.addTagToContact !== 'function') return;
    const normalized = tag.toLowerCase();
    try {
      await window.addTagToContact(state.contactId, tag);
      if (window._latestContact) {
        const existing = Array.isArray(window._latestContact.tags) ? window._latestContact.tags : [];
        if (!existing.some(t => String(t).toLowerCase() === normalized)) {
          existing.push(tag);
          window._latestContact.tags = existing;
        }
      }
    } catch (err) {
      console.warn('[EnquiryFlow] Unable to tag Strong Mums lead', err);
    }
  }

  async function ensureEnquiryFlow(fields, options = {}) {
    const force = !!options.force;
    if (!force && !shouldRunFlow(fields)) {
      return;
    }
    ensureElements();
    if (!els.overlay) return;
    state.fields = fields;
    state.contactId = options.contactId || window.contactId || null;
    state.hints = options.hints || {};
    if (force) {
      const mask = new Set();
      Object.values(FIELD_IDS).forEach(id => {
        if (id) mask.add(id);
      });
      state.forceMask = mask;
      state.forceValues = {};
    } else {
      state.forceMask = null;
      state.forceValues = {};
    }
    await new Promise((resolve) => {
      state.resolve = resolve;
      renderStep();
    });
  }

  window.ensureEnquiryFlow = ensureEnquiryFlow;
})();
