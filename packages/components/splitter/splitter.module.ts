import { NgModule } from '@angular/core';
import { KbqSplitter, KbqSplitterPanel } from './splitter';

const COMPONENTS = [KbqSplitter, KbqSplitterPanel];

/**
 * Convenience module for `NgModule` consumers. Everything it re-exports is standalone, so importing
 * `KbqSplitter` and `KbqSplitterPanel` directly is the preferred way in — the library's own examples do that.
 */
@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqSplitterModule {}
