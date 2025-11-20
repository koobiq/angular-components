import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';
import { docsData } from './data/colors';
import { DocsTokensBase } from './tokens-base';

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
    selector: 'docs-design-tokens-colors',
    template: `
        <docs-component-viewer-wrapper>
            <div docs-article>
                @for (section of colors; track section.type) {
                    <ng-container *ngTemplateOutlet="sectionTemplate; context: { $implicit: section, level: 3 }" />
                }
            </div>
        </docs-component-viewer-wrapper>

        <ng-template #sectionTemplate let-section let-level="level">
            @if (section.type && section.type !== 'No-header') {
                <div [class]="'docs-header-link kbq-markdown__h' + level" [id]="section.type">
                    {{ section.type }}
                </div>
            }
            <ng-container *ngTemplateOutlet="tokensTable; context: { $implicit: section }" />
            @if (section.sections && section.sections.length > 0) {
                @for (innerSection of section.sections; track innerSection.type) {
                    <ng-container
                        *ngTemplateOutlet="sectionTemplate; context: { $implicit: innerSection, level: level + 1 }"
                    />
                }
            }
        </ng-template>

        <ng-template #tokensTable let-section>
            @if (section.tokens && section.tokens.length > 0) {
                <table kbq-table>
                    <thead>
                        <tr>
                            <th align="left"></th>
                            <th align="left">{{ localeData.token[locale()] }}</th>
                            <th align="left">{{ localeData.value[locale()] }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (token of section.tokens; track token.value) {
                            <tr>
                                <td align="left">
                                    <div
                                        class="kbq-design-token-example__dimensions"
                                        [style.background-color]="'var(' + token.token + ')'"
                                    ></div>
                                </td>
                                <td align="left">
                                    <div class="kbq-design-token-example__var">
                                        <span
                                            docsCodeSnippet
                                            class="kbq-markdown__code"
                                            [kbqTooltip]="localeData.codeSnippet[locale()]"
                                            [kbqTooltipArrow]="false"
                                        >
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
            }
        </ng-template>
    `,
    host: {
        class: 'docs-design-tokens-colors'
    },
    imports: [
        KbqDividerModule,
        KbqLinkModule,
        KbqTableModule,
        DocsCodeSnippetDirective,
        NgTemplateOutlet,
        KbqToolTipModule,
        DocsComponentViewerWrapperComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsTokensColors extends DocsTokensBase implements AfterViewInit {
    protected colors: DocsColorsInfo[];

    constructor() {
        super();
    }

    override calculateViewData(): void {
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
    }
}
