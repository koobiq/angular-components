import { NgModule } from '@angular/core';
import { KbqClampedList, KbqClampedListTrigger } from './clamped-list';
import { KbqClampedText } from './clamped-text';

const COMPONENTS = [
    KbqClampedText,
    KbqClampedList,
    KbqClampedListTrigger
];

/** Re-exports both clamped containers and their shared trigger for `NgModule`-based consumers. */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqClampedTextModule {}
