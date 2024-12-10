import { NgModule } from '@angular/core';
import { CodeBlockWithCustomLocaleConfigurationExample } from './code-block-with-custom-locale-configuration/code-block-with-custom-locale-configuration-example';
import { CodeBlockWithFilledExample } from './code-block-with-filled/code-block-with-filled-example';
import { CodeBlockWithLineNumbersExample } from './code-block-with-line-numbers/code-block-with-line-numbers-example';
import { CodeBlockWithMaxHeightExample } from './code-block-with-max-height/code-block-with-max-height-example';
import { CodeBlockWithNoborderExample } from './code-block-with-noborder/code-block-with-noborder-example';
import { CodeBlockWithSoftWrapExample } from './code-block-with-soft-wrap/code-block-with-soft-wrap-example';
import { CodeBlockWithTabsExample } from './code-block-with-tabs/code-block-with-tabs-example';

export {
    CodeBlockWithCustomLocaleConfigurationExample,
    CodeBlockWithFilledExample,
    CodeBlockWithLineNumbersExample,
    CodeBlockWithMaxHeightExample,
    CodeBlockWithNoborderExample,
    CodeBlockWithSoftWrapExample,
    CodeBlockWithTabsExample
};

const EXAMPLES = [
    CodeBlockWithSoftWrapExample,
    CodeBlockWithTabsExample,
    CodeBlockWithMaxHeightExample,
    CodeBlockWithFilledExample,
    CodeBlockWithNoborderExample,
    CodeBlockWithLineNumbersExample,
    CodeBlockWithCustomLocaleConfigurationExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class CodeBlockExamplesModule {}
