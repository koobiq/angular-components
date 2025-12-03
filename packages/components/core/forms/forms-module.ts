import { NgModule } from '@angular/core';
import { KbqForm, KbqFormElement } from './forms.directive';

@NgModule({
    imports: [
        KbqForm,
        KbqFormElement
    ],
    exports: [
        KbqForm,
        KbqFormElement
    ]
})
export class KbqFormsModule {}
