(function() {
  const OVERLAY_ID = 'app-dialog-overlay';
  let active = null;
  let prevBodyOverflow = '';
  let lastPointerUpAt = 0;

  function eventTargetElement(event) {
    if (!event) return null;
    const path = typeof event.composedPath === 'function' ? event.composedPath() : null;
    if (path && path.length) {
      for (const node of path) {
        if (node && node.nodeType === Node.ELEMENT_NODE) return node;
      }
    }
    const target = event.target;
    if (target && target.nodeType === Node.ELEMENT_NODE) return target;
    if (target && target.parentElement) return target.parentElement;
    return null;
  }

  function ensureOverlay() {
    let overlay = document.getElementById(OVERLAY_ID);
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.className = 'app-dialog-overlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
      <div class="app-dialog" role="dialog" aria-modal="true" aria-labelledby="app-dialog-title">
        <div class="app-dialog__title" id="app-dialog-title"></div>
        <div class="app-dialog__message" id="app-dialog-message"></div>
        <div class="app-dialog__actions" id="app-dialog-actions"></div>
      </div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function closeActive(result) {
    if (!active) return;
    const { overlay, resolve, onKeyDown, onPointerDown, onPointerUp, onClick } = active;
    active = null;
    try {
      document.removeEventListener('keydown', onKeyDown, true);
      if (overlay) {
        overlay.removeEventListener('pointerdown', onPointerDown, true);
        overlay.removeEventListener('pointerup', onPointerUp, true);
        overlay.removeEventListener('click', onClick, true);
        overlay.style.display = 'none';
      }
      document.body.classList.remove('app-dialog-open');
      document.body.style.overflow = prevBodyOverflow;
    } catch (_) {}
    resolve(result);
  }

  function openDialog({ title, message, confirmText, cancelText }) {
    if (active) return active.promise;
    const overlay = ensureOverlay();
    const titleEl = overlay.querySelector('#app-dialog-title');
    const messageEl = overlay.querySelector('#app-dialog-message');
    const actionsEl = overlay.querySelector('#app-dialog-actions');

    if (titleEl) titleEl.textContent = title || 'Confirm';
    if (messageEl) messageEl.textContent = message || '';
    if (actionsEl) {
      actionsEl.innerHTML = `
        <button type="button" class="btn btn--muted" data-dialog-cancel>${cancelText || 'Cancel'}</button>
        <button type="button" class="btn btn--primary" data-dialog-confirm>${confirmText || 'OK'}</button>
      `;
    }

    overlay.style.display = 'flex';
    prevBodyOverflow = document.body.style.overflow || '';
    document.body.classList.add('app-dialog-open');
    document.body.style.overflow = 'hidden';

    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const onKeyDown = (event) => {
      if (!active) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeActive(false);
        return;
      }
      if (event.key === 'Enter') {
        const focused = document.activeElement;
        if (focused && focused.hasAttribute('data-dialog-cancel')) return;
        event.preventDefault();
        closeActive(true);
      }
    };

    const onPointerDown = (event) => {
      const dialog = overlay.querySelector('.app-dialog');
      if (!dialog) return;
      if (event.target === overlay) {
        event.preventDefault();
      }
    };

    const handleAction = (event) => {
      const el = eventTargetElement(event);
      if (!el) return;

      const cancel = typeof el.closest === 'function' ? el.closest('[data-dialog-cancel]') : null;
      if (cancel) {
        event.preventDefault();
        closeActive(false);
        return;
      }

      const confirm = typeof el.closest === 'function' ? el.closest('[data-dialog-confirm]') : null;
      if (confirm) {
        event.preventDefault();
        closeActive(true);
        return;
      }

      if (el === overlay) {
        event.preventDefault();
        closeActive(false);
      }
    };

    const onPointerUp = (event) => {
      lastPointerUpAt = Date.now();
      handleAction(event);
    };

    const onClick = (event) => {
      if (Date.now() - lastPointerUpAt < 450) return;
      handleAction(event);
    };

    active = { overlay, resolve: resolvePromise, promise, onKeyDown, onPointerDown, onPointerUp, onClick };

    document.addEventListener('keydown', onKeyDown, true);
    overlay.addEventListener('pointerdown', onPointerDown, true);
    overlay.addEventListener('pointerup', onPointerUp, true);
    overlay.addEventListener('click', onClick, true);

    const cancelBtn = overlay.querySelector('[data-dialog-cancel]');
    if (cancelBtn) cancelBtn.focus();

    return promise;
  }

  async function safeConfirm(message, options = {}) {
    return openDialog({
      title: options.title || 'Confirm',
      message: message || '',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel'
    });
  }

  window.safeConfirm = safeConfirm;
})();
