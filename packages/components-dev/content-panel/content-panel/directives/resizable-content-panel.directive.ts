import {
    AfterViewInit,
    DestroyRef,
    Directive,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    NgZone,
    OnDestroy,
    Output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, fromEvent } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { ContentPanelComponent } from '../components';

@Directive({
    selector: '[icResizableContentPanel]',
    standalone: true
})
export class ResizableContentPanelDirective implements AfterViewInit, OnDestroy {
    @Input() minWidth = 480;
    @Input() maxWidth = 800;

    @Output() widthChange = new EventEmitter<number>();

    readonly #el: ElementRef<HTMLElement> = inject<ElementRef<HTMLElement>>(ElementRef);
    readonly #ngZone: NgZone = inject(NgZone);
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #icContentPanelComponent = inject(ContentPanelComponent);

    private get initialPanelWidth(): number {
        return this.#icContentPanelComponent.initialWidth || this.minWidth;
    }

    ngAfterViewInit(): void {
        this.widthChange.emit(this.#el.nativeElement.offsetWidth);
        this.#ngZone.runOutsideAngular(() => {
            fromEvent<MouseEvent>(this.#el.nativeElement, 'mousedown')
                .pipe(
                    filter((event) => (event.target as HTMLElement).classList.contains('ic-content-panel__resizer')),
                    switchMap((event: MouseEvent) => {
                        event.preventDefault();

                        const startX: number = event.clientX;
                        const startWidth: number = this.#el.nativeElement.offsetWidth;

                        const mousemove$ = fromEvent<MouseEvent>(document, 'mousemove');
                        const mouseup$ = fromEvent<MouseEvent>(document, 'mouseup');

                        return mousemove$.pipe(
                            map((moveEvent) => {
                                const dx = moveEvent.clientX - startX;
                                let newWidth = startWidth - dx;

                                newWidth = Math.max(this.minWidth, Math.min(this.maxWidth, newWidth));

                                return newWidth;
                            }),
                            distinctUntilChanged(),
                            takeUntil(mouseup$)
                        );
                    }),
                    takeUntilDestroyed(this.#destroyRef)
                )
                .subscribe((newWidth) => {
                    this.#ngZone.run(() => {
                        this.widthChange.emit(newWidth);
                    });
                });

            fromEvent<MouseEvent>(this.#el.nativeElement, 'dblclick')
                .pipe(
                    filter(
                        (event) =>
                            (event.target as HTMLElement).classList.contains('ic-content-panel__resizer') &&
                            this.#el.nativeElement.offsetWidth !== this.initialPanelWidth
                    ),
                    takeUntilDestroyed(this.#destroyRef)
                )
                .subscribe(() => {
                    this.#ngZone.run(() => {
                        this.widthChange.emit(this.initialPanelWidth);
                    });
                });
        });
    }

    ngOnDestroy(): void {
        this.widthChange.emit(0);
    }
}
