import { NgModule } from '@angular/core';
import { KbqTitleDirective } from './title.directive';

@NgModule({
    imports: [KbqTitleDirective],
    // declarations: [KbqTitleDirective],
    exports: [KbqTitleDirective]
})
export class KbqTitleModule {}
