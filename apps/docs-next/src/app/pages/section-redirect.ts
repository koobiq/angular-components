import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { docsNextGetSection, docsNextGetSectionPages, docsNextIsAvailable } from '../data/sections';

/** A section opens on its first page in the selected framework. */
@Component({
    selector: 'docs-next-section-redirect',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextSectionRedirect {
    constructor() {
        const params = inject(ActivatedRoute).snapshot.paramMap;
        const section = docsNextGetSection(params.get('section') ?? '');
        const framework = params.get('framework') === 'react' ? 'react' : 'angular';
        const first = section && docsNextGetSectionPages(section).find((page) => docsNextIsAvailable(page, framework));

        const base = `/${params.get('locale')}/${framework}`;

        inject(Router).navigateByUrl(first ? `${base}/${section.id}/${first.id}` : base, { replaceUrl: true });
    }
}
