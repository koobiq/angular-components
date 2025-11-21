import { Component, signal, viewChild } from '@angular/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsLocaleState } from '../../services/locale';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';

import { TitleCasePipe } from '@angular/common';
import { KbqTableModule } from '@koobiq/components/table';
import { docsData } from './data/typography';

export interface DocsTokensSectionInfo {
    type: string;
    tokens: { token: string; value: string }[];
}

export interface DocsTokensInfo {
    type: string;
    sections?: DocsTokensSectionInfo[];
    tokens?: { token: string; value: string }[];
}

export interface DocsTokensSectionInfoRaw {
    type: string;
    tokens: string[];
}

@Component({
    standalone: true,
    selector: 'docs-typography-table',
    imports: [
        DocsComponentViewerWrapperComponent,
        KbqToolTipModule,
        DocsCodeSnippetDirective,
        KbqTableModule,
        TitleCasePipe
    ],
    template: `
        <docs-component-viewer-wrapper>
            <table kbq-table id="font-classes-table" docs-article>
                <thead>
                    <tr>
                        <th>Typography Example</th>
                        <th>CSS Class Name</th>
                    </tr>
                </thead>
                <tbody>
                    @for (token of tokensInfo(); track token) {
                        <tr>
                            <td>
                                <div [class]="'kbq-' + token">{{ token | titlecase }}</div>
                            </td>
                            <td>
                                <span
                                    docsCodeSnippet
                                    class="kbq-markdown__code"
                                    [kbqTooltip]="localeData.codeSnippet[locale()]"
                                    [kbqTooltipArrow]="false"
                                >
                                    kbq-{{ token }}
                                </span>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </docs-component-viewer-wrapper>
    `,
    host: {
        class: 'kbq-markdown'
    }
})
export class DocsTypographyTable extends DocsLocaleState {
    protected readonly wrapper = viewChild.required(DocsComponentViewerWrapperComponent);

    protected readonly tokensInfo = signal<string[]>([]);

    protected readonly localeData = {
        token: {
            ru: 'Токен',
            en: 'Token'
        },
        value: {
            ru: 'Значение',
            en: 'Value'
        },
        codeSnippet: {
            ru: 'Скопировать',
            en: 'Copy'
        }
    };

    constructor() {
        super();

        this.tokensInfo.set(docsData);
    }
}
