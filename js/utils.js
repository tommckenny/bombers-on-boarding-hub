// anchor: utils.start (DOM helpers, date/format, URL utils)
// Utility Functions
// Helper functions for DOM manipulation, formatting, and common operations

// anchor: utils.safeDom
// Safe DOM manipulation helpers
function isElementNode(node) {
  return node && node.nodeType === 1;
}

window.safeSetHTML = function(node, html) {
  if (isElementNode(node)) {
    try {
      if (node.isConnected && !node.hasAttribute('data-v-app')) {
        node.innerHTML = html;
      }
    } catch (err) {
      console.debug('[safeSetHTML] Error updating element:', err.message);
    }
  }
};

window.safeAppend = function(parent, child) {
  if (isElementNode(parent) && isElementNode(child)) {
    try {
      if (parent.isConnected && !parent.hasAttribute('data-v-app')) {
        parent.appendChild(child);
      }
    } catch (err) {
      console.debug('[safeAppend] Error appending element:', err.message);
    }
  }
};

window.safeInsertAdjacentElement = function(target, position, element) {
  if (isElementNode(target) && isElementNode(element)) {
    try {
      if (target.isConnected && !target.hasAttribute('data-v-app')) {
        target.insertAdjacentElement(position, element);
      }
    } catch (err) {
      console.debug('[safeInsertAdjacentElement] Error inserting element:', err.message);
    }
  }
};

window.safeRemove = function(node) {
  if (isElementNode(node)) {
    try {
      if (node.isConnected && !node.hasAttribute('data-v-app') && !node.closest('[data-v-app]')) {
        node.remove();
      }
    } catch (err) {
      console.debug('[safeRemove] Error removing element:', err.message);
    }
  }
};

// anchor: utils.formatting
// HTML escaping
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Ordinal number formatting (1st, 2nd, 3rd, etc.)
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Date formatting functions
function formatDateTime(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    const day = ordinal(d.getDate());
    const month = d.toLocaleDateString('en-GB', { month: 'long' });
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} at ${time}`;
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// anchor: utils.burst
// Confetti celebration
function burst(x, y) {
  if (typeof confetti !== 'undefined') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: x || 0.5, y: y || 0.5 }
    });
  }
}

// anchor: utils.getContactIdFromURL
// Contact ID extraction from URL
function getContactIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  let contactId = params.get('contactId') || params.get('contactid');

  // Also allow hash-based override: index.html#contactId=XYZ
  if (!contactId && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    contactId = hashParams.get('contactId') || hashParams.get('contactid') || contactId;
  }

  // Developer override via localStorage (useful when opening file://)
  if (!contactId) {
    try {
      const stored = localStorage.getItem('checklist.contactId');
      if (stored) contactId = stored;
    } catch (_) {}
  }

  if (!contactId) {
    const match = window.location.pathname.match(/-contactId=([^\/]+)/);
    if (match) {
      contactId = match[1];
    }
  }

  return contactId;
}

// Export to global scope
window.escapeHtml = escapeHtml;
window.ordinal = ordinal;
window.formatDateTime = formatDateTime;
window.formatShortDate = formatShortDate;
window.burst = burst;
window.getContactIdFromURL = getContactIdFromURL;

// anchor: utils.hashRoutes
// Simple hash-route helpers (for shareable in-app navigation).
function getChecklistHashRoute() {
  const raw = decodeURIComponent((window.location.hash || '').replace(/^#/, '')).trim();
  if (!raw) return '';
  const token = raw.split(/[?&]/)[0].trim().toLowerCase();
  if (!token || token.includes('=')) return '';
  return token;
}

function setChecklistHashRoute(route) {
  const next = String(route || '').replace(/^#/, '').trim();
  const currentHash = String(window.location.hash || '');

  if (!next && (!currentHash || currentHash === '#')) return;

  // Preserve any hash params already present (e.g. `#enquiry&contactId=XYZ` or `#contactId=XYZ`).
  // This avoids losing contactId (and prevents some hash-change loops in embedded browsers).
  const raw = decodeURIComponent(currentHash.replace(/^#/, '')).trim();
  let preserved = '';
  const delimiterIndex = raw.search(/[?&]/);
  if (delimiterIndex >= 0) {
    preserved = raw.slice(delimiterIndex);
  } else if (raw.includes('=')) {
    preserved = `&${raw}`;
  }

  const target = next ? `${next}${preserved}` : preserved.replace(/^[?&]/, '');
  if (target && currentHash === `#${target}`) return;

  // Basic rate limit to avoid Chrome navigation flood protection.
  const now = Date.now();
  if (window.__checklistLastHashSet && now - window.__checklistLastHashSet < 250) return;
  window.__checklistLastHashSet = now;

  window.location.hash = target;
}

function getChecklistHubHashRoute() {
  const stage = (window.currentSection || (function() {
    try { return sessionStorage.getItem('checklist-active-stage'); } catch (_) { return ''; }
  })() || '').toLowerCase();

  if (stage === 'initial1') return 'initial121';
  if (stage === 'trial') return 'chooseplan';
  return 'enquiry';
}

window.getChecklistHashRoute = getChecklistHashRoute;
window.setChecklistHashRoute = setChecklistHashRoute;
window.getChecklistHubHashRoute = getChecklistHubHashRoute;

// Lightweight iframe modal helpers (Google Forms / Surveys)
window.showGoogleFormIframe = function(formUrl) {
  const modal = document.getElementById('google-form-modal');
  const frame = document.getElementById('google-form-frame');
  if (!modal || !frame) return;
  try {
    frame.src = formUrl;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.iframe-close');
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', () => {
        frame.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        frame.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }, { once: true });
  } catch (err) {
    console.error('[showGoogleFormIframe] Error:', err);
  }
};

window.showSurveyIframe = function(surveyUrl) {
  const modal = document.getElementById('survey-modal');
  const frame = document.getElementById('survey-frame');
  if (!modal || !frame) return;
  try {
    frame.src = surveyUrl;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.iframe-close');
    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = '1';
      closeBtn.addEventListener('click', () => {
        frame.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = '';
      });
    }
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        frame.src = '';
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }, { once: true });
  } catch (err) {
    console.error('[showSurveyIframe] Error:', err);
  }
};

// Collapsible helpers (lightweight)
window.setCollapsibleState = function(section, state) {
  if (!section) return;
  const toggle = section.querySelector('.collapsible-toggle');
  const content = section.querySelector('.collapsible-content');
  if (!toggle || !content) return;
  const locked = section.classList.contains('is-locked') || toggle.hasAttribute('disabled');
  if (locked) {
    section.classList.add('is-collapsed');
    section.classList.remove('is-expanded');
    toggle.setAttribute('aria-expanded', 'false');
    return;
  }
  const next = state === 'collapsed' ? 'collapsed' : 'expanded';
  section.classList.toggle('is-collapsed', next === 'collapsed');
  section.classList.toggle('is-expanded', next === 'expanded');
  toggle.setAttribute('aria-expanded', next === 'collapsed' ? 'false' : 'true');
};

window.initializeCollapsibles = function(root) {
  if (!root) root = document;
  window._collapsibleState = window._collapsibleState || {};
  const sections = root.querySelectorAll('[data-collapsible-id]');
  sections.forEach(section => {
    const id = section.getAttribute('data-collapsible-id');
    if (!id) return;
    const toggle = section.querySelector('.collapsible-toggle');
    const content = section.querySelector('.collapsible-content');
    if (!toggle || !content) return;
    const locked = section.classList.contains('is-locked') || toggle.hasAttribute('disabled');
    if (!content.id) content.id = `collapsible-${id}`;
    toggle.setAttribute('aria-controls', content.id);
    const storedState = window._collapsibleState[id];
    const def = section.getAttribute('data-collapsible-default') || 'expanded';
    const initial = locked ? 'collapsed' : (storedState || def);
    window.setCollapsibleState(section, initial);
    if (locked || toggle.dataset.collapsibleBound === 'true') return;
    toggle.dataset.collapsibleBound = 'true';
    toggle.addEventListener('click', () => {
      const current = section.classList.contains('is-collapsed') ? 'collapsed' : 'expanded';
      const next = current === 'collapsed' ? 'expanded' : 'collapsed';
      window._collapsibleState[id] = next;
      window.setCollapsibleState(section, next);
    });
  });
};
