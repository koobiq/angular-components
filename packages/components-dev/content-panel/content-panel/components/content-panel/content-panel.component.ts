import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    DestroyRef,
    ElementRef,
    HostBinding,
    HostListener,
    inject,
    Input,
    OnDestroy
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_SIDEPANEL_DATA } from '@koobiq/components/sidepanel';

import { KBQ_WINDOW } from '@koobiq/components/core';
import { ResizableContentPanelDirective } from '../../directives';
import { ContentPanelSize } from '../../types';
import { ContentPanelBodyComponent } from '../content-panel-body/content-panel-body.component';
import { ContentPanelFooterComponent } from '../content-panel-footer/content-panel-footer.component';
import { ContentPanelHeaderComponent } from '../content-panel-header/content-panel-header.component';

// eslint-disable-next-line @angular-eslint/prefer-standalone
@Component({
    selector: 'ic-content-panel',
    templateUrl: './content-panel.component.html',
    styleUrls: ['./content-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'ic-content-panel'
    },
    hostDirectives: [
        {
            directive: ResizableContentPanelDirective,
            outputs: ['widthChange']
        }
    ]
})
export class ContentPanelComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    readonly #destroyRef = inject(DestroyRef);
    readonly #window = inject(KBQ_WINDOW);
    readonly #el: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);

    // kbq-realisation

    @Input()
    data: { ghostElement?: HTMLElement } = inject(KBQ_SIDEPANEL_DATA, { optional: true });

    #size: ContentPanelSize = ContentPanelSize.Medium;
    #initialWidth: number | null = null;

    @Input()
    set size(value: ContentPanelSize) {
        this.#size = value;
    }

    @HostBinding('class')
    get hostClass(): string {
        return `ic-content-panel_${this.#size}`;
    }

    @HostBinding('style.width.px')
    protected width: number | null = null;

    @HostListener('widthChange', ['$event'])
    onWidthChange(newWidth: number): void {
        this.width = newWidth;

        if (this.data.ghostElement) {
            let contentPanelGhostOffset = 0;

            if (this.data.ghostElement.parentElement) {
                contentPanelGhostOffset =
                    this.#window.innerWidth - this.data.ghostElement.parentElement.getBoundingClientRect().right;
            }

            this.data.ghostElement.style.setProperty(
                '--content-panel-width',
                `${newWidth + 8 - contentPanelGhostOffset}px`
            );
        }
    }

    @ContentChild(ContentPanelBodyComponent)
    public contentPanelBody?: ContentPanelBodyComponent;

    @ContentChild(ContentPanelHeaderComponent)
    public contentPanelHeader?: ContentPanelHeaderComponent;

    @ContentChild(ContentPanelFooterComponent)
    public contentPanelFooter?: ContentPanelFooterComponent;

    get initialWidth(): number {
        return this.#initialWidth || 0;
    }

    ngAfterContentInit(): void {
        if (this.data.ghostElement) {
            this.data.ghostElement.style.width = `var(--content-panel-width)`;
        }

        if (this.contentPanelHeader) {
            this.contentPanelBody?.contentTopOverflow
                .pipe(takeUntilDestroyed(this.#destroyRef))
                .subscribe((isContentTopOverflow) => {
                    if (this.contentPanelHeader) {
                        this.contentPanelHeader.isShadowRequired = isContentTopOverflow;
                    }
                });
        }

        if (this.contentPanelFooter) {
            this.contentPanelBody?.contentBottomOverflow
                .pipe(takeUntilDestroyed(this.#destroyRef))
                .subscribe((isContentBottomOverflow) => {
                    if (this.contentPanelFooter) {
                        this.contentPanelFooter.isShadowRequired = isContentBottomOverflow;
                    }
                });
        }
    }

    ngAfterViewInit(): void {
        this.#initialWidth = this.#el.nativeElement.offsetWidth;
    }

    ngOnDestroy(): void {
        if (this.data.ghostElement) {
            this.data.ghostElement.style.width = '';
        }
    }
}
