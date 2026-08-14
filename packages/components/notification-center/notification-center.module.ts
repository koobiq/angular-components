import { ConfigurableFocusTrapFactory, FOCUS_TRAP_INERT_STRATEGY, FocusTrapFactory } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { EmptyFocusTrapStrategy } from '@koobiq/components/core';
import { KbqNotificationCenterComponent, KbqNotificationCenterTrigger } from './notification-center';
import { KbqNotificationCenterService } from './notification-center.service';

@NgModule({
    imports: [
        KbqNotificationCenterComponent,
        KbqNotificationCenterTrigger
    ],
    providers: [
        { provide: FocusTrapFactory, useClass: ConfigurableFocusTrapFactory },
        { provide: FOCUS_TRAP_INERT_STRATEGY, useClass: EmptyFocusTrapStrategy },
        KbqNotificationCenterService
    ],
    exports: [
        KbqNotificationCenterComponent,
        KbqNotificationCenterTrigger
    ]
})
export class KbqNotificationCenterModule {}
