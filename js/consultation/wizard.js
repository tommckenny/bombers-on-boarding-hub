(function() {
  // anchor: parq.start (modal wizard state/refs)
  const QUESTIONS = Array.isArray(window.PARQ_QUESTIONS) ? window.PARQ_QUESTIONS : [];
  const FIELD_IDS = window.PARQ_FIELD_IDS || {};
  const STORAGE_FIELD = window.PARQ_STORAGE_FIELD;
  const LEGACY_STORAGE_FIELD = window.PARQ_LEGACY_STORAGE_FIELD;
  const FIELDS = window.FIELDS || {};
  const TAGS = window.TAGS || {};

  // anchor: parq.state
  const state = {
    open: false,
    saving: false,
    responses: {},
    error: '',
    dirty: false,
    currentIndex: 0
  };
  let parqEmbedConfig = null;
  let introSlideConfig = null;

  function overlay() { return document.getElementById('consultation-modal-overlay'); }
  function modal() { return overlay() && overlay().querySelector('.consultation-modal'); }
  function bodyEl() { return document.getElementById('consultation-body'); }
  function errEl() { return modal() && modal().querySelector('.consultation-error'); }
  function progressEl() { return modal() && modal().querySelector('.consultation-progress'); }
  function spinnerEl() { return modal() && modal().querySelector('.consultation-spinner'); }
  function btnCTA() { return modal() && modal().querySelector('.consultation-cta'); }
  function btnBack() { return modal() && modal().querySelector('.consultation-back'); }
  function closeLayer() { return modal() && modal().querySelector('.consultation-close-confirm'); }

  function showOverlay() {
    const ov = overlay();
    if (!ov) return;
    ov.style.display = 'flex';
    if (!parqEmbedConfig || !parqEmbedConfig.host) {
      document.body.style.overflow = 'hidden';
    }
  }

  function hideOverlay() {
    const ov = overlay();
    if (!ov) return;
    ov.style.display = 'none';
    if (!parqEmbedConfig || !parqEmbedConfig.host) {
      document.body.style.overflow = '';
    }
  }

  function createEmptyState() {
    return { version: 1, responses: {} };
  }

  function ensureResponses() {
    if (!state.responses || typeof state.responses !== 'object') {
      state.responses = {};
    }
    return state.responses;
  }

  function getQuestionEntry(questionId) {
    const responses = ensureResponses();
    if (!responses[questionId]) {
      responses[questionId] = { answer: '', detail: '' };
    }
    return responses[questionId];
  }

  function questionRequiresDetail(question) {
    return !!(question && question.requiresDetail !== false);
  }

  function isQuestionComplete(question, entry) {
    if (!question) return true;
    const record = entry || getQuestionEntry(question.id);
    const answer = record.answer;
    if (answer !== 'yes' && answer !== 'no') return false;
    if (answer === 'yes' && questionRequiresDetail(question)) {
      return typeof record.detail === 'string' && record.detail.trim().length > 0;
    }
    return true;
  }

  function findFirstIncomplete(responses) {
    if (!Array.isArray(QUESTIONS) || !QUESTIONS.length) return -1;
    for (let i = 0; i < QUESTIONS.length; i += 1) {
      const question = QUESTIONS[i];
      const entry = responses ? responses[question.id] : undefined;
      if (!isQuestionComplete(question, entry)) {
        return i;
      }
    }
    return -1;
  }

  function parseStored(raw) {
    if (!raw || typeof raw !== 'string') return createEmptyState();
    const trimmed = raw.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return createEmptyState();
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && parsed.responses && typeof parsed.responses === 'object') {
        return { version: parsed.version || 1, responses: parsed.responses };
      }
    } catch (err) {
      console.debug('[Checklist] Skipping unparsable PAR-Q data');
    }
    return createEmptyState();
  }

  function serialiseResponses(responses) {
    const entries = responses && typeof responses === 'object' ? responses : {};
    const hasAny = Object.values(entries).some(entry => entry && entry.answer);
    if (!hasAny) return '';
    return JSON.stringify({ version: 1, responses: entries });
  }

  function cloneResponses(responses) {
    const out = {};
    Object.entries(responses || {}).forEach(([key, value]) => {
      out[key] = value ? { answer: value.answer, detail: value.detail || '' } : { answer: '', detail: '' };
    });
    return out;
  }

  function loadExistingResponses() {
    const fields = window._latestContactFields || {};
    let storedRaw = STORAGE_FIELD ? (fields[STORAGE_FIELD] || '') : '';
    if (!storedRaw && LEGACY_STORAGE_FIELD) {
      storedRaw = fields[LEGACY_STORAGE_FIELD] || '';
    }
    const stored = parseStored(storedRaw);
    const responses = cloneResponses(stored.responses || {});

    Object.entries(FIELD_IDS).forEach(([questionId, fieldId]) => {
      const raw = fieldId ? fields[fieldId] : '';
      const normalized = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
      if (normalized === 'yes' || normalized === 'no') {
        responses[questionId] = {
          answer: normalized,
          detail: normalized === 'yes' ? (responses[questionId]?.detail || '') : ''
        };
      }
    });

    state.responses = responses;
    state.dirty = false;
    const firstIncomplete = findFirstIncomplete(responses);
    if (firstIncomplete >= 0) {
      state.currentIndex = firstIncomplete;
    } else if (Array.isArray(QUESTIONS) && QUESTIONS.length) {
      state.currentIndex = QUESTIONS.length - 1;
    } else {
      state.currentIndex = 0;
    }
  }

  function seekToFirstIncomplete(responses) {
    const firstIncomplete = findFirstIncomplete(responses || state.responses);
    if (firstIncomplete >= 0) {
      state.currentIndex = firstIncomplete;
      return;
    }
    state.currentIndex = 0;
  }

  // anchor: parq.render
  function render() {
    const body = bodyEl();
    if (!body) return;
    ensureResponses();

    const totalQuestions = Array.isArray(QUESTIONS) ? QUESTIONS.length : 0;
    if (totalQuestions === 0) {
      window.safeSetHTML(body, '<p style="margin:1.2em 0;">Health questions are currently unavailable. Please contact the team.</p>');
      const cta = btnCTA();
      if (cta) {
        cta.textContent = 'Submit';
        cta.disabled = true;
        cta.dataset.parqAction = 'submit';
      }
      const errorNode = errEl();
      if (errorNode) {
        errorNode.style.display = 'none';
        errorNode.textContent = '';
      }
      return;
    }

    state.currentIndex = (typeof state.currentIndex === 'number') ? state.currentIndex : -1;
    if (state.currentIndex < -1) state.currentIndex = -1;
    if (state.currentIndex >= totalQuestions) state.currentIndex = totalQuestions - 1;

    if (state.currentIndex === -1) {
      const slideTitle = (introSlideConfig && introSlideConfig.title) || 'We just need to ask a few health questions before you book';
      const slideBody = (introSlideConfig && introSlideConfig.body) || '';
      const slideButton = (introSlideConfig && introSlideConfig.buttonLabel) || 'Continue';

      const progressNode = progressEl();
      if (progressNode) progressNode.style.display = 'none';
      const spinnerNode = spinnerEl();
      if (spinnerNode) spinnerNode.style.display = state.saving ? 'block' : 'none';
      const actionButton = btnCTA();
      if (actionButton) {
        actionButton.textContent = slideButton;
        actionButton.dataset.parqAction = 'start';
        actionButton.disabled = state.saving;
      }
      const backBtn = btnBack();
      if (backBtn) backBtn.style.display = 'none';
      const errorNode = errEl();
      if (errorNode) {
        errorNode.style.display = 'none';
        errorNode.textContent = '';
      }
      window.safeSetHTML(body, `
        <div class="consultation-parq-wrapper">
          <header class="consultation-parq-header">
            <h3 class="consultation-step-title">${window.escapeHtml(slideTitle)}</h3>
            ${slideBody ? `<p class="consultation-parq-helper">${window.escapeHtml(slideBody)}</p>` : ''}
          </header>
        </div>
      `);
      const startFlow = (event) => {
        if (event && typeof event.preventDefault === 'function') event.preventDefault();
        if (state.saving) return;
        seekToFirstIncomplete(state.responses);
        state.error = '';
        render();
      };
      if (actionButton) {
        actionButton.onclick = startFlow;
      }
      return;
    }

    const question = QUESTIONS[state.currentIndex];
    const entry = getQuestionEntry(question.id);
    const needsDetail = questionRequiresDetail(question);

    const progressNode = progressEl();
    if (progressNode) {
      progressNode.textContent = `Question ${state.currentIndex + 1} of ${totalQuestions}`;
    }

    const spinnerNode = spinnerEl();
    if (spinnerNode) {
      spinnerNode.style.display = state.saving ? 'block' : 'none';
    }

    const actionButton = btnCTA();
    if (actionButton) {
      actionButton.textContent = state.currentIndex === totalQuestions - 1 ? 'Submit' : 'Next question';
      actionButton.disabled = state.saving;
      actionButton.dataset.parqAction = state.currentIndex === totalQuestions - 1 ? 'submit' : 'next';
    }

    const errorNode = errEl();
    const syncError = () => {
      if (!errorNode) return;
      if (state.error) {
        errorNode.style.display = 'block';
        errorNode.textContent = state.error;
      } else {
        errorNode.style.display = 'none';
        errorNode.textContent = '';
      }
    };
    syncError();

    const detailVisible = entry.answer === 'yes' && needsDetail;
    const detailValue = entry.detail || '';

    const markup = `
      <div class="consultation-parq-wrapper" data-parq-index="${state.currentIndex}" data-parq-total="${totalQuestions}">
        <header class="consultation-parq-header">
          <h3 class="consultation-step-title">Health screening (PAR-Q)</h3>
          <p class="consultation-parq-helper">Answer each question. If you choose “Yes”, add a short note so your coach can plan safely.</p>
        </header>
        <div class="consultation-parq-question" data-question-id="${question.id}">
          <div class="consultation-parq-label">${window.escapeHtml(question.label)}</div>
          <div class="consultation-parq-options">
            <button type="button" class="parq-option${entry.answer === 'yes' ? ' selected is-selected' : ''}" data-parq-answer="yes">Yes</button>
            <button type="button" class="parq-option${entry.answer === 'no' ? ' selected is-selected' : ''}" data-parq-answer="no">No</button>
          </div>
          <div class="consultation-parq-detail" data-parq-detail style="display:${detailVisible ? 'grid' : 'none'}">
            ${question.detailPrompt ? `<div class="consultation-helper">${window.escapeHtml(question.detailPrompt)}</div>` : ''}
            <textarea data-parq-detail-input placeholder="Add brief details">${window.escapeHtml(detailValue)}</textarea>
          </div>
        </div>
        <div class="consultation-parq-controls">
          <button type="button" class="parq-back-btn" data-parq-back${state.currentIndex === 0 ? ' disabled' : ''}>← Go back</button>
          <div class="consultation-parq-progress">Question ${state.currentIndex + 1} of ${totalQuestions}</div>
        </div>
      </div>
    `;

    window.safeSetHTML(body, markup);

    const questionWrapper = body.querySelector('[data-question-id]');
    const yesBtn = questionWrapper ? questionWrapper.querySelector('[data-parq-answer="yes"]') : null;
    const noBtn = questionWrapper ? questionWrapper.querySelector('[data-parq-answer="no"]') : null;
    const detailWrap = questionWrapper ? questionWrapper.querySelector('[data-parq-detail]') : null;
    const detailInput = questionWrapper ? questionWrapper.querySelector('[data-parq-detail-input]') : null;
    const backBtn = body.querySelector('[data-parq-back]');

    const syncSelection = () => {
      const value = entry.answer;
      if (yesBtn) {
        const isYes = value === 'yes';
        yesBtn.classList.toggle('selected', isYes);
        yesBtn.classList.toggle('is-selected', isYes);
      }
      if (noBtn) {
        const isNo = value === 'no';
        noBtn.classList.toggle('selected', isNo);
        noBtn.classList.toggle('is-selected', isNo);
      }
      if (detailWrap) {
        const show = value === 'yes' && needsDetail;
        detailWrap.style.display = show ? 'grid' : 'none';
      }
      if (detailInput && detailInput.value !== (entry.detail || '')) {
        detailInput.value = entry.detail || '';
      }
    };

    syncSelection();

    function selectAnswer(nextValue) {
      if (state.saving) return;
      const record = getQuestionEntry(question.id);
      if (record.answer !== nextValue) {
        record.answer = nextValue;
        state.dirty = true;
      }
      if (nextValue !== 'yes') {
        record.detail = '';
      }
      state.error = '';
      syncError();
      syncSelection();
      if (nextValue === 'yes' && needsDetail && detailInput) {
        detailInput.focus();
      }
      if (nextValue === 'no') {
        const idxSnapshot = state.currentIndex;
        setTimeout(() => {
          if (!state.saving && state.currentIndex === idxSnapshot) {
            goNext();
          }
        }, 180);
      }
    }

    function validateCurrentQuestion() {
      const record = getQuestionEntry(question.id);
      if (record.answer !== 'yes' && record.answer !== 'no') {
        state.error = 'Please answer this question before continuing.';
        syncError();
        return false;
      }
      if (record.answer === 'yes' && needsDetail) {
        if (!record.detail || !record.detail.trim()) {
          state.error = 'Add a short note when you answer “Yes”.';
          syncError();
          if (detailInput) detailInput.focus();
          return false;
        }
      }
      state.error = '';
      syncError();
      return true;
    }

    function goNext() {
      if (!validateCurrentQuestion()) return;
      if (state.currentIndex >= totalQuestions - 1) {
        submitParq();
      } else {
        state.currentIndex += 1;
        state.error = '';
        render();
      }
    }

    function goBack() {
      if (state.saving || state.currentIndex === 0) return;
      state.currentIndex = Math.max(0, state.currentIndex - 1);
      state.error = '';
      render();
    }

    if (yesBtn) {
      yesBtn.addEventListener('click', () => selectAnswer('yes'));
    }
    if (noBtn) {
      noBtn.addEventListener('click', () => selectAnswer('no'));
    }
    if (detailInput) {
      detailInput.addEventListener('input', () => {
        if (state.saving) return;
        const record = getQuestionEntry(question.id);
        record.detail = detailInput.value;
        state.dirty = true;
      });
    }
    if (backBtn) {
      backBtn.addEventListener('click', goBack);
    }

    if (actionButton) {
      actionButton.onclick = (event) => {
        event.preventDefault();
        if (state.saving) return;
        goNext();
      };
    }
  }
  function showCloseConfirm() {
    const layer = closeLayer();
    if (!layer) return;
    layer.style.display = 'flex';
    const stay = layer.querySelector('[data-confirm="stay"]');
    const discard = layer.querySelector('[data-confirm="discard"]');
    if (stay && !stay.dataset.bound) {
      stay.dataset.bound = '1';
      stay.addEventListener('click', () => {
        layer.style.display = 'none';
      });
    }
    if (discard && !discard.dataset.bound) {
      discard.dataset.bound = '1';
      discard.addEventListener('click', () => {
        layer.style.display = 'none';
        state.dirty = false;
        state.error = '';
        closeParqModal();
      });
    }
  }

  function hideCloseConfirm() {
    const layer = closeLayer();
    if (layer) {
      layer.style.display = 'none';
    }
  }

  // anchor: parq.collectResponses
  function collectResponses() {
    ensureResponses();
    const responses = {};
    QUESTIONS.forEach(question => {
      const entry = state.responses[question.id] || {};
      const answer = entry.answer === 'yes' || entry.answer === 'no' ? entry.answer : '';
      responses[question.id] = {
        answer,
        detail: entry.detail || ''
      };
    });
    return responses;
  }

  // anchor: parq.validateResponses
  function validateResponses(responses) {
    for (const question of QUESTIONS) {
      const entry = responses[question.id] || {};
      if (entry.answer !== 'yes' && entry.answer !== 'no') {
        return { ok: false, message: 'Please answer every health question.' };
      }
      if (entry.answer === 'yes' && question.requiresDetail !== false) {
        if (!entry.detail || !entry.detail.trim()) {
          return { ok: false, message: 'Add details for any question answered Yes.' };
        }
      }
    }
    return { ok: true };
  }

  // anchor: parq.buildSummary
  function buildSummary(responses) {
    const items = [];
    QUESTIONS.forEach(question => {
      const entry = responses[question.id];
      const detail = entry?.detail ? entry.detail.trim() : '';
      if (entry?.answer === 'yes' && detail) {
        items.push(`- ${question.label}: ${detail}`);
      }
    });
    if (!items.length) return '';
    return `PAR-Q Flags:
${items.join('\n')}`;
  }

  // anchor: parq.buildFullNote
  function buildFullNote(responses) {
    const flagged = [];
    QUESTIONS.forEach(question => {
      const entry = responses[question.id] || {};
      if (entry.answer === 'yes') {
        const notes = entry.detail && entry.detail.trim() ? `\nNotes: ${entry.detail.trim()}` : '';
        flagged.push(`${question.label}\nYes${notes}`);
      }
    });

    if (!flagged.length) {
      return "All questions answered 'No'";
    }

    return `PAR-Q flagged:\n${flagged.join('\n\n')}`;
  }

  function buildContactNote(responses) {
    const flagged = [];
    QUESTIONS.forEach(question => {
      const entry = responses[question.id] || {};
      if (entry.answer !== 'yes') return;
      const note = entry.detail && entry.detail.trim() ? entry.detail.trim() : '';
      flagged.push({ label: question.label, note });
    });

    if (!flagged.length) {
      return 'PAR-Q: green light';
    }

    return `PAR-Q: flagged:\n${flagged.map(item => {
      const lines = [
        `- ${item.label}`,
        `  - Yes`
      ];
      if (item.note) {
        lines.push(`  - ${item.note}`);
      }
      return lines.join('\n');
    }).join('\n')}`;
  }

  // anchor: parq.submit
  async function submitParq() {
    if (state.saving) return;
    const contactId = window.contactId;
    if (!contactId) {
      state.error = 'Missing contact ID. Please reload your onboarding link.';
      render();
      return;
    }

    const responses = collectResponses();
    const hasAnyYes = Object.values(responses || {}).some(entry => entry && entry.answer === 'yes');
    const valid = validateResponses(responses);
    if (!valid.ok) {
      state.error = valid.message;
      render();
      return;
    }

    const payload = {};
    Object.entries(responses).forEach(([questionId, entry]) => {
      const fieldId = FIELD_IDS[questionId];
      if (!fieldId) return;
      payload[fieldId] = entry.answer === 'yes' ? 'Yes' : 'No';
    });
    if (STORAGE_FIELD) {
      payload[STORAGE_FIELD] = serialiseResponses(responses);
    }

    const fields = window._latestContactFields || {};
    const existingNotes = FIELDS.CONSULT_Q4 ? (fields[FIELDS.CONSULT_Q4] || '') : '';
    const summary = buildSummary(responses);
    if (summary && FIELDS.CONSULT_Q4) {
      const combined = existingNotes ? `${existingNotes}

${summary}` : summary;
      payload[FIELDS.CONSULT_Q4] = combined;
    }

    state.saving = true;
    state.error = '';
    render();

    try {
      if (Object.keys(payload).length) {
        await window.updateFieldsBatch(contactId, payload);
      }

      if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS) {
        try {
          window.forceChecklistFlag(window.OPPORTUNITY_LABELS.HEALTH_FORM, true);
        } catch (flagErr) {
          console.warn('[Checklist] Unable to set health form checklist flag', flagErr);
        }
      }

      // Update cached contact data so UI refreshes immediately
      const contactFields = window._latestContactFields || {};
      Object.entries(payload).forEach(([fieldId, value]) => {
        contactFields[fieldId] = value;
      });
      window._latestContactFields = contactFields;
      if (window._latestContact) {
        window._latestContact.tags = Array.isArray(window._latestContact.tags) ? window._latestContact.tags.filter(Boolean) : [];
      }

      state.saving = false;
      state.dirty = false;
      state.open = false;
      hideCloseConfirm();
      closeParqModal();
      window.burst();

      if (typeof window.addNoteToContact === 'function') {
        const noteBody = buildContactNote(responses);
        if (noteBody) {
          await window.addNoteToContact(contactId, noteBody).catch(() => {});
        }
      }

      if (hasAnyYes && typeof window.showAlert === 'function') {
        const alertHandle = `parq-${Date.now()}`;
        window._parqAlertHandle = alertHandle;
        window.showAlert(
          "Thanks for completing your health form. Don't worry—this doesn't necessarily mean you can't start with us! We'll discuss your answers in your intro.",
          'action',
          'Health form note'
        );
        setTimeout(() => {
          if (window._parqAlertHandle === alertHandle) {
            window.showAlert('', 'info');
            try { delete window._parqAlertHandle; } catch (_) { window._parqAlertHandle = undefined; }
          }
        }, 8000);
      }

      const pendingUrl = window._pendingIntroBookingUrl;
      const postAction = window._postConsultAction;
      window._pendingIntroBookingUrl = null;
      window._postConsultAction = null;

      if (typeof window.renderChecklist === 'function') {
        setTimeout(() => window.renderChecklist(), 300);
      }
      if (postAction === 'introBooking' && pendingUrl) {
        setTimeout(() => window.open(pendingUrl, '_blank'), 400);
      }
    } catch (err) {
      console.error('[Checklist] PAR-Q save error:', err);
      state.saving = false;
      state.error = err?.message || 'Save failed. Please try again.';
      render();
    }
  }

  // anchor: parq.bindStaticHandlers
  function bindStaticHandlers() {
    const ov = overlay();
    const mdl = modal();
    if (!ov || !mdl) return;

    const closeBtn = mdl.querySelector('.consultation-close');
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', () => {
        if (state.saving) return;
        showCloseConfirm();
      });
    }

    if (!ov.dataset.bound) {
      ov.dataset.bound = '1';
      ov.addEventListener('click', (event) => {
        if (event.target === ov) {
          if (state.saving) return;
          showCloseConfirm();
        }
      });
    }

    const layer = closeLayer();
    if (layer && !layer.dataset.bound) {
      layer.dataset.bound = '1';
      layer.addEventListener('click', (event) => {
        if (event.target === layer) {
          hideCloseConfirm();
        }
      });
    }

  }

  // anchor: parq.openModal
  function openParqModal(options) {
    if (typeof window.ensureParqModalShell === 'function') {
      window.ensureParqModalShell();
    }
    const ov = overlay();
    const mdl = modal();
    if (!ov || !mdl) {
      console.warn('[Checklist] PAR-Q modal elements missing');
      return;
    }
    parqEmbedConfig = null;
    introSlideConfig = null;
    if (options && options.embedTarget) {
      parqEmbedConfig = {
        host: options.embedTarget,
        onClose: typeof options.onClose === 'function' ? options.onClose : null
      };
    }
    if (options && options.introSlide && typeof options.introSlide === 'object') {
      introSlideConfig = options.introSlide;
    }

    loadExistingResponses();
    state.currentIndex = options && options.startAtIntro ? -1 : 0;
    state.error = '';
    state.saving = false;
    state.open = true;
    hideCloseConfirm();
    bindStaticHandlers();
    showOverlay();
    mdl.classList.add('consultation-modal--parq');
    render();
    if (parqEmbedConfig && parqEmbedConfig.host) {
      const host = parqEmbedConfig.host;
      host.innerHTML = '';
      host.appendChild(ov);
      ov.classList.add('consultation-modal-overlay--embedded');
    }
  }

  // anchor: parq.closeModal
  function closeParqModal() {
    if (state.saving) return;
    hideOverlay();
    hideCloseConfirm();
    state.open = false;
    const mdl = modal();
    if (mdl) {
      mdl.classList.remove('consultation-modal--parq');
    }
    if (parqEmbedConfig && parqEmbedConfig.host) {
      const host = parqEmbedConfig.host;
      const ov = overlay();
      if (ov) {
        ov.classList.remove('consultation-modal-overlay--embedded');
        document.body.appendChild(ov);
      }
    }
    if (typeof window.handleDropinSubflowComplete === 'function') {
      window.handleDropinSubflowComplete();
    }
    if (parqEmbedConfig && typeof parqEmbedConfig.onClose === 'function') {
      parqEmbedConfig.onClose();
    }
    parqEmbedConfig = null;
  }

  window.openParqModal = openParqModal;
  window.closeParqModal = closeParqModal;
})();
