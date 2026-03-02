// Terms & Conditions Modal System
// Handles multi-step T&C modals with signature capture

let activeTermsState = null;
let termsEmbedConfig = null;
let termsOpenedViaHash = false;
let termsReturnHash = '';
let termsClosingFromHash = false;

function isTermsHashActive() {
  const raw = (window.location.hash || '').trim().toLowerCase();
  return raw === '#terms';
}

function setTermsHashActive() {
  if (isTermsHashActive()) return;
  termsOpenedViaHash = true;
  termsReturnHash = window.location.hash || '';
  if (typeof window.setChecklistHashRoute === 'function') {
    window.setChecklistHashRoute('terms');
  } else {
    window.location.hash = 'terms';
  }
}

// anchor: terms.openTermsModal
function openTermsModal(termsKey, contactId, onComplete, options) {
  const termsData = window.TERMS_LIBRARY[termsKey];
  if (!termsData) {
    console.error('[openTermsModal] Unknown terms key:', termsKey);
    return;
  }
  if (onComplete && typeof onComplete === 'object' && !options) {
    options = onComplete;
    onComplete = null;
  }

  activeTermsState = {
    termsKey,
    contactId,
    onComplete,
    termsData,
    currentStep: 0,
    signaturePad: null,
    needsSignature: !!termsData.signatureFieldId,
    ackAnswers: {},
    sectionConfirmations: {}
  };

  const existingFields = window._latestContactFields || {};
  const acknowledgements = Array.isArray(termsData.acknowledgements) ? termsData.acknowledgements : [];
  if (acknowledgements.length) {
    const ackAnswers = {};
    acknowledgements.forEach(ack => {
      if (!ack || !ack.fieldId) return;
      const raw = existingFields[ack.fieldId];
      if (Array.isArray(raw)) {
        ackAnswers[ack.fieldId] = raw[0] ? String(raw[0]).trim() : '';
      } else if (raw != null) {
        ackAnswers[ack.fieldId] = String(raw).trim();
      }
    });
    activeTermsState.ackAnswers = ackAnswers;
  }

  renderTermsStep();
  termsEmbedConfig = null;
  if (options && options.embedTarget) {
    termsEmbedConfig = {
      host: options.embedTarget,
      onClose: typeof options.onClose === 'function' ? options.onClose : null
    };
  }

  const overlay = document.getElementById('terms-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    setTermsHashActive();
    if (termsEmbedConfig && termsEmbedConfig.host) {
      const host = termsEmbedConfig.host;
      host.innerHTML = '';
      host.appendChild(overlay);
      overlay.classList.add('terms-modal-overlay--embedded');
    } else {
      document.body.style.overflow = 'hidden';
    }
  } else {
    document.body.style.overflow = 'hidden';
  }
}

function resizeSignatureCanvas(canvas) {
  if (!canvas) return;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const displayWidth = canvas.offsetWidth || canvas.width || 460;
  const displayHeight = canvas.offsetHeight || canvas.height || 150;
  canvas.width = displayWidth * ratio;
  canvas.height = displayHeight * ratio;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(ratio, ratio);
  }
}

function renderTermsStep() {
  if (!activeTermsState) return;

  const { termsData, currentStep, needsSignature } = activeTermsState;
  const hasAcknowledgements = Array.isArray(termsData.acknowledgements) && termsData.acknowledgements.length > 0;
  const totalSteps = termsData.sections.length + (hasAcknowledgements ? 1 : 0) + (needsSignature ? 1 : 0);

  const titleEl = document.querySelector('.terms-modal-title');
  const progressEl = document.querySelector('.terms-modal-progress');
  const bodyEl = document.querySelector('.terms-modal-body');
  const errorEl = document.querySelector('.terms-modal-error');
  const footerEl = document.querySelector('.terms-modal-footer');

  if (titleEl) titleEl.textContent = termsData.title;
  if (progressEl) progressEl.textContent = `Step ${currentStep + 1} of ${totalSteps}`;
  if (errorEl) errorEl.style.display = 'none';

  if (currentStep < termsData.sections.length) {
    // Content step
    const section = termsData.sections[currentStep];
    const hasConfirmations = Array.isArray(section.confirmations) && section.confirmations.length > 0;
    const confirmationMode = section.confirmationMode || 'list';
    let html = `<h3 style="margin-top:0;">${section.heading}</h3>`;
    if (confirmationMode === 'bullets' && hasConfirmations) {
      html += buildSectionConfirmations(section, currentStep, 'bullets');
    } else {
      html += buildSectionBulletList(section);
      if (hasConfirmations) {
        html += buildSectionConfirmations(section, currentStep, 'inline');
      }
    }

    if (bodyEl) bodyEl.innerHTML = html;

    if (hasConfirmations) {
      bindSectionConfirmationHandlers(currentStep);
    }

    if (footerEl) {
      const isLastContent = currentStep === termsData.sections.length - 1;
      if (isLastContent && !needsSignature) {
        footerEl.innerHTML = `
          ${currentStep > 0 ? '<button type="button" class="btn btn--muted" data-terms-action="back">Back</button>' : ''}
          <button type="button" class="btn btn--primary" data-terms-action="finish">Finish</button>
        `;
      } else {
        footerEl.innerHTML = `
          ${currentStep > 0 ? '<button type="button" class="btn btn--muted" data-terms-action="back">Back</button>' : ''}
          <button type="button" class="btn btn--primary" data-terms-action="next">Next</button>
        `;
      }
    }
  } else if (hasAcknowledgements && currentStep === termsData.sections.length) {
    const acknowledgements = termsData.acknowledgements || [];
    const ackAnswers = activeTermsState.ackAnswers || {};
    if (bodyEl) {
      const ackHtml = acknowledgements.map((ack, index) => {
        const fieldId = ack.fieldId || `ack-${index}`;
        const value = typeof ack.value === 'string' ? ack.value : 'Yes';
        const checked = ackAnswers[fieldId] === value ? 'checked' : '';
        return `
          <label class="terms-acknowledgement">
            <input type="checkbox"
              class="terms-ack-checkbox"
              data-field-id="${window.escapeHtml ? window.escapeHtml(fieldId) : fieldId}"
              data-value="${window.escapeHtml ? window.escapeHtml(value) : value}"
              ${checked}>
            <span>${window.escapeHtml ? window.escapeHtml(ack.text || '') : (ack.text || '')}</span>
          </label>
        `;
      }).join('');
      bodyEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:1rem;">
          <p style="margin:0;color:#2f3c55;line-height:1.7;">Please confirm you understand the following before proceeding:</p>
          <div class="terms-ack-list">
            ${ackHtml}
          </div>
        </div>
      `;
    }
    if (footerEl) {
      footerEl.innerHTML = `
        <button type="button" class="btn btn--muted" data-terms-action="back">Back</button>
        <button type="button" class="btn btn--primary" data-terms-action="next">Next</button>
      `;
    }
  } else {
    // Signature step
    if (bodyEl) {
      bodyEl.innerHTML = `
        <p style="margin-bottom:1em;font-weight:500;">Please sign below to confirm you have read and agree to these terms:</p>
        <canvas class="signature-canvas" width="460" height="150"></canvas>
        <button type="button" class="btn btn--muted" style="margin-top:0.8em;" data-terms-action="clear">Clear</button>
      `;

      const canvas = bodyEl.querySelector('.signature-canvas');
      if (canvas && typeof SignaturePad !== 'undefined') {
        resizeSignatureCanvas(canvas);
        activeTermsState.signaturePad = new SignaturePad(canvas, {
          backgroundColor: 'rgb(255, 255, 255)',
          penColor: 'rgb(0, 0, 0)'
        });
      }
    }

    if (footerEl) {
      footerEl.innerHTML = `
        <button type="button" class="btn btn--muted" data-terms-action="back">Back</button>
        <button type="button" class="btn btn--primary" data-terms-action="submit">Submit</button>
      `;
    }
  }
}

function buildSectionBulletList(section) {
  const bullets = Array.isArray(section?.bullets) ? section.bullets : [];
  if (!bullets.length) return '';
  const bulletHtml = bullets.map(bullet => `<li style="margin-bottom:0.5em;">${window.escapeHtml ? window.escapeHtml(bullet) : bullet}</li>`).join('');
  return `<ul style="line-height:1.8;">${bulletHtml}</ul>`;
}

function buildSectionConfirmations(section, stepIndex, mode) {
  if (!section || !Array.isArray(section.confirmations) || !section.confirmations.length) return '';
  const store = activeTermsState?.sectionConfirmations || {};
  const bucket = store[stepIndex] || {};
  const useBullets = mode === 'bullets';
  const labels = useBullets ? (Array.isArray(section.bullets) ? section.bullets : []) : [];
  const items = section.confirmations.map((conf, idx) => {
    const confirmId = conf.id || `confirm-${stepIndex}-${idx}`;
    const entry = bucket[confirmId];
    const checked = entry ? !!entry.checked : false;
    const fieldIdAttr = conf.fieldId ? ` data-field-id="${conf.fieldId}"` : '';
    const safeValue = conf.value || 'Yes';
    const valueAttr = ` data-confirm-value="${window.escapeHtml ? window.escapeHtml(safeValue) : safeValue}"`;
    const labelText = useBullets
      ? (labels[idx] || conf.text || '')
      : (conf.text || '') || labels[idx] || '';
    const checkboxHtml = `<input type="checkbox" class="terms-confirmation-checkbox" data-section-index="${stepIndex}" data-confirm-id="${confirmId}"${fieldIdAttr}${valueAttr} ${checked ? 'checked' : ''} style="width:1.2rem;height:1.2rem;margin-top:0.15rem;accent-color:#1f3c88;">`;
    const labelInner = `<label class="terms-confirmation" style="display:flex;gap:0.65rem;align-items:flex-start;font-size:0.96rem;color:#2f3c55;">${checkboxHtml}<span>${window.escapeHtml ? window.escapeHtml(labelText) : labelText}</span></label>`;
    return `<li class="terms-inline-confirmation" style="margin-bottom:0.75rem;">${labelInner}</li>`;
  }).join('');

  if (useBullets) {
    return `
      <div class="terms-confirmation-block">
        <p style="margin:1rem 0 0.4rem;color:#2f3c55;font-weight:500;">Tick each to confirm you understand:</p>
        <ul class="terms-inline-confirmation-list" style="list-style:none;padding-left:0;margin:0;display:flex;flex-direction:column;gap:0.5rem;">
          ${items}
        </ul>
      </div>
    `;
  }

  if (mode === 'inline') {
    return `
      <ul class="terms-inline-confirmation-list" style="list-style:none;padding-left:0;margin:0.4rem 0 0;display:flex;flex-direction:column;gap:0.5rem;">
        ${items}
      </ul>
    `;
  }

  return `
    <div class="terms-confirmation-block">
      <p style="margin:1rem 0 0.4rem;color:#2f3c55;font-weight:500;">Please confirm each statement to continue:</p>
      <div class="terms-confirmation-list">${items}</div>
    </div>
  `;
}

function bindSectionConfirmationHandlers(stepIndex) {
  const bodyEl = document.querySelector('.terms-modal-body');
  if (!bodyEl) return;
  const checkboxes = bodyEl.querySelectorAll(`.terms-confirmation-checkbox[data-section-index="${stepIndex}"]`);
  checkboxes.forEach(cb => {
    if (cb.dataset.bound === '1') return;
    cb.dataset.bound = '1';
    cb.addEventListener('change', () => {
      updateSectionConfirmationState(stepIndex, cb);
      const errorEl = document.querySelector('.terms-modal-error');
      if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
      }
    });
  });
}

function updateSectionConfirmationState(stepIndex, checkbox) {
  if (!activeTermsState || !checkbox) return;
  activeTermsState.sectionConfirmations = activeTermsState.sectionConfirmations || {};
  const bucket = activeTermsState.sectionConfirmations[stepIndex] || {};
  const confirmId = checkbox.getAttribute('data-confirm-id');
  if (!confirmId) return;
  const fieldId = checkbox.getAttribute('data-field-id') || '';
  const value = checkbox.getAttribute('data-confirm-value') || 'Yes';
  bucket[confirmId] = {
    checked: checkbox.checked,
    fieldId,
    value
  };
  activeTermsState.sectionConfirmations[stepIndex] = bucket;
}

function captureSectionConfirmations(stepIndex) {
  if (!activeTermsState) return;
  const section = activeTermsState.termsData?.sections?.[stepIndex];
  if (!section || !Array.isArray(section.confirmations) || !section.confirmations.length) return;
  const bodyEl = document.querySelector('.terms-modal-body');
  if (!bodyEl) return;
  const checkboxes = bodyEl.querySelectorAll(`.terms-confirmation-checkbox[data-section-index="${stepIndex}"]`);
  checkboxes.forEach(cb => updateSectionConfirmationState(stepIndex, cb));
}

function validateSectionConfirmations(stepIndex) {
  if (!activeTermsState) return true;
  const section = activeTermsState.termsData?.sections?.[stepIndex];
  if (!section || !Array.isArray(section.confirmations) || !section.confirmations.length) return true;
  captureSectionConfirmations(stepIndex);
  const bucket = activeTermsState.sectionConfirmations?.[stepIndex] || {};
  const unmet = section.confirmations.some((conf, idx) => {
    const confirmId = conf.id || `confirm-${stepIndex}-${idx}`;
    return !bucket[confirmId] || !bucket[confirmId].checked;
  });
  if (!unmet) return true;
  const errorEl = document.querySelector('.terms-modal-error');
  if (errorEl) {
    errorEl.textContent = 'Please tick each confirmation before continuing.';
    errorEl.style.display = 'block';
  }
  return false;
}

function closeTermsModal() {
  const overlay = document.getElementById('terms-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    if (termsEmbedConfig && termsEmbedConfig.host) {
      overlay.classList.remove('terms-modal-overlay--embedded');
      document.body.appendChild(overlay);
    } else {
      document.body.style.overflow = '';
    }
  } else {
    document.body.style.overflow = '';
  }
  activeTermsState = null;
  if (typeof window.handleDropinSubflowComplete === 'function') {
    window.handleDropinSubflowComplete();
  }
  if (termsEmbedConfig && typeof termsEmbedConfig.onClose === 'function') {
    termsEmbedConfig.onClose();
  }
  termsEmbedConfig = null;

  try {
    if (!termsClosingFromHash && isTermsHashActive()) {
      const fallback = typeof window.getChecklistHubHashRoute === 'function'
        ? window.getChecklistHubHashRoute()
        : '';
      const desired = (termsReturnHash && termsReturnHash !== '#terms')
        ? termsReturnHash.replace(/^#/, '')
        : fallback;
      if (typeof window.setChecklistHashRoute === 'function') {
        window.setChecklistHashRoute(desired);
      } else {
        window.location.hash = desired || '';
      }
    }
  } catch (_) {}
  termsOpenedViaHash = false;
  termsReturnHash = '';
}

function syncTermsFromHash() {
  const overlay = document.getElementById('terms-modal-overlay');
  if (!overlay) return;
  const wantsOpen = isTermsHashActive();
  const isOpen = overlay.style.display === 'flex';
  if (!wantsOpen && isOpen) {
    termsClosingFromHash = true;
    try {
      closeTermsModal();
    } finally {
      termsClosingFromHash = false;
    }
  }
}

// Global functions for inline handlers
window.termsStepNext = function() {
  if (!activeTermsState) return;
  const { termsData, currentStep } = activeTermsState;
  if (currentStep < termsData.sections.length) {
    if (!validateSectionConfirmations(currentStep)) {
      return;
    }
  }
  const hasAcknowledgements = Array.isArray(termsData.acknowledgements) && termsData.acknowledgements.length > 0;
  const ackStepIndex = termsData.sections.length;
  if (hasAcknowledgements && currentStep === ackStepIndex) {
    if (!validateAcknowledgements()) {
      return;
    }
  }
  activeTermsState.currentStep++;
  renderTermsStep();
};

window.termsStepBack = function() {
  if (!activeTermsState) return;
  if (activeTermsState.currentStep > 0) {
    activeTermsState.currentStep--;
    renderTermsStep();
  }
};

window.termsClearSignature = function() {
  if (activeTermsState && activeTermsState.signaturePad) {
    activeTermsState.signaturePad.clear();
  }
};

function syncAcknowledgementStateFromDom() {
  if (!activeTermsState) return;
  const ackAnswers = activeTermsState.ackAnswers || {};
  const inputs = document.querySelectorAll('.terms-ack-checkbox');
  inputs.forEach(input => {
    const fieldId = input.dataset.fieldId;
    const value = input.dataset.value || 'Yes';
    if (!fieldId) return;
    if (input.checked) {
      ackAnswers[fieldId] = value;
    } else {
      delete ackAnswers[fieldId];
    }
  });
  activeTermsState.ackAnswers = ackAnswers;
}

function validateAcknowledgements() {
  if (!activeTermsState) return true;
  const errorEl = document.querySelector('.terms-modal-error');
  const { termsData } = activeTermsState;
  const acknowledgements = Array.isArray(termsData.acknowledgements) ? termsData.acknowledgements : [];
  if (!acknowledgements.length) return true;
  syncAcknowledgementStateFromDom();
  const ackAnswers = activeTermsState.ackAnswers || {};
  const missing = acknowledgements.filter(ack => !ackAnswers[ack.fieldId]);
  if (missing.length) {
    if (errorEl) {
      errorEl.textContent = 'Please confirm each statement before continuing.';
      errorEl.style.display = 'block';
    }
    return false;
  }
  if (errorEl) {
    errorEl.style.display = 'none';
  }
  return true;
}

async function submitTerms() {
  if (!activeTermsState) return;
  if (activeTermsState.submitting) return;

  activeTermsState.submitting = true;
  const footerEl = document.querySelector('.terms-modal-footer');
  const submitBtn = footerEl?.querySelector('[data-terms-action="submit"],[data-terms-action="finish"]');
  const priorSubmitText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
  }

  const errorEl = document.querySelector('.terms-modal-error');
  const { needsSignature } = activeTermsState;
  if (needsSignature && (!activeTermsState.signaturePad || activeTermsState.signaturePad.isEmpty())) {
    if (errorEl) {
      errorEl.textContent = 'Please provide a signature';
      errorEl.style.display = 'block';
    }
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = priorSubmitText;
    }
    activeTermsState.submitting = false;
    return;
  }

  try {
    const { contactId, termsKey, termsData, onComplete } = activeTermsState;
    let signatureData = null;
    if (needsSignature && activeTermsState.signaturePad && !activeTermsState.signaturePad.isEmpty()) {
      signatureData = activeTermsState.signaturePad.toDataURL();
    }

    const fieldUpdates = [];
    if (Array.isArray(termsData.acknowledgements) && termsData.acknowledgements.length) {
      const ackAnswers = activeTermsState.ackAnswers || {};
      termsData.acknowledgements.forEach(ack => {
        if (!ack || !ack.fieldId) return;
        const val = ackAnswers[ack.fieldId];
        if (val) {
          fieldUpdates.push({ id: ack.fieldId, value: val });
        }
      });
    }

    if (activeTermsState.sectionConfirmations) {
      const seenFields = new Set();
      Object.values(activeTermsState.sectionConfirmations).forEach(bucket => {
        if (!bucket) return;
        Object.values(bucket).forEach(entry => {
          if (!entry || !entry.checked || !entry.fieldId) return;
          const key = `${entry.fieldId}`;
          if (seenFields.has(key)) return;
          seenFields.add(key);
          fieldUpdates.push({ id: entry.fieldId, value: entry.value || 'Yes' });
        });
      });
    }
    if (needsSignature && termsData.signatureFieldId && signatureData) {
      fieldUpdates.push({ id: termsData.signatureFieldId, value: signatureData });
    }
    if (fieldUpdates.length) {
      await window.updateFieldsBatch(contactId, fieldUpdates);
    }

    const TAG_ALLOWLIST = ['informed consent signed', 'dd mandate signed'];
    if (termsKey && TAG_ALLOWLIST.includes(termsKey.toLowerCase()) && typeof window.addTagToContact === 'function') {
      await window.addTagToContact(contactId, termsKey);
    }
    syncChecklistAfterTerms(termsKey);

    closeTermsModal();
    window.burst();

    if (typeof onComplete === 'function') {
      onComplete();
    } else {
      setTimeout(() => window.location.reload(), 1000);
    }
  } catch (err) {
    console.error('[termsSubmitSignature] Error:', err);
    if (errorEl) {
      errorEl.textContent = 'Error saving signature: ' + err.message;
      errorEl.style.display = 'block';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = priorSubmitText;
    }
    if (activeTermsState) {
      activeTermsState.submitting = false;
    }
  }
}


window.termsSubmitSignature = submitTerms;
window.termsFinish = submitTerms;

// Bind click handlers (avoid inline onclick, which can be blocked by CSP)
document.addEventListener('click', (event) => {
  const target = event.target?.closest?.('[data-terms-action]');
  if (!target) return;
  const overlay = document.getElementById('terms-modal-overlay');
  if (!overlay || !overlay.contains(target)) return;

  event.preventDefault();
  event.stopPropagation();

  const action = target.getAttribute('data-terms-action') || '';
  if (action === 'back') window.termsStepBack?.();
  else if (action === 'next') window.termsStepNext?.();
  else if (action === 'finish') window.termsFinish?.();
  else if (action === 'submit') window.termsSubmitSignature?.();
  else if (action === 'clear') window.termsClearSignature?.();
});

// Initialize close handlers
document.addEventListener('DOMContentLoaded', function() {
  const termsCloseBtn = document.querySelector('.terms-close');
  if (termsCloseBtn) {
    termsCloseBtn.addEventListener('click', closeTermsModal);
  }

  const termsOverlay = document.getElementById('terms-modal-overlay');
  if (termsOverlay) {
    termsOverlay.addEventListener('click', function(e) {
      if (e.target === termsOverlay) {
        closeTermsModal();
      }
    });
  }
});

window.addEventListener('resize', () => {
  if (!activeTermsState || !activeTermsState.signaturePad) return;
  const canvas = document.querySelector('.signature-canvas');
  if (!canvas) return;
  const data = activeTermsState.signaturePad.toData();
  resizeSignatureCanvas(canvas);
  activeTermsState.signaturePad.clear();
  if (data && data.length) {
    try {
      activeTermsState.signaturePad.fromData(data);
    } catch (_) {
      /* ignore restore errors */
    }
  }
});

function syncChecklistAfterTerms(termsKey) {
  if (!termsKey || typeof window.forceChecklistFlag !== 'function' || !window.OPPORTUNITY_LABELS) return;
  const key = termsKey.toLowerCase();
  const consentKey = (window.TAGS?.INFORMED_CONSENT || 'informed consent signed').toLowerCase();
  const map = {
    'class t&cs signed': [
      window.OPPORTUNITY_LABELS.GYM_TCS,
      window.OPPORTUNITY_LABELS.TRIAL_TCS
    ],
    'trial t&cs signed': [window.OPPORTUNITY_LABELS.TRIAL_TCS],
    'card on file agreement': [window.OPPORTUNITY_LABELS.CARD_ON_FILE]
  };
  map[consentKey] = [window.OPPORTUNITY_LABELS.INFORMED_CONSENT];
  const labels = map[key] || [];
  labels.filter(Boolean).forEach(label => {
    window.forceChecklistFlag(label, true);
  });
}

// Export functions
window.openTermsModal = openTermsModal;
window.closeTermsModal = closeTermsModal;
window.addEventListener('hashchange', syncTermsFromHash);
syncTermsFromHash();
