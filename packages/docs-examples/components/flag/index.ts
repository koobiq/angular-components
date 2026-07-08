import { NgModule } from '@angular/core';
import { FlagAspectRatioExample } from './flag-aspect-ratio/flag-aspect-ratio-example';
import { FlagCircleExample } from './flag-circle/flag-circle-example';
import { FlagFallbackExample } from './flag-fallback/flag-fallback-example';
import { FlagLanguageExample } from './flag-language/flag-language-example';
import { FlagOverviewExample } from './flag-overview/flag-overview-example';
import { FlagShadowExample } from './flag-shadow/flag-shadow-example';
import { FlagSizesExample } from './flag-sizes/flag-sizes-example';
import { FlagSquareExample } from './flag-square/flag-square-example';
import { FlagStylizedExample } from './flag-stylized/flag-stylized-example';

export {
    FlagAspectRatioExample,
    FlagCircleExample,
    FlagFallbackExample,
    FlagLanguageExample,
    FlagOverviewExample,
    FlagShadowExample,
    FlagSizesExample,
    FlagSquareExample,
    FlagStylizedExample
};

const EXAMPLES = [
    FlagOverviewExample,
    FlagAspectRatioExample,
    FlagSquareExample,
    FlagShadowExample,
    FlagLanguageExample,
    FlagFallbackExample,
    FlagStylizedExample,
    FlagCircleExample,
    FlagSizesExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FlagExamplesModule {}
