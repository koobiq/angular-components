import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { KbqSidepanelModule } from '@koobiq/components/sidepanel';
// import { IcLineClampDirective } from '@mosaic-design/infosec-components/directives';
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
        KbqScrollbarModule
        // IcLineClampDirective
    ],
    providers: [IcContentPanelService],
    declarations: [],
    exports: []
})
export class IcContentPanelModule {}
