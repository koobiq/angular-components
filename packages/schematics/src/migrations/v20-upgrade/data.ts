/**
 * Replacement data for the v20.0.0 deprecated API removal migration.
 *
 * Each entry uses a RegExp source string in `from` and a literal `to`. The
 * RegExp is compiled with the `g` flag inside the migration driver.
 *
 * Three buckets are emitted so the schematic can apply each to the right
 * file kind (.ts, .html / inline-template strings, .scss).
 */

export interface Replacement {
    from: string;
    to: string;
    /** Optional human-readable note shown in dry-run / warn mode. */
    note?: string;
    /**
     * When this replacement matches in a .ts file, ensure the listed import
     * specifier is present. Used for rewrites that introduce a symbol the
     * user did not previously import (e.g. `toBoolean(` → `booleanAttribute(`
     * requires `import { booleanAttribute } from '@angular/core'`).
     */
    ensureImport?: { symbol: string; from: string };
}

/** TypeScript-source replacements (imports + identifiers + method renames). */
export const tsReplacements: Replacement[] = [
    // ─── Package moves ─────────────────────────────────────────────────────
    {
        from: '@koobiq/components/navbar-ic',
        to: '@koobiq/components/navbar',
        note: 'navbar-ic package was removed in v20.0.0'
    },
    {
        from: '@koobiq/components/risk-level',
        to: '@koobiq/components/badge',
        note: 'risk-level package was removed in v20.0.0; consult Badge API for color/outline mapping'
    },
    {
        from: '@koobiq/components-experimental/form-field',
        to: '@koobiq/components/form-field',
        note: 'experimental form-field merged back into the main package'
    },

    // ─── Identifier renames (TypeScript imports / type references) ────────
    { from: '\\bRdxAccordionItemState\\b', to: 'KbqAccordionItemState' },
    { from: '\\bKbqCodeFile\\b', to: 'KbqCodeBlockFile' },
    { from: '\\bAnimationCurves\\b', to: 'KbqAnimationCurves' },
    { from: '\\bMeasurementSystem\\b', to: 'KbqMeasurementSystem' },
    { from: '\\bSizeUnitsConfig\\b', to: 'KbqSizeUnitsConfig' },
    { from: '\\bKbqNavbarIcModule\\b', to: 'KbqNavbarModule' },
    { from: '\\bKbqNavbarIcItem\\b', to: 'KbqNavbarItem' },
    { from: '\\bKbqNavbarIcHeader\\b', to: 'KbqNavbarHeader' },
    { from: '\\bKbqNavbarIc\\b', to: 'KbqNavbar' },
    { from: '\\bKbqRiskLevelModule\\b', to: 'KbqBadgeModule' },
    { from: '\\bKbqRiskLevel\\b', to: 'KbqBadge' },
    { from: '\\bKbqWarningTooltipTrigger\\b', to: 'KbqTooltipTrigger' },
    { from: '\\bKbqExtendedTooltipTrigger\\b', to: 'KbqTooltipTrigger' },
    { from: '\\bKbqDatepickerToggle\\b(?!Icon)', to: 'KbqDatepickerToggleIconComponent' },
    { from: '\\bKbqFilterBarSearch\\b', to: 'KbqSearchExpandable' },
    { from: '\\bKbqInputFileLabel\\b', to: '' },
    { from: '\\bKbqInputFile\\b', to: '' },
    { from: '\\bKbqFileValidatorFn\\b', to: '' },
    { from: '\\bKbqValidationOptions\\b', to: '' },
    { from: '\\bKbqFormFieldRef\\b', to: 'KbqFormField' },

    // ─── Tokens / function renames ────────────────────────────────────────
    { from: '\\bKBQ_VALIDATION\\b', to: '' },
    { from: '\\bKBQ_SANITY_CHECKS\\b', to: '' },
    { from: '\\bKBQ_SIDEPANEL_WITH_SHADOW\\b', to: '' },
    { from: '\\bmcSanityChecksFactory\\b', to: '' },
    { from: '\\bKbqCommonModule\\b', to: '' },
    {
        from: '\\btoBoolean\\(',
        to: 'booleanAttribute(',
        ensureImport: { symbol: 'booleanAttribute', from: '@angular/core' }
    },
    {
        from: '\\bisCorrectExtension\\(',
        to: 'FileValidators.isCorrectExtension(',
        ensureImport: { symbol: 'FileValidators', from: '@koobiq/components/file-upload' }
    },
    { from: '\\bformatDataSize\\(', to: 'getFormattedSizeParts(' },

    // ─── Method renames on instances ──────────────────────────────────────
    { from: '\\.openPanel\\(', to: '.open(' },
    { from: '\\.toggleIsCollapsed\\(', to: '.toggle(' },
    { from: '\\.focusViaKeyboard\\(', to: '.focus(' },

    // ─── Modal options object key ─────────────────────────────────────────
    {
        from: '\\bkbqComponentParams:',
        to: 'data:',
        note:
            'kbqComponentParams was renamed to data. The CHILD modal component must read the ' +
            'payload via inject(KBQ_MODAL_DATA) instead of @Input — this rewrite only changes ' +
            'the caller side.'
    }
];

/** Template (HTML / inline-template string) replacements — selectors + attributes. */
export const templateReplacements: Replacement[] = [
    // ─── Selector renames (component tag names) ───────────────────────────
    { from: '<kbq-filter-search([\\s/>])', to: '<kbq-search-expandable$1' },
    { from: '</kbq-filter-search>', to: '</kbq-search-expandable>' },
    { from: '<kbq-datepicker-toggle(?!-icon)([\\s/>])', to: '<kbq-datepicker-toggle-icon$1' },
    { from: '</kbq-datepicker-toggle>', to: '</kbq-datepicker-toggle-icon>' },
    { from: '<kbq-risk-level([\\s/>])', to: '<kbq-badge$1' },
    { from: '</kbq-risk-level>', to: '</kbq-badge>' },
    { from: '<kbq-navbar-ic-item([\\s/>])', to: '<kbq-navbar-item$1' },
    { from: '</kbq-navbar-ic-item>', to: '</kbq-navbar-item>' },
    { from: '<kbq-navbar-ic-header([\\s/>])', to: '<kbq-navbar-header$1' },
    { from: '</kbq-navbar-ic-header>', to: '</kbq-navbar-header>' },
    { from: '<kbq-navbar-ic([\\s/>])', to: '<kbq-navbar$1' },
    { from: '</kbq-navbar-ic>', to: '</kbq-navbar>' },

    // ─── Template-ref exportAs renames ────────────────────────────────────
    { from: '="kbqWarningTooltip"', to: '="kbqTooltip"' },
    { from: '="kbqExtendedTooltip"', to: '="kbqTooltip"' },
    { from: '="kbqDatepickerToggle"', to: '="kbqDatepickerToggleIcon"' },

    // ─── Attribute renames ────────────────────────────────────────────────
    { from: '\\bkbqFormFieldWithoutBorders\\b', to: 'noBorders' },

    // ─── Tooltip warning trigger → kbqTooltip + modifier ───────────────────
    // Two-step: first add modifier attribute, then rename binding key.
    // The modifier insertion must come before the binding rename otherwise we
    // can't tell the legacy directive from the base one. We approximate this
    // by handling the bracketed binding (most common) and the bare-attribute
    // variant separately, prepending `kbqTooltipModifier="warning"` inline.
    {
        from: '\\[kbqWarningTooltip\\]',
        to: 'kbqTooltipModifier="warning" [kbqTooltip]'
    },
    {
        from: '\\[kbqExtendedTooltip\\]',
        to: 'kbqTooltipModifier="extended" [kbqTooltip]'
    },

    // ─── Divider deprecated inset attribute ───────────────────────────────
    { from: '\\s\\[inset\\]="[^"]*"', to: '' },
    { from: '\\sinset(\\s|>|/)', to: '$1' }
];

/** SCSS replacements (CSS class selectors that were renamed at the runtime level). */
export const scssReplacements: Replacement[] = [
    { from: '\\.kbq-risk-level\\b', to: '.kbq-badge' },
    { from: '\\.kbq-navbar-ic\\b', to: '.kbq-navbar' },
    { from: '\\.kbq-filter-search\\b', to: '.kbq-search-expandable' },
    { from: '\\.kbq-datepicker-toggle(?!-icon)\\b', to: '.kbq-datepicker-toggle-icon' },
    { from: '\\.kbq-form-field_without-borders\\b', to: '.kbq-form-field_no-borders' }
];

/**
 * Patterns that we can't safely auto-fix — surface them to the user with file
 * locations so they can migrate manually. Used in `warn` mode only.
 */
export interface WarnPattern {
    pattern: string;
    message: string;
}

export const warnPatterns: WarnPattern[] = [
    {
        pattern: '\\(onSaveAsNew\\)',
        message:
            '(onSaveAsNew) was removed from KbqFilters. Listen to (onSave) and branch on ' +
            "$event.status === 'newFilter' instead. Manual migration required."
    },
    {
        pattern: '\\[customValidation\\]',
        message:
            '[customValidation] / KbqMultipleFileUploadComponent.customValidation was removed. ' +
            'Use FormControl validators (e.g. FileValidators.isCorrectExtension) bound via [formControl] instead.'
    },
    {
        pattern: '\\[errors\\]="[^"]*"',
        message:
            'KbqMultipleFileUploadComponent.errors / KbqSingleFileUploadComponent.errors @Input was removed. ' +
            'Use FormControl.errors instead.'
    },
    {
        pattern: '\\[apps\\]="[^"]*"',
        message:
            'KbqAppSwitcherTrigger.apps @Input was removed. Wrap your apps array in a single ' +
            'KbqAppSwitcherSite and pass it via [sites]="[{ id, name, apps }]".'
    },
    {
        pattern: '\\bkbqComponentParams:',
        message:
            'kbqComponentParams is being rewritten to "data:" — remember the CHILD modal ' +
            "component must read the payload via inject(KBQ_MODAL_DATA) (from '@koobiq/components/modal') " +
            'instead of @Input.'
    }
];
