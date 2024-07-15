import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { KbqCodeFile } from '@koobiq/components/code-block';
import { KbqSidepanelPosition, KbqSidepanelService } from '@koobiq/components/sidepanel';
import { take } from 'rxjs/operators';

const codeJs2 = `import { Clipboard } from '@angular/cdk/clipboard';
import {
    Component,
    ViewEncapsulation,
    Input,
    Inject,
    InjectionToken,
    ChangeDetectionStrategy,
    Optional,
    ElementRef,
    ChangeDetectorRef,
    OnDestroy,
    ViewChild,
    Renderer2
} from '@angular/core';
import { KbqTabChangeEvent, KbqTabGroup } from '@koobiq/components/tabs';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
    KbqCodeBlockConfiguration,
    KbqCodeFile
} from './code-block.types';


export const COPIED_MESSAGE_TOOLTIP_TIMEOUT = 100;
export const DEFAULT_EXTENSION = 'txt';
export const LANGUAGES_EXTENSIONS = {
    html: 'html',
    css: 'css',
    php: 'php',
    java: 'java',
    bash: 'sh',
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    ruby: 'rb',
    c: 'c',
    'c++': 'cpp',
    'c#': 'cs',
    csharp: 'cs',
    lua: 'lua',
    xml: 'xml',
    json: 'json'
};

export const KBQ_CODE_BLOCK_CONFIGURATION = new InjectionToken<any>('KbqCodeBlockConfiguration');

export const KBQ_CODE_BLOCK_DEFAULT_CONFIGURATION = {
    softWrapOnTooltip: 'Включить перенос по словам',
    softWrapOffTooltip: 'Выключить перенос по словам',
    downloadTooltip: 'Скачать',
    copiedTooltip: '✓ Скопировано',
    copyTooltip: 'Скопировать',
    viewAllText: 'Показать все',
    viewLessText: 'Свернуть',
    openExternalSystemTooltip: 'Открыть во внешней системе'
};


const actionBarBlockLeftMargin = 24;

@Component({
    selector: 'kbq-code-block',
    exportAs: 'kbqCodeBlock',
    templateUrl: './code-block.component.html',
    styleUrls: ['./code-block.scss'],
    host: {
        class: 'kbq-code-block',
        '[class.kbq-code-block_filled]': 'lessContrast',
        '[class.kbq-code-block_hide-line-numbers]': '!lineNumbers',
        '[class.kbq-code-block_single-file]': 'codeFiles.length === 1',
        '[class.kbq-code-block_no-header]': 'noHeader',
        '(window:resize)': 'resizeStream.next($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqCodeBlockComponent implements OnDestroy {

    @ViewChild(KbqTabGroup) tabGroup: KbqTabGroup;

    @Input() lineNumbers = true;
    @Input() codeFiles: KbqCodeFile[];
    @Input() lessContrast: boolean;
    @Input() maxHeight: number;
    @Input() softWrap: boolean = false;

    get noHeader(): any {
        return this.codeFiles.length === 1 && !this.codeFiles[0].filename;
    }

    selectedTabIndex = 0;
    copied: boolean = false;
    viewAll: boolean = false;
    multiLine: boolean = false;

    readonly resizeStream = new Subject<Event>();

    private readonly resizeDebounceInterval: number = 100;
    private resizeSubscription = Subscription.EMPTY;

    constructor(
        private elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        private clipboard: Clipboard,
        private renderer: Renderer2,
        @Optional() @Inject(KBQ_CODE_BLOCK_CONFIGURATION) public config: KbqCodeBlockConfiguration
    ) {
        this.config = config || KBQ_CODE_BLOCK_DEFAULT_CONFIGURATION;

        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.resizeDebounceInterval))
            .subscribe(this.updateHeader);
    }

    ngOnDestroy(): void {
        this.resizeSubscription.unsubscribe();
    }

    updateHeader = () => {
        const clientWidth: number = this.elementRef.nativeElement.querySelector('kbq-actionbar-block').clientWidth;

        this.renderer.setStyle(
            this.tabGroup.tabHeader.elementRef.nativeElement,
            'margin-right',
            '\${actionBarBlockLeftMargin + clientWidth}px'
        );

        this.changeDetectorRef.markForCheck();
    }

    toggleSoftWrap() {
        this.softWrap = !this.softWrap;
    }

    toggleViewAll() {
        this.viewAll = !this.viewAll;
    }

    downloadCode() {
        const codeFile = this.codeFiles[this.selectedTabIndex];
        const blob = new Blob([codeFile.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.setAttribute('href', url);
        link.setAttribute('download', '\${this.getFullFileName(codeFile)}');
        link.click();
    }

    copyCode() {
        this.clipboard.copy(this.codeFiles[this.selectedTabIndex].content);
        this.copied = true;
    }

    openExternalSystem() {
        const externalLink = this.codeFiles[this.selectedTabIndex].link;
        window.open(externalLink, '_blank');
    }

    onHighlighted() {
        setTimeout(this.updateMultiline, 1);
    }

    getMaxHeight(): string {
        return this.maxHeight > 0 && !this.viewAll ? '\${this.maxHeight}px' : 'none';
    }

    onSelectTab($event: KbqTabChangeEvent) {
        this.selectedTabIndex = $event.index;
        this.updateMultiline();

        setTimeout(this.updateHeader);
    }

    private updateMultiline = () => {
        this.multiLine = this.elementRef.nativeElement
            .querySelectorAll('.hljs-ln-numbers').length > 1;

        this.updateHeader();

        this.changeDetectorRef.markForCheck();
    }

    private getFullFileName(codeFile: KbqCodeFile): string {
        const fileName = codeFile.filename || 'code';
        const extension = LANGUAGES_EXTENSIONS[codeFile.language] || DEFAULT_EXTENSION;

        return '\${fileName}.\${extension}';
    }
}
`;

/**
 * @title Basic code-block-noborder
 */
@Component({
    selector: 'code-block-noborder-example',
    templateUrl: 'code-block-noborder-example.html',
    styleUrls: ['code-block-noborder-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class CodeBlockNoborderExample {
    @ViewChild(TemplateRef, { static: false }) template: TemplateRef<any>;

    isOpened = false;
    position = KbqSidepanelPosition.Right;
    files: KbqCodeFile[];

    constructor(private sidepanelService: KbqSidepanelService) {
        this.files = [
            {
                filename: '',
                content: codeJs2,
                language: 'typescript',
                link: 'https://stackblitz.com/edit/hpwmn8?file=src%2Fapp%2Ftest.ts',
            },
        ];
    }

    toggleSidepanel() {
        if (!this.isOpened) {
            const sidepanel = this.sidepanelService.open(this.template, {
                position: this.position,
                hasBackdrop: false,
            });

            sidepanel
                .afterClosed()
                .pipe(take(1))
                .subscribe(() => {
                    this.isOpened = false;
                });
            this.isOpened = true;
        } else {
            this.sidepanelService.closeAll();
        }
    }
}
