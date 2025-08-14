import { NgModule } from '@angular/core';
import { DynamicTranslationOverviewExample } from './dynamic-translation-overview/dynamic-translation-overview-example';
import { DynamicTranslationWithDynamicComponentCreationExample } from './dynamic-translation-with-dynamic-component-creation/dynamic-translation-with-dynamic-component-creation-example';

export { DynamicTranslationOverviewExample, DynamicTranslationWithDynamicComponentCreationExample };

const EXAMPLES = [DynamicTranslationOverviewExample, DynamicTranslationWithDynamicComponentCreationExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DynamicTranslationExamplesModule {}
