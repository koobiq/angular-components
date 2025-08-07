import { NgModule } from '@angular/core';
import { KbqClampedText } from './clamped-text';

const COMPONENTS = [
    KbqClampedText
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqClampedTextModule {}
