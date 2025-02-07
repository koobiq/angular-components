import { NgModule } from '@angular/core';
import { KbqTopMenu } from './top-menu';

const COMPONENTS = [
    KbqTopMenu
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqTopMenuModule {}
