import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { DocsLocale } from '../constants/locale';
import { docsGetCategoryById, docsGetItemById, DocsStructureCategoryId, DocsStructureItemId } from '../structure';
import { DocsLocaleService } from './locale';

const SITE_NAME = 'Koobiq';
const CANONICAL_ORIGIN = 'https://koobiq.io';
const TITLE_SEPARATOR = '·';

const DESCRIPTION: Record<DocsLocale, string> = {
    [DocsLocale.Ru]: 'Koobiq — библиотека компонентов и дизайн-система для Angular.',
    [DocsLocale.En]: 'Koobiq — Angular components library and design system.'
};

/**
 * Central title/meta strategy for the docs site. On every successful navigation it derives a
 * unique, localized `<title>` from the `structure` registry and keeps the SEO/social meta tags
 * (`description`, Open Graph, Twitter card, canonical) in sync. This replaces the ad-hoc titles
 * that were previously set inside individual viewers.
 */
@Injectable()
export class DocsTitleStrategy extends TitleStrategy {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly document = inject(DOCUMENT);
    private readonly localeService = inject(DocsLocaleService);

    override updateTitle(snapshot: RouterStateSnapshot): void {
        const locale = this.localeService.locale;
        const path = snapshot.url.split(/[?#]/)[0];
        const pageTitle = this.resolvePageTitle(path, locale);
        const fullTitle = pageTitle ? `${pageTitle} ${TITLE_SEPARATOR} ${SITE_NAME}` : SITE_NAME;

        this.title.setTitle(fullTitle);
        this.updateMeta(fullTitle, DESCRIPTION[locale], `${CANONICAL_ORIGIN}${path}`);
    }

    /** Resolves the human-readable page name from the URL using the structure registry. */
    private resolvePageTitle(path: string, locale: DocsLocale): string | null {
        const segments = path.split('/').filter(Boolean);

        // segments[0] is the locale (or an out-of-locale route such as `404`).
        if (!segments.length || !this.localeService.isSupportedLocale(segments[0])) {
            return null;
        }

        const categoryId = segments[1] as DocsStructureCategoryId | undefined;

        if (!categoryId) {
            // Locale root (welcome page) — the bare site name reads best.
            return null;
        }

        const itemId = segments[2] as DocsStructureItemId | undefined;

        if (itemId) {
            const item = docsGetItemById(itemId, categoryId);

            if (item) {
                return item.name[locale];
            }
        }

        return docsGetCategoryById(categoryId)?.name[locale] ?? null;
    }

    private updateMeta(title: string, description: string, canonicalUrl: string): void {
        this.meta.updateTag({ name: 'description', content: description });

        this.meta.updateTag({ property: 'og:title', content: title });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ property: 'og:type', content: 'website' });
        this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
        this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: title });
        this.meta.updateTag({ name: 'twitter:description', content: description });

        this.setCanonical(canonicalUrl);
    }

    private setCanonical(href: string): void {
        let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

        if (!link) {
            link = this.document.createElement('link');
            link.setAttribute('rel', 'canonical');
            this.document.head.appendChild(link);
        }

        link.setAttribute('href', href);
    }
}
