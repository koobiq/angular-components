import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DOCS_NEXT_COMPONENTS } from '../data/components';
import { docsNextGetSection, docsNextGetSectionPages } from '../data/sections';
import { DocsNextSiteState } from './site-state';

const SITE_TITLE = 'Koobiq';

/**
 * Names the browser tab after the open page, from the same data the menu is made of, so it is right before the content
 * of the page has arrived.
 */
@Injectable({ providedIn: 'root' })
export class DocsNextPageTitle {
    private readonly state = inject(DocsNextSiteState);
    private readonly title = inject(Title);

    constructor() {
        inject(Router)
            .events.pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(({ urlAfterRedirects }) => this.update(urlAfterRedirects));
    }

    private update(url: string): void {
        const [, , sectionId, pageId] = url.split(/[?#]/)[0].split('/').slice(1);
        const name = this.nameOf(sectionId, pageId);

        this.title.setTitle(name ? `${name} — ${SITE_TITLE}` : SITE_TITLE);
    }

    private nameOf(sectionId: string | undefined, pageId: string | undefined): string | undefined {
        const locale = this.state.locale();
        const section = docsNextGetSection(sectionId ?? '');

        if (!section) return undefined;

        if (section.id === 'components') {
            return DOCS_NEXT_COMPONENTS.find(({ id }) => id === pageId)?.title ?? section.title[locale];
        }

        return docsNextGetSectionPages(section).find(({ id }) => id === pageId)?.title[locale] ?? section.title[locale];
    }
}
