import { Component, signal, viewChild } from '@angular/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { DocsLocaleState } from '../../services/locale';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';

import { TitleCasePipe } from '@angular/common';
import { KbqTableModule } from '@koobiq/components/table';
import { docsData } from './data/typography';

@Component({
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
            <table kbq-table class="docs-font-classes-table" docs-article [border]="true">
                <thead>
                    <tr class="kbq-caps-compact">
                        <th>{{ localeData.typographyExample[locale()] }}</th>
                        <th>{{ localeData.cssClassName[locale()] }}</th>
                    </tr>
                </thead>
                <tbody>
                    @for (token of tokensInfo(); track token) {
                        <tr>
                            <td>
                                <div [class]="getClassName(token)">{{ token | titlecase }}</div>
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
    },
    styleUrls: ['design-tokens.scss']
})
export class DocsTypographyTable extends DocsLocaleState {
    protected readonly wrapper = viewChild.required(DocsComponentViewerWrapperComponent);

    protected readonly tokensInfo = signal(docsData);

    protected readonly localeData = {
        typographyExample: {
            ru: 'Пример типографики',
            en: 'Typography Example'
        },
        cssClassName: {
            ru: 'Имя CSS-класса',
            en: 'CSS Class Name'
        },
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

    getClassName(text: string): string {
        return `kbq-${text}`;
    }
}
