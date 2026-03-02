
(function() {
  // Basic controller for Checklist 5.0 (dev-friendly)
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const THEME_STORAGE_KEY = 'checklist-theme';
  let themeInitialized = false;
  const LOADING_QUOTES = [
    {
      title: '"Bombers" – adj.',
      lines: [
        'Slang word from the British military, meaning “bombproof”.',
        'Used to describe something that is tough or resilient.'
      ]
    }
  ];
  const MIN_LOADING_DISPLAY_MS = 3300;
  let loadingStartedAt = 0;
  let loadingHideTimeout = null;
  function setAppLoadingState(active) {
    const overlay = document.getElementById('app-loading-overlay');
    if (!overlay) return;
    if (active) {
      if (loadingHideTimeout) {
        clearTimeout(loadingHideTimeout);
        loadingHideTimeout = null;
      }
      loadingStartedAt = Date.now();
      applyLoadingQuote();
      overlay.hidden = false;
      document.body.classList.add('app-loading-active');
    } else {
      const elapsed = Date.now() - loadingStartedAt;
      const remaining = Math.max(0, MIN_LOADING_DISPLAY_MS - elapsed);
      loadingHideTimeout = setTimeout(() => {
        overlay.hidden = true;
        document.body.classList.remove('app-loading-active');
        loadingHideTimeout = null;
      }, remaining);
    }
  }

  function applyLoadingQuote() {
    const titleEl = document.getElementById('app-loading-quote-title');
    const bodyEl = document.getElementById('app-loading-quote-body');
    if (!titleEl || !bodyEl) return;
    const quote = LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)] || {};
    titleEl.textContent = quote.title || '';
    const lines = Array.isArray(quote.lines) ? quote.lines : quote.lines ? [quote.lines] : [];
    if (lines.length) {
      bodyEl.innerHTML = lines.map(line => `<p>${window.escapeHtml ? window.escapeHtml(line) : line}</p>`).join('');
    } else if (quote.bodyHtml) {
      bodyEl.innerHTML = quote.bodyHtml;
    } else {
      bodyEl.textContent = quote.body || '';
    }
  }

  function isAppLoadingActive() {
    if (typeof document === 'undefined') return false;
    const overlay = document.getElementById('app-loading-overlay');
    if (overlay && overlay.hidden === false) return true;
    return document.body.classList && document.body.classList.contains('app-loading-active');
  }

  function runAfterAppLoading(fn) {
    if (typeof fn !== 'function') return;
    if (!isAppLoadingActive()) {
      fn();
      return;
    }
    const wait = () => {
      if (!isAppLoadingActive()) {
        fn();
      } else {
        setTimeout(wait, 200);
      }
    };
    setTimeout(wait, 200);
  }

  window.runAfterAppLoading = runAfterAppLoading;
  window.renderStrongMumsFlow = renderStrongMumsFlow;

  function markStrongMumsRedirectHint() {
    try {
      sessionStorage.setItem('strongMums.ptRedirect', '1');
    } catch (_) {}
    window._strongMumsRedirectHint = true;
  }

  function consumeStrongMumsRedirectHint() {
    try {
      const value = sessionStorage.getItem('strongMums.ptRedirect');
      if (!value) return false;
      sessionStorage.removeItem('strongMums.ptRedirect');
      return value === '1';
    } catch (_) {
      return false;
    }
  }

  window.markStrongMumsRedirectHint = markStrongMumsRedirectHint;

  function ensureParqModalShell() {
    let overlay = document.getElementById('consultation-modal-overlay');
    if (overlay) {
      if (!document.body.contains(overlay)) {
        overlay.style.display = 'none';
        document.body.appendChild(overlay);
      }
      return;
    }
    overlay = document.createElement('div');
    overlay.id = 'consultation-modal-overlay';
    overlay.className = 'consultation-modal-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="consultation-modal" role="dialog" aria-modal="true" aria-labelledby="consultation-title">
        <button class="consultation-close" type="button" aria-label="Close">&times;</button>
        <div class="consultation-header">
          <button class="consultation-back" type="button" style="display:none;">&#8592; <span aria-hidden="true">Back</span></button>
          <div class="consultation-progress">Step 1</div>
        </div>
        <div id="consultation-body" class="consultation-body"></div>
        <div class="consultation-actions">
          <button class="btn btn--primary consultation-cta" type="button">Next</button>
          <div class="consultation-spinner">Saving...</div>
          <div class="consultation-error" role="alert"></div>
        </div>
        <div class="consultation-close-confirm">
          <div class="consultation-close-card">
            <h4>Discard progress?</h4>
            <p>If you close now, your answers on this screen will be lost.</p>
            <div class="consultation-close-actions">
              <button type="button" class="btn btn--muted" data-confirm="stay">Continue editing</button>
              <button type="button" class="btn btn--danger" data-confirm="discard">Discard</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  window.ensureParqModalShell = ensureParqModalShell;


  function tagSet(contact) {
    const out = new Set();
    (contact.tags || []).forEach(t => t && out.add(String(t).toLowerCase()));
    return out;
  }


  function applyThemeMode(theme) {
    const isDark = theme === 'dark';
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-mode', isDark);
    }
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      toggle.textContent = isDark ? '☀️ Switch to light mode' : '🌙 Switch to dark mode';
      toggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  function setupThemeToggle() {
    if (!themeInitialized) {
      applyThemeMode('dark');
      themeInitialized = true;
    } else {
      applyThemeMode('dark');
    }
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
  }

  function getTagBool(tags, key) {
    if (!key) return false;
    return tags.has(String(key).toLowerCase());
  }

  function getLatestContactEmail() {
    const contact = window._latestContact || {};
    const candidates = [
      contact.email,
      contact.emailAddress,
      contact.Email,
      contact.email_address,
      contact?.contact?.email,
      contact?.contact?.Email,
      contact.primaryEmail
    ];
    const email = candidates.find(val => typeof val === 'string' && val.trim());
    return email ? email.trim() : '';
  }

  // Parse appointment datetime from mixed sources (GHL / PushPress)
  // Accepts a single string which may be a date, time, or combined date+time.
  function parseApptDateTime(primary, fallback) {
    const tryParse = (s) => {
      if (!s) return null;
      const t = String(s).trim();
      // Support DD-MM-YYYY HH:MM (24h) and MM-DD-YYYY HH:MM (24h)
      let m = t.match(/^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})$/);
      if (m) {
        const [, first, second, yyyy, HH, MM] = m;
        const a = parseInt(first, 10);
        const b = parseInt(second, 10);
        const isoFor = (mm, dd) =>
          `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}T${String(HH).padStart(2, '0')}:${String(MM).padStart(2, '0')}:00`;

        const tryBoth = () => {
          const monthDay = new Date(isoFor(a, b));
          const dayMonth = new Date(isoFor(b, a));
          const monthDayOk = !isNaN(monthDay.getTime());
          const dayMonthOk = !isNaN(dayMonth.getTime());

          if (monthDayOk && !dayMonthOk) return monthDay;
          if (dayMonthOk && !monthDayOk) return dayMonth;
          if (monthDayOk && dayMonthOk) {
            // Ambiguous (e.g. 01-12-YYYY). PushPress fields use MM-DD-YYYY, so prefer month-day.
            return monthDay;
          }
          return null;
        };

        // If one side is clearly a month/day boundary, pick the only valid interpretation.
        if (a > 12 && b <= 12) {
          const d = new Date(isoFor(b, a));
          return isNaN(d.getTime()) ? tryBoth() : d;
        }
        if (b > 12 && a <= 12) {
          const d = new Date(isoFor(a, b));
          return isNaN(d.getTime()) ? tryBoth() : d;
        }
        return tryBoth();
      }
      // Support DD/MM/YYYY with optional time and optional AM/PM
      m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*([APap][Mm])?)?$/);
      if (m) {
        let [, dd, mm, yyyy, hh = '0', min = '0', ap = ''] = m;
        const dayNum = parseInt(dd, 10) || 0;
        const monthNum = parseInt(mm, 10) || 0;
        if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
          let H = parseInt(hh, 10) || 0;
          const M = parseInt(min, 10) || 0;
          if (ap) {
            const up = ap.toUpperCase();
            if (up === 'PM' && H < 12) H += 12;
            if (up === 'AM' && H === 12) H = 0;
          }
          const iso = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}:00`;
          const d = new Date(iso);
          if (!isNaN(d.getTime())) {
            return d;
          }
        }
      }
      // Support MM/DD/YYYY with optional time and optional AM/PM
      m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2})(?::(\d{2}))?\s*([APap][Mm])?)?$/);
      if (m) {
        let [, mm, dd, yyyy, hh = '0', min = '0', ap = ''] = m;
        let H = parseInt(hh, 10) || 0;
        const M = parseInt(min, 10) || 0;
        if (ap) {
          const up = ap.toUpperCase();
          if (up === 'PM' && H < 12) H += 12;
          if (up === 'AM' && H === 12) H = 0;
        }
        const iso = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${String(H).padStart(2,'0')}:${String(M).padStart(2,'0')}:00`;
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
      }
      // Support YYYY-MM-DD or YYYY-MM-DD HH:MM (with space or T)
      m = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2}))?$/);
      if (m) {
        const [, yyyy, mm, dd, HH = '00', MM = '00'] = m;
        const iso = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}T${String(HH).padStart(2,'0')}:${String(MM).padStart(2,'0')}:00`;
        const d = new Date(iso);
        return isNaN(d.getTime()) ? null : d;
      }
      // Fallback to native parsing
      const d = new Date(t);
      return isNaN(d.getTime()) ? null : d;
    };
    let d = tryParse(primary);
    if (!d) d = tryParse(fallback);
    return d || null;
  }

  function formatAppointmentLabel(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
    const month = date.toLocaleDateString('en-GB', { month: 'long' });
    const day = window.ordinal ? window.ordinal(date.getDate()) : String(date.getDate());
    return `${weekday} ${day} ${month}`;
  }

  const introSlotCache = new Map();

  function toIsoSlot(value) {
    if (!value) return '';
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return '';
      if (trimmed.includes('T')) {
        return trimmed.endsWith('Z') ? trimmed : `${trimmed}Z`;
      }
      return `${trimmed.replace(' ', 'T')}Z`;
    }
    if (value instanceof Date && !isNaN(value)) {
      return value.toISOString();
    }
    return '';
  }

  function encodeSlotPayload(slot) {
    if (!slot) return '';
    if (typeof slot === 'string') return encodeURIComponent(slot);
    if (slot && typeof slot === 'object') {
      const iso = toIsoSlot(slot.startTime || slot);
      return iso ? encodeURIComponent(iso) : '';
    }
    return '';
  }

  function formatActionBadge(actionRaw) {
    if (!actionRaw) return '';
    const base = String(actionRaw).replace(/\s+v\d+(?:\.\d+)?$/i, '').trim().toLowerCase();
    const map = {
      'scheduled': { text: 'Scheduled', bg: '#e6f0ff', color: '#0b3d91' },
      'check-in': { text: 'Checked-in', bg: '#e8f5e9', color: '#1b5e20' },
      'rescheduled': { text: 'Rescheduled', bg: '#fff7e6', color: '#ad6800' },
      'canceled': { text: 'Canceled', bg: '#fff1f0', color: '#a8071a' },
      'cancelled': { text: 'Canceled', bg: '#fff1f0', color: '#a8071a' },
      'late cancel': { text: 'Late Cancel', bg: '#fff7e6', color: '#ad6800' },
      'no-show': { text: 'No-show', bg: '#fff1f0', color: '#a8071a' }
    };
    const m = map[base] || { text: actionRaw.replace(/\s+v\d+(?:\.\d+)?$/i,'').trim(), bg: '#eef5ff', color: '#1f3c88' };
   return `<span style="background:${m.bg};color:${m.color};padding:2px 8px;border-radius:10px;font-size:0.85em;">${m.text}</span>`;
  }

  function createViewButton(type) {
    return `<button type="button" class="btn btn--muted btn--compact" onclick="event.stopPropagation(); window.showResponseViewer && window.showResponseViewer('${type}')">View</button>`;
  }

  function isTruthyParam(value) {
    const normalized = String(value ?? '').trim().toLowerCase();
    if (!normalized) return true;
    return !['0', 'false', 'off', 'no'].includes(normalized);
  }

  function isStaffMode() {
    return window && window._staffMode === true;
  }

  function resolveChecklistLabel(node) {
    if (!node || !node.dataset) return '';
    if (node.dataset.checklistLabel) return node.dataset.checklistLabel;
    const key = node.dataset.overrideKey;
    if (!key || !window.OVERRIDE_CHECKLIST_MAP) return '';
    return window.OVERRIDE_CHECKLIST_MAP[key] || '';
  }

  function ensureStaffButtons(root) {
    if (!isStaffMode()) return;
    const scope = (root && root.querySelectorAll) ? root : document;
    if (!scope || typeof scope.querySelectorAll !== 'function') return;
    const nodes = scope.querySelectorAll('[data-override-key], [data-checklist-label]');
    nodes.forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.dataset.staffClearAttached === '1') return;
      const label = resolveChecklistLabel(node);
      if (!label) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'staff-clear-btn';
      btn.textContent = 'Clear';
      btn.dataset.clearFlag = label;
      btn.style.marginLeft = 'auto';
      btn.style.fontSize = '0.78rem';
      btn.style.padding = '4px 10px';
      btn.style.borderRadius = '999px';
      btn.style.border = '1px solid rgba(31,60,136,0.25)';
      btn.style.background = '#f5f7ff';
      btn.style.color = '#1f3c88';
      btn.style.cursor = 'pointer';
      btn.style.flexShrink = '0';
      btn.style.alignSelf = 'center';
      node.appendChild(btn);
      node.dataset.staffClearAttached = '1';
    });
  }

  function handleStaffClear(label, button) {
    if (!label || typeof window.forceChecklistFlag !== 'function') return;
    const originalText = button ? button.textContent : '';
    if (button) {
      button.disabled = true;
      button.textContent = 'Clearing…';
    }
    try {
      setChecklistFlagSuppression(label, true);
      window.forceChecklistFlag(label, false);
      setTimeout(() => {
        if (button) {
          button.disabled = false;
          button.textContent = 'Cleared';
        }
        if (typeof window.renderChecklist === 'function') {
          window.renderChecklist();
        }
      }, 200);
    } catch (err) {
      console.error('[StaffMode] Failed to clear checklist flag', { label, error: err });
      if (button) {
        button.disabled = false;
        button.textContent = originalText || 'Clear';
      }
      alert('Unable to clear this item right now. Please try again.');
    }
  }

  function scheduleChecklistRefresh() {
    if (typeof window.renderChecklist !== 'function') return;
    [400, 1400].forEach(delay => {
      setTimeout(() => {
        if (typeof window.renderChecklist === 'function') {
          window.renderChecklist();
        }
      }, delay);
    });
  }


  function scheduleTagRemoval(tag) {
    if (!tag || typeof window.removeTagFromContact !== 'function' || !window.contactId) return;
    scheduleTagRemoval._pending = scheduleTagRemoval._pending || new Set();
    const key = String(tag).toLowerCase();
    if (scheduleTagRemoval._pending.has(key)) return;
    scheduleTagRemoval._pending.add(key);
    setTimeout(async () => {
      try {
        await window.removeTagFromContact(window.contactId, tag);
      } catch (err) {
        console.warn('[Checklist] Failed to remove tag', tag, err);
      } finally {
        scheduleTagRemoval._pending.delete(key);
      }
    }, 250);
  }

  function capitalizeFirst(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  function lookupPriceValue(path, fallback) {
    if (typeof window.getPriceFromLookup === 'function') {
      return window.getPriceFromLookup(path, fallback);
    }
    return fallback || '';
  }

  function buildEnquirySummaryLines(fieldMap) {
    const C = window.CONSULT_FIELDS || {};
    let serviceRaw = '';
    if (C.serviceType && fieldMap[C.serviceType]) {
      serviceRaw = String(fieldMap[C.serviceType]).trim();
    }
    if (!serviceRaw) return [];
    const serviceLower = serviceRaw.toLowerCase();
    let primary = serviceRaw;
    if (serviceLower.includes('personal')) {
      primary = 'Personal Training';
    } else if (serviceLower.includes('coach')) {
      primary = 'Coached group sessions';
    } else if (serviceLower.includes('open')) {
      primary = 'Open gym access';
    }

    const lines = [primary];
    const joinRaw = C.joinClasses ? String(fieldMap[C.joinClasses] || '').trim() : '';
    const joinLower = joinRaw.toLowerCase();

    const contactTagSet = window._latestContact ? tagSet(window._latestContact) : null;
    const strongContext =
      isStrongMumsLead(fieldMap, contactTagSet) ||
      hasChecklistFieldValue(window._checklistFieldState, STRONG_MUMS_CHECKLIST_LABEL) ||
      hasChecklistFieldValue(window._checklistFieldState, STRONG_MUMS_PT_LABEL) ||
      window._strongMumsRedirectHint === true;

    if (serviceLower.includes('coach')) {
      if (joinLower.includes('yes')) {
        lines.push('With open gym access');
      } else if (joinLower.includes('maybe')) {
        lines.push('Open gym: maybe');
      } else if (joinLower.includes('no')) {
        lines.push('No open gym');
      }
    } else if (serviceLower.includes('open')) {
      if (joinLower) {
        lines.push(`Open gym: ${capitalizeFirst(joinLower)}`);
      }
    }

    if (primary === 'Personal Training' && strongContext) {
      lines.push('Pre / postnatal');
    }

    return lines;
  }

  function isStrongMumsLead(fieldMap, tagsSet) {
    const strongTag = (window.TAGS?.STRONG_MUMS_LEAD || 'strong mums lead').toLowerCase();
    if (tagsSet && tagsSet.has(strongTag)) return true;
    if (!fieldMap) return false;
    const C = window.CONSULT_FIELDS || {};
    const candidates = [];
    if (C.serviceType && fieldMap[C.serviceType]) candidates.push(fieldMap[C.serviceType]);
    if (C.serviceInterest && fieldMap[C.serviceInterest]) candidates.push(fieldMap[C.serviceInterest]);
    const normalized = candidates
      .map(value => (typeof value === 'string' ? value : '')?.toLowerCase?.() || '')
      .filter(Boolean);
    return normalized.some(val => /strong\s*mums|strongmums|supermums/.test(val));
  }

  async function ensureStrongMumsLeadTag(tagSetRef) {
    const tag = window.TAGS?.STRONG_MUMS_LEAD || 'strong mums lead';
    if (!tag || !window.contactId || typeof window.addTagToContact !== 'function') return;
    const normalized = tag.toLowerCase();
    if (tagSetRef && tagSetRef.has(normalized)) return;
    try {
      await window.addTagToContact(window.contactId, tag);
      if (tagSetRef && typeof tagSetRef.add === 'function') {
        tagSetRef.add(normalized);
      }
      if (window._latestContact) {
        const nextTags = Array.isArray(window._latestContact.tags)
          ? window._latestContact.tags.slice()
          : [];
        if (!nextTags.some(existing => String(existing).toLowerCase() === normalized)) {
          nextTags.push(tag);
          window._latestContact.tags = nextTags;
        }
      }
    } catch (err) {
      console.warn('[Checklist] Failed to tag Strong Mums lead', err);
    }
  }

  async function clearStrongMumsLeadTag() {
    const tag = window.TAGS?.STRONG_MUMS_LEAD || 'strong mums lead';
    if (!tag) return;
    const normalized = tag.toLowerCase();
    if (window._latestContact && Array.isArray(window._latestContact.tags)) {
      window._latestContact.tags = window._latestContact.tags.filter(t => String(t).toLowerCase() !== normalized);
    }
    if (window.contactId && typeof window.removeTagFromContact === 'function') {
      try {
        await window.removeTagFromContact(window.contactId, tag);
      } catch (err) {
        console.warn('[Checklist] Unable to remove Strong Mums tag', err);
      }
    } else if (typeof scheduleTagRemoval === 'function') {
      scheduleTagRemoval(tag);
    }
  }

  window.clearStrongMumsLeadTag = clearStrongMumsLeadTag;

  async function resetEnquirySelections() {
    const C = window.CONSULT_FIELDS || {};
    const targetIds = [
      C.serviceType,
      C.serviceInterest,
      C.membershipIntent,
      C.joinClasses,
      C.leadType
    ].filter(Boolean);
    if (!targetIds.length) return;
    const updates = {};
    let needsUpdate = false;
    targetIds.forEach((fieldId) => {
      if (!fieldId) return;
      const currentValue = window._latestContactFields ? window._latestContactFields[fieldId] : '';
      if (currentValue) {
        updates[fieldId] = '';
        needsUpdate = true;
        if (window._latestContactFields) {
          window._latestContactFields[fieldId] = '';
        }
      }
    });
    if (!needsUpdate) return;
    if (typeof window.updateFieldsBatch === 'function' && window.contactId) {
      try {
        await window.updateFieldsBatch(window.contactId, updates);
      } catch (err) {
        console.warn('[Checklist] Failed to reset enquiry selections', err);
      }
    }
  }

  function isClassDropInLead(fieldMap) {
    if (!fieldMap || typeof fieldMap !== 'object') return false;
    const C = window.CONSULT_FIELDS || {};
    const serviceRaw = C.serviceType ? String(fieldMap[C.serviceType] || '').toLowerCase() : '';
    const memberSource = C.membershipIntent ? String(fieldMap[C.membershipIntent] || '') : '';
    const legacySource = C.serviceInterest ? String(fieldMap[C.serviceInterest] || '') : '';
    const memberRaw = (memberSource || legacySource).toLowerCase();
    const isDrop = memberRaw.includes('drop');
    const serviceCoach = serviceRaw.includes('coach');
    const mentionsStrongMums = serviceRaw.includes('strong mums') || legacySource.toLowerCase().includes('strong mums');
    return isDrop && serviceCoach && !mentionsStrongMums;
  }

  function isOpenGymDropInLead(fieldMap) {
    if (!fieldMap || typeof fieldMap !== 'object') return false;
    const C = window.CONSULT_FIELDS || {};
    const serviceRaw = C.serviceType ? String(fieldMap[C.serviceType] || '').toLowerCase() : '';
    const memberSource = C.membershipIntent ? String(fieldMap[C.membershipIntent] || '') : '';
    const legacySource = C.serviceInterest ? String(fieldMap[C.serviceInterest] || '') : '';
    const memberRaw = (memberSource || legacySource).toLowerCase();
    const isDropIn = memberRaw.includes('drop');
    if (!isDropIn) return false;
    const serviceOpen = serviceRaw.includes('open');
    return serviceOpen;
  }

  function renderDropInTakeover(fieldMap) {
    const container = document.getElementById('checklist-container');
    document.body.classList.add('dropin-only');
    document.body.classList.remove('dropin-class');
    const dayPassPrice = lookupPriceValue(['openGym', 'dropins', 'dayPass'], '£12.50');
    const weekPassPrice = lookupPriceValue(['openGym', 'dropins', 'weekPass'], '£30.00');
    const fourWeekPrice = lookupPriceValue(['openGym', 'dropins', 'fourWeekPass'], '£74.00');
    const openGymRecurring = lookupPriceValue(['openGym', 'recurring', 'openGym'], '£65.76 / 4 wks');
    const offPeakRecurring = lookupPriceValue(['openGym', 'recurring', 'offPeak'], '£50.10 / 4 wks');
    const staffAnchor = isStaffMode() ? '<div id="dropin-staff-anchor" class="dropin-staff-anchor"></div>' : '';
    if (container) {
      const safeSet = typeof window.safeSetHTML === 'function'
        ? window.safeSetHTML
        : (node, html) => { node.innerHTML = html; };
      safeSet(container, `
        ${staffAnchor}
        <section class="dropin-page">
          <p class="dropin-eyebrow">Drop-in enquiry</p>
          <h2>Open Gym</h2>
          <p class="dropin-page__lead">Drop in options</p>
          <div class="dropin-actions">
            <button type="button" class="btn btn--muted btn--compact" data-restart-enquiry>Start again</button>
          </div>

          <div class="dropin-block">
            <div class="dropin-block__header">
              <h3>Drop-In Options</h3>
            </div>
            <div class="dropin-card-grid">
              <button type="button" class="dropin-card dropin-card--action" data-dropin-pass="day_pass">
                <div class="dropin-card__title">Day Pass</div>
                <div class="dropin-card__price">${dayPassPrice}</div>
                <p>24/7 access for one day. Valid for 1 day.</p>
              </button>
              <button type="button" class="dropin-card dropin-card--action" data-dropin-pass="week_pass">
                <div class="dropin-card__title">1 Week Pass</div>
                <div class="dropin-card__price">${weekPassPrice}</div>
                <p>Unlimited 24/7 access for 7 days.</p>
              </button>
              <button type="button" class="dropin-card dropin-card--action" data-dropin-pass="four_week_pass">
                <div class="dropin-card__title">4 Week Pass</div>
                <div class="dropin-card__price">${fourWeekPrice}</div>
                <p>Unlimited 24/7 access for 4 weeks.</p>
              </button>
            </div>
          </div>

          <div class="dropin-membership-cta">
            <h3>Interested in joining as a member?</h3>
            <button type="button" class="btn btn--primary" data-start-membership-enquiry>Start membership enquiry</button>
          </div>

          <div class="dropin-block dropin-block--recurring">
            <div class="dropin-block__header">
              <h3>Recurring Options <span>- 🔄 billed every 4 weeks</span></h3>
              <button type="button" class="dropin-discount-btn" data-action="discounts">Discounts</button>
            </div>
            <div class="dropin-card-grid">
              <div class="dropin-card dropin-card--solid" data-plan="24_7">
                <div class="dropin-card__title">24/7 access</div>
                <div class="dropin-card__price">${openGymRecurring}</div>
                <p>Unlimited gym access + programming support.</p>
                <button type="button" class="btn btn--primary dropin-card__cta" data-start-membership-enquiry>Start membership enquiry</button>
              </div>
              <div class="dropin-card dropin-card--solid" data-plan="off_peak">
                <div class="dropin-card__title">Off Peak</div>
                <div class="dropin-card__price">${offPeakRecurring}</div>
                <p>Weekdays 10:30–15:30. 24/7 on weekends.</p>
                <button type="button" class="btn btn--primary dropin-card__cta" data-start-membership-enquiry>Start membership enquiry</button>
              </div>
            </div>
            <div class="dropin-note-banner">⭐ Recurring memberships include onboarding & coaching support</div>
          </div>
        </section>
      `);
    }
  }

  function renderClassDropInTakeover(fieldMap) {
    const container = document.getElementById('checklist-container');
    document.body.classList.add('dropin-only');
    document.body.classList.add('dropin-class');
    const classSinglePrice = lookupPriceValue(['classes', 'dropins', 'single'], '£14.50');
    const classBlockPrice = lookupPriceValue(['classes', 'dropins', 'pack4'], '£49.50');
    const classThreePrice = lookupPriceValue(['classes', 'recurring', 'twelvePer4Weeks'], '£87.50 / 4 wks');
    const classUnlimitedTopUp = lookupPriceValue(['classes', 'upgrades', 'unlimitedTopUp'], '+£10');
    const classOpenGymTopUp = lookupPriceValue(['classes', 'upgrades', 'openGymAddon'], '+£10');
    const staffAnchor = isStaffMode() ? '<div id="dropin-staff-anchor" class="dropin-staff-anchor"></div>' : '';
    if (container) {
      const safeSet = typeof window.safeSetHTML === 'function'
        ? window.safeSetHTML
        : (node, html) => { node.innerHTML = html; };
      safeSet(container, `
        ${staffAnchor}
        <section class="dropin-page">
          <p class="dropin-eyebrow">Coached sessions</p>
          <h2>Coached Group Training drop-ins</h2>
          <div class="dropin-menu-padder"></div>
          <div class="dropin-actions">
            <button type="button" class="btn btn--muted btn--compact" data-restart-enquiry>Start again</button>
          </div>

          <div class="dropin-block dropin-block--info">
            <div class="dropin-block__header">
              <h3>Drop-in Options</h3>
            </div>
            <p class="dropin-note">All new joiners are required to complete a 1-to-1 onboarding session before joining any of our coached group training sessions.</p>
            <div class="dropin-card-grid">
              <button type="button" class="dropin-card dropin-card--action" data-dropin-pass="class_single" data-dropin-disabled="true" aria-disabled="true">
                <div class="dropin-card__title">Single session</div>
                <div class="dropin-card__price">${classSinglePrice || 'Pay-as-you-go'}</div>
                <p>Perfect for testing a Strong Mums, Blueprint, or Foundations class.</p>
              </button>
              <button type="button" class="dropin-card dropin-card--action" data-dropin-pass="class_block4" data-dropin-disabled="true" aria-disabled="true">
                <div class="dropin-card__title">Block of 4</div>
                <div class="dropin-card__price">${classBlockPrice || 'Block price'}</div>
                <p>Lock in four coached sessions to build confidence and momentum.</p>
              </button>
            </div>
            <div class="dropin-membership-cta">
              <h3>Ready to complete your on-boarding session and start dropping in?</h3>
              <button type="button" class="btn btn--primary" data-start-membership-enquiry>Start onboarding</button>
            </div>
            <div class="dropin-membership-cta" style="background:var(--card-bg,#101830);border:1px dashed rgba(255,255,255,0.2);">
              <div style="font-size:0.85rem;color:#f7f9ff;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:0.4rem;">Or</div>
              <h3 style="margin-top:0;color:#f7f9ff;">Drop into Open Gym instead</h3>
              <p style="margin:0 0 0.8rem;color:#f7f9ff;">(no 1-1 required)</p>
              <button type="button" class="btn btn--muted" data-switch-dropins="open-gym">Switch to open gym drop-ins</button>
            </div>
          </div>

          <div class="dropin-block dropin-block--recurring">
            <div class="dropin-block__header">
              <h3>Recurring Options <span>- 🔄 billed every 4 weeks</span></h3>
              <button type="button" class="dropin-discount-btn" data-action="discounts">Discounts</button>
            </div>
            <div class="dropin-card-grid">
              <div class="dropin-card dropin-card--solid dropin-card--stacked" data-plan="classes_3_week">
                <div class="dropin-card__title">3 coached sessions / week</div>
                <div class="dropin-card__price">${classThreePrice}</div>
                <p>Typically 12 coached sessions every 4 weeks.</p>
                <div class="plan-upgrades plan-upgrades--compact">
                  <div class="plan-upgrades__eyebrow">Add upgrades</div>
                  <ul class="plan-upgrades__list">
                    <li class="plan-upgrades__item">
                      <div>
                        <div class="plan-upgrades__label">Upgrade to unlimited classes</div>
                        <div class="plan-upgrades__description">Priority booking & unlimited coached sessions</div>
                      </div>
                      <div class="plan-upgrades__price">${classUnlimitedTopUp}</div>
                    </li>
                    <li class="plan-upgrades__item">
                      <div>
                        <div class="plan-upgrades__label">Add Open Gym access</div>
                        <div class="plan-upgrades__description">24/7 independent training between sessions</div>
                      </div>
                      <div class="plan-upgrades__price">${classOpenGymTopUp}</div>
                    </li>
                  </ul>
                  <p class="plan-upgrades__note">Add-ons billed alongside your membership every 4 weeks.</p>
                </div>
                <button type="button" class="btn btn--primary dropin-card__cta" data-start-membership-enquiry>Start membership enquiry</button>
              </div>
            </div>
            <div class="dropin-note-banner">⭐ Start on 3/week, then bolt on unlimited sessions or 24/7 gym time whenever you need it</div>
          </div>
        </section>
      `);
    }
  }

  const STRONG_MUMS_CHECKLIST_LABEL = window.STRONG_MUMS_LABEL || 'Strong Mums pre-requisites';
  const STRONG_MUMS_PT_LABEL = 'Strong Mums PT Selected';

  const STRONG_MUMS_ITEMS = [
    { key: 'bleeding', label: 'I have stopped bleeding' },
    { key: 'stitches', label: 'My stitches have healed' },
    { key: 'move', label: 'I can move freely without pain' },
    { key: 'steady', label: 'I feel steady on my feet' },
    { key: 'mental', label: 'I am mentally ready' },
    { key: 'ease', label: 'I promise to ease in gently' },
    { key: 'postpartum', label: 'I am at least 12 weeks post partum' }
  ];

  function areStrongMumsPrereqsComplete() {
    return hasChecklistFieldValue(window._checklistFieldState, STRONG_MUMS_CHECKLIST_LABEL);
  }

  function renderStrongMumsFlow(fieldMap) {
    window._strongMumsRedirectHint = false;
    ensureParqModalShell();
    setAppLoadingState(false);
    const container = document.getElementById('checklist-container');
    if (!container) return;
    document.body.classList.add('strong-mums-flow');
    const prereqsComplete = areStrongMumsPrereqsComplete();
    const actionBar = `
      <div class="strong-actions">
        <button type="button" class="btn btn--muted btn--compact" data-restart-enquiry>Start again</button>
      </div>
    `;
    const hero = `
      <header class="strong-hero">
        <p class="strong-eyebrow">Strong Mums</p>
        <h2>Postnatal pathways</h2>
        <p class="strong-lead">Let’s check you’re ready to move, then choose the support that suits you.</p>
      </header>
    `;
    const optionsSection = `
      <section class="strong-step" id="strong-options">
        <h3>Your next step</h3>
        <p class="strong-step-copy">Pick the level of coaching that fits best. We’ll follow up as soon as you choose.</p>
        <div class="strong-card-grid">
          <article class="strong-card strong-card--action" data-strong-action="consult">
            <h4>Post-natal fitness consultation</h4>
            <div class="strong-card__price">£35 · 30 minutes</div>
            <p>Meet a specialist coach, talk through your birth recovery, and outline your first training steps.</p>
          </article>
          <article class="strong-card strong-card--action" data-strong-action="pt">
            <h4>1-1 personal training</h4>
            <div class="strong-card__price">£47.50–£60 per session</div>
            <p>Bespoke sessions with a post-natal coach, flexible scheduling, and gradual progression at your pace.</p>
          </article>
          ${renderStrongMumsGroupCard(prereqsComplete)}
        </div>
        <p class="strong-help-text">Drop us a message via chat or your usual channel to reserve a spot in any option above.</p>
      </section>
    `;

    const bodyHtml = optionsSection;
    container.innerHTML = `<section class="strong-mums-page">${actionBar}${hero}${bodyHtml}</section>`;
    bindStrongMumsCards();
  }

  function renderStrongMumsGroupCard(prereqsComplete) {
    const helperText = prereqsComplete
      ? 'You’re ready to choose the plan that fits best.'
      : 'Complete our quick readiness check before we confirm your place.';
    const status = prereqsComplete
      ? '<span class="strong-status strong-status--ready">✅ Ready to train</span>'
      : '<span class="strong-status strong-status--pending">Takes less than a minute.</span>';
    return `
      <article class="strong-card strong-card--action strong-card--group">
        <h4>Strong Mums group sessions</h4>
        <div class="strong-card__price">£12.38–£14.50 per class</div>
        <p>Join our coached group programme with other mums following the same structured plan.</p>
        <p class="strong-card__helper">${helperText}</p>
        <button type="button" class="btn btn--primary strong-group-button" data-strong-prereq-trigger>Get started</button>
        ${status}
      </article>
    `;
  }

  function bindStrongMumsCards() {
    document.querySelectorAll('[data-strong-action]').forEach(card => {
      if (card.dataset.bound === '1') return;
      card.dataset.bound = '1';
      card.addEventListener('click', () => {
        Promise.resolve(handleStrongCardAction(card.getAttribute('data-strong-action'))).catch(err => {
          console.warn('[StrongMums] card action failed', err);
        });
      });
    });
    const prereqBtn = document.querySelector('[data-strong-prereq-trigger]');
    if (prereqBtn && prereqBtn.dataset.bound !== '1') {
      prereqBtn.dataset.bound = '1';
      prereqBtn.addEventListener('click', (evt) => {
        evt.stopPropagation();
        launchStrongMumsGroupFlow();
      });
    }
  }

  async function handleStrongCardAction(action) {
    if (!action) return;
    if (action === 'consult') {
      const link = window.PLAN_LINKS?.STRONG_MUMS_CONSULT;
      if (link) window.open(link, '_blank');
      return;
    }
    if (action === 'pt') {
      await requireStrongMumsPrereqs();
      await convertStrongMumsIntentToPT();
      markStrongMumsPtSelected();
      markStrongMumsRedirectHint();
      setTimeout(() => {
        try {
          window.location.reload();
        } catch (_) {
          restartEnquiryFlow({ force: true });
        }
      }, 150);
      return;
    }
    if (action === 'group') {
      launchStrongMumsGroupFlow();
      return;
    }
  }

  const strongMumsModalState = {
    onComplete: null,
    context: {}
  };

  function ensureStrongMumsModal() {
    let overlay = document.getElementById('strong-prereq-modal');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'strong-prereq-modal';
    overlay.className = 'strong-modal-backdrop';
    overlay.innerHTML = `
      <div class="strong-modal" role="dialog" aria-modal="true">
        <button type="button" class="strong-modal__close" data-strong-modal-close aria-label="Close">&times;</button>
        <div data-strong-modal-body></div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (evt) => {
      if (evt.target === overlay) {
        closeStrongMumsPrereqModal(false);
      }
    });
    overlay.querySelector('[data-strong-modal-close]').addEventListener('click', () => {
      closeStrongMumsPrereqModal(false);
    });
    return overlay;
  }

  function openStrongMumsPrereqModal(options = {}) {
    const overlay = ensureStrongMumsModal();
    strongMumsModalState.context = options || {};
    strongMumsModalState.onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;
    overlay.classList.add('is-active');
    document.body.classList.add('strong-modal-open');
    renderStrongMumsModalContent(overlay, options);
  }

  function closeStrongMumsPrereqModal(executeCallback) {
    const overlay = document.getElementById('strong-prereq-modal');
    if (!overlay) return;
    overlay.classList.remove('is-active');
    document.body.classList.remove('strong-modal-open');
    const callback = strongMumsModalState.onComplete;
    strongMumsModalState.onComplete = null;
    if (executeCallback && typeof callback === 'function') {
      callback();
    }
  }

  function renderStrongMumsModalContent(overlay, opts = null) {
    const options = opts || strongMumsModalState.context || {};
    const mode = options.mode || 'prereq';
    const body = overlay.querySelector('[data-strong-modal-body]');
    if (!body) return;
    const prereqsComplete = areStrongMumsPrereqsComplete();
    if (prereqsComplete && mode === 'groupOptions') {
      renderStrongMumsOptionsModal(body);
      return;
    }
    if (prereqsComplete) {
      body.innerHTML = `
        <h3>Ready to train</h3>
        <p>You’ve already completed the readiness checklist.</p>
        <div class="strong-modal-actions">
          <button type="button" class="btn" data-strong-modal-continue>Continue</button>
        </div>
      `;
      const continueBtn = body.querySelector('[data-strong-modal-continue]');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          closeStrongMumsPrereqModal(true);
        });
      }
      return;
    }

    const checklistHtml = STRONG_MUMS_ITEMS.map(item => `
      <label class="strong-toggle">
        <input type="checkbox" data-strong-modal-check="${item.key}">
        <span class="strong-toggle__track">
          <span class="strong-toggle__icon"></span>
        </span>
        <span class="strong-toggle__label">${item.label}</span>
      </label>
    `).join('');

    body.innerHTML = `
      <h3>Strong Mums readiness</h3>
      <p>Tick every statement below so we know you’re safe to train.</p>
      <div class="strong-modal-checklist">${checklistHtml}</div>
      <p class="strong-modal-warning" data-strong-modal-warning></p>
      <div class="strong-modal-actions">
        <button type="button" class="btn btn--muted" data-strong-modal-consult>Book a post-natal fitness consultation</button>
        <button type="button" class="btn" data-strong-modal-complete>All good — continue</button>
      </div>
    `;
    bindStrongMumsModalChecklist(body);
  }

  function renderStrongMumsOptionsModal(body) {
    const options = [
      {
        key: 'dropin',
        title: 'Drop-in access',
        price: '£14.50',
        copy: 'Perfect if you want to try a single Strong Mums class or keep things flexible.',
        button: 'Purchase drop-in',
        link: 'https://bomberspt.pushpress.com/landing/plans/plan_708fedeb6ad948'
      },
      {
        key: 'block',
        title: 'Block of 4 sessions',
        price: '£49.50',
        copy: 'Lock in four Strong Mums sessions to build momentum with coach support.',
        button: 'Purchase block',
        link: 'https://bomberspt.pushpress.com/landing/plans/plan_ada350b903102e/login'
      }
    ];
    body.innerHTML = `
      <h3>Choose your Strong Mums access</h3>
      <p>Select the option that fits your schedule. You’ll be redirected to PushPress to complete the purchase.</p>
      <div class="strong-modal-options">
        ${options.map(opt => `
          <article class="strong-modal-option" data-strong-option="${opt.key}">
            <h4>${opt.title} <span class="strong-modal-option__price-tag">${opt.price}</span></h4>
            <p class="strong-modal-option__copy">${opt.copy}</p>
            <div class="strong-modal-option__actions">
              <a class="btn btn--primary" href="${opt.link}" target="_blank" rel="noopener">${opt.button}</a>
            </div>
          </article>
        `).join('')}
      </div>
      <div class="strong-modal-actions strong-modal-actions--end">
        <button type="button" class="btn" data-strong-modal-close>Close</button>
      </div>
    `;
    body.querySelectorAll('[data-strong-option-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-strong-option-action');
        handleStrongGroupPlan(choice);
      });
    });
    const closeBtn = body.querySelector('[data-strong-modal-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeStrongMumsPrereqModal(false));
    }
  }

  function bindStrongMumsModalChecklist(root) {
    const inputs = Array.from(root.querySelectorAll('[data-strong-modal-check]'));
    const button = root.querySelector('[data-strong-modal-complete]');
    const consultBtn = root.querySelector('[data-strong-modal-consult]');
    const warningEl = root.querySelector('[data-strong-modal-warning]');
    if (!inputs.length || !button) return;
    const update = () => {
      const ready = inputs.every(input => input.checked);
      button.dataset.ready = ready ? '1' : '0';
      if (warningEl && ready) {
        warningEl.textContent = '';
      }
    };
    inputs.forEach(input => {
      input.addEventListener('change', update);
    });
    update();
    if (consultBtn) {
      consultBtn.addEventListener('click', () => {
        const link = window.PLAN_LINKS?.STRONG_MUMS_CONSULT;
        if (link) window.open(link, '_blank');
      });
    }
    button.addEventListener('click', async () => {
      const ready = inputs.every(input => input.checked);
      if (!ready) {
        if (warningEl) {
          warningEl.textContent = 'If you are unable to tick all of the above, you may not be ready to start exercising again just yet. You can still book in for a Post-natal fitness consultation, and after this you may be cleared to start.';
        }
        return;
      }
      button.disabled = true;
      button.textContent = 'Saving…';
      try {
        await completeStrongMumsChecklist();
        await Promise.resolve().then(() => renderStrongMumsFlow(window._latestContactFields || {}));
        closeStrongMumsPrereqModal(true);
      } catch (err) {
        console.warn('[StrongMums] prereq save failed', err);
      } finally {
        button.disabled = false;
        button.textContent = 'All good — continue';
      }
    });
  }

  function launchStrongMumsGroupFlow() {
    if (areStrongMumsPrereqsComplete()) {
      openStrongMumsPrereqModal({ mode: 'groupOptions' });
      return;
    }
    openStrongMumsPrereqModal({
      mode: 'prereq',
      onComplete: () => {
        setTimeout(() => renderStrongMumsFlow(window._latestContactFields || {}), 80);
        setTimeout(() => openStrongMumsPrereqModal({ mode: 'groupOptions' }), 120);
      }
    });
  }

  function requireStrongMumsPrereqs() {
    if (areStrongMumsPrereqsComplete()) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      openStrongMumsPrereqModal({
        mode: 'prereq',
        onComplete: () => {
          resolve();
        }
      });
    });
  }

  function handleStrongGroupPlan(choice) {
    if (!choice) return;
    const planKeyMap = {
      dropin: 'class_single',
      block: 'class_block4'
    };
    const targetPlanKey = planKeyMap[choice];
    if (!targetPlanKey) {
      console.warn('[StrongMums] Unknown plan choice', choice);
      return;
    }
    openDropinPrereqModal(targetPlanKey, { mode: 'strongMums' });
    closeStrongMumsPrereqModal(false);
  }

  async function convertStrongMumsIntentToPT() {
    const updates = {};
    const fields = window.CONSULT_FIELDS || {};
    const serviceField = fields.serviceType;
    const memberField = fields.membershipIntent;
    const interestField = fields.serviceInterest;
    if (serviceField) {
      const current = window._latestContactFields?.[serviceField];
      if (current !== '1-1 Personal Training') {
        updates[serviceField] = '1-1 Personal Training';
      }
    }
    if (memberField) {
      const currentMember = window._latestContactFields?.[memberField];
      if (currentMember !== 'Membership enquiry') {
        updates[memberField] = 'Membership enquiry';
      }
    }
    if (interestField) {
      const currentInterest = window._latestContactFields?.[interestField];
      if (typeof currentInterest === 'string' && /strong\s*mums/i.test(currentInterest)) {
        updates[interestField] = '';
      }
    }
    if (!Object.keys(updates).length) return;
    try {
      if (window.contactId && typeof window.updateFieldsBatch === 'function') {
        await window.updateFieldsBatch(window.contactId, updates);
      }
      if (window._latestContactFields) {
        Object.entries(updates).forEach(([fieldId, value]) => {
          window._latestContactFields[fieldId] = value;
        });
      }
    } catch (err) {
      console.warn('[StrongMums] Failed to update PT intent', err);
    }
  }

  async function completeStrongMumsChecklist() {
    if (!window.contactId) return;
    if (typeof window.forceChecklistFlag === 'function') {
      window.forceChecklistFlag(STRONG_MUMS_CHECKLIST_LABEL, true);
    } else if (typeof window.markChecklistCompletion === 'function') {
      window.markChecklistCompletion(STRONG_MUMS_CHECKLIST_LABEL);
    }
    if (typeof window.renderChecklist === 'function') {
      setTimeout(() => window.renderChecklist(), 200);
    }
  }

  function markStrongMumsPtSelected() {
    if (typeof window.forceChecklistFlag === 'function') {
      window.forceChecklistFlag(STRONG_MUMS_PT_LABEL, true);
    }
  }

  function hasStrongMumsPtSelection() {
    return hasChecklistFieldValue(window._checklistFieldState, STRONG_MUMS_PT_LABEL);
  }

  const DROPIN_TCS_LABEL = 'Drop-in T&Cs';
  window.DROPIN_TCS_LABEL = DROPIN_TCS_LABEL;
  const DROPIN_PASS_PLANS = {
    day_pass: {
      key: 'day_pass',
      label: 'Day Pass',
      price: lookupPriceValue(['openGym', 'dropins', 'dayPass'], '£12.50'),
      description: '24/7 access for one day. Valid for 1 day.',
      linkKey: 'DAY_PASS'
    },
    week_pass: {
      key: 'week_pass',
      label: '1 Week Pass',
      price: lookupPriceValue(['openGym', 'dropins', 'weekPass'], '£30.00'),
      description: 'Unlimited 24/7 access for 7 days.',
      linkKey: 'WEEK_PASS'
    },
    four_week_pass: {
      key: 'four_week_pass',
      label: '4 Week Pass',
      price: lookupPriceValue(['openGym', 'dropins', 'fourWeekPass'], '£74.00'),
      description: 'Unlimited 24/7 access for 4 weeks.',
      linkKey: 'FOUR_WEEK_PASS'
    },
    class_single: {
      key: 'class_single',
      label: 'Single coached session',
      price: lookupPriceValue(['classes', 'dropins', 'single'], ''),
      description: '',
      linkKey: 'CLASS_SINGLE_PASS'
    },
    class_block4: {
      key: 'class_block4',
      label: 'Block of 4 coached sessions',
      price: lookupPriceValue(['classes', 'dropins', 'pack4'], ''),
      description: 'Use within 4 weeks to build momentum.',
      linkKey: 'CLASS_BLOCK4_PASS'
    }
  };

  const dropinPrereqState = {
    planKey: null,
    currentStep: 0,
    planUrl: '',
    requirements: [],
    useEmbeddedFlow: false,
    requirementsMode: 'default'
  };

  const dropinSubflowState = {
    pending: false,
    planKey: null,
    stepIndex: 0,
    sequence: null,
    sequenceIndex: 0,
    refreshTimers: [],
    lastAction: null
  };

  const dropinEmbeddedState = {
    active: false,
    currentAction: null,
    ignoreNextCompletion: false
  };

  const DROPIN_FLOW_STEPS = ['induction', 'parq', 'consent', 'dropin_tcs'];
  const DROPIN_FLOW_LABELS = {
    induction: 'Online induction',
    parq: 'Health questions',
    consent: 'Informed consent',
    dropin_tcs: 'Drop-in T&Cs'
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getDropinEmbeddedElements() {
    const stage = document.getElementById('dropin-embedded-flow');
    const host = document.getElementById('dropin-embedded-host');
    const progress = document.getElementById('dropin-embedded-progress');
    return { stage, host, progress };
  }

  function openDropinEmbeddedFlow(actionKey) {
    const { stage, host, progress } = getDropinEmbeddedElements();
    if (!stage || !host) return null;
    const idx = DROPIN_FLOW_STEPS.indexOf(actionKey);
    const total = DROPIN_FLOW_STEPS.length;
    const label = DROPIN_FLOW_LABELS[actionKey] || '';
    if (progress) {
      if (idx >= 0) {
        progress.textContent = `Step ${idx + 1} of ${total} • ${label}`;
      } else {
        progress.textContent = label;
      }
    }
    host.innerHTML = '';
    stage.setAttribute('aria-hidden', 'false');
    dropinEmbeddedState.active = true;
    dropinEmbeddedState.currentAction = actionKey;
    return host;
  }

  function closeDropinEmbeddedFlow() {
    const { stage, host } = getDropinEmbeddedElements();
    if (host) {
      host.innerHTML = '';
    }
    if (stage) {
      stage.setAttribute('aria-hidden', 'true');
    }
    dropinEmbeddedState.active = false;
    dropinEmbeddedState.currentAction = null;
  }

  function cancelDropinEmbeddedFlow() {
    if (!dropinEmbeddedState.active) return;
    dropinEmbeddedState.ignoreNextCompletion = true;
    const action = dropinEmbeddedState.currentAction;
    switch (action) {
      case 'induction':
        if (typeof window.closeInitialInductionModal === 'function') {
          window.closeInitialInductionModal(false);
        }
        break;
      case 'parq':
        if (typeof window.closeParqModal === 'function') {
          window.closeParqModal();
        }
        break;
      case 'consent':
        if (typeof window.closeTermsModal === 'function') {
          window.closeTermsModal();
        }
        break;
      case 'dropin_tcs':
        if (typeof window.closeDropinTcsModal === 'function') {
          window.closeDropinTcsModal({ silent: true });
        }
        break;
      default:
        break;
    }
    dropinSubflowState.pending = false;
    dropinSubflowState.sequence = null;
    dropinSubflowState.sequenceIndex = 0;
    dropinPrereqState.useEmbeddedFlow = false;
    closeDropinEmbeddedFlow();
    refreshDropinRequirementStates();
  }

  function getDropinPlanMeta(planKey) {
    const base = DROPIN_PASS_PLANS[planKey];
    if (!base) return null;
    const planLinks = window.DROPIN_PASS_LINKS || {};
    const link = base.link || planLinks[base.linkKey] || '';
    return Object.assign({ link }, base);
  }

  function buildDropinPlanUrl(meta) {
    if (!meta || !meta.link) return '';
    const contactId = window.contactId;
    if (!contactId) return meta.link;
    if (meta.link.includes('{contactId}')) {
      return meta.link.replace('{contactId}', encodeURIComponent(contactId));
    }
    if (/contactId=/i.test(meta.link)) {
      return meta.link;
    }
    const separator = meta.link.includes('?') ? '&' : '?';
    return `${meta.link}${separator}contactId=${encodeURIComponent(contactId)}`;
  }

  function computeDropinRequirementSteps(mode) {
    const contact = window._latestContact || {};
    const tags = tagSet(contact);
    const checklistState = window._checklistFieldState || null;
    const parqTag = window.TAGS?.PARQ_SUBMITTED || 'par-q submitted';
    const consentTag = window.TAGS?.INFORMED_CONSENT || 'informed consent signed';
    const inductionTag = window.TAGS?.INDUCTION_DONE || 'online induction completed';

    const inductionComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.ONLINE_INDUCTION, () => getTagBool(tags, inductionTag));
    const parqComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.HEALTH_FORM, () => getTagBool(tags, parqTag));
    const consentComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.INFORMED_CONSENT, () => getTagBool(tags, consentTag));
    const dropinTcsComplete = hasChecklistFieldValue(checklistState, DROPIN_TCS_LABEL);

    const baseSteps = [
      {
        key: 'induction',
        label: 'Online induction',
        description: 'Complete the online induction before training independently.',
        complete: inductionComplete,
        actions: [
          { label: 'Launch induction', actionKey: 'induction' }
        ]
      },
      {
        key: 'health',
        label: 'Health & consent',
        description: 'Submit your PAR-Q and sign informed consent.',
        complete: parqComplete && consentComplete,
        actions: [
          { label: 'Complete health form & consent', actionKey: 'health_sequence' }
        ]
      },
      {
        key: 'dropin_tcs',
        label: 'Drop-in T&Cs',
        description: 'Confirm the drop-in usage, cancellation, and pause policy.',
        complete: dropinTcsComplete,
        actions: [
          { label: 'Review T&Cs', actionKey: 'dropin_tcs' }
        ]
      }
    ];

    if (mode === 'strongMums') {
      return baseSteps.filter(step => step.key !== 'induction');
    }

    return baseSteps;
  }

  function updateDropinPrereqState(options) {
    const requirements = computeDropinRequirementSteps(dropinPrereqState.requirementsMode);
    dropinPrereqState.requirements = requirements;
    const firstIncomplete = requirements.findIndex(req => !req.complete);
    const defaultIndex = firstIncomplete >= 0 ? firstIncomplete : requirements.length - 1;
    if (options && typeof options.forceIndex === 'number') {
      dropinPrereqState.currentStep = clamp(options.forceIndex, 0, requirements.length - 1);
    } else {
      const current = dropinPrereqState.currentStep;
      if (current == null || current > requirements.length - 1) {
        dropinPrereqState.currentStep = defaultIndex;
      } else {
        const normalized = clamp(current, 0, requirements.length - 1);
        const activeReq = requirements[normalized];
        if (activeReq && !activeReq.complete) {
          dropinPrereqState.currentStep = normalized;
        } else {
          dropinPrereqState.currentStep = defaultIndex;
        }
      }
    }
    const meta = getDropinPlanMeta(dropinPrereqState.planKey);
    dropinPrereqState.planUrl = buildDropinPlanUrl(meta);
  }

  function openDropinPrereqModal(planKey, config) {
    const modal = document.getElementById('dropin-prereq-modal');
    const meta = getDropinPlanMeta(planKey);
    if (!modal || !meta) {
      alert('Drop-in option unavailable.');
      return;
    }
    dropinPrereqState.planKey = planKey;
    dropinPrereqState.requirementsMode = config?.mode || 'default';
    updateDropinPrereqState({ forceIndex: 0 });
    renderDropinPrereqModal();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    dropinPrereqState.useEmbeddedFlow = false;
  }

  function closeDropinPrereqModal(options) {
    const modal = document.getElementById('dropin-prereq-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    closeDropinEmbeddedFlow();
    dropinPrereqState.useEmbeddedFlow = false;
    if (!options || !options.silent) {
      dropinPrereqState.planKey = null;
      dropinPrereqState.currentStep = 0;
      dropinPrereqState.requirementsMode = 'default';
    }
  }

  function highestUnlockedDropinStep() {
    const reqs = dropinPrereqState.requirements;
    const firstIncomplete = reqs.findIndex(req => !req.complete);
    return firstIncomplete === -1 ? reqs.length - 1 : firstIncomplete;
  }

  function goToDropinStep(targetIndex) {
    const maxIndex = highestUnlockedDropinStep();
    const nextIndex = clamp(targetIndex, 0, maxIndex);
    dropinPrereqState.currentStep = nextIndex;
    renderDropinPrereqModal();
  }

  function handleDropinStepNav(direction) {
    const reqs = dropinPrereqState.requirements;
    if (!reqs.length) return;
    if (direction === 'next') {
      const currentReq = reqs[dropinPrereqState.currentStep];
      if (!currentReq || !currentReq.complete) return;
      const nextIndex = clamp(dropinPrereqState.currentStep + 1, 0, reqs.length - 1);
      dropinPrereqState.currentStep = nextIndex;
    } else if (direction === 'prev') {
      dropinPrereqState.currentStep = clamp(dropinPrereqState.currentStep - 1, 0, reqs.length - 1);
    }
    renderDropinPrereqModal();
  }

  function renderDropinPrereqModal() {
    const content = document.getElementById('dropin-prereq-content');
    const planKey = dropinPrereqState.planKey;
    if (!content || !planKey) return;
    const meta = getDropinPlanMeta(planKey);
    if (!meta) {
      content.innerHTML = '<p style="margin:0;color:#5b657a;">This drop-in option is no longer available.</p>';
      return;
    }
    updateDropinPrereqState();
    const reqs = dropinPrereqState.requirements;
    if (!reqs.length) {
      content.innerHTML = '<p style="margin:0;color:#5b657a;">No prerequisites configured.</p>';
      return;
    }
    const activeIndex = clamp(dropinPrereqState.currentStep, 0, reqs.length - 1);
    const activeReq = reqs[activeIndex];
    const allComplete = reqs.every(req => req.complete);
    const planUrlMissing = !dropinPrereqState.planUrl;

    const stepper = `
      <div class="dropin-stepper">
        ${reqs.map((req, idx) => {
          const classes = ['dropin-stepper__step'];
          if (idx === activeIndex) classes.push('is-active');
          if (req.complete) classes.push('is-complete');
          const icon = req.complete ? '✅' : '◻️';
          const label = window.escapeHtml ? window.escapeHtml(req.label) : req.label;
          return `<button type="button" class="${classes.join(' ')}" data-dropin-step="${idx}">
            <span class="dropin-stepper__icon">${icon}</span>
            <span class="dropin-stepper__label">${label}</span>
          </button>`;
        }).join('')}
      </div>
    `;

    const planSummary = `
      <div class="dropin-prereq-plan">
        <h3>${window.escapeHtml ? window.escapeHtml(meta.label) : meta.label} <small style="font-weight:400;color:#55607d;font-size:0.8em;">${window.escapeHtml ? window.escapeHtml(meta.price) : meta.price}</small></h3>
        <p>${window.escapeHtml ? window.escapeHtml(meta.description) : meta.description}</p>
      </div>
    `;

    const bodyHtml = buildDropinStepPanel(activeReq);

    const warningText = planUrlMissing ? '<p class="dropin-prereq-warning">Plan link not configured yet. Please update the drop-in plan links in config.js.</p>' : '';

    content.innerHTML = `
      ${planSummary}
      ${stepper}
      ${bodyHtml}
      <div class="dropin-prereq-footer"></div>
      ${warningText}
      <div id="dropin-embedded-flow" class="dropin-embedded-flow" aria-hidden="true">
        <div class="dropin-embedded-shell">
          <div class="dropin-embedded-header">
            <button type="button" class="btn btn--muted btn--compact" data-dropin-flow-close>&larr; Back</button>
            <div id="dropin-embedded-progress" class="dropin-embedded-progress"></div>
          </div>
          <div id="dropin-embedded-host" class="dropin-embedded-host"></div>
        </div>
      </div>
    `;
  }

  function buildDropinStepPanel(step) {
    if (!step) {
      return '<div class="dropin-step-panel"><p style="margin:0;">All prerequisites are complete.</p></div>';
    }
    const allComplete = dropinPrereqState.requirements.every(req => req.complete);
    if (step.key === 'dropin_tcs' && step.complete && allComplete) {
      return `
        <div class="dropin-step-panel dropin-step-panel--purchase">
          <p style="margin:0 0 0.75rem;">All prerequisites are complete. You can now purchase your pass.</p>
          <button type="button" class="btn next-action-glow" data-dropin-action="continue">Purchase plan</button>
        </div>
      `;
    }
    const description = step.description ? `<p>${window.escapeHtml ? window.escapeHtml(step.description) : step.description}</p>` : '';
    const actionButtons = (step.actions || []).map(action => {
      const label = step.key === 'induction' ? 'Complete online induction' : action.label;
      return `<button type="button" class="btn" data-dropin-action="${action.actionKey}">${label}</button>`;
    }).join('');
    const actionsHtml = actionButtons ? `<div class="dropin-prereq-actions dropin-prereq-actions--single">${actionButtons}</div>` : '';
    return `<div class="dropin-step-panel">${buildStepDescription(step)}${actionsHtml}</div>`;
  }
  function buildStepDescription(step) {
    if (!step || !step.description) return '';
    if (step.key === 'induction') {
      return '';
    }
    return `<p>${window.escapeHtml ? window.escapeHtml(step.description) : step.description}</p>`;
  }

  function handleDropinAction(actionKey) {
    if (!actionKey) return;
    if (actionKey === 'refresh') {
      refreshDropinRequirementStates();
      return;
    }
    if (actionKey === 'continue') {
      attemptDropinPlanLaunch();
      return;
    }
    runDropinAction(actionKey);
  }

  function runDropinAction(actionKey) {
    const embeddedActions = ['induction', 'parq', 'consent', 'dropin_tcs', 'health_sequence'];
    dropinPrereqState.useEmbeddedFlow = embeddedActions.includes(actionKey);
    if (actionKey === 'dropin_tcs') {
      dropinPrereqState.useEmbeddedFlow = false;
    }
    switch (actionKey) {
      case 'induction':
        dropinSubflowState.sequence = null;
        dropinSubflowState.sequenceIndex = 0;
        launchDropinSubflowAction('induction');
        break;
      case 'parq':
        dropinSubflowState.sequence = null;
        dropinSubflowState.sequenceIndex = 0;
        launchDropinSubflowAction('parq');
        break;
      case 'consent':
        dropinSubflowState.sequence = null;
        dropinSubflowState.sequenceIndex = 0;
        launchDropinSubflowAction('consent');
        break;
      case 'dropin_tcs':
        dropinSubflowState.sequence = null;
        dropinSubflowState.sequenceIndex = 0;
        launchDropinSubflowAction('dropin_tcs');
        break;
      case 'health_sequence':
        dropinSubflowState.sequence = ['parq', 'consent'];
        dropinSubflowState.sequenceIndex = 0;
        launchDropinSubflowAction('parq');
        break;
      default:
        break;
    }
  }

  function launchDropinSubflowAction(actionKey) {
    if (actionKey === 'parq' || actionKey === 'health_sequence') {
      ensureParqModalShell();
    }
    clearDropinRefreshTimers();
    dropinSubflowState.pending = true;
    dropinSubflowState.planKey = dropinPrereqState.planKey;
    dropinSubflowState.stepIndex = dropinPrereqState.currentStep || 0;
    dropinSubflowState.lastAction = actionKey;
    const isComposite = actionKey === 'health_sequence';
    let embedHost = null;
    if (dropinPrereqState.useEmbeddedFlow && !isComposite) {
      embedHost = openDropinEmbeddedFlow(actionKey);
      if (!embedHost) {
        dropinPrereqState.useEmbeddedFlow = false;
      }
    }
    if (!dropinPrereqState.useEmbeddedFlow) {
      closeDropinPrereqModal({ silent: true });
    }
    switch (actionKey) {
      case 'induction':
        if (typeof window.showInitialInductionModal === 'function') {
          if (dropinPrereqState.useEmbeddedFlow && embedHost) {
            window.showInitialInductionModal({ embedTarget: embedHost });
          } else {
            window.showInitialInductionModal();
          }
        }
        break;
      case 'parq':
        if (typeof window.openParqModal === 'function') {
          if (dropinPrereqState.useEmbeddedFlow && embedHost) {
            window.openParqModal({ embedTarget: embedHost });
          } else {
            window.openParqModal();
          }
        }
        break;
      case 'consent': {
        const contactId = window.contactId;
        const consentTag = window.TAGS?.INFORMED_CONSENT || 'informed consent signed';
        if (contactId && typeof window.openTermsModal === 'function') {
          if (dropinPrereqState.useEmbeddedFlow && embedHost) {
            window.openTermsModal(consentTag, contactId, () => {}, { embedTarget: embedHost });
          } else {
            window.openTermsModal(consentTag, contactId, () => {});
          }
        }
        break;
      }
      case 'dropin_tcs':
        if (typeof window.showDropinTcsModal === 'function') {
          if (dropinPrereqState.useEmbeddedFlow && embedHost) {
            window.showDropinTcsModal({ embedTarget: embedHost });
          } else {
            window.showDropinTcsModal();
          }
        }
        break;
      default:
        dropinSubflowState.pending = false;
        break;
    }
  }

  function clearDropinRefreshTimers() {
    const timers = dropinSubflowState.refreshTimers;
    if (Array.isArray(timers)) {
      timers.forEach(handle => clearTimeout(handle));
    }
    dropinSubflowState.refreshTimers = [];
  }
  function handleDropinSubflowComplete() {
    if (!dropinSubflowState.pending) return;
    if (dropinEmbeddedState.ignoreNextCompletion) {
      dropinEmbeddedState.ignoreNextCompletion = false;
      closeDropinEmbeddedFlow();
      dropinPrereqState.useEmbeddedFlow = false;
      refreshDropinRequirementStates();
      return;
    }
    const completedAction = dropinSubflowState.lastAction;
    dropinSubflowState.lastAction = null;
    dropinSubflowState.pending = false;
    if (dropinSubflowState.planKey) {
      dropinPrereqState.planKey = dropinSubflowState.planKey;
    }
    clearDropinRefreshTimers();
    if (Array.isArray(dropinSubflowState.sequence) && dropinSubflowState.sequenceIndex < dropinSubflowState.sequence.length - 1) {
      dropinSubflowState.sequenceIndex += 1;
      const nextAction = dropinSubflowState.sequence[dropinSubflowState.sequenceIndex];
      launchDropinSubflowAction(nextAction);
      return;
    }
    dropinSubflowState.sequence = null;
    dropinSubflowState.sequenceIndex = 0;
    const desiredIndex = dropinSubflowState.stepIndex || 0;
    updateDropinPrereqState();
    const reqs = dropinPrereqState.requirements;
    if (completedAction === 'induction') {
      const healthIndex = reqs.findIndex(req => req.key === 'health');
      const healthReq = healthIndex >= 0 ? reqs[healthIndex] : null;
      if (healthReq && !healthReq.complete) {
        dropinSubflowState.sequence = ['parq', 'consent'];
        dropinSubflowState.sequenceIndex = 0;
        dropinSubflowState.pending = true;
        dropinSubflowState.planKey = dropinPrereqState.planKey;
        dropinSubflowState.stepIndex = healthIndex;
        launchDropinSubflowAction('parq');
        return;
      }
    }
    const wasComplete = reqs[desiredIndex] && reqs[desiredIndex].complete;
    const maxUnlocked = highestUnlockedDropinStep();
    const targetIndex = wasComplete
      ? Math.min(desiredIndex + 1, maxUnlocked)
      : Math.min(desiredIndex, maxUnlocked);
    if (dropinPrereqState.useEmbeddedFlow) {
      closeDropinEmbeddedFlow();
      dropinPrereqState.useEmbeddedFlow = false;
    }
    dropinPrereqState.currentStep = targetIndex;
    renderDropinPrereqModal();
    const modal = document.getElementById('dropin-prereq-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
    queueDropinRefreshSequence();
  }
  window.handleDropinSubflowComplete = handleDropinSubflowComplete;

  function queueDropinRefreshSequence() {
    if (!window.contactId || typeof window.fetchContact !== 'function') {
      refreshDropinRequirementStates();
      return;
    }
    const timers = [];
    const schedule = (delay) => {
      const handle = setTimeout(() => {
        refreshDropinRequirementStates().catch(() => {});
      }, delay);
      timers.push(handle);
    };
    schedule(1000);
    schedule(2500);
    schedule(4000);
    dropinSubflowState.refreshTimers = timers;
  }

  async function refreshDropinRequirementStates() {
    const fetchContact = typeof window.fetchContact === 'function' ? window.fetchContact : null;
    if (fetchContact && window.contactId) {
      try {
        const data = await fetchContact(window.contactId);
        applyFetchedContactResponse(data);
      } catch (err) {
        console.warn('[DropIn] Failed to refresh contact state', err);
      }
    }
    updateDropinPrereqState();
    if (!dropinEmbeddedState.active) {
      renderDropinPrereqModal();
    }
  }

  function mapContactFieldEntries(raw) {
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

  function applyFetchedContactResponse(payload) {
    if (!payload) return;
    const contact = payload.contact || payload;
    const customFieldsSource = contact.customFields || contact.customField || payload.customField || payload.customFields || [];
    const fieldEntries = mapContactFieldEntries(customFieldsSource);
    window._latestContact = contact;
    window._latestContactFields = Object.assign({}, window._latestContactFields || {}, fieldEntries);
    window._latestGhlRaw = payload;
    const checklistFieldId = window.FIELDS?.CONTACT_CHECKLIST;
    if (checklistFieldId && Object.prototype.hasOwnProperty.call(fieldEntries, checklistFieldId)) {
      const values = parseChecklistFieldValues(fieldEntries[checklistFieldId]);
      window._checklistFieldState = createChecklistState(values);
      window._remoteChecklistSet = window._checklistFieldState?.normalizedSet instanceof Set
        ? new Set(window._checklistFieldState.normalizedSet)
        : new Set();
    }
  }

  function attemptDropinPlanLaunch() {
    const meta = getDropinPlanMeta(dropinPrereqState.planKey);
    if (!meta) {
      closeDropinPrereqModal();
      return;
    }
    const allComplete = dropinPrereqState.requirements.every(req => req.complete);
    if (!allComplete) {
      alert('Please complete all prerequisites before purchasing a drop-in pass.');
      updateDropinPrereqState();
      renderDropinPrereqModal();
      return;
    }
    const planUrl = dropinPrereqState.planUrl;
    if (!planUrl) {
      alert('Plan link not configured yet.');
      return;
    }
    window.open(planUrl, '_blank');
    closeDropinPrereqModal();
  }


  function toggleStaffParam(enable) {
    try {
      const url = new URL(window.location.href);
      if (enable) {
        url.searchParams.set('staff', '1');
      } else {
        url.searchParams.delete('staff');
      }
      window.location.href = url.toString();
    } catch (err) {
      console.warn('[Checklist] Unable to toggle staff param', err);
    }
  }

  function bindStaffHeadingToggle() {
    const heading = document.querySelector('.checklist-heading');
    if (!heading || heading.dataset.staffToggleBound === '1') return;
    heading.dataset.staffToggleBound = '1';
    heading.addEventListener('click', () => {
      const now = Date.now();
      const first = Number(heading.dataset.staffFirst || '0');
      let count = Number(heading.dataset.staffCount || '0');
      if (!first || now - first > 5000) {
        heading.dataset.staffFirst = String(now);
        count = 0;
      }
      count += 1;
      heading.dataset.staffCount = String(count);
      if (count >= 10) {
        heading.dataset.staffCount = '0';
        heading.dataset.staffFirst = String(now);
        toggleStaffParam(!window._staffMode);
      }
    });
  }

	  function reconcileChecklistTags(contact) {
	    if (!contact || !Array.isArray(contact.tags)) return;
	    const pairs = [
	      { tag: window.TAGS?.BOOKED_1TO1 || 'on-boarding 1-1 booked', label: OPPORTUNITY_LABELS.INITIAL_BOOKED },
	      { tag: window.TAGS?.ONBOARDING_PROXY || 'onboarding session booked proxy', label: OPPORTUNITY_LABELS.INITIAL_BOOKED },
	      { tag: window.TAGS?.ATTENDED_1TO1 || 'on-boarding 1-1 checked in', label: OPPORTUNITY_LABELS.INITIAL_CHECKED_IN }
	    ];
    if (!pairs.length) return;
    const rawTags = contact.tags;
    const normalizedSet = new Set(rawTags.map(tag => (tag || '').toLowerCase()));
    pairs.forEach(({ tag, label }) => {
      if (!tag || !label) return;
      const normalizedTag = tag.toLowerCase();
      if (!normalizedSet.has(normalizedTag)) return;
      if (!window._latestChecklistFlags || !window._latestChecklistFlags[label]) {
        window.forceChecklistFlag(label, true);
      }
      normalizedSet.delete(normalizedTag);
      const idx = rawTags.findIndex(item => String(item || '').toLowerCase() === normalizedTag);
      if (idx >= 0) rawTags.splice(idx, 1);
      scheduleTagRemoval(tag);
    });
  }

  function renderStaffChecklistPanel() {
    const existing = document.getElementById('staff-checklist-panel');
    if (!isStaffMode()) {
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
      return;
    }
    let parent = document.querySelector('.checklist-heading-container');
    let insertMode = 'after';
    if (!parent) {
      parent = document.getElementById('dropin-staff-anchor');
      insertMode = 'inside';
    }
    if (!parent) return;
    const panel = existing || document.createElement('div');
    panel.id = 'staff-checklist-panel';
    panel.className = 'staff-checklist-panel';
    panel.style.margin = '1rem 0';
    panel.style.padding = '1rem';
    panel.style.border = '1px solid #d6e0f2';
    panel.style.borderRadius = '12px';
    panel.style.background = '#f7f9ff';
    panel.style.color = '#1f3c88';

    const flags = window._latestChecklistFlags || {};
    const rows = STAFF_CHECKLIST_ITEMS.map((label, idx) => {
      if (!label) return '';
      const safeLabel = window.escapeHtml ? window.escapeHtml(label) : label;
      const attrLabel = String(label).replace(/"/g, '&quot;');
      const id = `staff-flag-${idx}`;
      const checked = flags[label] ? 'checked' : '';
      return `
        <label for="${id}" class="staff-flag-row" style="display:flex;align-items:center;gap:0.6rem;font-size:0.92rem;color:#1f274f;">
          <input type="checkbox" id="${id}" data-staff-flag="${attrLabel}" ${checked} style="width:1.1rem;height:1.1rem;flex-shrink:0;">
          <span>${safeLabel}</span>
        </label>
      `;
    }).join('');

    const leadFieldId = window.CONSULT_FIELDS?.leadType;
    const leadTypeValue = leadFieldId ? String((window._latestContactFields || {})[leadFieldId] || '').trim() : '';
    const leadTypeHtml = leadFieldId
      ? `<div style="margin:0.75rem 0 0.5rem;font-size:0.9rem;color:#1f274f;">
          <span style="font-weight:600;">Lead type:</span>
          <span style="color:#0d529f;">${leadTypeValue || 'Not recorded'}</span>
        </div>`
      : '';

    panel.innerHTML = `
      <div style="font-weight:700;margin-bottom:0.5rem;">Staff checklist overrides</div>
      <div style="font-size:0.85rem;color:#5b657a;margin-bottom:0.75rem;">Toggle any item below to force the contact checklist field.</div>
      ${leadTypeHtml}
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.6rem;">${rows}</div>
      <div style="margin-top:0.75rem;display:flex;justify-content:flex-end;">
        <button type="button" class="btn btn--danger" id="staff-clear-all">Clear all progress</button>
      </div>
    `;

    if (!existing) {
      if (insertMode === 'inside') {
        parent.innerHTML = '';
        parent.appendChild(panel);
      } else {
        parent.insertAdjacentElement('afterend', panel);
      }
    } else if (insertMode === 'inside' && panel.parentElement !== parent) {
      parent.innerHTML = '';
      parent.appendChild(panel);
    }

    panel.querySelectorAll('input[data-staff-flag]').forEach((input) => {
      if (input.dataset.staffBound === '1') return;
      input.dataset.staffBound = '1';
      input.addEventListener('change', () => {
        const label = input.dataset.staffFlag;
        if (!label || typeof window.forceChecklistFlag !== 'function') return;
        setChecklistFlagSuppression(label, !input.checked);
        window.forceChecklistFlag(label, input.checked);
        scheduleChecklistRefresh();
      });
    });
    const clearAllBtn = panel.querySelector('#staff-clear-all');
    if (clearAllBtn && !clearAllBtn.dataset.bound) {
      clearAllBtn.dataset.bound = '1';
      clearAllBtn.addEventListener('click', async () => {
        const confirmMessage = 'This will clear checklist progress, trial status, and related fields for this contact. Are you sure?';
        const ok = typeof window.safeConfirm === 'function'
          ? await window.safeConfirm(confirmMessage, { title: 'Clear all progress?', confirmText: 'Clear all' })
          : window.confirm(confirmMessage);
        if (!ok) return;
        await clearAllProgress();
      });
    }
  }

  const alreadyPurchasedButton = '';

  const LEGACY_COMPLETION_FALLBACK_ENABLED = true;

  const OPPORTUNITY_LABELS = {
    ENQUIRY_FORM: 'Enquiry Form',
    HEALTH_FORM: 'Health Form',
    CONSULTATION_FORM: 'Consultation Form',
    INTRO_REQUESTED: 'Intro Requested',
    INTRO_CONFIRMED: 'Intro Confirmed',
    INTRO_ATTENDED: 'Intro Attended',
    BP_CHECK: 'Blood Pressure Check',
    INFORMED_CONSENT: 'Informed Consent',
    INITIAL_BOOKED: 'Initial 1-1 Booked',
    ONLINE_INDUCTION: 'Online Induction',
    WODUP_SETUP: 'WodUp Setup',
    INITIAL_CHECKED_IN: 'Initial 1-1 Checked-in',
    DEBRIEF_COMPLETE: 'Debrief Complete',
    GYM_TCS: 'Gym T&Cs',
    TRIAL_TCS: 'Trial T&Cs',
    TRIAL_STARTED: 'Trial Started',
    TRIAL_ENDED: 'Trial Ended',
    TRIAL_TYPE_CHOSEN: 'Trial Type Chosen',
    CARD_ON_FILE: 'Card On File Agreement',
    MEMBERSHIP_PLAN_CHOSEN: 'Membership Plan Chosen',
    MEMBERSHIP_PLAN_ACTIVE: 'Membership Plan Active',
    KICKSTART_CHOSEN: 'KickStart Chosen',
    FOUNDATIONS_CHOSEN: 'Foundations Chosen',
    CERTIFIED_REFERRAL: 'Certified Referral'
  };
  window.OPPORTUNITY_LABELS = OPPORTUNITY_LABELS;
  const STAFF_CHECKLIST_ITEMS = [
    OPPORTUNITY_LABELS.ENQUIRY_FORM,
    OPPORTUNITY_LABELS.HEALTH_FORM,
    OPPORTUNITY_LABELS.CONSULTATION_FORM,
    OPPORTUNITY_LABELS.INTRO_REQUESTED,
    OPPORTUNITY_LABELS.INTRO_CONFIRMED,
    OPPORTUNITY_LABELS.INTRO_ATTENDED,
    OPPORTUNITY_LABELS.BP_CHECK,
    OPPORTUNITY_LABELS.INFORMED_CONSENT,
    OPPORTUNITY_LABELS.INITIAL_BOOKED,
    OPPORTUNITY_LABELS.ONLINE_INDUCTION,
    OPPORTUNITY_LABELS.WODUP_SETUP,
    OPPORTUNITY_LABELS.INITIAL_CHECKED_IN,
    OPPORTUNITY_LABELS.DEBRIEF_COMPLETE,
    OPPORTUNITY_LABELS.GYM_TCS,
    OPPORTUNITY_LABELS.TRIAL_TCS,
    OPPORTUNITY_LABELS.TRIAL_TYPE_CHOSEN,
    OPPORTUNITY_LABELS.CARD_ON_FILE,
    OPPORTUNITY_LABELS.MEMBERSHIP_PLAN_CHOSEN,
    OPPORTUNITY_LABELS.MEMBERSHIP_PLAN_ACTIVE,
    OPPORTUNITY_LABELS.CERTIFIED_REFERRAL,
    STRONG_MUMS_CHECKLIST_LABEL,
    DROPIN_TCS_LABEL
  ].filter(Boolean);
  const OVERRIDE_CHECKLIST_MAP = {
    enquiry_form: OPPORTUNITY_LABELS.ENQUIRY_FORM,
    par_q_completed: OPPORTUNITY_LABELS.HEALTH_FORM,
    consultation_questionnaire: OPPORTUNITY_LABELS.CONSULTATION_FORM,
    intro_meeting: OPPORTUNITY_LABELS.INTRO_CONFIRMED,
    intro_meeting_booked: OPPORTUNITY_LABELS.INTRO_REQUESTED,
    intro_meeting_attended: OPPORTUNITY_LABELS.INTRO_ATTENDED,
    bp_skip: OPPORTUNITY_LABELS.BP_CHECK,
    par_q_skip: OPPORTUNITY_LABELS.HEALTH_FORM,
    online_induction: OPPORTUNITY_LABELS.ONLINE_INDUCTION,
    setup_wodup: OPPORTUNITY_LABELS.WODUP_SETUP,
    session_debrief: OPPORTUNITY_LABELS.DEBRIEF_COMPLETE,
    mark_booked_1to1: OPPORTUNITY_LABELS.INITIAL_BOOKED,
    mark_attended_1to1: OPPORTUNITY_LABELS.INITIAL_CHECKED_IN,
    proxy_booked_1to1: OPPORTUNITY_LABELS.INITIAL_BOOKED,
    informed_consent: OPPORTUNITY_LABELS.INFORMED_CONSENT,
    mark_appt_checkin: OPPORTUNITY_LABELS.INTRO_ATTENDED,
    certified_referral: OPPORTUNITY_LABELS.CERTIFIED_REFERRAL
  };
  window.OVERRIDE_CHECKLIST_MAP = OVERRIDE_CHECKLIST_MAP;

  function getChecklistFieldState(fieldMap) {
    if (!fieldMap) return null;
    const fieldIds = [
      window.FIELDS?.CONTACT_CHECKLIST,
      window.FIELDS?.OPPORTUNITY_CHECKLIST
    ].filter(Boolean);
    for (const id of fieldIds) {
      const raw = fieldMap[id];
      const values = parseChecklistFieldValues(raw);
      if (values.length) {
        return createChecklistState(values);
      }
    }
    return null;
  }

  function createChecklistState(values) {
    const normalizedSet = new Set(values.map(normalizeOpportunityChecklistLabel));
    return {
      active: normalizedSet.size > 0,
      values,
      normalizedSet
    };
  }

  function updateLocalChecklistState(label, value) {
    const normalized = normalizeOpportunityChecklistLabel(label);
    if (!normalized) return;
    let state = window._checklistFieldState;
    if (!state) {
      state = createChecklistState([]);
      window._checklistFieldState = state;
    }
    if (!state.normalizedSet) {
    state.normalizedSet = new Set((state.values || []).map(normalizeOpportunityChecklistLabel));
  }
    state.values = Array.isArray(state.values) ? state.values.slice() : [];
    const hasValue = state.normalizedSet.has(normalized);
    if (value) {
      if (!hasValue) {
        state.values.push(label);
        state.normalizedSet.add(normalized);
      }
    } else if (hasValue) {
      state.values = state.values.filter(entry => normalizeOpportunityChecklistLabel(entry) !== normalized);
      state.normalizedSet.delete(normalized);
    }
    state.active = state.normalizedSet.size > 0;
  }

  function remoteChecklistSet() {
    if (!(window._remoteChecklistSet instanceof Set)) {
      const base = window._checklistFieldState?.normalizedSet;
      window._remoteChecklistSet = base instanceof Set ? new Set(base) : new Set();
    }
    return window._remoteChecklistSet;
  }

  function parseChecklistFieldValues(raw) {
    if (raw == null) return [];
    const clean = (value) => {
      if (value == null) return '';
      return String(value).trim();
    };
    const fromArray = (arr) => arr.map(clean).filter(Boolean);
    if (Array.isArray(raw)) {
      return fromArray(raw);
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return fromArray(parsed);
          }
        } catch (_) {
          // ignore parse errors and fall through to manual split
        }
      }
      return fromArray(trimmed.split(/[\n\r,;|]+/));
    }
    return [];
  }

  function normalizeOpportunityChecklistLabel(label) {
    return String(label || '').trim().toLowerCase();
  }

  const staffSuppressedChecklistFlags = new Set();

  function setChecklistFlagSuppression(label, suppressed) {
    const normalized = normalizeOpportunityChecklistLabel(label);
    if (!normalized) return;
    if (suppressed) {
      staffSuppressedChecklistFlags.add(normalized);
    } else {
      staffSuppressedChecklistFlags.delete(normalized);
    }
  }

  function isChecklistFlagSuppressed(label) {
    const normalized = normalizeOpportunityChecklistLabel(label);
    if (!normalized) return false;
    return staffSuppressedChecklistFlags.has(normalized);
  }

  function hasChecklistFieldValue(state, labels) {
    if (!state || !state.normalizedSet || !state.normalizedSet.size) return false;
    const list = Array.isArray(labels) ? labels : [labels];
    return list.some(label => state.normalizedSet.has(normalizeOpportunityChecklistLabel(label)));
  }

  function hasLatestFlag(label) {
    if (!label || !window._latestChecklistFlags) return false;
    return !!window._latestChecklistFlags[label];
  }

  function isChecklistFieldActive() {
    const state = window._checklistFieldState;
    return !!(state && state.active && state.normalizedSet && state.normalizedSet.size);
  }

  function preferOpportunityFlag(labels, fallback) {
    if (isChecklistFieldActive()) {
      return hasChecklistFieldValue(window._checklistFieldState, labels);
    }
    const legacyOverride = window && window.__CHECKLIST_FORCE_LEGACY === true;
    const fallbackAllowed = LEGACY_COMPLETION_FALLBACK_ENABLED || legacyOverride;
    if (!fallbackAllowed) {
      return false;
    }
    if (typeof fallback === 'function') {
      try {
        return !!fallback();
      } catch (err) {
        console.warn('[Checklist] preferOpportunityFlag fallback failed', err);
        return false;
      }
    }
    return !!fallback;
  }

  function setsEqual(a, b) {
    if (a.size !== b.size) return false;
    for (const value of a) {
      if (!b.has(value)) return false;
    }
    return true;
  }

  function syncChecklistField(completionFlags) {
    const fieldId = window.FIELDS?.CONTACT_CHECKLIST;
    if (!fieldId || typeof window.updateFieldsBatch !== 'function' || !window.contactId) return;
    const entries = Object.entries(completionFlags || {});
    const nextValues = entries
      .filter(([, value]) => value)
      .map(([label]) => label);
    const normalizedNext = new Set(nextValues.map(normalizeOpportunityChecklistLabel));
    const currentRemoteSet = new Set(remoteChecklistSet());
    if (setsEqual(normalizedNext, currentRemoteSet)) {
      return;
    }

    const apply = (values) => {
      syncChecklistField._pending = window.updateFieldsBatch(window.contactId, {
        [fieldId]: values
      }).then(() => {
        window._checklistFieldState = createChecklistState(values);
        syncOpportunityChecklist(window._latestChecklistFlags);
        window._remoteChecklistSet = window._checklistFieldState?.normalizedSet instanceof Set
          ? new Set(window._checklistFieldState.normalizedSet)
          : new Set();
        window._pendingChecklistFlags = {};
      }).catch((err) => {
        console.warn('[Checklist] Failed to sync checklist field', err);
      }).finally(() => {
        syncChecklistField._pending = null;
        if (syncChecklistField._next) {
          const queued = syncChecklistField._next;
          syncChecklistField._next = null;
          apply(queued);
        }
      });
    };

    if (syncChecklistField._pending) {
      syncChecklistField._next = nextValues;
      return;
    }

    syncChecklistField._next = null;
    apply(nextValues);
  }

  function forceContactChecklistSync() {
    const fieldId = window.FIELDS?.CONTACT_CHECKLIST;
    if (!fieldId || typeof window.updateFieldsBatch !== 'function' || !window.contactId) return;
    const entries = Object.entries(window._latestChecklistFlags || {});
    const values = entries
      .filter(([, value]) => value)
      .map(([label]) => label);

    window.updateFieldsBatch(window.contactId, { [fieldId]: values }).then(() => {
      window._checklistFieldState = createChecklistState(values);
      window._remoteChecklistSet = window._checklistFieldState?.normalizedSet instanceof Set
        ? new Set(window._checklistFieldState.normalizedSet)
        : new Set();
      syncOpportunityChecklist(window._latestChecklistFlags);
    }).catch((err) => {
      console.warn('[Checklist] Forced checklist sync failed', err);
    });
  }

  function syncOpportunityChecklist(completionFlags) {
    const fieldId = window.FIELDS?.OPPORTUNITY_CHECKLIST;
    if (!fieldId || typeof window.updateOpportunityCustomFields !== 'function') return;
    const oppId = window._latestOpportunity?.id || window._latestOpportunityId;
    if (!oppId) return;
    const entries = Object.entries(completionFlags || {});
    const nextValues = entries
      .filter(([, value]) => value)
      .map(([label]) => label);
    const normalizedNext = new Set(nextValues.map(normalizeOpportunityChecklistLabel));
    const currentSet = window._opportunityChecklistState?.normalizedSet || new Set();
    if (setsEqual(normalizedNext, currentSet)) {
      return;
    }

    const apply = (values) => {
      syncOpportunityChecklist._pending = window.updateOpportunityCustomFields(oppId, [
        { id: fieldId, field_value: values }
      ]).then(() => {
        window._opportunityChecklistState = createChecklistState(values);
      }).catch((err) => {
        console.warn('[Checklist] Failed to sync opportunity checklist', err);
      }).finally(() => {
        syncOpportunityChecklist._pending = null;
        if (syncOpportunityChecklist._next) {
          const queued = syncOpportunityChecklist._next;
          syncOpportunityChecklist._next = null;
          apply(queued);
        }
      });
    };

    if (syncOpportunityChecklist._pending) {
      syncOpportunityChecklist._next = nextValues;
      return;
    }

    syncOpportunityChecklist._next = null;
    apply(nextValues);
  }

  function forceChecklistFlag(label, value) {
    if (!label) return;
    if (value) {
      setChecklistFlagSuppression(label, false);
    }
    window._latestChecklistFlags = window._latestChecklistFlags || {};
    window._latestChecklistFlags[label] = !!value;
    window._pendingChecklistFlags = window._pendingChecklistFlags || {};
    window._pendingChecklistFlags[label] = !!value;
    updateLocalChecklistState(label, !!value);
    syncChecklistField(window._latestChecklistFlags);
  }
  window.forceChecklistFlag = forceChecklistFlag;

  function markChecklistCompletion(label) {
    if (!label || typeof window.forceChecklistFlag !== 'function') return;
    window.forceChecklistFlag(label, true);
    if (typeof window.renderChecklist === 'function') {
      window.renderChecklist();
    }
  }
  window.markChecklistCompletion = markChecklistCompletion;

  function toTitleCase(str) {
    if (!str) return '';
    return String(str)
      .replace(/[_\-]+/g, ' ')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/^./, c => c.toUpperCase());
  }

  function formatMultiline(value) {
    if (value == null) return '';
    const safe = window.escapeHtml ? window.escapeHtml(String(value)) : String(value);
    return safe.replace(/\r?\n/g, '<br>');
  }

  function formatCoachDisplay(name) {
    if (!name) return '';
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    if (parts.length === 1) return parts[0];
    const first = parts[0];
    const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
    return `${first} ${lastInitial}.`;
  }

  function getCommitmentIndicator(score) {
    const mapping = {
      1: { emoji: '😐', label: 'Indifferent' },
      2: { emoji: '🤔', label: 'Unsure' },
      3: { emoji: '🙂', label: 'Warming up' },
      4: { emoji: '💪', label: 'Ready' },
      5: { emoji: '🔥', label: 'All-in' }
    };
    return mapping[score] || null;
  }

  function renderSignature(signatureData) {
    if (!signatureData) return '';
    return `
      <div style="margin-top:1.2rem;">
        <h4 style="margin:0 0 0.35rem;">Signature</h4>
        <div style="padding:12px;border:1px solid #d6e0f2;border-radius:8px;background:#fff;">
          <img src="${signatureData}" alt="Signature" style="max-width:100%;height:auto;">
        </div>
      </div>
    `;
  }

  function buildTermsHtml(termKey) {
    const term = window.TERMS_LIBRARY ? window.TERMS_LIBRARY[termKey] : null;
    if (!term) {
      return `<p style="color:#5b657a;">No terms content found.</p>`;
    }
    const fields = window._latestContactFields || {};
    const sections = (term.sections || []).map(section => {
      const heading = window.escapeHtml ? window.escapeHtml(section.heading || '') : section.heading || '';
      const bullets = Array.isArray(section.bullets) ? section.bullets : [];
      const bulletHtml = bullets.length
        ? `<ul style="padding-left:1.2em;line-height:1.7;margin:0;">${bullets.map(item => `<li>${window.escapeHtml ? window.escapeHtml(item) : item}</li>`).join('')}</ul>`
        : '';
      return `
        <section style="margin-bottom:1.2rem;">
          <h4 style="margin:0 0 0.4rem;">${heading}</h4>
          ${bulletHtml}
        </section>
      `;
    }).join('');
    const acknowledgements = Array.isArray(term.acknowledgements) ? term.acknowledgements : [];
    const ackSection = acknowledgements.length ? `
      <section style="margin-bottom:1.2rem;">
        <h4 style="margin:0 0 0.4rem;">Acknowledgements</h4>
        <ul style="padding-left:1.2em;line-height:1.7;margin:0;">
          ${acknowledgements.map(ack => {
            const rawVal = fields[ack.fieldId];
            let displayVal = '';
            if (Array.isArray(rawVal)) {
              displayVal = rawVal[0] ? String(rawVal[0]).trim() : '';
            } else if (rawVal != null) {
              displayVal = String(rawVal).trim();
            }
            const valueText = displayVal ? displayVal : 'Not recorded';
            return `<li><strong>${window.escapeHtml ? window.escapeHtml(ack.text || '') : (ack.text || '')}</strong><br><span style="color:#5b657a;">${window.escapeHtml ? window.escapeHtml(valueText) : valueText}</span></li>`;
          }).join('')}
        </ul>
      </section>
    ` : '';
    const signatureFieldId = term.signatureFieldId;
    const signatureMarkup = signatureFieldId ? renderSignature(fields[signatureFieldId]) : '';
    return `${sections}${ackSection}${signatureMarkup}`;
  }

  function buildInductionHtml() {
    const slides = Array.isArray(window.INITIAL_INDUCTION_SLIDES) ? window.INITIAL_INDUCTION_SLIDES : [];
    if (!slides.length) {
      return `<p style="color:#5b657a;">Induction content is not available.</p>`;
    }
    const fields = window._latestContactFields || {};
    const sections = slides.map(slide => {
      const title = window.escapeHtml ? window.escapeHtml(slide.title || '') : slide.title || '';
      let bodyHtml = '';
      if (slide.body) {
        bodyHtml = slide.body;
      } else if (Array.isArray(slide.points)) {
        bodyHtml = `<ul style="padding-left:1.2em;line-height:1.7;margin:0;">${slide.points.map(item => `<li>${window.escapeHtml ? window.escapeHtml(item) : item}</li>`).join('')}</ul>`;
      }
      return `
        <section style="margin-bottom:1.4rem;">
          <h4 style="margin:0 0 0.4rem;">${title}</h4>
          <div style="line-height:1.7;color:#2f3c55;">${bodyHtml}</div>
        </section>
      `;
    }).join('');
    const signatureMarkup = renderSignature(fields[window.FIELDS?.INDUCTION_SIGNATURE]);
    return `${sections}${signatureMarkup}`;
  }

  function buildParqHtml() {
    const fields = window._latestContactFields || {};
    const storedRaw = getStoredParqPayload(fields);
    const parsed = typeof parseParqState === 'function' ? parseParqState(storedRaw) : { responses: {} };
    const storedResponses = parsed.responses || {};
    const fieldIds = window.PARQ_FIELD_IDS || {};
    const questions = Array.isArray(window.PARQ_QUESTIONS) ? window.PARQ_QUESTIONS : [];
    if (!questions.length) {
      return `<p style="color:#5b657a;">Health form data is not available.</p>`;
    }
    const rows = questions.map(question => {
      const id = question.id;
      const stored = storedResponses[id] || {};
      let answer = stored.answer || '';
      if (!answer && fieldIds[id]) {
        const raw = fields[fieldIds[id]];
        answer = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
      }
      if (answer !== 'yes' && answer !== 'no') {
        answer = '';
      }
      const friendlyAnswer = answer ? (answer === 'yes' ? 'Yes' : 'No') : 'Not answered';
      const detail = stored.detail ? formatMultiline(stored.detail) : '';
      const detailHtml = detail ? `<div style="margin-top:0.35rem;color:#51607d;">${detail}</div>` : '';
      const prompt = window.escapeHtml ? window.escapeHtml(question.label || '') : question.label || '';
      return `
        <tr>
          <td style="padding:10px;border-top:1px solid #e3edfa;vertical-align:top;width:40%;font-weight:600;">${prompt}</td>
          <td style="padding:10px;border-top:1px solid #e3edfa;">
            <div><strong>${friendlyAnswer}</strong></div>
            ${detailHtml}
          </td>
        </tr>
      `;
    }).join('');
    const signatureMarkup = renderSignature(fields[window.FIELDS?.PARQ_SIGNATURE]);
    return `
      <div style="overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${signatureMarkup}
    `;
  }

  function formatParqStorageSummary(rawValue) {
    if (!rawValue) return '';
    let parsed = null;
    if (typeof parseParqState === 'function') {
      try {
        parsed = parseParqState(rawValue);
      } catch (_) {}
    }
    if (!parsed) {
      try {
        parsed = JSON.parse(rawValue);
      } catch (_) {
        parsed = null;
      }
    }
    if (!parsed) return '';
    const responses = parsed.responses || parsed;
    const questions = Array.isArray(window.PARQ_QUESTIONS) ? window.PARQ_QUESTIONS : [];
    if (!questions.length) return '';
    const items = questions.map(q => {
      const entry = responses[q.id] || {};
      const answerRaw = typeof entry.answer === 'string' ? entry.answer.toLowerCase() : '';
      const friendly = answerRaw === 'yes' ? 'Yes' : answerRaw === 'no' ? 'No' : 'Not answered';
      const detail = entry.detail ? ` <span style="color:#51607d;">${window.escapeHtml ? window.escapeHtml(entry.detail) : entry.detail}</span>` : '';
      const label = window.escapeHtml ? window.escapeHtml(q.label || '') : (q.label || '');
      return `<li style="margin:0 0 0.4rem;"><strong>${label}:</strong> ${friendly}${detail}</li>`;
    }).join('');
    return `<ul style="margin:0;padding-left:1.2em;line-height:1.6;">${items}</ul>`;
  }

  function buildConsultationHtml() {
    const fields = window._latestContactFields || {};
    const consultFields = window.CONSULT_FIELDS || {};
    const entries = Object.entries(consultFields);
    if (!entries.length) {
      return `<p style="color:#5b657a;">Consultation responses are not available.</p>`;
    }
    const priorityKeys = ['feelStrong', 'lookGood', 'consistency', 'stayHealthy', 'feelBetter', 'familyExample', 'community', 'pushLimits'];
    const priorities = [];
    const generalRows = [];
    let commitmentScore = null;
    const valueConfig = Array.isArray(window.VALUE_FIELD_CONFIG) ? window.VALUE_FIELD_CONFIG : [];
    const friendlyLabels = {
      experience: 'Gym experience / knowledge',
      challenges: 'Past challenges',
      ptHistory: 'Have you worked with a PT before?',
      budget: 'Budget for coaching',
      whyReachOut: 'Why now?',
      currentWeight: 'Current weight (kg)',
      height: 'Height (cm)',
      availability: 'Weekly time commitment',
      parentStatus: 'Parent status'
    };

    const hasValue = (val) => {
      if (val == null) return false;
      if (typeof val === 'string') return val.trim() !== '';
      return true;
    };

    entries.forEach(([key, fieldId]) => {
      if (!fieldId || key === 'serviceInterest') return;
      const raw = fields[fieldId];
      const stringValue = raw != null ? String(raw).trim() : '';
      if (!hasValue(stringValue)) {
        return;
      }

      if (key === 'commitment') {
        const numeric = Number(stringValue);
        if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 5) {
          commitmentScore = Math.round(numeric);
        }
        return;
      }

      if (priorityKeys.includes(key)) {
        const numeric = Number(stringValue);
        if (Number.isFinite(numeric) && numeric >= 1) {
          priorities.push({
            key,
            label: toTitleCase(key),
            score: Math.round(numeric),
            index: priorityKeys.indexOf(key)
          });
        }
        return;
      }

      if (key === 'parqStorage') {
        const summaryHtml = formatParqStorageSummary(stringValue);
        const label = 'Health screening (PAR-Q)';
        generalRows.push({
          label,
          value: summaryHtml || `<pre style="white-space:pre-wrap;font-family:monospace;background:#f7f9ff;border:1px solid #e3edfa;border-radius:8px;padding:10px;margin:0;">${window.escapeHtml ? window.escapeHtml(stringValue) : stringValue}</pre>`
        });
        return;
      }

      const label = friendlyLabels[key] || toTitleCase(key);
      const value = formatMultiline(raw || '');
      generalRows.push({ label, value });
    });

    const addExtraRow = (fieldId, key) => {
      if (!fieldId) return;
      const raw = fields[fieldId];
      if (!hasValue(raw)) return;
      const label = friendlyLabels[key] || key;
      generalRows.push({ label, value: formatMultiline(raw || '') });
    };

    addExtraRow(window.FIELDS?.AVAILABILITY_TIME, 'availability');
    addExtraRow(window.FIELDS?.PARENT_STATUS, 'parentStatus');

    const topPriorities = priorities
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.index - b.index;
      })
      .slice(0, 3);

    const prioritiesSection = topPriorities.length ? `
      <section style="margin-bottom:1.4rem;">
        <h3 style="margin:0 0 0.6rem;color:#1f3c88;">Top priorities right now</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;">
          ${topPriorities.map(item => `
            <div style="background:#f7f9ff;border:1px solid #d6e0f2;border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:4px;">
              <span style="font-weight:600;color:#1f3c88;">${window.escapeHtml ? window.escapeHtml(item.label) : item.label}</span>
              <span style="color:#2f3c55;font-size:0.95em;">${item.score}/5</span>
            </div>
          `).join('')}
        </div>
      </section>
    ` : '';

    const valueRows = valueConfig.map(item => {
      const fieldId = consultFields[item.key];
      const rawScore = fieldId ? (fields[fieldId] || '') : '';
      const numericScore = Number(rawScore);
      const displayScore = rawScore ? `${rawScore}/5` : 'Not answered';
      return {
        label: item.label,
        score: Number.isFinite(numericScore) ? numericScore : -Infinity,
        display: displayScore
      };
    }).sort((a, b) => b.score - a.score);

    const fullValuesSection = valueRows.length ? `
      <section style="margin-bottom:1.4rem;">
        <h3 style="margin:0 0 0.6rem;color:#1f3c88;">All value ratings</h3>
        <div style="overflow:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #e3edfa;">Value</th>
                <th style="text-align:left;padding:8px;border-bottom:1px solid #e3edfa;">Score (1-5)</th>
              </tr>
            </thead>
            <tbody>
              ${valueRows.map(row => `
                <tr>
                  <td style="padding:8px;border-bottom:1px solid #edf2ff;">${window.escapeHtml ? window.escapeHtml(row.label) : row.label}</td>
                  <td style="padding:8px;border-bottom:1px solid #edf2ff;">${window.escapeHtml ? window.escapeHtml(row.display) : row.display}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    ` : '';

    const commitmentSection = (() => {
      if (commitmentScore == null) return '';
      const indicator = getCommitmentIndicator(commitmentScore);
      const emoji = indicator ? indicator.emoji : '';
      const description = indicator ? indicator.label : 'Ready';
      return `
        <section style="margin-bottom:1.4rem;">
          <h3 style="margin:0 0 0.6rem;color:#1f3c88;">Commitment to change</h3>
          <div style="display:flex;align-items:center;gap:0.75rem;background:#f7f9ff;border:1px solid #d6e0f2;border-radius:10px;padding:12px;">
            ${emoji ? `<span role="img" aria-label="${window.escapeHtml ? window.escapeHtml(description) : description}" style="font-size:1.8rem;line-height:1;">${emoji}</span>` : ''}
            <div style="color:#2f3c55;">
              <div style="font-weight:600;">${commitmentScore}/5</div>
              <div style="font-size:0.95em;">${window.escapeHtml ? window.escapeHtml(description) : description}</div>
            </div>
          </div>
        </section>
      `;
    })();

    const generalSection = generalRows.length ? `
      <section>
        <h3 style="margin:0 0 0.6rem;color:#1f3c88;">Consultation responses</h3>
        <div style="overflow:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <tbody>
              ${generalRows.map(row => `
                <tr>
                  <td style="padding:10px;border-top:1px solid #e3edfa;vertical-align:top;width:35%;font-weight:600;">${window.escapeHtml ? window.escapeHtml(row.label) : row.label}</td>
                  <td style="padding:10px;border-top:1px solid #e3edfa;">${row.value}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    ` : '';

    const content = [prioritiesSection, fullValuesSection, commitmentSection, generalSection].filter(Boolean).join('');
    return content || `<p style="color:#5b657a;">Consultation responses are not available.</p>`;
  }

  function buildEnquiryHtml() {
    const contact = window._latestContact || {};
    const fields = window._latestContactFields || {};
    const F = window.FIELDS || {};
    const C = window.CONSULT_FIELDS || {};

    const rows = [];
    const addRow = (label, rawValue) => {
      if (rawValue == null) return;
      const str = String(rawValue).trim();
      if (!str) return;
      rows.push({ label, value: formatMultiline(rawValue) });
    };

    const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ').trim();
    const email = contact.email || contact.Email || contact.emailAddress || '';
    const phone = contact.phone || contact.phoneNumber || '';
    addRow('Name', fullName);
    addRow('Email', email);
    addRow('Phone', phone);

    const serviceTypeRaw = C.serviceType ? fields[C.serviceType] : '';
    const selectedService = serviceTypeRaw;
    addRow('Which service are you looking for?', selectedService);

    const membershipIntentRaw = C.membershipIntent ? fields[C.membershipIntent] : '';
    const legacyMemberTypeRaw = C.serviceInterest ? fields[C.serviceInterest] : '';
    const serviceInterestValue = (() => {
      const str = typeof membershipIntentRaw === 'string' ? membershipIntentRaw.trim() : '';
      if (str) return str;
      const legacy = typeof legacyMemberTypeRaw === 'string' ? legacyMemberTypeRaw.trim() : '';
      if (!legacy) return '';
      const normalized = legacy.toLowerCase();
      if (normalized === 'membership enquiry' || normalized.includes('drop-in')) return legacy;
      return '';
    })();
    const normalizedServiceType = String(serviceTypeRaw || selectedService || '').toLowerCase();
    const serviceIsCoached = normalizedServiceType.includes('coach');
    const serviceIsOpenGym = normalizedServiceType.includes('open');
    const shouldShowMemberDrop = (serviceIsCoached || serviceIsOpenGym || (!serviceTypeRaw && !!serviceInterestValue));
    if (shouldShowMemberDrop && serviceInterestValue) {
      addRow('Are you enquiring about Gym membership, or looking to drop-in to the gym as a non-member?', serviceInterestValue);
    }

    const joinClasses = C.joinClasses ? fields[C.joinClasses] : '';
    if (!serviceIsOpenGym && joinClasses) {
      addRow('Are you looking to join our coached classes?', joinClasses);
    }

    const referralCandidates = [
      F.REFERRED_BY_MEMBER && fields[F.REFERRED_BY_MEMBER],
      F.REFERRAL_NAME && fields[F.REFERRAL_NAME],
      C.referredByExistingMember && fields[C.referredByExistingMember],
      contact.referredBy,
      contact.referred_by,
      contact.referredByExistingMember
    ];
    const referralValue = referralCandidates.find(value => {
      if (value == null) return false;
      return String(value).trim() !== '';
    });
    addRow('Referred by existing member?', referralValue || '');

    if (!rows.length) {
      return `<p style="color:#5b657a;">No enquiry details available.</p>`;
    }

    const rowsHtml = rows.map(row => `
      <tr>
        <td style="padding:10px;border-top:1px solid #e3edfa;vertical-align:top;width:35%;font-weight:600;">${window.escapeHtml ? window.escapeHtml(row.label) : row.label}</td>
        <td style="padding:10px;border-top:1px solid #e3edfa;">${row.value}</td>
      </tr>
    `).join('');
    return `
      <div style="overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;
  }

  function buildSessionDebriefHtml() {
    const statements = Array.isArray(window.INITIAL_DEBRIEF_QUESTIONS) ? window.INITIAL_DEBRIEF_QUESTIONS : [];
    if (!statements.length) {
      return `<p style="color:#5b657a;">Session debrief statements unavailable.</p>`;
    }
    return `
	      <div style="background:#f7f9ff;border:1px solid #d6e0f2;border-radius:12px;padding:var(--checklist-inner-card-pad-y, 16px) var(--checklist-inner-card-pad-x, 16px);">
        <p style="margin:0 0 0.75rem;color:#1f3c88;font-weight:600;">Confirmed during your session debrief:</p>
        <ul style="margin:0;padding-left:1.2em;line-height:1.7;color:#2f3c55;">
          ${statements.map(item => `<li>${window.escapeHtml ? window.escapeHtml(item) : item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function buildCombinedTermsHtml(termKeys) {
    const keys = Array.isArray(termKeys) ? termKeys : [];
    if (!keys.length) {
      return `<p style="color:#5b657a;">No terms provided.</p>`;
    }
    return keys.map(key => {
      const term = window.TERMS_LIBRARY ? window.TERMS_LIBRARY[key] : null;
      const title = term ? (term.title || term.label || key) : key;
      return `
        <section style="margin-bottom:1.6rem;">
          <h3 style="margin:0 0 0.6rem;color:#1f3c88;">${window.escapeHtml ? window.escapeHtml(title) : title}</h3>
          ${buildTermsHtml(key)}
        </section>
      `;
    }).join('');
  }

  const CONSULT_REMINDER_COMPLETE_STATUSES = ['checked-in', 'checked in', 'completed', 'complete', 'showed', 'attended'];

  function hideConsultationReminderModal(dismiss) {
    const modal = document.getElementById('consultation-reminder-modal');
    if (!modal) return;
    modal.style.display = 'none';
    window._consultReminderVisible = false;
    if (dismiss) {
      window._consultReminderDismissed = true;
    } else {
      window._consultReminderDismissed = false;
    }
    const stillOpen = Array.from(document.querySelectorAll('.info-modal, .fullscreen-modal, .consultation-modal-overlay'))
      .some(el => {
        if (!el) return false;
        const style = window.getComputedStyle ? getComputedStyle(el) : null;
        if (style) return style.display !== 'none';
        return el.style && el.style.display && el.style.display !== 'none';
      });
    if (!stillOpen) {
      document.body.style.overflow = '';
    }
  }

  function ensureConsultationReminderBindings() {
    const modal = document.getElementById('consultation-reminder-modal');
    if (!modal || modal.dataset.bound === '1') return;
    modal.dataset.bound = '1';
    const closeBtn = modal.querySelector('[data-consult-reminder-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hideConsultationReminderModal(true);
      });
    }
    const actionBtn = modal.querySelector('[data-consult-reminder-action]');
    if (actionBtn) {
      actionBtn.addEventListener('click', (event) => {
        hideConsultationReminderModal(true);
        if (typeof window.handleConsultationLaunch === 'function') {
          window.handleConsultationLaunch(event);
        }
      });
    }
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        hideConsultationReminderModal(true);
      }
    });
  }

  function showConsultationReminderModal(kind) {
    runAfterAppLoading(() => {
      const modal = document.getElementById('consultation-reminder-modal');
      if (!modal) return;
      window._lastConsultReminderKind = kind;
      ensureConsultationReminderBindings();
      const titleEl = modal.querySelector('[data-consult-reminder-title]');
      const textEl = modal.querySelector('[data-consult-reminder-text]');
      const modalCard = modal.querySelector('.consultation-reminder-body');
      if (modalCard) {
        modalCard.classList.toggle('is-dark', document.body.classList.contains('dark-mode'));
      }
      let title = 'Thanks for requesting your intro';
      let text = 'To help us tailor your intro, please complete a few consultation questions and we’ll confirm your appointment as soon as possible.';
      if (kind === 'call') {
        title = "We've received your appointment request!";
        text = "Please complete a few consultation questions so we can tailor your call, and we'll confirm your appointment as soon as possible.";
      } else if (kind === 'intro') {
        title = 'Thanks for requesting an intro!';
        text = "Please complete a few consultation questions so we can tailor your upcoming intro, and we'll get your appointment confirmed ASAP.";
      } else if (kind === 'general') {
        title = 'Complete your consultation';
        text = 'Please complete a few consultation questions so we can tailor your upcoming intro.';
      }
      if (titleEl) titleEl.textContent = title;
      if (textEl) textEl.textContent = text;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      window._consultReminderVisible = true;
    });
  }

  function maybeShowConsultationReminder(contact, fields, tagsSet, introEvent, options) {
    const opts = options || {};
    const hints = opts.hints || window._urlHints || {};
    const consultComplete = !!opts.consultComplete;
    if (consultComplete) {
      hideConsultationReminderModal(false);
      return false;
    }
    if (window._consultReminderDismissed && !hints.consult) {
      return false;
    }
    const introAttended = preferOpportunityFlag(OPPORTUNITY_LABELS.INTRO_ATTENDED, () => getTagBool(tagsSet, window.TAGS?.INTRO_ATTENDED || 'attended intro'));
    let statusComplete = false;
    if (introEvent) {
      const statusStr = String(introEvent.status || introEvent.statusLabel || '').toLowerCase();
      statusComplete = CONSULT_REMINDER_COMPLETE_STATUSES.some(keyword => statusStr.includes(keyword));
    }
    if (introAttended || statusComplete) {
      hideConsultationReminderModal(false);
      return false;
    }
    const F = window.FIELDS || {};
    const introBookingFields = [
      fields[F.APPT_DATE],
    ].filter(Boolean).map(val => String(val).trim()).filter(Boolean);
    const fallbackHasIntroBooking = () => {
      const bookingTags = [
        window.TAGS?.NSI_BOOKED || 'nsi booked',
        window.TAGS?.DC_BOOKED || 'dc booked',
        window.TAGS?.ONBOARDING_PROXY || 'onboarding session booked proxy'
      ].some(tag => getTagBool(tagsSet, tag));
      return introBookingFields.length > 0 || bookingTags || !!introEvent;
    };
    const hasIntroBooking = preferOpportunityFlag(
      [OPPORTUNITY_LABELS.INTRO_CONFIRMED, OPPORTUNITY_LABELS.INTRO_REQUESTED],
      fallbackHasIntroBooking
    );
    const hasRecentHint = !!(hints.bookedIntro || hints.bookedCall);
    if (!hasIntroBooking && !hasRecentHint) {
      hideConsultationReminderModal(false);
      return false;
    }
    if (hints.consult) {
      hideConsultationReminderModal(false);
      return false;
    }
    if (window._consultReminderVisible) {
      return true;
    }
    const type = hints.bookedCall ? 'call' : (hints.bookedIntro ? 'intro' : 'general');
    showConsultationReminderModal(type);
    return true;
  }

  function buildResponseContent(type) {
    switch (type) {
      case 'enquiry':
        return buildEnquiryHtml();
      case 'health':
        return buildParqHtml();
      case 'consultation':
        return buildConsultationHtml();
      case 'session-debrief':
        return buildSessionDebriefHtml();
      case 'induction':
        return buildInductionHtml();
      case 'tcs-combined':
      case 'tcs-gym':
      case 'tcs-trial':
        return buildCombinedTermsHtml(['class t&cs signed', 'annual price review signed']);
      default:
        return `<p style="color:#5b657a;">No responses available for this item.</p>`;
    }
  }

  function showResponseViewer(type) {
    const modal = document.getElementById('response-viewer-modal');
    const body = document.getElementById('response-viewer-body');
    if (!modal || !body) return;
    const content = buildResponseContent(type);
    body.innerHTML = `
      <div style="max-height:70vh;overflow-y:auto;padding-right:4px;">
        ${content}
      </div>
    `;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeResponseViewer() {
    const modal = document.getElementById('response-viewer-modal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('response-viewer-modal');
    if (!modal || modal.dataset.bound === '1') return;
    modal.dataset.bound = '1';
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        closeResponseViewer();
      }
    });
  });

  window.showResponseViewer = showResponseViewer;
  window.closeResponseViewer = closeResponseViewer;



  function percent(done, total) {
    if (!total) return 0;
    return Math.round((done/total)*100);
  }

  // Map custom fields array to { id:value }
  function mapFields(customFields) {
    let entries = [];
    if (Array.isArray(customFields)) {
      entries = customFields;
    } else if (customFields && Array.isArray(customFields.customField)) {
      entries = customFields.customField;
    } else if (customFields && Array.isArray(customFields.customFields)) {
      entries = customFields.customFields;
    }
    const map = {};
    entries.forEach(f => {
      if (f && f.id) map[f.id] = f.value;
    });
    return map;
  }

  async function loadPrimaryOpportunity(contactId) {
    if (!contactId || typeof window.fetchContactOpportunities !== 'function') return null;
    try {
      const data = await window.fetchContactOpportunities(contactId);
      const list = Array.isArray(data?.opportunities)
        ? data.opportunities
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];
      if (!list.length) {
        window._latestOpportunity = null;
        window._latestOpportunityId = null;
        window._opportunityChecklistState = createChecklistState([]);
        return null;
      }
      const primary = list.find(item => (item.status || '').toLowerCase() === 'open') || list[0];
      if (!primary) return null;
      const fieldId = window.FIELDS?.OPPORTUNITY_CHECKLIST;
      let rawValues = '';
      if (fieldId && primary.customFields) {
        const oppFields = mapFields(primary.customFields);
        rawValues = oppFields[fieldId] || '';
      }
      const values = parseChecklistFieldValues(rawValues);
      window._latestOpportunity = primary;
      window._latestOpportunityId = primary.id || primary.opportunityId || primary._id || '';
      window._opportunityChecklistState = createChecklistState(values);
      return primary;
    } catch (err) {
      console.warn('[Checklist] Unable to load opportunities', err);
      return null;
    }
  }


  function parseParqState(raw) {
    if (!raw || typeof raw !== 'string') return { responses: {} };
    const trimmed = raw.trim();
    if (!trimmed) return { responses: {} };
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return { responses: {} };
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && parsed.responses && typeof parsed.responses === 'object') {
        return parsed;
      }
    } catch (err) {
      console.debug('[Checklist] Ignoring unparsable stored PAR-Q data');
    }
    return { responses: {} };
  }

  function getStoredParqPayload(fieldMap) {
    if (!fieldMap || typeof fieldMap !== 'object') return '';
    const primaryId = window.PARQ_STORAGE_FIELD;
    if (primaryId) {
      const raw = fieldMap[primaryId];
      if (typeof raw === 'string' && raw.trim()) {
        return raw;
      }
    }
    return '';
  }

  function parqResponsesComplete(responses) {
    const questions = Array.isArray(window.PARQ_QUESTIONS) ? window.PARQ_QUESTIONS : [];
    if (!questions.length) return false;
    return questions.every(question => {
      const entry = responses && responses[question.id];
      if (!entry || (entry.answer !== 'yes' && entry.answer !== 'no')) {
        return false;
      }
      if (entry.answer === 'yes' && question.requiresDetail !== false) {
        return typeof entry.detail === 'string' && entry.detail.trim().length > 0;
      }
      return true;
    });
  }

  function isParqCompleteFromData(fieldMap) {
    if (!fieldMap || typeof fieldMap !== 'object') return false;
    const storedRaw = getStoredParqPayload(fieldMap);
    const parsed = storedRaw ? parseParqState(storedRaw) : { responses: {} };
    if (parqResponsesComplete(parsed.responses || {})) {
      return true;
    }
    const lookup = window.PARQ_FIELD_IDS || {};
    const questions = Array.isArray(window.PARQ_QUESTIONS) ? window.PARQ_QUESTIONS : [];
    if (!questions.length) return false;
    return questions.every(question => {
      const fieldId = lookup[question.id];
      if (!fieldId) return false;
      const raw = fieldMap[fieldId];
      const normalized = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
      if (normalized !== 'yes' && normalized !== 'no') return false;
      if (normalized === 'yes' && question.requiresDetail !== false) {
        const entry = parsed.responses ? parsed.responses[question.id] : null;
        return !!(entry && typeof entry.detail === 'string' && entry.detail.trim());
      }
      return true;
    });
  }

  function parqHasFlaggedResponses(fieldMap) {
    if (!fieldMap || typeof fieldMap !== 'object') return false;
    const storedRaw = getStoredParqPayload(fieldMap);
    if (storedRaw) {
      const parsed = parseParqState(storedRaw);
      if (parsed && parsed.responses && typeof parsed.responses === 'object') {
        if (Object.values(parsed.responses).some(entry => entry && entry.answer === 'yes')) {
          return true;
        }
      }
    }
    const lookup = window.PARQ_FIELD_IDS || {};
    return Object.values(lookup).some(fieldId => {
      if (!fieldId) return false;
      const raw = fieldMap[fieldId];
      if (typeof raw !== 'string') return false;
      return raw.trim().toLowerCase() === 'yes';
    });
  }

  // anchor: checklist.INTRO_BOOKING_BASE_URL
  const INTRO_BOOKING_BASE_URL = 'https://start.bomberspt.co.uk/no-sweat-intro';

  function buildIntroBookingUrl(contactId) {
    const id = contactId || window.contactId || '';
    try {
      const url = new URL(INTRO_BOOKING_BASE_URL);
      if (id) url.searchParams.set('contactId', id);
      return url.toString();
    } catch (_) {
      return id ? `${INTRO_BOOKING_BASE_URL}?contactId=${encodeURIComponent(id)}` : INTRO_BOOKING_BASE_URL;
    }
  }

  // anchor: checklist.INITIAL_SESSION_BASE_URL
  const INITIAL_SESSION_BASE_URL = 'https://bomberspt.pushpress.com/landing/appointments/apptpkg_bbe92d2833fe44a03c1ad31683aa/login';

  function buildInitialBookingUrl(contactId) {
    if (!INITIAL_SESSION_BASE_URL) return '';
    try {
      return new URL(INITIAL_SESSION_BASE_URL).toString();
    } catch (_) {
      return INITIAL_SESSION_BASE_URL;
    }
  }

  function parseUrlHints() {
    const hints = {};
    const toParams = (raw) => {
      if (!raw) return null;
      let str = String(raw);
      if (!str) return null;
      if (str.startsWith('#')) str = str.slice(1);
      if (str.startsWith('/')) str = str.slice(1);
      const qIndex = str.indexOf('?');
      if (qIndex >= 0) str = str.slice(qIndex + 1);
      str = str.replace(/^&+/, '').trim();
      if (!str) return null;
      try { return new URLSearchParams(str); } catch (_) { return null; }
    };
    const apply = (params) => {
      if (!params) return;
      params.forEach((value, key) => {
        const k = (key || '').toLowerCase();
        const v = (value || '').toLowerCase();
        if (!k && !v) return;
        if (k === 'bookedintro' || k === 'booked_intro' || v === 'bookedintro' || v === 'booked_intro') {
          hints.bookedIntro = true;
        }
        if (k === 'bookedcall' || k === 'booked_call' || v === 'bookedcall' || v === 'booked_call') {
          hints.bookedCall = true;
        }
        if (k === 'consult' && v !== '0') {
          hints.consult = true;
        }
        if (k === 'pageview' || k === 'page_view') {
          hints.pageView = value;
        }
        if (k === 'staff' && isTruthyParam(value)) {
          hints.staff = true;
        }
        if (k === 'stage') {
          hints.stage = v;
          if (v === 'bookedintro') hints.stageBookedIntro = true;
        }
        if (k === 'strongmums' && v !== '0') {
          hints.strongMums = true;
        }
        if (k === 'pt' && v !== '0') {
          hints.pt = true;
        }
      });
    };
    try {
      apply(new URLSearchParams(window.location.search));
      if (window.location.hash && window.location.hash.length > 1) {
        apply(toParams(window.location.hash));
      }
      // Some embedders stash query params into the pathname (e.g. /bookedintro=1)
      if (window.location.pathname) {
        apply(toParams(window.location.pathname));
      }
    } catch (_) {}
    if (hints.stageBookedIntro) hints.bookedIntro = true;
    return hints;
  }

  async function loadIntroAppointment(contactId, fieldsMap) {
    if (!contactId || typeof window.fetchContactAppointments !== 'function') return null;
    try {
      const data = await window.fetchContactAppointments(contactId);
      const events = Array.isArray(data?.events) ? data.events : Array.isArray(data?.appointments) ? data.appointments : [];
      if (!events.length) return null;
      const safeLower = (value) => String(value || '').toLowerCase();
      const pickTitle = (evt) => (
        evt?.title ||
        evt?.appointmentTitle ||
        evt?.calendarTitle ||
        evt?.calendarName ||
        evt?.serviceName ||
        evt?.name ||
        evt?.type ||
        ''
      );
      const parseStartToIso = (evt) => {
        const raw =
          evt?.startTime ||
          evt?.startDateTime ||
          evt?.startDate ||
          evt?.start ||
          evt?.appointmentStartTime ||
          evt?.startTimeMs ||
          evt?.startTimeStamp ||
          null;
        if (raw == null || raw === '') return { iso: '', ms: null };
        if (typeof raw === 'number' && Number.isFinite(raw)) {
          const ms = raw < 2000000000 ? raw * 1000 : raw;
          const d = new Date(ms);
          return { iso: isNaN(d) ? '' : d.toISOString(), ms: isNaN(d) ? null : ms };
        }
        const str = String(raw).trim();
        if (/^\d+$/.test(str)) {
          const num = Number(str);
          if (Number.isFinite(num)) {
            const ms = num < 2000000000 ? num * 1000 : num;
            const d = new Date(ms);
            return { iso: isNaN(d) ? '' : d.toISOString(), ms: isNaN(d) ? null : ms };
          }
        }
        const parsed = new Date(str);
        return { iso: isNaN(parsed) ? '' : parsed.toISOString(), ms: isNaN(parsed) ? null : parsed.getTime() };
      };

      const normalised = events.map((evt) => {
        const title = String(pickTitle(evt) || '').trim();
        const { iso, ms } = parseStartToIso(evt);
        const statusLabel = evt?.appointmentStatus || evt?.statusLabel || evt?.status || evt?.appointment_status || '';
        const status = safeLower(statusLabel);
        return { raw: evt, title, titleLower: safeLower(title), startIso: iso, startMs: ms, status, statusLabel };
      });

      const keywords = ['intro', 'no-sweat', 'no sweat', 'discovery', 'call'];
      const keywordMatches = normalised.filter(evt => keywords.some(keyword => evt.titleLower.includes(keyword)));
      const shortlist = keywordMatches.length ? keywordMatches : normalised;
      const sortable = shortlist.filter(evt => Number.isFinite(evt.startMs));
      const sorted = sortable.length ? sortable.slice().sort((a, b) => a.startMs - b.startMs) : shortlist;
      const now = Date.now();
      const chosen = sorted.find(evt => Number.isFinite(evt.startMs) && evt.startMs >= now)
        || sorted[0]
        || null;
      const introEvent = chosen?.raw || null;
      if (!introEvent) return null;

      const coachFallback = fieldsMap?.[window.FIELDS?.APPT_COACH] || '';
      const coachName =
        introEvent.coachName ||
        introEvent.coach ||
        introEvent.assignedUserName ||
        introEvent.user?.name ||
        coachFallback;

      let selectedSlot = introEvent.selectedSlot || introEvent.selected_slot || introEvent.slot || introEvent.rawSelectedSlot || null;
      if (!selectedSlot && introEvent) {
        const calId = introEvent.calendarId || introEvent.raw?.calendarId;
        const start = introEvent.startTime || introEvent.raw?.startTime;
        if (calId && start) {
          selectedSlot = toIsoSlot(start);
        } else if (start) {
          selectedSlot = toIsoSlot(start);
        }
      }
      const selectedTimezone = introEvent.selectedTimezone || introEvent.selected_timezone || introEvent.timezone || introEvent.selectedTimeZone || 'Europe/London';

      const appointmentId = introEvent?.id || introEvent?.appointmentId || introEvent?._id || introEvent?.raw?.id || '';
      const recordKey = appointmentId ? String(appointmentId) : '';
      const slotRecord = { slot: selectedSlot, timezone: selectedTimezone };
      if (recordKey) {
        introSlotCache.set(recordKey, slotRecord);
      }

      return {
        raw: introEvent,
        status: String(chosen?.status || introEvent.appointmentStatus || introEvent.statusLabel || introEvent.status || '').toLowerCase(),
        statusLabel: chosen?.statusLabel || introEvent.appointmentStatus || introEvent.statusLabel || introEvent.status || '',
        startTime: chosen?.startIso || introEvent.startTime || introEvent.startDateTime || introEvent.startDate || '',
        coach: coachName,
        title: chosen?.title || introEvent.title || '',
        updatedAt: introEvent.dateUpdated || introEvent.updatedAt || '',
        createdAt: introEvent.dateAdded || introEvent.createdAt || '',
        selectedSlot,
        selectedTimezone,
        appointmentId: recordKey
      };
    } catch (err) {
      console.error('[Checklist] loadIntroAppointment error', err);
      return null;
    }
  }

  function syncIntroChecklistFromNative(introEvent) {
    if (!introEvent || typeof window.forceChecklistFlag !== 'function' || !window.OPPORTUNITY_LABELS) return;
    const statusRaw = String(introEvent.statusLabel || introEvent.status || '').toLowerCase();
    const markFlag = (label, value) => {
      if (!label) return;
      const hasValue = hasChecklistFieldValue(window._checklistFieldState, label);
      if (value && !hasValue) {
        window.forceChecklistFlag(label, true);
      } else if (!value && hasValue) {
        window.forceChecklistFlag(label, false);
      }
    };
    const reqLabel = window.OPPORTUNITY_LABELS.INTRO_REQUESTED;
    const confLabel = window.OPPORTUNITY_LABELS.INTRO_CONFIRMED;
    const showLabel = window.OPPORTUNITY_LABELS.INTRO_ATTENDED;

    const isConfirmed = statusRaw.includes('confirm');
    const isShowed = statusRaw.includes('show');
    const isCancelled =
      statusRaw.includes('cancel') ||
      statusRaw.includes('canceled') ||
      statusRaw.includes('no-show') ||
      statusRaw.includes('noshow');
    const isRequested =
      statusRaw.includes('request') ||
      statusRaw === 'new' ||
      (!isCancelled && !isConfirmed && !isShowed);

    if (isShowed) {
      markFlag(showLabel, true);
      markFlag(confLabel, true);
      markFlag(reqLabel, true);
      return;
    }
    if (isConfirmed) {
      markFlag(showLabel, false);
      markFlag(confLabel, true);
      markFlag(reqLabel, true);
      return;
    }
    if (isRequested) {
      markFlag(showLabel, false);
      markFlag(confLabel, false);
      markFlag(reqLabel, true);
      return;
    }
  }

  const LOCK_MESSAGES = {
    initial1: 'Book your intro and record blood pressure to unlock your initial 1-1 tasks.',
    trial: 'Finish your initial 1-1 tasks to unlock plan selection.'
  };

const INITIAL_DEBRIEF_QUESTIONS = [
  'I can manage the screening weights on all primary strength exercises.',
  'I am confident using cardio equipment and functional movements.',
  'My coach and I agree I can safely join classes or open gym without further support.'
];

function getDebriefStorageKey(contactId) {
  if (!contactId) return null;
  return `checklist.debrief:${contactId}`;
}

function persistDebriefInsights(insights) {
  if (!insights || !insights.contactId) return;
  try {
    window._latestDebriefInsights = insights;
    const key = getDebriefStorageKey(insights.contactId);
    if (key && typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(insights));
    }
  } catch (_) {
    // ignore storage failures silently
  }
}

function loadDebriefInsights(contactId) {
  const key = getDebriefStorageKey(contactId);
  if (!key) return null;
  if (window._latestDebriefInsights && window._latestDebriefInsights.contactId === contactId) {
    return window._latestDebriefInsights;
  }
  const fields = window._latestContactFields || {};
  if (fields.__debriefAnswers) {
    try {
      const parsed = JSON.parse(fields.__debriefAnswers);
      return {
        contactId,
        answers: parsed,
        hasConcerns: fields.__debriefHasConcerns === 'yes',
        timestamp: Date.now()
      };
    } catch (_) {}
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.contactId === contactId) {
          return parsed;
        }
      }
    }
  } catch (_) {}
  return null;
}

  let stageStatusSnapshot = {
    enquiry: { unlocked: true, complete: false },
    initial1: { unlocked: false, complete: false },
    trial: { unlocked: false, complete: false }
  };

	  function setActiveTab(key) {
	    const status = stageStatusSnapshot && stageStatusSnapshot[key];
	    if (status && !status.unlocked) return false;
	    $$('.checklist-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.target === key));
	    $$('.checklist-section').forEach(sec => sec.classList.toggle('active', sec.id === `${key}-section`));
	    const heading = $('.checklist-heading');
	    if (heading) heading.textContent = 'Your onboarding journey with BombersPT';
	    window.currentSection = key;
	    try {
	      sessionStorage.setItem('checklist-active-stage', key);
	    } catch (_) {}
	    return true;
	  }

	  const CHECKLIST_HASH_TAB_TO_STAGE = {
	    enquiry: 'enquiry',
	    initial121: 'initial1',
	    chooseplan: 'trial'
	  };
	  const CHECKLIST_STAGE_TO_HASH_TAB = {
	    enquiry: 'enquiry',
	    initial1: 'initial121',
	    trial: 'chooseplan'
	  };
	  const CHECKLIST_HASH_MODAL_ROUTES = new Set([
	    'plans',
	    'timetable',
	    'onboarding',
	    'blueprint',
	    'faqs',
	    'tcs',
	    'consultation',
	    'terms'
	  ]);

	  let checklistHashSyncing = false;

	  function navigateToChecklistHashRoute(route) {
	    if (typeof window.setChecklistHashRoute !== 'function') return;
	    if (route === 'consultation') {
	      try {
	        const current = (window.location.hash || '').trim();
	        if (current && current.toLowerCase() !== '#consultation') {
	          sessionStorage.setItem('consultation.returnHash', current);
	        }
	      } catch (_) {}
	    }
	    window.setChecklistHashRoute(route);
	  }

	  function closeChecklistRouteModals() {
	    try { window.closeMembershipModal?.(); } catch (_) {}
	    try { window.closeTimetableModal?.(); } catch (_) {}
	    try { window.closeOnboardingWorksModal?.(); } catch (_) {}
	    try { window.closeBlueprintModal?.(); } catch (_) {}
	    try { window.closeFaqsModal?.(); } catch (_) {}
	    try { window.closeTcsModal?.(); } catch (_) {}
	  }

	  function openChecklistRouteModal(route) {
	    if (route === 'plans') return window.showMembershipModal?.();
	    if (route === 'timetable') return window.showTimetableModal?.();
	    if (route === 'onboarding') return window.showOnboardingWorksModal?.();
	    if (route === 'blueprint') return window.showBlueprintModal?.();
	    if (route === 'faqs') return window.showFaqsModal?.();
	    if (route === 'tcs') return window.showTcsModal?.();
	    return null;
	  }

	  function syncChecklistFromHashRoute(force) {
	    if (checklistHashSyncing) return;
	    if (typeof window.getChecklistHashRoute !== 'function') return;
	    const route = window.getChecklistHashRoute();
	    if (!route) return;

	    checklistHashSyncing = true;
	    try {
	      if (route in CHECKLIST_HASH_TAB_TO_STAGE) {
	        closeChecklistRouteModals();
	        const stageKey = CHECKLIST_HASH_TAB_TO_STAGE[route];
	        const ok = setActiveTab(stageKey);
	        if (!ok && force !== true) {
	          navigateToChecklistHashRoute(window.getChecklistHubHashRoute ? window.getChecklistHubHashRoute() : 'enquiry');
	        }
	        return;
	      }

	      if (CHECKLIST_HASH_MODAL_ROUTES.has(route)) {
	        closeChecklistRouteModals();
	        if (route === 'consultation' || route === 'terms') {
	          return;
	        }
	        openChecklistRouteModal(route);
	      }
	    } finally {
	      checklistHashSyncing = false;
	    }
	  }

	  window.addEventListener('hashchange', () => syncChecklistFromHashRoute(true));

    function showAlert() {
      const el = document.getElementById('checklist-alert');
      if (!el) return;
      el.style.display = 'none';
      el.textContent = '';
      el.innerHTML = '';
      delete el.dataset.ctaUrl;
      delete el.dataset.alertCta;
      el.style.cursor = '';
    }


  // "Next step" alert banners removed (we rely on next-action highlights instead).
	function bindNav() {
	    $$('.checklist-tab').forEach(btn => {
	      btn.addEventListener('click', (event) => {
	        const target = btn.dataset.target;
	        if (btn.classList.contains('locked')) {
	          event.preventDefault();
	          const message = btn.dataset.lockMessage || LOCK_MESSAGES[target] || 'This stage is locked for now.';
	          if (message) {
	            window.alert(message);
	          }
	          return;
	        }
	        window._userClickedSection = true;
	        const route = CHECKLIST_STAGE_TO_HASH_TAB[target] || '';
	        if (route) {
	          navigateToChecklistHashRoute(route);
	          syncChecklistFromHashRoute(true);
	        } else {
	          setActiveTab(target);
	        }
	      });
	    });
	  }

  function bindAuxMenu() {
    const quickLinks = document.querySelector('.quick-links');
    if (!quickLinks || quickLinks.dataset.bound === '1') return;
    quickLinks.dataset.bound = '1';

    const toggleBtn = quickLinks.querySelector('[data-toggle-menu]');
    const dropdown = quickLinks.querySelector('.quick-links__dropdown');
    const body = document.body;

    if (!toggleBtn || !dropdown) return;

    let collapsed = false;
    let lastScrollY = window.scrollY || 0;
    let ticking = false;

    const closeMenu = () => {
      if (dropdown.hidden) return;
      dropdown.hidden = true;
      quickLinks.classList.remove('menu-open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    };

    const openMenu = () => {
      if (!dropdown.hidden) return;
      dropdown.hidden = false;
      quickLinks.classList.add('menu-open');
      toggleBtn.setAttribute('aria-expanded', 'true');
    };

    const toggleMenu = () => {
      if (dropdown.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    };

    toggleBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

	    quickLinks.addEventListener('click', (event) => {
		      const actionBtn = event.target.closest('.quick-links__dropdown .quick-link[data-action]');
		      if (actionBtn) {
		        const action = actionBtn.dataset.action;
		        const routes = {
		          onboarding: 'onboarding',
		          membership: 'plans',
		          timetable: 'timetable',
		          blueprint: 'blueprint',
		          faqs: 'faqs',
		          tcs: 'tcs',
		          consultation: 'consultation'
		        };
		        const route = routes[action];
		        if (route) {
		          navigateToChecklistHashRoute(route);
		          syncChecklistFromHashRoute(true);
		        }
		        closeMenu();
		        if (collapsed) {
		          quickLinks.classList.remove('is-collapsed');
		          body.classList.remove('quick-links-collapsed');
          collapsed = false;
        }
        return;
      }

	      const themeButton = event.target.closest('#theme-toggle');
	      if (themeButton) closeMenu();
	    }, true);

    document.addEventListener('click', (event) => {
      if (dropdown.hidden) return;
      if (!quickLinks.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    const handleVisibility = () => {
      const current = window.scrollY || 0;
      const diff = current - lastScrollY;
      const shouldCollapse = diff > 8 && current > 140;
      const shouldExpand = current < 40 || diff < -8;

      if (shouldCollapse && !collapsed) {
        quickLinks.classList.add('is-collapsed');
        body.classList.add('quick-links-collapsed');
        closeMenu();
        collapsed = true;
      } else if (shouldExpand && collapsed) {
        quickLinks.classList.remove('is-collapsed');
        body.classList.remove('quick-links-collapsed');
        collapsed = false;
      }

      lastScrollY = current;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(handleVisibility);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // anchor: checklist.computeStageStatus (stage locks/progress)
  function computeStageStatus(contact, fields) {
    const tagsSet = tagSet(contact);
    const introEvent = window._introAppointment || null;
    const completionFlags = Object.assign({}, window._latestChecklistFlags || {});
    const recordFlag = (label, value) => {
      if (!label) return;
      if (value && isChecklistFlagSuppressed(label)) {
        return;
      }
      completionFlags[label] = !!value;
    };

    const enquiryComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.ENQUIRY_FORM, () =>
      getTagBool(tagsSet, window.TAGS?.ENQUIRY_FORM_SUBMITTED || 'enquiry form submitted')
    );
    recordFlag(OPPORTUNITY_LABELS.ENQUIRY_FORM, enquiryComplete);

    window._bpLocalValues = window._bpLocalValues || {};
    const localMap = window._bpLocalValues;
    const rawBpValue = fields[window.FIELDS?.BP_RESULT];
    let bpValue = typeof rawBpValue === 'string' ? rawBpValue.trim() : rawBpValue ? String(rawBpValue).trim() : '';
    if (!bpValue && window.contactId && typeof localMap[window.contactId] === 'string') {
      bpValue = localMap[window.contactId];
    }
    const localBpComplete = (window._bpFeedbackContactId === window.contactId) && (
      (window._bpFeedbackFlash && typeof window._bpFeedbackFlash === 'object') ||
      !!window._bpShowNextStep
    );
    const bpComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.BP_CHECK, () =>
      !!bpValue || getTagBool(tagsSet, window.TAGS?.BP_SKIP || 'bp not required') || localBpComplete
    );
    recordFlag(OPPORTUNITY_LABELS.BP_CHECK, bpComplete);

    const hints = window._urlHints || {};
    const introStatusRaw = String(introEvent?.status || introEvent?.statusLabel || introEvent?.appointmentStatus || '').toLowerCase();
    const systemIntroConfirmed =
      introStatusRaw.includes('confirm') ||
      introStatusRaw.includes('showed') ||
      introStatusRaw.includes('checked');
    const systemIntroRequested =
      systemIntroConfirmed ||
      !!introEvent ||
      introStatusRaw === 'new' ||
      introStatusRaw.includes('request') ||
      !!(fields[window.FIELDS?.APPT_DATE]) ||
      !!hints.bookedIntro ||
      !!hints.bookedCall ||
      getTagBool(tagsSet, window.TAGS?.NSI_BOOKED || 'nsi booked') ||
      getTagBool(tagsSet, window.TAGS?.DC_BOOKED || 'dc booked') ||
      getTagBool(tagsSet, window.TAGS?.ONBOARDING_PROXY || 'onboarding session booked proxy');

    const introConfirmed = preferOpportunityFlag(OPPORTUNITY_LABELS.INTRO_CONFIRMED, () => systemIntroConfirmed);
    const introRequested = preferOpportunityFlag(OPPORTUNITY_LABELS.INTRO_REQUESTED, () => systemIntroRequested);
    recordFlag(OPPORTUNITY_LABELS.INTRO_CONFIRMED, introConfirmed);
    recordFlag(OPPORTUNITY_LABELS.INTRO_REQUESTED, introRequested);

    const parqComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.HEALTH_FORM, () =>
      getTagBool(tagsSet, window.TAGS?.PARQ_SUBMITTED || 'par-q submitted') || isParqCompleteFromData(fields)
    );
    recordFlag(OPPORTUNITY_LABELS.HEALTH_FORM, parqComplete);

    const consultTag = preferOpportunityFlag(OPPORTUNITY_LABELS.CONSULTATION_FORM, () =>
      getTagBool(tagsSet, window.TAGS?.CONSULT_DONE || 'consultation form submitted')
    );
    recordFlag(OPPORTUNITY_LABELS.CONSULTATION_FORM, consultTag);

    const introAttendedTag = preferOpportunityFlag(OPPORTUNITY_LABELS.INTRO_ATTENDED, () =>
      getTagBool(tagsSet, window.TAGS?.INTRO_ATTENDED || 'attended intro')
    );
    recordFlag(OPPORTUNITY_LABELS.INTRO_ATTENDED, introAttendedTag);

    const consentDone = getTagBool(tagsSet, window.TAGS?.INFORMED_CONSENT || 'informed consent signed');
    recordFlag(OPPORTUNITY_LABELS.INFORMED_CONSENT, consentDone);

    const bookedInitial = preferOpportunityFlag(OPPORTUNITY_LABELS.INITIAL_BOOKED, () =>
      getTagBool(tagsSet, window.TAGS?.BOOKED_1TO1 || 'on-boarding 1-1 booked') ||
      getTagBool(tagsSet, window.TAGS?.ONBOARDING_PROXY || 'onboarding session booked proxy')
    );
    recordFlag(OPPORTUNITY_LABELS.INITIAL_BOOKED, bookedInitial);

    const attendedInitial = preferOpportunityFlag(OPPORTUNITY_LABELS.INITIAL_CHECKED_IN, () =>
      [
        window.TAGS?.ATTENDED_1TO1 || 'attended 1-1',
        'attended 1-1 session',
        'on-boarding 1-1 checked in'
      ].some(tag => tag && getTagBool(tagsSet, tag))
    );
    recordFlag(OPPORTUNITY_LABELS.INITIAL_CHECKED_IN, attendedInitial);

    const inductionDone = preferOpportunityFlag(OPPORTUNITY_LABELS.ONLINE_INDUCTION, () =>
      getTagBool(tagsSet, window.TAGS?.INDUCTION_DONE || 'online induction completed')
    );
    recordFlag(OPPORTUNITY_LABELS.ONLINE_INDUCTION, inductionDone);

    const wodupDone = preferOpportunityFlag(OPPORTUNITY_LABELS.WODUP_SETUP, () =>
      getTagBool(tagsSet, window.TAGS?.WODUP_DONE || 'wodup setup marked complete')
    );
    recordFlag(OPPORTUNITY_LABELS.WODUP_SETUP, wodupDone);

    const enquiryFullyComplete = enquiryComplete && parqComplete && introRequested && consultTag && introAttendedTag && bpComplete;
    const initialComplete = bpComplete && parqComplete;
    const debriefDone = preferOpportunityFlag(OPPORTUNITY_LABELS.DEBRIEF_COMPLETE, () =>
      getTagBool(tagsSet, window.TAGS?.DEBRIEF_DONE || 'initial 1-1 debrief completed')
    );
    recordFlag(OPPORTUNITY_LABELS.DEBRIEF_COMPLETE, debriefDone);

    const initialUnlocked = enquiryComplete && introRequested && consultTag && bpComplete;
    const trialUnlocked = debriefDone;

    const classTcs = preferOpportunityFlag(OPPORTUNITY_LABELS.GYM_TCS, () => getTagBool(tagsSet, 'class t&cs signed'));
    const openGymTcs = preferOpportunityFlag(OPPORTUNITY_LABELS.GYM_TCS, () =>
      getTagBool(tagsSet, window.TAGS?.OPEN_GYM_TCS || 'open gym t&cs signed')
    );

    const trialDocsTag = preferOpportunityFlag(OPPORTUNITY_LABELS.TRIAL_TCS, () =>
      getTagBool(tagsSet, window.TAGS?.TRIAL_TCS || 'trial t&cs signed')
    );
    const annualReviewTag = preferOpportunityFlag(OPPORTUNITY_LABELS.TRIAL_TCS, () =>
      getTagBool(tagsSet, window.TAGS?.ANNUAL_PRICE_REVIEW || 'annual price review signed')
    );
    const gymDocsComplete = classTcs && openGymTcs;
    recordFlag(OPPORTUNITY_LABELS.GYM_TCS, gymDocsComplete);
    const trialDocsComplete = isChecklistFieldActive() ? trialDocsTag : (trialDocsTag && annualReviewTag);
    recordFlag(OPPORTUNITY_LABELS.TRIAL_TCS, trialDocsComplete);

    const trialStart = fields[window.FIELDS?.TRIAL_START] || '';
    recordFlag(OPPORTUNITY_LABELS.TRIAL_STARTED, !!trialStart);

    const trialComplete = debriefDone && gymDocsComplete && trialDocsComplete && !!trialStart;

    window._latestChecklistFlags = completionFlags;
    return {
      enquiry: { unlocked: true, complete: enquiryFullyComplete },
      initial1: { unlocked: initialUnlocked, complete: initialComplete },
      trial: { unlocked: trialUnlocked, complete: trialComplete }
    };
  }

  function applyStageLocks(statusMap) {
    stageStatusSnapshot = statusMap;
    window.stageStatus = statusMap;
    $$('.checklist-tab').forEach(btn => {
      const key = btn.dataset.target;
      const status = statusMap[key] || { unlocked: true };
      const locked = !status.unlocked;
      btn.classList.toggle('locked', locked);
      btn.classList.toggle('is-complete', !!status.complete);
      if (locked) {
        btn.setAttribute('aria-disabled', 'true');
        btn.dataset.lockMessage = LOCK_MESSAGES[key] || '';
        if (LOCK_MESSAGES[key]) {
          btn.setAttribute('title', LOCK_MESSAGES[key]);
        }
      } else {
        btn.removeAttribute('aria-disabled');
        btn.removeAttribute('data-lock-message');
        delete btn.dataset.lockMessage;
        btn.removeAttribute('title');
      }
    });
  }

  function determineDefaultStage(statusMap) {
    if (statusMap.trial && statusMap.trial.unlocked) return 'trial';
    if (statusMap.initial1 && statusMap.initial1.unlocked) return 'initial1';
    return 'enquiry';
  }

  // anchor: checklist.renderEnquiry (stage renderer)
  function renderEnquiry(contact, fields) {
    const el = $('#enquiry-section');
    if (!el) return;
    const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'New Member';
    const introEvent = window._introAppointment || null;
    const apptObj = (introEvent && introEvent.startTime) ? new Date(introEvent.startTime) : null;
    const appointmentTitle = (introEvent?.title || '').trim();
    const coachDisplay = formatCoachDisplay(introEvent?.coach || introEvent?.coachName || '') || '';
    const isOneToOne = /on-boarding/i.test(appointmentTitle) || /1-1/i.test(appointmentTitle);
    const introLabel = isOneToOne ? '1-1' : 'Intro';
    const coachLine = coachDisplay ? ` with ${window.escapeHtml(coachDisplay)}` : '';
    const hints = window._urlHints || {};
    const bookedBySystem = !!introEvent;
    const bookedByHint = !!hints.bookedIntro && !bookedBySystem;
    const tagsLower = (contact.tags || []).map(t => String(t).toLowerCase());
    const fallbackBooked = () => {
      const bookedByTags = [
        window.TAGS?.NSI_BOOKED || 'nsi booked',
        window.TAGS?.DC_BOOKED || 'dc booked',
        'discovery call booked'
      ].some(tag => tag && tagsLower.includes(String(tag).toLowerCase()));
      let bookedState = bookedBySystem || bookedByHint || bookedByTags;
      if (introEvent) bookedState = true;
      return bookedState;
    };
    const manualIntroBooked = hasChecklistFieldValue(window._checklistFieldState, [
      OPPORTUNITY_LABELS.INTRO_CONFIRMED,
      OPPORTUNITY_LABELS.INTRO_REQUESTED
    ]);
    const booked = manualIntroBooked || preferOpportunityFlag(
      [OPPORTUNITY_LABELS.INTRO_CONFIRMED, OPPORTUNITY_LABELS.INTRO_REQUESTED],
      fallbackBooked
    );
    const introAttended = preferOpportunityFlag(OPPORTUNITY_LABELS.INTRO_ATTENDED, () =>
      tagsLower.includes((window.TAGS?.INTRO_ATTENDED || 'attended intro'))
    );
    const canRecordBpNow = booked || introAttended;

    window._bpLocalValues = window._bpLocalValues || {};
    const localMap = window._bpLocalValues;
    const tags = tagSet(contact);
    const enquiryDone = preferOpportunityFlag(OPPORTUNITY_LABELS.ENQUIRY_FORM, () =>
      getTagBool(tags, (window.TAGS?.ENQUIRY_FORM_SUBMITTED || 'enquiry form submitted'))
    );
    const parqComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.HEALTH_FORM, () =>
      getTagBool(tags, (window.TAGS?.PARQ_SUBMITTED || 'par-q submitted')) || isParqCompleteFromData(fields)
    );
    const consultTagComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.CONSULTATION_FORM, () =>
      getTagBool(tags, (window.TAGS?.CONSULT_DONE || 'consultation form submitted'))
    );
    const localBpContext = window._bpFeedbackContactId === window.contactId;
    const bpRawVal = fields[window.FIELDS?.BP_RESULT];
    let bpVal = typeof bpRawVal === 'string' ? bpRawVal.trim() : bpRawVal ? String(bpRawVal).trim() : '';
    if (!bpVal && typeof localMap[window.contactId] === 'string') {
      bpVal = localMap[window.contactId];
    }
    const bpSkippedTag = getTagBool(tags, (window.TAGS?.BP_SKIP || 'bp not required'));
    const bpCompleteInEnquiry = preferOpportunityFlag(OPPORTUNITY_LABELS.BP_CHECK, () =>
      ((!!bpVal && bpVal.trim() !== '') || bpSkippedTag || (localBpContext && (
        (window._bpFeedbackFlash && typeof window._bpFeedbackFlash === 'object') ||
        !!window._bpShowNextStep
      )))
    );
    const allEnquiryItemsComplete = enquiryDone && parqComplete && booked && consultTagComplete && introAttended && bpCompleteInEnquiry;
    const nextAction = !enquiryDone ? 'enquiry'
      : !parqComplete ? 'parq'
      : !booked ? 'intro'
      : !consultTagComplete ? 'consult'
      : (!bpCompleteInEnquiry ? 'bp' : null);

    const enquiryUrl = `https://start.bomberspt.co.uk/?contactId=${encodeURIComponent(window.contactId || '')}`;
    const highlightBooking = enquiryDone && !booked;
    const bookingBtnClass = highlightBooking ? 'btn next-action-glow' : 'btn';
    const consultBtnClass = nextAction === 'consult' ? 'btn next-action-glow' : 'btn';
    const bookingButton = (bookedByHint && !bookedBySystem)
      ? `<button type="button" class="btn" disabled>Booking received</button>`
      : `<button type="button" class="${bookingBtnClass}" onclick="window.handleIntroBooking && window.handleIntroBooking(event)">Book intro meeting</button>`;

    const enquirySummaryLines = enquiryDone ? buildEnquirySummaryLines(fields) : [];
    const enquirySummaryHtml = enquirySummaryLines.length
      ? `<div class="enquiry-summary">${enquirySummaryLines.map((line, idx) => {
          const cls = idx === 0 ? 'enquiry-summary__line enquiry-summary__line--primary' : 'enquiry-summary__line';
          const safe = window.escapeHtml ? window.escapeHtml(line) : line;
          return `<span class="${cls}">${safe}</span>`;
        }).join('')}</div>`
      : '';

    const enquiryContent = enquiryDone
      ? `<div class="enquiry-summary-block">
          <span class="label">Your enquiry</span>
          ${enquirySummaryHtml || '<span class="label">Enquiry form</span>'}
        </div>
        ${createViewButton('enquiry')}
        <button type="button" class="btn btn--muted btn--compact" data-restart-enquiry>Start again</button>`
      : `<button type="button" class="label action${nextAction === 'enquiry' ? ' next-action-glow' : ''}" data-action="launch-enquiry-wizard">Enquiry form</button>`;

    const parqHasFlags = parqComplete && parqHasFlaggedResponses(fields);
    const parqStatusIcon = parqComplete ? (parqHasFlags ? '⚠️' : '✅') : '⬜';

    const consultationContent = consultTagComplete
      ? `<div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          <span class="label">Consultation form</span>
          ${createViewButton('consultation')}
        </div>`
      : `<button type="button" class="${consultBtnClass}" style="flex:1 1 auto;justify-content:flex-start;display:inline-flex;align-items:center;gap:0.35rem;" onclick="event.stopPropagation(); window.handleConsultationLaunch && window.handleConsultationLaunch(event)">Complete consultation questions</button>`;

    const enquiryRow = `
      <li data-override-key="enquiry_form" style="display:flex;align-items:flex-start;gap:0.6rem;flex-wrap:wrap;">
        <span class="status-icon">${enquiryDone ? '✅' : '⬜'}</span>
        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
          ${enquiryContent}
        </div>
      </li>
    `;

    const consultationRow = booked ? `
      <li data-override-key="consultation_questionnaire" style="margin-top:0.9rem;display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
        <span class="status-icon">${consultTagComplete ? '✅' : '⬜'}</span>
        ${consultationContent}
      </li>
    ` : '';

    // Improved intro display pieces
    const apptStatusRaw = (introEvent?.statusLabel || '').trim();

    function buildTimeDayDateLine() {
      try {
        if (!(introEvent && apptObj instanceof Date && !isNaN(apptObj))) return '';
        const d = apptObj;
        const weekday = d.toLocaleDateString('en-GB', { weekday: 'long' });
        const dateStr = window.formatShortDate ? window.formatShortDate(d.toISOString()) : d.toLocaleDateString('en-GB');
        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return `${window.escapeHtml(timeStr)} on ${window.escapeHtml(weekday)} ${window.escapeHtml(dateStr)}`;
      } catch (_) {
        return '';
      }
    }

	    // Blood Pressure UI (only after intro is attended and recorded once)
	    const bpButtonClass = nextAction === 'bp' ? 'btn next-action-glow' : 'btn';
	    const bpFeedbackState = introAttended && localBpContext ? (window._bpFeedbackFlash || null) : null;
	    const bpFeedbackStyle = bpFeedbackState ? 'display:block;' : 'display:none;';
	    const bpFeedbackCategory = (bpFeedbackState && bpFeedbackState.category) ? String(bpFeedbackState.category).toLowerCase() : '';
	    const bpFeedbackVariant = (function(category) {
	      if (!category) return '';
	      if (category === 'normal') return 'good';
	      if (category === 'high' || category === 'low') return 'warn';
	      if (category === 'very_high' || category === 'critical') return 'bad';
	      if (category === 'skipped') return 'info';
	      return 'warn';
	    })(bpFeedbackCategory);
	    const bpFeedbackClass = `bp-feedback${bpFeedbackVariant ? ` bp-feedback--${bpFeedbackVariant}` : ''}`;
	    const bpFeedbackText = bpFeedbackState ? (window.escapeHtml ? window.escapeHtml(bpFeedbackState.text) : bpFeedbackState.text) : '';
	    const showNextStep = introAttended && (allEnquiryItemsComplete || (!!window._bpShowNextStep && localBpContext));
	    const bpNextStepStyle = showNextStep ? 'display:inline-flex;' : 'display:none;';
	    const bpNextStepClass = showNextStep ? 'btn next-action-glow' : 'btn';
    const bpInputValueRaw = bpVal || '';
    const bpInputValue = window.escapeHtml ? window.escapeHtml(String(bpInputValueRaw)) : String(bpInputValueRaw);
    const bpInlineControls = canRecordBpNow ? `
        <div class=\"bp-input-wrapper\" style=\"margin:0;display:flex;align-items:center;gap:0.5rem;\">
          <input id=\"bp-input\" class=\"bp-input\" placeholder=\"e.g. 120/80\" value=\"${bpInputValue}\" oninput=\"window.bpInputHandler && window.bpInputHandler(this)\" />
          <button type=\"button\" class=\"${bpButtonClass}\" onclick=\"window.bpSubmit && window.bpSubmit(window.contactId, document.getElementById('bp-input'), document.getElementById('bp-feedback'))\">Save</button>
        </div>
	    ` : '';
	    const bpFeedbackMarkup = canRecordBpNow ? `
	        <div id=\"bp-feedback\" class=\"${bpFeedbackClass}\" style=\"${bpFeedbackStyle}width:100%;\">${bpFeedbackText}</div>
	    ` : '';
    const bpNextStepMarkup = canRecordBpNow ? `
        <div style=\"width:100%;display:flex;justify-content:center;\">
          <button id=\"bp-next-step\" type=\"button\" class=\"${bpNextStepClass}\" style=\"margin-top:0.6rem;${bpNextStepStyle}\" onclick=\"window.goToInitialStage && window.goToInitialStage()\">Go to next step</button>
        </div>
    ` : '';

    const bpRow = `
      <li data-override-key="bp_skip" style="display:flex;flex-direction:column;gap:0.75rem;align-items:flex-start;">
        <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;">
          <span id="bp-status-icon" class="status-icon">${bpCompleteInEnquiry ? '✅' : '⬜'}</span>
          <span class="label" style="display:flex;align-items:center;gap:0.4rem;">Blood Pressure
            <button type="button" aria-label="Blood pressure guidance" style="background:#eef5ff;border:1px solid #cddaf8;color:#1f3c88;border-radius:999px;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;font-weight:600;cursor:pointer;" onclick="event.stopPropagation(); window.showBloodPressureInfoModal && window.showBloodPressureInfoModal()">i</button>
          </span>
          ${bpInlineControls}
        </div>
        ${!canRecordBpNow ? `<div class="label" style="opacity:0.9;">Book your intro meeting to record this.</div>` : ''}
        ${bpFeedbackMarkup}
        ${bpNextStepMarkup}
      </li>
    `;

    const introOverrideStep = introAttended ? 2 : (booked ? 1 : 0);

    const html = `
      <div class="checklist-block" data-collapsible-id="stage-enquiry" data-stage-key="enquiry" data-collapsible-default="expanded">
        <button class="collapsible-toggle" aria-expanded="true" style="all:unset;display:block;width:100%;cursor:pointer;">
          <h3 style="margin:0;display:flex;justify-content:space-between;align-items:center;">
            <span>Welcome, ${window.escapeHtml(name)}</span>
          </h3>
        </button>
        <div class="collapsible-content" style="margin-top:0.75rem;">
          <div style="display:grid;gap:var(--checklist-inner-grid-gap, 16px);">
            <div style="border:1px solid var(--card-border, #e3eaf5);border-radius:12px;padding:var(--checklist-inner-card-pad-y, 16px) var(--checklist-inner-card-pad-x, 16px);background:var(--card-bg, #fff);">
              <ul style="margin:0;padding:0;list-style:none;display:grid;gap:10px;">
                ${enquiryRow}
              </ul>
            </div>

            <div style="border:1px solid var(--card-border, #d6e0f2);border-radius:12px;padding:var(--checklist-inner-card-pad-y, 16px) var(--checklist-inner-card-pad-x, 18px);background:var(--card-bg, #f8fbff);">
              <ul style="margin:0;padding:0;list-style:none;display:grid;gap:12px;">
                <li>
                  <div style="display:flex;flex-direction:column;gap:0.75rem;">
                    <div style="display:flex;align-items:center;gap:0.6rem;">
                      <span class="label" style="font-weight:600;">Intro meeting</span>
                    </div>
                ${(() => {
                  const whatBtn = '<button type="button" class="btn" onclick="window.showIntroModal && window.showIntroModal()">What to expect</button>';
                  return `
                        <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                          <div style="display:flex;align-items:center;gap:0.5rem;">${bookingButton}</div>
                          <div style="margin-left:auto;">${whatBtn}</div>
                        </div>
                      `;
                })()}
                    ${(() => {
                      const hasChecklistIntroAttended = hasLatestFlag(OPPORTUNITY_LABELS.INTRO_ATTENDED) || hasChecklistFieldValue(window._checklistFieldState, OPPORTUNITY_LABELS.INTRO_ATTENDED);
                      const hasChecklistIntroConfirmed = hasLatestFlag(OPPORTUNITY_LABELS.INTRO_CONFIRMED) || hasChecklistFieldValue(window._checklistFieldState, OPPORTUNITY_LABELS.INTRO_CONFIRMED);
                      const hasChecklistIntroRequested = hasLatestFlag(OPPORTUNITY_LABELS.INTRO_REQUESTED) || hasChecklistFieldValue(window._checklistFieldState, OPPORTUNITY_LABELS.INTRO_REQUESTED);
                      const nativeStatusRaw = (introEvent?.statusLabel || introEvent?.status || '').trim();
                      const nativeStatus = nativeStatusRaw.toLowerCase();
                      const mapNativeStatus = (value) => {
                        if (!value) return '';
                        if (value.includes('no-show')) return 'No-show';
                        if (value.includes('show') || value.includes('checked')) return 'Attended';
                        if (value.includes('cancel')) return 'Cancelled';
                        if (value.includes('request') || value === 'new') return 'Requested';
                        if (value.includes('confirm')) return 'Confirmed';
                        if (value.includes('resched')) return 'Rescheduled';
                        return nativeStatusRaw || value.charAt(0).toUpperCase() + value.slice(1);
                      };
                      const status = (() => {
                        if (hasChecklistIntroAttended) return 'Attended';
                        if (hasChecklistIntroConfirmed) return 'Confirmed';
                        if (hasChecklistIntroRequested) return 'Requested';
                        const nativeLabel = mapNativeStatus(nativeStatus);
                        if (nativeLabel) return nativeLabel;
                        if (introAttended || hasChecklistIntroAttended) return 'Attended';
                        if (hasChecklistIntroConfirmed) return 'Confirmed';
                        if (hasChecklistIntroRequested) return 'Requested';
                        if (manualIntroBooked) return 'Booked';
                        return booked ? 'Confirmed' : 'Not booked';
                      })();
                      const whenLine = buildTimeDayDateLine();
                      const detailParts = [];
                      if (whenLine) detailParts.push(whenLine);
                      if (coachDisplay) detailParts.push(`with ${window.escapeHtml(coachDisplay)}`);
                      if (!whenLine && manualIntroBooked) {
                        detailParts.push('Marked as booked via checklist');
                      }
                      const details = detailParts.join(' · ');
                      const baseStatus = `Status: ${status}`;
                      const introApptId = (introEvent?.appointmentId || introEvent?.raw?.appointmentId || introEvent?.raw?.id || introEvent?.raw?._id || '').trim();
                      const datasetStatus = status.toLowerCase();
                      const attrStatus = window.escapeHtml ? window.escapeHtml(datasetStatus) : datasetStatus;
                      const attrApptId = window.escapeHtml ? window.escapeHtml(introApptId) : introApptId;
                      const slotKey = introApptId || (introEvent?.appointmentId || '');
                      const attrSlotKey = window.escapeHtml ? window.escapeHtml(slotKey) : slotKey;
                      const attrTz = window.escapeHtml ? window.escapeHtml(introEvent?.selectedTimezone || '') : (introEvent?.selectedTimezone || '');
                      const slotEncoded = encodeSlotPayload(introEvent?.selectedSlot);
                      const statusEl = `<div style="color:#1f3c88;font-weight:500;cursor:pointer;" data-override-status="intro" data-override-step="${introOverrideStep}" data-native-status="${attrStatus}" data-intro-appt-id="${attrApptId}" data-intro-slot-key="${attrSlotKey}" data-intro-slot-encoded="${slotEncoded}" data-intro-timezone="${attrTz}">${baseStatus}</div>`;
                      const detailEl = details ? `<div style="color:#5b657a;">${details}</div>` : '';
                      const healthButtonMarkup = parqComplete ? `
                        <div style="margin-top:0.75rem;">
                          <button type="button" class="btn btn--muted" onclick="event.stopPropagation(); window.showResponseViewer && window.showResponseViewer('health')">
                            View health form answers
                          </button>
                        </div>
                      ` : '';
                      const subItems = [consultationRow, bpRow].filter(Boolean).join('');
                      const subList = subItems
                        ? `<ul style="margin:0.9rem 0 0;padding:0;list-style:none;display:grid;gap:10px;">${subItems}</ul>`
                        : '';
                      return `${statusEl}${detailEl}${healthButtonMarkup}${subList}`;
                    })()}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
    window.safeSetHTML(el, html);
    ensureStaffButtons(el);
  }


  // anchor: checklist.renderInitial (stage renderer)
  function renderInitial(contact, fields, statusMap) {
    const el = $('#initial1-section');
    if (!el) return;
    const stageState = (statusMap && statusMap.initial1) || stageStatusSnapshot.initial1 || { unlocked: false, complete: false };
    const unlocked = !!stageState.unlocked;
    const tags = tagSet(contact);
    let initialPct = 0;
    let followUpHtml = '';
    let followUpTasks = [];
    let introSummary = '';

    if (unlocked) {
      const bookedInitial = preferOpportunityFlag(OPPORTUNITY_LABELS.INITIAL_BOOKED, () =>
        getTagBool(tags, (window.TAGS?.BOOKED_1TO1 || 'on-boarding 1-1 booked')) ||
        getTagBool(tags, (window.TAGS?.ONBOARDING_PROXY || 'onboarding session booked proxy'))
      );
      const attendedInitial = preferOpportunityFlag(OPPORTUNITY_LABELS.INITIAL_CHECKED_IN, () =>
        [
          window.TAGS?.ATTENDED_1TO1 || 'attended 1-1',
          'attended 1-1 session',
          'on-boarding 1-1 checked in'
        ].some(tag => tag && getTagBool(tags, tag))
      );
      const bookingDone = bookedInitial || attendedInitial;
      const inductionDone = preferOpportunityFlag(OPPORTUNITY_LABELS.ONLINE_INDUCTION, () =>
        getTagBool(tags, (window.TAGS?.INDUCTION_DONE || 'online induction completed'))
      );
      maybePromptInductionReminder(bookedInitial, inductionDone);
      const wodupDone = preferOpportunityFlag(OPPORTUNITY_LABELS.WODUP_SETUP, () =>
        getTagBool(tags, (window.TAGS?.WODUP_DONE || 'wodup setup marked complete'))
      );
      const debriefDone = preferOpportunityFlag(OPPORTUNITY_LABELS.DEBRIEF_COMPLETE, () =>
        getTagBool(tags, (window.TAGS?.DEBRIEF_DONE || 'initial 1-1 debrief completed'))
      );
      const bookingBtnClass = bookingDone ? 'btn' : 'btn next-action-glow';
      const buttonText = bookingDone ? 'Manage booking' : 'Book now';
      const bookingAction = bookingDone
        ? 'window.showManageInitialOneToOneModal && window.showManageInitialOneToOneModal()'
        : 'window.handleInitialOneToOne && window.handleInitialOneToOne(event)';
      const bookingButton = `<button type="button" class="${bookingBtnClass}" onclick="event.stopPropagation(); ${bookingAction}">${buttonText}</button>`;
      const infoButton = `<button type="button" class="btn" style="margin-left:0.5rem;" onclick="event.stopPropagation(); window.showInitialOneToOneModal && window.showInitialOneToOneModal()">What to expect</button>`;
      const showPurchasedButton = !bookingDone && !attendedInitial && !debriefDone;
      const initialAlreadyPurchasedButton = showPurchasedButton
        ? `<button type="button" class="btn btn--muted" style="margin-top:0.75rem;" onclick="event.stopPropagation(); window.showInitialPurchaseModal && window.showInitialPurchaseModal()">I've already purchased</button>`
        : '';

      const apptTypeRaw = (fields[window.FIELDS?.APPT_TYPE] || '').trim();
      const isOnboardingSession = apptTypeRaw && apptTypeRaw.toLowerCase() === 'on-boarding 1-1 session';
      let statusLabel = 'Not booked';
      if (debriefDone) {
        statusLabel = 'Completed';
      } else if (attendedInitial) {
        statusLabel = 'Attended';
      } else if (bookedInitial) {
        statusLabel = 'Booked';
      }

      let detailsLine = '';
      if (bookingDone && isOnboardingSession) {
        const detailParts = [];
        const apptDateFieldId = window.FIELDS?.APPT_DATE;
        const apptTimeFieldId = window.FIELDS?.APPT_TIME;
        const apptDateRaw = apptDateFieldId ? String(fields[apptDateFieldId] || '').trim() : '';
        const apptTimeRaw = (apptTimeFieldId && apptTimeFieldId !== apptDateFieldId)
          ? String(fields[apptTimeFieldId] || '').trim()
          : '';

        let apptDateObj = null;
        const primaryApptSource = apptDateRaw;
        if (primaryApptSource) {
          apptDateObj = parseApptDateTime(primaryApptSource, apptTimeRaw || null);
        }
        if (!apptDateObj && apptTimeRaw) {
          apptDateObj = parseApptDateTime(apptTimeRaw, null);
        }

        if (apptDateObj instanceof Date && !isNaN(apptDateObj)) {
          const timeStr = apptDateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const dateStr = formatAppointmentLabel(apptDateObj);
          detailParts.push(`${timeStr} on ${dateStr}`);
        }

        const coachName = formatCoachDisplay(fields[window.FIELDS?.APPT_COACH] || '');
        if (coachName) {
          detailParts.push(`with ${window.escapeHtml ? window.escapeHtml(coachName) : coachName}`);
        }

        if (detailParts.length) {
          detailsLine = detailParts.join(' · ');
        }
      }

      introSummary = `
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;">
            <span class="label" style="font-weight:600;">1-1 Onboarding session</span>
            <div style="display:flex;gap:0.5rem;">
              ${bookingButton}
              ${infoButton}
            </div>
          </div>
          <div style="color:var(--nav-text, #1f3c88);font-weight:500;" data-override-status="initial" data-override-step="${debriefDone ? 3 : (attendedInitial ? 2 : (bookingDone ? 1 : 0))}">Status: ${statusLabel}</div>
          ${initialAlreadyPurchasedButton ? `<div>${initialAlreadyPurchasedButton}</div>` : ''}
          ${detailsLine ? `<div style="color:var(--muted-text, #5b657a);">Details: ${detailsLine}</div>` : ''}
        </div>
      `;

      const followUpTasksList = [];
      const wodupLabel = window.OPPORTUNITY_LABELS?.WODUP_SETUP || 'WodUp Setup';

      if (bookingDone) {
        followUpTasksList.push(
          {
            overrideKey: 'online_induction',
            label: '',
            description: inductionDone ? 'Online induction complete' : '',
            complete: inductionDone,
            action: inductionDone ? '' : '<button type="button" class="btn" onclick="event.stopPropagation(); window.showInitialInductionModal && window.showInitialInductionModal()">Complete online induction</button>',
            viewType: inductionDone ? 'induction' : null
          },
          {
            overrideKey: 'setup_wodup',
            label: '',
            description: wodupDone ? 'WodUp set up marked complete' : '',
            complete: wodupDone,
            action: wodupDone ? '' : `
              <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
                <a class="btn" href="https://www.wodup.com/join/v6Q3uXN0TYGiZQNFbGJB" target="_blank" rel="noopener">Set up WodUP</a>
                <button type="button" class="btn btn--muted" onclick="event.stopPropagation(); window.markChecklistCompletion && window.markChecklistCompletion('${wodupLabel.replace(/'/g, "\\'")}')">Mark as complete</button>
              </div>`
          }
        );
      }

      {
        const canCompleteDebrief = attendedInitial && !debriefDone;
        const lockedDebriefAction = `
          <button type="button" class="btn btn--muted" disabled style="opacity:0.6;pointer-events:none;">
            Complete session debrief
          </button>
        `;
        const lockedDebriefDescription = bookingDone
          ? 'This will be completed with your coach after your 1-1.'
          : 'Book your 1-1 first, then complete this with your coach after the session.';

        followUpTasksList.push({
          overrideKey: 'session_debrief',
          label: 'Session debrief',
          description: debriefDone
            ? 'Session debrief complete'
            : (attendedInitial ? 'Confirm you and your coach agree you are ready for classes or open gym.' : lockedDebriefDescription),
          complete: debriefDone,
          action: debriefDone
            ? ''
            : (canCompleteDebrief
              ? '<button type="button" class="btn next-action-glow" onclick="event.stopPropagation(); window.openInitialDebriefModal && window.openInitialDebriefModal()">Complete session debrief</button>'
              : lockedDebriefAction),
          viewType: debriefDone ? 'session-debrief' : null
        });
      }

      followUpTasks = followUpTasksList;

      const completedCount = followUpTasks.filter(item => item.complete).length;
      initialPct = followUpTasks.length ? percent(completedCount, followUpTasks.length) : 0;

      const renderTaskItem = (item) => {
        if (item.overrideKey === 'session_debrief') {
          const viewMarkup = item.viewType ? createViewButton(item.viewType) : '';
          if (item.complete) {
            const descriptionText = item.description ? (window.escapeHtml ? window.escapeHtml(item.description) : item.description) : '';
            const descriptionHtml = descriptionText ? `<div style="color:var(--muted-text, #5b657a);font-size:0.9em;margin-left:2.05rem;">${descriptionText}</div>` : '';
            return `
              <li data-override-key="session_debrief" style="display:flex;flex-direction:column;gap:0.4rem;align-items:flex-start;">
                <div style="display:flex;align-items:center;gap:0.6rem;flex-wrap:wrap;width:100%;">
                  <span class="status-icon">✅</span>
                  <span class="label">Session debrief</span>
                  ${viewMarkup}
                </div>
                ${descriptionHtml}
              </li>
            `;
          }

          const descriptionText = item.description ? (window.escapeHtml ? window.escapeHtml(item.description) : item.description) : '';
          const descriptionHtml = descriptionText ? `<div style="color:var(--muted-text, #5b657a);font-size:0.9em;margin-left:2.05rem;">${descriptionText}</div>` : '';
          const actionHtml = item.action ? `<div>${item.action}</div>` : '';
          return `
            <li data-override-key="session_debrief" style="display:flex;flex-direction:column;gap:0.4rem;align-items:flex-start;">
              <div style="display:flex;align-items:center;justify-content:flex-start;gap:0.6rem;flex-wrap:wrap;width:100%;">
                <span class="status-icon">⬜</span>
                <span class="label">Session debrief</span>
                ${viewMarkup}
                ${actionHtml}
              </div>
              ${descriptionHtml}
            </li>
          `;
        }

        const safeLabel = window.escapeHtml ? window.escapeHtml(item.label) : item.label;
        const safeDescription = item.description ? ((window.escapeHtml ? window.escapeHtml(item.description) : item.description)) : '';
        let labelHtml = '';
        let descriptionHtml = '';

        if (item.complete && !safeLabel && safeDescription) {
          labelHtml = `<span class="label">${safeDescription}</span>`;
        } else {
          if (safeLabel) {
            labelHtml = `<span class="label">${safeLabel}</span>`;
          }
          if (safeDescription) {
            descriptionHtml = `<div style="color:var(--muted-text, #5b657a);font-size:0.9em;margin-left:2.05rem;">${safeDescription}</div>`;
          }
        }

        const actionHtml = item.action ? `<div>${item.action}</div>` : '';
        const viewMarkup = item.complete && item.viewType ? createViewButton(item.viewType) : '';
        return `
          <li data-override-key="${item.overrideKey}" style="display:flex;flex-direction:column;gap:0.4rem;align-items:flex-start;">
            <div style="display:flex;align-items:center;justify-content:flex-start;gap:0.6rem;flex-wrap:wrap;width:100%;">
              <span class="status-icon">${item.complete ? '✅' : '⬜'}</span>
              ${labelHtml}
              ${viewMarkup}
              ${actionHtml}
            </div>
            ${descriptionHtml}
          </li>
        `;
      };

      followUpHtml = followUpTasks.map(renderTaskItem).join('');
    }

    const headerProgress = unlocked ? `<span style="font-size:0.9rem;color:#5b657a;">Initial 1-1 • ${initialPct}%</span>` : '';

    const trialButton = (unlocked && preferOpportunityFlag(OPPORTUNITY_LABELS.DEBRIEF_COMPLETE, () =>
      getTagBool(tags, (window.TAGS?.DEBRIEF_DONE || 'initial 1-1 debrief completed'))
    )) ? `
      <div style="width:100%;display:flex;justify-content:center;margin-top:0.8rem;">
        <button type="button" class="btn next-action-glow" onclick="event.stopPropagation(); window.goToTrialStage && window.goToTrialStage()">Choose plan</button>
      </div>
    ` : '';

	      const unlockedBody = `
	      <div style="border:1px solid var(--card-border, #e3eaf5);border-radius:12px;padding:var(--checklist-inner-card-pad-y, 16px) var(--checklist-inner-card-pad-x, 16px);background:var(--card-bg, #fff);">
	        ${introSummary || ''}
	        ${followUpHtml ? `<ul style="margin:1rem 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px;align-items:flex-start;">${followUpHtml}</ul>` : ''}
	        ${trialButton}
	      </div>
	    `;

    const bodyContent = unlocked
      ? unlockedBody
      : `<div class="collapsible-placeholder">${window.escapeHtml(LOCK_MESSAGES.initial1 || 'Complete the earlier steps to unlock this stage.')}</div>`;

    const html = `
      <div class="checklist-block" data-collapsible-id="stage-initial" data-stage-key="initial1" data-collapsible-default="collapsed">
        <button class="collapsible-toggle" aria-expanded="false" style="all:unset;display:block;width:100%;cursor:pointer;">
          <h3 style="margin:0;display:flex;justify-content:space-between;align-items:center;">
            <span>Your initial 1-1</span>
            ${headerProgress}
          </h3>
        </button>
        <div class="collapsible-content" style="margin-top:0.75rem;">
          ${bodyContent}
        </div>
      </div>
    `;
    window.safeSetHTML(el, html);
    ensureStaffButtons(el);
  }


  // anchor: checklist.renderTrial (stage renderer)
  function renderTrial(contact, fields, statusMap) {
    const el = $('#trial-section');
    if (!el) return;
    const stageState = (statusMap && statusMap.trial) || stageStatusSnapshot.trial || { unlocked: false, complete: false };
    const unlocked = !!stageState.unlocked;
    const tags = tagSet(contact);
    const classTcs = preferOpportunityFlag(OPPORTUNITY_LABELS.GYM_TCS, () => tags.has("class t&cs signed"));
    const openGymTcs = preferOpportunityFlag(OPPORTUNITY_LABELS.GYM_TCS, () => {
      const key = (window.TAGS?.OPEN_GYM_TCS || 'open gym t&cs signed').toLowerCase();
      return tags.has(key);
    });
    const trialDocsTag = preferOpportunityFlag(OPPORTUNITY_LABELS.TRIAL_TCS, () => {
      const key = (window.TAGS?.TRIAL_TCS || 'trial t&cs signed').toLowerCase();
      return tags.has(key);
    });
    const annualReviewTag = preferOpportunityFlag(OPPORTUNITY_LABELS.TRIAL_TCS, () => {
      const key = (window.TAGS?.ANNUAL_PRICE_REVIEW || 'annual price review signed').toLowerCase();
      return tags.has(key);
    });
    const trialStart = fields[window.FIELDS?.TRIAL_START] || "";
    const gymTcsComplete = classTcs && openGymTcs;
    const trialDocsComplete = isChecklistFieldActive() ? trialDocsTag : (trialDocsTag && annualReviewTag);
    const trialDoneCount = (gymTcsComplete?1:0) + (trialDocsComplete?1:0) + (trialStart?1:0);
    const trialPctRaw = percent(trialDoneCount, 3);
    const trialPct = unlocked ? trialPctRaw : 0;
    const bodyContent = unlocked
      ? `<div id="trial-inline-content"></div>`
      : `<div class="collapsible-placeholder">${window.escapeHtml(LOCK_MESSAGES.trial || 'Complete the earlier stages to unlock plan selection.')}</div>`;

    const html = `
      <div class="checklist-block" data-collapsible-id="stage-trial" data-stage-key="trial" data-collapsible-default="collapsed">
        <button class="collapsible-toggle" aria-expanded="false" style="all:unset;display:block;width:100%;cursor:pointer;">
          <h3 style="margin:0;display:flex;justify-content:space-between;align-items:center;">
            <span>Choose your plan</span>
          </h3>
        </button>
        <div class="collapsible-content" style="margin-top:0.75rem;">
          ${bodyContent}
        </div>
      </div>
    `;
    window.safeSetHTML(el, html);

    if (unlocked && typeof window.renderTrialWeekInline === 'function') {
      const inline = document.getElementById('trial-inline-content');
      if (inline) {
        window.renderTrialWeekInline(inline);
      }
    }
    ensureStaffButtons(el);
  }

  // anchor: checklist.handleIntroBooking (intro booking click)
  function handleIntroBooking(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    const bookingUrl = buildIntroBookingUrl(window.contactId);
    if (!bookingUrl) {
      window.open('https://start.bomberspt.co.uk/no-sweat-intro', '_blank');
      return;
    }
    const contact = window._latestContact || {};
    const fields = window._latestContactFields || {};
    const tags = tagSet(contact);
    const parqComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.HEALTH_FORM, () =>
      getTagBool(tags, (window.TAGS?.PARQ_SUBMITTED || 'par-q submitted')) || isParqCompleteFromData(fields)
    );
    if (!parqComplete) {
      window._pendingIntroBookingUrl = bookingUrl;
      window._postConsultAction = 'introBooking';
      if (typeof window.openParqModal === 'function') {
        window.openParqModal({
          startAtIntro: true,
          introSlide: {
            title: 'We just need to ask a few Health questions before you book',
            buttonLabel: 'Continue'
          }
        });
      } else {
        console.warn('[Checklist] Health form modal unavailable; unable to proceed to booking.');
      }
      return;
    }
    window.open(bookingUrl, '_blank');
  }

  function maybePromptInductionReminder(bookedInitial, inductionDone) {
    if (inductionDone) {
      window._inductionReminderDismissed = false;
    }
    if (!bookedInitial || inductionDone) {
      if (window._inductionReminderVisible && typeof window.closeInductionReminderModal === 'function') {
        window.closeInductionReminderModal({ silent: true });
      }
      window._inductionReminderVisible = false;
      return;
    }
    if (window._inductionReminderVisible || window._inductionReminderDismissed) return;
    if (typeof window.showInductionReminderModal === 'function') {
      window.showInductionReminderModal();
    }
  }

  function ensureLocalTagPresence(tagName) {
    if (!tagName) return;
    try {
      const contact = window._latestContact || {};
      const existing = Array.isArray(contact.tags) ? contact.tags : [];
      if (existing.some(tag => String(tag).toLowerCase() === String(tagName).toLowerCase())) return;
      contact.tags = existing.concat(tagName);
      window._latestContact = contact;
    } catch (_) {}
  }

  function handleInitialOneToOne(event) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    const bookingUrl = buildInitialBookingUrl(window.contactId);
    if (!bookingUrl) {
      alert('We couldn’t open the onboarding booking link right now. Please contact the team and we’ll sort it for you.');
      return;
    }
    const contact = window._latestContact || {};
    const consentTag = window.TAGS?.INFORMED_CONSENT || 'informed consent signed';
    const tags = tagSet(contact);
    const consentDone = preferOpportunityFlag(OPPORTUNITY_LABELS.INFORMED_CONSENT, () =>
      getTagBool(tags, consentTag)
    );
    const cardAgreementKey = 'card on file agreement';
    const cardAgreementDone = preferOpportunityFlag(OPPORTUNITY_LABELS.CARD_ON_FILE, () => getTagBool(tags, cardAgreementKey));

    const openBooking = () => window.open(bookingUrl, '_blank');

    if (!cardAgreementDone && typeof window.openTermsModal === 'function' && window.contactId) {
      window.openTermsModal(cardAgreementKey, window.contactId, () => {
        ensureLocalTagPresence(cardAgreementKey);
        if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS?.CARD_ON_FILE) {
          window.forceChecklistFlag(window.OPPORTUNITY_LABELS.CARD_ON_FILE, true);
        }
        if (typeof window.renderChecklist === 'function') {
          window.renderChecklist();
        }
        setTimeout(() => handleInitialOneToOne(null), 150);
      });
      return;
    }

    if (!consentDone && typeof window.openTermsModal === 'function' && window.contactId) {
      window.openTermsModal(consentTag, window.contactId, () => {
        ensureLocalTagPresence(consentTag);
        if (typeof window.renderChecklist === 'function') {
          window.renderChecklist();
        }
        setTimeout(openBooking, 150);
      });
      return;
    }

    openBooking();
  }




	  // Generic handler for clicking the sticky return bars in full-screen modals
		  function bindModalReturnHandlers() {
		    const handleClose = (target) => {
		      const hubRoute = typeof window.getChecklistHubHashRoute === 'function'
		        ? window.getChecklistHubHashRoute()
		        : 'enquiry';
		      const routedTargets = {
		        membership: true,
		        faqs: true,
		        blueprint: true,
		        timetable: true,
		        onboardingworks: true,
		        tcs: true
		      };
		      if (target && routedTargets[target] && typeof window.setChecklistHashRoute === 'function') {
		        window.setChecklistHashRoute(hubRoute);
		        return;
		      }
		      if (target === 'membership' && typeof window.closeMembershipModal === 'function') {
		        window.closeMembershipModal();
		      } else if (target === 'trial-week' && typeof window.closeTrialWeekModal === 'function') {
		        window.closeTrialWeekModal();
		      } else if (target === 'faqs' && typeof window.closeFaqsModal === 'function') {
		        window.closeFaqsModal();
	      } else if (target === 'blueprint' && typeof window.closeBlueprintModal === 'function') {
	        window.closeBlueprintModal();
	      } else if (target === 'timetable' && typeof window.closeTimetableModal === 'function') {
	        window.closeTimetableModal();
	      } else if (target === 'consultation' && typeof window.requestCloseConsultationFormModal === 'function') {
	        window.requestCloseConsultationFormModal();
	      } else if (target === 'onboardingworks' && typeof window.closeOnboardingWorksModal === 'function') {
	        window.closeOnboardingWorksModal();
	      } else if (target === 'induction' && typeof window.closeInitialInductionModal === 'function') {
	        window.closeInitialInductionModal();
		      } else if (target === 'tcs' && typeof window.closeTcsModal === 'function') {
		        window.closeTcsModal();
		      }
		    };

    document.addEventListener('click', (event) => {
      const ret = event.target.closest('[data-close-target]');
      if (!ret) return;
      handleClose(ret.getAttribute('data-close-target'));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const ret = event.target.closest('[data-close-target]');
      if (!ret) return;
      event.preventDefault();
      handleClose(ret.getAttribute('data-close-target'));
    });
  }


  async function restartEnquiryFlow(options = {}) {
    try {
      window._strongMumsRedirectHint = false;
      if (window._urlHints && typeof window._urlHints === 'object') {
        window._urlHints.strongMums = false;
        window._urlHints.pt = false;
      }
      sessionStorage.removeItem('strongMums.ptRedirect');
    } catch (_) {}

    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('pt')) {
        url.searchParams.delete('pt');
        window.history.replaceState({}, '', url.toString());
      }
      if (url.searchParams.has('strongmums')) {
        url.searchParams.delete('strongmums');
        window.history.replaceState({}, '', url.toString());
      }
    } catch (_) {}

    if (typeof window.forceChecklistFlag === 'function') {
      try {
        if (typeof STRONG_MUMS_CHECKLIST_LABEL !== 'undefined') {
          window.forceChecklistFlag(STRONG_MUMS_CHECKLIST_LABEL, false);
        }
        if (typeof STRONG_MUMS_PT_LABEL !== 'undefined') {
          window.forceChecklistFlag(STRONG_MUMS_PT_LABEL, false);
        }
      } catch (err) {
        console.warn('[Checklist] Failed to clear Strong Mums flags on restart', err);
      }
    }

    if (typeof window.clearStrongMumsLeadTag === 'function') {
      try {
        await window.clearStrongMumsLeadTag();
      } catch (err) {
        console.warn('[Checklist] Failed to clear Strong Mums tag on restart', err);
      }
    }

    if (typeof resetEnquirySelections === 'function') {
      try {
        await resetEnquirySelections();
      } catch (err) {
        console.warn('[Checklist] Failed to reset enquiry selections', err);
      }
    }

    if (typeof window.ensureEnquiryFlow === 'function') {
      window.ensureEnquiryFlow(window._latestContactFields || {}, {
        contactId: window.contactId,
        hints: window._urlHints || {},
        force: options.force !== false
      });
    }
  }

  function bindGlobalActions() {
    document.addEventListener('click', (e) => {
      const alertCard = e.target.closest('#checklist-alert');
      if (alertCard && alertCard.dataset.alertCta) {
        window.open(alertCard.dataset.alertCta, '_blank');
        return;
      }

      const clearBtn = e.target.closest('[data-clear-flag]');
      if (clearBtn) {
        e.preventDefault();
        e.stopPropagation();
        const label = clearBtn.getAttribute('data-clear-flag') || clearBtn.dataset.clearFlag;
        handleStaffClear(label, clearBtn);
        return;
      }
      const dropinsBtn = e.target.closest('[data-open-dropins]');
      if (dropinsBtn) {
        e.preventDefault();
        if (typeof window.openGymDropinsModal === 'function') {
          window.openGymDropinsModal();
        }
        return;
      }
      const btn = e.target.closest('[data-checklist-url]');
      if (btn) {
        const url = btn.getAttribute('data-checklist-url');
        if (url) window.open(url, '_blank');
        return;
      }

      const introCard = e.target.closest('[data-open-intro-card]');
      if (introCard) {
        const url = introCard.getAttribute('data-open-intro-card');
        if (url) window.open(url, '_blank');
        return;
      }

      const introBtn = e.target.closest('[data-open-intro]');
      if (introBtn) {
        e.preventDefault();
        const url = introBtn.getAttribute('data-open-intro');
        if (url) window.open(url, '_blank');
        return;
      }

      const restartBtn = e.target.closest('[data-restart-enquiry]');
      if (restartBtn) {
        e.preventDefault();
        restartEnquiryFlow({ force: true });
        return;
      }

      const dropinPassCard = e.target.closest('[data-dropin-pass]');
      if (dropinPassCard) {
        if (dropinPassCard.hasAttribute('data-dropin-disabled')) {
          e.preventDefault();
          return;
        }
        const passKey = dropinPassCard.getAttribute('data-dropin-pass');
        if (passKey) {
          openDropinPrereqModal(passKey);
        }
        return;
      }

      const dropinSwitch = e.target.closest('[data-switch-dropins]');
      if (dropinSwitch) {
        e.preventDefault();
        const targetFlow = dropinSwitch.getAttribute('data-switch-dropins');
        if (targetFlow === 'open-gym') {
          document.body.classList.remove('dropin-class');
          renderDropInTakeover(window._latestContactFields || {});
        }
        return;
      }

      const dropinStepBtn = e.target.closest('[data-dropin-step]');
      if (dropinStepBtn) {
        const stepIndex = Number(dropinStepBtn.getAttribute('data-dropin-step'));
        if (!Number.isNaN(stepIndex)) {
          goToDropinStep(stepIndex);
        }
        return;
      }

      const dropinStepNav = e.target.closest('[data-dropin-step-nav]');
      if (dropinStepNav) {
        const direction = dropinStepNav.getAttribute('data-dropin-step-nav');
        handleDropinStepNav(direction);
        return;
      }

      const dropinActionBtn = e.target.closest('[data-dropin-action]');
      if (dropinActionBtn) {
        e.preventDefault();
        const actionKey = dropinActionBtn.getAttribute('data-dropin-action');
        handleDropinAction(actionKey);
        return;
      }

      const dropinFlowClose = e.target.closest('[data-dropin-flow-close]');
      if (dropinFlowClose) {
        e.preventDefault();
        cancelDropinEmbeddedFlow();
        return;
      }

	      const planSelect = e.target.closest('[data-plan-select]');
	      if (planSelect) {
	        e.stopPropagation();
	        const planKey = planSelect.getAttribute('data-plan-select');
	        handlePlanSelect(planKey);
	        return;
	      }

	      const accordionBtn = e.target.closest('.dropin-card--expandable');
	      if (accordionBtn) {
	        accordionBtn.classList.toggle('is-open');
	        return;
	      }

      const discountBtn = e.target.closest('[data-action="discounts"]');
      if (discountBtn) {
        e.preventDefault();
        if (typeof window.openDiscountsModal === 'function') {
          window.openDiscountsModal();
        }
        return;
      }

      const launchEnquiry = e.target.closest('[data-action="launch-enquiry-wizard"]');
      if (launchEnquiry) {
        e.preventDefault();
        if (typeof window.ensureEnquiryFlow === 'function') {
          window.ensureEnquiryFlow(window._latestContactFields || {}, {
            contactId: window.contactId,
            hints: window._urlHints || {},
            force: true
          });
        } else {
          const url = `https://start.bomberspt.co.uk/?contactId=${encodeURIComponent(window.contactId || '')}`;
          window.open(url, '_blank');
        }
        return;
      }

      const membershipBtn = e.target.closest('[data-start-membership-enquiry]');
      if (membershipBtn) {
        e.preventDefault();
        promptMembershipEnquiryRestart();
        return;
      }
   });
 }

  async function convertDropinLeadToMembership(extraPayload) {
    if (!window.contactId) return;
    const C = window.CONSULT_FIELDS || {};
    const payload = Object.assign({}, extraPayload || {});
    if (C.serviceType && !payload[C.serviceType]) {
      payload[C.serviceType] = 'Open Gym';
    }
    if (C.joinClasses && !payload[C.joinClasses]) {
      payload[C.joinClasses] = 'No';
    }
    if (C.membershipIntent) {
      payload[C.membershipIntent] = 'Membership enquiry';
    }
    try {
      if (typeof window.updateFieldsBatch === 'function') {
        await window.updateFieldsBatch(window.contactId, payload);
      }
    } catch (err) {
      console.warn('[DropIn] failed to convert lead to membership', err);
    }
    window.location.href = `${window.location.pathname}?contactId=${encodeURIComponent(window.contactId)}&refresh=1`;
  }

  async function handlePlanSelect(planKey) {
    if (!planKey || !window.contactId) {
      window.location.href = window.location.pathname;
      return;
    }
    const leadField = window.CONSULT_FIELDS?.leadType;
    const extra = {};
    if (leadField) {
      extra[leadField] = planKey;
    }
    await convertDropinLeadToMembership(extra);
  }

  async function promptMembershipEnquiryRestart() {
    const message = 'Start on-boarding process?';
    const confirmed = typeof window.safeConfirm === 'function'
      ? await window.safeConfirm(message, { title: 'Start onboarding?', confirmText: 'OK' })
      : window.confirm(message);
    if (!confirmed) return;
    await convertDropinLeadToMembership();
  }

  async function init() {
    try {
      setAppLoadingState(true);
      applyStageLocks(stageStatusSnapshot);
      bindNav();
      bindAuxMenu();
      bindGlobalActions();
      if (typeof window.initializeCollapsibles === "function") { window.initializeCollapsibles(document); }
      bindModalReturnHandlers();
      setupThemeToggle();
      bindStaffHeadingToggle();
      ensureConsultationReminderBindings();

      // Basic FIELDS sanity warning for known placeholders
      (function sanityCheckFields(cfg){
        try {
          if (!cfg) return;
          const maybePlaceholders = [
            'MEMBERSHIP_SELECTION_DEADLINE',
            'PAY_12_OPEN',
            'FIRST_BILL_AMOUNT'
          ].filter(k => cfg[k] && String(cfg[k]).length < 15);
          if (maybePlaceholders.length) {
            console.warn('[Checklist] Some custom field IDs look like placeholders:', maybePlaceholders.join(', '));
          }
        } catch(_){}
      })(window.FIELDS);

      // Determine contactId and fetch
      const id = window.getContactIdFromURL ? window.getContactIdFromURL() : null;
      window.contactId = id || window.contactId || null;

      if (!window.contactId) {
        console.warn('[Checklist] No contactId found; dev-mode may supply mock contact');
      }

      window._bpLocalValues = window._bpLocalValues || {};
      const bpLocalMap = window._bpLocalValues;

      if (window._bpFeedbackContactId !== window.contactId) {
        window._bpFeedbackFlash = null;
        window._bpShowNextStep = false;
        window._bpFeedbackContactId = window.contactId;
      }

      const data = await (window.fetchContact && window.contactId ? window.fetchContact(window.contactId) : Promise.resolve({ contact: { tags: [], customField: [] } }));
      const contact = data.contact || {};
      const rawCustomFields = contact.customFields || contact.customField || [];
      let fields = mapFields(rawCustomFields);
       window._introAppointment = await loadIntroAppointment(window.contactId, fields);
       window._latestContact = contact;
       window._latestContactFields = fields;
       window._strongMumsRedirectHint = consumeStrongMumsRedirectHint();
       window._latestGhlRaw = data;
       window._checklistFieldState = getChecklistFieldState(fields);
       if (window._pendingChecklistFlags && Object.keys(window._pendingChecklistFlags).length) {
         Object.entries(window._pendingChecklistFlags).forEach(([label, val]) => {
           window._latestChecklistFlags[label] = !!val;
           updateLocalChecklistState(label, !!val);
         });
       }
       window._remoteChecklistSet = window._checklistFieldState?.normalizedSet instanceof Set
        ? new Set(window._checklistFieldState.normalizedSet)
        : new Set();
       window._latestChecklistFlags = window._latestChecklistFlags || {};
       const existingChecklistValues = Array.isArray(window._checklistFieldState?.values)
        ? window._checklistFieldState.values
        : [];
      existingChecklistValues.forEach(label => {
        if (!label) return;
        if (window._latestChecklistFlags[label]) return;
        window._latestChecklistFlags[label] = true;
      });

       (function reconcileLocalChecklistState() {
         const pendingLabels = Object.entries(window._latestChecklistFlags)
           .filter(([, value]) => !!value)
           .map(([label]) => label);
         if (!pendingLabels.length) return;
         if (!window._checklistFieldState) {
           window._checklistFieldState = createChecklistState(pendingLabels);
           return;
         }
         window._checklistFieldState.values = Array.isArray(window._checklistFieldState.values)
           ? window._checklistFieldState.values.slice()
           : [];
         window._checklistFieldState.normalizedSet = window._checklistFieldState.normalizedSet || new Set(window._checklistFieldState.values.map(normalizeOpportunityChecklistLabel));
         pendingLabels.forEach((label) => {
           const normalized = normalizeOpportunityChecklistLabel(label);
           if (window._checklistFieldState.normalizedSet.has(normalized)) return;
           window._checklistFieldState.values.push(label);
           window._checklistFieldState.normalizedSet.add(normalized);
         });
         window._checklistFieldState.active = window._checklistFieldState.normalizedSet.size > 0;
       })();

       syncIntroChecklistFromNative(window._introAppointment);
       reconcileChecklistTags(window._latestContact);
       await loadPrimaryOpportunity(window.contactId);

    const leadTypeFieldId = window.CONSULT_FIELDS?.leadType;
    const rawLeadType = leadTypeFieldId ? fields[leadTypeFieldId] : '';
    const leadTypeString = typeof rawLeadType === 'string' ? rawLeadType.trim() : '';
    window._leadTypeRaw = leadTypeString;
    window._leadTypeNormalized = leadTypeString.toLowerCase();

      let tagsSet = tagSet(contact);

      const fetchedBpRaw = fields[window.FIELDS?.BP_RESULT];
      const fetchedBpValue = typeof fetchedBpRaw === 'string' ? fetchedBpRaw.trim() : fetchedBpRaw ? String(fetchedBpRaw).trim() : '';
      if (fetchedBpValue) {
        bpLocalMap[window.contactId] = fetchedBpValue;
      }

      // No additional local BP caching — rely on stored custom field value

      const urlHints = parseUrlHints();
      window._urlHints = urlHints;
      window._staffMode = !!urlHints.staff;

      const initialTagsSet = tagSet(contact);

      if (urlHints.strongMums) {
        await handleStrongMumsUrlHint(fields, initialTagsSet);
        return;
      }

      if (urlHints.pt) {
        await handlePtUrlHint(fields);
      }

      if (typeof window.ensureEnquiryFlow === 'function') {
        setAppLoadingState(false);
        try {
          await window.ensureEnquiryFlow(fields, {
            contactId: window.contactId,
            hints: urlHints
          });
        } catch (flowErr) {
          console.warn('[Checklist] Enquiry flow skipped due to error', flowErr);
        }
      } else {
        setAppLoadingState(false);
      }
      fields = window._latestContactFields || fields;
      tagsSet = window._latestContact ? tagSet(window._latestContact) : tagsSet;

      const strongMumsBypass = hasStrongMumsPtSelection();
      const strongMumsIntent = window._strongMumsRedirectHint === true;

      if (urlHints.strongMums && !strongMumsBypass) {
        await handleStrongMumsUrlHint(fields, tagsSet);
        return;
      }
      if (urlHints.pt) {
        await handlePtUrlHint(fields);
      }
      if (!strongMumsBypass && (isStrongMumsLead(fields, tagsSet) || strongMumsIntent)) {
        await ensureStrongMumsLeadTag(tagsSet);
        renderStrongMumsFlow(fields);
        return;
      }
      if (isClassDropInLead(fields)) {
        renderClassDropInTakeover(fields);
        renderStaffChecklistPanel();
        return;
      }

      if (isOpenGymDropInLead(fields)) {
        renderDropInTakeover(fields);
        renderStaffChecklistPanel();
        return;
      }

      const parqComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.HEALTH_FORM, () =>
        getTagBool(tagsSet, (window.TAGS?.PARQ_SUBMITTED || 'par-q submitted')) || isParqCompleteFromData(fields)
      );
      const consultComplete = preferOpportunityFlag(OPPORTUNITY_LABELS.CONSULTATION_FORM, () =>
        getTagBool(tagsSet, (window.TAGS?.CONSULT_DONE || 'consultation form submitted'))
      );
      maybeShowConsultationReminder(contact, fields, tagsSet, window._introAppointment, {
        consultComplete,
        parqComplete,
        hints: urlHints
      });

      // Alert banners removed
      showAlert();

      const statusMap = computeStageStatus(contact, fields);
      const completionFlags = window._latestChecklistFlags || {};
      syncChecklistField(completionFlags);
      applyStageLocks(statusMap);

      renderEnquiry(contact, fields);
      renderInitial(contact, fields, statusMap);
      renderTrial(contact, fields, statusMap);
      renderStaffChecklistPanel();

      // Optional debug panel (enable with ?debug=1 or localStorage 'checklist.debug=1')
      try {
        const params = new URLSearchParams(window.location.search);
        const debugParam = params.get('debug');
        const lsDebug = (function(){ try { return localStorage.getItem('checklist.debug'); } catch(_) { return null; } })();
        const debugEnabled = (debugParam && debugParam !== '0' && debugParam !== 'false') || (lsDebug && lsDebug !== '0' && lsDebug !== 'false');

        if (debugEnabled) {
          renderDebugPanel(data, contact, fields);
        }
      } catch(_) {}

      // Default to the most up-to-date unlocked stage on page load.
      const desiredStage = determineDefaultStage(statusMap);
      let stageToActivate = null;
      if (window._bpPreventAutoAdvance) {
        const currentStage = window.currentSection;
        if (currentStage && statusMap[currentStage] && statusMap[currentStage].unlocked) {
          stageToActivate = currentStage;
        }
      }
      if (!stageToActivate) {
        if (statusMap[desiredStage] && statusMap[desiredStage].unlocked) {
          stageToActivate = desiredStage;
        } else {
          stageToActivate = determineDefaultStage(statusMap);
        }
      }
	      if (stageToActivate) {
	        setActiveTab(stageToActivate);
	      }
	      syncChecklistFromHashRoute(true);
	      window._bpPreventAutoAdvance = false;

      if (urlHints.consult && (!parqComplete || !consultComplete)) {
        setTimeout(() => {
          if (typeof window.handleConsultationLaunch === 'function') {
            window.handleConsultationLaunch();
          }
        }, 400);
      }

      // Bind 10-click manual overrides to items with data-override-key
      (function bindTenClickOverrides(root){
        try {
          const nodes = (root || document).querySelectorAll('li[data-override-key]');
          nodes.forEach(li => {
            if (li.dataset.overrideBound === '1') return;
            li.dataset.overrideBound = '1';
            li.addEventListener('click', () => {
              const now = Date.now();
              const first = Number(li.dataset.firstClickTs || '0');
              let count = Number(li.dataset.clickCount || '0');
              if (!first || now - first > 5000) { // reset after 5s
                li.dataset.firstClickTs = String(now);
                count = 0;
              }
              count += 1;
              li.dataset.clickCount = String(count);
              if (count >= 10) {
                const key = li.getAttribute('data-override-key');
                li.dataset.clickCount = '0';
                li.dataset.firstClickTs = String(now);
                if (key && typeof window.manualOverride === 'function') {
                  window.manualOverride(key);
                }
              }
            });
          });

	          const statusNodes = (root || document).querySelectorAll('[data-override-status]');
	          statusNodes.forEach(node => {
	            if (node.dataset.overrideBound === '1') return;
	            node.dataset.overrideBound = '1';
	            node.addEventListener('click', () => {
              const now = Date.now();
              const first = Number(node.dataset.firstClickTs || '0');
              let count = Number(node.dataset.clickCount || '0');
              if (!first || now - first > 5000) {
                node.dataset.firstClickTs = String(now);
                count = 0;
              }
              count += 1;
              node.dataset.clickCount = String(count);
              if (count >= 10) {
                node.dataset.clickCount = '0';
	                node.dataset.firstClickTs = String(now);
	                const statusKey = node.dataset.overrideStatus || '';
	                const nativeStatus = (node.dataset.nativeStatus || '').toLowerCase();
	                const hasConfirmed = hasLatestFlag(OPPORTUNITY_LABELS.INTRO_CONFIRMED);
	                const hasAttended = hasLatestFlag(OPPORTUNITY_LABELS.INTRO_ATTENDED);
	                if (statusKey === 'intro') {
	                  const isRequested = nativeStatus.includes('request') || nativeStatus === 'new' || (!hasConfirmed && !hasAttended);
	                  const isConfirmed = nativeStatus.includes('confirm') || hasConfirmed;

	                  if (typeof window.forceChecklistFlag === 'function') {
	                    if (isRequested) {
	                      window.forceChecklistFlag(OPPORTUNITY_LABELS.INTRO_CONFIRMED, true);
	                      scheduleChecklistRefresh();
	                      node.dataset.nativeStatus = 'confirmed';
	                      node.textContent = 'Status: Confirmed';
	                      if (typeof window.manualOverride === 'function') {
	                        window.manualOverride('intro_meeting_booked');
	                      }
	                      return;
	                    }

	                    if (isConfirmed && !hasAttended) {
	                      window.forceChecklistFlag(OPPORTUNITY_LABELS.INTRO_ATTENDED, true);
	                      scheduleChecklistRefresh();
	                      node.dataset.nativeStatus = 'showed';
	                      node.textContent = 'Status: Attended';
	                      if (typeof window.manualOverride === 'function') {
	                        window.manualOverride('intro_meeting_attended');
	                      }
	                      return;
	                    }
	                  }

	                  return;
	                }

	                if (typeof window.manualOverride === 'function') {
	                  const step = Number(node.dataset.overrideStep || '0');
	                  if (statusKey === 'initial') {
	                    if (step === 0) {
	                      window.manualOverride('mark_booked_1to1');
	                      node.dataset.overrideStep = '1';
	                    } else if (step === 1) {
	                      window.manualOverride('mark_attended_1to1');
	                      node.dataset.overrideStep = '2';
	                    } else if (step === 2) {
	                      window.manualOverride('session_debrief');
	                      node.dataset.overrideStep = '3';
	                    }
	                  }
	                }
	              }
	            });
	          });
	        } catch(_) {}
	      })(document);

      if (typeof window.initializeCollapsibles === "function") { window.initializeCollapsibles(document); }
    } catch (err) {
      console.error('[Checklist] init error', err);
      setAppLoadingState(false);
      showAlert();
      try { window.alert('Failed to load checklist. Please refresh.'); } catch (_) {}
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  // Expose if needed later
  window.handleIntroBooking = handleIntroBooking;
  window.handleInitialOneToOne = handleInitialOneToOne;
  window.renderChecklist = init;
  window.closeDropinPrereqModal = closeDropinPrereqModal;
  const CLEARABLE_STANDARD_FIELDS = [
    'CONTACT_CHECKLIST',
    'OPPORTUNITY_CHECKLIST',
    'BP_RESULT',
    'TRIAL_START',
    'BILL_DATE',
    'FUTURE_PLAN',
    'FIRST_BILL_AMOUNT',
    'CHOSEN_PRICE',
    'MEMBERSHIP_SELECTION_DEADLINE',
    'PAY_12_OPEN',
    'PLAN_STATUS',
    'PLAN_CATEGORY',
    'PLAN_NAME_LAST_CHANGED',
    'PLAN_CREDITS',
    'TRIAL_CANCEL_REASON',
    'TRIAL_CANCEL_CHANGE',
    'MEMBERSHIP_PAUSE_NOTICE_ACK',
    'MEMBERSHIP_RESUME_ACK',
    'MEMBERSHIP_PAUSE_CHARGE_ACK',
    'COACHED_SESSIONS_REMAINING'
  ].filter(Boolean);

  const CLEARABLE_CONSULT_FIELDS = [
    'membershipIntent',
    'serviceType',
    'serviceInterest',
    'joinClasses',
    'parqStorage'
  ].filter(Boolean);

	  const CLEARABLE_TAGS = [
	    'ENQUIRY_FORM_SUBMITTED',
	    'PARQ_SUBMITTED',
	    'CONSULT_DONE',
	    'CONSULT_SKIPPED',
	    'NSI_BOOKED',
	    'DC_BOOKED',
	    'INTRO_ATTENDED',
	    'BP_SKIP',
	    'PURCHASED_1TO1',
    'BOOKED_1TO1',
    'ONBOARDING_PROXY',
    'ATTENDED_1TO1',
    'INFORMED_CONSENT',
    'INDUCTION_DONE',
    'APPT_CHECKIN',
    'WODUP_DONE',
    'DEBRIEF_DONE',
    'OPEN_GYM_TCS',
    'TRIAL_TCS',
    'ANNUAL_PRICE_REVIEW',
    'CARD_ON_FILE',
    'APP_DOWNLOADED',
    'CANCEL_REQUEST_SUBMITTED'
  ].filter(Boolean);

  async function clearAllProgress() {
    const fieldUpdates = {};
    CLEARABLE_STANDARD_FIELDS.forEach((key) => {
      const fieldId = window.FIELDS?.[key] || window.CONSULT_FIELDS?.[key] || null;
      if (!fieldId) return;
      fieldUpdates[fieldId] = '';
    });

    CLEARABLE_CONSULT_FIELDS.forEach((key) => {
      const fieldId = window.CONSULT_FIELDS?.[key] || null;
      if (!fieldId) return;
      fieldUpdates[fieldId] = '';
    });

    const tagRemovals = [];
    const tagSet = new Set(
      (window._latestContact && Array.isArray(window._latestContact.tags)
        ? window._latestContact.tags
        : []
      ).map(tag => typeof tag === 'string' ? tag.toLowerCase() : '')
    );

    CLEARABLE_TAGS.forEach((tagKey) => {
      const tagName = window.TAGS?.[tagKey] || tagKey;
      if (!tagName) return;
      tagRemovals.push(tagName);
      const lower = tagName.toLowerCase();
      if (tagSet.has(lower)) {
        tagSet.delete(lower);
      }
    });

    try {
      if (Object.keys(fieldUpdates).length && typeof window.updateFieldsBatch === 'function') {
        await window.updateFieldsBatch(window.contactId, fieldUpdates);
      }
    } catch (err) {
      console.warn('[Checklist] Clear-all field update failed', err);
    }

    if (Array.isArray(tagRemovals) && tagRemovals.length && typeof window.removeTagFromContact === 'function') {
      for (const tag of tagRemovals) {
        try {
          await window.removeTagFromContact(window.contactId, tag);
        } catch (err) {
          console.warn('[Checklist] Failed to remove tag during clear-all', tag, err);
        }
      }
    }
    if (window._latestContact && Array.isArray(window._latestContact.tags)) {
      const removable = new Set(CLEARABLE_TAGS.map(key => (window.TAGS?.[key] || key).toLowerCase()));
      window._latestContact.tags = window._latestContact.tags.filter(tag => {
        if (!tag) return false;
        return !removable.has(String(tag).toLowerCase());
      });
    }

    window._latestChecklistFlags = {};
    window._checklistFieldState = createChecklistState([]);
    window._remoteChecklistSet = new Set();
    window._pendingChecklistFlags = {};

    if (typeof window.renderChecklist === 'function') {
      window.renderChecklist();
    }
  }

  function markEnquiryCompleteFromHint() {
    const label = window.OPPORTUNITY_LABELS?.ENQUIRY_FORM;
    if (!label) return;
    if (typeof window.forceChecklistFlag === 'function') {
      try {
        window.forceChecklistFlag(label, true);
      } catch (err) {
        console.warn('[Checklist] Unable to mark enquiry flag', err);
      }
    }
    window._latestChecklistFlags = window._latestChecklistFlags || {};
    if (!window._latestChecklistFlags[label]) {
      window._latestChecklistFlags[label] = true;
      if (typeof updateLocalChecklistState === 'function') {
        updateLocalChecklistState(label, true);
      }
    }
  }

  async function setLeadFieldValue(fieldId, value) {
    if (!fieldId) return;
    if (window._latestContactFields) {
      window._latestContactFields[fieldId] = value;
    }
    if (window.contactId && typeof window.updateFieldsBatch === 'function') {
      try {
        await window.updateFieldsBatch(window.contactId, { [fieldId]: value });
      } catch (err) {
        console.warn('[Checklist] Failed to set lead field', err);
      }
    }
  }

  async function handleStrongMumsUrlHint(fields, tagsSet) {
    const serviceField = window.CONSULT_FIELDS?.serviceType;
    const interestField = window.CONSULT_FIELDS?.serviceInterest;
    if (serviceField) await setLeadFieldValue(serviceField, 'Coached group sessions');
    if (interestField) await setLeadFieldValue(interestField, 'Strong Mums club');
    if (typeof window.markStrongMumsRedirectHint === 'function') {
      window.markStrongMumsRedirectHint();
    } else {
      window._strongMumsRedirectHint = true;
    }
    await ensureStrongMumsLeadTag(tagsSet || tagSet(window._latestContact || {}));
    markEnquiryCompleteFromHint();
    renderStrongMumsFlow(window._latestContactFields || fields || {});
  }

  async function handlePtUrlHint(fields) {
    const serviceField = window.CONSULT_FIELDS?.serviceType;
    if (serviceField) await setLeadFieldValue(serviceField, '1-1 Personal Training');
    markEnquiryCompleteFromHint();
  }


	  window.goToInitialStage = function() {
	    if (typeof window.setChecklistHashRoute === 'function') {
	      window.setChecklistHashRoute('initial121');
	      syncChecklistFromHashRoute(true);
	    } else if (typeof setActiveTab === 'function') {
	      setActiveTab('initial1');
	    }
	    window._bpFeedbackFlash = null;
	    window._bpShowNextStep = false;
	    window._bpPreventAutoAdvance = false;
	    const btn = document.getElementById('bp-next-step');
	    if (btn) btn.style.display = 'none';
    const feedback = document.getElementById('bp-feedback');
    if (feedback) feedback.style.display = 'none';
	  };
	  window.goToTrialStage = function() {
	    if (typeof window.setChecklistHashRoute === 'function') {
	      window.setChecklistHashRoute('chooseplan');
	      syncChecklistFromHashRoute(true);
	    } else if (typeof setActiveTab === 'function') {
	      setActiveTab('trial');
	    }
	  };

  window.openInitialDebriefModal = openInitialDebriefModal;
  window.closeInitialDebriefModal = closeInitialDebriefModal;

  const initialDebriefState = {
    index: 0,
    answers: [],
    submitting: false
  };

  function resetInitialDebriefState() {
    initialDebriefState.index = 0;
    initialDebriefState.answers = [];
    initialDebriefState.submitting = false;
  }

  function setInitialDebriefMessage(message, tone) {
    const statusEl = document.getElementById('initial-debrief-modal-status');
    if (!statusEl) return;
    if (!message) {
      statusEl.style.display = 'none';
      statusEl.textContent = '';
      return;
    }
    statusEl.style.display = 'block';
    if (tone === 'success') {
      statusEl.style.color = '#1f3c88';
    } else if (tone === 'muted') {
      statusEl.style.color = '#5b657a';
    } else {
      statusEl.style.color = '#c62828';
    }
    statusEl.textContent = message;
  }

  function renderInitialDebriefModal() {
    const body = document.getElementById('initial-debrief-body');
    const progress = document.getElementById('initial-debrief-progress');
    if (!body || !progress) return;

    const total = INITIAL_DEBRIEF_QUESTIONS.length;
    const currentIndex = initialDebriefState.index;

    if (currentIndex >= total) {
      const summaryRows = INITIAL_DEBRIEF_QUESTIONS.map((q, idx) => {
        const answer = (initialDebriefState.answers[idx] || '').toUpperCase() || 'NOT ANSWERED';
        const safeQ = window.escapeHtml ? window.escapeHtml(q) : q;
        return `<tr><td style="padding:6px 8px;border-bottom:1px solid #eef2ff;">${safeQ}</td><td style="padding:6px 8px;border-bottom:1px solid #eef2ff;">${answer}</td></tr>`;
      }).join('');
      progress.textContent = 'Review & confirm';
      body.innerHTML = `
        <div class="consultation-step-block">
          <h4 class="consultation-block-title" style="margin-bottom:0.5rem;">All answers recorded</h4>
          <p class="consultation-helper" style="margin-bottom:1rem;">Review your confirmations below. If you need to tweak one, hit back.</p>
          <div style="overflow:auto;margin-bottom:1rem;">
            <table style="width:100%;border-collapse:collapse;">
              <thead>
                <tr>
                  <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #dbe4ff;">Statement</th>
                  <th style="text-align:left;padding:6px 8px;border-bottom:2px solid #dbe4ff;">Answer</th>
                </tr>
              </thead>
              <tbody>${summaryRows}</tbody>
            </table>
          </div>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <button type="button" class="btn btn--muted" id="initial-debrief-back-summary">Back</button>
            <button type="button" class="btn" id="initial-debrief-complete">Confirm debrief</button>
          </div>
        </div>
        <div class="consultation-error" id="initial-debrief-modal-status" style="display:none;"></div>
      `;
      const backBtn = document.getElementById('initial-debrief-back-summary');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          initialDebriefState.index = Math.max(total - 1, 0);
          setInitialDebriefMessage('');
          renderInitialDebriefModal();
        });
      }
      const submitBtn = document.getElementById('initial-debrief-complete');
      if (submitBtn) {
        submitBtn.addEventListener('click', completeInitialDebrief);
      }
      return;
    }

    const question = INITIAL_DEBRIEF_QUESTIONS[currentIndex] || '';
    const safeQuestion = window.escapeHtml ? window.escapeHtml(question) : question;
    progress.textContent = `Question ${currentIndex + 1} of ${total}`;
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <button type="button" class="btn btn--muted" ${currentIndex === 0 ? 'disabled style="opacity:0.5;pointer-events:none;"' : ''} id="initial-debrief-back">&#8592; Back</button>
        <span style="color:#5b657a;font-size:0.9em;">Step ${currentIndex + 1} of ${total}</span>
      </div>
      <div class="consultation-parq-question">
        <div class="consultation-parq-label">${safeQuestion}</div>
        <div class="consultation-parq-options">
          <button type="button" class="parq-option" data-answer="yes">Yes</button>
          <button type="button" class="parq-option" data-answer="no">No</button>
        </div>
      </div>
      <div class="consultation-error" id="initial-debrief-modal-status" style="display:none;"></div>
    `;
    const backBtn = document.getElementById('initial-debrief-back');
    if (backBtn && currentIndex > 0) {
      backBtn.addEventListener('click', () => {
        initialDebriefState.index = Math.max(initialDebriefState.index - 1, 0);
        setInitialDebriefMessage('');
        renderInitialDebriefModal();
      });
    }
    const options = body.querySelectorAll('.parq-option');
    options.forEach(btn => {
      btn.addEventListener('click', () => {
        handleInitialDebriefAnswer(btn, btn.getAttribute('data-answer') || '');
      });
    });
    const priorAnswer = initialDebriefState.answers[currentIndex];
    if (priorAnswer) {
      const btn = body.querySelector(`.parq-option[data-answer="${priorAnswer}"]`);
      if (btn) {
        btn.classList.add('selected');
      }
    }
  }

  function handleInitialDebriefAnswer(button, answer) {
    const container = button && button.closest('.consultation-parq-options');
    if (container) {
      container.querySelectorAll('.parq-option').forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
    }

    let followUpMessage = '';
    let followUpTone = '';
    if (answer === 'no') {
      followUpMessage = 'Thanks for letting us know — we\'ll tailor your recommendations from here.';
      followUpTone = 'muted';
    }

    initialDebriefState.answers[initialDebriefState.index] = answer;
    initialDebriefState.index += 1;
    renderInitialDebriefModal();
    setInitialDebriefMessage(followUpMessage, followUpTone);
  }

  async function completeInitialDebrief() {
    if (initialDebriefState.submitting) return;
    if (!window.contactId) {
      setInitialDebriefMessage('Missing contact ID. Please refresh and try again.');
      return;
    }

    const submitBtn = document.getElementById('initial-debrief-complete');
    initialDebriefState.submitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
    }
    setInitialDebriefMessage('Saving...', 'muted');

    try {
      const normalizedAnswers = INITIAL_DEBRIEF_QUESTIONS.map((question, idx) => {
        const answer = (initialDebriefState.answers[idx] || '').toLowerCase() === 'yes' ? 'yes' : 'no';
        return { question, answer };
      });
      const hasConcerns = normalizedAnswers.some(entry => entry.answer !== 'yes');
      const insights = {
        contactId: window.contactId || window._latestContact?.id || '',
        answers: normalizedAnswers,
        hasConcerns,
        timestamp: Date.now()
      };
      if (window._latestContactFields) {
        window._latestContactFields.__debriefAnswers = JSON.stringify(normalizedAnswers);
        window._latestContactFields.__debriefHasConcerns = hasConcerns ? 'yes' : 'no';
      }
      persistDebriefInsights(insights);

      const tag = window.TAGS?.DEBRIEF_DONE || 'initial 1-1 debrief completed';
      if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS) {
        window.forceChecklistFlag(window.OPPORTUNITY_LABELS.DEBRIEF_COMPLETE, true);
      }
      if (typeof window.addTagToContact === 'function') {
        await window.addTagToContact(window.contactId, tag);
      }
      if (window._latestContact) {
        const tags = new Set(window._latestContact.tags || []);
        tags.add(tag);
        window._latestContact.tags = Array.from(tags);
      }
	      setInitialDebriefMessage('Debrief saved. Great work!', 'success');
	      setTimeout(() => {
	        closeInitialDebriefModal();
	        if (typeof window.renderChecklist === 'function') {
	          window.renderChecklist();
	        }
	        if (typeof window.goToTrialStage === 'function') {
	          window.goToTrialStage();
	        }
	      }, 250);
	    } catch (err) {
	      console.error('[InitialDebrief] submit failed', err);
      setInitialDebriefMessage(err?.message || 'Unable to save right now. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm debrief';
      }
      initialDebriefState.submitting = false;
      return;
    }

    initialDebriefState.submitting = false;
  }

  function openInitialDebriefModal() {
    const overlay = document.getElementById('initial-debrief-modal');
    if (!overlay) return;
    resetInitialDebriefState();
    renderInitialDebriefModal();
    overlay.style.display = 'flex';
    overlay.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeInitialDebriefModal() {
    const overlay = document.getElementById('initial-debrief-modal');
    if (!overlay) return;
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    resetInitialDebriefState();
  }
  // Expose debug trigger for convenience
  window.renderGhlDebug = function(){
    try {
      renderDebugPanel(window._latestGhlRaw || { contact: window._latestContact || {} }, window._latestContact || {}, window._latestContactFields || {});
    } catch(err) { console.warn('Debug render failed', err); }
  };

  // Minimal GHL debug panel renderer
  function renderDebugPanel(raw, contact, fields) {
    const existing = document.getElementById('ghl-debug-panel');
    if (existing) { existing.remove(); }

    const container = document.createElement('div');
    container.id = 'ghl-debug-panel';
    container.style.margin = '24px auto 40px';
    container.style.maxWidth = '1000px';
    container.style.background = '#fff';
    container.style.border = '2px dashed #b7d0ff';
    container.style.borderRadius = '10px';
    container.style.padding = '16px';
    container.style.boxShadow = '0 4px 18px rgba(0,0,0,0.05)';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '8px';
    header.innerHTML = '<div style="font-weight:700;color:#1f3c88;">GHL Debug</div>' +
      '<div style="display:flex;gap:8px;align-items:center;">' +
      '<button type="button" class="btn" id="ghl-debug-copy">Copy JSON</button>' +
      '<button type="button" class="btn" id="ghl-debug-toggle">Hide</button>' +
      '</div>';

    const body = document.createElement('div');
    body.id = 'ghl-debug-body';
    body.style.marginTop = '10px';
    body.style.display = 'block';
    body.style.overflow = 'auto';

    // Build sections
    const sec = (title, html) => `
      <div style="border:1px solid #e0e7f1;border-radius:8px;margin:12px 0;overflow:hidden;">
        <div style="background:#f5f7ff;padding:8px 12px;font-weight:600;color:#1f3c88;">${title}</div>
        <div style="padding:12px;">${html}</div>
      </div>`;

    // Tags list
    const tags = Array.isArray(contact.tags) ? contact.tags : [];
    const tagsHtml = tags.length ? `<div style="display:flex;flex-wrap:wrap;gap:8px;">${tags.map(t=>`<span style="background:#eef5ff;border:1px solid #d0defc;color:#1f3c88;border-radius:999px;padding:2px 8px;font-size:0.85em;">${window.escapeHtml(String(t))}</span>`).join('')}</div>` : '<em style="color:#6b7894;">(no tags)</em>';
    const escape = (value) => window.escapeHtml ? window.escapeHtml(String(value)) : String(value);

    const appointmentFetch = window._lastAppointmentsFetch || null;
    const apptIntro = window._introAppointment || null;
    const apptPayload = appointmentFetch?.data || null;
    const appointmentList = Array.isArray(apptPayload?.appointments) ? apptPayload.appointments : Array.isArray(apptPayload?.events) ? apptPayload.events : [];
    const apptFetchHtml = appointmentFetch
      ? `<div><strong>Fetch:</strong> ${appointmentFetch.ok ? 'OK' : 'FAILED'}${appointmentFetch.status ? ` (HTTP ${escape(appointmentFetch.status)})` : ''}${appointmentFetch.error ? ` — ${escape(appointmentFetch.error)}` : ''}</div>`
      : `<div style="color:#6b7894;"><strong>Fetch:</strong> (no record yet)</div>`;
    const apptIntroHtml = apptIntro
      ? `<div style="margin-top:6px;"><strong>Matched intro appointment:</strong> ${escape(apptIntro.title || '')} (${escape(apptIntro.statusLabel || apptIntro.status || '')}) — ${escape(apptIntro.startTime || '')}</div>`
      : `<div style="margin-top:6px;color:#6b7894;"><strong>Matched intro appointment:</strong> (none)</div>`;
    const apptRows = appointmentList.slice(0, 8).map((a) => {
      const title = a?.title || a?.appointmentTitle || a?.calendarTitle || a?.calendarName || a?.serviceName || a?.name || '';
      const status = a?.appointmentStatus || a?.statusLabel || a?.status || '';
      const start = a?.startTime || a?.startDateTime || a?.startDate || a?.start || a?.appointmentStartTime || '';
      return `<tr><td style="padding:6px 8px;border-top:1px solid #eef2fb;">${escape(title)}</td><td style="padding:6px 8px;border-top:1px solid #eef2fb;">${escape(status)}</td><td style="padding:6px 8px;border-top:1px solid #eef2fb;">${escape(start)}</td></tr>`;
    }).join('');
    const apptListHtml = appointmentList.length
      ? `<div style="overflow:auto;margin-top:10px;"><table style="width:100%;border-collapse:collapse;font-size:0.9em;">
          <thead><tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;">Title</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;">Status</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;">Start</th></tr></thead>
          <tbody>${apptRows}</tbody>
        </table></div>`
      : `<em style="color:#6b7894;">(no appointments returned)</em>`;
    const apptHtml = `${apptFetchHtml}${apptIntroHtml}${apptListHtml}`;

    // Collect custom fields from common shapes, then render tables
    const collectedArray = (() => {
      const sources = [];
      const r = raw || {};
      const c = contact || {};
      const addIfArray = (arr) => { if (Array.isArray(arr)) sources.push(arr); };
      addIfArray(c.customFields);
      addIfArray(c.customField);
      addIfArray(r.customFields);
      addIfArray(r.customField);
      if (r.contact) {
        addIfArray(r.contact.customFields);
        addIfArray(r.contact.customField);
      }
      const merged = [].concat(...sources);
      return merged
        .map(e => ({ id: e && (e.id || e.customFieldId || e.fieldId), value: e && (e.value ?? e.fieldValue ?? '') }))
        .filter(e => e && e.id);
    })();

    const effectiveFields = (() => {
      const entries = Object.entries(fields || {});
      if (entries.length) return fields;
      const map = {};
      collectedArray.forEach(cf => { map[cf.id] = cf.value ?? ''; });
      return map;
    })();

    // Diagnostic console logger: print mapped fields clearly without changing UI
    (function diagLog() {
      try {
        const empty = v => (v === undefined || v === null || String(v).trim() === '') ? '(empty)' : v;

        // Known FIELDS section
        const F = window.FIELDS || {};
        const knownRows = Object.entries(F)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([key, id]) => ({
            Key: key,
            FieldID: id,
            Value: empty((effectiveFields || {})[id])
          }));
        console.groupCollapsed('🔍 GHL Debug – Known FIELDS');
        if (knownRows.length) {
          console.table(knownRows);
        } else {
          console.log('(no FIELDS configured)');
        }
        console.groupEnd();

        // All Custom Fields section
        const allRows = Object.entries(effectiveFields || {})
          .sort((a, b) => String(a[0]).localeCompare(String(b[0])))
          .map(([id, value]) => ({ FieldID: id, Value: empty(value) }));
        console.groupCollapsed('🔍 GHL Debug – All Custom Fields');
        if (allRows.length) {
          console.table(allRows);
        } else {
          console.log('(no custom fields)');
        }
        console.groupEnd();
      } catch (e) {
        // Ensure diagnostics never break the page
        try { console.warn('[GHL Debug] logging failed:', e); } catch(_) {}
      }
    })();

    // Custom fields mapped view (by id and by known FIELDS)
    const fieldsTable = (() => {
      const entries = Object.entries(effectiveFields || {});
      if (!entries.length) return '<em style="color:#6b7894;">(no custom fields)</em>';
      const rows = entries
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([id, val]) => `<tr><td style=\"padding:6px 8px;border-top:1px solid #eef2fb;font-family:monospace;\">${window.escapeHtml(id)}</td><td style=\"padding:6px 8px;border-top:1px solid #eef2fb;word-break:break-word;\">${window.escapeHtml(String(val||''))}</td></tr>`)
        .join('');
      return `<div style=\"overflow:auto\"><table style=\"width:100%;border-collapse:collapse;\">`+
             `<thead><tr><th style=\"text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;\">Field ID</th><th style=\"text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;\">Value</th></tr></thead>`+
             `<tbody>${rows}</tbody></table></div>`;
    })();

    const knownFieldsTable = (() => {
      const F = window.FIELDS || {};
      const pairs = Object.entries(F);
      if (!pairs.length) return '<em style="color:#6b7894;">(no FIELDS configured)</em>';
      const rows = pairs
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([key, id]) => {
          const v = (effectiveFields || {})[id];
          return `<tr><td style="padding:6px 8px;border-top:1px solid #eef2fb;">${window.escapeHtml(key)}</td>`+
                 `<td style=\"padding:6px 8px;border-top:1px solid #eef2fb;font-family:monospace;\">${window.escapeHtml(String(id||''))}</td>`+
                 `<td style=\"padding:6px 8px;border-top:1px solid #eef2fb;word-break:break-word;\">${window.escapeHtml(String(v||''))}</td></tr>`;
        }).join('');
      return `<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;">`+
             `<thead><tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;">Key</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;">Field ID</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #d9e2f5;">Value</th></tr></thead>`+
             `<tbody>${rows}</tbody></table></div>`;
    })();

    const metaHtml = (() => {
      const lines = [
        ['contactId', String(window.contactId || '')],
        ['url', String(window.location?.href || '')],
        ['urlHints.bookedIntro', String(!!(window._urlHints && window._urlHints.bookedIntro))],
        ['urlHints.bookedCall', String(!!(window._urlHints && window._urlHints.bookedCall))],
        ['lastConsultReminderKind', String(window._lastConsultReminderKind || '')],
        ['tags.count', String((contact.tags||[]).length)],
        ['customFields.count', String(((contact.customFields||[]).length || 0) + ((contact.customField||[]).length || 0))],
        ['debug.collectedCustomFields', String(collectedArray.length)],
      ];
      return `<ul style="margin:0;padding-left:1.2em;">${lines.map(([k,v])=>`<li><strong>${window.escapeHtml(k)}:</strong> ${window.escapeHtml(v)}</li>`).join('')}</ul>`;
    })();

    const rawJson = (() => {
      try { return JSON.stringify(raw || {}, null, 2); } catch(_) { return '{}'; }
    })();

    body.innerHTML = [
      sec('Meta', metaHtml),
      sec('Tags', tagsHtml),
      sec('Appointments (native)', apptHtml),
      sec('Known FIELDS → values', knownFieldsTable),
      sec('All custom fields (id → value)', fieldsTable),
      sec('Raw GHL response (JSON)', `<pre style="white-space:pre-wrap;word-break:break-word;">${window.escapeHtml(rawJson)}</pre>`)
    ].join('');

    container.appendChild(header);
    container.appendChild(body);

    // Append after main container
    const mountAfter = document.getElementById('checklist-container') || document.body;
    mountAfter.parentElement ? mountAfter.parentElement.appendChild(container) : document.body.appendChild(container);

    const copyBtn = container.querySelector('#ghl-debug-copy');
    if (copyBtn && !copyBtn.dataset.bound) {
      copyBtn.dataset.bound = '1';
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(rawJson);
          copyBtn.textContent = 'Copied!';
          setTimeout(()=> copyBtn.textContent = 'Copy JSON', 1200);
        } catch(_) { /* ignore */ }
      });
    }

    const toggleBtn = container.querySelector('#ghl-debug-toggle');
    if (toggleBtn && !toggleBtn.dataset.bound) {
      toggleBtn.dataset.bound = '1';
      toggleBtn.addEventListener('click', () => {
        const visible = body.style.display !== 'none';
        body.style.display = visible ? 'none' : 'block';
        toggleBtn.textContent = visible ? 'Show' : 'Hide';
      });
    }
  }
})();
