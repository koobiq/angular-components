import { NgModule } from '@angular/core';
import { KbqToastContainerComponent } from './toast-container.component';
import { KbqToastCloseButton, KbqToastComponent } from './toast.component';

const COMPONENTS = [
    KbqToastComponent,
    KbqToastCloseButton,
    KbqToastContainerComponent
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqToastModule {}
