import { NgModule } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KbqGutterDirective,
    KbqGutterGhostDirective,
    KbqSplitterAreaDirective,
    KbqSplitterComponent
} from './splitter.component';

/**
 * @deprecated The mouse-only, `flex-basis` based splitter. Superseded by the rewritten
 * `@koobiq/components/splitter`, which adds panel constraints, collapsing, snapping, keyboard
 * support and the `separator` accessibility pattern. Will be removed in a future major version — an
 * `ng update` migration rewrites `@koobiq/components/splitter` imports of this API to
 * `@koobiq/components/splitter/deprecated` automatically.
 */
@NgModule({
    imports: [
        KbqIconModule,
        KbqGutterDirective,
        KbqGutterGhostDirective,
        KbqSplitterAreaDirective,
        KbqSplitterComponent
    ],
    exports: [
        KbqGutterDirective,
        KbqSplitterAreaDirective,
        KbqSplitterComponent
    ]
})
export class KbqSplitterModule {}
