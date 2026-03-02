(function() {
// anchor: trial-week.showModal
function showTrialWeekModal() {
    const modal = document.getElementById('trial-week-modal');
    if (!modal || modal.nodeType !== 1) return;

    // Render the trial week content
    renderTrialWeekContent();

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeTrialWeekModal() {
    const modal = document.getElementById('trial-week-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  const safeSetHTML = window.safeSetHTML || ((node, html) => {
    if (node && node.nodeType === 1) {
      node.innerHTML = html;
    }
  });
  const escapeHtml = window.escapeHtml || function(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const PLAN_LABEL_TO_VALUE = {
    'Open Gym': 'opengym',
    'Classic': 'classic',
  };
const PLAN_TYPE_LABELS = {
  trial: 'Membership plan',
  kickstart: 'KickStart Programme',
  foundations: 'Foundations Programme'
};
const OPEN_GYM_ADDON_LINKS = {
  full: 'https://bomberspt.pushpress.com/landing/plans/plan_55ff5fdcd034e2/eyJkaXNjb3VudF9zbHVnIjoiNzE5ZSJ9/login',
  offpeak: 'https://bomberspt.pushpress.com/landing/plans/plan_bd2b0235eab54e/eyJkaXNjb3VudF9zbHVnIjoiNzE5ZSJ9/login'
};
const OPEN_GYM_REFERRAL_LINKS = {
  full: 'https://bomberspt.pushpress.com/landing/plans/plan_55ff5fdcd034e2/eyJkaXNjb3VudF9zbHVnIjoiZGM4NCJ9',
  offpeak: 'https://bomberspt.pushpress.com/landing/plans/plan_bd2b0235eab54e/eyJkaXNjb3VudF9zbHVnIjoiZGM4NCJ9'
};
const COACHED_UNLIMITED_LINK = 'https://bomberspt.pushpress.com/landing/plans/plan_576adb7f3c904f';
const COACHED_UNLIMITED_WITH_GYM_LINK = 'https://bomberspt.pushpress.com/landing/plans/plan_6a9c2d44e0b147';
const COACHED_3WEEK_WITH_GYM_LINK = 'https://bomberspt.pushpress.com/landing/plans/plan_f66a3a5ff8d548';
const COACHED_REFERRAL_LINKS = {
  THREE_WEEK: 'https://bomberspt.pushpress.com/landing/plans/plan_a61ebd39392641/eyJkaXNjb3VudF9zbHVnIjoiZGM4NCJ9',
  THREE_WEEK_ADDON: 'https://bomberspt.pushpress.com/landing/plans/plan_f66a3a5ff8d548/eyJkaXNjb3VudF9zbHVnIjoiZGM4NCJ9',
  UNLIMITED: 'https://bomberspt.pushpress.com/landing/plans/plan_576adb7f3c904f/eyJkaXNjb3VudF9zbHVnIjoiZGM4NCJ9',
  UNLIMITED_ADDON: 'https://bomberspt.pushpress.com/landing/plans/plan_6a9c2d44e0b147/eyJkaXNjb3VudF9zbHVnIjoiZGM4NCJ9'
};
const COACHED_ADDON_TAG = 'Add-on requested - open gym';
const CONDITIONAL_OPEN_GYM_DISCOUNT_LINKS = {
  ONE_CYCLE: 'https://bomberspt.pushpress.com/landing/plans/plan_55ff5fdcd034e2/eyJkaXNjb3VudF9zbHVnIjoiNzkzNSJ9',
  TWO_CYCLES: 'https://bomberspt.pushpress.com/landing/plans/plan_55ff5fdcd034e2/eyJkaXNjb3VudF9zbHVnIjoiOTA0ZCJ9',
  THREE_CYCLES: 'https://bomberspt.pushpress.com/landing/plans/plan_55ff5fdcd034e2/eyJkaXNjb3VudF9zbHVnIjoiNTU3ZiJ9'
};
function hasCertifiedReferralFlag() {
  const label = window.OPPORTUNITY_LABELS?.CERTIFIED_REFERRAL;
  if (!label) return false;
  const normalized = String(label).trim().toLowerCase();
  const checkSets = [
    window._remoteChecklistSet,
    window._checklistFieldState?.normalizedSet,
    window._opportunityChecklistState?.normalizedSet
  ];
  return checkSets.some(set => set instanceof Set && set.has(normalized));
}
function getReferralPlanLink(optionId, defaultLink) {
  if (!hasCertifiedReferralFlag()) return defaultLink;
  if (optionId === 'coached-3') return COACHED_REFERRAL_LINKS.THREE_WEEK;
  if (optionId === 'coached-unlimited') return COACHED_REFERRAL_LINKS.UNLIMITED;
  if (optionId === 'open-247') return OPEN_GYM_REFERRAL_LINKS.full;
  if (optionId === 'open-offpeak') return OPEN_GYM_REFERRAL_LINKS.offpeak;
  return defaultLink;
}
function getCoachedAddonLink(optionId) {
  if (optionId === 'coached-3') {
    return hasCertifiedReferralFlag() ? COACHED_REFERRAL_LINKS.THREE_WEEK_ADDON : COACHED_3WEEK_WITH_GYM_LINK;
  }
  if (optionId === 'coached-unlimited') {
    return hasCertifiedReferralFlag() ? COACHED_REFERRAL_LINKS.UNLIMITED_ADDON : COACHED_UNLIMITED_WITH_GYM_LINK;
  }
  return '';
}
  const PLAN_SELECTOR_GROUPS = [
    {
      id: 'coached',
      label: 'Coached group training',
      copy: 'Memberships for Blueprint, Strong Mums, Foundations, and the coached timetable.',
      allowAddon: true,
      addons: [
        {
          id: 'addon-upgrade-unlimited',
          title: 'Upgrade to unlimited coached sessions',
          description: 'Switch your plan to unlimited coached sessions.',
          priceText: '+£10 / 4 weeks',
          type: 'upgrade',
          upgradePlanId: 'coached-unlimited'
        },
        {
          id: 'addon-opengym',
          title: 'Add 24/7 open gym access',
          description: 'Usually £65.76.',
          priceText: '+£10 / 4 weeks',
          type: 'tag',
          tag: COACHED_ADDON_TAG
        }
      ],
      dropins: [
        {
          id: 'coached-single',
          title: 'Single session',
          description: 'One coached session.',
          pricePath: ['classes', 'dropins', 'single'],
          fallbackPrice: '£14.50',
          linkKey: 'CLASS_SINGLE_PASS'
        },
        {
          id: 'coached-block4',
          title: 'Block of 4',
          description: '4 coached sessions.',
          pricePath: ['classes', 'dropins', 'block4'],
          fallbackPrice: '£49.50',
          linkKey: 'CLASS_BLOCK4_PASS'
        }
      ],
      options: [
        {
          id: 'coached-3',
          title: 'Core',
          description: '• Up to 3 coached sessions per week.',
          pricePath: ['classes', 'recurring', 'twelvePer4Weeks'],
          fallbackPrice: '£87.50',
          linkKey: 'CLASSIC',
          supportsAddon: true
        },
        {
          id: 'coached-unlimited',
          title: 'Unlimited',
          description: '• Unlimited Coached Group training sessions.',
          fallbackPrice: '£97.50',
          link: COACHED_UNLIMITED_LINK,
          supportsAddon: true,
          isUpgrade: true
        }
      ]
    },
    {
      id: 'opengym',
      label: 'Open Gym',
      copy: '24/7 access memberships for self-led training.',
      allowAddon: false,
      dropins: [
        {
          id: 'open-day',
          title: 'Day pass',
          description: 'One-day access.',
          pricePath: ['openGym', 'dropins', 'day'],
          fallbackPrice: '£12.85',
          linkKey: 'DAY_PASS'
        },
        {
          id: 'open-week',
          title: 'Week pass',
          description: '7 days of access.',
          pricePath: ['openGym', 'dropins', 'week'],
          fallbackPrice: '£30.00',
          linkKey: 'WEEK_PASS'
        },
        {
          id: 'open-4week',
          title: '4-week pass',
          description: 'Access for 4 weeks.',
          pricePath: ['openGym', 'dropins', 'fourWeek'],
          fallbackPrice: '£80.00',
          linkKey: 'FOUR_WEEK_PASS'
        }
      ],
      options: [
        {
          id: 'open-247',
          title: '24/7 access',
          description: 'Unlimited gym access plus programming support.',
          pricePath: ['openGym', 'recurring', 'openGym'],
          fallbackPrice: '£65.76 / 4 weeks',
          linkKey: 'OPEN_GYM',
          supportsAddon: false
        },
        {
          id: 'open-offpeak',
          title: 'Off-peak access',
          description: 'Weekdays 10:30–15:30 plus 24/7 weekends.',
          pricePath: ['openGym', 'recurring', 'offPeak'],
          fallbackPrice: '£50.10 / 4 weeks',
          linkKey: 'OPEN_GYM_OFF_PEAK',
          supportsAddon: false
        }
      ]
    },
    {
      id: 'pt',
      label: 'Personal training',
      copy: 'PT session blocks with guaranteed coaching and flexible scheduling.',
      allowAddon: true,
      addons: [
        {
          id: 'addon-opengym',
          title: 'Add open gym access (50% discount)',
          description: 'Add open gym access for the duration of your block. This is a recurring open gym plan which will rebill every 4 weeks.',
          priceText: '+£10 / 4 weeks',
          type: 'tag',
          tag: COACHED_ADDON_TAG
        }
      ],
      options: [
        {
          id: 'pt-single',
          title: 'Single PT session',
          description: 'One personalised 1:1 session.',
          fallbackPrice: '£60.00',
          link: PT_SESSION_BLOCK_LINKS.SINGLE,
          supportsAddon: false
        },
        {
          id: 'pt-block-4',
          title: '4-session block',
          description: '4 sessions, expires in 4 weeks.',
          fallbackPrice: '£210.00',
          link: PT_SESSION_BLOCK_LINKS.BLOCK4,
          supportsAddon: true
        },
        {
          id: 'pt-block-12',
          title: '12-session block',
          description: '12 sessions, expires in 12 weeks.',
          fallbackPrice: '£600.00',
          link: PT_SESSION_BLOCK_LINKS.BLOCK12,
          supportsAddon: true
        },
        {
          id: 'pt-block-24',
          title: '24-session block',
          description: '24 sessions, expires in 24 weeks.',
          fallbackPrice: '£1,140.00',
          link: PT_SESSION_BLOCK_LINKS.BLOCK24,
          supportsAddon: true
        }
      ]
    }
  ];

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const TRIAL_CANCEL_REASON_OPTIONS = [
    'Financial reasons',
    'Moving location / too far to travel',
    'Schedule/timing doesn’t work',
    'Not using membership enough',
    'Prefer training elsewhere',
    'Injury/health issue',
    'Didn’t get the results I hoped for'
  ];

  const TRIAL_CANCEL_CHANGE_OPTIONS = [
    'Price',
    'Class times',
    'More coaching support',
    'More accountability',
    'Different type of training'
  ];

  let latestTrialState = null;

  function lookupPrice(path, fallback) {
    if (typeof window.getPriceFromLookup === 'function') {
      return window.getPriceFromLookup(path, fallback);
    }
    return fallback || '';
  }

  function parsePriceValue(text) {
    if (!text) return null;
    const cleaned = String(text).replace(/,/g, '');
    const match = cleaned.match(/([\d.]+)/);
    if (!match) return null;
    const value = parseFloat(match[1]);
    return Number.isFinite(value) ? value : null;
  }

  function formatCurrency(value) {
    if (!Number.isFinite(value)) return '';
    return `£${value.toFixed(2)}`;
  }

  function buildAddonOptionsHtml(customOptions) {
    const options = Array.isArray(customOptions) && customOptions.length
      ? customOptions
      : (() => {
        const openGymPriceText = lookupPrice(['openGym', 'recurring', 'openGym'], '£65.76 / 4 weeks');
        const offPeakPriceText = lookupPrice(['openGym', 'recurring', 'offPeak'], '£50.10 / 4 weeks');
        const openGymValue = parsePriceValue(openGymPriceText);
        const offPeakValue = parsePriceValue(offPeakPriceText);
        const openGymDiscountValue = openGymValue ? openGymValue / 2 : 32.88;
        const offPeakDiscountValue = offPeakValue ? offPeakValue / 2 : 25.05;
        const openGymSavings = openGymValue ? openGymValue - openGymDiscountValue : openGymDiscountValue;
        const offPeakSavings = offPeakValue ? offPeakValue - offPeakDiscountValue : offPeakDiscountValue;

        return [
          {
            id: 'addon-247',
            title: 'Add 24/7 open gym access',
            priceText: `${formatCurrency(openGymDiscountValue)} / 4 weeks`,
            savingsText: `Save ${formatCurrency(openGymSavings)} every 4 weeks`,
            link: OPEN_GYM_ADDON_LINKS.full
          },
          {
            id: 'addon-offpeak',
            title: 'Add off-peak open gym access',
            priceText: `${formatCurrency(offPeakDiscountValue)} / 4 weeks`,
            savingsText: `Save ${formatCurrency(offPeakSavings)} every 4 weeks`,
            link: OPEN_GYM_ADDON_LINKS.offpeak
          }
        ];
      })();

    return options.map(option => `
      <button type="button" class="plan-addon-card"
        data-plan-addon-option="${escapeHtml(option.id)}"
        data-plan-title="${escapeHtml(option.title)}"
        data-plan-price="${escapeHtml(option.priceText || '')}"
        data-plan-link="${option.link ? escapeHtml(option.link) : ''}"
        data-plan-tag="${option.tag ? escapeHtml(option.tag) : ''}"
        style="flex:1 1 220px;border:1px solid #d6e0f2;border-radius:12px;padding:0.9rem;background:#fff;box-shadow:0 4px 14px rgba(31,60,136,0.08);display:flex;flex-direction:column;gap:0.4rem;align-items:flex-start;text-align:left;">
        <div style="font-weight:600;color:#1f3c88;">${escapeHtml(option.title)}</div>
        <div style="color:#4b5671;font-size:0.9rem;">${escapeHtml(option.priceText || '')}</div>
        ${option.savingsText ? `<div style="color:#1f3c88;font-size:0.85rem;">${escapeHtml(option.savingsText)}</div>` : ''}
        <span style="margin-top:0.4rem;font-size:0.85rem;color:#4b5671;">Click to add</span>
      </button>
    `).join('');
  }

  function formatShortDate(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '—';
    const day = String(date.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[date.getMonth()] || '';
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function startOfDay(date) {
    if (!(date instanceof Date)) return null;
    const copy = new Date(date.getTime());
    copy.setHours(0, 0, 0, 0);
    return copy;
  }

  function addDays(date, days) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    const copy = new Date(date.getTime());
    copy.setDate(copy.getDate() + (Number.isFinite(days) ? days : 0));
    return copy;
  }

  function getNormalizedTags(contact) {
    const tags = Array.isArray(contact?.tags) ? contact.tags : [];
    return new Set(tags.map(tag => (tag || '').toLowerCase()));
  }

  function getPlanValue(label) {
    return PLAN_LABEL_TO_VALUE[label] || 'classic';
  }

  function buildOnboardingPackagesHtml(contactId) {
    const encodedId = contactId ? encodeURIComponent(contactId) : '';
    const contactSuffix = encodedId ? `?contactId=${encodedId}` : '';
    return `
      <div class="trial-card trial-card--surface trial-card--packages">
        <div class="trial-packages__intro">
          <div>
            <h2 class="trial-packages__title">On-boarding packages</h2>
            <p class="trial-packages__subtitle">Guarantee success in your fitness journey</p>
          </div>
          <button type="button" class="trial-packages__cta" onclick="window.showOnboardingInfoModal && window.showOnboardingInfoModal()">Learn more</button>
        </div>
        <div class="trial-packages__grid">
          <div class="trial-package">
            <h3 class="trial-package__name">Foundations Programme - £249</h3>
            <ul class="trial-package__list">
              <li>6 x 1-1 PT sessions</li>
              <li>6 week progressive programme (2-3 sessions/week)</li>
            </ul>
            <a href="https://bomberspt.pushpress.com/landing/plans/plan_8b67cc80186b41${contactSuffix}" target="_blank" class="trial-package__link">Select Foundations Programme</a>
          </div>
          <div class="trial-package">
            <h3 class="trial-package__name">KickStart Programme - £95</h3>
            <ul class="trial-package__list">
              <li>2 x 1-1 PT sessions</li>
              <li>2 week skill/technique/confidence builder (3 sessions/week)</li>
            </ul>
            <a href="https://bomberspt.pushpress.com/landing/plans/plan_44c620deeffd4e${contactSuffix}" target="_blank" class="trial-package__link">Select KickStart Programme</a>
          </div>
        </div>
      </div>
    `;
  }

  function buildPlanLinks(contactId) {
    const encoded = contactId ? encodeURIComponent(contactId) : '';
    const suffix = encoded ? `?contactId=${encoded}` : '';
    return {
      trial: encoded ? `https://bomberspt.pushpress.com/landing/plans/plan_954ea24d4a36a1/login?contactId=${encoded}` : 'https://bomberspt.pushpress.com/landing/plans/plan_954ea24d4a36a1/login',
      kickstart: `https://bomberspt.pushpress.com/landing/plans/plan_44c620deeffd4e${suffix}`,
      foundations: `https://bomberspt.pushpress.com/landing/plans/plan_8b67cc80186b41${suffix}`
    };
  }

  function getTrialIntentStorageKey(contactId) {
    return contactId ? `trialStartIntent:${contactId}` : null;
  }

  function loadTrialStartIntent(contactId) {
    const key = getTrialIntentStorageKey(contactId);
    if (!key || typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function persistTrialStartIntent(contactId, value) {
    const key = getTrialIntentStorageKey(contactId);
    if (!key || typeof localStorage === 'undefined') return;
    try {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    } catch (_) {
      // ignore storage failures silently
    }
  }


  function mapCustomFieldEntries(raw) {
    let entries = [];
    if (Array.isArray(raw)) {
      entries = raw;
    } else if (raw && Array.isArray(raw.customField)) {
      entries = raw.customField;
    } else if (raw && Array.isArray(raw.customFields)) {
      entries = raw.customFields;
    }
    const out = {};
    entries.forEach(item => {
      if (item && item.id) {
        out[item.id] = item.value;
      }
    });
    return out;
  }

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  function getTrialChoiceStorageKey(contactId) {
    return contactId ? `trialChoice:${contactId}` : null;
  }

  function loadTrialChoiceType(contactId) {
    const key = getTrialChoiceStorageKey(contactId);
    if (!key || typeof localStorage === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (_) {
      return null;
    }
  }

  function persistTrialChoiceType(contactId, type) {
    const key = getTrialChoiceStorageKey(contactId);
    if (!key || typeof localStorage === 'undefined') return;
    try {
      if (type) {
        localStorage.setItem(key, type);
      } else {
        localStorage.removeItem(key);
      }
    } catch (_) {}
  }

  function determinePlanType(planNameRaw, planCategoryRaw) {
    const name = (planNameRaw || '').toLowerCase();
    const category = (planCategoryRaw || '').toLowerCase();
    if (name.includes('kickstart')) return 'kickstart';
    if (name.includes('foundations')) return 'foundations';
    if (category === 'trial' || name.includes('trial')) return 'trial';
    return null;
  }

  async function pollTrialMembershipFields(expected, options) {
    const fetchContact = window.fetchContact;
    const contactId = window.contactId;
    if (typeof fetchContact !== 'function' || !contactId) return false;

    const cfg = options || {};
    const maxAttempts = Number.isInteger(cfg.maxAttempts) ? cfg.maxAttempts : 5;
    const delayMs = Number.isFinite(cfg.delayMs) ? cfg.delayMs : 1200;
    const FIELDS = window.FIELDS || {};

    const normalizeBill = (value) => {
      if (value == null) return '';
      return String(value).trim().replace(/^£/, '');
    };

    const expectedPlan = expected?.plan || '';
    const expectedPrepay = expected?.prepay || '';
    const expectedBill = normalizeBill(expected?.firstBillAmount);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const data = await fetchContact(contactId);
        const contact = data.contact || {};
        const fields = mapCustomFieldEntries(contact.customFields || contact.customField || data.customField);

        window._latestContact = contact;
        window._latestContactFields = fields;
        window._latestGhlRaw = data;

        const currentPlan = fields[FIELDS.FUTURE_PLAN] || '';
        const currentPrepay = fields[FIELDS.PAY_12_OPEN] || '';
        const currentBill = normalizeBill(fields[FIELDS.FIRST_BILL_AMOUNT]);

        const matches = currentPlan === expectedPlan &&
          currentPrepay === expectedPrepay &&
          currentBill === expectedBill;

        if (matches) {
          return true;
        }
      } catch (err) {
        console.warn('[Trial Week] Poll failed to fetch contact', err);
      }

      if (attempt < maxAttempts - 1) {
        await wait(delayMs);
      }
    }

    return false;
  }

  function deriveTrialState() {
    const contact = window._latestContact || {};
    const fields = window._latestContactFields || {};
    const FIELDS = window.FIELDS || {};
    const getField = (id) => (id && fields[id]) ? fields[id] : '';

    const normalizedTags = getNormalizedTags(contact);
    const checklistFlags = window._latestChecklistFlags || {};
    const hasChecklistFlag = (label) => !!(label && checklistFlags[label]);
    const openGymTag = (window.TAGS?.OPEN_GYM_TCS || 'open gym t&cs signed').toLowerCase();
    const trialTcsTag = (window.TAGS?.TRIAL_TCS || 'trial t&cs signed').toLowerCase();
    const annualTag = (window.TAGS?.ANNUAL_PRICE_REVIEW || 'annual price review signed').toLowerCase();

    const gymChecklistComplete = hasChecklistFlag(window.OPPORTUNITY_LABELS?.GYM_TCS);
    const trialChecklistComplete = hasChecklistFlag(window.OPPORTUNITY_LABELS?.TRIAL_TCS);
    const classDocsComplete = normalizedTags.has('class t&cs signed') && normalizedTags.has(openGymTag);
    const trialDocsComplete = normalizedTags.has(trialTcsTag) && normalizedTags.has(annualTag);

    const gymTcsComplete = gymChecklistComplete || classDocsComplete;
    const trialTcsComplete = trialChecklistComplete || trialDocsComplete;
    const stageComplete = gymTcsComplete && trialTcsComplete;

    const trialStartRaw = getField(FIELDS.TRIAL_START);
    const billDateRaw = getField(FIELDS.BILL_DATE);
    const membershipDeadlineRaw = getField(FIELDS.MEMBERSHIP_SELECTION_DEADLINE);
    const futurePlanRaw = getField(FIELDS.FUTURE_PLAN) || 'Classic';
    const prepayRaw = getField(FIELDS.PAY_12_OPEN) || 'No';
    const firstBillRaw = getField(FIELDS.FIRST_BILL_AMOUNT) || '';

    const trialStartDate = parseDate(trialStartRaw);
    const billDate = parseDate(billDateRaw);
    const membershipDeadlineDate = parseDate(membershipDeadlineRaw);

    const firstName = (contact.firstName || '').trim();
    const greetingName = firstName || 'there';

    const trialStartDisplay = trialStartDate ? formatShortDate(trialStartDate) : '—';
    const billDateDisplay = billDate ? formatShortDate(billDate) : '—';

    let daysLeftDisplay = '—';
    let fillPercent = 0;
    if (trialStartDate && billDate) {
      const today = startOfDay(new Date());
      const billDay = startOfDay(billDate);
      const startDay = startOfDay(trialStartDate);
      if (today && billDay && startDay) {
        const totalMs = billDay - startDay;
        const remainingMs = billDay - today;
        let daysLeft = Math.ceil(remainingMs / 86400000);
        if (daysLeft < 0) daysLeft = 0;
        daysLeftDisplay = daysLeft;
        if (totalMs > 0) {
          const progress = 1 - Math.max(0, Math.min(remainingMs, totalMs)) / totalMs;
          fillPercent = Math.max(0, Math.min(100, progress * 100));
        }
      }
    }

    let deadlineDays = null;
    let deadlineHasPassed = false;
    if (membershipDeadlineDate) {
      const today = startOfDay(new Date());
      const deadlineDay = startOfDay(membershipDeadlineDate);
      if (today && deadlineDay) {
        let diff = Math.ceil((deadlineDay - today) / 86400000);
        if (diff < 0) diff = 0;
        deadlineDays = diff;
        deadlineHasPassed = false;
      }
    }

    const normalizedFirstBill = firstBillRaw ? String(firstBillRaw).replace(/^£/, '') : '';
    const defaultPlanPrice = window.MEMBERSHIP_PRICES?.classic || 0;
    const seedKey = window.contactId || contact.id || '';
    window._trialDefaultBillApplied = window._trialDefaultBillApplied || {};
    if (!normalizedFirstBill && defaultPlanPrice && window.updateFieldsBatch && seedKey && !window._trialDefaultBillApplied[seedKey]) {
      window._trialDefaultBillApplied[seedKey] = true;
      window.updateFieldsBatch(seedKey, [{ id: FIELDS.FIRST_BILL_AMOUNT, value: defaultPlanPrice.toFixed(2) }]).catch(err => {
        console.warn('[Trial Week] Failed to seed default first bill amount', err);
      });
    }
    const firstBillDisplay = normalizedFirstBill
      ? `£${normalizedFirstBill}`
      : (defaultPlanPrice ? `£${defaultPlanPrice.toFixed(2)}` : '—');
    const planStatusRaw = getField(FIELDS.PLAN_STATUS);
    const planCategoryRaw = getField(FIELDS.PLAN_CATEGORY);
    const planNameChangedRaw = getField(FIELDS.PLAN_NAME_LAST_CHANGED);
    const planCreditsRaw = getField(FIELDS.PLAN_CREDITS);
    const trialPlanNames = ['7 day trial', 'programme: 6 week foundations', 'programme: 2 week kickstart'];
    const planNameNormalized = (futurePlanRaw || '').trim().toLowerCase();
    const canonicalPlanName = planNameNormalized === 'classic - open gym add on (free)' ? 'classic' : planNameNormalized;
    const planStatusNormalized = (planStatusRaw || '').trim().toLowerCase();
    const planCategoryNormalized = (planCategoryRaw || '').trim().toLowerCase();
    const planTypeFromFields = determinePlanType(planNameNormalized, planCategoryNormalized);
    const planMatchesTrial = trialPlanNames.includes(canonicalPlanName);
    const planStatusActive = planStatusNormalized === 'active';
    const planCategoryTrial = planCategoryNormalized === 'trial';
    const trialPlanActive = planStatusActive && planCategoryTrial && planMatchesTrial;

    const serviceInterestField = window.CONSULT_FIELDS?.serviceInterest;
    const serviceInterestRaw = serviceInterestField ? String(fields[serviceInterestField] || '').toLowerCase() : '';
    const serviceTypeField = window.CONSULT_FIELDS?.serviceType;
    const serviceTypeRaw = serviceTypeField ? String(fields[serviceTypeField] || '').toLowerCase() : '';
    const joinClassesField = window.CONSULT_FIELDS?.joinClasses;
    const joinClassesRaw = joinClassesField ? String(fields[joinClassesField] || '').toLowerCase() : '';

    let leadPreference = 'mixed';
    if (serviceTypeRaw.includes('coach')) {
      leadPreference = 'classes';
    } else if (serviceTypeRaw.includes('open')) {
      if (joinClassesRaw.includes('yes')) {
        leadPreference = 'classes';
      } else if (joinClassesRaw.includes('maybe')) {
        leadPreference = 'mixed';
      } else if (joinClassesRaw.includes('no')) {
        leadPreference = 'opengym';
      } else {
        leadPreference = 'opengym';
      }
    } else if (!serviceTypeRaw) {
      if (serviceInterestRaw.includes('class')) {
        leadPreference = 'classes';
      } else if (serviceInterestRaw.includes('open')) {
        leadPreference = 'opengym';
      }
    }
    const contactId = window.contactId || contact.id || '';
    const startIntent = loadTrialStartIntent(contactId);
    const checklistFlag = window.OPPORTUNITY_LABELS?.TRIAL_TYPE_CHOSEN;
    const fieldAcknowledged = checklistFlag && window._latestChecklistFlags
      ? !!window._latestChecklistFlags[checklistFlag]
      : false;
    const storedChoiceType = loadTrialChoiceType(contactId);
    const overrideType = window._trialSelectionOverrideType || null;
    if (planTypeFromFields && contactId) {
      persistTrialChoiceType(contactId, planTypeFromFields);
    }
    const selectionAcknowledged = !!(planTypeFromFields || fieldAcknowledged || storedChoiceType || window._trialSelectionOverride);
    const selectionType = planTypeFromFields || storedChoiceType || overrideType || null;
    const debriefInsights = typeof window.loadDebriefInsights === 'function'
      ? window.loadDebriefInsights(contactId)
      : null;
    const selectedPlanType = selectionType || 'trial';
    window._latestTrialPlanType = selectedPlanType;

    return {
      contact,
      fields,
      stageComplete,
      gymTcsComplete,
      trialTcsComplete,
      combinedTcsComplete: gymTcsComplete && trialTcsComplete,
      timeline: {
        greetingName,
        startDate: trialStartDisplay,
        billDate: billDateDisplay,
        daysLeftDisplay,
        progressPercent: fillPercent
      },
      summary: {
        plan: futurePlanRaw,
        prepay: prepayRaw === 'Yes' ? 'Yes' : 'No',
        firstBillDisplay,
        defaultedToClassic: !normalizedFirstBill && !!defaultPlanPrice
      },
      planStatus: planStatusRaw || '',
      planCategory: planCategoryRaw || '',
      planNameChangedAt: planNameChangedRaw || '',
      planCredits: planCreditsRaw || '',
      trialPlanActive,
      deadline: {
        hasDeadline: !!membershipDeadlineDate,
        hasPassed: deadlineHasPassed,
        daysDisplay: deadlineDays != null ? deadlineDays : '—'
      },
      formDefaults: {
        plan: getPlanValue(futurePlanRaw),
        prepay: prepayRaw === 'Yes' ? 'yes' : 'no'
      },
      contactId,
      debriefInsights,
      leadPreference,
      trialStartDate,
      startIntent: startIntent || null,
      selectionAcknowledged,
      selectedPlanType
    };
  }

  function renderTcsCard(state) {
    const intent = state.startIntent === 'yes' ? 'yes' : state.startIntent === 'no' ? 'no' : null;
    const introCopy = 'Please carefully read and sign these T&Cs relating to:';
    const links = buildPlanLinks(state.contactId);
    const planType = state.selectedPlanType || 'trial';
    const planLabel = PLAN_TYPE_LABELS[planType] || PLAN_TYPE_LABELS.trial;
    const planLink = planType === 'kickstart'
      ? links.kickstart
      : planType === 'foundations'
        ? links.foundations
        : links.trial;

    const combinedComplete = state.gymTcsComplete && state.trialTcsComplete;

    const buttonClass = combinedComplete ? 'btn btn--muted btn--compact' : 'btn next-action-glow';
    const buttonHtml = combinedComplete
      ? `<button type="button" class="${buttonClass} trial-checklist__action" onclick="window.showResponseViewer && window.showResponseViewer('tcs-combined')">View</button>`
      : `<button type="button" class="${buttonClass} trial-checklist__action" onclick="window.showCombinedTcsModal && window.showCombinedTcsModal()">Review &amp; sign</button>`;

    const content = `
      <div class="trial-card trial-card--surface">
        <h2 class="trial-card__title">T&Cs</h2>
        <div class="trial-tnc-intro" style="margin:0 0 0.75rem;font-size:0.95rem;line-height:1.5;">
          <p style="margin:0 0 0.35rem;">${escapeHtml(introCopy)}</p>
          <ul class="trial-tnc-list" style="margin:0;padding-left:1rem;list-style:disc;color:inherit;">
            <li>Your plan selection</li>
            <li>Joining classes</li>
            <li>Using the open gym</li>
            <li>Membership pause &amp; cancellation</li>
          </ul>
        </div>
        <div class="trial-checklist">
          <div class="trial-checklist__row" style="gap:0.75rem;">
            <span class="status-icon">${combinedComplete ? '✅' : '⬜'}</span>
            <div class="trial-checklist__content" style="flex:0 0 auto;">
              ${buttonHtml}
            </div>
          </div>
        </div>
      </div>
    `;

    return content;
  }

	  function renderTimelineCard(state) {
	    return '';
	  }

  function renderPlanSelectorCard(state) {
    if (!state.stageComplete) return '';
    const planLinks = window.PLAN_LINKS || {};
    const startLinks = buildPlanLinks(state.contactId);
    const leadPreference = state.leadPreference || 'mixed';
    const defaultPane = leadPreference === 'classes'
      ? 'coached'
      : leadPreference === 'opengym'
        ? 'opengym'
        : 'coached';

    const tabs = PLAN_SELECTOR_GROUPS.map(group => `
      <button type="button"
        class="plan-selector__tab"
        data-plan-tab="${group.id}">
        <span class="plan-selector__tab-label">${escapeHtml(group.label)}</span>
      </button>
    `).join('');

    const renderPlanOptionCard = (option, price, link, extra = {}) => `
      <div class="plan-option-card plan-option-card--selectable" role="button" tabindex="0"
        data-plan-option="${escapeHtml(option.id)}"
        data-plan-title="${escapeHtml(option.title)}"
        data-plan-desc="${escapeHtml(option.description || '')}"
        data-plan-price="${escapeHtml(price)}"
        data-plan-link="${escapeHtml(link || '')}"
        data-plan-addon-link="${escapeHtml(extra.addonLink || '')}"
        data-plan-addon-amount="${escapeHtml(extra.addonAmount || '')}"
        data-plan-supports-addons="${option.supportsAddon ? '1' : '0'}"
        data-plan-upgrade="${option.isUpgrade ? '1' : '0'}">
        <div class="plan-option-card__main">
          <div>
            <div class="plan-option-card__title">${escapeHtml(option.title)}</div>
            ${option.description ? `<div class="plan-option-card__desc">${extra.allowHtmlDesc ? option.description : escapeHtml(option.description)}</div>` : ''}
          </div>
          ${price ? `
            <div class="plan-option-card__price-block">
              <div class="plan-option-card__price">${escapeHtml(price)}</div>
              ${extra.priceSuffix ? `<div class="plan-option-card__price-suffix">${escapeHtml(extra.priceSuffix)}</div>` : ''}
              ${extra.addonLink ? `
                <button type="button" class="plan-option-card__addon-btn" data-plan-addon-toggle>
                  <span class="plan-option-card__addon-label">Add 24/7 open gym</span>
                  <span class="plan-option-card__addon-price">£10</span>
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
        <span class="plan-option-card__cta">Click to select</span>
      </div>
    `;

    const dropinLinks = window.DROPIN_PASS_LINKS || {};
    const panes = PLAN_SELECTOR_GROUPS.map(group => {
    const dropinsHtml = (group.dropins || []).map(dropin => {
        const price = lookupPrice(dropin.pricePath, dropin.fallbackPrice);
        const baseLink = dropin.link || dropinLinks[dropin.linkKey] || '';
        const link = getReferralPlanLink(dropin.id, baseLink);
        return renderPlanOptionCard(dropin, price, link);
      }).join('');
      const recurringHtml = (group.options || []).map(option => {
        const price = lookupPrice(option.pricePath, option.fallbackPrice);
        const baseLink = option.link || planLinks[option.linkKey] || '';
        const link = getReferralPlanLink(option.id, baseLink);
        const addonLink = group.id === 'coached' ? getCoachedAddonLink(option.id) : '';
        return renderPlanOptionCard(option, price, link, {
          addonLink,
          addonAmount: addonLink ? '10' : '',
          allowHtmlDesc: group.id === 'coached',
          priceSuffix: group.id === 'coached' ? 'every 4 weeks' : ''
        });
      }).join('');

      return `
        <div class="plan-selector__pane" data-plan-pane="${group.id}" data-plan-allow-addon="${group.allowAddon ? '1' : '0'}" style="display:none;">
          <div class="plan-options">
            ${dropinsHtml ? `
              <div class="plan-options__group">
                <div class="plan-options__heading">Drop-ins</div>
                <div class="plan-options__grid">${dropinsHtml}</div>
              </div>
            ` : ''}
            ${recurringHtml ? `
              <div class="plan-options__group plan-options__group--recurring">
                <div class="plan-options__heading">Recurring <span class="plan-options__heading-badge">Every 4 weeks</span></div>
                <div class="plan-options__grid">${recurringHtml}</div>
                ${group.id === 'coached' ? '<p class="plan-options__note">Recurring memberships are billed every <strong>4 weeks</strong>.</p>' : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="trial-card trial-card--surface" id="plan-step-pt" data-plan-step="1">
        <h2 class="trial-card__title" style="margin-bottom:0.35rem;">Step 1: Initial PT packages</h2>
        <p class="trial-card__subcopy" style="margin:0 0 1rem;">Would you like to purchase a small block of PT sessions, at a discounted rate, to continue building confidence and knowledge in the gym?</p>
        <div class="trial-card-grid">
          <a class="plan-option-card" data-pt-step-option data-plan-type="kickstart" data-scroll-target="plan-step-membership" href="${startLinks.kickstart}" target="_blank" rel="noopener">
            <div class="plan-option-card__title">KickStart Programme - £95</div>
            <div class="plan-option-card__desc">2 x 1-1 PT sessions with a 2-week technique/confidence builder.</div>
          </a>
          <a class="plan-option-card" data-pt-step-option data-plan-type="foundations" data-scroll-target="plan-step-membership" href="${startLinks.foundations}" target="_blank" rel="noopener">
            <div class="plan-option-card__title">Foundations Programme - £275</div>
            <div class="plan-option-card__desc">6 x 1-1 PT sessions across 3–6 weeks to build technique fast.</div>
          </a>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1rem;">
          <button type="button" class="btn btn--muted" data-pt-step-option data-plan-type="trial" data-scroll-target="plan-step-membership">No thanks!</button>
        </div>
      </div>

      <div class="trial-card trial-card--surface" id="plan-step-membership" data-plan-step="2" hidden>
        <h2 class="trial-card__title" style="margin-bottom:0.35rem;">Step 2: Choose your plan</h2>
        <p class="trial-card__subcopy" style="margin:0 0 1rem;">Pick your preferred option and you’ll be given a link to set up your plan.</p>
        <div class="plan-selector" data-plan-selector-root data-plan-default="${escapeHtml(defaultPane)}">
          <div class="plan-selector__tabs">
            ${tabs}
          </div>
          ${panes}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-top:1rem;">
          <button type="button" class="btn btn--muted" data-plan-step-action="back" data-scroll-target="plan-step-pt">Back</button>
        </div>
      </div>
    `;
  }

  function initializePlanBuilder(pane) {
    if (!pane || pane.dataset.builderReady === '1') return;
    pane.dataset.builderReady = '1';
    const state = {
      allowAddon: pane.getAttribute('data-plan-allow-addon') === '1',
      plans: new Map(),
      addons: new Map(),
      addonStates: {},
      selectedPlanId: null,
      basePlanId: null
    };
    pane._planState = state;

    pane.querySelectorAll('[data-plan-option]').forEach(optionBtn => {
      const id = optionBtn.getAttribute('data-plan-option');
      if (!id) return;
      state.plans.set(id, {
        id,
        title: optionBtn.getAttribute('data-plan-title') || 'Selected plan',
        description: optionBtn.getAttribute('data-plan-desc') || '',
        priceText: optionBtn.getAttribute('data-plan-price') || '',
        link: optionBtn.getAttribute('data-plan-link') || '',
        supportsAddons: optionBtn.getAttribute('data-plan-supports-addons') === '1',
        isUpgrade: optionBtn.getAttribute('data-plan-upgrade') === '1'
      });
      optionBtn.addEventListener('click', () => selectPlanOption(pane, id));
      optionBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectPlanOption(pane, id);
        }
      });
    });

    pane.querySelectorAll('[data-plan-addon-toggle]').forEach(addonBtn => {
      addonBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        const card = addonBtn.closest('[data-plan-option]');
        if (!card) return;
        const nextState = !addonBtn.classList.contains('is-active');
        setCoachedAddonState(card, nextState);
      });
      addonBtn.setAttribute('aria-pressed', 'false');
    });
  }

  function setCoachedAddonState(card, isActive) {
    if (!card) return;
    const addonBtn = card.querySelector('[data-plan-addon-toggle]');
    const priceEl = card.querySelector('.plan-option-card__price');
    const labelEl = addonBtn?.querySelector('.plan-option-card__addon-label');
    const basePrice = parsePriceValue(card.getAttribute('data-plan-price') || '');
    const addonAmount = Number(card.getAttribute('data-plan-addon-amount') || '0');
    if (!addonBtn || !priceEl || !labelEl || !Number.isFinite(basePrice) || !Number.isFinite(addonAmount)) return;
    addonBtn.classList.toggle('is-active', isActive);
    addonBtn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    labelEl.textContent = isActive ? 'Remove open gym' : 'Add 24/7 open gym';
    priceEl.textContent = formatCurrency(isActive ? basePrice + addonAmount : basePrice);
    card.setAttribute('data-addon-selected', isActive ? '1' : '0');
  }

  function resolvePlanLink(plan, card) {
    const useAddonLink = card?.getAttribute('data-addon-selected') === '1';
    if (useAddonLink) {
      return card?.getAttribute('data-plan-addon-link') || '';
    }
    return getReferralPlanLink(plan.id, plan.link || '');
  }

  function getPurchaseModalUpsellConfig(plan, card) {
    if (!plan || !card) return null;
    const addonSelected = card.getAttribute('data-addon-selected') === '1';
    if (plan.id === 'coached-3' && !addonSelected) {
      return {
        type: 'open-gym',
        inactiveLabel: 'Add 24/7 open gym access for just £10',
        resolveLink: () => card.getAttribute('data-plan-addon-link') || ''
      };
    }
    if (plan.id === 'coached-3' && addonSelected) {
      return {
        type: 'upgrade-unlimited',
        inactiveLabel: 'Add unlimited coached sessions for £10',
        resolveLink: () => hasCertifiedReferralFlag() ? COACHED_REFERRAL_LINKS.UNLIMITED_ADDON : COACHED_UNLIMITED_WITH_GYM_LINK
      };
    }
    if (plan.id === 'coached-unlimited' && !addonSelected) {
      return {
        type: 'open-gym',
        inactiveLabel: 'Add 24/7 open gym access for just £10',
        resolveLink: () => card.getAttribute('data-plan-addon-link') || ''
      };
    }
    return null;
  }

  function ensurePlanPurchaseModal() {
    let modal = document.getElementById('plan-purchase-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'plan-purchase-modal';
    modal.className = 'info-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="info-modal-content plan-purchase-modal__content">
        <button class="close-button" type="button" aria-label="Close" onclick="window.closePlanPurchaseModal && window.closePlanPurchaseModal()">×</button>
        <div id="plan-purchase-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    return modal;
  }

  function openPlanPurchaseModal(pane, plan, card) {
    const modal = ensurePlanPurchaseModal();
    const body = document.getElementById('plan-purchase-modal-body');
    if (!modal || !body || !plan || !card) return;
    const title = plan.title || 'this plan';
    const addonSelected = card.getAttribute('data-addon-selected') === '1';
    const upsellConfig = getPurchaseModalUpsellConfig(plan, card);
    let modalUpsellActive = false;
    safeSetHTML(body, `
      <div class="plan-purchase-modal">
        <h3 class="plan-purchase-modal__title">Continue to purchase "${escapeHtml(title)}"</h3>
        ${upsellConfig ? `
          <button type="button" class="plan-purchase-modal__upsell" data-plan-purchase-upsell>
            <span class="plan-purchase-modal__upsell-copy">${escapeHtml(upsellConfig.inactiveLabel)}</span>
          </button>
        ` : ''}
        <div class="plan-purchase-modal__actions">
          <button type="button" class="btn btn--muted" data-plan-purchase-cancel>Cancel</button>
          <button type="button" class="btn btn--primary" data-plan-purchase-confirm>Continue to purchase</button>
        </div>
      </div>
    `);
    const upsellBtn = body.querySelector('[data-plan-purchase-upsell]');
    const cancelBtn = body.querySelector('[data-plan-purchase-cancel]');
    const confirmBtn = body.querySelector('[data-plan-purchase-confirm]');
    const restoreCardState = () => {
      if (upsellConfig && upsellConfig.type === 'open-gym') {
        setCoachedAddonState(card, addonSelected);
      }
    };
    if (upsellBtn) {
      upsellBtn.addEventListener('click', () => {
        modalUpsellActive = !modalUpsellActive;
        if (upsellConfig.type === 'open-gym') {
          setCoachedAddonState(card, modalUpsellActive ? true : addonSelected);
        }
        upsellBtn.classList.toggle('is-active', modalUpsellActive);
        upsellBtn.querySelector('.plan-purchase-modal__upsell-copy').textContent = upsellConfig.inactiveLabel;
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        restoreCardState();
        closePlanPurchaseModal();
      });
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        let planLink = resolvePlanLink(plan, card);
        if (upsellConfig && modalUpsellActive) {
          planLink = upsellConfig.resolveLink();
        }
        closePlanPurchaseModal();
        if (planLink) {
          window.open(planLink, '_blank', 'noopener');
        }
      });
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closePlanPurchaseModal() {
    const modal = document.getElementById('plan-purchase-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function selectPlanOption(pane, optionId) {
    const state = pane._planState;
    if (!state) return;
    const plan = state.plans.get(optionId);
    if (!plan) return;
    state.selectedPlanId = optionId;
    if (!plan.isUpgrade) {
      state.basePlanId = optionId;
    } else if (!state.basePlanId) {
      state.basePlanId = optionId;
    }
    pane.querySelectorAll('[data-plan-option]').forEach(btn => {
      btn.classList.toggle('plan-option-card--active', btn.getAttribute('data-plan-option') === optionId);
    });
    const selectedCard = pane.querySelector(`[data-plan-option="${optionId}"]`);
    openPlanPurchaseModal(pane, plan, selectedCard);
  }

  function bindPlanSelectorInteractions(root) {
    if (!root) return;
    const selectors = root.querySelectorAll('[data-plan-selector-root]');
    selectors.forEach(selector => {
      if (selector.dataset.bound === '1') return;
      selector.dataset.bound = '1';
      const tabs = Array.from(selector.querySelectorAll('[data-plan-tab]'));
      const panes = Array.from(selector.querySelectorAll('.plan-selector__pane'));
      const defaultPane = selector.getAttribute('data-plan-default') || 'coached';

      const activatePane = (paneId) => {
        panes.forEach(pane => {
          const match = pane.getAttribute('data-plan-pane') === paneId;
          pane.style.display = match ? '' : 'none';
          if (match) {
            initializePlanBuilder(pane);
          }
        });
      };

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const target = tab.getAttribute('data-plan-tab');
          tabs.forEach(btn => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-pressed', 'false');
          });
          tab.classList.add('is-active');
          tab.setAttribute('aria-pressed', 'true');
          activatePane(target);
        });
      });

      panes.forEach(pane => initializePlanBuilder(pane));
      if (panes.length) {
        const initialPaneId = defaultPane;
        const initialTab = tabs.find(tab => tab.getAttribute('data-plan-tab') === initialPaneId);
        if (initialTab) {
          tabs.forEach(btn => {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-pressed', 'false');
          });
          initialTab.classList.add('is-active');
          initialTab.setAttribute('aria-pressed', 'true');
        }
        activatePane(initialPaneId);
      }
    });
  }

  function bindPtStepActions(root) {
    if (!root) return;
    const buttons = root.querySelectorAll('[data-pt-step-option]');
    buttons.forEach(btn => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const planType = btn.getAttribute('data-plan-type');
        if (planType && typeof window.recordTrialSelection === 'function') {
          window.recordTrialSelection(planType);
        }
        const stepOne = root.querySelector('[data-plan-step="1"]');
        const stepTwo = root.querySelector('[data-plan-step="2"]');
        if (stepOne && stepTwo) {
          stepOne.hidden = true;
          stepTwo.hidden = false;
        }
        const scrollTarget = btn.getAttribute('data-scroll-target');
        if (scrollTarget) {
          const targetEl = document.getElementById(scrollTarget);
          if (targetEl && typeof targetEl.scrollIntoView === 'function') {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });

    const stepNavButtons = root.querySelectorAll('[data-plan-step-action]');
    stepNavButtons.forEach(btn => {
      if (btn.dataset.bound === '1') return;
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-plan-step-action');
        const stepOne = root.querySelector('[data-plan-step="1"]');
        const stepTwo = root.querySelector('[data-plan-step="2"]');
        if (!stepOne || !stepTwo) return;
        if (action === 'back') {
          stepTwo.hidden = true;
          stepOne.hidden = false;
        } else if (action === 'next') {
          stepOne.hidden = true;
          stepTwo.hidden = false;
        }
        const scrollTarget = btn.getAttribute('data-scroll-target');
        if (scrollTarget) {
          const targetEl = document.getElementById(scrollTarget);
          if (targetEl && typeof targetEl.scrollIntoView === 'function') {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  function renderTrialStartOptions(state) {
    const timeline = state.timeline || {};
    if (timeline.startDate && timeline.startDate !== '—') {
      return '';
    }

    const contactSuffix = state.contactId ? `?contactId=${encodeURIComponent(state.contactId)}` : '';
    const sevenDayBase = 'https://bomberspt.pushpress.com/landing/plans/plan_954ea24d4a36a1/login';
    const sevenDayUrl = state.contactId ? `${sevenDayBase}?contactId=${encodeURIComponent(state.contactId)}` : sevenDayBase;
    const kickstartUrl = `https://bomberspt.pushpress.com/landing/plans/plan_44c620deeffd4e${contactSuffix}`;
    const foundationsUrl = `https://bomberspt.pushpress.com/landing/plans/plan_8b67cc80186b41${contactSuffix}`;

    return `
      <div class="trial-card trial-card--highlight" style="padding:1.6rem;">
        <h3 class="trial-card__subtitle" style="margin-bottom:1rem;">Choose how you want to get started</h3>
        <div style="display:flex;flex-direction:column;gap:18px;">
          <div style="border:1px solid #d6e0f2;border-radius:12px;padding:18px;background:#fff;display:flex;flex-direction:column;gap:16px;">
            <div>
              <div style="font-weight:700;color:#1f3c88;font-size:1.05rem;">Activate membership plan</div>
              <p style="margin:0.4rem 0 0;color:#5b657a;font-size:0.95rem;">Go live on your chosen membership with a 28-day cooling-off period.</p>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <a class="btn btn--primary" style="justify-content:center;align-self:flex-start;min-width:200px;" href="${sevenDayUrl}" target="_blank" rel="noopener">Activate membership plan</a>
              <button type="button" class="btn" style="justify-content:center;align-self:flex-start;min-width:170px;" data-learn-more-target="trial-seven" aria-expanded="false">Learn more</button>
            </div>
            <div data-learn-more-panel="trial-seven" style="display:none;color:#5b657a;font-size:0.92rem;line-height:1.5;">
              <ul style="margin:0;padding-left:1.1rem;">
                <li>Immediate access to coached sessions and 24/7 open gym.</li>
                <li>Your first 28 days are a cooling-off period—cancel anytime in that window.</li>
                <li>Afterwards, cancellations just need 28 days notice.</li>
              </ul>
            </div>
          </div>
          <div style="border:1px solid #d6e0f2;border-radius:12px;padding:18px;background:#fff;display:flex;flex-direction:column;gap:16px;">
            <div>
              <div style="font-weight:700;color:#1f3c88;font-size:1.05rem;">KickStart (2 sessions)</div>
              <p style="margin:0.4rem 0 0;color:#5b657a;font-size:0.95rem;">Two initial PT sessions for focused coaching to kick-start your training with confidence.</p>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <a class="btn btn--primary" style="justify-content:center;align-self:flex-start;min-width:200px;" href="${kickstartUrl}" target="_blank" rel="noopener">Book 2-session intensive</a>
              <button type="button" class="btn" style="justify-content:center;align-self:flex-start;min-width:170px;" data-learn-more-target="trial-kickstart" aria-expanded="false">Learn more</button>
            </div>
            <div data-learn-more-panel="trial-kickstart" style="display:none;color:#5b657a;font-size:0.92rem;line-height:1.5;">
              <ul style="margin:0;padding-left:1.1rem;">
                <li>Book two PT sessions to kick-start your training with confidence.</li>
                <li>Best if you're ready to start but want to boost your confidence and knowledge.</li>
                <li>No homework, no app—just focused PT time with your coach.</li>
              </ul>
              <button type="button" class="btn btn--muted" style="margin-top:0.5rem;width:100%;justify-content:center;" onclick="window.showOnboardingPackagesModal && window.showOnboardingPackagesModal()">See full package details</button>
            </div>
          </div>
          <div style="border:1px solid #d6e0f2;border-radius:12px;padding:18px;background:#fff;display:flex;flex-direction:column;gap:16px;">
            <div>
              <div style="font-weight:700;color:#1f3c88;font-size:1.05rem;">Foundations (6 sessions)</div>
              <p style="margin:0.4rem 0 0;color:#5b657a;font-size:0.95rem;">A six-session PT-led programme to build technique and confidence quickly.</p>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              <a class="btn btn--primary" style="justify-content:center;align-self:flex-start;min-width:200px;" href="${foundationsUrl}" target="_blank" rel="noopener">Book 6-session intensive</a>
              <button type="button" class="btn" style="justify-content:center;align-self:flex-start;min-width:170px;" data-learn-more-target="trial-foundations" aria-expanded="false">Learn more</button>
            </div>
            <div data-learn-more-panel="trial-foundations" style="display:none;color:#5b657a;font-size:0.92rem;line-height:1.5;">
              <ul style="margin:0;padding-left:1.1rem;">
                <li>6 x 1-1 PT sessions across 3–6 weeks.</li>
                <li>Coach-led experience from start to finish—turn up and train.</li>
              </ul>
              <button type="button" class="btn btn--muted" style="margin-top:0.5rem;width:100%;justify-content:center;" onclick="window.showOnboardingPackagesModal && window.showOnboardingPackagesModal()">See full package details</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderMembershipSection(state) {
    return '';
  }

  function renderOnboardingPackages(state) {
    return '';
  }

  function renderTrialIntentCard(state) {
    const choice = state.startIntent === 'yes' || state.startIntent === 'no' ? state.startIntent : null;
    const links = buildPlanLinks(state.contactId);
    const yesClass = choice === 'yes' ? 'btn btn--primary' : 'btn';
    const noClass = choice === 'no' ? 'btn btn--primary' : 'btn';

    let message = 'Let us know if you want to activate your plan now or keep it on standby.';
    if (choice === 'yes') {
      message = 'Awesome! Complete the T&Cs below and then hit “Activate plan” to go live immediately.';
    } else if (choice === 'no') {
      message = 'No problem — use the activation link whenever you’re ready. We’ll keep your onboarding progress saved.';
    }

    const laterLink = choice === 'no'
      ? `<div style="margin-top:0.5rem;font-size:0.9rem;"><a href="${links.trial}" target="_blank" rel="noopener">Copy your activation link</a> so you can start when it suits you.</div>`
      : '';

    return `
      <div class="trial-card trial-card--surface">
        <div style="display:flex;flex-direction:column;gap:0.6rem;">
          <div>
            <h3 class="trial-card__subtitle" style="margin-bottom:0.35rem;">Ready to activate your plan?</h3>
            <p class="trial-card__subcopy" style="margin:0;color:#4b5671;">${escapeHtml(message)}</p>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.6rem;">
            <button type="button" class="${yesClass}" style="flex:1 1 180px;justify-content:center;" onclick="window.setTrialStartIntent && window.setTrialStartIntent('yes')">Yes, start now</button>
            <button type="button" class="${noClass}" style="flex:1 1 180px;justify-content:center;" onclick="window.setTrialStartIntent && window.setTrialStartIntent('no')">Not yet</button>
          </div>
          ${laterLink}
        </div>
      </div>
    `;
  }

  function renderOnboardingPackagesModalContent(state) {
    const container = document.getElementById('onboarding-packages-content');
    if (!container || container.nodeType !== 1) return;

    if (!state.stageComplete) {
      safeSetHTML(container, `
        <div class="trial-info-banner trial-info-banner--warning" style="margin:0;">
          Complete the T&Cs in the plan stage to unlock our on-boarding packages.
        </div>
      `);
      return;
    }

    safeSetHTML(container, buildOnboardingPackagesHtml(state.contactId));
  }

  function showOnboardingPackagesModal() {
    const modal = document.getElementById('onboarding-packages-modal');
    if (!modal || modal.nodeType !== 1) return;
    const state = deriveTrialState();
    latestTrialState = state;
    renderOnboardingPackagesModalContent(state);
    modal.style.display = 'flex';
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeOnboardingPackagesModal() {
    const modal = document.getElementById('onboarding-packages-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // anchor: trial-week.renderContent
  function renderTrialWeekContent(target) {
    const container = target || document.getElementById('trial-week-content');
    if (!container || container.nodeType !== 1) return;

    const state = deriveTrialState();

    const leadingCards = [];
    const trailingCards = [];

    const tcsCard = renderTcsCard(state);
    if (tcsCard) {
      if (!(state.gymTcsComplete && state.trialTcsComplete)) {
        leadingCards.push(tcsCard);
      }
    }

    const planSelector = renderPlanSelectorCard(state);
    if (planSelector) {
      leadingCards.push(planSelector);
    }

	    if (state.stageComplete) {
	      leadingCards.push(
	        renderMembershipSection(state),
	        renderOnboardingPackages(state)
	      );
	    }

    const contentHTML = `
      <div class="trial-stage">
        <div class="trial-stage__stack">
          ${leadingCards.concat(trailingCards).filter(Boolean).join('')}
        </div>
      </div>
    `;

    safeSetHTML(container, contentHTML);
    bindPlanSelectorInteractions(container);
    bindPtStepActions(container);
    bindTrialCancelButton(container, state);
  }

  function bindTrialCancelButton(root, state) {
    if (!root) return;
    const btn = root.querySelector('#trial-cancel-btn');
    if (!btn || btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      openTrialCancelModal(state);
    });
  }

  function ensureTrialCancelModal() {
    return document.getElementById('trial-cancel-modal');
  }

  function getPrimaryEmail(contact) {
    if (!contact || typeof contact !== 'object') return '';
    const candidates = [
      contact.email,
      contact.emailAddress,
      contact.Email,
      contact.email_address,
      contact?.contact?.email,
      contact?.contact?.Email,
      contact.primaryEmail
    ];
    const found = candidates.find(val => typeof val === 'string' && val.trim());
    return found ? found.trim() : '';
  }

  function openTrialCancelModal(state) {
    latestTrialState = state || latestTrialState || deriveTrialState();
    const modal = ensureTrialCancelModal();
    if (!modal) return;
    renderTrialCancelModal();
    modal.style.display = 'flex';
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeTrialCancelModal() {
    const modal = ensureTrialCancelModal();
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function renderTrialCancelModal() {
    const state = latestTrialState || deriveTrialState();
    const body = document.getElementById('trial-cancel-body');
    if (!body || body.nodeType !== 1) return;
    const FIELDS = window.FIELDS || {};
    const fields = state?.fields || window._latestContactFields || {};
    const existingReasonRaw = FIELDS.TRIAL_CANCEL_REASON ? (fields[FIELDS.TRIAL_CANCEL_REASON] || '') : '';
    const existingChangesRaw = FIELDS.TRIAL_CANCEL_CHANGE ? (fields[FIELDS.TRIAL_CANCEL_CHANGE] || '') : '';
    const existingReason = existingReasonRaw.trim();
    const existingChangesList = existingChangesRaw ? existingChangesRaw.split(',').map(item => item.trim()).filter(Boolean) : [];
    const reasonIsPreset = existingReason && TRIAL_CANCEL_REASON_OPTIONS.includes(existingReason);
    const reasonCustomValue = reasonIsPreset ? '' : existingReason;
    const changePresetSet = new Set(existingChangesList.filter(item => TRIAL_CANCEL_CHANGE_OPTIONS.includes(item)));
    const changeCustomValues = existingChangesList.filter(item => !changePresetSet.has(item));
    const plannedStart = (state?.timeline?.billDate && state.timeline.billDate !== '—')
      ? state.timeline.billDate
      : 'your planned start date';
    const showFormInitially = !!existingReason || existingChangesList.length > 0;

    const reasonOptionsHtml = TRIAL_CANCEL_REASON_OPTIONS.map(option => {
      const checked = reasonIsPreset && existingReason === option ? 'checked' : '';
      return `
        <label class="trial-cancel-option">
          <input type="radio" name="trial-cancel-reason" value="${escapeHtml(option)}" ${checked}>
          <span>${escapeHtml(option)}</span>
        </label>
      `;
    }).join('');

    const changeOptionsHtml = TRIAL_CANCEL_CHANGE_OPTIONS.map(option => {
      const checked = changePresetSet.has(option) ? 'checked' : '';
      return `
        <label class="trial-cancel-option">
          <input type="checkbox" name="trial-cancel-change" value="${escapeHtml(option)}" ${checked}>
          <span>${escapeHtml(option)}</span>
        </label>
      `;
    }).join('');

    const html = `
      <div class="trial-cancel-modal">
        <div id="trial-cancel-intro" style="${showFormInitially ? 'display:none;' : 'display:block;'}">
          <h2 style="margin:0 0 0.75rem;color:#1f3c88;">We're sorry to see you're not looking to continue with us after activating your plan.</h2>
          <p style="margin:0 0 1rem;line-height:1.7;">
            please answer a couple of quick questions to submit your cancellation - this form <strong>MUST</strong> be completed in order to avoid your membership starting to bill on <strong>${escapeHtml(plannedStart)}</strong>
          </p>
          <button type="button" class="btn next-action-glow" data-action="cancel-continue">Continue with cancellation</button>
        </div>
        <form id="trial-cancel-form" style="${showFormInitially ? 'display:block;' : 'display:none;'}">
          <h3 style="margin:0 0 0.75rem;color:#1f3c88;">Cancellation questions</h3>
          <fieldset class="trial-fieldset">
            <legend class="trial-fieldset__legend">What is the main reason you’re considering cancelling? *</legend>
            <div class="trial-cancel-options">
              ${reasonOptionsHtml}
            </div>
            <div style="margin-top:0.6rem;">
              <label for="trial-cancel-reason-custom" style="display:block;margin-bottom:0.25rem;font-weight:500;">Other (please specify)</label>
              <input type="text" id="trial-cancel-reason-custom" class="trial-input" placeholder="Your reason" value="${escapeHtml(reasonCustomValue)}">
            </div>
          </fieldset>
          <fieldset class="trial-fieldset">
            <legend class="trial-fieldset__legend">What would need to change for you to stay? *</legend>
            <div class="trial-cancel-options">
              ${changeOptionsHtml}
            </div>
            <div style="margin-top:0.6rem;">
              <label for="trial-cancel-change-custom" style="display:block;margin-bottom:0.25rem;font-weight:500;">Other (please specify)</label>
              <input type="text" id="trial-cancel-change-custom" class="trial-input" placeholder="What would help you stay?" value="${escapeHtml(changeCustomValues.join(', '))}">
            </div>
          </fieldset>
          <div id="trial-cancel-status" class="trial-form-status"></div>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.75rem;">
            <button type="button" class="btn btn--muted" data-action="cancel-back">Back</button>
            <button type="submit" class="btn btn--danger">Submit cancellation</button>
          </div>
        </form>
      </div>
    `;

    safeSetHTML(body, html);
    bindTrialCancelModalHandlers(body, state);
  }

  function bindTrialCancelModalHandlers(root, state) {
    if (!root) return;
    const introSection = root.querySelector('#trial-cancel-intro');
    const form = root.querySelector('#trial-cancel-form');
    const continueBtn = root.querySelector('[data-action="cancel-continue"]');
    const backBtn = form ? form.querySelector('[data-action="cancel-back"]') : null;

    if (continueBtn && introSection && form) {
      continueBtn.addEventListener('click', (event) => {
        event.preventDefault();
        introSection.style.display = 'none';
        form.style.display = 'block';
      });
    }

    if (backBtn && introSection && form) {
      backBtn.addEventListener('click', (event) => {
        event.preventDefault();
        introSection.style.display = 'block';
        form.style.display = 'none';
        const statusEl = form.querySelector('#trial-cancel-status');
        if (statusEl) safeSetHTML(statusEl, '');
      });
    }

    if (form && !form.dataset.bound) {
      form.dataset.bound = '1';
      form.addEventListener('submit', (event) => {
        handleTrialCancelFormSubmit(event, state);
      });
    }
  }

  async function handleTrialCancelFormSubmit(event, state) {
    event.preventDefault();
    const form = event.target;
    if (!form) return;
    const statusEl = form.querySelector('#trial-cancel-status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const backBtn = form.querySelector('[data-action="cancel-back"]');
    const inputs = Array.from(form.querySelectorAll('input, button, textarea'));
    const FIELDS = window.FIELDS || {};
    const contactId = state?.contactId || window.contactId;
    if (!contactId) {
      if (statusEl) safeSetHTML(statusEl, '<span style="color:#a00;">Missing contact ID.</span>');
      return;
    }

    const selectedReasonRadio = form.querySelector('input[name="trial-cancel-reason"]:checked');
    const reasonCustomInput = form.querySelector('#trial-cancel-reason-custom');
    const reasonCustom = reasonCustomInput ? reasonCustomInput.value.trim() : '';
    let reasonValue = '';
    if (reasonCustom) {
      reasonValue = reasonCustom;
    } else if (selectedReasonRadio && selectedReasonRadio.value) {
      reasonValue = selectedReasonRadio.value;
    }
    if (!reasonValue) {
      if (statusEl) safeSetHTML(statusEl, '<span style="color:#a00;">Please choose a main reason or enter your own.</span>');
      if (reasonCustomInput) reasonCustomInput.focus();
      return;
    }

    const changeCheckboxes = Array.from(form.querySelectorAll('input[name="trial-cancel-change"]:checked'));
    const changeCustomInput = form.querySelector('#trial-cancel-change-custom');
    const changeCustom = changeCustomInput ? changeCustomInput.value.trim() : '';
    const changeValues = changeCheckboxes.map(input => input.value).filter(Boolean);
    if (changeCustom) changeValues.push(changeCustom);
    const uniqueChanges = Array.from(new Set(changeValues));
    if (!uniqueChanges.length) {
      if (statusEl) safeSetHTML(statusEl, '<span style="color:#a00;">Please select at least one option or add your own.</span>');
      if (changeCustomInput) changeCustomInput.focus();
      return;
    }

    inputs.forEach(el => { el.disabled = true; });
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }
    if (backBtn) backBtn.disabled = true;
    if (statusEl) safeSetHTML(statusEl, '<span style="color:#5b657a;">Submitting cancellation...</span>');

    const plannedStart = (state?.timeline?.billDate && state.timeline.billDate !== '—') ? state.timeline.billDate : '';
    const contact = state?.contact || {};
    const contactName = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim() || 'New member';
    const contactEmail = getPrimaryEmail(contact);
    const changesString = uniqueChanges.join(', ');

    let completed = false;

    try {
      const updates = [];
      if (FIELDS.TRIAL_CANCEL_REASON) {
        updates.push({ id: FIELDS.TRIAL_CANCEL_REASON, value: reasonValue });
      }
      if (FIELDS.TRIAL_CANCEL_CHANGE) {
        updates.push({ id: FIELDS.TRIAL_CANCEL_CHANGE, value: changesString });
      }
      if (updates.length) {
        await window.updateFieldsBatch(contactId, updates);
      }

      if (typeof window.addNoteToContact === 'function') {
        const noteLines = [
          'Plan cancellation submitted:',
          `Reason: ${reasonValue}`,
          `Would stay if: ${changesString || 'Not specified'}`
        ];
        if (plannedStart) {
          noteLines.splice(1, 0, `Planned start date: ${plannedStart}`);
        }
        await window.addNoteToContact(contactId, noteLines.join('\n')).catch(() => {});
      }

      const cancelTag = window.TAGS?.CANCEL_REQUEST_SUBMITTED || 'cancellation request submitted';
      if (typeof window.addTagToContact === 'function' && cancelTag) {
        try {
          await window.addTagToContact(contactId, cancelTag);
          if (window._latestContact) {
            const existingTags = Array.isArray(window._latestContact.tags) ? window._latestContact.tags.slice() : [];
            if (!existingTags.some(tag => String(tag).toLowerCase() === cancelTag.toLowerCase())) {
              existingTags.push(cancelTag);
              window._latestContact.tags = existingTags;
            }
          }
        } catch (err) {
          console.error('[TrialWeek] add cancel tag failed', err);
        }
      }

      const successMessage = 'Cancellation submitted. We\'ll review your request and confirm shortly.';
      if (statusEl) safeSetHTML(statusEl, `<span style="color:#1f3c88;">${escapeHtml(successMessage)}</span>`);

      completed = true;

      setTimeout(() => {
        closeTrialCancelModal();
        if (typeof window.renderChecklist === 'function') {
          window.renderChecklist();
        }
      }, 1200);
    } catch (err) {
      console.error('[TrialWeek] cancellation submit failed', err);
      if (statusEl) safeSetHTML(statusEl, `<span style="color:#a00;">${escapeHtml(err?.message || 'Unable to submit cancellation right now.')}</span>`);
    } finally {
      if (!completed) {
        inputs.forEach(el => { el.disabled = false; });
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit cancellation';
        }
        if (backBtn) backBtn.disabled = false;
      }
    }
  }

  async function sendTrialCancellationEmail(details) {
    return false;
  }

  function handleTrialStartIntent(choice) {
    const normalized = choice === 'yes' || choice === 'no' ? choice : null;
    const contactId = window.contactId || window._latestContact?.id || '';
    if (!contactId || !normalized) return;
    persistTrialStartIntent(contactId, normalized);
    renderTrialWeekContent();
  }

  function recordTrialSelection(type) {
    const planType = type || 'trial';
    const contactId = window.contactId || window._latestContact?.id || '';
    window._trialSelectionOverride = true;
    window._trialSelectionOverrideType = planType;
    persistTrialChoiceType(contactId, planType);
    if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS?.TRIAL_TYPE_CHOSEN) {
      window.forceChecklistFlag(window.OPPORTUNITY_LABELS.TRIAL_TYPE_CHOSEN, true);
    }
    renderTrialWeekContent();
  }

  function handleTrialPlanClick(event, planType) {
    if (event && typeof event.preventDefault === 'function' && event.metaKey) {
      // allow default behaviour for cmd-click by not interfering
    }
    recordTrialSelection(planType);
  }

  function advanceTrialSelectionStep() {
    renderTrialWeekContent();
  }

  function forceTrialStepAdvance(planType) {
    const chosenType = planType || window._latestTrialPlanType || 'trial';
    recordTrialSelection(chosenType);
  }

  window.showTrialWeekModal = showTrialWeekModal;
  window.renderTrialWeekInline = function(targetEl) {
    renderTrialWeekContent(targetEl);
  };
  window.closeTrialWeekModal = closeTrialWeekModal;
  window.showOnboardingPackagesModal = showOnboardingPackagesModal;
  window.closeOnboardingPackagesModal = closeOnboardingPackagesModal;
  window.openTrialCancelModal = openTrialCancelModal;
  window.closeTrialCancelModal = closeTrialCancelModal;
  window.setTrialStartIntent = handleTrialStartIntent;
  window.advanceTrialSelection = advanceTrialSelectionStep;
  window.forceTrialStepAdvance = forceTrialStepAdvance;
  window.handleTrialPlanClick = handleTrialPlanClick;
  window.recordTrialSelection = recordTrialSelection;
  window.closePlanPurchaseModal = closePlanPurchaseModal;
})();
