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
    throw Error(`xPosition value must be either 'before', 'after', or 'center'.
      Example: <kbq-dropdown [xPosition]="'center'" #dropdown="kbqDropdown"></kbq-dropdown>`);
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

/**
 * Throws an exception for the case when `kbqDropdownSearch` is applied to a form field that doesn't
 * host a `kbqInput`.
 * @docs-private
 */
export function throwKbqDropdownSearchMissingInputError() {
    throw Error(`kbqDropdownSearch: must be applied to a kbq-form-field containing an input[kbqInput].
    Example:
      <kbq-form-field kbqDropdownSearch>
          <input kbqInput [formControl]="control" />
      </kbq-form-field>`);
}

/**
 * Throws an exception for the case when `kbqDropdownSearch`'s input isn't bound to a form control, so
 * there is no query to react to.
 * @docs-private
 */
export function throwKbqDropdownSearchMissingNgControlError() {
    throw Error(`kbqDropdownSearch: the input must be bound to a form control.
    Example:
      <kbq-form-field kbqDropdownSearch>
          <input kbqInput [formControl]="control" />
      </kbq-form-field>`);
}
