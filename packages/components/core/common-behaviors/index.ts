import { InjectionToken } from '@angular/core';

export * from './checkbox';
export * from './clipboard';
export { CanColor, CanColorCtor, KbqColorDirective, KbqComponentColors, mixinColor, ThemePalette } from './color';
export { KBQ_SANITY_CHECKS, KbqCommonModule } from './common-module';
export { CanDisable, CanDisableCtor, mixinDisabled } from './disabled';
export { CanUpdateErrorState, CanUpdateErrorStateCtor, KbqErrorStateTracker, mixinErrorState } from './error-state';
export * from './focus-monitor';
export * from './hover';
export * from './orientation';
export * from './read-state';
export { KbqDefaultSizes } from './size';
export { HasTabIndex, HasTabIndexCtor, mixinTabIndex } from './tabindex';

export const KBQ_PARENT_ANIMATION_COMPONENT = new InjectionToken<any>('kbq-parent-animation-component');
