import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsNextSiteState } from '../services/site-state';

/**
 * "Coming soon" for a component missing in the selected framework (spec/context/stub-page.md): the title of the
 * component, what is going on, and two next steps. No subsections, example or contents.
 */
@Component({
    selector: 'docs-next-stub',
    imports: [KbqButtonModule, KbqIconModule, KbqLinkModule],
    template: `
        <h1 class="docs-next-h1">{{ title() }}</h1>
        <div class="docs-next-stub__card">
            <img
                alt=""
                class="docs-next-stub__image"
                height="160"
                src="assets/images/koobiq-illustration-wip.png"
                width="320"
            />
            <h2 class="docs-next-stub__title">{{ state.t('stubTitle') }}</h2>
            <p class="docs-next-stub__text">{{ text() }}</p>
            <div class="docs-next-stub__actions">
                <a
                    kbq-button
                    color="contrast"
                    href="https://github.com/koobiq/react-components/issues/new"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    <i kbq-icon="kbq-github_16" kbqButtonPrefix></i>
                    {{ state.t('stubCreateIssue') }}
                </a>
                <a kbqLink external size="big" href="https://react.koobiq.io" rel="noopener noreferrer" target="_blank">
                    {{ state.t('stubStorybook') }}
                </a>
            </div>
        </div>
    `,
    styles: `
        .docs-next-stub__card {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: var(--kbq-size-xxl);
            padding: var(--kbq-size-5xl) var(--kbq-size-xxl);
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-m);
            text-align: center;
        }

        .docs-next-stub__image {
            margin-bottom: var(--kbq-size-xl);
        }

        .docs-next-stub__title {
            margin: 0 0 var(--kbq-size-s);
            font-family: var(--kbq-typography-title-font-family);
            font-size: var(--kbq-typography-title-font-size);
            font-weight: var(--kbq-typography-title-font-weight);
            line-height: var(--kbq-typography-title-line-height);
        }

        .docs-next-stub__text {
            max-width: 480px;
            margin: 0 0 var(--kbq-size-xl);
            font-size: var(--kbq-typography-text-big-font-size);
            line-height: var(--kbq-typography-text-big-line-height);
            color: var(--kbq-foreground-contrast-secondary);
        }

        .docs-next-stub__actions {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-xl);
        }

        @media (max-width: 719.98px) {
            .docs-next-stub__card {
                margin-top: var(--kbq-size-xl);
                padding: var(--kbq-size-xxl) var(--kbq-size-l);
            }

            .docs-next-stub__image {
                width: 100%;
                height: auto;
            }

            .docs-next-stub__actions {
                flex-direction: column;
                gap: var(--kbq-size-l);
                width: 100%;
            }

            .docs-next-stub__actions .kbq-button {
                width: 100%;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextStub {
    protected readonly state = inject(DocsNextSiteState);

    readonly title = input.required<string>();
    readonly text = input.required<string>();
}
