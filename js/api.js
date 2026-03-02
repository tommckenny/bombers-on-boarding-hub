// anchor: api.base (GHL proxy helpers)
// API Functions
// All GHL (GoHighLevel) API interactions via the proxy

const API_BASE = 'https://ghl-proxy.fly.dev';

function resolveContactId(explicitId) {
  if (explicitId) return explicitId;
  const derived = typeof window !== 'undefined' ? window.contactId : null;
  if (!derived) {
    throw new Error('Missing contactId for API request');
  }
  return derived;
}

function toCustomFieldArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) {
    return payload
      .filter(entry => entry && entry.id)
      .map(entry => ({ id: entry.id, value: entry.value ?? '' }));
  }
  if (typeof payload === 'object') {
    return Object.entries(payload)
      .filter(([id]) => !!id)
      .map(([id, value]) => ({ id, value: value ?? '' }));
  }
  throw new Error('Invalid field payload supplied');
}

// anchor: api.updateFieldsBatch
async function updateFieldsBatch(contactIdOrPayload, maybePayload) {
  const hasExplicitId = typeof contactIdOrPayload === 'string' && typeof maybePayload !== 'undefined';
  const contactId = resolveContactId(hasExplicitId ? contactIdOrPayload : null);
  const payload = hasExplicitId ? maybePayload : contactIdOrPayload;
  const fields = toCustomFieldArray(payload);
  if (!fields.length) {
    return { success: true };
  }

  try {
    const res = await fetch(`${API_BASE}/contact/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customField: fields })
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Update failed: ${res.status} ${text}`.trim());
    }
    try {
      return text ? JSON.parse(text) : { success: true };
    } catch (_) {
      return { success: true };
    }
  } catch (err) {
    console.error('[updateFieldsBatch] Error:', err);
    throw err;
  }
}

async function updateContact(contactIdOrPayload, maybePayload) {
  const hasExplicitId = typeof contactIdOrPayload === 'string' && typeof maybePayload === 'object';
  const contactId = resolveContactId(hasExplicitId ? contactIdOrPayload : null);
  const payload = hasExplicitId ? maybePayload : contactIdOrPayload;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Contact payload is required');
  }

  const body = {};
  const contactUpdates = {};

  const assignContactProps = (source) => {
    if (!source || typeof source !== 'object') return;
    Object.entries(source).forEach(([key, value]) => {
      if (value === undefined) return;
      contactUpdates[key] = value;
    });
  };

  if (payload.contact && typeof payload.contact === 'object') {
    assignContactProps(payload.contact);
  }

  const CONTACT_KEYS = [
    'firstName',
    'lastName',
    'name',
    'email',
    'phone',
    'phoneE164',
    'companyName',
    'address1',
    'address2',
    'city',
    'state',
    'postalCode',
    'country',
    'timeZone',
    'dateOfBirth',
    'website',
    'source'
  ];
  CONTACT_KEYS.forEach((key) => {
    if (payload[key] !== undefined) {
      contactUpdates[key] = payload[key];
    }
  });

  if (Object.keys(contactUpdates).length) {
    Object.assign(body, contactUpdates);
  }

  const extractCustomFields = () => {
    const sources = [
      payload.customField,
      payload.customFields,
      payload.fields,
      payload.fieldUpdates
    ];
    for (const source of sources) {
      if (!source) continue;
      try {
        const normalized = toCustomFieldArray(source);
        if (normalized.length) {
          return normalized;
        }
      } catch (_) {
        console.warn('[updateContact] Unable to normalise custom field payload');
      }
    }
    return [];
  };

  const customFieldEntries = extractCustomFields();
  if (customFieldEntries.length) {
    body.customField = customFieldEntries;
  }

  if (!Object.keys(body).length) {
    return { success: true };
  }

  try {
    const res = await fetch(`${API_BASE}/contact/${contactId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Contact update failed: ${res.status} ${text}`.trim());
    }
    try {
      return text ? JSON.parse(text) : { success: true };
    } catch (_) {
      return { success: true };
    }
  } catch (err) {
    console.error('[updateContact] Error:', err);
    throw err;
  }
}

// anchor: api.addTagToContact
async function addTagToContact(contactIdOrTag, maybeTag) {
  const hasExplicitId = typeof maybeTag !== 'undefined';
  const contactId = resolveContactId(hasExplicitId ? contactIdOrTag : null);
  const tag = hasExplicitId ? maybeTag : contactIdOrTag;
  if (!tag) throw new Error('Tag value is required');

  try {
    const res = await fetch(`${API_BASE}/contact/${contactId}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: [tag] })
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Add tag failed: ${res.status} ${text}`.trim());
    }
    try {
      return text ? JSON.parse(text) : { success: true };
    } catch (_) {
      return { success: true };
    }
  } catch (err) {
    console.error('[addTagToContact] Error:', err);
    throw err;
  }
}

async function removeTagFromContact(contactIdOrTag, maybeTag) {
  const hasExplicitId = typeof maybeTag !== 'undefined';
  const contactId = resolveContactId(hasExplicitId ? contactIdOrTag : null);
  const tag = hasExplicitId ? maybeTag : contactIdOrTag;
  if (!tag) throw new Error('Tag value is required');

  try {
    const res = await fetch(`${API_BASE}/contact/${contactId}/tags`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: [tag] })
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Remove tag failed: ${res.status} ${text}`.trim());
    }
    try {
      return text ? JSON.parse(text) : { success: true };
    } catch (_) {
      return { success: true };
    }
  } catch (err) {
    console.error('[removeTagFromContact] Error:', err);
    throw err;
  }
}

async function fetchContact(contactId) {
  const id = resolveContactId(contactId);
  try {
    const res = await fetch(`${API_BASE}/contact/${id}?_=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error(`Failed to load contact: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[fetchContact] Error:', err);
    throw err;
  }
}

async function fetchContactAppointments(contactId) {
  const id = resolveContactId(contactId);
  const record = (update) => {
    try {
      window._lastAppointmentsFetch = Object.assign(
        { ts: Date.now(), contactId: id },
        window._lastAppointmentsFetch || {},
        update || {}
      );
    } catch (_) {}
  };
  try {
    const res = await fetch(`${API_BASE}/contact/${id}/appointments?_=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) {
      const text = await res.text();
      record({ ok: false, status: res.status, error: text || `Failed to load appointments: ${res.status}` });
      throw new Error(text || `Failed to load appointments: ${res.status}`);
    }
    const payload = await res.json();
    record({
      ok: true,
      status: res.status,
      data: payload,
      count: Array.isArray(payload?.appointments) ? payload.appointments.length : Array.isArray(payload?.events) ? payload.events.length : null
    });
    return payload;
  } catch (err) {
    console.error('[fetchContactAppointments] Error:', err);
    record({ ok: false, error: err?.message || String(err) });
    throw err;
  }
}
async function fetchContactOpportunities(contactId) {
  const id = resolveContactId(contactId);
  try {
    const res = await fetch(`${API_BASE}/contact/${id}/opportunities?_=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to load opportunities: ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error('[fetchContactOpportunities] Error:', err);
    throw err;
  }
}

async function updateOpportunityCustomFields(opportunityId, customFields) {
  if (!opportunityId || !Array.isArray(customFields)) {
    throw new Error('Missing opportunityId or customFields');
  }
  try {
    const res = await fetch(`${API_BASE}/opportunities/${opportunityId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customFields })
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(text || `Failed to update opportunity: ${res.status}`);
    }
    return text ? JSON.parse(text) : { success: true };
  } catch (err) {
    console.error('[updateOpportunityCustomFields] Error:', err);
    throw err;
  }
}


async function addNoteToContact(contactIdOrNote, maybeNote) {
  const hasExplicitId = typeof maybeNote !== 'undefined';
  const contactId = resolveContactId(hasExplicitId ? contactIdOrNote : null);
  const note = hasExplicitId ? maybeNote : contactIdOrNote;
  const noteText = typeof note === 'string' ? note.trim() : '';
  if (!noteText) throw new Error('Note text is required');

  try {
    const res = await fetch(`${API_BASE}/contact/${contactId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteText })
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Add note failed: ${res.status} ${text}`.trim());
    }
    try {
      return text ? JSON.parse(text) : { success: true };
    } catch (_) {
      return { success: true };
    }
  } catch (err) {
    console.error('[addNoteToContact] Error:', err);
    throw err;
  }
}



// Export to global scope
window.updateFieldsBatch = updateFieldsBatch;
window.updateContact = updateContact;
window.addTagToContact = addTagToContact;
window.removeTagFromContact = removeTagFromContact;
window.fetchContact = fetchContact;
window.fetchContactAppointments = fetchContactAppointments;
window.fetchContactOpportunities = fetchContactOpportunities;
window.updateOpportunityCustomFields = updateOpportunityCustomFields;
window.addNoteToContact = addNoteToContact;
