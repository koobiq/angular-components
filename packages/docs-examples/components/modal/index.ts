import { NgModule } from '@angular/core';
import { ModalCaptionExample } from './modal-caption/modal-caption-example';
import { ModalComponentWithInjectorExample } from './modal-component-with-injector/modal-component-with-injector-example';
import { ModalComponentExample } from './modal-component/modal-component-example';
import { ModalMultipleExample } from './modal-multiple/modal-multiple-example';
import { ModalOverviewExample } from './modal-overview/modal-overview-example';
import { ModalScrollExample } from './modal-scroll/modal-scroll-example';
import { ModalSizesExample } from './modal-sizes/modal-sizes-example';
import { ModalTemplateExample } from './modal-template/modal-template-example';

export {
    ModalCaptionExample,
    ModalComponentExample,
    ModalComponentWithInjectorExample,
    ModalMultipleExample,
    ModalOverviewExample,
    ModalScrollExample,
    ModalSizesExample,
    ModalTemplateExample
};

const EXAMPLES = [
    ModalOverviewExample,
    ModalCaptionExample,
    ModalComponentExample,
    ModalComponentWithInjectorExample,
    ModalTemplateExample,
    ModalScrollExample,
    ModalSizesExample,
    ModalMultipleExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ModalExamplesModule {}
