import { NgModule } from '@angular/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqDatetime } from './datetime';

@NgModule({
    imports: [KbqDatetime],
    exports: [KbqDatetime, KbqDatepickerModule, KbqFormFieldModule]
})
export class KbqDatetimeModule {}
