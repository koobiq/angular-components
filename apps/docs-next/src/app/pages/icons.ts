import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { docsNextGetSection } from '../data/sections';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextPageLayout } from '../ui/page-layout';

/** The icon gallery has filters instead of a side menu (spec/sections/icons.md); it comes in stage 3. */
@Component({
    selector: 'docs-next-icons-page',
    imports: [DocsNextPageLayout],
    template: `
        <docs-next-page-layout [wide]="true" [withActions]="false" [withToc]="false">
            <h1 class="docs-next-h1">{{ section.title[state.locale()] }}</h1>
            <p class="docs-next-lead">{{ state.t('iconsPlaceholder') }}</p>
        </docs-next-page-layout>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextIconsPage {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly section = docsNextGetSection('icons')!;
}
