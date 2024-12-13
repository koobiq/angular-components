import { NgModule } from '@angular/core';
import { CodeBlockWithCustomLocaleConfigurationExample } from './code-block-with-custom-locale-configuration/code-block-with-custom-locale-configuration-example';
import { CodeBlockWithFilledExample } from './code-block-with-filled/code-block-with-filled-example';
import { CodeBlockWithLineNumbersExample } from './code-block-with-line-numbers/code-block-with-line-numbers-example';
import { CodeBlockWithLinkExample } from './code-block-with-link/code-block-with-link-example';
import { CodeBlockWithMaxHeightExample } from './code-block-with-max-height/code-block-with-max-height-example';
import { CodeBlockWithNoBorderExample } from './code-block-with-no-border/code-block-with-no-border-example';
import { CodeBlockWithSoftWrapExample } from './code-block-with-soft-wrap/code-block-with-soft-wrap-example';
import { CodeBlockWithTabsAndShadowExample } from './code-block-with-tabs-and-shadow/code-block-with-tabs-and-shadow-example';
import { CodeBlockWithTabsExample } from './code-block-with-tabs/code-block-with-tabs-example';

export {
    CodeBlockWithCustomLocaleConfigurationExample,
    CodeBlockWithFilledExample,
    CodeBlockWithLineNumbersExample,
    CodeBlockWithLinkExample,
    CodeBlockWithMaxHeightExample,
    CodeBlockWithNoBorderExample,
    CodeBlockWithSoftWrapExample,
    CodeBlockWithTabsAndShadowExample,
    CodeBlockWithTabsExample
};

const EXAMPLES = [
    CodeBlockWithSoftWrapExample,
    CodeBlockWithTabsExample,
    CodeBlockWithMaxHeightExample,
    CodeBlockWithFilledExample,
    CodeBlockWithNoBorderExample,
    CodeBlockWithLineNumbersExample,
    CodeBlockWithCustomLocaleConfigurationExample,
    CodeBlockWithTabsAndShadowExample,
    CodeBlockWithLinkExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class CodeBlockExamplesModule {}
