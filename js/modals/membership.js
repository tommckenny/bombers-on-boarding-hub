(function() {
  let comparison = [];
  let initialized = false;

  // Use global safe DOM helpers
  const safeSetHTML = window.safeSetHTML;
  const safeAppend = window.safeAppend;
  const safeInsertAdjacentElement = window.safeInsertAdjacentElement;
  const safeRemove = window.safeRemove;


  const planFinderState = {
    currentStep: 0,
    answers: {},
    path: null // 'solo', 'group', 'pt'
  };

  function lookupPrice(path, fallback) {
    if (typeof window.getPriceFromLookup === 'function') {
      const result = window.getPriceFromLookup(path, null);
      if (result != null && result !== '') return result;
    }
    let current = window.PRICE_LOOKUP;
    if (!Array.isArray(path)) return fallback || null;
    for (let i = 0; i < path.length; i += 1) {
      if (!current || typeof current !== 'object') {
        current = null;
        break;
      }
      current = current[path[i]];
    }
    if (current == null || current === '') {
      return fallback || null;
    }
    return current;
  }

  function lookupPrice(path, fallback) {
    if (typeof window.getPriceFromLookup === 'function') {
      const result = window.getPriceFromLookup(path, null);
      if (result != null && result !== '') return result;
    }
    let current = window.PRICE_LOOKUP;
    if (!Array.isArray(path)) return fallback || null;
    for (let i = 0; i < path.length; i += 1) {
      if (!current || typeof current !== 'object') {
        current = null;
        break;
      }
      current = current[path[i]];
    }
    if (current == null || current === '') {
      return fallback || null;
    }
    return current;
  }

  function parsePriceComponents(priceText) {
    if (!priceText) return null;
    const clean = String(priceText).replace(/,/g, '');
    const valueMatch = clean.match(/([\d.]+)/);
    if (!valueMatch) return null;
    const suffixMatch = clean.match(/[\d.]+(.*)$/);
    const currencyMatch = clean.match(/^\s*([^0-9\s]+)/);
    return {
      value: parseFloat(valueMatch[1]),
      currency: currencyMatch ? currencyMatch[1] : '£',
      suffix: suffixMatch ? suffixMatch[1] : ''
    };
  }

  function derivePerUnitText(priceText, units, fallback) {
    const parsed = parsePriceComponents(priceText);
    if (!parsed || !units) return fallback || '';
    const value = parsed.value / units;
    return `${parsed.currency}${value.toFixed(2)}`;
  }

  function buildDiscountedPrice(priceText, discountRate) {
    const parsed = parsePriceComponents(priceText);
    if (!parsed) return null;
    const discountedValue = parsed.value * (1 - discountRate);
    const savingsValue = parsed.value - discountedValue;
    const cadence = parsed.suffix && parsed.suffix.includes('4 weeks') ? ' every 4 weeks' : '';
    return {
      originalText: priceText,
      discountedText: `${parsed.currency}${discountedValue.toFixed(2)}${parsed.suffix || ''}`,
      savingsText: `Save ${parsed.currency}${savingsValue.toFixed(2)}${cadence}`
    };
  }

  const decisionTree = {
    start: {
      id: 'trainingType',
      text: 'What is your preferred way to train?',
      type: 'visual-boxes',
      options: [
        { value: 'solo', icon: '💪', text: 'By Myself', path: 'solo' },
        { value: 'group', icon: '👥', text: 'In a Group', path: 'group' },
        { value: 'pt', icon: '🎯', text: '1-1 with a PT', path: 'pt' }
      ]
    },

    // Solo (By Myself) Path
    solo: [
      {
        id: 'soloCommitment',
        text: 'Are you looking for occasional drop-in access or regular weekly access?',
        type: 'side-by-side',
        options: [
          { value: 'dropin', text: 'Occasional drop-in access' },
          { value: 'regular', text: 'Regular weekly access' }
        ]
      },
      {
        id: 'soloTiming',
        text: 'When can you train?',
        type: 'side-by-side',
        options: [
          { value: '24-7', text: 'Any time (24/7 access needed)' },
          { value: 'offpeak', text: 'Weekdays 10:30-15:30 only' }
        ],
        condition: (answers) => answers.soloCommitment === 'regular'
      }
    ],

    // Group (In a Group) Path
    group: [
      {
        id: 'groupCommitment',
        text: 'Are you looking for occasional drop-in coached sessions or regular weekly coached sessions?',
        type: 'side-by-side',
        options: [
          { value: 'dropin', text: 'Occasional drop-in coached sessions' },
          { value: 'regular', text: 'Regular weekly coached sessions' }
        ]
      },
      {
        id: 'groupGymAccess',
        text: 'Do you want gym access outside of coached sessions?',
        type: 'side-by-side',
        options: [
          { value: 'yes', text: 'Yes, I want to train independently too' },
          { value: 'no', text: 'No, just the coached sessions' }
        ],
        condition: (answers) => answers.groupCommitment === 'regular'
      }
    ],

    // PT (1-1 with PT) Path
    pt: [
      {
        id: 'ptStructure',
        text: 'Are you looking for regular structure and accountability, or flexible ad-hoc PT sessions?',
        type: 'side-by-side',
        options: [
          { value: 'flexible', text: 'Flexible PT sessions' },
          { value: 'regular', text: 'Regular structure and accountability' }
        ]
      },
    ]
  };

  function getRecommendation(answers, path) {
    const recommendations = [];

    // SOLO PATH (By Myself)
    if (path === 'solo') {
      const commitment = answers.soloCommitment;
      const timing = answers.soloTiming;

      // Drop-in access
      if (commitment === 'dropin') {
        const dayPassPrice = lookupPrice(['openGym', 'dropins', 'dayPass'], '£12.50');
        const weekPassPrice = lookupPrice(['openGym', 'dropins', 'weekPass'], '£30.00');
        const monthPassPrice = lookupPrice(['openGym', 'dropins', 'fourWeekPass'], '£74.00');
        return {
          message: 'Based on your training preferences, here are our gym membership options:',
          isCompactGymPasses: true,
          gymPasses: [
            { name: 'Day Pass', total: dayPassPrice, access: '24/7 access', expiry: 'Valid for 1 day' },
            { name: '1 Week Pass', total: weekPassPrice, access: '24/7 access', expiry: 'Valid for 7 days' },
            { name: '4 Week Pass', total: monthPassPrice, access: '24/7 access', expiry: 'Valid for 4 weeks' }
          ]
        };
      }
      // Regular weekly access
      else if (commitment === 'regular') {
        const openGymAddon = lookupPrice(['classes', 'upgrades', 'openGymAddon'], '+£10');
        return {
          message: 'Recurring gym-only memberships are now bundled with our coached plans. Start on coaching and bolt on gym time whenever you need it.',
          isCompactGymMembership: true,
          gymMemberships: [{ name: 'Add Open Gym access', total: openGymAddon, access: '24/7 independent training between coached sessions', recurring: true }]
        };
      }

      return { message: 'Based on your training preferences, here are our gym membership options:', plans: recommendations };
    }

    // GROUP PATH (In a Group)
    if (path === 'group') {
      const commitment = answers.groupCommitment;

      // Drop-in coached sessions
      if (commitment === 'dropin') {
        const singleClassPrice = lookupPrice(['classes', 'dropins', 'single'], '£14.50');
        const pack4Price = lookupPrice(['classes', 'dropins', 'pack4'], '£49.50');
        const pack4Per = derivePerUnitText(pack4Price, 4, '£11.25');
        return {
          message: 'Based on your training preferences, here are our coached session options:',
          isCompactClassPacks: true,
          classPacks: [
            { name: 'Single Coached Session', total: singleClassPrice, perClass: singleClassPrice, expiry: 'Valid for 7 days' },
            { name: '4 Pack (Coached Sessions)', total: pack4Price, perClass: pack4Per, expiry: 'Valid for 4 weeks' }
          ]
        };
      }
      // Regular weekly coached sessions
      else if (commitment === 'regular') {
        const classicPrice = lookupPrice(['classes', 'recurring', 'twelvePer4Weeks'], '£87.50 / 4 weeks');
        const perClass = derivePerUnitText(classicPrice, 12, '£7.29');
        const unlimitedTopUp = lookupPrice(['classes', 'upgrades', 'unlimitedTopUp'], '+£10');
        const openGymAddon = lookupPrice(['classes', 'upgrades', 'openGymAddon'], '+£10');
        return {
          message: 'Based on your training preferences, here are our coached session options:',
          isCompactClassMemberships: true,
          classMemberships: [
            {
              name: 'Coached 3/week',
              total: classicPrice,
              classes: 'Typically 3 coached sessions per week (≈12 every 4 weeks)',
              perClass: perClass,
              gymAccess: 'Includes onboarding, accountability & optional gym time',
              upgrades: [
                { label: 'Upgrade to unlimited classes', price: unlimitedTopUp, description: 'Priority booking & unlimited coached sessions' },
                { label: 'Add Open Gym access', price: openGymAddon, description: '24/7 independent training between coached sessions' }
              ],
              upgradeNote: 'Add-ons are billed alongside your membership every 4 weeks.'
            }
          ]
        };
      }

      return { message: 'Based on your training preferences, here are our coached session options:', plans: recommendations };
    }

    // PT PATH (1-1 with PT)
    if (path === 'pt') {
      const structure = answers.ptStructure;

      // Flexible PT sessions (blocks)
      if (structure === 'flexible') {
        const block4Per = lookupPrice(['pt', 'blocks', 'four', 'perSession'], '£52.50');
        const block4Total = lookupPrice(['pt', 'blocks', 'four', 'total'], '£210.00');
        const block12Per = lookupPrice(['pt', 'blocks', 'twelve', 'perSession'], '£50.00');
        const block12Total = lookupPrice(['pt', 'blocks', 'twelve', 'total'], '£600.00');
        const block24Per = lookupPrice(['pt', 'blocks', 'twentyFour', 'perSession'], '£47.50');
        const block24Total = lookupPrice(['pt', 'blocks', 'twentyFour', 'total'], '£1,140.00');
        return {
          message: 'Based on your preferences, here are our recommended PT options:',
          isCompactPTBlocks: true,
          blocks: [
            { name: 'Block of 4', total: block4Total, perSession: block4Per, discount: '≈13% discount', expiry: '4 weeks' },
            { name: 'Block of 12', total: block12Total, perSession: block12Per, discount: '≈17% discount', expiry: '12 weeks' },
            { name: 'Block of 24', total: block24Total, perSession: block24Per, discount: '≈21% discount', expiry: '24 weeks' }
          ]
        };
      }

      // Regular structure and accountability (recurring)
      else if (structure === 'regular') {
        const pt1xPer = lookupPrice(['pt', 'recurring', 'onePerWeek', 'perSession'], '£47.25');
        const pt1xTotal = lookupPrice(['pt', 'recurring', 'onePerWeek', 'total'], '£189.00');
        const pt2xPer = lookupPrice(['pt', 'recurring', 'twoPerWeek', 'perSession'], '£45.00');
        const pt2xTotal = lookupPrice(['pt', 'recurring', 'twoPerWeek', 'total'], '£360.00');
        const pt3xPer = lookupPrice(['pt', 'recurring', 'threePerWeek', 'perSession'], '£42.75');
        const pt3xTotal = lookupPrice(['pt', 'recurring', 'threePerWeek', 'total'], '£513.00');
        return {
          message: 'Based on your preferences, here are our recommended PT options:',
          isCompactPTRecurring: true,
          recurringPlans: [
            { name: '1x per week', total: pt1xTotal, perSession: pt1xPer, discount: '≈21% discount', sessions: '4 sessions / 4 weeks', gymAccess: '50% off gym plans' },
            { name: '2x per week', total: pt2xTotal, perSession: pt2xPer, discount: '≈25% discount', sessions: '8 sessions / 4 weeks', gymAccess: 'FREE 24/7 gym ✅' },
            { name: '3x per week', total: pt3xTotal, perSession: pt3xPer, discount: '≈29% discount', sessions: '12 sessions / 4 weeks', gymAccess: 'FREE 24/7 gym ✅' }
          ]
        };
      }

      return { message: 'Based on your preferences, here are our recommended PT options:', plans: recommendations };
    }

    return { message: 'Browse all plans below', plans: [], showAll: true };
  }

  function renderQuestion() {
    const modal = document.getElementById('membership-modal');
    if (!modal || modal.nodeType !== 1) return;

    const contentDiv = modal.querySelector('#finder-content');
    const progressDiv = modal.querySelector('#finder-progress');
    if (!contentDiv || contentDiv.nodeType !== 1 || !progressDiv || progressDiv.nodeType !== 1) return;

    // Start question (training type)
    if (!planFinderState.path) {
      const question = decisionTree.start;
      progressDiv.textContent = '';

      const questionHTML = `
        <div class="plan-finder__question">
          <div class="plan-finder__question-text">${question.text}</div>
          <div class="plan-finder__training-boxes">
            ${question.options.map(option => `
              <div class="plan-finder__training-box" data-path="${option.path}">
                <div class="plan-finder__training-box-icon">${option.icon}</div>
                <div class="plan-finder__training-box-text">${option.text}</div>
              </div>
            `).join('')}
          </div>
          <div class="plan-finder__restart">
            <button class="plan-finder__btn plan-finder__btn--secondary" onclick="returnToLanding()">← Back to Start</button>
          </div>
        </div>
      `;

      safeSetHTML(contentDiv, questionHTML);

      // Add event listeners
      contentDiv.querySelectorAll('.plan-finder__training-box').forEach(box => {
        box.addEventListener('click', (e) => {
          const path = e.currentTarget.dataset.path;
          planFinderState.path = path;
          planFinderState.answers.trainingType = path;
          planFinderState.currentStep = 0;
          renderQuestion();
        });
      });
      return;
    }

    // Get questions for current path
    const pathQuestions = decisionTree[planFinderState.path];

    // Filter questions based on conditions
    const availableQuestions = pathQuestions.filter(q =>
      !q.condition || q.condition(planFinderState.answers)
    );

    if (planFinderState.currentStep >= availableQuestions.length) {
      renderResult();
      return;
    }

    const question = availableQuestions[planFinderState.currentStep];
    progressDiv.textContent = '';

    let questionHTML = `
      <div class="plan-finder__question">
        <div class="plan-finder__question-text">${question.text}</div>
    `;

    // Add educational message if present
    if (question.educational) {
      questionHTML += `
        <div class="plan-finder__educational">
          💡 ${question.educational}
        </div>
      `;
    }

    // Render options based on type
    if (question.type === 'side-by-side') {
      questionHTML += `
        <div class="plan-finder__side-by-side">
          ${question.options.map(option => `
            <div class="plan-finder__card" data-question="${question.id}" data-value="${option.value}">
              <div class="plan-finder__card-text">${option.text}</div>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      questionHTML += `
        <div class="plan-finder__options">
          ${question.options.map(option => `
            <button class="plan-finder__option" data-question="${question.id}" data-value="${option.value}">
              ${option.text}
            </button>
          `).join('')}
        </div>
      `;
    }

    questionHTML += `
        <div class="plan-finder__restart">
          <button class="plan-finder__btn plan-finder__btn--secondary" onclick="goBackOneStep()">← Back</button>
          <button class="plan-finder__btn plan-finder__btn--secondary" onclick="restartFinderToStart()">← Back to Start</button>
        </div>
      </div>
    `;

    safeSetHTML(contentDiv, questionHTML);

    // Add event listeners
    contentDiv.querySelectorAll('.plan-finder__option, .plan-finder__card').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questionId = e.currentTarget.dataset.question;
        const value = e.currentTarget.dataset.value;
        planFinderState.answers[questionId] = value;
        planFinderState.currentStep++;
        renderQuestion();
      });
    });
  }

  // anchor: membership.renderResult
  function renderResult() {
    const modal = document.getElementById('membership-modal');
    if (!modal || modal.nodeType !== 1) return;

    const contentDiv = modal.querySelector('#finder-content');
    const progressDiv = modal.querySelector('#finder-progress');
    if (!contentDiv || contentDiv.nodeType !== 1 || !progressDiv || progressDiv.nodeType !== 1) return;

    const recommendation = getRecommendation(planFinderState.answers, planFinderState.path);

    progressDiv.textContent = 'Your personalized recommendations';

    let resultHTML = `
      <div class="plan-finder__result">
        <h3 class="plan-finder__result-title">${recommendation.message}</h3>
    `;

    if (recommendation.showAll) {
      resultHTML += `<p style="text-align: center; color: #6b7894;">${recommendation.why || 'Scroll down to explore all our membership options.'}</p>`;
    } else if (recommendation.isCompactPTBlocks) {
      // Compact PT blocks layout
      resultHTML += `
        <div class="plan-finder__educational" style="margin-bottom: 16px;">💡 To get the most out of your training, we highly recommend that you follow additional planned sessions between your PT sessions.</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      `;

      recommendation.blocks.forEach(block => {
        resultHTML += `
          <div style="background: #fff; border: 2px solid #d0d7f1; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 1.1em; font-weight: 600; color: #1f3c88; margin-bottom: 12px;">${block.name}</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #007bff; margin-bottom: 8px;">${block.total}</div>
            <div style="font-size: 0.9em; color: #37415a; margin-bottom: 4px;">Per session: <strong>${block.perSession}</strong></div>
            <div style="font-size: 0.85em; color: #6b7894; margin-bottom: 8px;">${block.discount}</div>
            <div style="font-size: 0.9em; color: #37415a; padding-top: 8px; border-top: 1px solid #e8ecf5;">Expiry: ${block.expiry}</div>
          </div>
        `;
      });

      resultHTML += `
        </div>
        <div style="background: #f8f9ff; border: 1px solid #d0d7f1; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px; font-size: 1.05em; color: #1f3c88;">Shared Benefits</h4>
          <ul style="margin: 0 0 12px; padding-left: 20px; line-height: 1.8;">
            <li>Maximum booking flexibility</li>
            <li>Expert 1-on-1 coaching</li>
            <li>Gym access during PT sessions</li>
          </ul>
          <h4 style="margin: 16px 0 12px; font-size: 1.05em; color: #1f3c88;">Add Open Gym Drop-in Access</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
            <div style="background: #fff; border: 1px solid #d0d7f1; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-weight: 600; color: #1f3c88; margin-bottom: 4px;">Day Pass</div>
              <div style="font-size: 1.1em; font-weight: 700; color: #007bff; margin-bottom: 4px;">£12.50</div>
              <div style="font-size: 0.85em; color: #6b7894;">24/7 access for 1 day</div>
            </div>
            <div style="background: #fff; border: 1px solid #d0d7f1; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-weight: 600; color: #1f3c88; margin-bottom: 4px;">1 Week Pass</div>
              <div style="font-size: 1.1em; font-weight: 700; color: #007bff; margin-bottom: 4px;">£30.00</div>
              <div style="font-size: 0.85em; color: #6b7894;">24/7 access for 7 days</div>
            </div>
            <div style="background: #fff; border: 1px solid #d0d7f1; border-radius: 6px; padding: 12px; text-align: center;">
              <div style="font-weight: 600; color: #1f3c88; margin-bottom: 4px;">4 Week Pass</div>
              <div style="font-size: 1.1em; font-weight: 700; color: #007bff; margin-bottom: 4px;">£74.00</div>
              <div style="font-size: 0.85em; color: #6b7894;">24/7 access for 4 weeks</div>
            </div>
          </div>
          <div class="perk-banner upgrade-banner" style="cursor: pointer;" onclick="switchToRecurringPT()">
            <span class="icon">💰</span>
            <span>Save an additional 8% by switching to a recurring plan →</span>
          </div>
        </div>
      `;
    } else if (recommendation.isCompactPTRecurring) {
      // Compact PT recurring layout
      resultHTML += `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      `;

      recommendation.recurringPlans.forEach(plan => {
        resultHTML += `
          <div style="background: #fff; border: 2px solid #d0d7f1; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 1.1em; font-weight: 600; color: #1f3c88; margin-bottom: 12px;">${plan.name}</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #007bff; margin-bottom: 8px;">${plan.total}</div>
            <div style="font-size: 0.9em; color: #37415a; margin-bottom: 4px;">Per session: <strong>${plan.perSession}</strong></div>
            <div style="font-size: 0.85em; color: #6b7894; margin-bottom: 8px;">${plan.discount}</div>
            <div style="font-size: 0.9em; color: #37415a; padding-top: 8px; border-top: 1px solid #e8ecf5; margin-bottom: 8px;">${plan.sessions}</div>
            <div style="font-size: 0.9em; color: #28a745; font-weight: 600;">${plan.gymAccess}</div>
          </div>
        `;
      });

      resultHTML += `
        </div>
        <div style="background: #f8f9ff; border: 1px solid #d0d7f1; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px; font-size: 1.05em; color: #1f3c88;">Shared Benefits</h4>
          <ul style="margin: 0 0 12px; padding-left: 20px; line-height: 1.8;">
            <li>Personalized programming and check-ins</li>
            <li>Automatic session scheduling</li>
            <li>Expert 1-on-1 coaching</li>
            <li>Ongoing support and accountability</li>
          </ul>
        </div>
      `;
    } else if (recommendation.isCompactClassPacks) {
      // Compact coached session packs layout
      resultHTML += `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      `;

      recommendation.classPacks.forEach(pack => {
        resultHTML += `
          <div style="background: #fff; border: 2px solid #d0d7f1; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 1.1em; font-weight: 600; color: #1f3c88; margin-bottom: 12px;">${pack.name}</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #007bff; margin-bottom: 8px;">${pack.total}</div>
            <div style="font-size: 0.9em; color: #37415a; margin-bottom: 4px;">Per coached session: <strong>${pack.perClass}</strong></div>
            <div style="font-size: 0.9em; color: #37415a; padding-top: 8px; border-top: 1px solid #e8ecf5;">${pack.expiry}</div>
          </div>
        `;
      });

      resultHTML += `
        </div>
        <div style="background: #f8f9ff; border: 1px solid #d0d7f1; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px; font-size: 1.05em; color: #1f3c88;">Shared Benefits</h4>
          <ul style="margin: 0 0 12px; padding-left: 20px; line-height: 1.8;">
            <li>Access to any scheduled coached session</li>
            <li>No commitment - pay as you go</li>
            <li>Try different coached session styles</li>
            <li>Flexible booking</li>
          </ul>
          <div class="perk-banner upgrade-banner">
            <span class="icon">⭐</span>
            <span>Want regular coached sessions? Try our memberships for better value and FREE gym access</span>
          </div>
        </div>
      `;
    } else if (recommendation.isCompactClassMemberships) {
      // Coached memberships with optional upgrades
      const membershipColumns = recommendation.classMemberships.length > 1 ? 'repeat(2, 1fr)' : '1fr';
      resultHTML += `
        <div style="display: grid; grid-template-columns: ${membershipColumns}; gap: 12px; margin-bottom: 20px;">
      `;

      recommendation.classMemberships.forEach(membership => {
        const perClassHTML = membership.perClass
          ? `<div style="font-size: 0.9em; color: #37415a; margin-bottom: 8px;">≈ ${membership.perClass} per session</div>`
          : '';
        const upgradesHTML = membership.upgrades && membership.upgrades.length
          ? `
            <div class="plan-upgrades plan-upgrades--compact">
              <div class="plan-upgrades__eyebrow">Upgrades &amp; add-ons</div>
              <ul class="plan-upgrades__list">
                ${membership.upgrades.map(upgrade => `
                  <li class="plan-upgrades__item">
                    <div>
                      <div class="plan-upgrades__label">${upgrade.label}</div>
                      ${upgrade.description ? `<div class="plan-upgrades__description">${upgrade.description}</div>` : ''}
                    </div>
                    <div class="plan-upgrades__price">${upgrade.price}</div>
                  </li>
                `).join('')}
              </ul>
              ${membership.upgradeNote ? `<p class="plan-upgrades__note">${membership.upgradeNote}</p>` : ''}
            </div>
          `
          : '';

        resultHTML += `
          <div style="background: #fff; border: 2px solid #d0d7f1; border-radius: 8px; padding: 16px;">
            <div style="font-size: 1.1em; font-weight: 600; color: #1f3c88; margin-bottom: 6px;">${membership.name}</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #007bff; margin-bottom: 4px;">${membership.total}</div>
            ${perClassHTML}
            <div style="font-size: 0.9em; color: #37415a; margin-bottom: 8px;">${membership.classes}</div>
            ${upgradesHTML}
            <div style="font-size: 0.9em; color: #28a745; font-weight: 600; margin-top: 12px;">${membership.gymAccess}</div>
          </div>
        `;
      });

      resultHTML += `
        </div>
        <div style="background: #f8f9ff; border: 1px solid #d0d7f1; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px; font-size: 1.05em; color: #1f3c88;">What you get</h4>
          <ul style="margin: 0 0 12px; padding-left: 20px; line-height: 1.8;">
            <li>Structured programme with your coach</li>
            <li>Member onboarding, check-ins & accountability</li>
            <li>Option to add unlimited sessions or gym time later</li>
            <li>Recurring billing with easy pause options</li>
          </ul>
        </div>
      `;
    } else if (recommendation.isCompactGymPasses) {
      // Compact gym passes layout
      resultHTML += `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      `;

      recommendation.gymPasses.forEach(pass => {
        resultHTML += `
          <div style="background: #fff; border: 2px solid #d0d7f1; border-radius: 8px; padding: 16px; text-align: center;">
            <div style="font-size: 1.1em; font-weight: 600; color: #1f3c88; margin-bottom: 12px;">${pass.name}</div>
            <div style="font-size: 1.3em; font-weight: 700; color: #007bff; margin-bottom: 8px;">${pass.total}</div>
            <div style="font-size: 0.9em; color: #37415a; margin-bottom: 4px;">${pass.access}</div>
            <div style="font-size: 0.9em; color: #37415a; padding-top: 8px; border-top: 1px solid #e8ecf5;">${pass.expiry}</div>
          </div>
        `;
      });

      resultHTML += `
        </div>
        <div style="background: #f8f9ff; border: 1px solid #d0d7f1; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px; font-size: 1.05em; color: #1f3c88;">Shared Benefits</h4>
          <ul style="margin: 0 0 12px; padding-left: 20px; line-height: 1.8;">
            <li>24/7 access to full gym floor</li>
            <li>No commitment - pay as you go</li>
            <li>Perfect for trying us out</li>
            <li>Valid from first use</li>
          </ul>
          <div class="perk-banner upgrade-banner">
            <span class="icon">⭐</span>
            <span>Want to train regularly? Upgrade to a recurring membership for better value</span>
          </div>
        </div>
      `;
    } else if (recommendation.isCompactGymMembership) {
      // Compact gym membership layout (single card centered)
      resultHTML += `
        <div style="display: grid; grid-template-columns: 1fr; max-width: 400px; margin: 0 auto 20px;">
          <div style="background: #fff; border: 2px solid #d0d7f1; border-radius: 8px; padding: 20px; text-align: center;">
            <div style="font-size: 1.2em; font-weight: 600; color: #1f3c88; margin-bottom: 12px;">${recommendation.gymMemberships[0].name}</div>
            <div style="font-size: 1.4em; font-weight: 700; color: #007bff; margin-bottom: 12px;">${recommendation.gymMemberships[0].total}</div>
            <div style="font-size: 0.95em; color: #37415a; padding-top: 12px; border-top: 1px solid #e8ecf5;">${recommendation.gymMemberships[0].access}</div>
          </div>
        </div>
        <div style="background: #f8f9ff; border: 1px solid #d0d7f1; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px; font-size: 1.05em; color: #1f3c88;">Shared Benefits</h4>
          <ul style="margin: 0 0 12px; padding-left: 20px; line-height: 1.8;">
            <li>Unlimited access during your membership period</li>
            <li>Member onboarding and support</li>
            <li>Recurring billing - no need to rebuy</li>
            <li>Cancel anytime with notice</li>
          </ul>
        </div>
      `;
    }

    resultHTML += `
        <div class="plan-finder__actions">
          <button class="plan-finder__btn plan-finder__btn--secondary" onclick="goBackOneStep()">← Back</button>
          <button class="plan-finder__btn plan-finder__btn--secondary" onclick="restartFinderToStart()">Start Over</button>
          <button class="plan-finder__btn plan-finder__btn--primary" onclick="showPricingTable()">See Full Pricing Table</button>
        </div>
      </div>
    `;

    safeSetHTML(contentDiv, resultHTML);
  }




  function switchToRecurringPT() {
    planFinderState.answers.ptStructure = 'regular';
    planFinderState.path = 'pt';
    renderResult();
  }

  function goBackOneStep() {
    if (planFinderState.currentStep > 0) {
      planFinderState.currentStep -= 1;
      const pathQuestions = decisionTree[planFinderState.path] || [];
      const availableQuestions = pathQuestions.filter(q => !q.condition || q.condition(planFinderState.answers));
      if (planFinderState.currentStep < availableQuestions.length) {
        const currentQuestion = availableQuestions[planFinderState.currentStep];
        delete planFinderState.answers[currentQuestion.id];
      }
      renderQuestion();
      return;
    }

    if (planFinderState.path) {
      planFinderState.path = null;
      planFinderState.answers = {};
      renderQuestion();
      return;
    }

    returnToLanding();
  }

  function restartFinderToStart() {
    planFinderState.currentStep = 0;
    planFinderState.answers = {};
    planFinderState.path = null;
    renderQuestion();
  }

  // anchor: membership.startPlanFinder
  function startPlanFinder() {
    const modal = ensureFullscreenContainer();
    if (!modal || modal.nodeType !== 1) return;

    const landingPage = modal.querySelector('#landing-page');
    const planFinder = modal.querySelector('#plan-finder');
    const mainContent = modal.querySelector('#main-content');

    if (landingPage) landingPage.style.display = 'none';
    if (planFinder) {
      planFinder.style.display = 'block';
      const finderBody = modal.querySelector('#finder-body');
      if (finderBody) {
        finderBody.style.maxHeight = '2000px';
        finderBody.style.opacity = '1';
      }
    }
    if (mainContent) mainContent.style.display = 'none';

    const discountOverlay = document.getElementById('discounts-overlay');
    const gymOverlay = document.getElementById('gym-dropins-overlay');
    if (discountOverlay) discountOverlay.style.display = 'none';
    if (gymOverlay) gymOverlay.style.display = 'none';

    planFinderState.currentStep = 0;
    planFinderState.answers = {};
    planFinderState.path = null;
    renderQuestion();
  }

  // anchor: membership.showPricingTable
  function showPricingTable() {
    const modal = ensureFullscreenContainer();
    if (!modal || modal.nodeType !== 1) return;

    const landingPage = modal.querySelector('#landing-page');
    const planFinder = modal.querySelector('#plan-finder');
    const mainContent = modal.querySelector('#main-content');

    if (landingPage) landingPage.style.display = 'none';
    if (planFinder) planFinder.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';

    const discountOverlay = document.getElementById('discounts-overlay');
    const gymOverlay = document.getElementById('gym-dropins-overlay');
    if (discountOverlay) discountOverlay.style.display = 'none';
    if (gymOverlay) gymOverlay.style.display = 'none';

    modal.querySelectorAll('.details-row').forEach(node => safeRemove(node));
    comparison = [];

    const comparisonSection = modal.querySelector('#comparison-section');
    if (comparisonSection) comparisonSection.style.display = 'none';
    const headerRow = modal.querySelector('#comparison-header');
    if (headerRow) safeSetHTML(headerRow, '<th>Feature</th>');
    const comparisonBody = modal.querySelector('#comparison-table tbody');
    if (comparisonBody) safeSetHTML(comparisonBody, '');

    initialized = false;
    initMembershipModal();
  }

  // anchor: membership.returnToLanding
  function returnToLanding() {
    const modal = ensureFullscreenContainer();
    if (!modal || modal.nodeType !== 1) return;

    const landingPage = modal.querySelector('#landing-page');
    const planFinder = modal.querySelector('#plan-finder');
    const mainContent = modal.querySelector('#main-content');

    if (landingPage) landingPage.style.display = 'block';
    if (planFinder) planFinder.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';

    modal.querySelectorAll('.details-row').forEach(node => safeRemove(node));

    const discountOverlay = document.getElementById('discounts-overlay');
    const discountModal = document.getElementById('discounts-modal');
    const gymOverlay = document.getElementById('gym-dropins-overlay');
    const gymModal = document.getElementById('gym-dropins-modal');
    if (discountOverlay) discountOverlay.style.display = 'none';
    if (discountModal) discountModal.style.display = 'none';
    if (gymOverlay) gymOverlay.style.display = 'none';
    if (gymModal) gymModal.style.display = 'none';

    planFinderState.currentStep = 0;
    planFinderState.answers = {};
    planFinderState.path = null;

    comparison = [];
    const headerRow = modal.querySelector('#comparison-header');
    if (headerRow) safeSetHTML(headerRow, '<th>Feature</th>');
    const comparisonBody = modal.querySelector('#comparison-table tbody');
    if (comparisonBody) safeSetHTML(comparisonBody, '');
    const comparisonSection = modal.querySelector('#comparison-section');
    if (comparisonSection) comparisonSection.style.display = 'none';

    initialized = false;
  }

  // anchor: membership.closeGymDropins
  function closeGymDropinsModal() {
    const modal = document.getElementById('gym-dropins-modal');
    const overlay = document.getElementById('gym-dropins-overlay');
    if (!modal || !overlay) return;
    overlay.style.display = 'none';
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  // anchor: membership.openGymDropins
  function openGymDropinsModal() {
    const modal = document.getElementById('gym-dropins-modal');
    const overlay = document.getElementById('gym-dropins-overlay');
    if (!modal || !overlay) return;
    const discountOverlay = document.getElementById('discounts-overlay');
    const discountModal = document.getElementById('discounts-modal');
    if (discountOverlay) discountOverlay.style.display = 'none';
    if (discountModal) discountModal.style.display = 'none';
    overlay.style.display = 'block';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  // anchor: membership.ensureFullscreenContainer
  function ensureFullscreenContainer() {
    const modal = document.getElementById('membership-modal');
    if (!modal || modal.dataset.fullscreenApplied === '1') return modal;

    const legacyWrapper = modal.classList.contains('info-modal') || modal.querySelector('.info-modal-content');
    if (!legacyWrapper) {
      modal.classList.add('fullscreen-modal');
      modal.style.display = 'none';
      modal.dataset.fullscreenApplied = '1';
      return modal;
    }

    const contentNode = modal.querySelector('#membership-content');
    const contentHTML = contentNode ? contentNode.innerHTML : '';

    modal.removeAttribute('role');
    modal.className = 'fullscreen-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="fullscreen-modal__return" role="button" tabindex="0">
        <div class="fullscreen-modal__return-inner">
          <span class="fullscreen-modal__return-icon" aria-hidden="true">⏎</span>
          <span>Go back to onboarding hub</span>
        </div>
      </div>
      <div id="membership-content" class="fullscreen-modal__content">${contentHTML}</div>`;

    modal.dataset.fullscreenApplied = '1';
    return modal;
  }

  // anchor: membership.initModal
  function initMembershipModal() {
    if (initialized) return;
    const modal = ensureFullscreenContainer();
    if (!modal || modal.nodeType !== 1) return;

    const tabs = modal.querySelectorAll('.menu-tab');
    const sections = modal.querySelectorAll('.section-content');
    const discountModal = document.getElementById('discounts-modal');
    const discountOverlay = document.getElementById('discounts-overlay');

    if (!discountModal || discountModal.nodeType !== 1 || !discountOverlay || discountOverlay.nodeType !== 1) {
      console.warn('[Membership Modal] Discount modal elements missing');
      return;
    }
    if (!discountOverlay.dataset.portalized) {
      document.body.appendChild(discountOverlay);
      discountOverlay.dataset.portalized = 'true';
    }
    if (!discountModal.dataset.portalized) {
      document.body.appendChild(discountModal);
      discountModal.dataset.portalized = 'true';
    }

    const gymOverlay = document.getElementById('gym-dropins-overlay');
    const gymModal = document.getElementById('gym-dropins-modal');

    if (gymOverlay && gymOverlay.nodeType === 1 && !gymOverlay.dataset.portalized) {
      document.body.appendChild(gymOverlay);
      gymOverlay.dataset.portalized = 'true';
    }
    if (gymModal && gymModal.nodeType === 1 && !gymModal.dataset.portalized) {
      document.body.appendChild(gymModal);
      gymModal.dataset.portalized = 'true';
    }

    if (gymModal) {
      gymModal.querySelectorAll('.discounts-close').forEach(btn => {
        if (btn.dataset.gymCloseBound === '1') return;
        btn.dataset.gymCloseBound = '1';
        btn.addEventListener('click', closeGymDropinsModal);
      });
    }
    if (gymOverlay && gymOverlay.nodeType === 1 && !gymOverlay.dataset.bound) {
      gymOverlay.dataset.bound = '1';
      gymOverlay.addEventListener('click', closeGymDropinsModal);
    }

    const planRows = Array.from(modal.querySelectorAll('.clickable-row'));
    const rowLookup = {};
    planRows.forEach(row => {
      rowLookup[row.dataset.plan] = row;
    });
    const linkedPlans = {
      'Day Pass': [],
      '1 Week Pass': [],
      '4 Week Pass': [],
      'Single Class': ['Classic Membership'],
      '4 Pack': ['Classic Membership'],
      '16 Pack': ['Classic Membership'],
      'Classic Membership': ['16 Pack'],
    };
    function getPlanDataFromRow(row) {
      return {
        plan: row.dataset.plan,
        displayPlan: row.dataset.planLabel || row.dataset.plan,
        price: row.dataset.price,
        details: row.dataset.details,
        type: row.dataset.type || 'N/A',
        access: row.dataset.access || 'N/A',
        expiry: row.dataset.expiry || 'N/A',
        perks: row.dataset.perks || 'N/A'
      };
    }

    function getPlanDataByName(name) {
      const targetRow = rowLookup[name];
      return targetRow ? getPlanDataFromRow(targetRow) : null;
    }

    function showSection(target) {
      modal.querySelectorAll('.details-row').forEach(detail => safeRemove(detail));
      sections.forEach(section => {
        section.classList.toggle('active', section.id === target);
      });
      tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.target === target);
      });
    }

    function openDiscountsModal() {
      if (!discountModal || !discountOverlay) return;
      discountOverlay.style.display = 'block';
      discountModal.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    function closeDiscountsModal() {
      if (!discountModal || !discountOverlay) return;
      discountOverlay.style.display = 'none';
      discountModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    // anchor: membership.renderComparison
    function renderComparison() {
      const section = modal.querySelector('#comparison-section');
      const table = modal.querySelector('#comparison-table');
      if (!section || !table) return;

      const headerRow = modal.querySelector('#comparison-header');
      const tbody = table.querySelector('tbody');
      if (!headerRow || headerRow.nodeType !== 1 || !tbody || tbody.nodeType !== 1) return;

      safeSetHTML(headerRow, '<th>Feature</th>');
      safeSetHTML(tbody, '');

      if (comparison.length === 0) {
        section.style.display = 'none';
        return;
      }

      section.style.display = 'block';

      comparison.forEach(plan => {
        const th = document.createElement('th');
        const wrapper = document.createElement('div');
        wrapper.classList.add('plan-heading');
        const planLabel = plan.displayPlan || plan.plan;

        const name = document.createElement('span');
        name.textContent = planLabel;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('remove-btn');
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', event => {
          event.stopPropagation();
          removeFromCompare(plan.plan);
        });

        wrapper.appendChild(name);
        wrapper.appendChild(removeBtn);
        th.appendChild(wrapper);
        headerRow.appendChild(th);
      });

      const featureRows = [
        { label: 'Type', key: 'type' },
        { label: 'Price', key: 'price' },
        { label: 'Access', key: 'access' },
        { label: 'Expiry / Billing', key: 'expiry' },
        { label: 'Perks', key: 'perks' }
      ];

      featureRows.forEach(feature => {
        const tr = document.createElement('tr');
        const featureCell = document.createElement('th');
        featureCell.scope = 'row';
        featureCell.textContent = feature.label;
        tr.appendChild(featureCell);

        comparison.forEach(plan => {
          const td = document.createElement('td');
          td.textContent = plan[feature.key] || 'N/A';
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    }

    // anchor: membership.addToCompare
    function addToCompare(planData, options = {}) {
      if (comparison.find(p => p.plan === planData.plan)) return;
      comparison.push(planData);
      renderComparison();

      if (options.skipLinked) return;
      const matches = linkedPlans[planData.plan];
      if (!matches || !matches.length) return;

      matches.forEach(name => {
        const linkedPlan = getPlanDataByName(name);
        if (!linkedPlan) return;
        addToCompare(linkedPlan, { skipLinked: true });
      });
    }

    // anchor: membership.removeFromCompare
    function removeFromCompare(plan) {
      const idx = comparison.findIndex(p => p.plan === plan);
      if (idx > -1) comparison.splice(idx, 1);
      renderComparison();
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        showSection(tab.dataset.target);
      });
    });

    modal.querySelectorAll('.discount-trigger').forEach(btn => {
      btn.addEventListener('click', openDiscountsModal);
    });

    discountModal.querySelectorAll('.discounts-close').forEach(btn => {
      btn.addEventListener('click', closeDiscountsModal);
    });

    discountOverlay.addEventListener('click', closeDiscountsModal);

    planRows.forEach(row => {
      row.addEventListener('click', () => {
        const planData = getPlanDataFromRow(row);
        const next = row.nextElementSibling;
        if (next && next.classList.contains('details-row')) {
          safeRemove(next);
          return;
        }

        modal.querySelectorAll('.details-row').forEach(detail => safeRemove(detail));

        const tr = document.createElement('tr');
        tr.classList.add('details-row');

        const td = document.createElement('td');
        td.colSpan = row.children.length;
        td.textContent = planData.details;
        td.appendChild(document.createElement('br'));

        const button = document.createElement('button');
        button.textContent = 'Add to Compare';
        button.addEventListener('click', event => {
          event.stopPropagation();
          addToCompare(planData);
        });

        td.appendChild(button);
        tr.appendChild(td);
        row.insertAdjacentElement('afterend', tr);
      });
    });

    if (tabs.length) {
      showSection(tabs[0].dataset.target);
    }

    syncMembershipPricing(modal);
    window.closeDiscountsModal = closeDiscountsModal;
    initialized = true;
  }

	  function showMembershipModal() {
	    const modal = ensureFullscreenContainer();
	    if (!modal || modal.nodeType !== 1) return;
	    try {
	      const raw = (window.location.hash || '').replace(/^#/, '');
	      if (!raw.includes('=') && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute('plans');
	      }
	    } catch (_) {}
	
	    const content = modal.querySelector('#membership-content');

    if (window.MEMBERSHIP_PAGE_URL && content) {
      const url = window.MEMBERSHIP_PAGE_URL;
      const contactId = window.contactId || '';
      const hub = encodeURIComponent(window.location.href.split('#')[0]);
      const sep = url.includes('?') ? '&' : '?';
      const src = `${url}${sep}contactId=${encodeURIComponent(contactId)}&hub=${hub}`;
      content.innerHTML = `
        <iframe src="${src}" title="Membership Options" style="border:0;flex:1 1 auto;width:100%;height:90vh;border-radius:12px;"></iframe>`;
    } else {
      returnToLanding();
      initMembershipModal();
    }
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.scrollTop = 0;
  }

	  function closeMembershipModal() {
	    const modal = document.getElementById('membership-modal');
	    if (!modal || modal.nodeType !== 1) return;
	    modal.style.display = 'none';
	    document.body.style.overflow = '';
	    const discountOverlay = document.getElementById('discounts-overlay');
	    if (discountOverlay) {
	      discountOverlay.style.display = 'none';
	    }
	    const discountModal = document.getElementById('discounts-modal');
	    if (discountModal) {
	      discountModal.style.display = 'none';
	    }
	    try {
	      if (typeof window.getChecklistHashRoute === 'function'
	        && window.getChecklistHashRoute() === 'plans'
	        && typeof window.setChecklistHashRoute === 'function') {
	        window.setChecklistHashRoute(typeof window.getChecklistHubHashRoute === 'function'
	          ? window.getChecklistHubHashRoute()
	          : 'enquiry');
	      }
	    } catch (_) {}
	  }

  window.showMembershipModal = showMembershipModal;
  window.closeMembershipModal = closeMembershipModal;
  window.startPlanFinder = startPlanFinder;
  window.showPricingTable = showPricingTable;
  window.returnToLanding = returnToLanding;
  window.goBackOneStep = goBackOneStep;
  window.restartFinderToStart = restartFinderToStart;
  window.switchToRecurringPT = switchToRecurringPT;
  window.openGymDropinsModal = openGymDropinsModal;
  window.closeGymDropinsModal = closeGymDropinsModal;

})();
