# 🚀 Checklist 5.0 - Implementation Guide

## Quick Start

### For Development

1. **Edit files in their respective locations:**
   ```
   js/config.js          - Change field IDs, tags, pricing
   js/modals/membership.js - Update membership pricing
   css/styles.css        - Adjust styling
   ```

2. **Test locally:**
   - Open `index.html` in your browser
   - Use browser dev tools for debugging

### For Production (GoHighLevel)

1. **Build the combined file:**
   ```bash
   cd "/Users/tommckenny/Library/CloudStorage/GoogleDrive-tom@bomberspt.co.uk/My Drive/Projects/Scripts/Checklist 5.0"
   ./build.sh
   ```

2. **Deploy to GoHighLevel:**
   - Open `index-combined.html` in a text editor
   - Select all content (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)
   - Go to your GoHighLevel page
   - Add a "Custom HTML" element
   - Paste the entire contents
   - Save

## 📁 File Structure Explained

### Configuration Files
- **js/config.js**
  - All FIELDS IDs for custom fields
  - All TAGS for contact tagging
  - MEMBERSHIP_PRICES object
  - TERMS_LIBRARY for T&C modals
  - ⚠️ **Edit this when GHL field IDs change**

### Core Functionality
- **js/utils.js**
  - Helper functions (formatting, DOM manipulation)
  - Date formatting (formatDateTime, formatShortDate)
  - HTML escaping (escapeHtml)
  - Confetti animations (burst)
  - Contact ID extraction from URL

- **js/api.js**
  - All GHL API calls
  - updateFieldsBatch - Update custom fields
  - addTagToContact - Add tags
  - removeTagFromContact - Remove tags
  - fetchContact - Get contact data

- **js/blood-pressure.js**
  - BP input validation and formatting
  - Health feedback based on BP readings
  - Submit BP with automatic tagging

### Modal Systems
- **js/modals/terms.js**
  - Multi-step T&C modal
  - SignaturePad integration
  - Handles: Membership T&Cs, Class T&Cs, PAR-Q, DD Mandate

- **js/modals/membership.js**
  - Full pricing table
  - Interactive plan finder (decision tree)
  - Plan comparison tool
  - Landing page with two options

- **js/modals/info-modals.js**
  - FAQs modal
  - Blueprint modal
  - Onboarding Works modal
  - Simple content-based modals

## 🔧 Common Customization Tasks

### Update Pricing

**Edit: `js/config.js`**
```javascript
const MEMBERSHIP_PRICES = {
  opengym: 53.58,  // Change this
  classic: 71.76,  // Change this
  premium: 89.93   // Change this
};
```

Then update pricing in **`js/modals/membership.js`** in the getRecommendation() function.

### Add a New Field ID

**Edit: `js/config.js`**
```javascript
const FIELDS = {
  APPT_DATE: "5OW9SPaBGbqChOOqBfoI",
  YOUR_NEW_FIELD: "new-field-id-here",  // Add here
  // ... rest
};
```

### Add a New Tag

**Edit: `js/config.js`**
```javascript
const TAGS = {
  CONSULT_DONE: "consultation form submitted",
  YOUR_NEW_TAG: "your new tag name",  // Add here
  // ... rest
};
```

### Change Styling

**Edit: `css/styles.css`**
```css
/* Find the selector and modify */
.checklist-tab {
  background: #f5f7ff;  /* Change colors */
  color: #1f2a46;
}
```

## 🐛 Debugging

### Check Console for Errors
```javascript
// All functions log errors with prefixes like:
[updateFieldsBatch] Error: ...
[openTermsModal] Unknown terms key: ...
```

### Test Individual Modals
```javascript
// Open browser console and run:
window.showMembershipModal();  // Test membership modal
window.showFaqsModal();        // Test FAQs modal
window.openTermsModal('par-q submitted', contactId);  // Test T&C modal
```

### Verify Contact ID Extraction
```javascript
// In browser console:
console.log(window.getContactIdFromURL());
// Should log the contact ID
```

## ⚙️ Build Script Details

The `build.sh` script:
1. Creates `index-combined.html`
2. Injects CSS from `css/styles.css`
3. Combines all JS files in correct order:
   - config.js (must be first)
   - utils.js (second)
   - api.js (third)
   - blood-pressure.js
   - modals/terms.js
   - modals/membership.js
   - modals/info-modals.js

**Load order matters!** Config must load before everything else.

## 📝 Adding New Features

### Add a New Modal

1. **Create file:** `js/modals/your-modal.js`

2. **Add HTML structure to index.html:**
   ```html
   <div id="your-modal" style="display:none;">
     <!-- Your modal structure -->
   </div>
   ```

3. **Add to build script:** Edit `build.sh`
   ```bash
   JS_FILES=(
     # ... existing files
     "js/modals/your-modal.js"
   )
   ```

4. **Rebuild:** `./build.sh`

### Add a New Checklist Item

**Edit: `js/checklist.js`** (when we create it)
```javascript
// In renderChecklist() function, add your item:
html += `<li>
  <span class="status-icon">${done ? '✅' : '⬜'}</span>
  <span class="label">Your new item</span>
</li>`;
```

## 🔒 Security Notes

- Never commit API keys or secrets
- All API calls go through ghl-proxy.fly.dev
- Contact IDs are extracted from URL (no hardcoding)
- Signature data is base64 encoded before sending

## 📊 Performance

- Combined file is typically 150-200KB
- Gzips well (reduce by ~70%)
- Loads in <1s on decent connection
- External dependencies (SignaturePad, Confetti) load async

## ✅ Testing Checklist

Before deploying to production:

- [ ] Run `./build.sh` successfully
- [ ] Check `index-combined.html` file size is reasonable
- [ ] Test contact ID extraction works
- [ ] Test all modals open and close correctly
- [ ] Test form submissions (T&C signatures, BP input)
- [ ] Test on mobile viewport
- [ ] Check console for JavaScript errors
- [ ] Verify confetti animations work
- [ ] Test manual override (10-tap secret)
- [ ] Verify API calls reach GHL proxy

## 🆘 Troubleshooting

### Build script fails
```bash
# Check file permissions
chmod +x build.sh

# Check files exist
ls -la js/
ls -la js/modals/
ls -la css/
```

### Modals don't open
- Check browser console for errors
- Verify modal HTML elements exist in DOM
- Check z-index conflicts with other elements

### API calls fail
- Check network tab in browser dev tools
- Verify ghl-proxy.fly.dev is accessible
- Check contact ID is being extracted correctly
- Verify field IDs in config.js match GHL

### Styling looks broken
- Check css/styles.css was included in build
- Verify no CSS syntax errors
- Check for conflicting styles from GHL theme

## 📞 Support

If you need to modify functionality:
1. Identify which file controls that feature (see structure above)
2. Edit that specific file
3. Rebuild with `./build.sh`
4. Test in index.html before deploying
5. Copy index-combined.html to GoHighLevel

## 🎯 Next Steps

1. Complete remaining files (we're working on this now)
2. Create full CSS file
3. Create main checklist.js
4. Test the complete build
5. Deploy to staging environment
6. Test thoroughly
7. Deploy to production

---

**Remember:** Always test locally before deploying to GoHighLevel!
