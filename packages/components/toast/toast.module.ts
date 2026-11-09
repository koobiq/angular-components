import { NgModule } from '@angular/core';
import { KbqToastCloseButton, KbqToastComponent } from './toast.component';
import { KbqToastContainerComponent } from './toast-container.component';

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
