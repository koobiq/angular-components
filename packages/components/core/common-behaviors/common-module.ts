import { BidiModule } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { inject, Inject, InjectionToken, isDevMode, NgModule, Optional } from '@angular/core';

// Injection token that configures whether the koobiq sanity checks are enabled.
export const KBQ_SANITY_CHECKS = new InjectionToken<boolean>('kbq-sanity-checks', {
    providedIn: 'root',
    factory: mcSanityChecksFactory
});

export function mcSanityChecksFactory(): boolean {
    return true;
}

/**
 * Module that captures anything that should be loaded and/or run for *all* Koobiq
 * components. This includes Bidi, etc.
 *
 * This module should be imported to each top-level component module (e.g., KbqTabsModule).
 */
@NgModule({
    imports: [BidiModule],
    exports: [BidiModule]
})
export class KbqCommonModule {
    protected readonly document = inject<Document>(DOCUMENT);

    // Whether we've done the global sanity checks (e.g. a theme is loaded, there is a doctype).
    private hasDoneGlobalChecks = false;

    constructor(@Optional() @Inject(KBQ_SANITY_CHECKS) private _sanityChecksEnabled: boolean) {
        if (this.areChecksEnabled() && !this.hasDoneGlobalChecks) {
            this.checkDoctypeIsDefined();
            this.checkThemeIsPresent();
            this.hasDoneGlobalChecks = true;
        }
    }

    // Whether any sanity checks are enabled
    private areChecksEnabled(): boolean {
        return this._sanityChecksEnabled && isDevMode() && !this.isTestEnv();
    }

    // Whether the code is running in tests.
    private isTestEnv(): boolean {
        const window = this.getWindow();

        return !!(window && (window['__karma__'] || window['jasmine'] || window['__jest__']));
    }

    private checkDoctypeIsDefined(): void {
        if (this.document && !this.document.doctype) {
            console.warn(
                'Current document does not have a doctype. This may cause ' +
                    'some koobiq components not to behave as expected.'
            );
        }
    }

    private checkThemeIsPresent(): void {
        if (this.document && typeof getComputedStyle === 'function') {
            const testElement = this.document.createElement('div');

            testElement.classList.add('kbq-theme-loaded-marker');
            this.document.body.appendChild(testElement);

            const computedStyle = getComputedStyle(testElement);

            // In some situations, the computed style of the test element can be null. For example in
            // Firefox, the computed style is null if an application is running inside of a hidden iframe.
            // See: https://bugzilla.mozilla.org/show_bug.cgi?id=548397
            if (computedStyle && computedStyle.display !== 'none') {
                console.warn(
                    'Could not find koobiq core theme. Most koobiq ' +
                        'components may not work as expected. For more info refer ' +
                        'to the theming guide: https://koobiq.io/main/theming/overview'
                );
            }

            this.document.body.removeChild(testElement);
        }
    }

    private getWindow(): Window | null {
        return this.document?.defaultView || window;
    }
}
