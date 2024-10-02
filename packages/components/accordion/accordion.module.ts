import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqAccordion } from './accordion.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule
    ],
    exports: [
        KbqAccordion
    ],
    declarations: [
        KbqAccordion
    ]
})
export class KbqAccordionModule {}
