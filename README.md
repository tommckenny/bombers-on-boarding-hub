# BombersPT Onboarding Checklist 5.0

## Modular Architecture

This is a complete refactor of the BombersPT onboarding checklist into a modular, maintainable structure.

### Folder Structure

```
Checklist 5.0/
├── index.html                 # Main HTML file (for development)
├── index-combined.html        # Built/combined file (for GoHighLevel)
├── build.sh                   # Build script to combine all files
├── README.md                  # This file
├── css/
│   └── styles.css            # All styles
└── js/
    ├── config.js             # Constants (FIELDS, TAGS, MEMBERSHIP_PRICES)
    ├── utils.js              # Helper functions
    ├── api.js                # GHL API functions
    ├── blood-pressure.js     # BP input/validation
    ├── checklist.js          # Main checklist rendering
    ├── manual-override.js    # 10-tap override system
    └── modals/
        ├── terms.js          # T&C modal with signatures
        ├── membership.js     # Membership pricing + plan finder
        ├── info-modals.js    # FAQs, Blueprint, Onboarding Info
        └── trial-week.js     # Trial progress & membership selector
```

### Development Workflow

1. **Edit individual files** in their respective locations
2. **Test locally** by opening `index.html` in a browser
3. **Build for production** by running `./build.sh`
4. **Deploy to GoHighLevel** by copying contents of `index-combined.html`

### Build Script Usage

```bash
# Make executable (first time only)
chmod +x build.sh

# Run build
./build.sh
```

This will create `index-combined.html` with all JavaScript and CSS combined into one file.

### Key Features

- ✅ **Modular Architecture** - Each feature in its own file
- ✅ **Easy Maintenance** - Edit one file at a time
- ✅ **Version Control Friendly** - Small, focused files
- ✅ **GoHighLevel Compatible** - Builds into single HTML block
- ✅ **No Dependencies** - Just HTML/CSS/JS (except SignaturePad & Confetti CDNs)

### External Dependencies

These are loaded via CDN and NOT included in the build:

- SignaturePad (for T&C signatures)
- Confetti (for celebrations)
- GHL Widget (GoHighLevel chat widget)

### Files Explained

#### Core Files

- **config.js** - All field IDs, tags, pricing, terms library
- **utils.js** - Helper functions (formatting, DOM manipulation, confetti)
- **api.js** - All API calls to GHL proxy
- **blood-pressure.js** - BP input, validation, health feedback

#### Modal Files

- **terms.js** - Multi-step T&C modal with SignaturePad integration
- **membership.js** - Full pricing table + interactive plan finder
- **info-modals.js** - Simple content modals (FAQs, Blueprint, Onboarding)
- **trial-week.js** - Trial progress bar, membership selector

#### Main Files

- **checklist.js** - Main checklist rendering logic
- **manual-override.js** - 10-tap secret override system
- **styles.css** - All CSS styles

### Adding New Features

1. Create new file in appropriate location (e.g., `js/modals/new-feature.js`)
2. Add to `index.html` in correct load order
3. Add to `build.sh` script
4. Rebuild with `./build.sh`

### Notes

- All functions are exported to `window` object for global access
- Scripts must load in order (config → utils → api → features → main)
- CSS is combined and injected as `<style>` block in built version
