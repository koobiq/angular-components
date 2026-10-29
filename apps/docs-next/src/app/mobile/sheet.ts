import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    input,
    output,
    signal,
    viewChild
} from '@angular/core';

/** How far a swipe has to go before the panel closes, in pixels. */
const SWIPE_CLOSE_DISTANCE = 80;

/**
 * Modal panel of the phone layout on a native `<dialog>`: a sheet at the bottom or the menu "island" on the right
 * (Figma: New Docs, section 65:18869). It closes on Escape, on a tap on the backdrop and on a swipe towards its edge —
 * down for the sheet, right for the menu. The page under it does not scroll while it is open.
 *
 * A bottom sheet with `growOnScroll` starts at the height of its content and grows to the top of the screen once its
 * list is scrolled.
 */
@Component({
    selector: 'docs-next-sheet',
    template: `
        <dialog
            #dialog
            class="docs-next-sheet"
            closedby="none"
            [attr.aria-label]="label()"
            [class.docs-next-sheet_end]="placement() === 'end'"
            [class.docs-next-sheet_grown]="grown()"
            [style.transform]="dragOffset() ? dragTransform() : null"
            (close)="onClosed()"
        >
            <ng-content />
        </dialog>
    `,
    styleUrl: './sheet.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextSheet {
    /** `bottom` for a sheet, `end` for the menu sliding in from the right. */
    readonly placement = input<'bottom' | 'end'>('bottom');
    readonly label = input.required<string>();
    readonly growOnScroll = input(false);

    readonly opened = output<void>();
    readonly closed = output<void>();

    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

    protected readonly grown = signal(false);
    protected readonly dragOffset = signal(0);

    private dragStart: { x: number; y: number } | null = null;
    private escapeInDropdown = false;

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            const dialog = this.dialog().nativeElement;
            const listeners: [string, EventListener][] = [
                ['click', (event) => this.onClick(event as MouseEvent)],
                ['pointerdown', (event) => this.onPointerDown(event as PointerEvent)],
                ['pointermove', (event) => this.onPointerMove(event as PointerEvent)],
                ['pointerup', () => this.onPointerUp()],
                ['pointercancel', () => this.resetDrag()],
                ['keydown', (event) => this.onKeydown(event as KeyboardEvent)],
                ['scroll', (event) => this.onScroll(event)]
            ];

            // Listened here rather than in the template: a click on the backdrop lands on the dialog itself, and a
            // scroll of the list inside is caught on the way.
            const onKeydownCapture = (event: Event) => this.onKeydownCapture(event as KeyboardEvent);

            for (const [type, listener] of listeners) {
                dialog.addEventListener(type, listener, { capture: type === 'scroll', passive: type === 'scroll' });
            }

            dialog.addEventListener('keydown', onKeydownCapture, { capture: true });

            destroyRef.onDestroy(() => {
                for (const [type, listener] of listeners) {
                    dialog.removeEventListener(type, listener, { capture: type === 'scroll' });
                }

                dialog.removeEventListener('keydown', onKeydownCapture, { capture: true });
            });
        });
    }

    open(): void {
        this.grown.set(false);
        this.dialog().nativeElement.showModal();
        this.opened.emit();
    }

    close(): void {
        this.dialog().nativeElement.close();
    }

    protected onClosed(): void {
        this.resetDrag();
        this.closed.emit();
    }

    protected dragTransform(): string {
        return this.placement() === 'end' ? `translateX(${this.dragOffset()}px)` : `translateY(${this.dragOffset()}px)`;
    }

    private onClick(event: MouseEvent): void {
        if (event.target !== this.dialog().nativeElement) return;

        // A tap outside the panel box is a tap on the backdrop.
        const box = this.dialog().nativeElement.getBoundingClientRect();
        const inside =
            event.clientX >= box.left &&
            event.clientX <= box.right &&
            event.clientY >= box.top &&
            event.clientY <= box.bottom;

        if (!inside) this.close();
    }

    /**
     * Escape closes the panel unless a dropdown inside is open: then it closes the dropdown alone. The dialog's own
     * Escape handling is off (`closedby="none"`), since it fires regardless of what the key did inside.
     */
    private onKeydownCapture(event: KeyboardEvent): void {
        this.escapeInDropdown =
            event.key === 'Escape' && !!this.dialog().nativeElement.querySelector('.cdk-overlay-pane:not(:empty)');
    }

    private onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Escape' && !this.escapeInDropdown) this.close();

        this.escapeInDropdown = false;
    }

    private onScroll(event: Event): void {
        if (this.growOnScroll() && (event.target as HTMLElement).scrollTop > 0) this.grown.set(true);
    }

    private onPointerDown(event: PointerEvent): void {
        if (event.pointerType === 'mouse') return;

        const scroller = (event.target as HTMLElement).closest('[data-sheet-scroll]');

        // A swipe down inside a scrolled list scrolls it back instead of closing the sheet.
        if (this.placement() === 'bottom' && scroller && scroller.scrollTop > 0) return;

        this.dragStart = { x: event.clientX, y: event.clientY };
    }

    private onPointerMove(event: PointerEvent): void {
        if (!this.dragStart) return;

        const delta = this.placement() === 'end' ? event.clientX - this.dragStart.x : event.clientY - this.dragStart.y;

        this.dragOffset.set(Math.max(0, delta));
    }

    private onPointerUp(): void {
        if (!this.dragStart) return;

        const shouldClose = this.dragOffset() > SWIPE_CLOSE_DISTANCE;

        this.resetDrag();

        if (shouldClose) this.close();
    }

    private resetDrag(): void {
        this.dragStart = null;
        this.dragOffset.set(0);
    }
}
