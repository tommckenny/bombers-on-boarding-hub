(function() {
  // anchor: override.start
  const manualOverrideMap = window.manualOverrideMap || {};
  const TAGS = window.TAGS || {};

  function getContactId() {
    const id = window.contactId;
    if (!id) {
      alert('Unable to determine contact ID for manual override.');
      throw new Error('Missing contactId');
    }
    return id;
  }

  async function applyTag(tag) {
    const contactId = getContactId();
    if (window._staffMode) {
      const label = window.OVERRIDE_CHECKLIST_MAP?.[tag] || tag;
      if (label && typeof window.forceChecklistFlag === 'function') {
        window.forceChecklistFlag(label, true);
      }
      return;
    }
    if (typeof window.addTagToContact !== 'function') {
      throw new Error('addTagToContact is not available');
    }
    await window.addTagToContact(contactId, tag);
  }

  // anchor: override.manualOverride
  async function manualOverride(key) {
    const checklistMap = window.OVERRIDE_CHECKLIST_MAP || {};
    const checklistLabel = checklistMap[key];
    const tag = manualOverrideMap[key];
    if (!checklistLabel && !tag) {
      alert(`No override mapping found for ${key}`);
      return;
    }

    try {
      if (checklistLabel && typeof window.forceChecklistFlag === 'function') {
        window.forceChecklistFlag(checklistLabel, true);
        if (key === 'consultation_questionnaire') {
          window.forceChecklistFlag(window.OPPORTUNITY_LABELS?.HEALTH_FORM || 'Health Form', true);
        }
        if (key === 'par_q_skip') {
          window.forceChecklistFlag(window.OPPORTUNITY_LABELS?.HEALTH_FORM || 'Health Form', true);
        }
        if (key === 'bp_skip') {
          window.forceChecklistFlag(window.OPPORTUNITY_LABELS?.BP_CHECK || 'Blood Pressure Check', true);
        }
      } else if (tag) {
        await applyTag(tag);
        if (key === 'consultation_questionnaire' && TAGS.PARQ_SUBMITTED) {
          await applyTag(TAGS.PARQ_SUBMITTED);
        }
      }

      if (key === 'mark_booked_1to1') {
        window._userClickedSection = true;
        window.currentSection = 'trial';
      }

      if (typeof window.burst === 'function') {
        window.burst();
      }

      if (key === 'consultation_questionnaire' && window.consultFormState) {
        window.consultFormState.lastStatus = 'Consultation & health form manually marked as complete.';
      }

      const overrideIcon = document.querySelector(`li[data-key="${key}"] .status-icon`);
      if (overrideIcon) {
        overrideIcon.textContent = '✅';
      }

      setTimeout(() => {
        try { sessionStorage.clear(); } catch (err) { /* ignore */ }
        if (typeof window.renderChecklist === 'function') {
          window.renderChecklist();
        }
      }, 1000);
    } catch (err) {
      console.error('[manualOverride] Failed:', err);
      alert(`Unable to complete override: ${err.message}`);
    }
  }

  // anchor: override.confirm
  async function confirmManualOverride(key) {
    const prompts = {
      mark_purchased_1to1: "Are you sure you've already purchased your initial 1-1?",
      mark_booked_1to1: "Are you sure you've already booked your initial 1-1?",
      proxy_booked_1to1: "Are you sure you've already booked your initial 1-1 with the team?"
    };

    const message = prompts[key] || 'Are you sure you want to mark this as complete?';
    const ok = typeof window.safeConfirm === 'function'
      ? await window.safeConfirm(message, { title: 'Confirm', confirmText: 'OK' })
      : window.confirm(message);
    if (ok) {
      manualOverride(key);
    }
  }

  window.manualOverride = manualOverride;
  window.confirmManualOverride = confirmManualOverride;
})();
