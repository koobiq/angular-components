import { NgModule } from '@angular/core';
import { DynamicTranslationOverviewExample } from './dynamic-translation-overview/dynamic-translation-overview-example';

export { DynamicTranslationOverviewExample };

const EXAMPLES = [DynamicTranslationOverviewExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class DynamicTranslationExamplesModule {}
