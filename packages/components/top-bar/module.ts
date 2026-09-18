import { NgModule } from '@angular/core';
import { KbqTopBar, KbqTopBarContainer, KbqTopBarSpacer } from './top-bar';

const COMPONENTS = [
    KbqTopBar,
    KbqTopBarContainer,
    KbqTopBarSpacer
];

/**
 * Kept for applications that still declare NgModules. Standalone code imports `KbqTopBar`,
 * `KbqTopBarContainer` and `KbqTopBarSpacer` directly instead.
 */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqTopBarModule {}
