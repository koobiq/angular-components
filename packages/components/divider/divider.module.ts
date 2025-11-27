import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqDivider } from './divider.component';

@NgModule({
    imports: [CommonModule, KbqDivider],
    exports: [KbqDivider]
})
export class KbqDividerModule {}
