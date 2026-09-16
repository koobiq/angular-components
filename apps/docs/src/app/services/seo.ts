import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCS_DEFAULT_LOCALE, DOCS_SUPPORTED_LOCALES, DocsLocale } from '../constants/locale';
import { DOCS_SEO_DESCRIPTIONS } from '../seo-descriptions';
import {
    docsGetCategoryById,
    docsGetItemById,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemId,
    DocsStructureItemTab,
    DocsStructureTokensTab
} from '../structure';
import { DOCS_TRANSLATIONS, docsTranslateTemplate } from './i18n';

const SITE_NAME = 'Koobiq';
const SITE_ORIGIN = 'https://koobiq.io';
const TITLE_SEPARATOR = '·';

type DocsTwitterCard = 'summary' | 'summary_large_image';

type DocsSeoImageSource = {
    path: string;
    width: number;
    height: number;
    twitterCard: DocsTwitterCard;
};

const FALLBACK_IMAGE: DocsSeoImageSource = {
    path: '/assets/images/koobiq-illustration-wip.png',
    width: 2048,
    height: 1024,
    twitterCard: 'summary_large_image'
};

const ICONS_IMAGE: DocsSeoImageSource = {
    path: '/assets/images/welcome/icons-light.png',
    width: 400,
    height: 280,
    twitterCard: 'summary'
};

const TAB_TITLE: Record<DocsStructureItemTab | DocsStructureTokensTab, Record<DocsLocale, string>> = {
    [DocsStructureItemTab.Overview]: DOCS_TRANSLATIONS.overviewTab,
    [DocsStructureItemTab.Api]: DOCS_TRANSLATIONS.apiTab,
    [DocsStructureItemTab.Examples]: DOCS_TRANSLATIONS.examplesTab,
    [DocsStructureTokensTab.Colors]: DOCS_TRANSLATIONS.tokensTabColors,
    [DocsStructureTokensTab.Typography]: DOCS_TRANSLATIONS.tokensTabTypography,
    [DocsStructureTokensTab.Shadows]: DOCS_TRANSLATIONS.tokensTabShadows,
    [DocsStructureTokensTab.BorderRadius]: DOCS_TRANSLATIONS.tokensTabBorderRadius,
    [DocsStructureTokensTab.Sizes]: DOCS_TRANSLATIONS.tokensTabSizes,
    [DocsStructureTokensTab.Palette]: DOCS_TRANSLATIONS.tokensTabPalette,
    [DocsStructureTokensTab.Semantic]: DOCS_TRANSLATIONS.tokensTabSemantic
};

const OG_LOCALE: Record<DocsLocale, string> = {
    [DocsLocale.Ru]: 'ru_RU',
    [DocsLocale.En]: 'en_US'
};

type DocsSeoImage = {
    url: string;
    alt: string;
    width: number;
    height: number;
    twitterCard: DocsTwitterCard;
};

export type DocsResolvedSeo = {
    title: string;
    description: string;
    canonicalUrl: string | null;
    alternates: ReadonlyArray<{ locale: DocsLocale | 'x-default'; url: string }>;
    image: DocsSeoImage;
    locale: DocsLocale;
    noIndex: boolean;
};

type SeoDescriptions = Readonly<Record<string, Partial<Record<DocsLocale, string>>>>;

const generatedDescriptions = DOCS_SEO_DESCRIPTIONS as SeoDescriptions;

const resolveItemImageSource = (item: DocsStructureItem): DocsSeoImageSource => {
    if (!item.svgPreview) return FALLBACK_IMAGE;

    return {
        path: `/assets/images/welcome/${encodeURIComponent(item.svgPreview)}-light.png`,
        width: 400,
        height: 280,
        twitterCard: 'summary'
    };
};

const resolveImage = (source: DocsSeoImageSource, alt: string): DocsSeoImage => {
    return {
        url: `${SITE_ORIGIN}${source.path}`,
        alt,
        width: source.width,
        height: source.height,
        twitterCard: source.twitterCard
    };
};

const resolveItemImage = (item: DocsStructureItem, locale: DocsLocale): DocsSeoImage => {
    const source = resolveItemImageSource(item);
    const alt = item.svgPreview
        ? docsTranslateTemplate('seoImageAlt', locale, item.name[locale])
        : DOCS_TRANSLATIONS.seoFallbackImageAlt[locale];

    return resolveImage(source, alt);
};

const resolveTabDescription = (item: DocsStructureItem, tab: string | undefined, locale: DocsLocale): string => {
    const itemName = item.name[locale];

    if (tab === DocsStructureItemTab.Api) {
        return docsTranslateTemplate('seoApiDescription', locale, itemName);
    }

    if (tab === DocsStructureItemTab.Examples) {
        return docsTranslateTemplate('seoExamplesDescription', locale, itemName);
    }

    if (item.id === DocsStructureItemId.DesignTokens && tab && TAB_TITLE[tab as DocsStructureTokensTab]) {
        const tabTitle = TAB_TITLE[tab as DocsStructureTokensTab][locale];

        return docsTranslateTemplate('seoTokensDescription', locale, tabTitle);
    }

    return generatedDescriptions[item.id]?.[locale] ?? docsTranslateTemplate('seoItemDescription', locale, itemName);
};

const resolveItemSeo = (
    item: DocsStructureItem,
    tab: string | undefined,
    locale: DocsLocale
): Pick<DocsResolvedSeo, 'title' | 'description' | 'image' | 'noIndex'> => {
    const itemTitle = item.name[locale];
    const tabTitle = tab ? TAB_TITLE[tab as DocsStructureItemTab | DocsStructureTokensTab]?.[locale] : undefined;
    const title = `${itemTitle}${tabTitle ? ` — ${tabTitle}` : ''} ${TITLE_SEPARATOR} ${SITE_NAME}`;

    return {
        title,
        description: resolveTabDescription(item, tab, locale),
        image: resolveItemImage(item, locale),
        noIndex: false
    };
};

/** Resolves all route-dependent SEO data without touching the DOM, so it can be tested exhaustively. */
export const docsResolveSeo = (rawPath: string, fallbackLocale: DocsLocale = DOCS_DEFAULT_LOCALE): DocsResolvedSeo => {
    const path = rawPath.split(/[?#]/)[0];
    const segments = path.split('/').filter(Boolean);
    const hasSupportedLocale = DOCS_SUPPORTED_LOCALES.includes(segments[0]);
    const locale = hasSupportedLocale ? (segments[0] as DocsLocale) : fallbackLocale;
    const canonicalUrl = hasSupportedLocale ? `${SITE_ORIGIN}${path}` : null;
    const alternates = hasSupportedLocale
        ? [
              ...DOCS_SUPPORTED_LOCALES.map((alternateLocale) => ({
                  locale: alternateLocale as DocsLocale,
                  url: `${SITE_ORIGIN}/${alternateLocale}${segments.length > 1 ? `/${segments.slice(1).join('/')}` : ''}`
              })),
              {
                  locale: 'x-default' as const,
                  url: `${SITE_ORIGIN}/${DOCS_DEFAULT_LOCALE}${segments.length > 1 ? `/${segments.slice(1).join('/')}` : ''}`
              }
          ]
        : [];
    const categoryId = segments[1] as DocsStructureCategoryId | undefined;
    const itemId = segments[2] as DocsStructureItemId | undefined;
    const tab = segments[3];
    const item = categoryId && itemId ? docsGetItemById(itemId, categoryId) : undefined;

    if (item) {
        return { ...resolveItemSeo(item, tab, locale), canonicalUrl, alternates, locale };
    }

    if (categoryId === DocsStructureCategoryId.Icons) {
        const categoryName = docsGetCategoryById(DocsStructureCategoryId.Icons)!.name[locale];

        return {
            title: `${categoryName} ${TITLE_SEPARATOR} ${SITE_NAME}`,
            description: DOCS_TRANSLATIONS.seoIconsDescription[locale],
            canonicalUrl,
            alternates,
            image: resolveImage(ICONS_IMAGE, docsTranslateTemplate('seoImageAlt', locale, categoryName)),
            locale,
            noIndex: false
        };
    }

    const isHome = hasSupportedLocale && segments.length === 1;
    const isNotFound = path === '/404';

    return {
        title: isHome
            ? DOCS_TRANSLATIONS.seoHomeTitle[locale]
            : isNotFound
              ? `${DOCS_TRANSLATIONS.pageNotFound[locale]} ${TITLE_SEPARATOR} ${SITE_NAME}`
              : SITE_NAME,
        description: DOCS_TRANSLATIONS.seoSiteDescription[locale],
        canonicalUrl,
        alternates,
        image: resolveImage(FALLBACK_IMAGE, DOCS_TRANSLATIONS.seoFallbackImageAlt[locale]),
        locale,
        noIndex: !isHome
    };
};

@Injectable({ providedIn: 'root' })
export class DocsSeoService {
    private readonly title = inject(Title);
    private readonly meta = inject(Meta);
    private readonly document = inject(DOCUMENT);

    update(path: string, locale: DocsLocale): void {
        const seo = docsResolveSeo(path, locale);

        this.document.documentElement.lang = seo.locale;
        this.title.setTitle(seo.title);
        this.updateMeta(seo);
        this.updateCanonical(seo.canonicalUrl);
        this.updateAlternates(seo.alternates);
    }

    private updateMeta(seo: DocsResolvedSeo): void {
        this.setMeta('name', 'description', seo.description);
        this.setMeta('name', 'robots', seo.noIndex ? 'noindex,follow' : null);

        this.setMeta('property', 'og:title', seo.title);
        this.setMeta('property', 'og:description', seo.description);
        this.setMeta('property', 'og:type', 'website');
        this.setMeta('property', 'og:site_name', SITE_NAME);
        this.setMeta('property', 'og:url', seo.canonicalUrl);
        this.setMeta('property', 'og:locale', OG_LOCALE[seo.locale]);
        this.setMeta(
            'property',
            'og:locale:alternate',
            OG_LOCALE[seo.locale === DocsLocale.Ru ? DocsLocale.En : DocsLocale.Ru]
        );
        this.setMeta('property', 'og:image', seo.image.url);
        this.setMeta('property', 'og:image:type', 'image/png');
        this.setMeta('property', 'og:image:width', String(seo.image.width));
        this.setMeta('property', 'og:image:height', String(seo.image.height));
        this.setMeta('property', 'og:image:alt', seo.image.alt);

        this.setMeta('name', 'twitter:card', seo.image.twitterCard);
        this.setMeta('name', 'twitter:title', seo.title);
        this.setMeta('name', 'twitter:description', seo.description);
        this.setMeta('name', 'twitter:image', seo.image.url);
        this.setMeta('name', 'twitter:image:alt', seo.image.alt);
    }

    private setMeta(attribute: 'name' | 'property', key: string, content: string | null): void {
        const selector = `${attribute}="${key}"`;

        if (content) {
            this.meta.updateTag({ [attribute]: key, content }, selector);
        } else {
            this.meta.removeTag(selector);
        }
    }

    private updateCanonical(href: string | null): void {
        let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

        if (!href) {
            link?.remove();

            return;
        }

        if (!link) {
            link = this.document.createElement('link');
            link.rel = 'canonical';
            this.document.head.appendChild(link);
        }

        link.href = href;
    }

    private updateAlternates(alternates: DocsResolvedSeo['alternates']): void {
        this.document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());

        for (const alternate of alternates) {
            const link = this.document.createElement('link');

            link.rel = 'alternate';
            link.hreflang = alternate.locale;
            link.href = alternate.url;
            this.document.head.appendChild(link);
        }
    }
}
