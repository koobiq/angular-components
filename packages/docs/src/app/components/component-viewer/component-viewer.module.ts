import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqMarkdownModule } from '@koobiq/components/markdown';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { CopyButtonModule } from 'src/app/components/copy-button/copy-button';

import { AnchorsModule } from '../anchors/anchors.module';
import { DocExampleViewerModule } from '../doc-example-viewer/doc-example-viewer-module';
import { DocViewerModule } from '../doc-viewer/doc-viewer-module';
import { DocumentationItems } from '../documentation-items';
import { FooterModule } from '../footer/footer.module';
import { NavbarModule } from '../navbar';
import { SidenavModule } from '../sidenav/sidenav.module';

import {
    ComponentApiComponent,
    ComponentOverviewComponent,
    ComponentExamplesComponent,
    ComponentViewerComponent,
    CdkOverviewComponent,
    CdkApiComponent
} from './component-viewer.component';


@NgModule({
    imports: [
        AnchorsModule,
        FooterModule,
        KbqTabsModule,
        KbqMarkdownModule,
        KbqDropdownModule,
        KbqIconModule,
        CopyButtonModule,
        RouterModule,
        DocViewerModule,
        DocExampleViewerModule,
        CommonModule,
        SidenavModule,
        NavbarModule
    ],
    declarations: [
        ComponentViewerComponent,

        ComponentOverviewComponent,
        ComponentApiComponent,
        ComponentExamplesComponent,

        CdkOverviewComponent,
        CdkApiComponent
    ],
    providers: [DocumentationItems, KbqSidepanelService]
})
export class ComponentViewerModule {}
