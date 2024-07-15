import { A11yModule, ConfigurableFocusTrapFactory, FocusTrapFactory } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqSidepanelContainerComponent } from './sidepanel-container.component';
import {
    KbqSidepanelActions,
    KbqSidepanelBody,
    KbqSidepanelClose,
    KbqSidepanelFooter,
    KbqSidepanelHeader,
} from './sidepanel-directives';
import { KbqSidepanelService } from './sidepanel.service';

@NgModule({
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule,
        KbqCommonModule,
        KbqButtonModule,
        KbqIconModule,
        KbqTitleModule,
        A11yModule,
    ],
    providers: [
        KbqSidepanelService,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
    ],
    declarations: [
        KbqSidepanelContainerComponent,
        KbqSidepanelClose,
        KbqSidepanelHeader,
        KbqSidepanelBody,
        KbqSidepanelFooter,
        KbqSidepanelActions,
    ],
    exports: [
        KbqSidepanelContainerComponent,
        KbqSidepanelClose,
        KbqSidepanelHeader,
        KbqSidepanelBody,
        KbqSidepanelFooter,
        KbqSidepanelActions,
    ],
})
export class KbqSidepanelModule {}
