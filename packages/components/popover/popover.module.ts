import { NgModule } from '@angular/core';
import { KbqPopoverComponent, KbqPopoverTrigger } from './popover.component';
import { KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger } from './popover-confirm.component';

@NgModule({
    imports: [KbqPopoverComponent, KbqPopoverTrigger, KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger],
    exports: [KbqPopoverComponent, KbqPopoverTrigger, KbqPopoverConfirmComponent, KbqPopoverConfirmTrigger]
})
export class KbqPopoverModule {}
