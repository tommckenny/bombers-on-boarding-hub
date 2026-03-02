(function() {
  const FIELDS = window.CONSULT_FIELDS || {};
  const TAGS = window.TAGS || {};

  const EXPERIENCE_OPTIONS = [
    { value: 'brand_new', label: "I've never set foot in a gym or done any structured exercise" },
    { value: 'needs_support', label: "I've exercised before, but never had real guidance or consistency." },
    { value: 'structured_support', label: "I've trained with structure before and had some coaching or support." },
    { value: 'serious_return', label: "I've trained seriously before and I'm ready to get back into it." },
    { value: 'confident', label: "I'm confident, experienced, and actively training." }
  ];

  const VALUE_FIELD_CONFIG = [
    { key: 'feelStrong', label: 'Feeling strong, fit, and in control of my body *' },
    { key: 'lookGood', label: 'Looking good and liking what I see in the mirror *' },
    { key: 'consistency', label: 'Being more consistent – I’ve stopped and started too many times *' },
    { key: 'stayHealthy', label: 'Staying healthy, active, and independent as I get older *' },
    { key: 'feelBetter', label: 'Feeling better mentally - less stress, more energy *' },
    { key: 'familyExample', label: 'Setting a good example for my kids or family *' },
    { key: 'community', label: 'Being part of something - not doing this alone *' },
    { key: 'pushLimits', label: 'Pushing myself and seeing what I’m capable of *' }
  ].filter(item => !!FIELDS[item.key]);

  const NOTES_FIELD = FIELDS.challenges;
  const PT_HISTORY_FIELD = FIELDS.ptHistory;
  const PT_BUDGET_FIELD = FIELDS.ptBudget;
  const WHY_NOW_FIELD = FIELDS.whyReachOut;
  const AVAILABILITY_FIELD = FIELDS.AVAILABILITY_TIME;
  const PARENT_STATUS_FIELD = FIELDS.PARENT_STATUS;

  const RATING_LABELS = {
    1: 'Not important',
    2: 'Slightly important',
    3: '50/50',
    4: 'Important',
    5: 'Very important'
  };
  const COMMITMENT_LABELS = {
    1: "I'm just looking for info",
    2: 'I know I need to start, still unsure how',
    3: 'I feel ready to start something',
    4: "I'm keen to get going",
    5: "I'm all-in – let's go"
  };
  const AVAILABILITY_OPTIONS = [
    '2-3 days per week or less',
    '3-5 days per week',
    '4-6 days per week'
  ];
  const PARENT_OPTIONS = [
    'Yes - Young child /children',
    'Yes - Older children or grown up children',
    'No'
  ];

  const HAS_VALUES_STEP = VALUE_FIELD_CONFIG.length > 0;
  const STEP_FADE_DURATION = 180;
  const SAVED_FEEDBACK_DELAY_MS = 320;
  const SAVED_FEEDBACK_CLEAR_MS = 850;

  let pendingAdvanceTimer = null;
  let savedFeedbackTimer = null;

  function clearSavedBadges() {
    document.querySelectorAll('.consultation-saved-badge').forEach(el => el.remove());
  }

  function showSavedFeedback(targetButton) {
    if (!targetButton) return;
    if (savedFeedbackTimer) {
      clearTimeout(savedFeedbackTimer);
      savedFeedbackTimer = null;
    }
    clearSavedBadges();
    const badge = document.createElement('span');
    badge.className = 'consultation-saved-badge consultation-status--saved';
    badge.textContent = '✓ Saved';
    badge.setAttribute('aria-hidden', 'true');
    targetButton.appendChild(badge);
    savedFeedbackTimer = setTimeout(() => {
      badge.remove();
      savedFeedbackTimer = null;
    }, SAVED_FEEDBACK_CLEAR_MS);
  }

  function scheduleAdvance(action, feedbackTarget) {
    if (typeof action !== 'function') return;
    if (pendingAdvanceTimer) return;
    showSavedFeedback(feedbackTarget);
    pendingAdvanceTimer = setTimeout(() => {
      pendingAdvanceTimer = null;
      action();
    }, SAVED_FEEDBACK_DELAY_MS);
  }

  let flowState = {
    step: 0,
    valueIndex: 0,
    experience: '',
    valueSelections: {},
    commitment: '',
    notes: '',
    isPt: false,
    dob: '',
    weight: '',
    height: '',
    ptHistory: '',
    budget: '',
    whyNow: '',
    availability: '',
    parentStatus: ''
  };

  function getLeadTypeNormalized() {
    return (window._leadTypeNormalized || '').trim();
  }

  function shouldUsePtFlow() {
    const lead = getLeadTypeNormalized();
    if (!lead) return false;
    if (lead.includes('pt')) return true;
    return lead.includes('personal training');
  }

  function normalizeDateForInput(value) {
    if (!value) return '';
    const trimmed = String(value).trim();
    if (!trimmed) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  }

  function serialiseDate(value) {
    if (!value) return '';
    const trimmed = String(value).trim();
    if (!trimmed) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().slice(0, 10);
  }

  function getPtStepOrder() {
    const order = ['bio', 'experience'];
    if (AVAILABILITY_FIELD) {
      order.push('availability');
    }
    if (PARENT_STATUS_FIELD) {
      order.push('parent');
    }
    order.push('ptHistory', 'challenges', 'budget');
    if (HAS_VALUES_STEP && VALUE_FIELD_CONFIG.length > 0) {
      order.push('values');
    }
    order.push('final');
    return order;
  }

  function getGeneralStepOrder() {
    const order = ['experience'];
    if (AVAILABILITY_FIELD) {
      order.push('availability');
    }
    if (PARENT_STATUS_FIELD) {
      order.push('parent');
    }
    if (HAS_VALUES_STEP && VALUE_FIELD_CONFIG.length > 0) {
      order.push('values');
    }
    order.push('final');
    if (NOTES_FIELD) {
      order.push('pastChallenges');
    }
    return order;
  }

  function getActiveStepOrder() {
    return flowState.isPt ? getPtStepOrder() : getGeneralStepOrder();
  }

  function getCurrentStepKey() {
    const order = getActiveStepOrder();
    if (!order.length) return 'experience';
    const clamped = Math.min(Math.max(flowState.step || 0, 0), order.length - 1);
    return order[clamped] || order[0];
  }

  function ensureModal() {
    return document.getElementById('consultation-form-modal');
  }

  const CONSULTATION_HASH_KEY = 'modal';
  const CONSULTATION_HASH_VALUE = 'consultation';

  let consultationOpenedViaHash = false;
  let consultationReturnHash = '';

  function parseHashAsParams() {
    const raw = (window.location.hash || '').replace(/^#/, '');
    if (!raw) return null;
    if (!raw.includes('=') && !raw.includes('&')) return null;
    try { return new URLSearchParams(raw); } catch (_) { return null; }
  }

  function isConsultationHashActive() {
    const raw = (window.location.hash || '').trim();
    if (!raw || raw === '#') return false;
    if (raw.toLowerCase() === '#consultation') return true;
    const params = parseHashAsParams();
    if (!params) return false;
    const value = (params.get(CONSULTATION_HASH_KEY) || '').trim().toLowerCase();
    return value === CONSULTATION_HASH_VALUE;
  }

  function showConsultationFormUI() {
    const modal = ensureModal();
    if (!modal) return;
    resetConsultationFlowState();
    renderConsultationForm();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    const scroller = document.getElementById('consultation-form-content');
    if (scroller) scroller.scrollTop = 0;
  }

  function hideConsultationFormUI() {
    const modal = ensureModal();
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  async function requestCloseConsultationFormModal() {
    if (!ensureModal()) return;
    const message = 'Are you sure you want to close these questions? Any changes on this screen will be lost.';
    const shouldClose = typeof window.safeConfirm === 'function'
      ? await window.safeConfirm(message, { title: 'Close consultation?', confirmText: 'Close' })
      : window.confirm(message);
    if (shouldClose) {
      closeConsultationFormModal();
    }
  }

  function openConsultationFormModal() {
    const modal = ensureModal();
    if (!modal) return;

    if (!isConsultationHashActive()) {
      consultationOpenedViaHash = true;
      consultationReturnHash = window.location.hash || '';
      const existing = parseHashAsParams();
      const params = existing || new URLSearchParams();
      params.set(CONSULTATION_HASH_KEY, CONSULTATION_HASH_VALUE);
      window.location.hash = params.toString();
      return;
    }

    showConsultationFormUI();
  }

	  function closeConsultationFormModal() {
	    hideConsultationFormUI();

    if (consultationOpenedViaHash && typeof window.history?.back === 'function') {
      consultationOpenedViaHash = false;
      try {
        window.history.back();
        return;
      } catch (_) {}
    }

	    if (window.location.hash && window.location.hash.toLowerCase() === '#consultation') {
	      let nextHash = consultationReturnHash || '';
	      if (!nextHash) {
	        try {
	          nextHash = sessionStorage.getItem('consultation.returnHash') || '';
	          sessionStorage.removeItem('consultation.returnHash');
	        } catch (_) {}
	      }
	      if (!nextHash || nextHash.toLowerCase() === '#consultation') {
	        nextHash = (typeof window.getChecklistHubHashRoute === 'function')
	          ? `#${window.getChecklistHubHashRoute()}`
	          : '';
	      }
	      window.location.hash = nextHash ? nextHash.replace(/^#/, '') : '';
	      return;
	    }

    const params = parseHashAsParams();
    if (params && (params.get(CONSULTATION_HASH_KEY) || '').trim().toLowerCase() === CONSULTATION_HASH_VALUE) {
      params.delete(CONSULTATION_HASH_KEY);
      window.location.hash = params.toString();
    }
  }

  function syncConsultationFromHash() {
    const wantsOpen = isConsultationHashActive();
    const modal = ensureModal();
    if (!modal) return;
    const isOpen = modal.style.display !== 'none' && modal.style.display !== '';
    if (wantsOpen) {
      if (!isOpen) {
        if (typeof window.runAfterAppLoading === 'function') {
          window.runAfterAppLoading(showConsultationFormUI);
        } else {
          showConsultationFormUI();
        }
      }
    } else if (isOpen) {
      hideConsultationFormUI();
    }
  }

  function getLatestFields() {
    return window._latestContactFields || {};
  }

  function getFieldValue(fieldId) {
    if (!fieldId) return '';
    const latest = getLatestFields();
    const raw = latest[fieldId];
    return typeof raw === 'string' ? raw : (raw ? String(raw) : '');
  }

  function escapeText(value) {
    return window.escapeHtml ? window.escapeHtml(value) : value;
  }

  function resetConsultationFlowState() {
    const fieldValues = getLatestFields();
    const contact = window._latestContact || {};
    const ptFlow = shouldUsePtFlow();
    flowState = {
      step: 0,
      valueIndex: 0,
      experience: getFieldValue(FIELDS.experience) || '',
      valueSelections: {},
      commitment: FIELDS.commitment ? (getFieldValue(FIELDS.commitment) || '') : '',
      notes: NOTES_FIELD ? (getFieldValue(NOTES_FIELD) || '') : '',
      isPt: ptFlow,
      dob: normalizeDateForInput(contact.dateOfBirth || ''),
      weight: getFieldValue(FIELDS.currentWeight) || '',
      height: getFieldValue(FIELDS.height) || '',
      ptHistory: getFieldValue(PT_HISTORY_FIELD) || '',
      budget: getFieldValue(PT_BUDGET_FIELD) || '',
      whyNow: getFieldValue(WHY_NOW_FIELD) || '',
      availability: getFieldValue(AVAILABILITY_FIELD) || '',
      parentStatus: getFieldValue(PARENT_STATUS_FIELD) || ''
    };
    VALUE_FIELD_CONFIG.forEach(item => {
      const fieldId = FIELDS[item.key];
      if (!fieldId) return;
      const raw = fieldValues[fieldId];
      flowState.valueSelections[fieldId] = raw ? String(raw) : '';
    });
    ensureStepBounds();
  }

  function ensureStepBounds() {
    const order = getActiveStepOrder();
    if (!order.length) {
      flowState.step = 0;
      flowState.valueIndex = 0;
      return;
    }
    const max = order.length - 1;
    if (flowState.step < 0) flowState.step = 0;
    if (flowState.step > max) flowState.step = max;
    const stepKey = order[flowState.step] || order[0];
    if (stepKey === 'values' && HAS_VALUES_STEP && VALUE_FIELD_CONFIG.length > 0) {
      if (flowState.valueIndex < 0) flowState.valueIndex = 0;
      if (flowState.valueIndex >= VALUE_FIELD_CONFIG.length) {
        flowState.valueIndex = VALUE_FIELD_CONFIG.length - 1;
      }
    } else {
      flowState.valueIndex = 0;
    }
  }

  function getMaxStepIndex() {
    const order = getActiveStepOrder();
    return order.length ? order.length - 1 : 0;
  }

  function getTotalSteps() {
    const order = getActiveStepOrder();
    return order.length || 1;
  }

  function renderRatingButtons(selectedValue, context) {
    const labels = context === 'commitment' ? COMMITMENT_LABELS : RATING_LABELS;
    const scaleOrder = [5, 4, 3, 2, 1];
    return `
      <div class="consultation-scale-buttons" data-rating-context="${context}">
        ${scaleOrder.map(num => {
          const isSelected = String(selectedValue) === String(num) ? ' is-selected' : '';
          return `
            <button type="button" class="consultation-scale-button${isSelected}" data-rating-value="${num}">
              <span class="consultation-scale-number">${num}</span>
              <span class="consultation-scale-label">${escapeText(labels[num] || '')}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderExperienceStep() {
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">How would you describe your gym experience or knowledge?</p>
        <div class="consultation-choice-group" role="radiogroup">
          ${EXPERIENCE_OPTIONS.map(opt => `
            <button type="button" class="consultation-choice${flowState.experience === opt.label ? ' selected' : ''}" data-experience-option="${opt.value}" data-experience-label="${opt.label}">
              ${escapeText(opt.label)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderAvailabilityStep() {
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">How much time can you commit each week?</p>
        <div class="consultation-choice-group" role="radiogroup">
          ${AVAILABILITY_OPTIONS.map(label => `
            <button type="button" class="consultation-choice${flowState.availability === label ? ' selected' : ''}" data-availability-option="${label}">
              ${escapeText(label)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderParentStep() {
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">Are you a parent?</p>
        <div class="consultation-choice-group" role="radiogroup">
          ${PARENT_OPTIONS.map(label => `
            <button type="button" class="consultation-choice${flowState.parentStatus === label ? ' selected' : ''}" data-parent-option="${label}">
              ${escapeText(label)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderValuesStep() {
    if (!HAS_VALUES_STEP || VALUE_FIELD_CONFIG.length === 0) return '';
    const totalValues = VALUE_FIELD_CONFIG.length;
    const currentIndex = flowState.valueIndex + 1;
    const currentItem = VALUE_FIELD_CONFIG[flowState.valueIndex];
    const fieldId = FIELDS[currentItem.key];
    const selectedValue = flowState.valueSelections[fieldId] || '';
    return `
      <div class="consultation-step">
        <h4 class="consultation-block-title">Values &amp; Drivers</h4>
        <p class="consultation-step-intro">How important are each of the following statements to you?</p>
        <div class="consultation-value-question">
          <span class="consultation-value-label">
            <span class="consultation-value-prefix">${currentIndex}/${totalValues}</span>
            ${escapeText(currentItem.label)}
          </span>
          ${renderRatingButtons(selectedValue, 'values')}
        </div>
      </div>
    `;
  }

  function renderFinalStep() {
    const commitmentSection = FIELDS.commitment ? `
      <div class="consultation-step-block">
        <h4 class="consultation-block-title">Commitment &amp; motivation</h4>
        <p class="consultation-helper">How committed are you to making a positive change to your health and fitness?</p>
        ${renderRatingButtons(flowState.commitment || '', 'commitment')}
      </div>
    ` : '';
    const whyNowSection = (flowState.isPt && WHY_NOW_FIELD) ? `
      <div class="consultation-step-block">
        <h4 class="consultation-block-title">Why now?</h4>
        <p class="consultation-helper">What made you reach out today?</p>
        <textarea id="consultation-why-now" name="${WHY_NOW_FIELD}" rows="4" required>${escapeText(flowState.whyNow || '')}</textarea>
      </div>
    ` : '';
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">Almost done! Share what will help us support you best.</p>
        ${commitmentSection}
        ${whyNowSection}
      </div>
    `;
  }

  function renderPastChallengesStep() {
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">One last question so we can tailor your intro properly.</p>
        <div class="consultation-step-block">
          <h4 class="consultation-block-title">Your past challenges</h4>
          <p class="consultation-helper">What has held you back so far?</p>
          <textarea id="consultation-notes" name="${NOTES_FIELD}" rows="5" required placeholder="briefly tell us what challenges you've faced in the past with your health and fitness">${escapeText(flowState.notes || '')}</textarea>
        </div>
      </div>
    `;
  }

  function renderPtBioStep() {
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">Let’s cover the basics for your PT consult.</p>
        <div class="consultation-step-block">
          <label class="consultation-field-label" for="consultation-dob">Date of birth *</label>
          <input type="date" id="consultation-dob" value="${escapeText(flowState.dob || '')}" required>
        </div>
        <div class="consultation-step-grid">
          <div class="consultation-step-block">
            <label class="consultation-field-label" for="consultation-weight">Current weight (kg)</label>
            <input type="number" id="consultation-weight" inputmode="decimal" placeholder="Optional" value="${escapeText(flowState.weight || '')}">
          </div>
          <div class="consultation-step-block">
            <label class="consultation-field-label" for="consultation-height">Height (cm)</label>
            <input type="number" id="consultation-height" inputmode="decimal" placeholder="Optional" value="${escapeText(flowState.height || '')}">
          </div>
        </div>
      </div>
    `;
  }

  function renderPtHistoryStep() {
    const options = [
      { value: 'Yes', label: 'Yes' },
      { value: 'No', label: 'No' }
    ];
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">Have you worked with a personal trainer before?</p>
        <div class="consultation-choice-group" role="radiogroup">
          ${options.map(opt => `
            <button type="button" class="consultation-choice${flowState.ptHistory === opt.value ? ' selected' : ''}" data-pt-history="${opt.value}">
              ${escapeText(opt.label)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderPtChallengesStep() {
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">What challenges or roadblocks have you faced so far?</p>
        <div class="consultation-step-block">
          <textarea id="consultation-pt-challenges" rows="5" required>${escapeText(flowState.notes || '')}</textarea>
        </div>
      </div>
    `;
  }

  function renderPtBudgetStep() {
    return `
      <div class="consultation-step">
        <p class="consultation-step-intro">What budget have you set aside for coaching and training?</p>
        <div class="consultation-step-block">
          <input type="text" id="consultation-pt-budget" placeholder="e.g. £200 per month" value="${escapeText(flowState.budget || '')}" required>
        </div>
      </div>
    `;
  }

  function bindPtBioStep(wrapper) {
    const dobInput = wrapper.querySelector('#consultation-dob');
    if (dobInput) {
      dobInput.addEventListener('change', (event) => {
        flowState.dob = event.target.value || '';
      });
    }
    const weightInput = wrapper.querySelector('#consultation-weight');
    if (weightInput) {
      weightInput.addEventListener('input', (event) => {
        flowState.weight = event.target.value || '';
      });
    }
    const heightInput = wrapper.querySelector('#consultation-height');
    if (heightInput) {
      heightInput.addEventListener('input', (event) => {
        flowState.height = event.target.value || '';
      });
    }
  }

  function bindPtHistoryStep(wrapper) {
    const options = wrapper.querySelectorAll('[data-pt-history]');
    options.forEach((btn) => {
      btn.addEventListener('click', () => {
        const container = document.getElementById('consultation-step-container');
        if (container && container.dataset.animating === '1') return;
        flowState.ptHistory = btn.getAttribute('data-pt-history') || '';
        options.forEach(el => el.classList.toggle('selected', el === btn));
        scheduleAdvance(() => {
          goToStep(Math.min(flowState.step + 1, getMaxStepIndex()), { animate: true });
        }, btn);
      });
    });
  }

  function bindPtChallengesStep(wrapper) {
    const textarea = wrapper.querySelector('#consultation-pt-challenges');
    if (textarea) {
      textarea.addEventListener('input', (event) => {
        flowState.notes = event.target.value || '';
      });
    }
  }

  function bindPtBudgetStep(wrapper) {
    const budgetInput = wrapper.querySelector('#consultation-pt-budget');
    if (budgetInput) {
      budgetInput.addEventListener('input', (event) => {
        flowState.budget = event.target.value || '';
      });
    }
  }

  function bindExperienceStep(wrapper) {
    const options = wrapper.querySelectorAll('[data-experience-option]');
    options.forEach(btn => {
      btn.addEventListener('click', () => {
        const container = document.getElementById('consultation-step-container');
        if (container && container.dataset.animating === '1') return;
        const rawValue = btn.getAttribute('data-experience-label') || btn.getAttribute('data-experience-option') || '';
        flowState.experience = rawValue;
        options.forEach(el => el.classList.toggle('selected', el === btn));
        scheduleAdvance(() => {
          goToStep(Math.min(flowState.step + 1, getMaxStepIndex()), { animate: true });
        }, btn);
      });
    });
  }

  function bindAvailabilityStep(wrapper) {
    const options = wrapper.querySelectorAll('[data-availability-option]');
    options.forEach(btn => {
      btn.addEventListener('click', () => {
        const container = document.getElementById('consultation-step-container');
        if (container && container.dataset.animating === '1') return;
        const label = btn.getAttribute('data-availability-option') || '';
        flowState.availability = label;
        options.forEach(el => el.classList.toggle('selected', el === btn));
        scheduleAdvance(() => {
          goToStep(Math.min(flowState.step + 1, getMaxStepIndex()), { animate: true });
        }, btn);
      });
    });
  }

  function bindParentStep(wrapper) {
    const options = wrapper.querySelectorAll('[data-parent-option]');
    options.forEach(btn => {
      btn.addEventListener('click', () => {
        const container = document.getElementById('consultation-step-container');
        if (container && container.dataset.animating === '1') return;
        const label = btn.getAttribute('data-parent-option') || '';
        flowState.parentStatus = label;
        options.forEach(el => el.classList.toggle('selected', el === btn));
        scheduleAdvance(() => {
          goToStep(Math.min(flowState.step + 1, getMaxStepIndex()), { animate: true });
        }, btn);
      });
    });
  }

  function bindValuesStep(wrapper) {
    const container = wrapper.querySelector('[data-rating-context="values"]');
    if (!container) return;
    container.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-rating-value]');
      if (!btn) return;
      const outer = document.getElementById('consultation-step-container');
      if (outer && outer.dataset.animating === '1') return;
      const rating = btn.getAttribute('data-rating-value');
      const currentItem = VALUE_FIELD_CONFIG[flowState.valueIndex];
      const fieldId = FIELDS[currentItem.key];
      flowState.valueSelections[fieldId] = rating;
      container.querySelectorAll('[data-rating-value]').forEach(el => {
        el.classList.toggle('is-selected', el === btn);
      });
      scheduleAdvance(() => {
        advanceValueQuestion({ animate: true });
      }, btn);
    });
  }

  function bindFinalStep(wrapper) {
    if (FIELDS.commitment) {
      const container = wrapper.querySelector('[data-rating-context="commitment"]');
      if (container) {
        container.addEventListener('click', (event) => {
          const btn = event.target.closest('[data-rating-value]');
          if (!btn) return;
          const outer = document.getElementById('consultation-step-container');
          if (outer && outer.dataset.animating === '1') return;
          const rating = btn.getAttribute('data-rating-value');
          flowState.commitment = rating;
          container.querySelectorAll('[data-rating-value]').forEach(el => {
            el.classList.toggle('is-selected', el === btn);
          });
          if (!flowState.isPt && NOTES_FIELD) {
            scheduleAdvance(() => {
              goToStep(Math.min(flowState.step + 1, getMaxStepIndex()), { animate: true });
            }, btn);
          }
        });
      }
    }
    if (flowState.isPt && WHY_NOW_FIELD) {
      const whyNowInput = wrapper.querySelector('#consultation-why-now');
      if (whyNowInput) {
        whyNowInput.addEventListener('input', (event) => {
          flowState.whyNow = event.target.value || '';
        });
      }
    }
  }

  function bindPastChallengesStep(wrapper) {
    if (!NOTES_FIELD) return;
    const notes = wrapper.querySelector('#consultation-notes');
    if (notes) {
      notes.addEventListener('input', (event) => {
        flowState.notes = event.target.value || '';
      });
    }
  }

  function updateAndRender(changeFn, options = {}) {
    if (typeof changeFn !== 'function') return;
    const animate = !!options.animate;
    const container = document.getElementById('consultation-step-container');
    if (animate && container) {
      if (container.dataset.animating === '1') return;
      const currentWrapper = container.querySelector('.consultation-step-wrapper');
      if (currentWrapper) {
        container.dataset.animating = '1';
        container.style.pointerEvents = 'none';
        currentWrapper.classList.add('is-fading-out');
        setTimeout(() => {
          changeFn();
          ensureStepBounds();
          renderCurrentStep();
          const newWrapper = container.querySelector('.consultation-step-wrapper');
          if (newWrapper) {
            newWrapper.classList.add('is-fading-in');
            setTimeout(() => {
              newWrapper.classList.remove('is-fading-in');
              container.dataset.animating = '0';
              container.style.pointerEvents = '';
            }, STEP_FADE_DURATION);
          } else {
            container.dataset.animating = '0';
            container.style.pointerEvents = '';
          }
        }, STEP_FADE_DURATION);
        return;
      }
    }
    changeFn();
    ensureStepBounds();
    renderCurrentStep();
    if (container) {
      container.dataset.animating = '0';
      container.style.pointerEvents = '';
    }
  }

  function goToStep(step, options = {}) {
    updateAndRender(() => {
      flowState.step = step;
    }, options);
  }

  function goToPreviousStep() {
    const order = getActiveStepOrder();
    if (!order.length) return;
    const stepKey = getCurrentStepKey();
    if (stepKey === 'values' && HAS_VALUES_STEP && VALUE_FIELD_CONFIG.length > 0 && flowState.valueIndex > 0) {
      updateAndRender(() => {
        flowState.valueIndex -= 1;
      }, { animate: true });
      return;
    }
    if (flowState.step === 0) return;
    updateAndRender(() => {
      flowState.step = Math.max(flowState.step - 1, 0);
      const prevKey = getCurrentStepKey();
      if (prevKey === 'values' && HAS_VALUES_STEP && VALUE_FIELD_CONFIG.length > 0) {
        flowState.valueIndex = VALUE_FIELD_CONFIG.length - 1;
      }
    }, { animate: true });
  }

  function advanceValueQuestion(options = {}) {
    if (!HAS_VALUES_STEP || VALUE_FIELD_CONFIG.length === 0) {
      goToStep(getMaxStepIndex(), options);
      return;
    }
    updateAndRender(() => {
      if (flowState.valueIndex < VALUE_FIELD_CONFIG.length - 1) {
        flowState.valueIndex += 1;
      } else {
        flowState.step = Math.min(flowState.step + 1, getMaxStepIndex());
      }
    }, options);
  }

  function updateFooterForStep() {
    const form = document.getElementById('consultation-form');
    if (!form) return;
    const backBtn = form.querySelector('[data-action="consult-back"]');
    const submitBtn = form.querySelector('#consultation-submit');
    const nextBtn = form.querySelector('[data-action="consult-next"]');
    if (flowState.isPt) {
      const order = getPtStepOrder();
      const stepKey = order[flowState.step] || 'bio';
      if (backBtn) {
        backBtn.style.display = flowState.step > 0 ? 'inline-flex' : 'none';
      }
      if (nextBtn) {
        const requiresNext = ['bio', 'challenges', 'budget'].includes(stepKey);
        nextBtn.style.display = requiresNext ? 'inline-flex' : 'none';
        nextBtn.textContent = 'Continue';
      }
      if (submitBtn) {
        submitBtn.style.display = stepKey === 'final' ? 'inline-flex' : 'none';
      }
      return;
    }
    if (backBtn) {
      backBtn.style.display = flowState.step > 0 ? 'inline-flex' : 'none';
    }
    if (nextBtn) {
      nextBtn.style.display = 'none';
    }
    if (submitBtn) {
      submitBtn.style.display = flowState.step === getMaxStepIndex() ? 'inline-flex' : 'none';
    }
  }

  function handleConsultationNext() {
    if (!flowState.isPt) return;
    const statusEl = document.getElementById('consultation-form-status');
    const showError = (message) => {
      if (statusEl) {
        statusEl.style.color = '#c62828';
        statusEl.textContent = message;
      } else {
        alert(message);
      }
    };
    if (statusEl) {
      statusEl.style.color = 'var(--muted-text)';
      statusEl.textContent = '';
    }
    try {
      const stepKey = getCurrentStepKey();
      if (stepKey === 'bio') {
        const dob = serialiseDate(flowState.dob);
        if (!dob) {
          throw new Error('Please enter your date of birth.');
        }
        flowState.dob = dob;
      } else if (stepKey === 'challenges') {
        if (!flowState.notes || !flowState.notes.trim()) {
          throw new Error('Tell us about the challenges you have faced.');
        }
      } else if (stepKey === 'budget') {
        if (!flowState.budget || !flowState.budget.trim()) {
          throw new Error('Please let us know your expected budget.');
        }
      }
      goToStep(Math.min(flowState.step + 1, getMaxStepIndex()), { animate: true });
    } catch (err) {
      showError(err.message || 'Please complete this step before continuing.');
    }
  }

  function renderCurrentStep() {
    ensureStepBounds();
    const container = document.getElementById('consultation-step-container');
    if (!container) return;
    const stepKey = getCurrentStepKey();
    let html = '';
    switch (stepKey) {
      case 'bio':
        html = renderPtBioStep();
        break;
      case 'ptHistory':
        html = renderPtHistoryStep();
        break;
      case 'challenges':
        html = renderPtChallengesStep();
        break;
      case 'budget':
        html = renderPtBudgetStep();
        break;
      case 'availability':
        html = renderAvailabilityStep();
        break;
      case 'parent':
        html = renderParentStep();
        break;
      case 'values':
        html = renderValuesStep();
        break;
      case 'experience':
        html = renderExperienceStep();
        break;
      case 'pastChallenges':
        html = renderPastChallengesStep();
        break;
      default:
        html = renderFinalStep();
        break;
    }
    container.innerHTML = `<div class="consultation-step-wrapper">${html}</div>`;
    const wrapper = container.querySelector('.consultation-step-wrapper');
    if (!wrapper) return;
    if (!container.dataset.animating) {
      container.dataset.animating = '0';
    }
    if (stepKey === 'bio') bindPtBioStep(wrapper);
    else if (stepKey === 'ptHistory') bindPtHistoryStep(wrapper);
    else if (stepKey === 'challenges') bindPtChallengesStep(wrapper);
    else if (stepKey === 'budget') bindPtBudgetStep(wrapper);
    else if (stepKey === 'availability') bindAvailabilityStep(wrapper);
    else if (stepKey === 'parent') bindParentStep(wrapper);
    else if (stepKey === 'values') bindValuesStep(wrapper);
    else if (stepKey === 'experience') bindExperienceStep(wrapper);
    else if (stepKey === 'pastChallenges') bindPastChallengesStep(wrapper);
    else bindFinalStep(wrapper);
    updateFooterForStep();
  }

  function renderConsultationForm() {
    const container = document.getElementById('consultation-form-content');
    if (!container) return;
    if (!FIELDS.experience) {
      container.innerHTML = `<div style="padding:16px;color:#a8071a;">Consultation fields are not configured. Please contact support.</div>`;
      return;
    }

    container.innerHTML = `
      <form id="consultation-form" class="consultation-flow" novalidate>
        <div class="consultation-flow-header">
          <h2 style="margin:0;">Consultation questions</h2>
        </div>
        <div id="consultation-step-container"></div>
        <div class="consultation-flow-footer">
          <button type="button" class="btn btn--muted" data-action="consult-back">Back</button>
          <div class="consultation-flow-footer-actions">
            <span id="consultation-form-status" role="status" aria-live="polite" style="font-weight:500;"></span>
            <button type="button" class="btn" data-action="consult-next" style="display:none;">Continue</button>
            <button type="submit" class="btn" id="consultation-submit">Save responses</button>
            <button type="button" class="btn btn--muted" data-action="consult-close">Close</button>
          </div>
        </div>
      </form>
    `;

    const form = container.querySelector('#consultation-form');
    if (form) {
      form.addEventListener('submit', submitConsultationForm);
      const backBtn = form.querySelector('[data-action="consult-back"]');
      if (backBtn) backBtn.addEventListener('click', (event) => {
        event.preventDefault();
        goToPreviousStep();
      });
      const nextBtn = form.querySelector('[data-action="consult-next"]');
      if (nextBtn) {
        nextBtn.addEventListener('click', (event) => {
          event.preventDefault();
          handleConsultationNext();
        });
      }
      const closeBtn = form.querySelector('[data-action="consult-close"]');
      if (closeBtn) closeBtn.addEventListener('click', () => {
        closeConsultationFormModal();
      });
    }
    renderCurrentStep();
  }

  async function submitConsultationForm(event) {
    event.preventDefault();
    const form = event.target;
    if (!form || typeof window.updateFieldsBatch !== 'function') return;
    const statusEl = document.getElementById('consultation-form-status');
    const submitBtn = form.querySelector('#consultation-submit');
    const payload = {};
    const contactUpdates = {};
    const isPt = !!flowState.isPt;

    try {
      if (!window.contactId) {
        throw new Error('Missing contact details. Refresh and try again.');
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      if (statusEl) statusEl.textContent = '';

      if (!flowState.experience) {
        throw new Error('Please select your gym experience.');
      }
      payload[FIELDS.experience] = flowState.experience;

      if (AVAILABILITY_FIELD) {
        const availability = (flowState.availability || '').trim();
        if (!availability) {
          throw new Error('Please tell us how many days you can commit each week.');
        }
        payload[AVAILABILITY_FIELD] = availability;
      }

      if (PARENT_STATUS_FIELD) {
        const parentValue = (flowState.parentStatus || '').trim();
        if (!parentValue) {
          throw new Error('Please let us know your parent status.');
        }
        payload[PARENT_STATUS_FIELD] = parentValue;
      }

      for (const item of VALUE_FIELD_CONFIG) {
        const fieldId = FIELDS[item.key];
        if (!fieldId) continue;
        const selection = flowState.valueSelections[fieldId];
        if (!selection) {
          throw new Error('Please rate each value from 1 to 5.');
        }
        payload[fieldId] = selection;
      }

      if (FIELDS.commitment) {
        if (!flowState.commitment) {
          throw new Error('Please rate your commitment.');
        }
        payload[FIELDS.commitment] = flowState.commitment;
      }

      if (isPt) {
        const dobValue = serialiseDate(flowState.dob);
        if (!dobValue) {
          throw new Error('Please enter a valid date of birth.');
        }
        contactUpdates.dateOfBirth = dobValue;
        const weightValue = (flowState.weight || '').trim();
        if (weightValue && FIELDS.currentWeight) {
          payload[FIELDS.currentWeight] = weightValue;
        }
        const heightValue = (flowState.height || '').trim();
        if (heightValue && FIELDS.height) {
          payload[FIELDS.height] = heightValue;
        }
        if (PT_HISTORY_FIELD) {
          const historyValue = (flowState.ptHistory || '').trim();
          if (!historyValue) {
            throw new Error('Please let us know if you have worked with a PT before.');
          }
          payload[PT_HISTORY_FIELD] = historyValue;
        }
        if (PT_BUDGET_FIELD) {
          const budgetValue = (flowState.budget || '').trim();
          if (!budgetValue) {
            throw new Error('Please add your budget for training.');
          }
          payload[PT_BUDGET_FIELD] = budgetValue;
        }
        if (NOTES_FIELD) {
          const notesValue = (flowState.notes || '').trim();
          if (!notesValue) {
            throw new Error('Please tell us about the challenges you have faced.');
          }
          payload[NOTES_FIELD] = notesValue;
        }
        if (WHY_NOW_FIELD) {
          const whyNowValue = (flowState.whyNow || '').trim();
          if (!whyNowValue) {
            throw new Error('Please tell us what made you reach out today.');
          }
          payload[WHY_NOW_FIELD] = whyNowValue;
        }
      } else if (NOTES_FIELD) {
        const notesField = form.elements[NOTES_FIELD];
        const notesValue = (notesField?.value || '').trim();
        flowState.notes = notesValue;
        if (!notesValue) {
          throw new Error('Please tell us about your past challenges.');
        }
        payload[NOTES_FIELD] = notesValue;
      }

      if (isPt) {
        await window.updateContact(window.contactId, {
          contact: contactUpdates,
          customField: payload
        });
      } else {
        await window.updateFieldsBatch(window.contactId, payload);
      }
      if (window.addTagToContact && TAGS.CONSULT_DONE) {
        await window.addTagToContact(window.contactId, TAGS.CONSULT_DONE);
      }

      if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS) {
        window.forceChecklistFlag(window.OPPORTUNITY_LABELS.CONSULTATION_FORM, true);
      }

      if (window._latestContactFields) {
        Object.keys(payload).forEach(id => {
          window._latestContactFields[id] = payload[id];
        });
      }
      if (isPt && contactUpdates.dateOfBirth) {
        window._latestContact = window._latestContact || {};
        window._latestContact.dateOfBirth = contactUpdates.dateOfBirth;
      }
      if (window._latestContact) {
        const tags = Array.isArray(window._latestContact.tags) ? window._latestContact.tags : (window._latestContact.tags = []);
        if (TAGS.CONSULT_DONE && !tags.includes(TAGS.CONSULT_DONE)) {
          tags.push(TAGS.CONSULT_DONE);
        }
      }

      if (statusEl) {
        statusEl.style.color = 'var(--text-main)';
        statusEl.textContent = 'Responses saved';
      }
      const scheduleChecklistRefresh = () => {
        if (typeof window.renderChecklist !== 'function') return;
        const delays = [0, 1200, 4000];
        delays.forEach((delay) => {
          setTimeout(() => {
            try { window.renderChecklist(); } catch (_) {}
          }, delay);
        });
      };

      setTimeout(() => {
        closeConsultationFormModal();
        scheduleChecklistRefresh();
      }, 300);
    } catch (err) {
      console.error('[Consultation] save error', err);
      if (statusEl) {
        statusEl.style.color = '#c62828';
        statusEl.textContent = err.message || 'Unable to save responses right now.';
      } else {
        alert(err.message || 'Unable to save responses.');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save responses';
      }
    }
  }

  function handleConsultationLaunch(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (event && typeof event.stopPropagation === 'function') event.stopPropagation();
    openConsultationFormModal();
  }

  window.handleConsultationLaunch = handleConsultationLaunch;
  window.openConsultationFormModal = openConsultationFormModal;
  window.closeConsultationFormModal = closeConsultationFormModal;
  window.requestCloseConsultationFormModal = requestCloseConsultationFormModal;
  window.VALUE_FIELD_CONFIG = VALUE_FIELD_CONFIG;

  window.addEventListener('hashchange', syncConsultationFromHash);
  syncConsultationFromHash();
})();
