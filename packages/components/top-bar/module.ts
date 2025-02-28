import { NgModule } from '@angular/core';
import { KbqTopBar, KbqTopBarContainer, KbqTopBarSpacer } from './top-bar';

const COMPONENTS = [
    KbqTopBar,
    KbqTopBarContainer,
    KbqTopBarSpacer
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqTopBarModule {}
