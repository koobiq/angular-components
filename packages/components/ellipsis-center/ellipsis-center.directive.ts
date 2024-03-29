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
    selector: '[mcEllipsisCenter]',
    host: {
        class: 'kbq-ellipsis-center',
        '(window:resize)': 'resizeStream.next($event)'
    }
})
export class KbqEllipsisCenterDirective extends KbqTooltipTrigger
    implements OnInit, AfterViewInit, OnDestroy {
    @Input() set mcEllipsisCenter(value: string) {
        this._mcEllipsisCenter = value;
        this.refresh();
    }
    @Input() minVisibleLength: number = MIN_VISIBLE_LENGTH;

    readonly resizeStream = new Subject<Event>();

    private _mcEllipsisCenter: string;

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
        private renderer: Renderer2
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.content = this._mcEllipsisCenter;
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
        this.content = this._mcEllipsisCenter;

        const [dataTextStart, dataTextEnd] = ['data-text-start', 'data-text-end'].map((querySelector) => {
            const element = this.elementRef.nativeElement.querySelector(`.${querySelector}`);
            if (element) {
                this.renderer.removeChild(this.elementRef.nativeElement, element);
            }
            const newElement = this.renderer.createElement('span');
            this.renderer.addClass(newElement, querySelector);

            return newElement;
        });

        this.renderer.appendChild(dataTextStart, this.renderer.createText(this._mcEllipsisCenter));
        this.renderer.appendChild(dataTextEnd, this.renderer.createText(end));
        setTimeout(() => {
            this.disabled = this.elementRef.nativeElement.clientWidth > dataTextStart.scrollWidth;
            if (this.disabled) {
                start = '';
                end = this._mcEllipsisCenter;
            } else {
                const sliceIndex: number = Math.round(this._mcEllipsisCenter.length * dataTextStartLength);

                start = this._mcEllipsisCenter.slice(0, sliceIndex);
                end = this._mcEllipsisCenter.slice(sliceIndex);
            }
            dataTextStart.innerText = start;
            dataTextEnd.innerText = end;
        });

        this.renderer.appendChild(this.elementRef.nativeElement, dataTextStart);
        this.renderer.appendChild(this.elementRef.nativeElement, dataTextEnd);
    }
}

@NgModule({
    imports: [],
    exports: [KbqEllipsisCenterDirective],
    declarations: [KbqEllipsisCenterDirective]
})
export class KbqEllipsisCenterModule {}
