(function() {
// anchor: info-modals.showFaqsModal
	function showFaqsModal() {
		    const modal = document.getElementById('faqs-modal');
		    if (!modal || modal.nodeType !== 1) return;
		    try {
		      const raw = (window.location.hash || '').replace(/^#/, '');
		      if (!raw.includes('=') && typeof window.setChecklistHashRoute === 'function') {
		        window.setChecklistHashRoute('faqs');
		      }
		    } catch (_) {}

    // Render the FAQs content
    renderFaqsContent();

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

	  function closeFaqsModal() {
	    const modal = document.getElementById('faqs-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    modal.style.display = 'none';
	    document.body.style.overflow = '';
	    try {
	      if (typeof window.getChecklistHashRoute === 'function'
	        && window.getChecklistHashRoute() === 'faqs'
	        && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute(typeof window.getChecklistHubHashRoute === 'function'
	          ? window.getChecklistHubHashRoute()
	          : 'enquiry');
	      }
	    } catch (_) {}
	  }

  function renderFaqsContent() {
    const container = document.getElementById('faqs-content');
    if (!container || container.nodeType !== 1) return;

    const contentHTML = `
      <div style="max-width:800px; margin:0 auto;">
        <h1 style="text-align:center; color:#1f3c88; font-size:2em; margin-bottom:1em;">Frequently Asked Questions</h1>
        <div class="faq-section">
          <h3 style="color:#1f3c88; margin-top:1.5em;">What happens after onboarding?</h3>
          <p>Once your onboarding session is complete, you’ll confirm the membership or access plan that fits best. Your first 28 days act as a cooling-off period—adjust or cancel anytime during that window.</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">How much does the onboarding session cost, and why is it mandatory?</h3>
          <p>All new joiners complete a one-to-one onboarding session before joining classes or using the open gym. The session costs £60.00 (our PT single-session rate) and is mandatory so we can ensure:</p>
          <ul>
            <li>We know it is appropriate for you to begin our training programme</li>
            <li>You have been shown explicitly how to use important safety equipment (crucial for unsupervised gym use)</li>
          </ul>

          <h3 style="color:#1f3c88; margin-top:1.5em;">Can I choose my coach for the intro session?</h3>
          <p>We generally match you with one of our coaches based on availability. However you are able to choose your coach when booking. If you have a strong preference, just let us know in your intro and we'll do our best to accommodate.</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">What is the Bombers Blueprint?</h3>
          <p>Our Blueprint is a balanced training program combining strength, endurance, mobility, and flexibility work. It draws on CrossFit, powerlifting, and endurance methods to build a resilient, well-rounded athlete.</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">What happens if I can't make my booked intro?</h3>
          <p>Simply cancel or reschedule via your confirmation email or contact us directly, and we'll get you slotted into the next available coach session.</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">How do I book my onboarding session?</h3>
          <p>During your intro, you’ll receive a link to purchase and book your onboarding session (or we can send it via chat if you prefer).</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">Is there a minimum membership length?</h3>
          <p>There are no long-term contracts. Membership renews every 28 days, and you can cancel at any time with a 28-day notice.</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">What if I have health concerns or existing injuries?</h3>
          <p>Your PAR-Q flags any risks up front. If you have particular issues, mention them in your consultation & health form or discuss with your coach so we can adapt your programming safely.</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">Can I pause my membership?</h3>
          <p>Yes - If memberships can be paused with a minium notice of 28 days. T&Cs apply (we'll explain in your intro).</p>

          <h3 style="color:#1f3c88; margin-top:1.5em;">How do I get help if I have questions after onboarding?</h3>
          <p>You can reach out to us on WhatsApp, SMS, or Email, or chat to a coach before or after class!</p>
        </div>
      </div>
    `;

    safeSetHTML(container, contentHTML);
  }

  // Blueprint Modal Functions
	  function showBlueprintModal() {
	    const modal = document.getElementById('blueprint-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    try {
	      const raw = (window.location.hash || '').replace(/^#/, '');
	      if (!raw.includes('=') && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute('blueprint');
	      }
	    } catch (_) {}

    // Render the Blueprint content
    renderBlueprintContent();

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

	  function closeBlueprintModal() {
	    const modal = document.getElementById('blueprint-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    modal.style.display = 'none';
	    document.body.style.overflow = '';
	    try {
	      if (typeof window.getChecklistHashRoute === 'function'
	        && window.getChecklistHashRoute() === 'blueprint'
	        && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute(typeof window.getChecklistHubHashRoute === 'function'
	          ? window.getChecklistHubHashRoute()
	          : 'enquiry');
	      }
	    } catch (_) {}
	  }

  function renderBlueprintContent() {
    const container = document.getElementById('blueprint-content');
    if (!container || container.nodeType !== 1) return;

    const contentHTML = `
      <div class="blueprint-shell">
        <h1 class="blueprint-heading">About the Bombers Blueprint</h1>
        <p class="blueprint-intro">
          The Blueprint is our year-round operating system for general physical preparedness. Every phase is designed to balance strength, conditioning, skill, and recovery so members can train hard, often, and safely.
        </p>
        <div class="blueprint-grid">
          <article class="blueprint-card">
            <h2>Ethos</h2>
            <p>A well-rounded programme that develops strength, muscular endurance, speed, power, mobility, and stamina.</p>
          </article>
          <article class="blueprint-card">
            <h2>Training DNA</h2>
            <p>Hybrid methodology blending CrossFit, powerlifting, mixed-modal endurance (including HYROX-style events), and athletic accessory work.</p>
          </article>
          <article class="blueprint-card">
            <h2>Structure</h2>
            <p>Coaches brief intent and stimulus, then athletes work at the pace their body needs: push when ready, deload when necessary, and always chase quality movement.</p>
          </article>
          <article class="blueprint-card">
            <h2>Purpose</h2>
            <p>Build durable, strong humans with measurable progress over quarters: better bone density, easier daily life, improved mood and composition, and reduced injury risk.</p>
          </article>
        </div>
      </div>
    `;

    safeSetHTML(container, contentHTML);
  }

  // How Onboarding Works Modal Functions
	  function showOnboardingWorksModal() {
	    const modal = document.getElementById('onboardingworks-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    try {
	      const raw = (window.location.hash || '').replace(/^#/, '');
	      if (!raw.includes('=') && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute('onboarding');
	      }
	    } catch (_) {}

    // Render the onboarding works content
    renderOnboardingWorksContent();

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

	  function closeOnboardingWorksModal() {
	    const modal = document.getElementById('onboardingworks-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    modal.style.display = 'none';
	    document.body.style.overflow = '';
	    try {
	      if (typeof window.getChecklistHashRoute === 'function'
	        && window.getChecklistHashRoute() === 'onboarding'
	        && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute(typeof window.getChecklistHubHashRoute === 'function'
	          ? window.getChecklistHubHashRoute()
	          : 'enquiry');
	      }
	    } catch (_) {}
	  }

	  function showTimetableModal() {
	    const modal = document.getElementById('timetable-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    try {
	      const raw = (window.location.hash || '').replace(/^#/, '');
	      if (!raw.includes('=') && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute('timetable');
	      }
	    } catch (_) {}
    const timetableUrl = 'https://bomberspt.pushpress.com/landing/calendar';
    const openLink = modal.querySelector('[data-timetable-open]');
    if (openLink) {
      openLink.setAttribute('href', timetableUrl);
    }
    const iframe = modal.querySelector('[data-timetable-iframe]');
    if (iframe && !iframe.getAttribute('src')) {
      iframe.setAttribute('src', timetableUrl);
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

	  function closeTimetableModal() {
	    const modal = document.getElementById('timetable-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    modal.style.display = 'none';
	    document.body.style.overflow = '';
	    try {
	      if (typeof window.getChecklistHashRoute === 'function'
	        && window.getChecklistHashRoute() === 'timetable'
	        && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute(typeof window.getChecklistHubHashRoute === 'function'
	          ? window.getChecklistHubHashRoute()
	          : 'enquiry');
	      }
	    } catch (_) {}
	  }

  const ONBOARDING_WALKTHROUGH_STEPS = [
    {
      title: 'Start With Your 1-to-1 Onboarding',
      body: `
        <p class="onboarding-walkthrough__lead">All new joiners are required to complete a 1-to-1 onboarding session before joining any coached group training sessions or using the open gym.</p>
        <ul class="onboarding-walkthrough__list">
          <li><strong>Session cost:</strong> £60.00 (our PT single session rate)</li>
          <li><strong>This is mandatory. No exceptions.</strong></li>
        </ul>
        <div class="onboarding-walkthrough__callout">
          <h3>Why do we do this?</h3>
          <p>Our onboarding process has evolved over years to ensure new members receive the support needed whether joining classes or using the open gym.</p>
          <ul>
            <li>We know it is appropriate for you to begin our training programme</li>
            <li>You have been shown explicitly how to use important safety equipment (crucial for unsupervised gym use)</li>
          </ul>
        </div>
      `
    },
    {
      title: 'What Happens In The Session',
      body: `
        <p class="onboarding-walkthrough__lead">What the session includes</p>
        <ul class="onboarding-walkthrough__list onboarding-walkthrough__list--check">
          <li>A full movement screen (this is not a fitness test)</li>
          <li>Assessment of your current ability level and what programming is appropriate</li>
          <li>Practice of the key movement patterns used in our training</li>
          <li>A body composition scan</li>
          <li>Setup on both our member app and training software</li>
          <li>Instruction on using all safety equipment — essential before unstaffed gym access is granted</li>
        </ul>
      `
    },
    {
      title: 'Session Debrief',
      body: `
        <p class="onboarding-walkthrough__lead">Session Debrief</p>
        <ul class="onboarding-walkthrough__list onboarding-walkthrough__list--icons">
          <li>🧠 You'll have a debrief with your coach to discuss your options</li>
          <li>💬 We’ll map out whether you need a PT block, class pack, or open-gym plan before you commit.</li>
        </ul>
      `
    },
    {
      title: 'Getting Started',
      body: `
        <p class="onboarding-walkthrough__lead">Next Steps</p>
        <ul class="onboarding-walkthrough__list onboarding-walkthrough__list--icons">
          <li>🎉 Your chosen plan starts!</li>
          <li>🧾 Your first 28 days is a cooling-off period—you can cancel any time during this window.</li>
          <li>❌ No long-term contracts! After your first 28 days, we simply require 28 days notice to action a cancellation.</li>
        </ul>
      `
    }
  ];

  function initOnboardingWalkthrough(root) {
    if (!root) return;
    const viewport = root.querySelector('[data-walkthrough-viewport]');
    const progress = root.querySelector('[data-walkthrough-progress]');
    const dots = Array.from(root.querySelectorAll('[data-dot-index]'));
    const prevBtn = root.querySelector('[data-walkthrough-action="prev"]');
    const nextBtn = root.querySelector('[data-walkthrough-action="next"]');
    const membershipButton = root.closest('.fullscreen-modal')?.querySelector('[data-membership-forward]') || root.querySelector('[data-membership-forward]');
    const slides = Array.from(root.querySelectorAll('[data-walkthrough-slide]'));
    if (!viewport || !progress || !slides.length) return;

    const total = slides.length;
    let index = 0;
    let ticking = false;

    const updateUI = () => {
      progress.textContent = `Step ${index + 1} of ${total}`;
      dots.forEach((dot, idx) => {
        if (idx === index) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === total - 1;
    };

    const scrollToIndex = (nextIndex) => {
      const clamped = Math.max(0, Math.min(total - 1, nextIndex));
      index = clamped;
      const target = slides[index];
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      updateUI();
    };

    const findClosestIndex = () => {
      const top = viewport.scrollTop;
      let closest = 0;
      let minDelta = Infinity;
      slides.forEach((slide, idx) => {
        const delta = Math.abs(slide.offsetTop - top);
        if (delta < minDelta) {
          minDelta = delta;
          closest = idx;
        }
      });
      return closest;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const nextIndex = findClosestIndex();
        if (nextIndex !== index) {
          index = nextIndex;
          updateUI();
        }
        ticking = false;
      });
    };

    viewport.addEventListener('scroll', handleScroll);

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetIndex = Number(dot.dataset.dotIndex);
        if (!Number.isNaN(targetIndex)) {
          scrollToIndex(targetIndex);
        }
      });
    });

    prevBtn?.addEventListener('click', () => scrollToIndex(index - 1));
    nextBtn?.addEventListener('click', () => scrollToIndex(index + 1));
    if (membershipButton) {
      membershipButton.addEventListener('click', (event) => {
        event.preventDefault();
        if (typeof window.closeOnboardingWorksModal === 'function') {
          window.closeOnboardingWorksModal();
        }
        if (typeof window.showMembershipModal === 'function') {
          window.showMembershipModal();
        }
      });
    }

    root.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        scrollToIndex(index + 1);
      } else if (event.key === 'ArrowUp') {
        scrollToIndex(index - 1);
      }
    });

    updateUI();
  }

  function renderOnboardingWorksContent() {
    const container = document.getElementById('onboardingworks-content');
    if (!container || container.nodeType !== 1) return;

    const slides = ONBOARDING_WALKTHROUGH_STEPS.map(step => {
      const safeTitle = window.escapeHtml ? window.escapeHtml(step.title) : step.title;
      return `
      <article class="onboarding-walkthrough__slide" data-walkthrough-slide aria-label="${safeTitle}">
        <div class="onboarding-walkthrough__card">
          <h2>${step.title}</h2>
          ${step.body}
        </div>
      </article>
    `;
    }).join('');

    const dots = ONBOARDING_WALKTHROUGH_STEPS.map((_, idx) =>
    `<button type="button" class="onboarding-walkthrough__dot" data-dot-index="${idx}" aria-label="Go to step ${idx + 1}"></button>`
    ).join('');

    const contentHTML = `
      <div class="onboarding-walkthrough" tabindex="0">
        <div class="onboarding-walkthrough__head">
          <h1>How Our Onboarding Works</h1>
          <p>Follow the journey from your onboarding session through to choosing your plan.</p>
        </div>
        <div class="onboarding-walkthrough__viewport" data-walkthrough-viewport>
          <div class="onboarding-walkthrough__track" data-walkthrough-track>
            ${slides}
          </div>
        </div>
        <div class="onboarding-walkthrough__progress" data-walkthrough-progress aria-live="polite"></div>
        <div class="onboarding-walkthrough__dots" data-walkthrough-dots>
          ${dots}
        </div>
        <div class="onboarding-walkthrough__controls">
          <button type="button" class="btn onboarding-walkthrough__nav" data-walkthrough-action="prev" aria-label="Previous step">↑</button>
          <button type="button" class="btn btn--primary onboarding-walkthrough__nav" data-walkthrough-action="next" aria-label="Next step">↓</button>
        </div>
      </div>
    `;

    safeSetHTML(container, contentHTML);
    initOnboardingWalkthrough(container.querySelector('.onboarding-walkthrough'));
  }

  // Expose functions to window
  window.showFaqsModal = showFaqsModal;
  window.closeFaqsModal = closeFaqsModal;
  window.showBlueprintModal = showBlueprintModal;
  window.closeBlueprintModal = closeBlueprintModal;
  window.showOnboardingWorksModal = showOnboardingWorksModal;
  window.closeOnboardingWorksModal = closeOnboardingWorksModal;
  window.showTimetableModal = showTimetableModal;
  window.closeTimetableModal = closeTimetableModal;

	  // T&Cs Overview Modal
		  function showTcsModal() {
		    const modal = document.getElementById('tcs-modal');
		    if (!modal || modal.nodeType !== 1) return;
		    try {
		      const raw = (window.location.hash || '').replace(/^#/, '');
		      if (!raw.includes('=') && typeof window.setChecklistHashRoute === 'function') {
		        window.setChecklistHashRoute('tcs');
		      }
		    } catch (_) {}
		    renderTcsContent();
		    modal.style.display = 'flex';
		    document.body.style.overflow = 'hidden';
		    modal.scrollTop = 0;
		  }

		  function closeTcsModal() {
		    const modal = document.getElementById('tcs-modal');
		    if (!modal || modal.nodeType !== 1) return;
		    modal.style.display = 'none';
		    document.body.style.overflow = '';
		    try {
		      if (typeof window.getChecklistHashRoute === 'function'
		        && window.getChecklistHashRoute() === 'tcs'
		        && typeof window.setChecklistHashRoute === 'function') {
		        window.setChecklistHashRoute(typeof window.getChecklistHubHashRoute === 'function'
		          ? window.getChecklistHubHashRoute()
		          : 'enquiry');
		      }
		    } catch (_) {}
		  }

	  function renderTcsContent() {
	    const container = document.getElementById('tcs-content');
	    if (!container || container.nodeType !== 1) return;

	    const contactId = window.contactId || '';
	    const tagsRaw = Array.isArray(window._latestContact?.tags) ? window._latestContact.tags : [];
	    const tags = new Set(tagsRaw.map(t => String(t || '').toLowerCase()).filter(Boolean));
	    const fields = (window._latestContactFields && typeof window._latestContactFields === 'object') ? window._latestContactFields : {};
	    const checklistValues = Array.isArray(window._checklistFieldState?.values) ? window._checklistFieldState.values : [];

	    const hasChecklistLabel = (label) => {
	      if (!label) return false;
	      const needle = String(label).trim().toLowerCase();
	      return checklistValues.some(val => String(val || '').trim().toLowerCase() === needle);
	    };

	    const isCompleted = (item) => {
	      if (item.checklistLabel && hasChecklistLabel(item.checklistLabel)) return true;
	      if (item.tagKey && tags.has(String(item.tagKey).toLowerCase())) return true;
	      if (item.signatureFieldId && fields[item.signatureFieldId]) return true;
	      return false;
	    };

	    const items = [
	      {
	        id: 'induction',
	        title: 'Online induction',
	        description: 'Complete the induction so you can train safely and independently.',
	        checklistLabel: window.OPPORTUNITY_LABELS?.ONLINE_INDUCTION,
	        tagKey: window.TAGS?.INDUCTION_DONE,
	        signatureFieldId: window.FIELDS?.INDUCTION_SIGNATURE,
	        actionLabel: 'Open induction',
	        open: () => window.showInitialInductionModal?.()
	      },
	      {
	        id: 'parq',
	        title: 'Health form (PAR-Q)',
	        description: 'Submit your health questionnaire and signature.',
	        checklistLabel: window.OPPORTUNITY_LABELS?.HEALTH_FORM,
	        tagKey: window.TAGS?.PARQ_SUBMITTED,
	        signatureFieldId: window.FIELDS?.PARQ_SIGNATURE,
	        actionLabel: 'Open PAR-Q',
	        open: () => window.openParqModal?.()
	      },
	      {
	        id: 'consult',
	        title: 'Consultation questions',
	        description: 'Tell us about your goals so we can tailor your intro.',
	        checklistLabel: window.OPPORTUNITY_LABELS?.CONSULTATION_FORM,
	        tagKey: window.TAGS?.CONSULT_DONE,
	        actionLabel: 'Open consultation',
	        open: () => window.openConsultationFormModal?.()
	      },
	      {
	        id: 'consent',
	        title: 'Informed consent',
	        description: 'Review the risks and consent to take part in training.',
	        checklistLabel: window.OPPORTUNITY_LABELS?.INFORMED_CONSENT,
	        tagKey: window.TAGS?.INFORMED_CONSENT,
	        signatureFieldId: window.FIELDS?.INFORMED_CONSENT_SIGNATURE,
	        actionLabel: 'Open consent',
	        open: () => {
	          if (!contactId) return alert('Missing contact details. Refresh and try again.');
	          window.openTermsModal?.(window.TAGS?.INFORMED_CONSENT || 'informed consent signed', contactId, () => {});
	        }
	      },
	      {
	        id: 'membership-tcs',
	        title: 'Membership T&Cs',
	        description: 'Rolling contract, payments, and pause policy.',
	        tagKey: 'membership t&cs signed',
	        signatureFieldId: window.FIELDS?.MEMBERSHIP_TCS_SIGNATURE,
	        actionLabel: 'Open membership T&Cs',
	        open: () => {
	          if (!contactId) return alert('Missing contact details. Refresh and try again.');
	          window.openTermsModal?.('membership t&cs signed', contactId, () => {});
	        }
	      },
	      {
	        id: 'gym-tcs',
	        title: 'Gym & access T&Cs',
	        description: 'Class/open gym policies, no-shows, cancellations, and pause terms.',
	        checklistLabel: window.OPPORTUNITY_LABELS?.GYM_TCS,
	        tagKey: 'class t&cs signed',
	        actionLabel: 'Open gym T&Cs',
	        open: () => {
	          if (!contactId) return alert('Missing contact details. Refresh and try again.');
	          window.openTermsModal?.('class t&cs signed', contactId, () => {});
	        }
	      },
	      {
	        id: 'trial-tcs',
	        title: 'Plan activation terms',
	        description: 'How billing and cancellation notice works once your plan starts.',
	        checklistLabel: window.OPPORTUNITY_LABELS?.TRIAL_TCS,
	        tagKey: window.TAGS?.TRIAL_TCS,
	        actionLabel: 'Open plan terms',
	        open: () => {
	          if (!contactId) return alert('Missing contact details. Refresh and try again.');
	          window.openTermsModal?.(window.TAGS?.TRIAL_TCS || 'trial t&cs signed', contactId, () => {});
	        }
	      },
	      {
	        id: 'card-on-file',
	        title: 'Card on file agreement',
	        description: 'Authorise BombersPT to store a saved payment method.',
	        checklistLabel: window.OPPORTUNITY_LABELS?.CARD_ON_FILE,
	        tagKey: window.TAGS?.CARD_ON_FILE,
	        actionLabel: 'Open card agreement',
	        open: () => {
	          if (!contactId) return alert('Missing contact details. Refresh and try again.');
	          window.openTermsModal?.(window.TAGS?.CARD_ON_FILE || 'card on file agreement', contactId, () => {});
	        }
	      },
	    ];

	    const rowsHtml = items.map(item => {
	      const done = isCompleted(item);
	      const statusText = done ? 'Completed' : 'Not completed';
	      const buttonClass = done ? 'btn btn--muted' : 'btn btn--primary';
	      return `
	        <div class="tcs-overview__item" data-tcs-item="${item.id}">
	          <label class="tcs-overview__check">
	            <input type="checkbox" ${done ? 'checked' : ''} disabled>
	          </label>
	          <div class="tcs-overview__meta">
	            <div class="tcs-overview__title">${window.escapeHtml ? window.escapeHtml(item.title) : item.title}</div>
	            <div class="tcs-overview__desc">${window.escapeHtml ? window.escapeHtml(item.description) : item.description}</div>
	            <div class="tcs-overview__status">${statusText}</div>
	          </div>
	          <div class="tcs-overview__actions">
	            <button type="button" class="${buttonClass}" data-tcs-open="${item.id}">${window.escapeHtml ? window.escapeHtml(item.actionLabel) : item.actionLabel}</button>
	          </div>
	        </div>
	      `;
	    }).join('');

	    const contentHTML = `
	      <div class="tcs-overview">
	        <div class="tcs-overview__header">
	          <h1>T&amp;Cs &amp; Forms</h1>
	          <p>Use this page to check what’s completed and catch up on anything missing. This doesn’t change your onboarding progress unless you submit a form.</p>
	        </div>
	        <div class="tcs-overview__list">
	          ${rowsHtml}
	        </div>
	      </div>
	    `;

	    safeSetHTML(container, contentHTML);

	    if (container.dataset.bound === '1') return;
	    container.dataset.bound = '1';
	    container.addEventListener('click', (event) => {
	      const btn = event.target.closest('[data-tcs-open]');
	      if (!btn) return;
	      event.preventDefault();
	      const id = btn.getAttribute('data-tcs-open') || '';
	      const item = items.find(x => x.id === id);
	      if (!item || typeof item.open !== 'function') return;
	      try {
	        item.open();
	      } catch (err) {
	        console.error('[TCS Overview] open failed', err);
	      }
	    });
	  }

	  window.showTcsModal = showTcsModal;
	  window.closeTcsModal = closeTcsModal;
  
  // No-Sweat Intro Modal
  function ensureIntroModal() {
    let modal = document.getElementById('intro-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'intro-modal';
      modal.className = 'info-modal';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="info-modal-content">
          <button type="button" class="close-button" aria-label="Close" onclick="window.closeIntroModal && window.closeIntroModal()">&times;</button>
          <div id="intro-content"></div>
        </div>`;
      document.body.appendChild(modal);
    } else {
      // If the intro modal was accidentally nested inside another modal, reparent it to body
      try {
        const nestedInHiddenAncestor = modal.closest('#trial-week-modal, .info-modal');
        if (nestedInHiddenAncestor && modal.parentElement !== document.body) {
          document.body.appendChild(modal);
        }
      } catch(_) {}
    }
    return modal;
  }

  function renderIntroContent() {
    const container = document.getElementById('intro-content');
    if (!container || container.nodeType !== 1) return;
    const contentHTML = `
      <div style="max-width:800px; margin:0 auto;">
        <h1 style="text-align:center; color:#1f3c88; font-size:2em; margin-bottom:1em;">What to Expect: No‑Sweat Intro</h1>
        <div style="background:#fff; border:2px solid #2154fc; border-radius:12px; padding:24px; margin-bottom:24px;">
          <p style="font-size:1.08em; margin-top:0;">
            A friendly, no‑sweat meeting to get to know you and show you around. No workout—just a relaxed chat and a quick tour.
          </p>
        </div>
        <div style="background:#f8faff; border:1px solid #d6e0f2; border-radius:12px; padding:24px;">
          <h2 style="color:#1f3c88; margin-top:0;">In your intro, we will:</h2>
          <ul style="padding-left:1.5em; line-height:1.8;">
            <li>Show you the gym layout, equipment, and how the space works</li>
            <li>Have a short fitness consultation to understand goals and preferences</li>
            <li>Explore membership options that fit your schedule and budget</li>
          </ul>
          <p style="margin-top:1em; color:#2d3652;">It’s completely free and there’s no pressure—just the information you need to decide if BombersPT is right for you.</p>
        </div>
      </div>`;
    window.safeSetHTML(container, contentHTML);
  }

function showIntroModal() {
  const modal = ensureIntroModal();
  renderIntroContent();
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  modal.scrollTop = 0;
}

  function closeIntroModal() {
    const modal = document.getElementById('intro-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.showIntroModal = showIntroModal;
  window.closeIntroModal = closeIntroModal;

  function ensureInitialOneToOneModal() {
    let modal = document.getElementById('initial-onetoone-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'initial-onetoone-modal';
      modal.className = 'info-modal';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="info-modal-content">
          <button type="button" class="close-button" aria-label="Close" onclick="window.closeInitialOneToOneModal && window.closeInitialOneToOneModal()">&times;</button>
          <div id="initial-onetoone-content"></div>
        </div>`;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function renderInitialOneToOneContent() {
    const container = document.getElementById('initial-onetoone-content');
    if (!container || container.nodeType !== 1) return;
    const contentHTML = `
      <div style="max-width:820px;margin:0 auto;">
        <h1 style="text-align:center;color:var(--text-main, #e5e7eb);font-size:2em;margin-bottom:1em;">What to Expect: Initial 1-1 Onboarding Session</h1>
        <div style="background:rgba(2, 6, 23, 0.35);border:1px solid rgba(255,255,255,0.14);border-radius:16px;padding:24px;margin-bottom:24px;">
          <p style="margin:0;font-size:1.05em;line-height:1.7;color:var(--text-main, #e5e7eb);">
            Your onboarding PT session lasts around 60 minutes and is completely tailored to you. We focus on movement quality, safety, and building a training plan that fits your goals.
          </p>
        </div>
        <section style="background:rgba(2, 6, 23, 0.22);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:24px;margin-bottom:20px;">
          <h2 style="color:var(--text-main, #e5e7eb);margin-top:0;">Session Flow</h2>
          <ul style="padding-left:1.5em;line-height:1.8;color:var(--text-main, #e5e7eb);">
            <li><strong>Check-in & goals refresh</strong> — quick chat to confirm aims, history, and any red flags.</li>
            <li><strong>Movement screen</strong> — guided mobility and stability checks so we know how you move.</li>
            <li><strong>Technique coaching</strong> — we cover the foundational lifts and key equipment you’ll use most.</li>
            <li><strong>Personalised practice</strong> — short blocks of work scaled to your level so you leave confident.</li>
            <li><strong>Wrap-up & plan</strong> — review takeaways, outline your training pathway, and answer questions.</li>
          </ul>
        </section>
        <section style="background:rgba(2, 6, 23, 0.22);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:24px;margin-bottom:20px;">
          <h2 style="color:var(--text-main, #e5e7eb);margin-top:0;">What to Bring</h2>
          <ul style="padding-left:1.5em;line-height:1.8;color:var(--text-main, #e5e7eb);">
            <li>Comfortable training kit and clean trainers.</li>
            <li>A water bottle and optional notebook if you like taking cues home.</li>
            <li>Any recent injury or medical updates we should know about.</li>
          </ul>
        </section>
        <section style="background:rgba(245, 158, 11, 0.10);border:1px solid rgba(245, 158, 11, 0.35);border-radius:16px;padding:24px;">
          <h2 style="color:#fde68a;margin-top:0;">After the Session</h2>
          <ul style="padding-left:1.5em;line-height:1.8;color:var(--text-main, #e5e7eb);">
            <li>Your coach logs notes so classes and programming can be tailored from day one.</li>
            <li>You’ll get clear guidance on the best membership option for your goals and schedule.</li>
            <li>We’ll confirm your next steps (plan start, classes, open-gym access) before you leave.</li>
          </ul>
        </section>
      </div>
    `;
    safeSetHTML(container, contentHTML);
  }

  function showInitialOneToOneModal() {
    const modal = ensureInitialOneToOneModal();
    renderInitialOneToOneContent();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeInitialOneToOneModal() {
    const modal = document.getElementById('initial-onetoone-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.showInitialOneToOneModal = showInitialOneToOneModal;
  window.closeInitialOneToOneModal = closeInitialOneToOneModal;

  function ensureManageInitialOneToOneModal() {
    let modal = document.getElementById('manage-initial-onetoone-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'manage-initial-onetoone-modal';
      modal.className = 'info-modal';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="info-modal-content">
          <button type="button" class="close-button" aria-label="Close" onclick="window.closeManageInitialOneToOneModal && window.closeManageInitialOneToOneModal()">&times;</button>
          <div id="manage-initial-onetoone-content"></div>
        </div>`;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function renderManageInitialOneToOneContent() {
    const container = document.getElementById('manage-initial-onetoone-content');
    if (!container || container.nodeType !== 1) return;
    const contentHTML = `
      <div style="max-width:700px;margin:0 auto;">
        <h1 style="text-align:center;color:#1f3c88;font-size:2em;margin-bottom:1em;">Manage Your Onboarding Session</h1>
        <div style="background:#fff;border:2px solid #2154fc;border-radius:12px;padding:24px;margin-bottom:24px;">
          <p style="margin:0;font-size:1.05em;line-height:1.7;color:#24355a;">
            You can reschedule or cancel directly in the Bombers app. Any updates automatically sync with our team.
          </p>
        </div>
        <section style="background:#f8fbff;border:1px solid #d6e0f2;border-radius:12px;padding:24px;margin-bottom:20px;">
          <h2 style="color:#1f3c88;margin-top:0;">Manage via the Bombers App</h2>
          <ol style="padding-left:1.5em;line-height:1.9;color:#314266;">
            <li>Open the Bombers app and tap <strong>Sessions &gt; Upcoming</strong>.</li>
            <li>Select your onboarding appointment to reschedule or cancel.</li>
            <li>Follow the prompts and confirm the new time or cancellation.</li>
          </ol>
          <div style="margin-top:1.25em;display:flex;flex-wrap:wrap;gap:12px;">
            <a href="https://apps.apple.com/gb/app/bombers-physical-training/id1589832573" target="_blank" rel="noopener" class="btn" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
              <span>Download on iOS</span>
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.pushpress.bombersphysicaltraining&pcampaignid=web_share" target="_blank" rel="noopener" class="btn" style="text-decoration:none;display:inline-flex;align-items:center;gap:8px;">
              <span>Get it on Android</span>
            </a>
          </div>
        </section>
        <section style="background:#fff8f1;border:1px solid #f5d3a8;border-radius:12px;padding:24px;">
          <h2 style="color:#a36500;margin-top:0;">Need a hand?</h2>
          <p style="color:#5b4632;line-height:1.7;">
            If the app doesn’t show the slot you need, or something isn’t clear, open the chat widget on this page and our team will take care of it with you.
          </p>
        </section>
      </div>
    `;
    safeSetHTML(container, contentHTML);
  }

  function showManageInitialOneToOneModal() {
    const modal = ensureManageInitialOneToOneModal();
    renderManageInitialOneToOneContent();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeManageInitialOneToOneModal() {
    const modal = document.getElementById('manage-initial-onetoone-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.showManageInitialOneToOneModal = showManageInitialOneToOneModal;
  window.closeManageInitialOneToOneModal = closeManageInitialOneToOneModal;
  window.showInitialPurchaseModal = showInitialPurchaseModal;
  window.closeInitialPurchaseModal = closeInitialPurchaseModal;

  function ensureInitialPurchaseModal() {
    return document.getElementById('initial-purchase-modal');
  }

  function renderInitialPurchaseContent() {
    const container = document.getElementById('initial-purchase-content');
    if (!container || container.nodeType !== 1) return;
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
    const email = candidates.find(val => typeof val === 'string' && val.trim()) || '';
    const emailDisplay = email ? `<strong>${window.escapeHtml ? window.escapeHtml(email.trim()) : email.trim()}</strong>` : '<strong>your email address</strong>';
    const contentHTML = `
      <div style="display:flex;flex-direction:column;gap:1.25rem;color:#2f3c55;">
        <div>
          <h2 style="margin:0 0 0.5rem;color:#1f3c88;">Next steps after purchasing</h2>
          <p style="margin:0;line-height:1.7;">If you&apos;ve already purchased your Initial 1-1 but haven&apos;t booked it yet, follow the steps below to schedule it.</p>
        </div>
        <ol style="margin:0;padding-left:1.4rem;line-height:1.9;">
          <li>
            Download the Bombers app:
            <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-top:0.4rem;">
              <a class="btn" target="_blank" rel="noopener" href="https://apps.apple.com/gb/app/bombers-physical-training/id1589832573">iOS</a>
              <a class="btn" target="_blank" rel="noopener" href="https://play.google.com/store/apps/details?id=com.pushpress.bombersphysicaltraining&pcampaignid=web_share">Android</a>
            </div>
          </li>
          <li>
            Log in using ${emailDisplay}.<br>
            <span style="color:#51607d;font-size:0.95em;">If you didn&apos;t create a password when purchasing, tap &ldquo;Forgot password&rdquo; to set one.</span>
          </li>
          <li>
            Inside the Bombers app, go to <strong>Schedule</strong> &rarr; <strong>Appointments</strong>.<br>
            You&apos;ll see a credit for <strong>Initial On-boarding 1-1</strong>. Tap it and choose a slot that suits you.
          </li>
        </ol>
        <div style="padding:1rem;border:1px solid #d6e0f2;border-radius:10px;background:#f8fbff;">
          <p style="margin:0 0 0.75rem;line-height:1.6;">
            If you&apos;ve already booked, please refresh the page and the page should update with your next steps.
          </p>
          <p style="margin:0;line-height:1.6;">
            If you have booked and your page is not updating please <button type="button" class="btn btn--muted" style="margin-left:0.35rem;" onclick="(function(){ if (window.manualOverride) { window.manualOverride('mark_booked_1to1'); } if (window.closeInitialPurchaseModal) { window.closeInitialPurchaseModal(); } })();">click here</button>.
          </p>
        </div>
      </div>
    `;
    safeSetHTML(container, contentHTML);
  }

  function showInitialPurchaseModal() {
    const modal = ensureInitialPurchaseModal();
    if (!modal) return;
    renderInitialPurchaseContent();
    modal.style.display = 'flex';
    modal.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeInitialPurchaseModal() {
    const modal = ensureInitialPurchaseModal();
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  const inductionSlides = [
    {
      id: 'welcome',
      type: 'intro',
      title: 'Welcome to Bombers!',
      body: `
        <p>This short online induction covers everything you need to know before training independently in our gym. Please complete it before you’re fully signed off as a member. There are a few quiz questions along the way to check your understanding.</p>
        <p>See you on the other side!<br><strong>– Tom &amp; The Bombers Team</strong></p>
      `
    },
    {
      id: 'door_access',
      type: 'ack',
      title: 'Door Access',
      points: [
        'Each member has a personal access code. All entries are logged.',
        'Do not share your code with anyone or admit others during your access window.',
        'If the door malfunctions, don’t force it — message the team instead.'
      ]
    },
    {
      id: 'medical_emergencies',
      type: 'ack',
      title: 'Medical Emergencies',
      body: `
        <p><strong>During staffed hours:</strong> Tell a staff member immediately – they’ll take control.</p>
        <p><strong>During unstaffed hours:</strong> Use your phone or the emergency phone to call <strong>999</strong>, then contact the duty manager on speed dial 2.</p>
        <p>Examples: cardiac events, major bleeding, loss of consciousness, serious head/neck injury.</p>
      `
    },
    {
      id: 'non_emergencies',
      type: 'ack',
      title: 'Non-Emergencies',
      body: `
        <p><strong>During staffed hours:</strong> Notify a staff member straight away.</p>
        <p><strong>During unstaffed hours:</strong> Use speed dial 2 to contact the duty manager and explain the issue.</p>
        <p>Examples: sprains, strains, minor cuts or scrapes.</p>
      `
    },
    {
      id: 'hygiene',
      type: 'ack',
      title: 'Gym Hygiene &amp; Cleanliness',
      points: [
        'Pick up a clean cloth when you start and wipe down everything you use.',
        'Place used cloths in the grey box and tell staff if stock runs low.',
        'Class coaches will lead a group clean at the end of each session.'
      ]
    },
    {
      id: 'tidiness',
      type: 'ack',
      title: 'Tidiness &amp; Storage',
      points: [
        'Keep the training area clear – store bags and clothes in the changing rooms.',
        'Return all equipment to its home and ask if you are unsure where it lives.',
        'Switch off fans and close windows when you are the last to leave.'
      ]
    },
    {
      id: 'respect',
      type: 'ack',
      title: 'Mutual Respect',
      points: [
        'Treat staff and members with courtesy and respect at all times.',
        'Rude or disrespectful behaviour won’t be tolerated – report it to us.',
        'Greet people, smile, and help create a positive atmosphere.'
      ]
    },
    {
      id: 'music',
      type: 'ack',
      title: 'Music Etiquette',
      points: [
        'Keep music at a reasonable background level when training alone.',
        'Always check with others before increasing the volume.',
        'No explicit or offensive lyrics if anyone else is present.'
      ]
    },
    {
      id: 'signature',
      type: 'signature',
      title: 'Sign to confirm',
      body: `
        <p>Please sign to confirm you have completed the online induction and understand the responsibilities that come with accessing the gym independently.</p>
      `
    },
    // Quizzes removed per latest content request
  ];

  window.INITIAL_INDUCTION_SLIDES = inductionSlides;

  let initialInductionState = null;
  let inductionSignaturePad = null;
  let inductionEmbedConfig = null;

function getExistingInductionSignatureValue() {
  const signatureFieldId = window.FIELDS?.INDUCTION_SIGNATURE;
  if (!signatureFieldId) return '';
  if (!window._latestContactFields || typeof window._latestContactFields !== 'object') {
    return '';
  }
  return window._latestContactFields[signatureFieldId] || '';
}

function normaliseInductionSignatureData(rawData, canvas) {
  const data = typeof rawData === 'string' ? rawData : '';
  if (!data) return '';
  if (!canvas || !canvas.dataset) return data;
  const blankSample = canvas.dataset.emptySignature || '';
  if (!blankSample) return data;
  return data === blankSample ? '' : data;
}

function hasStoredInductionSignature() {
  if (initialInductionState && initialInductionState.signatureData) {
    return true;
  }
  const canvas = document.getElementById('induction-signature-canvas');
  if (canvas && canvas.dataset && canvas.dataset.imageData) {
    return !!canvas.dataset.imageData;
  }
  return !!getExistingInductionSignatureValue();
}

function setInductionSignatureData(dataUrl) {
  const canvas = document.getElementById('induction-signature-canvas');
  const placeholder = document.getElementById('induction-signature-placeholder');
  const data = normaliseInductionSignatureData(dataUrl, canvas);
  if (canvas) {
    canvas.dataset.imageData = data;
    canvas.dataset.completed = data ? '1' : '0';
  }
  if (placeholder) {
    placeholder.style.display = data ? 'none' : '';
  }
  if (initialInductionState) {
    initialInductionState.signatureData = data;
  }
}

function resetInitialInductionSignature() {
  const pad = inductionSignaturePad;
  if (pad) {
    if (typeof pad.removeEventListener === 'function') {
      if (pad._beginHandler) {
        pad.removeEventListener('beginStroke', pad._beginHandler);
      }
      if (pad._endHandler) {
        pad.removeEventListener('endStroke', pad._endHandler);
      }
    } else if ('onBegin' in pad) {
      pad.onBegin = null;
      pad.onEnd = null;
    }
    if (typeof pad.off === 'function') {
      pad.off();
    }
    if (pad._beginHandler) {
      delete pad._beginHandler;
    }
    if (pad._endHandler) {
      delete pad._endHandler;
    }
  }
  inductionSignaturePad = null;
  const canvas = document.getElementById('induction-signature-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    delete canvas.dataset.imageData;
    delete canvas.dataset.completed;
  }
  const placeholder = document.getElementById('induction-signature-placeholder');
  if (placeholder) {
    placeholder.style.display = hasStoredInductionSignature() ? 'none' : '';
  }
  const clearBtn = document.getElementById('induction-signature-clear');
  if (clearBtn) {
    clearBtn.onclick = null;
  }
}

function initialiseInductionSignaturePad() {
  const canvas = document.getElementById('induction-signature-canvas');
  const placeholder = document.getElementById('induction-signature-placeholder');
  const clearBtn = document.getElementById('induction-signature-clear');
  if (!canvas || typeof SignaturePad === 'undefined') return;

  resizeInductionCanvas(canvas);

  inductionSignaturePad = new SignaturePad(canvas, {
    backgroundColor: 'rgb(255, 255, 255)',
    penColor: 'rgb(0, 0, 0)'
  });

  const pad = inductionSignaturePad;
  pad.clear();
  try {
    const blankSnapshot = canvas.toDataURL('image/png');
    if (canvas.dataset) {
      canvas.dataset.emptySignature = blankSnapshot;
    }
  } catch (err) {
    console.warn('[InitialInduction] Unable to capture blank signature snapshot', err);
  }

  const existingData =
    (initialInductionState && initialInductionState.signatureData) ||
    getExistingInductionSignatureValue();

  const applyExistingSignature = (data) => {
    if (!data) {
      pad.clear();
      setInductionSignatureData('');
      return;
    }
    const img = new Image();
    img.onload = () => {
      pad.clear();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      setInductionSignatureData(data);
    };
    img.onerror = () => {
      setInductionSignatureData('');
    };
    img.src = data;
  };

  if (existingData) {
    applyExistingSignature(existingData);
  } else {
    pad.clear();
    setInductionSignatureData('');
  }

  const beginHandler = () => {
    if (placeholder) placeholder.style.display = 'none';
  };

  const endHandler = () => {
    if (!pad) {
      setInductionSignatureData('');
      return;
    }
    if (typeof pad.isEmpty === 'function' && pad.isEmpty()) {
      setInductionSignatureData('');
      return;
    }
    let dataUrl = '';
    try {
      dataUrl = pad.toDataURL('image/png');
    } catch (err) {
      console.error('[InitialInduction] Failed to capture signature image', err);
      dataUrl = '';
    }
    if (!dataUrl) {
      setInductionSignatureData('');
      return;
    }
    setInductionSignatureData(dataUrl);
  };

  if (typeof pad.addEventListener === 'function') {
    pad._beginHandler = beginHandler;
    pad._endHandler = endHandler;
    pad.addEventListener('beginStroke', beginHandler);
    pad.addEventListener('endStroke', endHandler);
  } else {
    pad.onBegin = beginHandler;
    pad.onEnd = endHandler;
  }

  if (clearBtn) {
    clearBtn.onclick = (event) => {
      event.preventDefault();
      if (pad) {
        pad.clear();
      }
      setInductionSignatureData('');
    };
  } else {
    const existingSignature = getExistingInductionSignatureValue();
    if (existingSignature) {
      setInductionSignatureData(existingSignature);
    }
  }
}

function resizeInductionCanvas(canvas) {
  if (!canvas) return;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const displayWidth = canvas.offsetWidth || canvas.width || 500;
  const displayHeight = canvas.offsetHeight || canvas.height || 220;
  canvas.width = displayWidth * ratio;
  canvas.height = displayHeight * ratio;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.scale(ratio, ratio);
}

window.addEventListener('resize', () => {
  const canvas = document.getElementById('induction-signature-canvas');
  if (!canvas || !inductionSignaturePad) return;
  const data = inductionSignaturePad.toData();
  resizeInductionCanvas(canvas);
  inductionSignaturePad.clear();
  if (data && data.length) {
    try {
      inductionSignaturePad.fromData(data);
    } catch (_) {}
  }
});

  function ensureInitialInductionModal() {
    let modal = document.getElementById('initial-induction-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'initial-induction-modal';
      modal.className = 'fullscreen-modal fullscreen-modal--induction';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="fullscreen-modal__return" role="button" tabindex="0" data-close-target="induction">
          <div class="fullscreen-modal__return-inner">
            <span class="fullscreen-modal__return-icon" aria-hidden="true">⏎</span>
            <span>Go back to onboarding hub</span>
          </div>
        </div>
        <div class="fullscreen-modal__content induction-fullscreen">
          <div class="consultation-modal consultation-modal--induction" role="dialog" aria-modal="true" aria-labelledby="initial-induction-title">
            <button type="button" class="consultation-close" aria-label="Close">&times;</button>
            <div class="consultation-header">
              <button type="button" class="consultation-back" style="display:none;">&#8592; <span aria-hidden="true">Back</span></button>
              <div class="consultation-progress">Step 1</div>
            </div>
            <div id="initial-induction-body" class="consultation-body"></div>
            <div class="consultation-actions">
              <button type="button" class="btn btn--primary consultation-cta">Next</button>
              <div class="consultation-spinner">Saving...</div>
              <div class="consultation-error" role="alert"></div>
            </div>
          </div>
        </div>`;
      document.body.appendChild(modal);

      modal.querySelector('.consultation-close').addEventListener('click', () => closeInitialInductionModal());
      modal.querySelector('.consultation-back').addEventListener('click', () => {
        if (!initialInductionState) return;
        if (initialInductionState.step > 0) {
          initialInductionState.step -= 1;
          renderInitialInductionStep();
        }
      });
      modal.querySelector('.consultation-cta').addEventListener('click', handleInitialInductionNext);
    }
    return modal;
  }

  function renderInitialInductionStep() {
    const modal = ensureInitialInductionModal();
    const progressEl = modal.querySelector('.consultation-progress');
    const backBtn = modal.querySelector('.consultation-back');
    const nextBtn = modal.querySelector('.consultation-cta');
    const spinner = modal.querySelector('.consultation-spinner');
    const errorEl = modal.querySelector('.consultation-error');
    const bodyEl = modal.querySelector('#initial-induction-body');

    spinner.style.display = 'none';
    errorEl.style.display = 'none';

    resetInitialInductionSignature();

    const total = inductionSlides.length;
    progressEl.textContent = `Step ${initialInductionState.step + 1} of ${total}`;
    backBtn.style.display = initialInductionState.step === 0 ? 'none' : 'inline-flex';
    nextBtn.textContent = initialInductionState.step === total - 1 ? 'Finish' : 'Next';
    nextBtn.disabled = false;

    const slide = inductionSlides[initialInductionState.step];
    let html = '';
    if (slide.type === 'intro') {
      html = `
        <h2 id="initial-induction-title" style="margin-top:0;color:#1f3c88;">${slide.title}</h2>
        ${slide.body}
      `;
    } else if (slide.type === 'ack') {
      const content = slide.points ? `<ul style="padding-left:1.4em;line-height:1.8;color:#2f3c55;">${slide.points.map(p => `<li>${window.escapeHtml ? window.escapeHtml(p) : p}</li>`).join('')}</ul>` : `<div style="color:#2f3c55;line-height:1.7;">${slide.body}</div>`;
      const checked = initialInductionState.confirmations && initialInductionState.confirmations[slide.id];
      html = `
        <h2 style="margin-top:0;color:#1f3c88;">${slide.title}</h2>
        ${content}
        <label style="display:flex;align-items:center;gap:0.75rem;margin-top:0.9rem;margin-bottom:0.4rem;font-weight:500;font-size:1.02rem;">
          <input type="checkbox" id="initial-induction-ack" ${checked ? 'checked' : ''} style="width:22px;height:22px;"> <span>I understand</span>
        </label>
      `;
    } else if (slide.type === 'signature') {
      const hasSignature = hasStoredInductionSignature();
      html = `
        <h2 style="margin-top:0;color:#1f3c88;">${slide.title}</h2>
        <div style="color:#2f3c55;line-height:1.7;margin-bottom:1.1rem;">${slide.body || ''}</div>
        <div style="margin-top:0.5rem;padding:1.1rem;border:1px solid #d6e0f2;border-radius:12px;background:#f7f9ff;">
          <h3 style="margin:0 0 0.6rem;color:#1f3c88;">Sign to confirm</h3>
          <p style="margin:0 0 0.8rem;color:#51607d;font-size:0.95rem;">Add your signature to confirm you have completed the online induction.</p>
          <div style="position:relative;border:1px solid #cbd5e1;border-radius:10px;background:#fff;overflow:hidden;">
            <canvas id="induction-signature-canvas" width="500" height="220" style="width:100%;height:220px;display:block;touch-action:none;"></canvas>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#9aa6bf;font-size:0.95rem;pointer-events:none;${hasSignature ? 'display:none;' : ''}" id="induction-signature-placeholder">Sign here</div>
          </div>
          <div style="display:flex;gap:0.75rem;margin-top:0.75rem;">
            <button type="button" class="btn" id="induction-signature-clear">Clear</button>
            ${hasSignature ? '<span style="color:#1f3c88;font-weight:600;align-self:center;">Existing signature on file</span>' : ''}
          </div>
        </div>
      `;
    } else if (slide.type === 'quiz') {
      const stored = initialInductionState.answers[slide.id] || {};
      const questionsHtml = slide.questions.map((q, index) => {
        if (q.mode === 'single') {
          const selected = stored[q.id];
          const options = q.options.map(opt => `
            <label style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem;font-size:1.02rem;">
              <input type="radio" name="${slide.id}-${q.id}" value="${opt.value}" ${selected === opt.value ? 'checked' : ''} style="width:22px;height:22px;">
              <span>${opt.label}</span>
            </label>
          `).join('');
          return `
            <div style="margin-bottom:1.4rem;">
              <div style="font-weight:600;color:#1f3c88;margin-bottom:0.6rem;">${index + 1}. ${q.prompt}</div>
              <div style="display:flex;flex-direction:column;align-items:flex-start;">${options}</div>
            </div>
          `;
        }
        // multi-select
        const selected = Array.isArray(stored[q.id]) ? stored[q.id] : [];
        const options = q.options.map(opt => `
          <label style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.6rem;font-size:1.02rem;">
            <input type="checkbox" name="${slide.id}-${q.id}" value="${opt.value}" ${selected.includes(opt.value) ? 'checked' : ''} style="width:22px;height:22px;">
            <span>${opt.label}</span>
          </label>
        `).join('');
        return `
          <div style="margin-bottom:1.4rem;">
            <div style="font-weight:600;color:#1f3c88;margin-bottom:0.6rem;">${index + 1}. ${q.prompt}</div>
            <div style="display:flex;flex-direction:column;align-items:flex-start;">${options}</div>
          </div>
        `;
      }).join('');

      html = `
        <h2 style="margin-top:0;color:#1f3c88;">${slide.title}</h2>
        <div>${questionsHtml}</div>
      `;
      if (typeof window.FIELDS?.INDUCTION_SIGNATURE === 'string') {
        const hasSignature = hasStoredInductionSignature();
        html += `
          <div style="margin-top:1.5rem;padding:1.1rem;border:1px solid #d6e0f2;border-radius:12px;background:#f7f9ff;">
            <h3 style="margin:0 0 0.6rem;color:#1f3c88;">Sign to confirm</h3>
            <p style="margin:0 0 0.8rem;color:#51607d;font-size:0.95rem;">Add your signature to confirm you have completed the online induction.</p>
            <div style="position:relative;border:1px solid #cbd5e1;border-radius:10px;background:#fff;overflow:hidden;">
              <canvas id="induction-signature-canvas" width="500" height="220" style="width:100%;height:220px;display:block;touch-action:none;"></canvas>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#9aa6bf;font-size:0.95rem;pointer-events:none;${hasSignature ? 'display:none;' : ''}" id="induction-signature-placeholder">Sign here</div>
            </div>
            <div style="display:flex;gap:0.75rem;margin-top:0.75rem;">
              <button type="button" class="btn" id="induction-signature-clear">Clear</button>
              ${hasSignature ? '<span style="color:#1f3c88;font-weight:600;align-self:center;">Existing signature on file</span>' : ''}
            </div>
          </div>
        `;
      }
    }

    bodyEl.innerHTML = html;
    if (typeof bodyEl.scrollTo === 'function') {
      bodyEl.scrollTo({ top: 0 });
    } else {
      bodyEl.scrollTop = 0;
    }
    if ((slide.type === 'quiz' || slide.type === 'signature') && typeof window.FIELDS?.INDUCTION_SIGNATURE === 'string') {
      initialiseInductionSignaturePad();
    }
  }

  function handleInitialInductionNext() {
    const modal = ensureInitialInductionModal();
    const slide = inductionSlides[initialInductionState.step];
    const bodyEl = modal.querySelector('#initial-induction-body');
    const errorEl = modal.querySelector('.consultation-error');
    errorEl.style.display = 'none';
    errorEl.textContent = '';

    if (slide.type === 'signature') {
      const canvas = bodyEl.querySelector('#induction-signature-canvas');
      if (inductionSignaturePad && typeof inductionSignaturePad.isEmpty === 'function' && !inductionSignaturePad.isEmpty()) {
        try {
          const captured = inductionSignaturePad.toDataURL('image/png');
          if (captured) {
            setInductionSignatureData(captured);
          }
        } catch (err) {
          console.warn('[InitialInduction] Unable to capture signature on submit', err);
        }
      } else if (canvas && canvas.dataset && canvas.dataset.imageData) {
        setInductionSignatureData(canvas.dataset.imageData);
      }
    }

    const validation = validateInitialInductionSlide(slide, bodyEl);
    if (!validation.valid) {
      errorEl.textContent = validation.message;
      errorEl.style.display = 'block';
      return;
    }

    if (validation.confirmed) {
      initialInductionState.confirmations = initialInductionState.confirmations || {};
      initialInductionState.confirmations[slide.id] = true;
    }
    if (validation.answers) {
      initialInductionState.answers[slide.id] = validation.answers;
    }

    if (initialInductionState.step === inductionSlides.length - 1) {
      submitInitialInduction();
      return;
    }

    initialInductionState.step += 1;
    renderInitialInductionStep();
  }

  function validateInitialInductionSlide(slide, bodyEl) {
    if (slide.type === 'intro') {
      return { valid: true };
    }

    if (slide.type === 'ack') {
      const checkbox = bodyEl.querySelector('#initial-induction-ack');
      if (!checkbox || !checkbox.checked) {
        return { valid: false, message: 'Please confirm you understand before continuing.' };
      }
      return { valid: true, confirmed: true };
    }

    if (slide.type === 'quiz') {
      const answers = {};
      for (const question of slide.questions) {
        if (question.mode === 'single') {
          const selected = bodyEl.querySelector(`input[name="${slide.id}-${question.id}"]:checked`);
          if (!selected) {
            return { valid: false, message: 'Please answer every question before continuing.' };
          }
          const value = selected.value;
          if (question.correct && value !== question.correct) {
            return { valid: false, message: 'One or more answers are incorrect. Please review and try again.' };
          }
          answers[question.id] = value;
        } else {
          const checkboxes = Array.from(bodyEl.querySelectorAll(`input[name="${slide.id}-${question.id}"]`));
          const chosen = checkboxes.filter(cb => cb.checked).map(cb => cb.value);
          if (!chosen.length) {
            return { valid: false, message: 'Please answer every question before continuing.' };
          }
          const correctValues = question.options.filter(opt => opt.correct).map(opt => opt.value);
          const chosenSet = new Set(chosen);
          const correctSet = new Set(correctValues);
          if (chosenSet.size !== correctSet.size || [...chosenSet].some(v => !correctSet.has(v))) {
            return { valid: false, message: 'One or more answers are incorrect. Please review and try again.' };
          }
          answers[question.id] = chosen;
        }
      }
      return { valid: true, answers };
    }

    if (slide.type === 'signature') {
      if (!hasStoredInductionSignature()) {
        return { valid: false, message: 'Please sign to confirm your induction before continuing.' };
      }
      return { valid: true };
    }

    return { valid: true };
  }

  async function submitInitialInduction() {
    const modal = ensureInitialInductionModal();
    const spinner = modal.querySelector('.consultation-spinner');
    const errorEl = modal.querySelector('.consultation-error');
    const nextBtn = modal.querySelector('.consultation-cta');
    const backBtn = modal.querySelector('.consultation-back');

    spinner.style.display = 'block';
    errorEl.style.display = 'none';
    nextBtn.disabled = true;
    backBtn.disabled = true;

    try {
      if (!window.contactId) {
        throw new Error('Contact not loaded. Please refresh and try again.');
      }
      const signatureField = window.FIELDS?.INDUCTION_SIGNATURE || '';
      if (!signatureField) {
        throw new Error('Induction signature field is not configured.');
      }

      const canvas = modal.querySelector('#induction-signature-canvas');
      let signatureData = (initialInductionState && initialInductionState.signatureData) || '';
      if (!signatureData && canvas && canvas.dataset) {
        signatureData = normaliseInductionSignatureData(canvas.dataset.imageData || '', canvas);
      }
      if (!signatureData && inductionSignaturePad) {
        try {
          signatureData = normaliseInductionSignatureData(inductionSignaturePad.toDataURL('image/png'), canvas);
        } catch (err) {
          console.warn('[InitialInduction] Unable to read signature from pad during submit', err);
          signatureData = '';
        }
      }
      if (!signatureData) {
        signatureData = normaliseInductionSignatureData(getExistingInductionSignatureValue(), canvas);
      }
      if (!signatureData) {
        throw new Error('Please sign to confirm your induction is complete.');
      }

      const payload = {};
      payload[signatureField] = signatureData;

      await window.updateFieldsBatch(window.contactId, payload);
      if (typeof window.forceChecklistFlag === 'function' && window.OPPORTUNITY_LABELS?.ONLINE_INDUCTION) {
        window.forceChecklistFlag(window.OPPORTUNITY_LABELS.ONLINE_INDUCTION, true);
      }
      if (window._latestContactFields && signatureField) {
        window._latestContactFields[signatureField] = signatureData;
      }
      window.burst && window.burst();
      closeInitialInductionModal(true);
      if (typeof window.renderChecklist === 'function') {
        window.renderChecklist();
      }
    } catch (err) {
      console.error('[InitialInduction] submit error', err);
      errorEl.textContent = err.message || 'Unable to save induction completion right now.';
      errorEl.style.display = 'block';
      nextBtn.disabled = false;
      backBtn.disabled = false;
      spinner.style.display = 'none';
      return;
    }

    spinner.style.display = 'none';
    nextBtn.disabled = false;
    backBtn.disabled = false;
  }

  function showInitialInductionModal(options) {
    const modal = ensureInitialInductionModal();
    initialInductionState = {
      step: 0,
      confirmations: {},
      answers: {},
      signatureData: getExistingInductionSignatureValue() || ''
    };
    inductionEmbedConfig = null;
    if (options && options.embedTarget) {
      inductionEmbedConfig = {
        host: options.embedTarget,
        onComplete: typeof options.onComplete === 'function' ? options.onComplete : null
      };
    }
    resetInitialInductionSignature();
    renderInitialInductionStep();
    modal.style.display = 'flex';
    modal.scrollTop = 0;
    if (inductionEmbedConfig && inductionEmbedConfig.host) {
      const host = inductionEmbedConfig.host;
      host.innerHTML = '';
      host.appendChild(modal);
      modal.classList.add('induction-embedded');
    } else {
      document.body.style.overflow = 'hidden';
    }
  }

  function closeInitialInductionModal(success) {
    const modal = document.getElementById('initial-induction-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.scrollTop = 0;
    if (inductionEmbedConfig && inductionEmbedConfig.host) {
      const host = inductionEmbedConfig.host;
      if (host && modal.parentElement === host) {
        host.removeChild(modal);
      }
      document.body.appendChild(modal);
      modal.classList.remove('induction-embedded');
    } else {
      document.body.style.overflow = '';
    }
    resetInitialInductionSignature();
    initialInductionState = null;
    const errorEl = modal.querySelector('.consultation-error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
    if (!success) {
      const spinner = modal.querySelector('.consultation-spinner');
      if (spinner) spinner.style.display = 'none';
      const nextBtn = modal.querySelector('.consultation-cta');
      const backBtn = modal.querySelector('.consultation-back');
      if (nextBtn) nextBtn.disabled = false;
      if (backBtn) backBtn.disabled = false;
    }
    if (typeof window.handleDropinSubflowComplete === 'function') {
      window.handleDropinSubflowComplete();
    }
    if (inductionEmbedConfig && typeof inductionEmbedConfig.onComplete === 'function') {
      inductionEmbedConfig.onComplete(!!success);
    }
    inductionEmbedConfig = null;
  }

  window.showInitialInductionModal = showInitialInductionModal;
  window.closeInitialInductionModal = closeInitialInductionModal;

  function showInductionReminderModal() {
    const openModal = () => {
      const modal = document.getElementById('induction-reminder-modal');
      if (!modal) return;
      modal.style.display = 'flex';
      modal.scrollTop = 0;
      document.body.style.overflow = 'hidden';
      window._inductionReminderVisible = true;
    };
    const runner = window.runAfterAppLoading;
    if (typeof runner === 'function') {
      runner(openModal);
    } else {
      openModal();
    }
  }

  function closeInductionReminderModal(options) {
    const modal = document.getElementById('induction-reminder-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.scrollTop = 0;
    document.body.style.overflow = '';
    window._inductionReminderVisible = false;
    const silent = options && options.silent;
    if (!silent) {
      window._inductionReminderDismissed = true;
    }
  }

  function handleInductionReminderConfirm() {
    closeInductionReminderModal({ silent: true });
    if (typeof window.showInitialInductionModal === 'function') {
      window.showInitialInductionModal();
    }
  }

  window.showInductionReminderModal = showInductionReminderModal;
  window.closeInductionReminderModal = closeInductionReminderModal;
  window.handleInductionReminderConfirm = handleInductionReminderConfirm;

  function ensureInitialDebriefModal() {
    let modal = document.getElementById('initial-debrief-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'initial-debrief-modal';
      modal.className = 'info-modal';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="info-modal-content">
          <button type="button" class="close-button" aria-label="Close" onclick="window.closeInitialDebriefModal && window.closeInitialDebriefModal()">&times;</button>
          <div id="initial-debrief-content"></div>
        </div>`;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function renderInitialDebriefContent() {
    const container = document.getElementById('initial-debrief-content');
    if (!container || container.nodeType !== 1) return;
    container.innerHTML = `
      <div style="max-width:640px;margin:0 auto;">
        <h2 style="margin-top:0;color:#1f3c88;">Session Debrief Checklist</h2>
        <p style="color:#2f3c55;line-height:1.7;margin-bottom:1.2em;">During your debrief we’ll confirm these points together. Your coach will tick this off once all three statements are true:</p>
        <ul style="padding-left:1.5em;line-height:1.8;color:#2f3c55;margin:0;">
          <li>"I can manage the screening weights on all primary strength exercises."</li>
          <li>"I am confident using cardio equipment and functional movements."</li>
          <li>"My coach and I agree I can safely join classes or open gym without further support."</li>
        </ul>
        <p style="color:#2f3c55;line-height:1.7;margin-top:1.4em;">If you have any questions ahead of your debrief, drop us a message via the chat widget.</p>
      </div>
    `;
  }

  function showInitialDebriefModal() {
    const modal = ensureInitialDebriefModal();
    renderInitialDebriefContent();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeInitialDebriefModal() {
    const modal = document.getElementById('initial-debrief-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.showInitialDebriefModal = showInitialDebriefModal;
  window.closeInitialDebriefModal = closeInitialDebriefModal;

  const dropinTcsState = {
    pad: null,
    canvas: null,
    errorEl: null,
    saving: false,
    resizeHandler: null,
    embedHost: null,
    onClose: null
  };

  function ensureDropinTcsModal() {
    let overlay = document.getElementById('dropin-tcs-overlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'dropin-tcs-overlay';
    overlay.className = 'dropin-tcs-overlay';
    overlay.innerHTML = `
      <div class="dropin-tcs-modal">
        <button type="button" class="dropin-tcs-close" data-dropin-tcs-close aria-label="Close">&times;</button>
        <div class="dropin-tcs-content">
          <p class="dropin-tcs-eyebrow">Drop-in access</p>
          <h2>Drop-in terms &amp; conditions</h2>
          <p class="dropin-tcs-lead">Before purchasing a pass, please confirm you understand how our short-term access works.</p>
          <ul class="dropin-tcs-list">
            <li><strong>Pass validity.</strong> Pass expiry is listed when purchasing; your access code deactivates automatically once it expires.</li>
            <li><strong>Non-transferable.</strong> Passes are just for you. Sharing your access code will result in immediate cancellation.</li>
            <li><strong>No refunds.</strong> Drop-in purchases are final. We can’t pause or refund unused time once activated.</li>
            <li><strong>Pre-requisites.</strong> You must complete the online induction, PAR-Q, and informed consent before training solo.</li>
            <li><strong>Access compliance.</strong> Our coached group sessions take priority in the downstairs gym space—check the class schedule before using it. The upstairs gym is always available to open-gym users.</li>
          </ul>
          <p class="dropin-tcs-note">Need clarification? Message the team before buying so we can point you at the best option.</p>
          <div class="dropin-tcs-signature">
            <div class="dropin-tcs-signature__header">
              <p>Sign below to confirm you agree to these drop-in terms:</p>
              <button type="button" class="btn btn--muted btn--compact" data-dropin-tcs-clear>Clear</button>
            </div>
            <div class="dropin-tcs-signature__canvas">
              <canvas id="dropin-tcs-signature-canvas"></canvas>
            </div>
            <p class="dropin-tcs-error" id="dropin-tcs-error" role="alert" aria-live="polite"></p>
          </div>
        </div>
        <div class="dropin-tcs-actions">
          <button type="button" class="btn btn--muted" data-dropin-tcs-close>Cancel</button>
          <button type="button" class="btn btn--primary" data-dropin-tcs-accept>I agree</button>
        </div>
      </div>
    `;
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeDropinTcsModal();
      }
    });
    overlay.querySelectorAll('[data-dropin-tcs-close]').forEach(btn => {
      btn.addEventListener('click', () => closeDropinTcsModal());
    });
    const acceptBtn = overlay.querySelector('[data-dropin-tcs-accept]');
    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => confirmDropinTcsModal());
    }
    const clearBtn = overlay.querySelector('[data-dropin-tcs-clear]');
    if (clearBtn) {
      clearBtn.addEventListener('click', (event) => {
        event.preventDefault();
        clearDropinTcsSignature();
      });
    }
    document.body.appendChild(overlay);
    dropinTcsState.errorEl = overlay.querySelector('#dropin-tcs-error');
    return overlay;
  }

  function showDropinTcsModal(options) {
    const overlay = ensureDropinTcsModal();
    overlay.style.display = 'flex';
    dropinTcsState.embedHost = options && options.embedTarget ? options.embedTarget : null;
    dropinTcsState.onClose = options && typeof options.onClose === 'function' ? options.onClose : null;
    if (dropinTcsState.embedHost) {
      const host = dropinTcsState.embedHost;
      host.innerHTML = '';
      host.appendChild(overlay);
    } else {
      document.body.dataset.dropinTcsOpen = '1';
      document.body.style.overflow = 'hidden';
    }
    initDropinTcsSignaturePad();
    clearDropinTcsSignature();
  }

  function closeDropinTcsModal(options = {}) {
    const overlay = document.getElementById('dropin-tcs-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      if (dropinTcsState.embedHost) {
        document.body.appendChild(overlay);
      }
    }
    if (!dropinTcsState.embedHost && document.body.dataset.dropinTcsOpen) {
      delete document.body.dataset.dropinTcsOpen;
      document.body.style.overflow = '';
    }
    dropinTcsState.saving = false;
    toggleDropinTcsActions(false);
    const onClose = dropinTcsState.onClose;
    dropinTcsState.embedHost = null;
    dropinTcsState.onClose = null;
    if (!options.silent && typeof window.handleDropinSubflowComplete === 'function') {
      window.handleDropinSubflowComplete();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  }

  async function confirmDropinTcsModal() {
    if (!dropinTcsState.pad || dropinTcsState.pad.isEmpty()) {
      setDropinTcsError('Please add a signature before continuing.');
      return;
    }
    if (dropinTcsState.saving) return;
    clearDropinTcsError();
    dropinTcsState.saving = true;
    toggleDropinTcsActions(true);
    try {
      const payload = [];
      const signatureField = window.FIELDS?.DROPIN_TCS_SIGNATURE;
      const signatureData = dropinTcsState.pad.toDataURL();
      if (signatureField && signatureData) {
        payload.push({ id: signatureField, value: signatureData });
      }
      if (payload.length && typeof window.updateFieldsBatch === 'function' && window.contactId) {
        await window.updateFieldsBatch(window.contactId, payload);
        const fields = window._latestContactFields || {};
        fields[signatureField] = signatureData;
        window._latestContactFields = fields;
      }
      const label = window.DROPIN_TCS_LABEL || (window.OPPORTUNITY_LABELS && window.OPPORTUNITY_LABELS.TRIAL_TCS) || 'Drop-in T&Cs';
      if (typeof window.forceChecklistFlag === 'function') {
        window.forceChecklistFlag(label, true);
      }
      dropinTcsState.saving = false;
      toggleDropinTcsActions(false);
      closeDropinTcsModal();
    } catch (err) {
      console.error('[DropIn] Failed to save signature', err);
      setDropinTcsError('Unable to save your signature. Please try again.');
      dropinTcsState.saving = false;
      toggleDropinTcsActions(false);
    }
  }

  function initDropinTcsSignaturePad() {
    const canvas = document.getElementById('dropin-tcs-signature-canvas');
    if (!canvas || typeof SignaturePad === 'undefined') return;
    dropinTcsState.canvas = canvas;
    if (dropinTcsState.pad) {
      resizeDropinTcsCanvas();
      return;
    }
    resizeDropinTcsCanvas();
    dropinTcsState.pad = new SignaturePad(canvas, {
      backgroundColor: '#ffffff',
      penColor: '#0b1736'
    });
    if (!dropinTcsState.resizeHandler) {
      dropinTcsState.resizeHandler = () => resizeDropinTcsCanvas();
      window.addEventListener('resize', dropinTcsState.resizeHandler);
    }
  }

  function resizeDropinTcsCanvas() {
    const canvas = dropinTcsState.canvas;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const parent = canvas.parentElement;
    const width = parent ? parent.clientWidth : canvas.offsetWidth || 500;
    const height = 160;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    if (dropinTcsState.pad) {
      dropinTcsState.pad.clear();
    }
  }

  function clearDropinTcsSignature() {
    if (dropinTcsState.pad) {
      dropinTcsState.pad.clear();
    }
    clearDropinTcsError();
  }

  function setDropinTcsError(message) {
    if (!dropinTcsState.errorEl) return;
    dropinTcsState.errorEl.textContent = message || '';
    dropinTcsState.errorEl.style.display = message ? 'block' : 'none';
  }

  function clearDropinTcsError() {
    setDropinTcsError('');
  }

  function toggleDropinTcsActions(disabled) {
    const overlay = document.getElementById('dropin-tcs-overlay');
    if (!overlay) return;
    const acceptBtn = overlay.querySelector('[data-dropin-tcs-accept]');
    if (acceptBtn) {
      acceptBtn.disabled = !!disabled;
      acceptBtn.textContent = disabled ? 'Saving…' : 'I agree';
    }
  }

  window.showDropinTcsModal = showDropinTcsModal;
  window.closeDropinTcsModal = closeDropinTcsModal;

  function showCombinedTcsModal() {
    const contactId = window.contactId;
    if (!contactId) {
      alert('Unable to open T&Cs – missing contact information.');
      return;
    }

    openTermsModal('class t&cs signed', contactId, async () => {
      if (typeof window.renderChecklist === 'function') {
        window.renderChecklist();
      }
    });
  }

  window.showCombinedTcsModal = showCombinedTcsModal;
  window.showGymTcsModal = showCombinedTcsModal;
  window.showTrialTcsModal = showCombinedTcsModal;

  function ensureInitialCheckInInfoModal() {
    let modal = document.getElementById('initial-checkin-info-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'initial-checkin-info-modal';
      modal.className = 'info-modal';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="info-modal-content">
          <button type="button" class="close-button" aria-label="Close" onclick="window.closeInitialCheckInInfoModal && window.closeInitialCheckInInfoModal()">&times;</button>
          <div id="initial-checkin-info-content"></div>
        </div>`;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function renderInitialCheckInInfoContent() {
    const container = document.getElementById('initial-checkin-info-content');
    if (!container || container.nodeType !== 1) return;
    const contentHTML = `
      <div style="max-width:520px;margin:0 auto;">
        <h2 style="margin-top:0;color:#1f3c88;">How check-in works</h2>
        <p style="color:#2f3c55;line-height:1.7;">When you arrive for your onboarding 1-1, let your coach know you’re here. They’ll mark you as checked in, which updates the checklist automatically.</p>
        <ul style="padding-left:1.4em;line-height:1.8;color:#2f3c55;margin:1em 0;">
          <li>Arrive a few minutes early so you’re ready to start on time.</li>
          <li>Say hi to your coach or the Bombers team on the desk.</li>
          <li>We’ll flip this item to complete once you’re logged.</li>
        </ul>
        <p style="color:#2f3c55;">Need to reschedule? Use the “Manage booking” button or chat with us and we’ll sort it.</p>
      </div>
    `;
    safeSetHTML(container, contentHTML);
  }

  function showInitialCheckInInfoModal() {
    const modal = ensureInitialCheckInInfoModal();
    renderInitialCheckInInfoContent();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeInitialCheckInInfoModal() {
    const modal = document.getElementById('initial-checkin-info-modal');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.showInitialCheckInInfoModal = showInitialCheckInInfoModal;
  window.closeInitialCheckInInfoModal = closeInitialCheckInInfoModal;

  function ensureBloodPressureModal() {
    let modal = document.getElementById('bp-info-modal-dynamic');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'bp-info-modal-dynamic';
      modal.className = 'info-modal';
      modal.style.display = 'none';
      modal.innerHTML = `
        <div class="info-modal-content">
          <button type="button" class="close-button" aria-label="Close" onclick="window.closeBloodPressureInfoModal && window.closeBloodPressureInfoModal()">&times;</button>
          <div id="bp-info-modal-content"></div>
        </div>`;
      document.body.appendChild(modal);
    }
    return modal;
  }

  function renderBloodPressureInfoContent() {
    const container = document.getElementById('bp-info-modal-content');
    if (!container || container.nodeType !== 1) return;
    const tableRows = [
      { range: 'Below 90/60 mmHg', guidance: 'You may have low blood pressure, speak to your doctor or nurse before starting any new exercise.' },
      { range: '90/60 mmHg – 140/90 mmHg', guidance: 'It is safe to be more active, and it will help to keep your blood pressure in the healthy range.' },
      { range: '140/90 mmHg – 179/99 mmHg', guidance: 'This is high blood pressure, but it should be safe to be more active to help lower it.' },
      { range: '180/100 mmHg – 199/109 mmHg', guidance: 'This is a very high reading, speak to your doctor or nurse before starting any new exercise.' },
      { range: '200/110 mmHg or above', guidance: 'Don\'t start any new activity – visit your doctor or nurse as soon as possible.' }
    ];

    const rowsHtml = tableRows.map(row => `
      <tr>
        <td style="padding:12px; border:1px solid #d6e0f2;">${window.escapeHtml ? window.escapeHtml(row.range) : row.range}</td>
        <td style="padding:12px; border:1px solid #d6e0f2;">${window.escapeHtml ? window.escapeHtml(row.guidance) : row.guidance}</td>
      </tr>
    `).join('');

    const contentHTML = `
      <div style="max-width:720px; margin:0 auto;">
        <h2 style="margin-top:0; color:#1f3c88;">Blood pressure guidelines</h2>
        <p style="color:#3d4a63; line-height:1.6;">
          Use this table to understand how your reading maps onto the guidance we give in the checklist. If you are unsure about your reading, speak with a healthcare professional.
        </p>
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:#f0f5ff;">
                <th style="text-align:left; padding:12px; border:1px solid #d6e0f2;">Blood pressure level</th>
                <th style="text-align:left; padding:12px; border:1px solid #d6e0f2;">Is it safe to be more active?</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;

    safeSetHTML(container, contentHTML);
  }

  function showBloodPressureInfoModal() {
    const modal = ensureBloodPressureModal();
    renderBloodPressureInfoContent();
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

  function closeBloodPressureInfoModal() {
    const modal = document.getElementById('bp-info-modal-dynamic');
    if (!modal || modal.nodeType !== 1) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  window.showBloodPressureInfoModal = showBloodPressureInfoModal;
  window.closeBloodPressureInfoModal = closeBloodPressureInfoModal;

})();
