import { NgModule } from '@angular/core';
import { KbqButtonModule, KbqButtonPrefix, KbqButtonSuffix } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqButtonToggle, KbqButtonToggleGroup } from './button-toggle.component';

/**
 * Entry point for `KbqButtonToggleGroup`/`KbqButtonToggle`. Both are standalone, so a bare
 * `imports: [KbqButtonToggle]` works; this module is the convenience bundle that also pulls in
 * `KbqButtonModule`/`KbqTitleModule` and re-exports the slot markers.
 */
@NgModule({
    imports: [KbqButtonModule, KbqTitleModule, KbqButtonToggleGroup, KbqButtonToggle],
    // The slot markers are re-exported because a toggle projects them itself: they are what keeps an
    // icon outside the truncated label.
    exports: [KbqButtonToggleGroup, KbqButtonToggle, KbqButtonPrefix, KbqButtonSuffix]
})
export class KbqButtonToggleModule {}
