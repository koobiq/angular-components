import { InjectionToken } from '@angular/core';


/**
 * Checkbox click action when user click on input element.
 * noop: Do not toggle checked or indeterminate.
 * check: Only toggle checked status, ignore indeterminate.
 * check-indeterminate: Toggle checked status, set indeterminate to false. Default behavior.
 * undefined: Same as `check-indeterminate`.
 */
export type KbqCheckboxClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined;

/**
 * Injection token that can be used to specify the checkbox click behavior.
 */
export const KBQ_CHECKBOX_CLICK_ACTION =
    new InjectionToken<KbqCheckboxClickAction>('kbq-checkbox-click-action');
