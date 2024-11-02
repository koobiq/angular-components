import { NgModule } from '@angular/core';
import { KbqModalCustomComponent, ModalComponentExample } from './modal-component/modal-component-example';
import { ModalMultipleExample } from './modal-multiple/modal-multiple-example';
import { ModalOverviewExample } from './modal-overview/modal-overview-example';
import { KbqLongComponent, ModalScrollExample } from './modal-scroll/modal-scroll-example';
import { ModalSizesExample } from './modal-sizes/modal-sizes-example';
import { ModalTemplateExample } from './modal-template/modal-template-example';

export {
    KbqLongComponent,
    KbqModalCustomComponent,
    ModalComponentExample,
    ModalMultipleExample,
    ModalOverviewExample,
    ModalScrollExample,
    ModalSizesExample,
    ModalTemplateExample
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
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ModalExamplesModule {}
