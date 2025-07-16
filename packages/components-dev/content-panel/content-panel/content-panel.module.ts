import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { KbqSidepanelModule } from '@koobiq/components/sidepanel';
// import { IcLineClampDirective, IcOverflowContentTrackerDirective } from '@mosaic-design/infosec-components/directives';
import {
    ContentPanelBodyComponent,
    ContentPanelComponent,
    ContentPanelFooterComponent,
    ContentPanelHeaderComponent
} from './components';
import { ContentPanelSidemenuDirective, ContentPanelTitleDirective, OpenContentPanelDirective } from './directives';
import { IcOverflowContentTrackerDirective } from './overflow-content-tracker.directive';
import { IcContentPanelService } from './services';

/**
 * @deprecated Будет удален в 19 версии. Компоненты будут standalone
 */
@NgModule({
    imports: [
        CommonModule,
        KbqButtonModule,
        KbqLinkModule,
        KbqBadgeModule,
        KbqIconModule,
        KbqSidepanelModule,
        KbqScrollbarModule,
        IcOverflowContentTrackerDirective
        // IcLineClampDirective
    ],
    providers: [IcContentPanelService],
    declarations: [
        ContentPanelComponent,
        ContentPanelHeaderComponent,
        ContentPanelBodyComponent,
        ContentPanelFooterComponent,
        OpenContentPanelDirective,
        ContentPanelSidemenuDirective,
        ContentPanelTitleDirective
    ],
    exports: [
        ContentPanelComponent,
        ContentPanelHeaderComponent,
        ContentPanelBodyComponent,
        ContentPanelFooterComponent,
        OpenContentPanelDirective,
        ContentPanelSidemenuDirective,
        ContentPanelTitleDirective
    ]
})
export class IcContentPanelModule {}
