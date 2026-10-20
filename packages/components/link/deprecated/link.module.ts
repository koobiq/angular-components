import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { KbqLink } from './link.component';

/**
 * @deprecated The directive whose markup has to know its internals: the `kbq-link__text` wrapper, the
 * `kbq-link_external` and `kbq-text-with-dot` classes. Superseded by the `KbqLink` component of
 * `@koobiq/components/link` (`[kbqLink]`), which renders that structure itself and adds
 * `kbqLinkPrefix`/`kbqLinkSuffix` slots, the `external` and `size` inputs and keyboard support for pseudo
 * links. Will be removed in a future major version - an `ng update` migration rewrites
 * `@koobiq/components/link` imports of this API to `@koobiq/components/link/deprecated` automatically.
 */
@NgModule({
    imports: [
        A11yModule,
        KbqLink
    ],
    exports: [KbqLink]
})
export class KbqLinkModule {}
