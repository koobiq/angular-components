import { NgModule } from '@angular/core';
import { KbqTopBar, KbqTopBarContainer, KbqTopBarSpacer, KbqTopBarTitle } from './top-bar';

const COMPONENTS = [
    KbqTopBar,
    KbqTopBarContainer,
    KbqTopBarSpacer,
    KbqTopBarTitle
];

/**
 * Kept for applications that still declare NgModules. Standalone code imports `KbqTopBar`,
 * `KbqTopBarContainer`, `KbqTopBarSpacer` and `KbqTopBarTitle` directly instead.
 */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqTopBarModule {}
