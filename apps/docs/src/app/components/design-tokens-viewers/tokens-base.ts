import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Directive, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, ThemeService } from '@koobiq/components/core';
import { DocsLocaleState } from '../../services/locale';
import { DocsComponentViewerWrapperComponent } from '../component-viewer/component-viewer-wrapper';

@Directive({
    standalone: true,
    host: {
        class: 'kbq-markdown'
    }
})
export class DocsTokensBase extends DocsLocaleState implements AfterViewInit {
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
    protected readonly wrapper = viewChild(DocsComponentViewerWrapperComponent);

    constructor() {
        super();
        this.themeService.current.pipe(takeUntilDestroyed()).subscribe(() => {
            this.calculateViewData();
        });
    }

    ngAfterViewInit() {
        this.wrapper()?.scrollToSelectedContentSection();
    }

    protected calculateViewData(): void {}
}
