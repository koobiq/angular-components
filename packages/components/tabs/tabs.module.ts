import { A11yModule } from '@angular/cdk/a11y';
import { PortalModule } from '@angular/cdk/portal';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTabBody, KbqTabBodyPortal } from './tab-body.component';
import { KbqTabContent } from './tab-content.directive';
import {
    KbqAlignTabsCenterCssStyler,
    KbqAlignTabsEndCssStyler,
    KbqStretchTabsCssStyler,
    KbqTabGroup,
    KbqVerticalTabsCssStyler,
} from './tab-group.component';
import { KbqTabHeader } from './tab-header.component';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';
import { KbqTabLabel } from './tab-label.directive';
import { KbqTabLink, KbqTabNav } from './tab-nav-bar';
import { KbqTab } from './tab.component';

@NgModule({
    imports: [
        CommonModule,
        PortalModule,
        A11yModule,
        CdkScrollableModule,
        KbqCommonModule,
        KbqIconModule,
        KbqToolTipModule,
    ],
    // Don't export all components because some are only to be used internally.
    exports: [
        KbqCommonModule,
        KbqTabGroup,
        KbqTabLabel,
        KbqTab,
        KbqTabNav,
        KbqTabLink,
        KbqTabContent,
        KbqAlignTabsCenterCssStyler,
        KbqAlignTabsEndCssStyler,
        KbqStretchTabsCssStyler,
        KbqVerticalTabsCssStyler,
    ],
    declarations: [
        KbqTabGroup,
        KbqTabLabel,
        KbqTab,
        KbqTabLabelWrapper,
        KbqTabNav,
        KbqTabLink,
        KbqTabBody,
        KbqTabBodyPortal,
        KbqTabHeader,
        KbqTabContent,
        KbqAlignTabsCenterCssStyler,
        KbqAlignTabsEndCssStyler,
        KbqStretchTabsCssStyler,
        KbqVerticalTabsCssStyler,
    ],
})
export class KbqTabsModule {}
