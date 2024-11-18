export interface ReplaceData {
    replace: string;
    replaceWith: string;
}

export const typographyCssSelectorsReplacement: ReplaceData[] = [
    { replace: 'kbq-display-1-strong', replaceWith: 'kbq-display-big-strong' },
    { replace: 'kbq-display-2-strong', replaceWith: 'kbq-display-normal-strong' },
    { replace: 'kbq-display-3-strong', replaceWith: 'kbq-display-compact-strong' },
    { replace: 'kbq-body-tabular', replaceWith: 'kbq-tabular-big' },
    { replace: 'kbq-body-strong', replaceWith: 'kbq-text-big-strong' },
    { replace: 'kbq-body-mono-strong', replaceWith: 'kbq-mono-big-strong' },
    { replace: 'kbq-body-mono', replaceWith: 'kbq-mono-big' },
    { replace: 'kbq-body-caps', replaceWith: 'kbq-caps-big' },
    { replace: 'kbq-caption-tabular', replaceWith: 'kbq-tabular-normal' },
    { replace: 'kbq-caption-strong', replaceWith: 'kbq-text-normal-strong' },
    { replace: 'kbq-caption-mono-strong', replaceWith: 'kbq-mono-normal-strong' },
    { replace: 'kbq-caption-mono', replaceWith: 'kbq-mono-normal' },
    { replace: 'kbq-caption-caps', replaceWith: 'kbq-caps-normal' },
    { replace: 'kbq-extra-small-text-strong', replaceWith: 'kbq-text-compact-strong' },
    { replace: 'kbq-extra-small-text-mono', replaceWith: 'kbq-mono-compact' },
    { replace: 'kbq-extra-small-text-caps', replaceWith: 'kbq-caps-compact' },
    { replace: 'kbq-display-1', replaceWith: 'kbq-display-big' },
    { replace: 'kbq-display-2', replaceWith: 'kbq-display-normal' },
    { replace: 'kbq-display-3', replaceWith: 'kbq-display-compact' },
    { replace: 'kbq-body', replaceWith: 'kbq-text-big' },
    { replace: 'kbq-caption', replaceWith: 'kbq-text-normal' },
    { replace: 'kbq-extra-small-text', replaceWith: 'kbq-text-compact' }
];

export const colorsVarsReplacement: ReplaceData[] = [
    /* NEUTRAL */
    { replace: 'neutral-white', replaceWith: '<remove from project>' },
    /* BRAND */
    { replace: 'brand-default', replaceWith: '<remove from project>' },
    { replace: 'brand-palette', replaceWith: '<remove from project>' },
    /* INFO */
    { replace: 'info-default', replaceWith: '<remove from project>' },
    /* BACKGROUND */
    { replace: 'background-background-disabled', replaceWith: 'states-background-disabled' },
    { replace: 'background-background-less-contrast', replaceWith: 'states-background-secondary' },
    { replace: 'background-background-under', replaceWith: 'states-background-secondary' },
    { replace: 'background-background', replaceWith: 'background-bg' },
    { replace: 'background-overlay-hover', replaceWith: 'states-background-transparent-hover' },
    { replace: 'background-overlay-active', replaceWith: 'states-background-transparent-active' },
    { replace: 'background-overlay-disabled', replaceWith: 'states-background-transparent-disabled' },
    /* FOREGROUND */
    { replace: 'foreground-text-less-contrast', replaceWith: 'foreground-contrast-fade' },
    { replace: 'foreground-text-disabled', replaceWith: 'states-foreground-disabled' },
    { replace: 'foreground-text-error', replaceWith: 'foreground-contrast-fade' },
    { replace: 'foreground-text-success', replaceWith: 'foreground-success' },
    { replace: 'foreground-divider', replaceWith: 'line-contrast-less' },
    { replace: 'foreground-text', replaceWith: 'foreground-contrast' },
    { replace: 'foreground-icon', replaceWith: 'icon-contrast' },
    { replace: 'foreground-border', replaceWith: 'line-contrast-fade' },
    /* STATES */
    { replace: 'states-background-ghost-hover', replaceWith: 'states-background-transparent-hover' },
    { replace: 'states-background-ghost-active', replaceWith: 'states-background-transparent-active' },
    /* ICON */
    { replace: 'states-focused-color-error', replaceWith: '<remove from project>' },
    { replace: 'states-focused-color', replaceWith: '<remove from project>' },
    { replace: 'states-selected-color', replaceWith: '<remove from project>' },
    { replace: 'states-pressed-shadow', replaceWith: '<remove from project>' },
    { replace: 'states-pressed-shadow', replaceWith: '<remove from project>' },
    { replace: 'others-brand', replaceWith: '<remove from project>' }
];
