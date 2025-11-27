import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { KbqLink } from './link.component';

@NgModule({
    imports: [
        A11yModule,
        KbqLink
    ],
    exports: [KbqLink]
})
export class KbqLinkModule {}
