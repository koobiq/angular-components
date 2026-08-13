import { NgModule } from '@angular/core';
import { ThemeCssVariablesExample } from './theme-css-variables/theme-css-variables-example';
import { ThemeStaticSelectionExample } from './theme-static-selection/theme-static-selection-example';

export { ThemeCssVariablesExample, ThemeStaticSelectionExample };

const EXAMPLES = [ThemeCssVariablesExample, ThemeStaticSelectionExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ThemeExamplesModule {}
