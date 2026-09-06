import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqButtonToggle, KbqButtonToggleGroup } from './button-toggle.component';

/**
 * Entry point for `KbqButtonToggleGroup`/`KbqButtonToggle`. Both are standalone, so a bare
 * `imports: [KbqButtonToggle]` works; this module is the convenience bundle that also pulls in
 * `KbqButtonModule`/`KbqTitleModule` and re-exports the slot markers.
 */
@NgModule({
    imports: [KbqButtonModule, KbqTitleModule, KbqButtonToggleGroup, KbqButtonToggle],
    exports: [KbqButtonToggleGroup, KbqButtonToggle]
})
export class KbqButtonToggleModule {}
