import { NgModule } from '@angular/core';
import { ThemeStaticSelectionExample } from './theme-static-selection/theme-static-selection-example';

export { ThemeStaticSelectionExample };

const EXAMPLES = [ThemeStaticSelectionExample];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ThemeExamplesModule {}
