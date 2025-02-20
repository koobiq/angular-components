import { NgModule } from '@angular/core';
import { KbqTopMenu, KbqTopMenuContainer, KbqTopMenuSpacer } from './top-menu';

const COMPONENTS = [
    KbqTopMenu,
    KbqTopMenuContainer,
    KbqTopMenuSpacer
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqTopMenuModule {}
