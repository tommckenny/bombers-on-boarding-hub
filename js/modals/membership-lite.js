(function() {
  const TEMPLATE_URL = 'https://start.bomberspt.co.uk/membership-options';
  const IFRAME_URL = 'https://start.bomberspt.co.uk/membership-options';
  let templatePromise = null;
  let templateInjected = false;
  let openPromise = null;

  function getPlaceholder() {
    return document.querySelector('#membership-content [data-membership-placeholder]');
  }

  function updatePlaceholder(text, isError) {
    const placeholder = getPlaceholder();
    if (!placeholder) return;
    placeholder.classList.toggle('membership-placeholder--error', Boolean(isError));
    const spinner = placeholder.querySelector('.membership-placeholder__spinner');
    if (spinner) {
      spinner.style.display = isError ? 'none' : '';
    }
    const textEl = placeholder.querySelector('.membership-placeholder__text');
    if (textEl && typeof text === 'string') {
      textEl.textContent = text;
    }
  }

  function fetchTemplate() {
    if (!templatePromise) {
      templatePromise = fetch(TEMPLATE_URL, { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch membership template');
          }
          return response.text();
        });
    }
    return templatePromise;
  }

  function injectInlineScript(code) {
    if (!code) return;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.textContent = code;
    document.body.appendChild(script);
  }

  function injectScriptSrc(src) {
    if (!src) return;
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.body.appendChild(script);
  }

  function injectIframe(container) {
    const iframeSrc = encodeURI(IFRAME_URL);
    container.innerHTML = [
      '<style>',
      '#membership-content iframe{width:100%;height:100%;border:0;min-height:70vh;background:transparent;}',
      '</style>',
      `<iframe title="Gym pricing" src="${iframeSrc}"></iframe>`
    ].join('');
  }

  async function ensureTemplateInjected() {
    if (templateInjected) return;
    const container = document.getElementById('membership-content');
    if (!container) {
      throw new Error('Membership modal content container missing');
    }
    if (window.location && window.location.protocol === 'file:') {
      injectIframe(container);
      templateInjected = true;
      return;
    }
    let html = '';
    try {
      html = await fetchTemplate();
    } catch (error) {
      // Local file:// loads can block fetch; fall back to iframe.
      injectIframe(container);
      templateInjected = true;
      return;
    }
    const parsed = new DOMParser().parseFromString(html, 'text/html');
    const styles = Array.from(parsed.querySelectorAll('style'))
      .map((style) => style.textContent || '')
      .join('\n');
    const bodyHtml = parsed.body ? parsed.body.innerHTML : html;
    container.innerHTML = styles ? `<style>${styles}</style>${bodyHtml}` : bodyHtml;
    const scripts = Array.from(parsed.querySelectorAll('script'));
    scripts.forEach((script) => {
      if (script.src) {
        injectScriptSrc(script.src);
      } else {
        injectInlineScript(script.textContent);
      }
    });
    templateInjected = true;
  }

  function showModal() {
    const modal = document.getElementById('membership-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeModal() {
    const modal = document.getElementById('membership-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function wireCloseHandlers() {
    const modal = document.getElementById('membership-modal');
    if (!modal || modal.nodeType !== 1 || modal.dataset.closeWired === 'true') return;
    modal.dataset.closeWired = 'true';
    modal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const closeTarget = target.closest('[data-close-target="membership"]');
      if (closeTarget) {
        event.preventDefault();
        closeModal();
      }
    });
  }

  function openMembershipModal() {
    if (!openPromise) {
      openPromise = (async () => {
        updatePlaceholder('Preparing membership options...', false);
        await ensureTemplateInjected();
        wireCloseHandlers();
        showModal();
      })().catch((error) => {
        console.error('[Membership] failed to open modal', error);
        updatePlaceholder('Unable to load membership options right now. Please try again in a moment.', true);
        throw error;
      }).finally(() => {
        openPromise = null;
      });
    }
    return openPromise;
  }

  window.showMembershipModal = openMembershipModal;
  window.openMembershipOverlay = openMembershipModal;
})();
