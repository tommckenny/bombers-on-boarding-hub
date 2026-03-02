// anchor: config.start (FIELDS/TAGS/prices/TERMS_LIBRARY)
// Configuration and Constants
// All field IDs, tags, and global configuration for the BombersPT Onboarding Checklist

// anchor: config.FIELDS
const FIELDS = {
  APPT_DATE: "5OW9SPaBGbqChOOqBfoI",
  APPT_COACH: "Cp00qEaWBn1gFvpDcjE5",
  APPT_SOURCE: "vebmDR8kdIhluRD2xZnk",
  APPT_INSTRUCTOR_EMAIL: "02yROqvPjWRVBEE97ymA",
  APPT_TYPE: "4mGqlhk3ExLtvdi47JTf",
  APPT_ACTION: "oBGVXxVm91GbpyHzS6Ht",
  BP_RESULT: "Cvzpen1uIP6CNffM6BwN",
  CONTACT_CHECKLIST: "y3qlzcOO0Sf3Rj0R6gY3",
  OPPORTUNITY_CHECKLIST: "o1R310owxe3XJGQrjDnr",
  TRIAL_START: "kqpNMwQER3ljj3r6mZxi",
  BILL_DATE: "JrQHEjYNPc6xgMFGXFrj",
  FUTURE_PLAN: "L34eE01tSEGGF6Xhp0Se",
  PARQ_SIGNATURE: "Psc4ihmE8CG0H3xSIg44",
  MEMBERSHIP_TCS_SIGNATURE: "uX91faCJKQOsPGNXPBSr",
  CLASS_TCS_SIGNATURE: "gGo5jSJz1bGY5ItQLZSM",
  DD_MANDATE_SIGNATURE: "V6Ac6EXSy8V1uKbx8W1m",
  INFORMED_CONSENT_SIGNATURE: "Hl7QET3ScGBquLicxufW",
  DROPIN_TCS_SIGNATURE: "K0QK4FDeTnJYqeXoGHm2",
  CONSULT_Q1: "GYvh5eBkJRpR1GJoH0Vc",
  CONSULT_Q2: "VsZN9LQBBYDcG3Lz0nR9",
  CONSULT_Q3: "xYDAoEJWgMnJqUt3BuTB",
  CONSULT_Q4: "qkZYmL5bVYYPbTLOnmSs",
  INDUCTION_SIGNATURE: "K0QK4FDeTnJYqeXoGHm2",
  MEMBERSHIP_SELECTION_DEADLINE: "nvQKdoUsvcL2JWojcIv5",
  PAY_12_OPEN: "qS9AfnWI0Ot8IrWevigF",
  FIRST_BILL_AMOUNT: "KyrPv8Nu87QHuWCDkcRI",
  CHOSEN_PRICE: "OLvHepqWEWiw2mtN3430",
  AVAILABILITY_TIME: "IL2w4wdmhsPEIi70OgHo",
  PARENT_STATUS: "AemsgM19T4jbPs49YE05",
  PLAN_STATUS: "VDF9I4KCpptv34HMUK33",
  PLAN_CATEGORY: "asNnHqU8H4kaKtYKZISd",
  PLAN_NAME_LAST_CHANGED: "p6T5SHF2IIyj8kSnXRuN",
  PLAN_CREDITS: "JfXosgmIFjZ8QfIW2CeL",
  TRIAL_CANCEL_REASON: "J6KeaBFCXB36YIoovFGM",
  TRIAL_CANCEL_CHANGE: "x5bjBM6dP89fxwjpBeMc",
  MEMBERSHIP_PAUSE_NOTICE_ACK: "9yT7LfTmZXv2kU1XdrvH",
  MEMBERSHIP_RESUME_ACK: "FtvYj6yytaMbO8NSRYCw",
  MEMBERSHIP_PAUSE_CHARGE_ACK: "LkCpDlHpVhZGESjurq1M",
  COACHED_SESSIONS_REMAINING: "TrXL1f1CLKfqEEqrv92i"
};

// Consultation custom fields used for legacy data compatibility and PAR-Q storage
const CONSULT_FIELDS = {
  membershipIntent: "FkF4iMZgj6Vy8EGNyE7q",
  serviceType: "wsTQgTaqKGUUyzy9D3iS",
  personalTrainer: "Pfp5lTPDDjS38KwytqPc",
  serviceInterest: "oDb2T7IhlEP10n9iCUqT",
  parqStorage: "lCNUpUKK5b2mcqoMVT8e",
  joinClasses: "qlci6xzedmP1c7ABAXr8",
  leadType: "mPT8PeQLjMRtOFcCOqYR",
  whyReachOut: "Htk2KGag7cL3ExaHeZoe",
  ptHistory: "ZM2mTOfR5nC2hTBf0LhD",
  currentWeight: "URmZow8iLRFr4uHwHuZN",
  height: "sZJF8tKTIjpBF7qeVado",
  ptBudget: "Y5Eulh3u9hEZkgKXZ52P",
  experience: "aQ2RzjQn0mIZPWkV9NfO",
  challenges: "neSgiGzs1EZkSnHLd84y",
  feelStrong: "CxxhKtlTuNllcm9ucx2U",
  lookGood: "dKvhJMw9LO5ceFXLI3N7",
  consistency: "rqsKTL9gGHi2Zqf3dBRp",
  stayHealthy: "7eKtaEyI4DIqwzV5OQeb",
  feelBetter: "emSFVSs3dNax7TkjMffO",
  familyExample: "gdWhUkPCbd1Ae3eysa90",
  community: "XYxfBNynG5soUMvTiuK7",
  pushLimits: "aMSR1EwSqYyryoeTiM34",
  commitment: "7ahrFimEcOSwkYtlow3W"
};

// Serialised PAR-Q responses live inside the dedicated parqStorage field.
// We intentionally do not fall back to other custom fields (e.g. serviceInterest).
const PARQ_STORAGE_FIELD = CONSULT_FIELDS.parqStorage;
const PARQ_LEGACY_STORAGE_FIELD = null;

const PARQ_QUESTIONS = [
  {
    id: 'parq_heart_condition',
    label: 'Has your doctor ever said that you have a heart condition or high blood pressure?',
    detailPrompt: 'Please provide details, including any medication.',
    requiresDetail: true
  },
  {
    id: 'parq_chest_pain',
    label: 'Do you feel pain in your chest when you do physical activity?',
    detailPrompt: 'Please describe when this happens.',
    requiresDetail: true
  },
  {
    id: 'parq_chest_pain_not_active',
    label: 'Do you feel pain in your chest when you are not doing physical activity?',
    detailPrompt: 'Please describe the circumstances.',
    requiresDetail: true
  },
  {
    id: 'parq_dizziness',
    label: 'Do you lose your balance, feel dizzy, or ever lose consciousness?',
    detailPrompt: 'Add context so we can plan safely.',
    requiresDetail: true
  },
  {
    id: 'parq_joint_problem',
    label: 'Do you have a bone or joint problem that could be made worse by a change in your physical activity?',
    detailPrompt: 'Please include details of any injuries.',
    requiresDetail: true
  },
  {
    id: 'parq_medication',
    label: 'Are you currently taking prescribed medication for blood pressure or a heart condition?',
    detailPrompt: 'List the medication if possible.',
    requiresDetail: true
  },
  {
    id: 'parq_other_reason',
    label: 'Do you know of any other reason why you should not take part in physical activity?',
    detailPrompt: 'Let us know so we can help.',
    requiresDetail: true
  },
  {
    id: 'parq_pregnancy',
    label: 'Are you pregnant or have you given birth in the last 3 months?',
    detailPrompt: 'Please provide details.',
    requiresDetail: false
  }
];

const PARQ_FIELD_IDS = {
  parq_heart_condition: 'xiF0gJIk8IG77c6lDsnO',
  parq_chest_pain: 'D134Z7RdMCjHtaSY3LLj',
  parq_chest_pain_not_active: 'Oy2j987AOgms1nSh3CAB',
  parq_dizziness: 'MtDi4YJBZGERL6bESHs2',
  parq_joint_problem: 'oenzmpUXw74ixz5nbFny',
  parq_medication: 'JhOKbznRR38ywQwQf18r',
  parq_other_reason: 'btS4exPT91TZWYKCWk4f',
  parq_pregnancy: 'g3o8owQPJ287LWWXLgKY'
};

const PARQ_QUESTION_LOOKUP = Object.fromEntries(PARQ_QUESTIONS.map(q => [q.id, q]));

const TAGS = {
  CONSULT_DONE: "consultation form submitted",
  CONSULT_SKIPPED: "consultation form skipped",
  PARQ_SUBMITTED: "par-q submitted",
  NSI_BOOKED: "nsi booked",
  INTRO_ATTENDED: "attended intro",
  INTRO_NOSHOW: "intro no show",
  BOOKED_1TO1: "on-boarding 1-1 booked",
  ATTENDED_1TO1: "on-boarding 1-1 checked in",
  TRIAL_WEEK_BOOKED: "trial week booked",
  ENQUIRY_FORM_SUBMITTED: "enquiry form submitted",
  AWAITING_CONSULT: "awaiting consultation form",
  CONSULT_SKIP: "consultation form skipped",
  BP_RECORDED: "bp recorded",
  BP_RECORDED_HIGH: "high bp recorded",
  BP_RECORDED_PRE_HIGH: "pre-high bp recorded",
  BP_SKIP: "bp not required",
  PARQ_SKIP: "par-q not required",
  PARQ_SUBMITTED_CONFIRMED: "par-q submitted",
  DC_BOOKED: "dc booked",
  OVERRIDE_ACTIVE: "manual override active",
  INDUCTION_DONE: "online induction completed",
  PURCHASED_1TO1: "initial 1-1 purchased",
  ONBOARDING_PROXY: "onboarding session booked proxy",
  WODUP_DONE: "wodup setup marked complete",
  DEBRIEF_DONE: "initial 1-1 debrief completed",
  MEMBERSHIP_DONE: "membership form submitted",
  GRANT_DOOR_ACCESS: "grant door access",
  APPT_CHECKIN: "appt checkin",
  INFORMED_CONSENT: "informed consent signed",
  OPEN_GYM_TCS: "open gym t&cs signed",
  TRIAL_TCS: "trial t&cs signed",
  ANNUAL_PRICE_REVIEW: "annual price review signed",
  CARD_ON_FILE: "card on file agreement",
  READ_PRE_INTRO_INFO: "read pre-intro information",
  STRONG_MUMS_LEAD: "strong mums lead",
  APP_DOWNLOADED: "bombers app downloaded",
  CANCEL_REQUEST_SUBMITTED: "cancellation request submitted"
};

const MEMBERSHIP_PRICES = {
  opengym: 65.76,
  classic: 86.11,
  premium: 107.92
};

const PLAN_LINKS = {
  OPEN_GYM: "https://bomberspt.pushpress.com/landing/plans/plan_55ff5fdcd034e2",
  OPEN_GYM_OFF_PEAK: "https://bomberspt.pushpress.com/landing/plans/plan_bd2b0235eab54e",
  CLASSIC: "https://bomberspt.pushpress.com/landing/plans/plan_a61ebd39392641/login",
  PREMIUM: "https://bomberspt.pushpress.com/landing/plans/plan_576adb7f3c904f",
  PT_RECURRING_1: "https://bomberspt.pushpress.com/landing/plans/plan_a3d6ed981bd946",
  PT_RECURRING_1_PLUS_GYM: "https://bomberspt.pushpress.com/landing/plans/plan_be5755c62d5d45",
  PT_RECURRING_2_PLUS_GYM: "https://bomberspt.pushpress.com/landing/plans/plan_c9e43f60eb9b4e",
  PT_RECURRING_3_PLUS_GYM: "https://bomberspt.pushpress.com/landing/plans/plan_fb1d6ca8f4904a",
  STRONG_MUMS_CONSULT: "https://bomberspt.pushpress.com/landing/appointments/apptpkg_51fd2ffcb982ec1cd2bc840c8f44",
  STRONG_MUMS_DROPIN: "",
  STRONG_MUMS_BLOCK: ""
};

const DROPIN_PASS_LINKS = {
  DAY_PASS: 'https://bomberspt.pushpress.com/landing/plans/plan_2cb662ac65d13b',
  WEEK_PASS: 'https://bomberspt.pushpress.com/landing/plans/plan_fc949f918319ce',
  FOUR_WEEK_PASS: 'https://bomberspt.pushpress.com/landing/plans/plan_ad88f39b49c744',
  CLASS_SINGLE_PASS: 'https://bomberspt.pushpress.com/landing/plans/plan_708fedeb6ad948',
  CLASS_BLOCK4_PASS: 'https://bomberspt.pushpress.com/landing/plans/plan_ada350b903102e'
};

const PT_SESSION_BLOCK_LINKS = {
  SINGLE: 'https://bomberspt.pushpress.com/landing/appointments/apptpkg_43a0ca0ee01f62b06bdb24efe6ad',
  BLOCK4: 'https://bomberspt.pushpress.com/landing/appointments/apptpkg_811e5ad94cfcb50136d9e808b21a',
  BLOCK12: 'https://bomberspt.pushpress.com/landing/appointments/apptpkg_2131741d001216901f57e1a73dc4',
  BLOCK24: 'https://bomberspt.pushpress.com/landing/appointments/apptpkg_b9cbff9aa701a0a367f8c8155265'
};

const STRONG_MUMS_LABEL = 'Strong Mums pre-requisites';

const INFORMED_CONSENT_KEY = TAGS.INFORMED_CONSENT || 'informed consent signed';

function getPriceFromLookup(path, fallback) {
  if (!Array.isArray(path) || !path.length || !window.PRICE_LOOKUP) {
    return fallback || '';
  }
  let value = window.PRICE_LOOKUP;
  for (let i = 0; i < path.length; i += 1) {
    const key = path[i];
    if (!value || typeof value !== 'object' || !(key in value)) {
      value = null;
      break;
    }
    value = value[key];
  }
  if (value == null || value === '') {
    return fallback || '';
  }
  return value;
}
window.getPriceFromLookup = getPriceFromLookup;

// Standalone Membership Page URL (used for "View membership options")
// In dev: relative file; in production: set to hosted URL of the standalone page
const MEMBERSHIP_PAGE_URL = '';

// Manual override configuration
const manualOverrideMap = {
  consultation_questionnaire: TAGS.CONSULT_DONE,
  intro_meeting: TAGS.NSI_BOOKED,
  online_induction: TAGS.INDUCTION_DONE,
  mark_purchased_1to1: TAGS.PURCHASED_1TO1,
  mark_booked_1to1: TAGS.BOOKED_1TO1,
  mark_attended_1to1: TAGS.ATTENDED_1TO1,
  proxy_booked_1to1: TAGS.ONBOARDING_PROXY,
  session_debrief: TAGS.DEBRIEF_DONE,
  mark_appt_checkin: TAGS.APPT_CHECKIN,
  informed_consent: TAGS.INFORMED_CONSENT,
  setup_wodup: TAGS.WODUP_DONE,
  enquiry_form: TAGS.ENQUIRY_FORM_SUBMITTED,
  download_app: TAGS.APP_DOWNLOADED,
  par_q_completed: TAGS.PARQ_SUBMITTED,
  par_q_skip: TAGS.PARQ_SKIP,
  bp_skip: TAGS.BP_SKIP,
  intro_meeting_booked: TAGS.NSI_BOOKED,
  intro_meeting_attended: TAGS.INTRO_ATTENDED
};

// Terms & Conditions Library
// anchor: config.TERMS_LIBRARY
const TERMS_LIBRARY = {
  "membership t&cs signed": {
    label: "Membership T&Cs",
    title: "Membership Terms & Conditions",
    signatureFieldId: FIELDS.MEMBERSHIP_TCS_SIGNATURE,
    sections: [
      {
        heading: "📋 Membership Agreement",
        bullets: [
          "Your membership is a rolling monthly contract",
          "Minimum commitment: 3 months from your membership start date",
          "After 3 months, you can cancel anytime with 1 month's notice",
          "Payments are taken via Direct Debit on your chosen billing date"
        ]
      },
      {
        heading: "💳 Payment Terms",
        bullets: [
          "Membership fees are non-refundable",
          "Failed payments may result in membership suspension",
          "Price changes require 30 days' notice",
          "Annual price review each January"
        ]
      },
      {
        heading: "⏸ Pause policy",
        bullets: [
          "Notice required: 28 days",
          "Fee-free pause: First 14 days",
          "After 2 weeks: £3.00/week",
          "Pause requests with less than 28 days notice will not be processed"
        ]
      }
    ],
    acknowledgements: [
      {
        fieldId: FIELDS.MEMBERSHIP_PAUSE_NOTICE_ACK,
        text: "I understand that pausing my membership requires 28 days notice, and if I have not given 28 days notice, my pause request will not be processed. *",
        value: "I understand"
      },
      {
        fieldId: FIELDS.MEMBERSHIP_PAUSE_CHARGE_ACK,
        text: "I understand that additional pause time over 14 days will be charged automatically at £3.00/week, regardless of whether your membership is paused for part of the week or the entire week. *",
        value: "I understand"
      },
      {
        fieldId: FIELDS.MEMBERSHIP_RESUME_ACK,
        text: "I understand that my membership will resume usual billing interval automatically. *",
        value: "Yes"
      }
    ]
  },
  "class t&cs signed": {
    label: "Gym & Access T&Cs",
    title: "Gym Access & Cancellation Terms",
    signatureFieldId: "5bVYurhRCdbbcNe8xnKj",
    sections: [
      {
        heading: "📆 Class Registrations",
        bullets: [
          "If you can no longer attend a class that you are registered for, you must unregister. This opens the space for someone else to attend."
        ]
      },
      {
        heading: "⏰ Late Cancellation",
        bullets: [
          "You can cancel any time up to 3 hours before the start time of a class and your credit will be returned automatically.",
          "Cancelling within 3 hours of the start time counts as a late cancellation — the session pass will automatically be lost."
        ]
      },
      {
        heading: "❌ No-Shows",
        bullets: [
          "If you no-show to a class, your session pass will be lost and you will be charged a £2.50 fee."
        ]
      },
      {
        heading: "✅ Checking In (Classes)",
        bullets: [
          "It is your responsibility to check in for classes using the Bombers app or tablets by each entrance.",
          "Failure to check in will result in being marked as a no-show."
        ]
      },
      {
        heading: "🏋️ Open Gym Guidelines",
        bullets: [
          "You do not need to pre-register for open gym.",
          "Check in using the tablets at each entrance every time you train.",
          "Failure to check in means you’ll miss out on earning Bombers Points."
        ]
      },
      {
        heading: "Pause Policy",
        bullets: [
          "All membership pauses require 28 days’ notice.",
          "The first 14 days of any pause are free of charge.",
          "After the initial 14 days, a fee of £3.00 per week applies.",
          "Pause requests submitted with less than 28 days’ notice will not be processed.",
          "Pause fees apply regardless of whether the membership is paused for part of a week or a full week.",
          "Your membership will automatically resume normal billing at the end of your pause period."
        ],
        confirmationMode: 'bullets',
        confirmations: [
          {
            id: 'pause_notice',
            fieldId: FIELDS.MEMBERSHIP_PAUSE_NOTICE_ACK,
            value: 'I understand'
          },
          {
            id: 'pause_free',
            value: 'Confirmed'
          },
          {
            id: 'pause_fee',
            fieldId: FIELDS.MEMBERSHIP_PAUSE_CHARGE_ACK,
            value: 'I understand'
          },
          {
            id: 'pause_late',
            value: 'Confirmed'
          },
          {
            id: 'pause_scope',
            value: 'Confirmed'
          },
          {
            id: 'pause_resume',
            fieldId: FIELDS.MEMBERSHIP_RESUME_ACK,
            value: 'Yes'
          }
        ]
      },
      {
        heading: "Cancellation policy",
        bullets: [
          "Once your membership begins billing, our cancellation policy applies.",
          "All membership cancellations require 28 days’ notice.",
          "This means one final payment will be taken after submitting your cancellation request.",
          "Your plan will remain active, and you will continue to have access until the end of that billing period.",
          "If you are planning to cancel, do not wait until after a payment has been taken, as another payment will still be due during your notice period.",
          "By proceeding, you confirm that you have read and understand this policy."
        ],
        confirmationMode: 'bullets',
        confirmations: [
          { id: 'cancel_policy', value: 'Confirmed' },
          { id: 'cancel_notice', value: 'Confirmed' },
          { id: 'cancel_payment', value: 'Confirmed' },
          { id: 'cancel_access', value: 'Confirmed' },
          { id: 'cancel_timing', value: 'Confirmed' },
          { id: 'cancel_ack', value: 'Confirmed' }
        ]
      },
      {
        heading: "Plan activation terms",
        bullets: [
          "I understand my chosen membership activates on the agreed start date and bills every 28 days.",
          "I understand my first 28 days act as a cooling-off period and I can cancel at any time during that window.",
          "I understand that after the cooling-off period, cancellations require 28 days notice and one final payment may still be taken.",
          "I understand that if I do not submit notice, my membership will continue to renew automatically."
        ],
        confirmationMode: 'bullets',
        confirmations: [
          { id: 'trial_term_1', value: 'Confirmed' },
          { id: 'trial_term_2', value: 'Confirmed' },
          { id: 'trial_term_3', value: 'Confirmed' },
          { id: 'trial_term_4', value: 'Confirmed' }
        ]
      },
      {
        heading: "Annual Price Review",
        bullets: [
          "Bombers Physical Training reviews membership pricing annually to stay in line with operating costs, inflation, and ongoing improvements.",
          "Membership prices will be adjusted no more than once per calendar year, effective from January 1st.",
          "Any change will be communicated to members at least 30 days in advance via email or official member channels.",
          "Continuing membership after a price adjustment means you accept the revised rates."
        ],
        confirmations: [
          { id: 'annual_price_ack', value: 'I understand', text: 'I understand and accept the annual price review policy.' }
        ]
      }
    ]
  },
  "trial t&cs signed": {
    label: "Plan activation terms",
    title: "Plan Activation Terms",
    signatureFieldId: null,
    sections: [
      {
        heading: "Plan Activation Terms",
        bullets: [
          "I understand my chosen membership activates on the agreed start date and bills every 28 days.",
          "I understand my first 28 days act as a cooling-off period and I can cancel at any time during that window.",
          "I understand that after the cooling-off period, cancellations require 28 days notice and one final payment may still be taken.",
          "I understand that if I do not submit notice, my membership will continue to renew automatically."
        ]
      },
      {
        heading: "Annual Price Review",
        bullets: [
          "Bombers Physical Training reviews membership pricing annually to stay in line with operating costs, inflation, and ongoing improvements.",
          "Membership prices will be adjusted no more than once per calendar year, effective from January 1st.",
          "Any change will be communicated to members at least 30 days in advance via email or official member channels.",
          "Continuing membership after a price adjustment means you accept the revised rates."
        ]
      }
    ]
  },
  [INFORMED_CONSENT_KEY]: {
    label: "Informed Consent",
    title: "BombersPT Informed Consent",
    signatureFieldId: FIELDS.INFORMED_CONSENT_SIGNATURE,
    sections: [
      {
        heading: "Slide 1 — Program Overview",
        bullets: [
          "Exercises to improve your heart, lungs, muscles, and flexibility.",
          "Activities may include walking, running, crawling, lifting, throwing, and bodyweight movements.",
          "Goals may include reducing body fat and improving muscle strength and endurance."
        ]
      },
      {
        heading: "Slide 2 — Potential Risks",
        bullets: [
          "Everyone responds to exercise differently — changes in heart rate, blood pressure, or other reactions can occur.",
          "There is a small risk of injury such as muscle strain or joint discomfort.",
          "These risks can be reduced by warming up properly, progressing gradually, and following your coach’s guidance."
        ]
      },
      {
        heading: "Slide 3 — Responsibility & Liability",
        bullets: [
          "You are participating voluntarily and at your own risk.",
          "Bombers Physical Training Ltd, its staff, and agents are not liable for injuries or damages sustained during training or use of equipment.",
          "You accept full responsibility for your safety during all sessions."
        ]
      },
      {
        heading: "Slide 4 — Health Declaration",
        bullets: [
          "You are in good physical condition and free from any condition that would make exercise unsafe.",
          "Any relevant health issues have been disclosed on your PAR-Q form.",
          "You understand that if you have doubts about your health or experience any issues, you should stop and seek medical advice."
        ]
      },
      {
        heading: "Slide 5 — Consent & Agreement",
        bullets: [
          "You have read and understood the information presented.",
          "You release Bombers Physical Training Ltd from any present or future claims related to your participation.",
          "You consent to take part in this fitness program."
        ]
      }
    ]
  },
  "par-q submitted": {
    label: "PAR-Q Form",
    title: "Physical Activity Readiness Questionnaire",
    signatureFieldId: FIELDS.PARQ_SIGNATURE,
    sections: [
      {
        heading: "🏥 Health Declaration",
        bullets: [
          "I confirm all health information provided is accurate",
          "I will inform BombersPT of any changes to my health status",
          "I understand I may need GP clearance for certain conditions",
          "I take responsibility for my own health and safety during exercise"
        ]
      }
    ]
  },
  "dd mandate signed": {
    label: "DD Mandate",
    title: "Direct Debit Mandate",
    signatureFieldId: FIELDS.DD_MANDATE_SIGNATURE,
    sections: [
      {
        heading: "💳 Direct Debit Authorization",
        bullets: [
          "I authorize BombersPT to collect payments via Direct Debit",
          "I understand payments will be taken on my chosen billing date",
          "I can cancel this mandate at any time through my bank",
          "I'm protected by the Direct Debit Guarantee"
        ]
      }
    ]
  }  ,
  "annual price review signed": {
    label: "Annual Price Review",
    title: "Annual Price Review",
    signatureFieldId: null,
    sections: [
      {
        heading: "Annual price review policy",
        bullets: [
          "Membership prices may be adjusted once per calendar year, effective 1st January.",
          "Any adjustment will be communicated at least 30 days in advance via official channels.",
          "By continuing membership beyond the effective date, members accept the revised rates."
        ]
      }
    ]
  }
  ,
  "card on file agreement": {
    label: "Card on File",
    title: "Card on File Agreement",
    signatureFieldId: FIELDS.DD_MANDATE_SIGNATURE,
    sections: [
      {
        heading: "Before you purchase your Initial 1-1",
        bullets: [
          "By purchasing your initial 1-1 you’re also setting up your saved payment method inside our membership platform."
        ]
      },
      {
        heading: "What you’re agreeing to",
        bullets: [
          "Your card details are stored securely via Stripe in line with PCI DSS standards.",
          "We may charge your card for membership fees, personal training sessions, retail purchases, or no-show/late cancellation fees."
        ]
      },
      {
        heading: "Receipts & communication",
        bullets: [
          "You’ll receive an email receipt for every charge.",
          "We’ll always let you know before charging for anything unexpected."
        ]
      },
      {
        heading: "How long this lasts",
        bullets: [
          "This authorisation stays in place until all payments are settled, after which we remove your saved card details from our system."
        ]
      }
    ]
  }

};

// Export to global scope for compatibility
window.FIELDS = FIELDS;
window.TAGS = TAGS;
window.MEMBERSHIP_PRICES = MEMBERSHIP_PRICES;
window.PLAN_LINKS = PLAN_LINKS;
window.DROPIN_PASS_LINKS = DROPIN_PASS_LINKS;
window.STRONG_MUMS_LABEL = STRONG_MUMS_LABEL;
window.manualOverrideMap = manualOverrideMap;
window.TERMS_LIBRARY = TERMS_LIBRARY;
window.MEMBERSHIP_PAGE_URL = MEMBERSHIP_PAGE_URL;
window.CONSULT_FIELDS = CONSULT_FIELDS;
window.PARQ_STORAGE_FIELD = PARQ_STORAGE_FIELD;
window.PARQ_LEGACY_STORAGE_FIELD = PARQ_LEGACY_STORAGE_FIELD;
window.PARQ_QUESTIONS = PARQ_QUESTIONS;
window.PARQ_FIELD_IDS = PARQ_FIELD_IDS;
window.PARQ_QUESTION_LOOKUP = PARQ_QUESTION_LOOKUP;
