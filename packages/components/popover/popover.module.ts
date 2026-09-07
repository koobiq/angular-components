import { NgModule } from '@angular/core';
import { KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger } from './popover-confirm.component';
import { KbqPopoverComponent, KbqPopoverTrigger } from './popover.component';

@NgModule({
    imports: [KbqPopoverComponent, KbqPopoverTrigger, KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger],
    exports: [KbqPopoverComponent, KbqPopoverTrigger, KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger]
})
export class KbqPopoverModule {}
