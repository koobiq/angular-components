import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalModule } from '@koobiq/components/modal';

import { ModalComponentExample, KbqModalCustomComponent } from './modal-component/modal-component-example';
import { ModalMultipleExample } from './modal-multiple/modal-multiple-example';
import { ModalOverviewExample } from './modal-overview/modal-overview-example';
import { KbqLongComponent, ModalScrollExample } from './modal-scroll/modal-scroll-example';
import { ModalSizesExample } from './modal-sizes/modal-sizes-example';
import { ModalTemplateExample } from './modal-template/modal-template-example';


export {
    ModalOverviewExample,
    ModalComponentExample,
    KbqModalCustomComponent,
    ModalTemplateExample,
    ModalScrollExample,
    KbqLongComponent,
    ModalSizesExample,
    ModalMultipleExample
};

const EXAMPLES = [
    ModalOverviewExample,
    ModalComponentExample,
    KbqModalCustomComponent,
    ModalTemplateExample,
    ModalScrollExample,
    KbqLongComponent,
    ModalSizesExample,
    ModalMultipleExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        KbqButtonModule,
        KbqModalModule,
        KbqIconModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqFormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ModalExamplesModule {}
