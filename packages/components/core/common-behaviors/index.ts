import { InjectionToken } from '@angular/core';

export * from './autofill';
export * from './checkable';
export * from './checkbox';
export * from './clipboard';
export { CanColor, KbqColorDirective, KbqComponentColors, ThemePalette } from './color';
export { CanUpdateErrorState, KbqErrorStateTracker } from './error-state';
export * from './flex';
export * from './hover';
export * from './orientation';
export * from './read-state';
export { KbqDefaultSizes } from './size';

export const KBQ_PARENT_ANIMATION_COMPONENT = new InjectionToken<any>('kbq-parent-animation-component');
