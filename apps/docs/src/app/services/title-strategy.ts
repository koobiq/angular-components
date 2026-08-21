import { inject, Injectable, Injector } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { DocsLocaleService } from './locale';
import { DocsSeoService } from './seo';

/** Connects successful Router navigations to the centralized SEO service. */
@Injectable()
export class DocsTitleStrategy extends TitleStrategy {
    private readonly seo = inject(DocsSeoService);
    // DocsLocaleService injects Router. Resolve it after Router construction to avoid a
    // Router → TitleStrategy → DocsLocaleService → Router dependency cycle.
    private readonly injector = inject(Injector);

    override updateTitle(snapshot: RouterStateSnapshot): void {
        const localeService = this.injector.get(DocsLocaleService);

        this.seo.update(snapshot.url, localeService.locale);
    }
}
