import { ConfigurableFocusTrapFactory, FOCUS_TRAP_INERT_STRATEGY, FocusTrapFactory } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { DateAdapter, DateFormatter, EmptyFocusTrapStrategy } from '@koobiq/components/core';
import {
    KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER,
    KbqNotificationCenterComponent,
    KbqNotificationCenterTrigger
} from './notification-center';
import { KbqNotificationCenterService } from './notification-center.service';

@NgModule({
    imports: [
        KbqNotificationCenterComponent,
        KbqNotificationCenterTrigger
    ],
    exports: [
        KbqNotificationCenterComponent,
        KbqNotificationCenterTrigger
    ],
    providers: [
        KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER,
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
        { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy },
        { provide: KbqNotificationCenterService, deps: [DateAdapter, DateFormatter] }]
})
export class KbqNotificationCenterModule {}
