import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqCard } from './card.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule
    ],
    exports: [KbqCard],
    declarations: [KbqCard]
})
export class KbqCardModule {}
