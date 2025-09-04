import {
    A11yModule,
    ConfigurableFocusTrapFactory,
    FOCUS_TRAP_INERT_STRATEGY,
    FocusTrapFactory
} from '@angular/cdk/a11y';
import { CdkObserveContent } from '@angular/cdk/observers';
import { OverlayModule } from '@angular/cdk/overlay';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { EmptyFocusTrapStrategy } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqAppSwitcherComponent,
    KbqAppSwitcherTrigger
} from './app-switcher.component';

@NgModule({
    declarations: [
        KbqAppSwitcherComponent,
        KbqAppSwitcherTrigger
    ],
    exports: [
        KbqAppSwitcherComponent,
        KbqAppSwitcherTrigger
    ],
    imports: [
        OverlayModule,
        KbqButtonModule,
        A11yModule,
        KbqIconModule,
        CdkObserveContent,
        NgClass,
        NgTemplateOutlet
    ],
    providers: [
        KBQ_APP_SWITCHER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
        { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy }]
})
export class KbqAppSwitcherModule {}
