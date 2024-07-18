import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    Directive,
    ElementRef,
    Input,
    OnInit,
    OnDestroy,
    NgZone,
    ViewContainerRef,
    Inject,
    Optional, Renderer2, AfterViewInit, NgModule
} from '@angular/core';
import { KbqTooltipTrigger, KBQ_TOOLTIP_SCROLL_STRATEGY } from '@koobiq/components/tooltip';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';


const MIN_VISIBLE_LENGTH = 50;

@Directive({
    selector: '[kbqEllipsisCenter]',
    host: {
        class: 'kbq-ellipsis-center',
        '(window:resize)': 'resizeStream.next($event)'
    }
})
export class KbqEllipsisCenterDirective extends KbqTooltipTrigger implements OnInit, AfterViewInit, OnDestroy {
    @Input() set kbqEllipsisCenter(value: string) {
        this._kbqEllipsisCenter = value;
        this.refresh();
    }

    @Input() minVisibleLength: number = MIN_VISIBLE_LENGTH;

    readonly resizeStream = new Subject<Event>();

    private _kbqEllipsisCenter: string;

    private resizeSubscription = Subscription.EMPTY;

    private readonly debounceInterval: number = 50;

    constructor(
        overlay: Overlay,
        elementRef: ElementRef<HTMLElement>,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_TOOLTIP_SCROLL_STRATEGY) scrollStrategy: any,
        @Optional() direction: Directionality,
        focusMonitor: FocusMonitor,
        private renderer: Renderer2
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction, focusMonitor);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.content = this._kbqEllipsisCenter;
        this.refresh();
    }

    ngAfterViewInit(): void {
        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => this.refresh());
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.resizeSubscription.unsubscribe();
    }

    private refresh() {
        let start = '';
        let end = '';
        const dataTextStartLength = 0.75;
        this.content = this._kbqEllipsisCenter;

        const [dataTextStart, dataTextEnd] = ['data-text-start', 'data-text-end'].map((querySelector) => {
            const element = this.elementRef.nativeElement.querySelector(`.${querySelector}`);
            if (element) {
                this.renderer.removeChild(this.elementRef.nativeElement, element);
            }
            const newElement = this.renderer.createElement('span');
            this.renderer.addClass(newElement, querySelector);

            return newElement;
        });

        this.renderer.appendChild(dataTextStart, this.renderer.createText(this._kbqEllipsisCenter));
        this.renderer.appendChild(dataTextEnd, this.renderer.createText(end));
        setTimeout(() => {
            this.disabled = this.elementRef.nativeElement.clientWidth > dataTextStart.scrollWidth;
            if (this.disabled) {
                start = '';
                end = this._kbqEllipsisCenter;
            } else {
                const sliceIndex: number = Math.round(this._kbqEllipsisCenter.length * dataTextStartLength);
                start = this._kbqEllipsisCenter.slice(0, sliceIndex);
                end = this._kbqEllipsisCenter.slice(sliceIndex);
            }
            dataTextStart.innerText = start;
            dataTextEnd.innerText = end;
        });

        this.renderer.appendChild(this.elementRef.nativeElement, dataTextStart);
        this.renderer.appendChild(this.elementRef.nativeElement, dataTextEnd);
        setTimeout(() => {
            if (dataTextEnd.offsetWidth < dataTextEnd.scrollWidth) {
                dataTextEnd.style.direction = 'rtl';
            } else {
                dataTextEnd.style.direction = 'ltr';
            }
        })
    }
}

@NgModule({
    imports: [],
    exports: [KbqEllipsisCenterDirective],
    declarations: [KbqEllipsisCenterDirective]
})
export class KbqEllipsisCenterModule {}
