import { NgModule } from '@angular/core';
import { IconButtonSizeExample } from './icon-button-size/icon-button-size-example';
import { IconButtonStyleExample } from './icon-button-style/icon-button-style-example';
import { IconButtonExample } from './icon-button/icon-button-example';

export { IconButtonExample, IconButtonSizeExample, IconButtonStyleExample };

const EXAMPLES = [
    IconButtonExample,
    IconButtonSizeExample,
    IconButtonStyleExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class IconButtonExamplesModule {}
