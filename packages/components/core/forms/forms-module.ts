import { NgModule } from '@angular/core';

import {
    KbqForm,
    KbqFormElement
} from './forms.directive';


@NgModule({
    exports: [
        KbqForm,
        KbqFormElement
    ],
    declarations: [
        KbqForm,
        KbqFormElement
    ]
})
export class KbqFormsModule {}
