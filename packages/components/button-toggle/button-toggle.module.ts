import { NgModule } from '@angular/core';
import { KbqButtonModule, KbqButtonPrefix, KbqButtonSuffix } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqButtonToggle, KbqButtonToggleGroup } from './button-toggle.component';

/**
 * Entry point for `KbqButtonToggleGroup`/`KbqButtonToggle`.
 *
 * Both are standalone, but importing them directly is not enough: a toggle renders `kbq-title` in its
 * own template, and the tooltip behind it resolves `KBQ_TOOLTIP_SCROLL_STRATEGY` and
 * `KBQ_TOOLTIP_OPEN_TIME` from the module injector, where only `KbqTitleModule` puts them. Import
 * this module — a bare `imports: [KbqButtonToggle]` throws NG0201 the moment a label is truncated.
 */
@NgModule({
    imports: [KbqButtonModule, KbqTitleModule, KbqButtonToggleGroup, KbqButtonToggle],
    // The slot markers are re-exported because a toggle projects them itself: they are what keeps an
    // icon outside the truncated label.
    exports: [KbqButtonToggleGroup, KbqButtonToggle, KbqButtonPrefix, KbqButtonSuffix]
})
export class KbqButtonToggleModule {}
