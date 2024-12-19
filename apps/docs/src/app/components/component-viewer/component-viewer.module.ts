import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqMarkdownModule } from '@koobiq/components/markdown';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { CopyButtonModule } from 'src/app/components/copy-button/copy-button';
import { AnchorsModule } from '../anchors/anchors.module';
import { CodeSnippet } from '../code-snippet/code-snippet';
import { DocExampleViewerModule } from '../doc-example-viewer/doc-example-viewer-module';
import { DocsLiveExampleModule } from '../docs-live-example/docs-live-example-module';
import {
    CdkApiComponent,
    CdkOverviewComponent,
    ComponentApiComponent,
    ComponentExamplesComponent,
    ComponentOverviewComponent,
    ComponentViewerComponent
} from './component-viewer.component';

@NgModule({
    imports: [
        AnchorsModule,
        KbqTabsModule,
        KbqMarkdownModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqButtonModule,
        CopyButtonModule,
        RouterModule,
        DocsLiveExampleModule,
        DocExampleViewerModule,
        KbqIconModule,
        KbqLinkModule,
        CodeSnippet
    ],
    declarations: [
        ComponentViewerComponent,
        ComponentOverviewComponent,
        ComponentApiComponent,
        ComponentExamplesComponent,
        CdkOverviewComponent,
        CdkApiComponent
    ],
    providers: [KbqSidepanelService]
})
export class ComponentViewerModule {}
