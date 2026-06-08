import {
    afterNextRender,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Injector,
    input,
    NgZone,
    OnDestroy,
    Output,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqScrollbarDirective } from './scrollbar.directive';
import {
    KbqScrollbarEventListenerArgs,
    KbqScrollbarEvents,
    KbqScrollbarOptions,
    KbqScrollbarTarget
} from './scrollbar.types';

const filterEvents = (emits: KbqScrollbarEvents, events: KbqScrollbarEvents) =>
    (Object.keys(emits) as (keyof KbqScrollbarEvents)[]).reduce<KbqScrollbarEvents>(
        <N extends keyof KbqScrollbarEvents>(obj: KbqScrollbarEvents, name: N) => {
            const emitListener = emits[name];
            const eventListener = events[name];

            // merge & check listeners
            obj[name] = [
                emitListener,
                ...(Array.isArray(eventListener) ? eventListener : [eventListener]).filter(Boolean)
            ];

            return obj;
        },
        {}
    );

/**
 * The component-wrapper for `overlayscrollbars` library.
 */
@Component({
    selector: 'kbq-scrollbar, [kbq-scrollbar]',
    imports: [KbqScrollbarDirective],
    template: `
        <div
            #content
            data-overlayscrollbars-contents=""
            kbqScrollbar
            [options]="options()"
            [events]="mergeEvents()"
            [defer]="defer()"
        >
            <ng-content />
        </div>
    `,
    styleUrls: ['./scrollbar.component.scss', 'scrollbar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-overlayscrollbars-initialize': '',
        class: 'kbq-scrollbar-component'
    },
    exportAs: 'kbqScrollbar'
})
export class KbqScrollbar implements AfterViewInit, OnDestroy {
    private ngZone = inject(NgZone);
    private targetElement = inject<ElementRef<HTMLElement>>(ElementRef);

    /** Element that is being overflowed */
    readonly contentElement = viewChild.required<ElementRef<HTMLDivElement>>('content');
    private readonly kbqScrollbarDirective = viewChild.required('content', { read: KbqScrollbarDirective });

    /** Elements scrollbar applied on */
    readonly initializationTarget = input<KbqScrollbarTarget>();
    /** Scrollbar behavior customization object */
    readonly options = input<KbqScrollbarOptions>(undefined!);
    readonly events = input<KbqScrollbarEvents>(undefined!);
    /** Whether to defer the initialization to a point in time when the browser is idle. (or to the next frame if `window.requestIdleCallback` is not supported) */
    readonly defer = input<boolean | IdleRequestOptions>();

    @Output() readonly onInitialize = new EventEmitter<KbqScrollbarEventListenerArgs['initialized']>();
    /** Event triggered when options or event listeners updated */
    @Output() readonly onUpdate = new EventEmitter<KbqScrollbarEventListenerArgs['updated']>();
    /** Event triggered when scrollbar instance destroyed */
    @Output() readonly onDestroy = new EventEmitter<KbqScrollbarEventListenerArgs['destroyed']>();
    @Output() readonly onScroll = new EventEmitter<KbqScrollbarEventListenerArgs['scroll']>();

    get element(): HTMLElement {
        return this.targetElement.nativeElement;
    }

    private readonly injector = inject(Injector);

    /** Inserted by Angular inject() migration for backwards compatibility */
    constructor(...args: unknown[]);

    constructor() {}

    ngAfterViewInit() {
        afterNextRender(
            () => {
                const contentElement = this.contentElement();

                if (this.element && contentElement?.nativeElement) {
                    this.kbqScrollbarDirective()?.initialize(
                        this.initializationTarget() || {
                            target: this.targetElement.nativeElement,
                            elements: {
                                viewport: contentElement.nativeElement,
                                content: contentElement.nativeElement
                            }
                        }
                    );
                }
            },
            { injector: this.injector }
        );
    }

    ngOnDestroy() {
        this.kbqScrollbarDirective()?.scrollbarInstance?.destroy();
    }

    /** Wrapper function for native scroll */
    scrollTo(options?: ScrollToOptions): void {
        this.contentElement()?.nativeElement.scroll(options);
    }

    mergeEvents(): KbqScrollbarEvents {
        const defaultListeners: KbqScrollbarEvents = {
            initialized: (...args) => this.dispatchEventIfHasObservers(this.onInitialize, args),
            updated: (...args) => this.dispatchEventIfHasObservers(this.onUpdate, args),
            destroyed: (...args) => this.dispatchEventIfHasObservers(this.onDestroy, args),
            scroll: (...args) => this.dispatchEventIfHasObservers(this.onScroll, args)
        };

        const events = this.events();

        if (!events) {
            return defaultListeners;
        }

        // merge default listeners with custom listeners in case of Input binding
        return {
            ...defaultListeners,
            ...filterEvents(events, defaultListeners)
        };
    }

    private dispatchEventIfHasObservers<T>(eventEmitter: EventEmitter<T>, args: T): void {
        // `observed` is available since RxJS@7.2 because `observers` is being deprecated.
        if ((eventEmitter as any).observed || eventEmitter.observers.length > 0) {
            // This is required to re-enter the Angular zone to call the event handler in the Angular
            // zone too. This will not re-enter the Angular zone if emitter doesn't have any observers,
            // for instance, it's being listened: `<overlay-scrollbars (osInitialized)="..."`.
            // Events are dispatched outside of the Angular zone because instance is created in the
            // `<root>` zone
            this.ngZone.run(() => eventEmitter.emit(args));
        }
    }
}
