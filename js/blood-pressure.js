// anchor: bp.handlers-start (BP input/validation/save)
// Blood Pressure Functions
// Handles BP input, validation, and health feedback

// Get health feedback based on BP reading
// anchor: bp.getBPFeedback
function getBPFeedback(bp) {
  if (!bp || typeof bp !== 'string') return null;
  const parts = bp.split(/[^\d]+/).map(Number).filter(x => x);
  if (parts.length < 2) return null;

  const sys = parts[0];
  const dia = parts[1];

  if (sys < 90 || dia < 60) {
    return {
      category: 'low',
      color: '#fef3c7',
      text: `Your blood pressure (${bp}) is lower than the normal range. Low blood pressure is generally less concerning, but if you experience dizziness or fatigue, please consult your GP.`
    };
  }

  if (sys >= 200 || dia >= 110) {
    return {
      category: 'critical',
      color: '#f87171',
      text: `Your blood pressure (${bp}) is extremely high. Don't start any new activity - please speak to your doctor or nurse as soon as possible.`
    };
  }

  if (sys >= 180 || dia >= 100) {
    return {
      category: 'very_high',
      color: '#fecaca',
      text: `Your blood pressure (${bp}) is very high. Speak to your doctor or nurse before starting any new exercise.`
    };
  }

  if (sys >= 140 || dia >= 90) {
    return {
      category: 'high',
      color: '#fee2e2',
      text: `Your blood pressure (${bp}) is high, but it should be safe to be more active to help lower it. Keep us informed if you've spoken with your doctor.`
    };
  }

  return {
    category: 'normal',
    color: '#d1fae5',
    text: `It is safe to be more active, and it will help to keep your blood pressure (${bp}) in the healthy range.`
  };
}

function applyBPFeedbackStyles(feedbackEl, feedback) {
  if (!feedbackEl) return;
  const category = feedback && feedback.category ? String(feedback.category).toLowerCase() : '';
  const variant = (function(c) {
    if (!c) return '';
    if (c === 'normal') return 'good';
    if (c === 'high' || c === 'low') return 'warn';
    if (c === 'very_high' || c === 'critical') return 'bad';
    if (c === 'skipped') return 'info';
    return 'warn';
  })(category);

  feedbackEl.classList.remove('bp-feedback--good', 'bp-feedback--warn', 'bp-feedback--bad', 'bp-feedback--info');
  if (variant) feedbackEl.classList.add(`bp-feedback--${variant}`);

  feedbackEl.style.background = '';
  feedbackEl.style.color = '';
  feedbackEl.style.borderColor = '';
}

// Handle BP input formatting (auto-add slash)
function bpInputHandler(input) {
  let digits = input.value.replace(/[^\d]/g, '');
  if (digits.length > 6) {
    digits = digits.slice(0, 6);
  }
  let formatted = digits;
  if (digits.length >= 4) {
    const diastolicLength = digits.length >= 6 ? 3 : 2;
    const systolic = digits.slice(0, digits.length - diastolicLength);
    const diastolic = digits.slice(-diastolicLength);
    formatted = `${systolic}/${diastolic}`;
  }
  input.value = formatted;
}

// Submit BP reading
// anchor: bp.bpSubmit
async function bpSubmit(contactId, input, feedbackEl) {
  const bp = input.value.trim();
  if (!bp.match(/^\d{2,3}\/\d{2,3}$/)) {
    alert('Please enter blood pressure in format: 120/80');
    return;
  }

  try {
    await window.updateFieldsBatch(contactId, { [window.FIELDS.BP_RESULT]: bp });

    const feedback = getBPFeedback(bp) || {
      category: 'normal',
      color: '#d1fae5',
      text: `Blood pressure recorded (${bp}).`
    };
    const feedbackWithValue = { ...feedback, value: bp };


    if (feedbackEl) {
      feedbackEl.style.display = 'block';
      feedbackEl.textContent = feedbackWithValue.text;
      applyBPFeedbackStyles(feedbackEl, feedbackWithValue);
    }

    window._bpFeedbackFlash = feedbackWithValue;
    window._bpShowNextStep = true;
    window._bpFeedbackContactId = contactId;
    window._bpPreventAutoAdvance = true;

    if (window._latestContactFields && window.FIELDS?.BP_RESULT) {
      window._latestContactFields[window.FIELDS.BP_RESULT] = bp;
    }
    window._bpLocalValues = window._bpLocalValues || {};
    window._bpLocalValues[contactId] = bp;

    if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS) {
      window.forceChecklistFlag(window.OPPORTUNITY_LABELS.BP_CHECK, true);
    }

    window.burst();

    const nextBtn = document.getElementById('bp-next-step');
    if (nextBtn) {
      nextBtn.style.display = 'inline-flex';
    }

    const statusIcon = document.getElementById('bp-status-icon');
    if (statusIcon) {
      statusIcon.textContent = '✅';
    }
  } catch (err) {
    alert('Error saving blood pressure: ' + err.message);
  }
}

// Global functions for inline handlers
window.submitBP = function() {
  const input = document.getElementById('bp-input');
  const feedback = document.getElementById('bp-feedback');
  if (input) {
    bpSubmit(window.contactId, input, feedback);
  }
};

window.skipBP = async function(contactId) {
  const message = 'Skip blood pressure recording?';
  const ok = typeof window.safeConfirm === 'function'
    ? await window.safeConfirm(message, { title: 'Skip blood pressure?', confirmText: 'Skip' })
    : confirm(message);
  if (ok) {
    try {
      await window.addTagToContact(contactId, window.TAGS.BP_SKIP);
    if (window._latestContact) {
      // keep local contact tags untouched for skip as well
    }
      if (window._latestContactFields && window.FIELDS?.BP_RESULT) {
        window._latestContactFields[window.FIELDS.BP_RESULT] = '';
      }
      window._bpFeedbackFlash = {
        category: 'skipped',
        color: '#e0e7ff',
        text: 'Blood pressure collection marked as not required.'
      };
      window._bpShowNextStep = true;
      window._bpFeedbackContactId = contactId;
      window._bpPreventAutoAdvance = true;
      window._bpLocalValues = window._bpLocalValues || {};
      window._bpLocalValues[contactId] = '';
      if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS) {
        window.forceChecklistFlag(window.OPPORTUNITY_LABELS.BP_CHECK, true);
      }
      window.burst();

      const statusIcon = document.getElementById('bp-status-icon');
      if (statusIcon) {
        statusIcon.textContent = '✅';
      }

      const feedbackEl = document.getElementById('bp-feedback');
      if (feedbackEl && window._bpFeedbackFlash) {
        feedbackEl.style.display = 'block';
        feedbackEl.textContent = window._bpFeedbackFlash.text;
        applyBPFeedbackStyles(feedbackEl, window._bpFeedbackFlash);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }
};

// Export functions
window.getBPFeedback = getBPFeedback;
window.bpInputHandler = bpInputHandler;
window.bpSubmit = bpSubmit;
