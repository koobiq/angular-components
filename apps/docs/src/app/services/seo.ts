import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCS_SUPPORTED_LOCALES, DocsLocale } from '../constants/locale';
import { DOCS_SEO_DESCRIPTIONS } from '../seo-descriptions';
import {
    docsGetCategoryById,
    docsGetItemById,
    DocsSeoMeta,
    DocsStructureCategoryId,
    DocsStructureItem,
    DocsStructureItemId,
    DocsStructureItemTab,
    DocsStructureTokensTab
} from '../structure';
import { DOCS_TRANSLATIONS } from './i18n';

const SITE_NAME = 'Koobiq';
const SITE_ORIGIN = 'https://koobiq.io';
const FALLBACK_IMAGE_PATH = '/assets/images/koobiq-illustration-wip.png';
const ICONS_IMAGE_PATH = '/assets/images/welcome/icons-light.png';
const TITLE_SEPARATOR = '·';

const SITE_DESCRIPTION: Record<DocsLocale, string> = {
    [DocsLocale.Ru]: 'Koobiq — библиотека компонентов и дизайн-система для Angular.',
    [DocsLocale.En]: 'Koobiq — Angular components library and design system.'
};

const HOME_TITLE: Record<DocsLocale, string> = {
    [DocsLocale.Ru]: 'Koobiq — дизайн-система для Angular',
    [DocsLocale.En]: 'Koobiq — Angular design system'
};

const ICONS_DESCRIPTION: Record<DocsLocale, string> = {
    [DocsLocale.Ru]: 'Каталог иконок дизайн-системы Koobiq с поиском и вариантами использования.',
    [DocsLocale.En]: 'Koobiq design system icon catalog with search and usage options.'
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
};

export type DocsResolvedSeo = {
    title: string;
    description: string;
    canonicalUrl: string | null;
    alternates: ReadonlyArray<{ locale: DocsLocale; url: string }>;
    image: DocsSeoImage;
    keywords: readonly string[];
    locale: DocsLocale;
    noIndex: boolean;
};

type SeoDescriptions = Readonly<Record<string, Partial<Record<DocsLocale, string>>>>;

const generatedDescriptions = DOCS_SEO_DESCRIPTIONS as SeoDescriptions;

const localizedValue = <T>(value: Partial<Record<DocsLocale, T>> | undefined, locale: DocsLocale): T | undefined => {
    return value?.[locale];
};

const resolveItemImagePath = (item: DocsStructureItem): string => {
    if (!item.svgPreview) return FALLBACK_IMAGE_PATH;

    return `/assets/images/welcome/${encodeURIComponent(item.svgPreview)}-light.png`;
};

const resolveImage = (path: string, alt: string): DocsSeoImage => {
    const isFallback = path === FALLBACK_IMAGE_PATH;

    return {
        url: `${SITE_ORIGIN}${path}`,
        alt,
        width: isFallback ? 2048 : 400,
        height: isFallback ? 1024 : 280
    };
};

const defaultImageAlt = (name: string, locale: DocsLocale): string => {
    return locale === DocsLocale.Ru ? `${name} — компонент Koobiq` : `${name} — Koobiq component`;
};

const resolveTabDescription = (item: DocsStructureItem, tab: string | undefined, locale: DocsLocale): string => {
    const itemName = item.name[locale];

    if (tab === DocsStructureItemTab.Api) {
        return locale === DocsLocale.Ru
            ? `API ${itemName} в Koobiq: свойства, события, методы и связанные типы.`
            : `Koobiq ${itemName} API: properties, events, methods, and related types.`;
    }

    if (tab === DocsStructureItemTab.Examples) {
        return locale === DocsLocale.Ru
            ? `Примеры использования ${itemName} в Angular-приложениях с дизайн-системой Koobiq.`
            : `Examples of using ${itemName} in Angular applications with the Koobiq design system.`;
    }

    if (item.id === DocsStructureItemId.DesignTokens && tab && TAB_TITLE[tab as DocsStructureTokensTab]) {
        const tabTitle = TAB_TITLE[tab as DocsStructureTokensTab][locale];

        return locale === DocsLocale.Ru
            ? `${tabTitle}: дизайн-токены Koobiq для создания согласованных интерфейсов.`
            : `${tabTitle}: Koobiq design tokens for building consistent interfaces.`;
    }

    return (
        generatedDescriptions[item.id]?.[locale] ??
        (locale === DocsLocale.Ru
            ? `Документация по ${itemName} в дизайн-системе Koobiq для Angular.`
            : `${itemName} documentation for the Koobiq Angular design system.`)
    );
};

const resolveItemSeo = (
    item: DocsStructureItem,
    tab: string | undefined,
    locale: DocsLocale
): Pick<DocsResolvedSeo, 'title' | 'description' | 'image' | 'keywords' | 'noIndex'> => {
    const tabMeta = tab ? item.seo?.tabs?.[tab as DocsStructureItemTab | DocsStructureTokensTab] : undefined;
    const meta: DocsSeoMeta | undefined = tabMeta;
    const itemTitle =
        localizedValue(meta?.title, locale) ?? localizedValue(item.seo?.title, locale) ?? item.name[locale];
    const tabTitle = tab ? TAB_TITLE[tab as DocsStructureItemTab | DocsStructureTokensTab]?.[locale] : undefined;
    const title = `${itemTitle}${tabTitle ? ` — ${tabTitle}` : ''} ${TITLE_SEPARATOR} ${SITE_NAME}`;
    const description =
        localizedValue(meta?.description, locale) ??
        localizedValue(item.seo?.description, locale) ??
        resolveTabDescription(item, tab, locale);
    const imagePath = meta?.image ?? item.seo?.image ?? resolveItemImagePath(item);
    const imageAlt =
        localizedValue(meta?.imageAlt, locale) ??
        localizedValue(item.seo?.imageAlt, locale) ??
        defaultImageAlt(item.name[locale], locale);

    return {
        title,
        description,
        image: resolveImage(imagePath, imageAlt),
        keywords: localizedValue(meta?.keywords, locale) ?? localizedValue(item.seo?.keywords, locale) ?? [],
        noIndex: meta?.noIndex ?? item.seo?.noIndex ?? false
    };
};

/** Resolves all route-dependent SEO data without touching the DOM, so it can be tested exhaustively. */
export const docsResolveSeo = (rawPath: string, locale: DocsLocale): DocsResolvedSeo => {
    const path = rawPath.split(/[?#]/)[0];
    const segments = path.split('/').filter(Boolean);
    const hasSupportedLocale = DOCS_SUPPORTED_LOCALES.includes(segments[0]);
    const canonicalUrl = hasSupportedLocale ? `${SITE_ORIGIN}${path}` : null;
    const alternates = hasSupportedLocale
        ? DOCS_SUPPORTED_LOCALES.map((alternateLocale) => ({
              locale: alternateLocale as DocsLocale,
              url: `${SITE_ORIGIN}/${alternateLocale}${segments.length > 1 ? `/${segments.slice(1).join('/')}` : ''}`
          }))
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
            description: ICONS_DESCRIPTION[locale],
            canonicalUrl,
            alternates,
            image: resolveImage(ICONS_IMAGE_PATH, defaultImageAlt(categoryName, locale)),
            keywords: [],
            locale,
            noIndex: false
        };
    }

    const isHome = hasSupportedLocale && segments.length === 1;

    return {
        title: isHome ? HOME_TITLE[locale] : SITE_NAME,
        description: SITE_DESCRIPTION[locale],
        canonicalUrl,
        alternates,
        image: resolveImage(FALLBACK_IMAGE_PATH, SITE_NAME),
        keywords: [],
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

        this.document.documentElement.lang = locale;
        this.title.setTitle(seo.title);
        this.updateMeta(seo);
        this.updateCanonical(seo.canonicalUrl);
        this.updateAlternates(seo.alternates);
    }

    private updateMeta(seo: DocsResolvedSeo): void {
        this.setMeta('name', 'description', seo.description);
        this.setMeta('name', 'keywords', seo.keywords.length ? seo.keywords.join(', ') : null);
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

        this.setMeta('name', 'twitter:card', 'summary_large_image');
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
