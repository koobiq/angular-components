import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqCodeBlockModule } from '../../../../../components/code-block';

import { CopyButtonModule } from '../copy-button/copy-button';
import { DocsExampleSource } from '../docs-example-source/docs-example-source';
import { DocsLiveExampleViewer } from '../docs-live-example-viewer/docs-live-example-viewer';
import { StackblitzButtonModule } from '../stackblitz';

import { DocsLiveExample } from './docs-live-example';


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
        PortalModule,
        KbqCodeBlockModule
    ],
    declarations: [
        DocsLiveExample,
        DocsLiveExampleViewer,
        DocsExampleSource
    ],
    exports: [
        DocsLiveExample,
        DocsLiveExampleViewer,
        DocsExampleSource
    ]
})
export class DocsLiveExampleModule {}
