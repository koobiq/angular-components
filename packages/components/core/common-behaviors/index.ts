import { InjectionToken, OutputRef } from '@angular/core';

export * from './autofill';
export * from './checkable';
export * from './checkbox';
export * from './clipboard';
export { KbqColorDirective, KbqComponentColors } from './color';
export { CanUpdateErrorState, KbqErrorStateTracker } from './error-state';
export * from './flex';
export * from './orientation';
export * from './read-state';
export { KbqDefaultSizes } from './size';

/**
 * A parent whose content changes size once its animation ends, such as a tab group.
 * @docs-private
 */
export const KBQ_PARENT_ANIMATION_COMPONENT = new InjectionToken<{ readonly animationDone: OutputRef<void> }>(
    'kbq-parent-animation-component'
);
