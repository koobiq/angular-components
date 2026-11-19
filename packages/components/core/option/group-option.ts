import { InjectionToken } from '@angular/core';

/**
 * An option a `kbq-optgroup` can count: the group queries the projected content by this token, since
 * a query by `KbqOption` would both cycle `option.ts` with `optgroup.ts` and miss its subclasses.
 * `KbqOption` provides itself; a subclass with its own decorator repeats the provider (Angular does
 * not inherit providers), the way `KbqTimezoneOption` does.
 */
export interface KbqGroupOption {
    /** Whether the option is selected. */
    readonly selected: boolean;
}

/** Identifies a {@link KbqGroupOption}. */
export const KBQ_GROUP_OPTION = new InjectionToken<KbqGroupOption>('KbqGroupOption');
