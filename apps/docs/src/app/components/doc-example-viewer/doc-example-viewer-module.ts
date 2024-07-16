import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { CopyButtonModule } from '../copy-button/copy-button';
import { StackblitzButtonModule } from '../stackblitz';
import { DocExampleViewer } from './doc-example-viewer';

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
    declarations: [DocExampleViewer],
    exports: [DocExampleViewer]
})
export class DocExampleViewerModule {}
