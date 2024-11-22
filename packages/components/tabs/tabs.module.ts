import { A11yModule } from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import { PortalModule } from '@angular/cdk/portal';
import { CdkScrollableModule } from '@angular/cdk/scrolling';
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
    KbqVerticalTabsCssStyler
} from './tab-group.component';
import { KbqTabHeader } from './tab-header.component';
import { KbqTabLabelWrapper } from './tab-label-wrapper.directive';
import { KbqTabLabel } from './tab-label.directive';
import { KbqTabLink, KbqTabNavBar, KbqTabNavPanel } from './tab-nav-bar';
import { KbqTab } from './tab.component';

const STANDALONE_COMPONENTS = [
    KbqTabNavBar,
    KbqTabLink,
    KbqTabNavPanel
];

const COMPONENTS = [
    KbqTabGroup,
    KbqTabLabel,
    KbqTab,
    KbqTabLabelWrapper,
    KbqTabBody,
    KbqTabBodyPortal,
    KbqTabHeader,
    KbqTabContent,
    KbqAlignTabsCenterCssStyler,
    KbqAlignTabsEndCssStyler,
    KbqStretchTabsCssStyler,
    KbqVerticalTabsCssStyler
];

@NgModule({
    imports: [
        PortalModule,
        A11yModule,
        CdkScrollableModule,
        KbqCommonModule,
        KbqIconModule,
        KbqToolTipModule,
        CdkObserveContent,
        ...STANDALONE_COMPONENTS
    ],
    declarations: COMPONENTS,
    exports: [
        ...COMPONENTS,
        ...STANDALONE_COMPONENTS
    ]
})
export class KbqTabsModule {}
