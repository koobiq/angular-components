import { NgModule } from '@angular/core';
import { FlagAccessibilityExample } from './flag-accessibility/flag-accessibility-example';
import { FlagCircleExample } from './flag-circle/flag-circle-example';
import { FlagFallbackExample } from './flag-fallback/flag-fallback-example';
import { FlagLanguageExample } from './flag-language/flag-language-example';
import { FlagOverviewExample } from './flag-overview/flag-overview-example';
import { FlagShadowExample } from './flag-shadow/flag-shadow-example';
import { FlagSizesExample } from './flag-sizes/flag-sizes-example';
import { FlagSquareExample } from './flag-square/flag-square-example';
import { FlagStylizedExample } from './flag-stylized/flag-stylized-example';

export {
    FlagAccessibilityExample,
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
    FlagSquareExample,
    FlagShadowExample,
    FlagLanguageExample,
    FlagFallbackExample,
    FlagAccessibilityExample,
    FlagStylizedExample,
    FlagCircleExample,
    FlagSizesExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class FlagExamplesModule {}
