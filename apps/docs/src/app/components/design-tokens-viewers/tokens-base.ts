import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Directive, inject, PLATFORM_ID, signal, viewChild } from '@angular/core';
import { KBQ_WINDOW, ThemeService } from '@koobiq/components/core';
import { DocsLocaleState } from '../../services/locale';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';

export interface DocsSectionInfo {
    type: string;
    tokens: { token: string; value: string }[];
}

export interface DocsTokensInfo {
    type: string;
    sections?: DocsSectionInfo[];
    tokens?: { token: string; value: string }[];
}

@Directive({
    standalone: true,
    host: {
        class: 'kbq-markdown'
    }
})
export class DocsTokensBase extends DocsLocaleState implements AfterViewInit {
    protected output = signal<DocsTokensInfo[]>([]);
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

    protected readonly themeService = inject(ThemeService);
    protected readonly window = inject(KBQ_WINDOW);
    protected readonly document = inject(DOCUMENT);
    protected readonly platformId = inject(PLATFORM_ID);
    protected readonly wrapper = viewChild(DocsComponentViewerWrapperComponent);

    constructor() {
        super();
        this.themeService.current.subscribe(() => {
            this.output.set(this.calculateViewData());
        });
    }

    ngAfterViewInit() {
        setTimeout(() => this.wrapper()?.scrollToSelectedContentSection());
    }

    protected calculateViewData(): DocsTokensInfo[] {
        if (!isPlatformBrowser(this.platformId)) return [];

        return [];
    }
}
