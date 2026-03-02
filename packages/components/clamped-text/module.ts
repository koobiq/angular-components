import { NgModule } from '@angular/core';
import { KbqClampedList, KbqClampedListTrigger } from './clamped-list';
import { KbqClampedText } from './clamped-text';

const COMPONENTS = [
    KbqClampedText,
    KbqClampedList,
    KbqClampedListTrigger
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqClampedTextModule {}
