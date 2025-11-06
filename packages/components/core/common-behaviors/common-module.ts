import { BidiModule } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { inject, Inject, InjectionToken, isDevMode, NgModule, Optional } from '@angular/core';
import { KBQ_WINDOW } from '../tokens';

/**
 * Injection token that configures whether the koobiq sanity checks are enabled.
 *
 * @deprecated No longer used and will be removed in next major release.
 *
 * @docs-private
 */
export const KBQ_SANITY_CHECKS = new InjectionToken<boolean>('kbq-sanity-checks', {
    providedIn: 'root',
    factory: mcSanityChecksFactory
});

/**
 * @deprecated No longer used and will be removed in next major release.
 *
 * @docs-private
 */
export function mcSanityChecksFactory(): boolean {
    return true;
}

/**
 * Module that captures anything that should be loaded and/or run for *all* Koobiq
 * components. This includes Bidi, etc.
 *
 * @deprecated No longer used and will be removed in next major release.
 *
 * @docs-private
 */
@NgModule({
    imports: [BidiModule],
    exports: [BidiModule]
})
export class KbqCommonModule {
    protected readonly document = inject<Document>(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);

    // Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype).
    private hasDoneGlobalChecks = false;

    constructor(@Optional() @Inject(KBQ_SANITY_CHECKS) private _sanityChecksEnabled: boolean) {
        if (this.areChecksEnabled() && !this.hasDoneGlobalChecks) {
            this.checkDoctypeIsDefined();
            this.hasDoneGlobalChecks = true;
        }
    }

    // Whether any sanity checks are enabled
    private areChecksEnabled(): boolean {
        return this._sanityChecksEnabled && isDevMode() && !this.isTestEnv();
    }

    // Whether the code is running in tests.
    private isTestEnv(): boolean {
        return !!(this.window && (this.window['__karma__'] || this.window['jasmine'] || this.window['__jest__']));
    }

    private checkDoctypeIsDefined(): void {
        if (this.document && !this.document.doctype) {
            // eslint-disable-next-line no-console
            console.warn(
                'Current document does not have a doctype. This may cause ' +
                    'some koobiq components not to behave as expected.'
            );
        }
    }
}
