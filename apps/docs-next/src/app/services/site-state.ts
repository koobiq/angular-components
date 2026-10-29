import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { filter, map } from 'rxjs/operators';
import { DOCS_NEXT_COMPONENTS } from '../data/components';
import { docsNextGetSection, docsNextGetSectionPages, docsNextIsAvailable } from '../data/sections';
import {
    DOCS_NEXT_I18N,
    DOCS_NEXT_MOBILE_QUERY,
    DOCS_NEXT_VERSIONS,
    docsNextFormat,
    DocsNextFramework,
    docsNextFrameworkTitle,
    DocsNextI18nKey,
    docsNextIsFramework,
    docsNextIsLocale,
    DocsNextLocale,
    DocsNextVersion,
    docsNextVersionsOfCount
} from '../data/site';

const STORAGE_KEYS = { locale: 'docs-next-locale', framework: 'docs-next-framework', version: 'docs-next-version' };

/** Reads a stored choice; storage may be unavailable, for instance in a private window. */
const readStored = (storage: Storage, key: string): string | null => {
    try {
        return storage.getItem(key);
    } catch {
        return null;
    }
};

const writeStored = (storage: Storage, key: string, value: string): void => {
    try {
        storage.setItem(key, value);
    } catch {
        // The choice just won't outlive the visit.
    }
};

/** Parts of a path `/:locale/:framework/:section/:page/:tab`. */
interface DocsNextPath {
    locale: DocsNextLocale;
    framework: DocsNextFramework;
    rest: string[];
}

const parsePath = (url: string): DocsNextPath | null => {
    const [locale, framework, ...rest] = url.split(/[?#]/)[0].split('/').filter(Boolean);

    return docsNextIsLocale(locale) && docsNextIsFramework(framework) ? { locale, framework, rest } : null;
};

/** The language, framework and version the visitor looks at, all of which the header switches. */
@Injectable({ providedIn: 'root' })
export class DocsNextSiteState {
    private readonly router = inject(Router);
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);
    private readonly storage = this.window.localStorage;
    private readonly mobileQuery = this.window.matchMedia?.(DOCS_NEXT_MOBILE_QUERY);

    private readonly url = toSignal(
        this.router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            map(({ urlAfterRedirects }) => urlAfterRedirects)
        ),
        { initialValue: this.router.url }
    );

    private readonly path = computed(() => parsePath(this.url()));

    readonly locale = computed<DocsNextLocale>(() => this.path()?.locale ?? docsNextStoredLocale(this.storage));
    readonly framework = computed<DocsNextFramework>(
        () => this.path()?.framework ?? docsNextStoredFramework(this.storage)
    );
    /** Section, page and subsection of the open page. */
    readonly rest = computed(() => this.path()?.rest ?? []);
    readonly section = computed(() => this.rest()[0] ?? null);

    /** Versions to pick from; `?versions=N` in the address the site opens with tries a list of another length. */
    readonly versions = signal<readonly DocsNextVersion[]>(DOCS_NEXT_VERSIONS);
    readonly version = signal(readStored(this.storage, STORAGE_KEYS.version) ?? '20');
    readonly versionTitle = computed(
        () => this.versions().find(({ id }) => id === this.version())?.title ?? this.version()
    );

    /** Whether the phone layout is on. */
    readonly isMobile = signal(this.mobileQuery?.matches ?? false);

    /** Repository of the selected framework, until the monorepo of both libraries exists. */
    readonly githubUrl = computed(() =>
        this.framework() === 'angular'
            ? 'https://github.com/koobiq/angular-components'
            : 'https://github.com/koobiq/react-components'
    );

    /** Explains why a framework switch opened another page than the one the visitor was on. */
    readonly notice = signal<string | null>(null);
    private pendingNotice: string | null = null;

    constructor() {
        effect(() => {
            writeStored(this.storage, STORAGE_KEYS.locale, this.locale());
            writeStored(this.storage, STORAGE_KEYS.framework, this.framework());
            this.document.documentElement.lang = this.locale();
        });

        effect(() => writeStored(this.storage, STORAGE_KEYS.version, this.version()));

        const count = Number(new URLSearchParams(this.window.location.search).get('versions'));

        if (Number.isInteger(count) && count > 0) this.versions.set(docsNextVersionsOfCount(count));

        this.mobileQuery?.addEventListener('change', ({ matches }) => this.isMobile.set(matches));

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.notice.set(this.pendingNotice);
            this.pendingNotice = null;
        });
    }

    t(key: DocsNextI18nKey, values?: Record<string, string>): string {
        const text = DOCS_NEXT_I18N[key][this.locale()];

        return values ? docsNextFormat(text, values) : text;
    }

    /** Link to a page of the current language and framework. */
    link(...parts: string[]): string {
        return ['', this.locale(), this.framework(), ...parts].join('/');
    }

    /** The open page in another language. */
    localeUrl(locale: DocsNextLocale): string {
        return ['', locale, this.framework(), ...this.rest()].join('/');
    }

    /**
     * The open page in another framework (spec/context/framework.md). A component stays on its address, where a stub
     * replaces a missing implementation; another page missing in that framework gives way to the first page of its
     * section, with a notice.
     */
    frameworkTarget(framework: DocsNextFramework): { url: string; notice: string | null } {
        const [sectionId, pageId, ...tail] = this.rest();
        const base = ['', this.locale(), framework];
        const section = sectionId ? docsNextGetSection(sectionId) : undefined;
        const page = section && pageId ? docsNextGetSectionPages(section).find(({ id }) => id === pageId) : undefined;

        if (!section || !page || docsNextIsAvailable(page, framework)) {
            return { url: [...base, ...this.rest()].join('/'), notice: null };
        }

        const first = docsNextGetSectionPages(section).find((item) => docsNextIsAvailable(item, framework));
        const notice = this.t('redirectedNotice', {
            page: page.title[this.locale()],
            framework: docsNextFrameworkTitle(framework),
            section: section.title[this.locale()]
        });

        return { url: [...base, section.id, first?.id ?? '', ...(first ? [] : tail)].join('/'), notice };
    }

    /** Shows the notice once the navigation it explains ends. */
    setPendingNotice(notice: string | null): void {
        this.pendingNotice = notice;
    }

    /** Component of the open page, if it is a component page. */
    readonly component = computed(() =>
        this.section() === 'components' ? DOCS_NEXT_COMPONENTS.find(({ id }) => id === this.rest()[1]) : undefined
    );
}

/** Called in an injection context unless a storage is passed. */
export const docsNextStoredLocale = (storage = inject(KBQ_WINDOW).localStorage): DocsNextLocale => {
    const stored = readStored(storage, STORAGE_KEYS.locale);

    return docsNextIsLocale(stored) ? stored : 'ru';
};

/** Angular is the default framework of a first visit (spec/context/framework.md). */
export const docsNextStoredFramework = (storage = inject(KBQ_WINDOW).localStorage): DocsNextFramework => {
    const stored = readStored(storage, STORAGE_KEYS.framework);

    return docsNextIsFramework(stored) ? stored : 'angular';
};
