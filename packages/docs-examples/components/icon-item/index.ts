import { NgModule } from '@angular/core';
import { IconItemColorExample } from './icon-item-color/icon-item-color-example';
import { IconItemDefaultExample } from './icon-item-default/icon-item-default-example';
import { IconItemSizeExample } from './icon-item-size/icon-item-size-example';
import { IconItemVariantExample } from './icon-item-variant/icon-item-variant-example';

export { IconItemColorExample, IconItemDefaultExample, IconItemSizeExample, IconItemVariantExample };

const EXAMPLES = [
    IconItemDefaultExample,
    IconItemColorExample,
    IconItemSizeExample,
    IconItemVariantExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class AlertExamplesModule {}
