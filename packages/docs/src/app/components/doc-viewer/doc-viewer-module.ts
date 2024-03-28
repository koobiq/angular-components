import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

import { CodeBlock } from '../code-block/code-block';
import { CopyButtonModule } from '../copy-button/copy-button';
import { DocsExampleSource } from '../docs-example-source/docs-example-source';
import { ExampleViewer } from '../example-viewer/example-viewer';
import { StackblitzButtonModule } from '../stackblitz';

import { DocViewer } from './doc-viewer';


// ExampleViewer is included in the DocViewerModule because they have a circular dependency.
@NgModule({
    imports: [
        CommonModule,
        KbqButtonModule,
        KbqTabsModule,
        KbqLinkModule,
        KbqToolTipModule,
        StackblitzButtonModule,
        CopyButtonModule,
        PortalModule
    ],
    declarations: [
        DocViewer,
        ExampleViewer,
        DocsExampleSource,
        CodeBlock
    ],
    exports: [
        DocViewer,
        ExampleViewer,
        DocsExampleSource,
        CodeBlock
    ]
})
export class DocViewerModule {}
