import { NgModule } from '@angular/core';
import { KbqScrollbar } from './scrollbar.component';
import { KbqScrollbarDirective } from './scrollbar.directive';
import { KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER } from './scrollbar.types';

const COMPONENTS = [
    KbqScrollbar,
    KbqScrollbarDirective
];

/**
 * @deprecated Wraps `overlayscrollbars`. Superseded by the dependency-free
 * `@koobiq/components/scrollbar`. Will be removed in a future major version — an `ng update`
 * migration rewrites `@koobiq/components/scrollbar` imports of this module to
 * `@koobiq/components/scrollbar/deprecated` automatically.
 */
@NgModule({
    imports: COMPONENTS,
    providers: [KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG_PROVIDER],
    exports: COMPONENTS
})
export class KbqScrollbarModule {}
