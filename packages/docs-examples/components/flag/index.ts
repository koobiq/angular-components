import { NgModule } from '@angular/core';
import { FlagAspectRatioExample } from './flag-aspect-ratio/flag-aspect-ratio-example';
import { FlagCircleExample } from './flag-circle/flag-circle-example';
import { FlagCustomRatioExample } from './flag-custom-ratio/flag-custom-ratio-example';
import { FlagFallbackExample } from './flag-fallback/flag-fallback-example';
import { FlagLanguageExample } from './flag-language/flag-language-example';
import { FlagOverviewExample } from './flag-overview/flag-overview-example';
import { FlagSizesExample } from './flag-sizes/flag-sizes-example';
import { FlagSquareExample } from './flag-square/flag-square-example';
import { FlagStylizedExample } from './flag-stylized/flag-stylized-example';

export {
    FlagAspectRatioExample,
    FlagCircleExample,
    FlagCustomRatioExample,
    FlagFallbackExample,
    FlagLanguageExample,
    FlagOverviewExample,
    FlagSizesExample,
    FlagSquareExample,
    FlagStylizedExample
};

const EXAMPLES = [
    FlagOverviewExample,
    FlagCustomRatioExample,
    FlagAspectRatioExample,
    FlagSquareExample,
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
