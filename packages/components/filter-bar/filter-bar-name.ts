import { isSignal } from '@angular/core';
import type { KbqFilterBarName } from './filter-bar.types';

/**
 * Resolves a filter-bar name for rendering: a plain string is returned as is, a `Signal<string>` is read,
 * and a missing value becomes an empty string. The built-in pipes call it in their templates, so a
 * translation change re-renders the label without replacing the pipe, its value or the filter.
 *
 * @param name A plain name, a name signal, or a missing name.
 * @returns The current name, or an empty string when `name` is `null` or `undefined`.
 */
export function kbqResolveFilterBarName(name: KbqFilterBarName | null | undefined): string {
    const resolved = isSignal(name) ? name() : name;

    return typeof resolved === 'string' ? resolved : '';
}
