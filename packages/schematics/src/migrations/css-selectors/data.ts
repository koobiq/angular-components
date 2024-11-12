export interface ReplaceData {
    replace: string;
    replaceWith: string;
    comment?: string;
}

export const cssSelectorsReplacement: ReplaceData[] = [
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
