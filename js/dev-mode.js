// Development Mode - Mock Data for Local Testing
// This file provides fake contact data so you can test locally without GHL

(function() {
  'use strict';

  // Check if we're in development mode (no real contactId or test param)
  const urlParams = new URLSearchParams(window.location.search);
  const testMode = urlParams.get('test');
  const realContactId = urlParams.get('contactId') || urlParams.get('contactid');

  // If we have a real contactId, don't use mock data
  if (realContactId && !testMode) {
    console.log('[Dev Mode] Real contactId found, using production mode');
    return;
  }

  console.log('[Dev Mode] 🧪 Running in MOCK DATA mode');
  console.log('[Dev Mode] Test scenario:', testMode || 'default');

  // Mock contact data scenarios
  const MOCK_SCENARIOS = {
    new: {
      contact: {
        id: 'mock-contact-new',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@test.com',
        phone: '+44 7700 900000',
        dateOfBirth: '1990-05-15',
        tags: [],
        customFields: []
      },
      description: '🆕 Brand new contact - nothing completed'
    },

    enquiry: {
      contact: {
        id: 'mock-contact-enquiry',
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@test.com',
        phone: '+44 7700 900001',
        dateOfBirth: '1985-08-22',
        tags: ['enquiry form submitted'],
        customFields: []
      },
      description: '📝 Enquiry submitted'
    },

    intro: {
      contact: {
        id: 'mock-contact-intro',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@test.com',
        phone: '+44 7700 900002',
        dateOfBirth: '1992-03-10',
        tags: [
          'enquiry form submitted',
          'consultation form submitted',
          'nsi booked'
        ],
        customFields: [
          { id: window.FIELDS?.APPT_DATE || 'appt_date', value: '2025-11-05T10:00:00Z' },
          { id: window.FIELDS?.APPT_COACH || 'appt_coach', value: 'Coach Tom' }
        ]
      },
      description: '🤝 Intro meeting booked'
    },

    trial: {
      contact: {
        id: 'mock-contact-trial',
        firstName: 'Emma',
        lastName: 'Williams',
        email: 'emma.williams@test.com',
        phone: '+44 7700 900003',
        dateOfBirth: '1988-11-30',
        tags: [
          'enquiry form submitted',
          'consultation form submitted',
          'nsi booked',
          'attended intro',
          'on-boarding 1-1 booked',
          'attended 1-1',
          'par-q submitted',
                    'membership t&cs signed',
          'class t&cs signed'
        ],
        customFields: [
          { id: window.FIELDS?.APPT_DATE || 'appt_date', value: '2025-10-28T14:00:00Z' },
          { id: window.FIELDS?.BP_RESULT || 'bp_result', value: '120/80' },
          { id: window.FIELDS?.TRIAL_START || 'trial_start', value: '2025-10-29' },
          { id: window.FIELDS?.BILL_DATE || 'bill_date', value: '2025-11-05' },
          { id: window.FIELDS?.FUTURE_PLAN || 'future_plan', value: 'Classic' },
          { id: window.FIELDS?.PAY_12_OPEN || 'pay_12_open', value: 'No' },
          { id: window.FIELDS?.FIRST_BILL_AMOUNT || 'first_bill_amount', value: '71.76' }
        ]
      },
      description: '🎉 In trial week'
    },

    complete: {
      contact: {
        id: 'mock-contact-complete',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@test.com',
        phone: '+44 7700 900004',
        dateOfBirth: '1995-07-18',
        tags: [
          'enquiry form submitted',
          'consultation form submitted',
          'nsi booked',
          'attended intro',
          'on-boarding 1-1 booked',
          'attended 1-1',
          'par-q submitted',
          'trial week booked',
          'membership t&cs signed',
          'class t&cs signed',
          'dd mandate signed'
        ],
        customFields: [
          { id: window.FIELDS?.APPT_DATE || 'appt_date', value: '2025-10-20T15:00:00Z' },
          { id: window.FIELDS?.BP_RESULT || 'bp_result', value: '118/75' },
          { id: window.FIELDS?.TRIAL_START || 'trial_start', value: '2025-10-21' },
          { id: window.FIELDS?.BILL_DATE || 'bill_date', value: '2025-10-28' },
          { id: window.FIELDS?.FUTURE_PLAN || 'future_plan', value: 'Premium' }
        ]
      },
      description: '✅ All stages completed'
    }
  };

  // Get the scenario (default to 'new')
  const scenario = MOCK_SCENARIOS[testMode] || MOCK_SCENARIOS.new;

  console.log(`[Dev Mode] ${scenario.description}`);
  console.log('[Dev Mode] Mock contact:', scenario.contact);

  const TAGS = window.TAGS || {};
  const FIELDS = window.FIELDS || {};

  const DEV_TAGS = {
    enquiryForm: TAGS.ENQUIRY_FORM_SUBMITTED || 'enquiry form submitted',
    healthForm: TAGS.PARQ_SUBMITTED || 'par-q submitted',
    consultDone: TAGS.CONSULT_DONE || 'consultation form submitted',
    consultSkipped: TAGS.CONSULT_SKIPPED || 'consultation form skipped',
    introBooked: TAGS.NSI_BOOKED || 'nsi booked',
    introAttended: TAGS.INTRO_ATTENDED || 'attended intro',
    bpSkip: TAGS.BP_SKIP || 'bp not required',
    dcBooked: TAGS.DC_BOOKED || 'dc booked',
    purchased1to1: TAGS.PURCHASED_1TO1 || 'initial 1-1 purchased',
    booked1to1: TAGS.BOOKED_1TO1 || 'on-boarding 1-1 booked',
    onboardingProxy: TAGS.ONBOARDING_PROXY || 'onboarding session booked proxy',
    attended1to1: TAGS.ATTENDED_1TO1 || 'attended 1-1 session',
    informedConsent: TAGS.INFORMED_CONSENT || 'informed consent signed',
    inductionDone: TAGS.INDUCTION_DONE || 'online induction completed',
    apptCheckin: TAGS.APPT_CHECKIN || 'appt checkin',
    debriefDone: TAGS.DEBRIEF_DONE || 'initial 1-1 debrief completed'
  };

  const DEV_FIELDS = {
    apptDate: FIELDS.APPT_DATE || 'appt_date',
    apptBooked: 'appt_booked_time',
    apptAction: FIELDS.APPT_ACTION || 'appt_action',
    apptCoach: FIELDS.APPT_COACH || 'appt_coach',
    bpResult: FIELDS.BP_RESULT || 'bp_result'
  };

  let devControlsPanel = null;
  let refreshTimeoutId = null;

  function ensureContactArrays() {
    if (!Array.isArray(scenario.contact.tags)) {
      scenario.contact.tags = [];
    }
    if (!Array.isArray(scenario.contact.customFields)) {
      scenario.contact.customFields = [];
    }
  }

  function setTagValue(tag, enabled) {
    if (!tag) return;
    ensureContactArrays();
    const tags = scenario.contact.tags;
    const index = tags.indexOf(tag);
    if (enabled && index === -1) {
      tags.push(tag);
    } else if (!enabled && index !== -1) {
      tags.splice(index, 1);
    }
  }

  function hasTagValue(tag) {
    if (!tag) return false;
    ensureContactArrays();
    return scenario.contact.tags.includes(tag);
  }

  function setFieldValue(fieldId, value) {
    if (!fieldId) return;
    ensureContactArrays();
    const fields = scenario.contact.customFields;
    const index = fields.findIndex(f => f.id === fieldId);
    if (value === null || value === undefined || value === '') {
      if (index > -1) {
        fields.splice(index, 1);
      }
    } else if (index > -1) {
      fields[index].value = value;
    } else {
      fields.push({ id: fieldId, value });
    }
  }

  function getFieldValue(fieldId) {
    if (!fieldId) return '';
    ensureContactArrays();
    const fields = scenario.contact.customFields;
    const entry = fields.find(f => f.id === fieldId);
    return entry ? entry.value : '';
  }

  function applyIntroStatus(value) {
    if (value === 'confirmed') {
      setTagValue(DEV_TAGS.introBooked, true);
      const iso = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      setFieldValue(DEV_FIELDS.apptDate, iso);
      setFieldValue(DEV_FIELDS.apptBooked, iso);
      setFieldValue(DEV_FIELDS.apptAction, 'Confirmed');
      if (DEV_FIELDS.apptCoach) {
        const currentCoach = getFieldValue(DEV_FIELDS.apptCoach);
        if (!currentCoach) {
          setFieldValue(DEV_FIELDS.apptCoach, 'Coach Team');
        }
      }
    } else if (value === 'requested') {
      setTagValue(DEV_TAGS.introBooked, true);
      setFieldValue(DEV_FIELDS.apptAction, 'Requested');
      setFieldValue(DEV_FIELDS.apptDate, '');
      setFieldValue(DEV_FIELDS.apptBooked, '');
    } else {
      setTagValue(DEV_TAGS.introBooked, false);
      setTagValue(DEV_TAGS.dcBooked, false);
      setFieldValue(DEV_FIELDS.apptDate, '');
      setFieldValue(DEV_FIELDS.apptBooked, '');
      setFieldValue(DEV_FIELDS.apptAction, '');
      if (DEV_FIELDS.apptCoach) setFieldValue(DEV_FIELDS.apptCoach, '');
    }
  }

  function applyConsultStatus(value) {
    if (value === 'signed') {
      setTagValue(DEV_TAGS.consultDone, true);
      setTagValue(DEV_TAGS.consultSkipped, false);
    } else {
      setTagValue(DEV_TAGS.consultDone, false);
    }
  }

  function applyInitialBookingStatus(value) {
    const booked = value === 'booked';
    setTagValue(DEV_TAGS.booked1to1, booked);
    setTagValue(DEV_TAGS.purchased1to1, false);
    setTagValue(DEV_TAGS.onboardingProxy, false);
    if (!booked) {
      setTagValue(DEV_TAGS.attended1to1, false);
    }
  }

  function applyConsentStatus(value) {
    setTagValue(DEV_TAGS.informedConsent, value === 'completed');
  }

  function applyInductionStatus(value) {
    setTagValue(DEV_TAGS.inductionDone, value === 'completed');
  }

  function applyDebriefStatus(value) {
    setTagValue(DEV_TAGS.debriefDone, value === 'completed');
  }

  function applyCheckboxToggle(key, checked) {
    switch (key) {
      case 'enquiry_form_complete':
        setTagValue(DEV_TAGS.enquiryForm, checked);
        break;
      case 'health_form_complete':
        setTagValue(DEV_TAGS.healthForm, checked);
        if (!checked) {
          setTagValue(DEV_TAGS.consultDone, false);
        }
        break;
      case 'intro_showed':
        setTagValue(DEV_TAGS.introAttended, checked);
        break;
      case 'bp_submitted':
        if (checked) {
          setFieldValue(DEV_FIELDS.bpResult, getFieldValue(DEV_FIELDS.bpResult) || '120/80');
          setTagValue(DEV_TAGS.bpSkip, false);
        } else {
          setFieldValue(DEV_FIELDS.bpResult, '');
        }
        break;
      case 'initial_checked_in':
        setTagValue(DEV_TAGS.apptCheckin, checked);
        break;
      default:
        break;
    }
  }

  function computeIntroStatus() {
    if (hasTagValue(DEV_TAGS.introBooked)) {
      if (getFieldValue(DEV_FIELDS.apptDate) || getFieldValue(DEV_FIELDS.apptBooked)) {
        return 'confirmed';
      }
      return 'requested';
    }
    return 'none';
  }

  function computeConsultStatus() {
    return hasTagValue(DEV_TAGS.consultDone) ? 'signed' : 'not_signed';
  }

  function computeInitialBookingStatus() {
    if (hasTagValue(DEV_TAGS.booked1to1) || hasTagValue(DEV_TAGS.purchased1to1) || hasTagValue(DEV_TAGS.onboardingProxy)) {
      return 'booked';
    }
    return 'not_booked';
  }

  function computeConsentStatus() {
    return hasTagValue(DEV_TAGS.informedConsent) ? 'completed' : 'not_completed';
  }

  function computeInductionStatus() {
    return hasTagValue(DEV_TAGS.inductionDone) ? 'completed' : 'not_completed';
  }

  function computeDebriefStatus() {
    return hasTagValue(DEV_TAGS.debriefDone) ? 'completed' : 'not_completed';
  }

  function scheduleChecklistRefresh() {
    if (refreshTimeoutId) {
      clearTimeout(refreshTimeoutId);
    }
    refreshTimeoutId = setTimeout(() => {
      refreshTimeoutId = null;
      if (typeof window.renderChecklist === 'function') {
        window.renderChecklist();
      }
    }, 80);
  }

  function refreshDevControls() {
    if (!devControlsPanel) return;
    const introState = computeIntroStatus();
    const consultState = computeConsultStatus();
    const initialState = computeInitialBookingStatus();
    const consentState = computeConsentStatus();
    const inductionState = computeInductionStatus();
    const debriefState = computeDebriefStatus();

    const setCheckbox = (selector, value) => {
      const el = devControlsPanel.querySelector(selector);
      if (el) {
        el.checked = !!value;
      }
    };
    const setRadioGroup = (name, value) => {
      const radios = devControlsPanel.querySelectorAll(`input[name="${name}"]`);
      radios.forEach(radio => {
        radio.checked = radio.value === value;
      });
    };

    setCheckbox('input[data-dev-toggle="enquiry_form_complete"]', hasTagValue(DEV_TAGS.enquiryForm));
    setCheckbox('input[data-dev-toggle="health_form_complete"]', hasTagValue(DEV_TAGS.healthForm));
    setCheckbox('input[data-dev-toggle="intro_showed"]', hasTagValue(DEV_TAGS.introAttended));
    setCheckbox('input[data-dev-toggle="bp_submitted"]', !!getFieldValue(DEV_FIELDS.bpResult));
    setCheckbox('input[data-dev-toggle="initial_checked_in"]', hasTagValue(DEV_TAGS.apptCheckin));

    setRadioGroup('dev-intro-status', introState);
    setRadioGroup('dev-consult-status', consultState);
    setRadioGroup('dev-initial-booking', initialState);
    setRadioGroup('dev-consent-status', consentState);
    setRadioGroup('dev-induction-status', inductionState);
    setRadioGroup('dev-debrief-status', debriefState);
  }

  function handleDevControlChange(event) {
    const target = event.target;
    if (!target) return;
    if (target.dataset && target.dataset.devToggle) {
      applyCheckboxToggle(target.dataset.devToggle, target.checked);
    } else if (target.name === 'dev-intro-status') {
      applyIntroStatus(target.value);
    } else if (target.name === 'dev-consult-status') {
      applyConsultStatus(target.value);
    } else if (target.name === 'dev-initial-booking') {
      applyInitialBookingStatus(target.value);
    } else if (target.name === 'dev-consent-status') {
      applyConsentStatus(target.value);
    } else if (target.name === 'dev-induction-status') {
      applyInductionStatus(target.value);
    } else if (target.name === 'dev-debrief-status') {
      applyDebriefStatus(target.value);
    } else {
      return;
    }
    refreshDevControls();
    scheduleChecklistRefresh();
  }

  function getDevControlsPanel() {
    if (devControlsPanel) return devControlsPanel;
    devControlsPanel = document.createElement('div');
    devControlsPanel.id = 'dev-mode-controls';
    devControlsPanel.style = 'background:#f0f4ff;border-bottom:1px solid #d0dcff;padding:12px 20px;font-family:monospace;font-size:13px;';
    devControlsPanel.innerHTML = `
      <div style="max-width:1200px;margin:0 auto;display:flex;flex-wrap:wrap;gap:20px;">
        <div style="flex:1 1 260px;min-width:240px;">
          <h4 style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#273a84;">Enquiry Stage</h4>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="checkbox" data-dev-toggle="enquiry_form_complete" style="margin-right:6px;"> Enquiry form complete</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="checkbox" data-dev-toggle="health_form_complete" style="margin-right:6px;"> Health form complete</label>
          <div style="margin:10px 0 4px;font-weight:600;font-size:12px;color:#1f2d60;">Intro meeting</div>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-intro-status" value="none" style="margin-right:6px;"> Not requested</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-intro-status" value="requested" style="margin-right:6px;"> Intro meeting “requested”</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-intro-status" value="confirmed" style="margin-right:6px;"> Intro meeting “confirmed”</label>
          <div style="margin:10px 0 4px;font-weight:600;font-size:12px;color:#1f2d60;">Consultation form</div>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-consult-status" value="not_signed" style="margin-right:6px;"> Consultation form not yet signed</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-consult-status" value="signed" style="margin-right:6px;"> Consultation form signed</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="checkbox" data-dev-toggle="intro_showed" style="margin-right:6px;"> Intro meeting “showed”</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="checkbox" data-dev-toggle="bp_submitted" style="margin-right:6px;"> Blood pressure submitted</label>
        </div>
        <div style="flex:1 1 260px;min-width:240px;">
          <h4 style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#273a84;">Initial 1-1 Stage</h4>
          <div style="margin:0 0 4px;font-weight:600;font-size:12px;color:#1f2d60;">Initial 1-1 booking</div>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-initial-booking" value="not_booked" style="margin-right:6px;"> Initial 1-1 not yet booked</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-initial-booking" value="booked" style="margin-right:6px;"> Initial 1-1 booked</label>
          <div style="margin:10px 0 4px;font-weight:600;font-size:12px;color:#1f2d60;">Informed consent</div>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-consent-status" value="not_completed" style="margin-right:6px;"> Informed consent not yet completed</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-consent-status" value="completed" style="margin-right:6px;"> Informed consent completed</label>
          <div style="margin:10px 0 4px;font-weight:600;font-size:12px;color:#1f2d60;">Online induction</div>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-induction-status" value="not_completed" style="margin-right:6px;"> Online induction not yet completed</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-induction-status" value="completed" style="margin-right:6px;"> Online induction completed</label>
          <label style="display:block;margin:10px 0 4px;cursor:pointer;"><input type="checkbox" data-dev-toggle="initial_checked_in" style="margin-right:6px;"> Initial 1-1 “checked in”</label>
          <div style="margin:10px 0 4px;font-weight:600;font-size:12px;color:#1f2d60;">1-1 Debrief</div>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-debrief-status" value="not_completed" style="margin-right:6px;"> 1-1 Debrief not completed</label>
          <label style="display:block;margin-bottom:4px;cursor:pointer;"><input type="radio" name="dev-debrief-status" value="completed" style="margin-right:6px;"> 1-1 Debrief completed</label>
        </div>
        <div style="flex:1 1 200px;min-width:200px;">
          <h4 style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:0.05em;color:#273a84;">Trial Stage</h4>
          <p style="margin:0;font-size:12px;color:#4a5aa4;">More toggles coming soon. For now, adjust tags via the checklist UI or manual overrides.</p>
        </div>
      </div>
    `;
    devControlsPanel.addEventListener('change', handleDevControlChange);
    return devControlsPanel;
  }

  // Override the fetchContact function
  const originalFetchContact = window.fetchContact;
  window.fetchContact = async function(contactId) {
    console.log('[Dev Mode] 🎭 Intercepting fetchContact, returning mock data');

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      contact: scenario.contact
    };
  };

  const originalFetchContactAppointments = window.fetchContactAppointments;
  window.fetchContactAppointments = async function(contactId) {
    console.log('[Dev Mode] 🎭 Intercepting fetchContactAppointments');
    await new Promise(resolve => setTimeout(resolve, 200));
    try {
      const fieldsMap = {};
      (scenario.contact.customFields || []).forEach(f => {
        if (f && f.id) fieldsMap[f.id] = f.value || '';
      });
      const tagsLower = (scenario.contact.tags || []).map(t => String(t).toLowerCase());
      const apptIso = fieldsMap[window.FIELDS?.APPT_DATE] || '';
      if (!apptIso) {
        return { events: [] };
      }
      let status = 'requested';
      if (tagsLower.includes((window.TAGS?.INTRO_ATTENDED || 'attended intro').toLowerCase())) {
        status = 'showed';
      } else if (tagsLower.includes((window.TAGS?.NSI_BOOKED || 'nsi booked').toLowerCase()) || tagsLower.includes((window.TAGS?.DC_BOOKED || 'dc booked').toLowerCase())) {
        status = 'confirmed';
      }
      const coachName = fieldsMap[window.FIELDS?.APPT_COACH] || 'Coach Team';
      return {
        events: [
          {
            title: 'No-Sweat Intro',
            appointmentStatus: status,
            startTime: apptIso,
            coachName
          }
        ]
      };
    } catch (err) {
      console.warn('[Dev Mode] fetchContactAppointments mock error', err);
      return { events: [] };
    }
  };

  // Override updateFieldsBatch for testing
  const originalUpdateFieldsBatch = window.updateFieldsBatch;
  window.updateFieldsBatch = async function(contactId, fields) {
    console.log('[Dev Mode] 🎭 Intercepting updateFieldsBatch:', fields);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Update mock data
    Object.keys(fields).forEach(fieldId => {
      setFieldValue(fieldId, fields[fieldId]);
    });

    refreshDevControls();
    scheduleChecklistRefresh();

    console.log('[Dev Mode] ✅ Mock fields updated');
    return { success: true };
  };

  // Override addTagToContact for testing
  const originalAddTagToContact = window.addTagToContact;
  window.addTagToContact = async function(contactId, tag) {
    console.log('[Dev Mode] 🎭 Intercepting addTagToContact:', tag);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Add tag to mock data
    setTagValue(tag, true);

    refreshDevControls();
    scheduleChecklistRefresh();

    console.log('[Dev Mode] ✅ Mock tag added');
    return { success: true };
  };

  // Override removeTagFromContact for testing
  const originalRemoveTagFromContact = window.removeTagFromContact;
  window.removeTagFromContact = async function(contactId, tag) {
    console.log('[Dev Mode] 🎭 Intercepting removeTagFromContact:', tag);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Remove tag from mock data
    setTagValue(tag, false);

    refreshDevControls();
    scheduleChecklistRefresh();

    console.log('[Dev Mode] ✅ Mock tag removed');
    return { success: true };
  };

  // Override getContactIdFromURL to return mock ID
  const originalGetContactIdFromURL = window.getContactIdFromURL;
  window.getContactIdFromURL = function() {
    // Check if there's a real contactId first
    if (realContactId) {
      return realContactId;
    }

    // Return mock contactId
    console.log('[Dev Mode] 🎭 Returning mock contactId');
    return scenario.contact.id;
  };

  // Add helper to show test mode info
  window.showDevModeInfo = function() {
    const info = `
🧪 DEVELOPMENT MODE ACTIVE

Current Scenario: ${testMode || 'default (new contact)'}
${scenario.description}

Available Test Scenarios:
- ?test=new       - Brand new contact
- ?test=enquiry   - Enquiry submitted
- ?test=intro     - Intro meeting booked
- ?test=trial     - In trial week
- ?test=complete  - All stages completed

Current Mock Contact:
Name: ${scenario.contact.firstName} ${scenario.contact.lastName}
Email: ${scenario.contact.email}
Tags: ${scenario.contact.tags.length} tag(s)
Fields: ${scenario.contact.customFields.length} field(s)

To use real data, add ?contactId=real-id to URL
    `;
    console.log(info);
    return info;
  };

  // Display dev mode banner
  const banner = document.createElement('div');
  banner.id = 'dev-mode-banner';
  banner.innerHTML = `
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 20px; text-align: center; font-family: monospace; font-size: 14px; position: sticky; top: 0; z-index: 99999; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
      🧪 <strong>DEV MODE</strong> | ${scenario.description} |
      <button onclick="window.showDevModeInfo(); return false;" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 12px; border-radius: 4px; cursor: pointer; margin-left: 8px; font-family: monospace;">
        Show Test Scenarios
      </button>
      <button onclick="window.location.search='?test=new'; return false;" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 4px; font-family: monospace; font-size: 12px;">New</button>
      <button onclick="window.location.search='?test=enquiry'; return false;" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 4px; font-family: monospace; font-size: 12px;">Enquiry</button>
      <button onclick="window.location.search='?test=intro'; return false;" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 4px; font-family: monospace; font-size: 12px;">Intro</button>
      <button onclick="window.location.search='?test=trial'; return false;" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 4px; font-family: monospace; font-size: 12px;">Trial</button>
      <button onclick="window.location.search='?test=complete'; return false;" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.5); color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer; margin-left: 4px; font-family: monospace; font-size: 12px;">Complete</button>
    </div>
  `;

  document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    if (!body) return;
    body.insertBefore(banner, body.firstChild);
    const panel = getDevControlsPanel();
    body.insertBefore(panel, banner.nextSibling);
    refreshDevControls();
  });

  // Show initial info in console
  window.showDevModeInfo();

  console.log('[Dev Mode] ✅ Mock data system initialized');
  console.log('[Dev Mode] 💡 Tip: Check console for all intercepted API calls');

})();
