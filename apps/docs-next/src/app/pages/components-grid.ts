import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_NEXT_COMPONENTS } from '../data/components';
import { docsNextFrameworkTitle } from '../data/site';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextPageLayout } from '../ui/page-layout';

/**
 * Every component in alphabetical order; the ones missing in the selected framework are grey cards leading to the
 * stub (spec/components/components.md). SVG previews come in stage 3.
 */
@Component({
    selector: 'docs-next-components-grid-page',
    imports: [RouterLink, DocsNextPageLayout],
    template: `
        <docs-next-page-layout [wide]="true" [withActions]="false" [withToc]="false">
            <h1 class="docs-next-h1">{{ state.t('allComponents') }}</h1>
            <p class="docs-next-lead">{{ lead() }}</p>

            <ul class="docs-next-grid">
                @for (component of components; track component.id) {
                    <li>
                        <a
                            class="docs-next-grid__card"
                            [class.docs-next-grid__card_unavailable]="!component[state.framework()]"
                            [routerLink]="state.link('components', component.id)"
                        >
                            <span class="docs-next-grid__preview" aria-hidden="true"></span>
                            <span class="docs-next-grid__title">{{ component.title }}</span>
                        </a>
                    </li>
                }
            </ul>
        </docs-next-page-layout>
    `,
    styles: `
        .docs-next-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: var(--kbq-size-l);
            margin: var(--kbq-size-xxl) 0 0;
            padding: 0;
            list-style: none;
        }

        @media (max-width: 719.98px) {
            .docs-next-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: var(--kbq-size-l) var(--kbq-size-m);
                margin-top: var(--kbq-size-xl);
            }
        }

        .docs-next-grid__card {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            color: var(--kbq-foreground-contrast);
            text-decoration: none;
            outline: none;
            border-radius: var(--kbq-size-m);
        }

        .docs-next-grid__card:focus-visible {
            box-shadow: 0 0 0 2px var(--kbq-states-line-focus-theme);
        }

        .docs-next-grid__preview {
            display: block;
            aspect-ratio: 16 / 10;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-m);
            background: var(--kbq-background-bg-secondary);
        }

        .docs-next-grid__card:hover .docs-next-grid__preview {
            border-color: var(--kbq-line-contrast-fade);
        }

        .docs-next-grid__title {
            font-size: var(--kbq-typography-text-normal-medium-font-size);
            font-weight: var(--kbq-typography-text-normal-medium-font-weight);
            line-height: var(--kbq-typography-text-normal-medium-line-height);
        }

        .docs-next-grid__card_unavailable {
            color: var(--kbq-foreground-contrast-secondary);
        }

        .docs-next-grid__card_unavailable .docs-next-grid__preview {
            opacity: 0.5;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextComponentsGridPage {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly components = DOCS_NEXT_COMPONENTS;
    protected readonly lead = computed(() =>
        this.state.t('componentsLead', { framework: docsNextFrameworkTitle(this.state.framework()) })
    );
}
