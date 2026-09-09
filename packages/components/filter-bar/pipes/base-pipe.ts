import { FocusMonitor, FocusOrigin, InputModalityDetector } from '@angular/cdk/a11y';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    AfterViewInit,
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    InjectionToken,
    TemplateRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isMac } from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { delay, filter, skip } from 'rxjs/operators';
import { KbqFilterBar } from '../filter-bar';
import { KbqPipeData, KbqPipeTemplate, KbqPipeType } from '../filter-bar.types';

/** Injection Token for providing configuration of filter-bar */
export const KBQ_PIPE_DATA = new InjectionToken('KBQ_PIPE_DATA');

/** function to get unique identifier of an element */
export function getId(item: KbqPipeTemplate): KbqPipeType | string | number {
    return item?.id ?? item?.name;
}

@Directive({
    host: {
        class: 'kbq-pipe',
        '[class]': '"kbq-pipe__" + data.type',
        '[class.kbq-pipe_empty]': 'isEmpty',
        '[class.kbq-pipe_cleanable]': 'data.cleanable',
        '[class.kbq-pipe_removable]': 'data.removable',
        '[class.kbq-pipe_disabled]': 'data.disabled'
    }
})
export abstract class KbqBasePipe<V> implements AfterViewInit {
    /** changes of state */
    readonly stateChanges = new Subject<void>();
    /** pipe data. Provided from subclass */
    readonly data = inject<KbqPipeData<V>>(KBQ_PIPE_DATA);

    /** KbqFilterBar instance
     * @docs-private */
    protected readonly filterBar = inject(KbqFilterBar, { optional: true });
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    /** @docs-private */
    protected readonly destroyRef = inject(DestroyRef);
    /** @docs-private */
    protected readonly focusMonitor = inject(FocusMonitor);
    /** @docs-private */
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly inputModalityDetector = inject(InputModalityDetector);
    private readonly document = inject(DOCUMENT);

    /** values to select from the pipe template */
    protected values;
    /** TemplateRef for selecting an option */
    protected valueTemplate?: TemplateRef<any> | string;

    /**
     * Whether the current platform is a Mac.
     *
     * @docs-private
     */
    isMac = false;

    /** Data for the pipe.
     *  @docs-private */
    $implicit: unknown;

    /** Whether the current pipe is empty. Used for apply style modifier */
    get isEmpty(): boolean {
        return this.data.value === null || this.data.value === undefined;
    }

    /** Whether the current pipe is removable or cleanable. Used for apply style modifier */
    get showRemoveButton(): boolean {
        return this.data.removable || (this.data.cleanable && !this.isEmpty);
    }

    /** localized data
     * @docs-private */
    get localeData() {
        return this.filterBar?.configuration;
    }

    constructor() {
        this.$implicit = this;

        this.stateChanges.subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });

        this.filterBar?.internalTemplatesChanges.pipe(takeUntilDestroyed()).subscribe(this.updateTemplates);

        afterNextRender(() => {
            this.isMac = isMac();
        });
    }

    ngAfterViewInit(): void {
        if (this.data.openOnAdd) {
            delete this.data.openOnAdd;

            this.open();
        }

        // `skip(1)` drops the replayed value: a request is addressed to the pipes alive when it is dispatched
        // (a pipe added later opens through `openOnAdd` above). It has to precede the null check, or that
        // check swallows the replayed value and `skip` eats the first real request instead.
        this.filterBar?.openPipe
            .pipe(
                skip(1),
                filter((id): id is string | number => id !== null),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((id) => {
                if (getId(this.data) === id) {
                    this.open();
                }
            });

        if (this.data.openOnReset) {
            this.filterBar?.onResetFilter.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.open();
            });
        }
    }

    /** templateRef checker utility */
    isTemplateRef(value: unknown): boolean {
        return value instanceof TemplateRef;
    }

    /** updates values for selection and value template */
    updateTemplates = (templates: KbqPipeTemplate[] | null) => {
        const template = templates?.find((template) => getId(template) === getId(this.data));

        if (template?.values) {
            this.values = template.values;
            this.valueTemplate = template.valueTemplate;
        }
    };

    /** removes pipe from filter-bar and triggers changes */
    onRemove() {
        this.filterBar?.removePipe(this.data);

        this.stateChanges.next();
    }

    /** clears the pipe and triggers changes */
    onClear() {
        this.data.value = null;

        this.stateChanges.next();

        this.filterBar?.onClearPipe.next(this.data);
        this.filterBar?.onChangePipe.next(this.data);
    }

    /**
     * Focus origin to hand to {@link FocusMonitor} whenever this pipe moves focus programmatically, so the
     * `.cdk-keyboard-focused` ring is painted for keyboard navigation only and never for a mouse-driven one.
     *
     * `InputModalityDetector.mostRecentModality` reflects what the user is doing *right now*, and is the
     * only source that stays correct while a panel is open: panel content lives in the CDK overlay
     * container, which is not a DOM descendant of the pipe host, so a focus origin captured on the host
     * itself would freeze at "how the trigger was focused" and couldn't tell a click inside the panel apart
     * from the keypress that opened it. The detector reacts only to `keydown`/`mousedown`/`touchstart`
     * (never to hover or scroll), so merely moving the mouse cannot strip a keyboard user's ring, and it
     * maps a screen reader's synthetic mousedown to `keyboard`. It falls back to `'program'` only before any
     * such interaction has ever occurred on the page — at which point no ring should be shown anyway.
     *
     * @docs-private
     */
    protected get currentFocusOrigin(): NonNullable<FocusOrigin> {
        return this.inputModalityDetector.mostRecentModality ?? 'program';
    }

    /**
     * Restores focus to the pipe's trigger button after a value is chosen or the panel closes.
     * Focuses via {@link FocusMonitor} with `currentFocusOrigin` so a keyboard-driven interaction keeps
     * its focus ring, while a mouse-driven one does not.
     *
     * @docs-private
     */
    protected restoreTriggerFocus(): void {
        const active = this.document.activeElement;

        // The panel may have been closed by moving focus to another interactive element
        // (e.g. an outside click) — stealing focus back would break the user's intent.
        // Focus inside the pipe or inside a not-yet-detached overlay is fine to take over.
        if (
            active &&
            active !== this.document.body &&
            !this.elementRef.nativeElement.contains(active) &&
            !active.closest('.cdk-overlay-container')
        ) {
            return;
        }

        const trigger = this.elementRef.nativeElement.querySelector<HTMLElement>(
            'button:not(.kbq-pipe__remove-button)'
        );

        if (trigger) {
            this.focusMonitor.focusVia(trigger, this.currentFocusOrigin);
        }
    }

    /** @docs-private */
    abstract open(): void;
}

@Directive({
    selector: '[kbqPipeMinWidth]',
    host: {
        '[style.min-width]': 'minWidth'
    }
})
export class KbqPipeMinWidth {
    /** KbqFilterBar instance */
    protected readonly filterBar = inject(KbqFilterBar, { optional: true });

    /** @docs-private */
    protected readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /** @docs-private */
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    /** @docs-private */
    protected minWidth: string;
    /** maximal symbols for apply fit-content to min-width */
    maxSymbolsForFitContent: number = 20;

    /** current length of text */
    get textLength(): number {
        return this.elementRef.nativeElement.innerText?.length || 0;
    }

    constructor() {
        this.filterBar?.changes.pipe(delay(0)).subscribe(this.update);

        afterNextRender({ read: this.update });
    }

    update = () => {
        this.minWidth = this.textLength < this.maxSymbolsForFitContent ? 'fit-content' : 'unset';
        this.changeDetectorRef.markForCheck();
    };
}
