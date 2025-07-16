import { AfterViewInit, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { debounceTime, fromEvent, merge } from 'rxjs';

@Directive({
    selector: '[icOverflowContentTracker]',
    exportAs: 'icOverflowContentTracker',
    standalone: true
})
export class IcOverflowContentTrackerDirective implements AfterViewInit {
    #elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    #kbqScrollbar = inject(KbqScrollbar, { optional: true });
    #destroyRef = inject(DestroyRef);

    contentTopOverflow = output<boolean>();
    contentBottomOverflow = output<boolean>();

    set isContentTopOverflow(value: boolean) {
        this.#isContentTopOverflow = value;
        this.contentTopOverflow.emit(value);
    }

    get isContentTopOverflow(): boolean {
        return this.#isContentTopOverflow;
    }

    #isContentTopOverflow = false;

    set isContentBottomOverflow(value: boolean) {
        this.#isContentBottomOverflow = value;
        this.contentBottomOverflow.emit(value);
    }

    get isContentBottomOverflow(): boolean {
        return this.#isContentBottomOverflow;
    }

    #isContentBottomOverflow = false;

    // значение взято из KbqPopoverComponent
    #debounceTime = 15;

    ngAfterViewInit(): void {
        if (this.#kbqScrollbar) {
            merge(this.#kbqScrollbar.onUpdate, this.#kbqScrollbar.onScroll.pipe(debounceTime(this.#debounceTime)))
                .pipe(takeUntilDestroyed(this.#destroyRef))
                .subscribe(([event]) => this.#checkContentOverflow(event.elements().scrollOffsetElement));
        } else if (this.#elementRef) {
            this.#checkContentOverflow(this.#elementRef.nativeElement);

            fromEvent(this.#elementRef.nativeElement, 'scroll')
                .pipe(debounceTime(this.#debounceTime), takeUntilDestroyed(this.#destroyRef))
                .subscribe((event) => {
                    this.#checkContentOverflow(event.target as HTMLElement);
                });
        }
    }

    #checkContentOverflow(contentElement: HTMLElement): void {
        const { scrollTop, offsetHeight, scrollHeight } = contentElement;

        this.isContentTopOverflow = scrollTop > 0;
        // при использовании KbqScrollbar при скролле до нижней точки scrollTop + offsetHeight дает дробное значение,
        // поэтому для фикса добавлен Math.ceil
        this.isContentBottomOverflow = Math.ceil(scrollTop + offsetHeight) < scrollHeight;
    }
}
