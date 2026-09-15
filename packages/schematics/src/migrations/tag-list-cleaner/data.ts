/** The control whose handler this migration removes. */
export const CLEANER_ELEMENT = 'kbq-cleaner';

/** Only a cleaner projected into a tag list is affected — elsewhere `(click)` still means what it did. */
export const TAG_LIST_ELEMENT = 'kbq-tag-list';

/** Every spelling of the click binding the Angular parser keeps verbatim in the attribute name. */
export const CLICK_ATTRIBUTES = ['(click)', 'on-click'];

export const removedHandlerMessage = (filePath: string, expression: string): string[] => [
    `  removed (click)="${expression}" from <${CLEANER_ELEMENT}> — the tag list clears itself now.`,
    `  If the handler did anything besides clearing the tags, put that part back. File: ${filePath}`
];

export const UNPARSEABLE_TEMPLATE_MESSAGE = `Template could not be parsed, so it was left untouched. Check its <${CLEANER_ELEMENT}> handlers by hand.`;

export const BEHAVIOUR_NOTE = [
    `Note: the reset control of a ${TAG_LIST_ELEMENT} now removes the tags itself and leaves the disabled`,
    'ones in place. It removes them through the same `removed` output as the remove control inside a tag, so',
    'the wiring that control already needs is all it takes. A handler left on the cleaner runs in addition to',
    'that, and cannot suppress it. To clear the disabled tags too, set [clearPredicate]="() => true" on the list.'
];
