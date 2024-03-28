/**
 * Throws an exception for the case when dropdown trigger doesn't have a valid kbq-dropdown instance
 * @docs-private
 */
export function throwKbqDropdownMissingError() {
    throw Error(`kbqDropdownTriggerFor: must pass in an kbq-dropdown instance.
    Example:
      <kbq-dropdown #dropdown="kbqDropdown"></kbq-dropdown>
      <button [kbqDropdownTriggerFor]="dropdown"></button>`);
}

/**
 * Throws an exception for the case when dropdown's x-position value isn't valid.
 * In other words, it doesn't match 'before' or 'after'.
 * @docs-private
 */
export function throwKbqDropdownInvalidPositionX() {
    throw Error(`xPosition value must be either 'before' or after'.
      Example: <kbq-dropdown [xPosition]="'before'" #dropdown="kbqDropdown"></kbq-dropdown>`);
}

/**
 * Throws an exception for the case when dropdown's y-position value isn't valid.
 * In other words, it doesn't match 'above' or 'below'.
 * @docs-private
 */
export function throwKbqDropdownInvalidPositionY() {
    throw Error(`yPosition value must be either 'above' or below'.
      Example: <kbq-dropdown [yPosition]="'above'" #dropdown="kbqDropdown"></kbq-dropdown>`);
}
