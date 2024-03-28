import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqSidepanelModule } from '@koobiq/components/sidepanel';
import { KbqToggleModule } from '@koobiq/components/toggle';

import { CodeBlockCommonExample } from './code-block-common/code-block-common-example';
import { CodeBlockCutExample } from './code-block-cut/code-block-cut-example';
import { CodeBlockLineNumbersExample } from './code-block-line-numbers/code-block-line-numbers-example';
import { CodeBlockLineWrapExample } from './code-block-line-wrap/code-block-line-wrap-example';
import { CodeBlockNoborderExample } from './code-block-noborder/code-block-noborder-example';
import { CodeBlockSingleLineExample } from './code-block-single-line/code-block-single-line-example';
import { CodeBlockStretchExample } from './code-block-stretch/code-block-stretch-example';
import { CodeBlockStylingExample } from './code-block-styling/code-block-styling-example';
import { CodeBlockTabsWithOverflowExample } from './code-block-tabs-with-overflow/code-block-tabs-with-overflow-example';
import { CodeBlockTabsExample } from './code-block-tabs/code-block-tabs-example';
import { CodeBlockTitleExample } from './code-block-title/code-block-title-example';


export {
    CodeBlockCommonExample,
    CodeBlockStretchExample,
    CodeBlockSingleLineExample,
    CodeBlockLineWrapExample,
    CodeBlockTabsExample,
    CodeBlockTabsWithOverflowExample,
    CodeBlockTitleExample,
    CodeBlockCutExample,
    CodeBlockStylingExample,
    CodeBlockNoborderExample,
    CodeBlockLineNumbersExample
};

const EXAMPLES = [
    CodeBlockCommonExample,
    CodeBlockStretchExample,
    CodeBlockSingleLineExample,
    CodeBlockLineWrapExample,
    CodeBlockTabsExample,
    CodeBlockTabsWithOverflowExample,
    CodeBlockTitleExample,
    CodeBlockCutExample,
    CodeBlockStylingExample,
    CodeBlockNoborderExample,
    CodeBlockLineNumbersExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqCodeBlockModule,
        KbqToggleModule,
        KbqButtonModule,
        KbqSidepanelModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class CodeBlockExamplesModule {}
