import { NgModule } from '@angular/core';
import { KbqDynamicTranslation, KbqDynamicTranslationHelper, KbqDynamicTranslationSlot } from './dynamic-translation';

const COMPONENTS = [
    KbqDynamicTranslationSlot,
    KbqDynamicTranslationHelper,
    KbqDynamicTranslation
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqDynamicTranslationModule {}
