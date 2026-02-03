import { NgModule } from '@angular/core';
import { IconButtonCustomSizeExample } from './icon-button-custom size/icon-button-custom-size-example';
import { IconButtonSizeExample } from './icon-button-size/icon-button-size-example';
import { IconButtonStyleExample } from './icon-button-style/icon-button-style-example';
import { IconButtonExample } from './icon-button/icon-button-example';

export { IconButtonCustomSizeExample, IconButtonExample, IconButtonSizeExample, IconButtonStyleExample };

const EXAMPLES = [
    IconButtonExample,
    IconButtonSizeExample,
    IconButtonStyleExample,
    IconButtonCustomSizeExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class IconButtonExamplesModule {}
