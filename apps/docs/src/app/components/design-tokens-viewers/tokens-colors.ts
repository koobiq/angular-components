import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, ThemeService } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { DocsAnchorsComponent } from '../anchors/anchors.component';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsOverviewComponentBase } from '../component-viewer/component-viewer.component';
import { docsData } from './data/colors';

interface SectionInfo {
    type: string;
    tokens: { token: string; value: string }[];
}

interface DocsColorsInfo {
    type: string;
    sections?: SectionInfo[];
    tokens?: { token: string; value: string }[];
}

@Component({
    standalone: true,
    selector: 'docs-design-tokens-overview',
    template: `
        <div class="docs-component-viewer__article">
            @for (section of colors; track section) {
                @if (section.type && section.type !== 'No-header') {
                    <div class="docs-header-link kbq-markdown__h3" [id]="section.type">{{ section.type }}</div>
                }
                @if (section.tokens && section.tokens.length > 0) {
                    <ng-container *ngTemplateOutlet="tokensTable; context: { $implicit: section.tokens }" />
                }
                @if (section.sections && section.sections.length > 0) {
                    @for (innerSection of section.sections; track innerSection.type) {
                        @if (innerSection.type && innerSection.type !== 'No-header') {
                            <div class="docs-header-link kbq-markdown__h4" [id]="innerSection.type">
                                {{ innerSection.type }}
                            </div>
                        }
                        @if (innerSection.tokens && innerSection.tokens.length > 0) {
                            <ng-container
                                *ngTemplateOutlet="tokensTable; context: { $implicit: innerSection.tokens }"
                            />
                        }
                    }
                }
            }
            <kbq-divider class="docs-article__divider" />

            <div class="kbq-callout kbq-callout_contrast">
                <div class="kbq-callout__header">
                    {{ isRuLocale() ? 'Вопросы и предложения по документации' : 'Docs Feedback' }}
                </div>

                <div class="kbq-callout__content kbq-docs-element-last-child-margin-bottom-0">
                    @if (isRuLocale()) {
                        Если у вас есть вопросы или вы хотите внести свой вклад в написание документации, пожалуйста,
                        <a big href="https://github.com/koobiq/angular-components/issues/new/choose" kbq-link>
                            создайте issue
                        </a>
                        в нашем репозитории на GitHub.
                    } @else {
                        If you have any questions or would like to contribute to writing the documentation, please
                        <a big href="https://github.com/koobiq/angular-components/issues/new/choose" kbq-link>
                            create an issue
                        </a>
                        in our GitHub repository.
                    }
                </div>
            </div>
        </div>

        <div class="docs-component-viewer__sticky-wrapper">
            <docs-anchors [headerSelectors]="'.docs-header-link'" />
        </div>

        <ng-template #tokensTable let-tokens>
            <table kbq-table>
                <thead>
                    <tr>
                        <th align="left"></th>
                        <th align="left">Токен</th>
                        <th align="left">Значение</th>
                    </tr>
                </thead>
                <tbody>
                    @for (token of tokens; track token.value) {
                        <tr>
                            <td align="left">
                                <div
                                    class="kbq-design-token-example__dimensions"
                                    [style.background-color]="'var(' + token.token + ')'"
                                ></div>
                            </td>
                            <td align="left">
                                <div class="kbq-design-token-example__var">
                                    <span docsCodeSnippet class="kbq-markdown__code" [kbqTooltip]="'Скопировать'">
                                        {{ token.token }}
                                    </span>
                                    <div class="kbq-design-token-example__value kbq-mono-normal">
                                        {{ token.value }}
                                    </div>
                                </div>
                            </td>
                            <td align="left">
                                <div class="kbq-design-token-example__value kbq-mono-normal">
                                    {{ token.value }}
                                </div>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </ng-template>
    `,
    host: {
        class: 'docs-tokens-colors kbq-markdown docs-component-overview'
    },
    imports: [
        KbqDividerModule,
        DocsAnchorsComponent,
        KbqLinkModule,
        KbqTableModule,
        DocsCodeSnippetDirective,
        NgTemplateOutlet,
        KbqTooltipTrigger
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsTokensColors extends DocsOverviewComponentBase implements AfterViewInit {
    protected colors: DocsColorsInfo[];

    protected readonly themeService = inject(ThemeService);
    private readonly window = inject(KBQ_WINDOW);
    private readonly document = inject(DOCUMENT);

    constructor() {
        super();

        this.themeService.current.pipe(takeUntilDestroyed()).subscribe(() => {
            const styles = this.window.getComputedStyle(this.document.body);

            const getTokenValue = (token: string) => styles.getPropertyValue(token);

            this.colors = docsData.map((section) => {
                if (section.tokens && section.tokens.length > 0) {
                    return {
                        type: section.type,
                        tokens: section.tokens.map((token) => ({ token, value: getTokenValue(token) }))
                    };
                }

                if (section.sections && section.sections.length > 0) {
                    return {
                        type: section.type,
                        sections: section.sections.map((innerSection) => {
                            if (innerSection.tokens && innerSection.tokens.length > 0) {
                                return {
                                    type: innerSection.type,
                                    tokens: innerSection.tokens.map((token) => ({ token, value: getTokenValue(token) }))
                                };
                            }

                            return { type: section.type, tokens: [] };
                        })
                    };
                }

                return { type: section.type };
            });
        });
    }

    ngAfterViewInit() {
        this.scrollToSelectedContentSection();
    }
}
