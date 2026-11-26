import { NgModule } from '@angular/core';
import { ModalButtonLoadingExample } from './modal-button-loading/modal-button-loading-example';
import { ModalCaptionExample } from './modal-caption/modal-caption-example';
import { ModalComponentExample } from './modal-component/modal-component-example';
import { ModalComponentWithInjectorExample } from './modal-component-with-injector/modal-component-with-injector-example';
import { ModalFullCustomExample } from './modal-full-custom/modal-full-custom-example';
import { ModalKeepOpenOnErrorExample } from './modal-keep-open-on-error/modal-keep-open-on-error-example';
import { ModalMultipleExample } from './modal-multiple/modal-multiple-example';
import { ModalOverviewExample } from './modal-overview/modal-overview-example';
import { ModalScrollExample } from './modal-scroll/modal-scroll-example';
import { ModalSizesExample } from './modal-sizes/modal-sizes-example';
import { ModalTemplateExample } from './modal-template/modal-template-example';

export {
    ModalButtonLoadingExample,
    ModalCaptionExample,
    ModalComponentExample,
    ModalComponentWithInjectorExample,
    ModalFullCustomExample,
    ModalKeepOpenOnErrorExample,
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
    ModalMultipleExample,
    ModalFullCustomExample,
    ModalButtonLoadingExample,
    ModalKeepOpenOnErrorExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class ModalExamplesModule {}
