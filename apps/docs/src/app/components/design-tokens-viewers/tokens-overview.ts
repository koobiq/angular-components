import { DOCUMENT, isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, inject, input, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { KBQ_WINDOW, ThemeService } from '@koobiq/components/core';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { DocsLocaleState } from '../../services/locale';
import { DocsStructureTokensTab } from '../../structure';
import { DocsCodeSnippetDirective } from '../code-snippet/code-snippet';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';

import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { map } from 'rxjs';

import { docsData as borderRadius } from './data/border-radius';
import { docsData as colors } from './data/colors';
import { docsData as palette } from './data/palette';
import { docsData as shadows } from './data/shadows';
import { docsData as sizes } from './data/sizes';

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

export interface DocsTokensInfoRaw {
    type: string;
    sections?: DocsTokensSectionInfoRaw[];
    tokens?: string[];
}

@Component({
    standalone: true,
    selector: 'docs-tokens-table',
    imports: [
        DocsCodeSnippetDirective,
        KbqTableModule,
        KbqTooltipTrigger
    ],
    template: `
        @let outputSection = section();

        @if (outputSection && outputSection.tokens && outputSection.tokens.length > 0) {
            <table kbq-table>
                <thead>
                    <tr class="kbq-caps-compact">
                        <th align="left"></th>
                        <th align="left">{{ localeData.token[locale()] }}</th>
                        <th align="left">{{ localeData.value[locale()] }}</th>
                    </tr>
                </thead>
                <tbody>
                    @for (token of outputSection.tokens; track token) {
                        <tr>
                            <td align="left">
                                <div
                                    [class]="'docs-design-token-example__' + mapTabToType[tab()]"
                                    [style]="getStyle(token.token)"
                                ></div>
                            </td>
                            <td align="left">
                                <div class="docs-design-token-example__var">
                                    <span
                                        docsCodeSnippet
                                        class="kbq-markdown__code"
                                        [kbqTooltip]="localeData.codeSnippet[locale()]"
                                        [kbqTooltipArrow]="false"
                                    >
                                        {{ token.token }}
                                    </span>
                                    <div class="docs-design-token-example__value kbq-mono-normal">
                                        {{ token.value }}
                                    </div>
                                </div>
                            </td>
                            <td align="left">
                                <div class="docs-design-token-example__value kbq-mono-normal">
                                    {{ token.value }}
                                </div>
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        }
    `,
    styleUrls: ['design-tokens.scss']
})
export class DocsTokensTable extends DocsLocaleState {
    readonly section = input<DocsTokensSectionInfo>();
    readonly tab = input.required<DocsStructureTokensTab>();

    readonly mapTabToType: Record<
        Exclude<DocsStructureTokensTab, DocsStructureTokensTab.Typography>,
        'dimensions' | 'sizes' | 'shadows'
    > = {
        [DocsStructureTokensTab.Colors]: 'dimensions',
        [DocsStructureTokensTab.BorderRadius]: 'dimensions',
        [DocsStructureTokensTab.Palette]: 'dimensions',
        [DocsStructureTokensTab.Sizes]: 'sizes',
        [DocsStructureTokensTab.Shadows]: 'shadows'
    };

    readonly mapTabToCssProp: Record<
        Exclude<DocsStructureTokensTab, DocsStructureTokensTab.Typography>,
        'border-radius' | 'background-color' | 'box-shadow' | 'width'
    > = {
        [DocsStructureTokensTab.Colors]: 'background-color',
        [DocsStructureTokensTab.BorderRadius]: 'border-radius',
        [DocsStructureTokensTab.Palette]: 'background-color',
        [DocsStructureTokensTab.Sizes]: 'width',
        [DocsStructureTokensTab.Shadows]: 'box-shadow'
    };

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
    }

    getStyle(token: string) {
        return { [this.mapTabToCssProp[this.tab()]]: `var(${token})` };
    }
}

@Component({
    standalone: true,
    selector: 'docs-tokens-overview',
    imports: [
        DocsComponentViewerWrapperComponent,
        DocsTokensTable,
        NgTemplateOutlet
    ],
    template: `
        <docs-component-viewer-wrapper>
            <div docs-article>
                @for (section of tokensInfo(); track section.type) {
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
            <docs-tokens-table [tab]="activatedTab()" [section]="section" />
            @if (section.sections && section.sections.length > 0) {
                @for (innerSection of section.sections; track innerSection.type) {
                    <ng-container
                        *ngTemplateOutlet="sectionTemplate; context: { $implicit: innerSection, level: level + 1 }"
                    />
                }
            }
        </ng-template>
    `,
    host: {
        class: 'kbq-markdown'
    }
})
export class DocsTokensOverview extends DocsLocaleState implements AfterViewInit {
    protected readonly wrapper = viewChild.required(DocsComponentViewerWrapperComponent);

    protected readonly themeService = inject(ThemeService);
    protected readonly window = inject(KBQ_WINDOW);
    protected readonly document = inject(DOCUMENT);
    protected readonly platformId = inject(PLATFORM_ID);
    protected readonly activatedRoute = inject(ActivatedRoute);

    protected readonly tokensInfo = signal<DocsTokensInfo[]>([]);
    protected readonly activatedTab = toSignal(
        this.activatedRoute.url.pipe(
            map(([{ path: id }]: UrlSegment[]) => <DocsStructureTokensTab>id),
            takeUntilDestroyed()
        ),
        { initialValue: DocsStructureTokensTab.Colors }
    );

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

    protected tokenDataMap: Record<
        Exclude<DocsStructureTokensTab, DocsStructureTokensTab.Typography>,
        DocsTokensInfoRaw[]
    > = {
        [DocsStructureTokensTab.Colors]: colors,
        [DocsStructureTokensTab.Shadows]: shadows,
        [DocsStructureTokensTab.BorderRadius]: borderRadius,
        [DocsStructureTokensTab.Sizes]: sizes,
        [DocsStructureTokensTab.Palette]: palette
    };

    constructor() {
        super();
        this.themeService.current.pipe(takeUntilDestroyed()).subscribe(() => {
            this.tokensInfo.set(this.calculateViewData());
        });
    }

    ngAfterViewInit() {
        setTimeout(() => this.wrapper().scrollToSelectedContentSection());
    }

    protected calculateViewData(): DocsTokensInfo[] {
        if (!isPlatformBrowser(this.platformId)) return [];

        const styles = this.window.getComputedStyle(this.document.body);

        const getTokenValue = (token: string) => styles.getPropertyValue(token);

        return this.tokenDataMap[this.activatedTab()].map((section: DocsTokensInfoRaw) => {
            if (section.tokens && section.tokens.length > 0) {
                return {
                    type: section.type,
                    tokens: section.tokens.map((token) => ({ token, value: getTokenValue(token) }))
                };
            }

            if (section.sections && section.sections.length > 0) {
                return {
                    type: section.type,
                    sections: section.sections.map((innerSection: DocsTokensSectionInfoRaw) => {
                        if (innerSection.tokens && innerSection.tokens.length > 0) {
                            return {
                                type: innerSection.type,
                                tokens: innerSection.tokens.map((token) => ({
                                    token,
                                    value: getTokenValue(token)
                                }))
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
