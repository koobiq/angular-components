import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';
import { docsData } from './data/palette';
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
    selector: 'docs-design-tokens-sizes',
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
        class: 'docs-design-tokens-palette'
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
export class DocsTokensPalette extends DocsTokensBase implements AfterViewInit {
    protected colors: DocsColorsInfo[];

    constructor() {
        super();
    }

    protected override calculateViewData(): void {
        const styles = this.window.getComputedStyle(this.document.body);

        const getTokenValue = (token: string) => styles.getPropertyValue(token);

        this.colors = [
            {
                type: 'No-header',
                tokens: docsData.map((token) => ({ token, value: getTokenValue(token) }))
            }
        ];
    }
}
