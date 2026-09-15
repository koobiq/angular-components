/** The control whose handler this migration removes. */
export const CLEANER_ELEMENT = 'kbq-cleaner';

/** Only a cleaner projected into a tag list is affected — elsewhere `(click)` still means what it did. */
export const TAG_LIST_ELEMENT = 'kbq-tag-list';

/** Every spelling of the click binding the Angular parser keeps verbatim in the attribute name. */
export const CLICK_ATTRIBUTES = ['(click)', 'on-click'];

/** The output the built-in clearing goes through; without it there is nothing to take the handler's place. */
export const REMOVED_ATTRIBUTES = ['(removed)', 'on-removed'];

/** A list that refuses removal no longer shows a reset control at all. */
export const REMOVABLE_ATTRIBUTES = ['removable', '[removable]', 'bind-removable'];

export const removedHandlerMessage = (
    filePath: string,
    attribute: string,
    expression: string,
    fix: boolean
): string[] => [
    `  ${fix ? 'removed' : 'would remove'} ${attribute}="${expression}" from <${CLEANER_ELEMENT}> — the tag list clears itself now.`,
    `  If the handler did anything besides clearing the tags, put that part back. File: ${filePath}`
];

export const keptHandlerMessage = (
    filePath: string,
    attribute: string,
    expression: string,
    reason: string
): string[] => [
    `  kept ${attribute}="${expression}" on <${CLEANER_ELEMENT}>: ${reason}`,
    `  Removing it would leave the control with nothing behind it. Fix the list, then drop the handler by hand. File: ${filePath}`
];

export const NO_REMOVED_BINDING_REASON =
    'no tag in the list reports `removed`, so the built-in clearing reaches nothing';

export const REFUSES_REMOVAL_REASON = `the list is removable="false", so it no longer shows a reset control at all`;

export const UNPARSEABLE_TEMPLATE_MESSAGE = `Template could not be parsed, so it was left untouched. Check its <${CLEANER_ELEMENT}> handlers by hand.`;

export const BEHAVIOUR_NOTE = [
    `Note: the reset control of a ${TAG_LIST_ELEMENT} now removes the tags itself and leaves the disabled`,
    'ones in place. It removes them through the same `removed` output as the remove control inside a tag, so',
    'the wiring that control already needs is all it takes. A handler left on the cleaner runs in addition to',
    'that, and cannot suppress it. To clear the disabled tags too, bind a predicate that accepts them:',
    'clearEverything = () => true; on the class, [clearPredicate]="clearEverything" on the list.'
];
