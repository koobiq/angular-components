import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_NEXT_SECTIONS } from '../data/sections';
import { DocsNextSiteState } from '../services/site-state';
import { DocsNextPageLayout } from '../ui/page-layout';

const DESCRIPTIONS: Record<string, { ru: string; en: string }> = {
    development: {
        ru: 'Установка, темизация, миграции и справочник.',
        en: 'Installation, theming, migrations, reference.'
    },
    components: { ru: 'Компоненты для выбранного фреймворка.', en: 'Components for the selected framework.' },
    design: {
        ru: 'Цвета, типографика, тени, размеры и гайды по контенту.',
        en: 'Colors, type, shadows, sizes, content.'
    },
    icons: { ru: 'Галерея значков.', en: 'The icon gallery.' },
    patterns: { ru: 'Приёмы взаимодействия.', en: 'Interaction patterns.' },
    templates: { ru: 'Целые композиции страниц.', en: 'Whole page compositions.' }
};

/**
 * Opens from the logo; not a section of the menu (spec/overview.md). The texts are placeholders until the structure
 * is agreed.
 */
@Component({
    selector: 'docs-next-home-page',
    imports: [RouterLink, DocsNextPageLayout],
    template: `
        <docs-next-page-layout [withActions]="false" [withToc]="false">
            <h1 class="docs-next-h1">{{ state.t('homeTitle') }}</h1>
            <p class="docs-next-lead">{{ state.t('homeLead') }}</p>

            <ul class="docs-next-home__sections">
                @for (section of sections; track section.id) {
                    <li>
                        <a class="docs-next-home__section" [routerLink]="state.link(section.id)">
                            <span class="docs-next-home__title">{{ section.title[state.locale()] }}</span>
                            <span class="docs-next-home__text">{{ descriptions[section.id][state.locale()] }}</span>
                        </a>
                    </li>
                }
            </ul>
        </docs-next-page-layout>
    `,
    styles: `
        .docs-next-home__sections {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--kbq-size-m);
            margin: var(--kbq-size-3xl) 0 0;
            padding: 0;
            list-style: none;
        }

        .docs-next-home__section {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xxs);
            height: 100%;
            box-sizing: border-box;
            padding: var(--kbq-size-l) var(--kbq-size-xl);
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-m);
            color: var(--kbq-foreground-contrast);
            text-decoration: none;
            outline: none;
        }

        .docs-next-home__section:hover {
            background: var(--kbq-states-background-transparent-hover);
        }

        .docs-next-home__section:focus-visible {
            box-shadow: 0 0 0 2px var(--kbq-states-line-focus-theme);
        }

        .docs-next-home__title {
            font-family: var(--kbq-typography-title-font-family);
            font-size: var(--kbq-typography-title-font-size);
            font-weight: var(--kbq-typography-title-font-weight);
            line-height: var(--kbq-typography-title-line-height);
        }

        @media (max-width: 719.98px) {
            .docs-next-home__sections {
                grid-template-columns: 1fr;
                margin-top: var(--kbq-size-xxl);
            }
        }

        .docs-next-home__text {
            color: var(--kbq-foreground-contrast-secondary);
            font-size: var(--kbq-typography-text-normal-font-size);
            line-height: var(--kbq-typography-text-normal-line-height);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextHomePage {
    protected readonly state = inject(DocsNextSiteState);
    protected readonly sections = DOCS_NEXT_SECTIONS;
    protected readonly descriptions = DESCRIPTIONS;
}
