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
    /**
     * When this replacement matches in a .ts file, strip `symbol` from any
     * existing `import { … } from 'from'` named-import clause. Used for
     * rewrites whose source symbol no longer exists in v20.0.0 — leaving the
     * stale import would otherwise break compilation of the migrated file.
     */
    removeImport?: { symbol: string; from: string };
}

/** TypeScript-source replacements (imports + identifiers + method renames). */
export const tsReplacements: Replacement[] = [
    // ─── Package moves ─────────────────────────────────────────────────────
    // @koobiq/cdk was merged into @koobiq/components/core in v20.0.0.
    // Order matters: subpath rules must run before any bare-prefix rule.
    {
        from: '@koobiq/cdk/a11y',
        to: '@koobiq/components/core',
        note: '@koobiq/cdk package was merged into @koobiq/components/core in v20.0.0'
    },
    {
        from: '@koobiq/cdk/keycodes',
        to: '@koobiq/components/core',
        note: '@koobiq/cdk package was merged into @koobiq/components/core in v20.0.0'
    },
    {
        from: '@koobiq/cdk/testing',
        to: '@koobiq/components/core',
        note: '@koobiq/cdk package was merged into @koobiq/components/core in v20.0.0'
    },
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
    {
        from: '\\bKbqInputFileLabel\\b',
        to: '',
        removeImport: { symbol: 'KbqInputFileLabel', from: '@koobiq/components/file-upload' }
    },
    {
        from: '\\bKbqInputFile\\b',
        to: '',
        removeImport: { symbol: 'KbqInputFile', from: '@koobiq/components/file-upload' }
    },
    {
        from: '\\bKbqFileValidatorFn\\b',
        to: '',
        removeImport: { symbol: 'KbqFileValidatorFn', from: '@koobiq/components/file-upload' }
    },
    {
        from: '\\bKbqValidationOptions\\b',
        to: '',
        removeImport: { symbol: 'KbqValidationOptions', from: '@koobiq/components/core' }
    },
    { from: '\\bKbqFormFieldRef\\b', to: 'KbqFormField' },

    // Deprecated dropdown position type aliases → Kbq-prefixed names. The
    // `\b…\b` boundaries make these idempotent: `KbqDropdownPositionX` is not
    // re-matched because the `D` is preceded by a word char (`q`).
    { from: '\\bDropdownPositionX\\b', to: 'KbqDropdownPositionX' },
    { from: '\\bDropdownPositionY\\b', to: 'KbqDropdownPositionY' },

    // ─── Tokens / function renames ────────────────────────────────────────
    {
        from: '\\bKBQ_VALIDATION\\b',
        to: '',
        removeImport: { symbol: 'KBQ_VALIDATION', from: '@koobiq/components/core' }
    },
    {
        from: '\\bKBQ_SANITY_CHECKS\\b',
        to: '',
        removeImport: { symbol: 'KBQ_SANITY_CHECKS', from: '@koobiq/components/core' }
    },
    {
        from: '\\bKBQ_SIDEPANEL_WITH_SHADOW\\b',
        to: '',
        removeImport: { symbol: 'KBQ_SIDEPANEL_WITH_SHADOW', from: '@koobiq/components/sidepanel' }
    },
    {
        from: '\\bmcSanityChecksFactory\\b',
        to: '',
        removeImport: { symbol: 'mcSanityChecksFactory', from: '@koobiq/components/core' }
    },
    {
        from: '\\bKbqCommonModule\\b',
        to: '',
        removeImport: { symbol: 'KbqCommonModule', from: '@koobiq/components/core' }
    },
    {
        // No-op shim kept after the KbqValidateDirective removal in v20.0.0 is
        // gone in this release. Strip the call, its trailing comma, and the
        // import; the array/empty-providers cleanup happens via the extended
        // `[ , … ]` / `[ … , ]` normalize pass in the driver.
        from: '\\bkbqDisableLegacyValidationDirectiveProvider\\(\\s*\\),?\\s*',
        to: '',
        note:
            'kbqDisableLegacyValidationDirectiveProvider was a no-op shim kept after the ' +
            'KbqValidateDirective removal in v20.0.0; it is removed in this release. ' +
            'You may also need to remove the (now-empty) `providers: []` key from the affected decorator.',
        removeImport: {
            symbol: 'kbqDisableLegacyValidationDirectiveProvider',
            from: '@koobiq/components/core'
        }
    },
    {
        from: '\\btoBoolean\\(',
        to: 'booleanAttribute(',
        ensureImport: { symbol: 'booleanAttribute', from: '@angular/core' },
        removeImport: { symbol: 'toBoolean', from: '@koobiq/components/core' }
    },
    {
        from: '\\bisCorrectExtension\\(',
        to: 'FileValidators.isCorrectExtension(',
        ensureImport: { symbol: 'FileValidators', from: '@koobiq/components/file-upload' },
        removeImport: { symbol: 'isCorrectExtension', from: '@koobiq/components/file-upload' }
    },
    {
        from: '\\bformatDataSize\\(',
        to: 'getFormattedSizeParts(',
        removeImport: { symbol: 'formatDataSize', from: '@koobiq/components/core' }
    },

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

    // ─── Static-attribute tooltip form ────────────────────────────────────
    // `<span kbqWarningTooltip="text">` (plain attribute, not a binding) must
    // become `<span kbqTooltipModifier="warning" kbqTooltip="text">`. These
    // rules MUST precede the `="kbqWarningTooltip"` exportAs rule below — the
    // exportAs regex would otherwise rewrite the attribute name's `="..."`
    // suffix and turn `kbqWarningTooltip="text"` into the wrong shape.
    {
        from: '\\bkbqWarningTooltip="([^"]*)"',
        to: 'kbqTooltipModifier="warning" kbqTooltip="$1"'
    },
    {
        from: '\\bkbqExtendedTooltip="([^"]*)"',
        to: 'kbqTooltipModifier="extended" kbqTooltip="$1"'
    },

    // ─── Template-ref exportAs renames ────────────────────────────────────
    { from: '="kbqWarningTooltip"', to: '="kbqTooltip"' },
    { from: '="kbqExtendedTooltip"', to: '="kbqTooltip"' },
    { from: '="kbqDatepickerToggle"', to: '="kbqDatepickerToggleIcon"' },

    // ─── Attribute renames ────────────────────────────────────────────────
    { from: '\\bkbqFormFieldWithoutBorders\\b', to: 'noBorders' },

    // ─── KbqFilterBarSearch inputs → KbqSearchExpandable inputs ───────────
    // The selector rewrite above only renames the tag: without these the inputs
    // of the removed KbqFilterBarSearch survive as attributes the new component
    // does not have. Scoped to the attribute forms (`[x]` binding, `x="…"`
    // static, bare attribute) so the identifiers elsewhere are never touched.
    // The bare `emitValueByEnter` and the everyday word `tooltip` are additionally anchored to an
    // opening `<kbq-search-expandable` tag — already renamed by the selector rule above. Template
    // replacements run over the whole text of every `.ts` file, so an unanchored rule would also
    // rewrite TypeScript expressions such as `this.emitValueByEnter && …`.
    { from: '\\[emitValueByEnter\\]', to: '[isEmitValueByEnterEnabled]' },
    { from: '\\bemitValueByEnter="', to: 'isEmitValueByEnterEnabled="' },
    { from: '(<kbq-search-expandable\\b[^>]*?\\s)emitValueByEnter(?![\\w-])', to: '$1isEmitValueByEnterEnabled' },
    { from: '\\[onSearchTimeout\\]', to: '[emitValueTimeout]' },
    { from: '\\bonSearchTimeout="', to: 'emitValueTimeout="' },
    { from: '(<kbq-search-expandable\\b[^>]*?\\s)\\[tooltip\\]', to: '$1[tooltipText]' },
    { from: '(<kbq-search-expandable\\b[^>]*?\\s)tooltip="', to: '$1tooltipText="' },

    // ─── KbqCodeBlock deprecated input renames ────────────────────────────
    // Scoped strictly to the attribute form (`[x]` binding or `x="…"` static)
    // so the common words `canDownload` / `files` elsewhere are never touched.
    { from: '\\[canLoad\\]', to: '[canDownload]' },
    { from: '\\bcanLoad="', to: 'canDownload="' },
    { from: '\\[codeFiles\\]', to: '[files]' },
    { from: '\\bcodeFiles="', to: 'files="' },

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
    },
    {
        pattern: '\\bscrollableCodeContent\\b',
        message:
            'KbqCodeBlock.scrollableCodeContent is deprecated; use the scrollTo() method instead. Manual migration required.'
    },
    {
        pattern: '\\.canLoad\\b|\\.codeFiles\\b',
        message:
            'KbqCodeBlock.canLoad → canDownload and .codeFiles → files. Template bindings are auto-migrated; ' +
            'update any programmatic (TypeScript) access manually.'
    },
    {
        pattern: '\\[initialValue\\]|\\binitialValue="',
        message:
            'KbqFilterBarSearch.initialValue has no counterpart in kbq-search-expandable: the component ' +
            'is a form control with no separate value input. Seed the bound [formControl] / [(ngModel)] ' +
            'with the value instead. Manual migration required.'
    },
    {
        pattern: '\\(onSearch\\)',
        message:
            'KbqFilterBarSearch.onSearch was removed. kbq-search-expandable reports the query through its ' +
            'form binding — read the bound control (valueChanges) instead. Manual migration required.'
    },
    {
        // Everything but the element form, which the template replacements above rewrite: a leading `<` or
        // `</` is the tag, a leading `.` the stylesheet class the scss replacements handle.
        pattern: '(?<![</.\\w-])kbq-filter-search\\b',
        message:
            'KbqFilterBarSearch also matched as an attribute (<div kbq-filter-search>), which ' +
            'kbq-search-expandable does not: its selector is element-only, so the attribute would silently ' +
            'match nothing after the upgrade. Replace the host element with <kbq-search-expandable> by hand. ' +
            'Manual migration required.'
    },
    {
        pattern: '<kbq-filter-search\\b',
        message:
            'KbqFilterBarSearch.onSearchTimeout defaulted to 0 while kbq-search-expandable.emitValueTimeout ' +
            'defaults to 200: markup that never set the timeout emitted on every keystroke and now waits ' +
            '200ms. The rename itself is auto-migrated — add [emitValueTimeout]="0" to keep the old timing.'
    },
    {
        pattern: '\\brequired:\\s*(true|false)',
        message:
            'KbqFilter.required is deprecated — use cleanable = false and removable = false instead. ' +
            'NOTE: this warning is best-effort and may match unrelated `required:` keys; verify it is a KbqFilter config.'
    }
];
