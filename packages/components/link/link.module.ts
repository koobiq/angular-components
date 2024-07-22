import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqLink } from './link.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule
    ],
    declarations: [KbqLink],
    exports: [KbqLink]
})
export class KbqLinkModule {}
