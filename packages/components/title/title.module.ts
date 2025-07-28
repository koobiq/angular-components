import { NgModule } from '@angular/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTitleDirective } from './title.directive';

@NgModule({
    imports: [KbqToolTipModule],
    declarations: [KbqTitleDirective],
    exports: [KbqTitleDirective]
})
export class KbqTitleModule {}
