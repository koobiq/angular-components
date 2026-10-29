import { inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { filter } from 'rxjs/operators';

/** The two layouts of the phone menu the mockup offers (Figma: Nav Drawer #1 and #2), kept side by side to compare. */
export type DocsNextNavVariant = 'levels' | 'accordion';

const STORAGE_KEY = 'docs-next-nav-variant';

const isVariant = (value: unknown): value is DocsNextNavVariant => value === 'levels' || value === 'accordion';

/** Layout of the phone menu: set by `?nav=levels|accordion` in the address or the switch in the menu, remembered. */
@Injectable({ providedIn: 'root' })
export class DocsNextNavVariantState {
    private readonly storage = inject(KBQ_WINDOW).localStorage;

    readonly variant = signal<DocsNextNavVariant>(this.read());

    constructor() {
        const router = inject(Router);

        // Created with the menu, after the first navigation: the address it was opened with counts too.
        this.readUrl(router.url);
        router.events
            .pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(({ urlAfterRedirects }) => this.readUrl(urlAfterRedirects));
    }

    set(variant: DocsNextNavVariant): void {
        this.variant.set(variant);

        try {
            this.storage.setItem(STORAGE_KEY, variant);
        } catch {
            // Not remembered then.
        }
    }

    private readUrl(url: string): void {
        const fromUrl = new URLSearchParams(url.split('?')[1] ?? '').get('nav');

        if (isVariant(fromUrl)) this.set(fromUrl);
    }

    private read(): DocsNextNavVariant {
        try {
            const stored = this.storage.getItem(STORAGE_KEY);

            return isVariant(stored) ? stored : 'levels';
        } catch {
            return 'levels';
        }
    }
}
