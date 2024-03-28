import { InjectionToken } from '@angular/core';


export { KbqCommonModule, KBQ_SANITY_CHECKS } from './common-module';
export { CanDisable, CanDisableCtor, mixinDisabled } from './disabled';
export { CanColor, CanColorCtor, mixinColor, ThemePalette, KbqComponentColors } from './color';
export { HasTabIndex, HasTabIndexCtor, mixinTabIndex } from './tabindex';
export { CanUpdateErrorStateCtor, CanUpdateErrorState, mixinErrorState } from './error-state';

export const KBQ_PARENT_ANIMATION_COMPONENT = new InjectionToken<any>('kbq-parent-animation-component');
