import { InjectionToken } from '@angular/core';

export { CanColor, CanColorCtor, KbqComponentColors, ThemePalette, mixinColor } from './color';
export { KBQ_SANITY_CHECKS, KbqCommonModule } from './common-module';
export { CanDisable, CanDisableCtor, mixinDisabled } from './disabled';
export { CanUpdateErrorState, CanUpdateErrorStateCtor, mixinErrorState } from './error-state';
export { HasTabIndex, HasTabIndexCtor, mixinTabIndex } from './tabindex';

export const KBQ_PARENT_ANIMATION_COMPONENT = new InjectionToken<any>('kbq-parent-animation-component');
