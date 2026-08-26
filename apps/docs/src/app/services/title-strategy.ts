import { DestroyRef, inject, Injectable, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { skip } from 'rxjs';
import { DocsLocaleService } from './locale';
import { DocsSeoService } from './seo';

/** Connects successful Router navigations to the centralized SEO service. */
@Injectable()
export class DocsTitleStrategy extends TitleStrategy {
    private readonly seo = inject(DocsSeoService);
    // DocsLocaleService injects Router. Resolve it after Router construction to avoid a
    // Router → TitleStrategy → DocsLocaleService → Router dependency cycle.
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);
    private currentUrl = '';
    private observesLocaleChanges = false;

    override updateTitle(snapshot: RouterStateSnapshot): void {
        this.currentUrl = snapshot.url;

        const localeService = this.injector.get(DocsLocaleService);

        this.observeLocaleChanges(localeService);

        if (!localeService.syncLocaleFromURL(this.currentUrl)) {
            this.seo.update(this.currentUrl, localeService.locale);
        }
    }

    private observeLocaleChanges(localeService: DocsLocaleService): void {
        if (this.observesLocaleChanges) return;

        this.observesLocaleChanges = true;
        localeService.changes
            .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((locale) => this.seo.update(this.currentUrl, locale));
    }
}
