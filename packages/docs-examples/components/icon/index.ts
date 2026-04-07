import { NgModule } from '@angular/core';
import { IconButtonCustomSizeExample } from './icon-button-custom size/icon-button-custom-size-example';
import { IconButtonOverviewExample } from './icon-button-overview/icon-button-overview-example';
import { IconButtonSizeExample } from './icon-button-size/icon-button-size-example';
import { IconButtonStyleExample } from './icon-button-style/icon-button-style-example';
import { IconItemColorExample } from './icon-item-color/icon-item-color-example';
import { IconItemOverviewExample } from './icon-item-overview/icon-item-overview-example';
import { IconItemSizeExample } from './icon-item-size/icon-item-size-example';
import { IconItemVariantExample } from './icon-item-variant/icon-item-variant-example';

export {
    IconButtonCustomSizeExample,
    IconButtonOverviewExample,
    IconButtonSizeExample,
    IconButtonStyleExample,
    IconItemColorExample,
    IconItemOverviewExample,
    IconItemSizeExample,
    IconItemVariantExample
};

const EXAMPLES = [
    IconButtonOverviewExample,
    IconButtonSizeExample,
    IconButtonStyleExample,
    IconButtonCustomSizeExample,
    IconItemOverviewExample,
    IconItemColorExample,
    IconItemSizeExample,
    IconItemVariantExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class IconExamplesModule {}
