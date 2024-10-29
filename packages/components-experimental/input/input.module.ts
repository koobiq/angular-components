import { NgModule } from '@angular/core';
import { KbqInput } from './input';

const DIRECTIVES = [
    KbqInput
];

@NgModule({
    imports: DIRECTIVES,
    exports: DIRECTIVES
})
export class KbqInputModule {}
