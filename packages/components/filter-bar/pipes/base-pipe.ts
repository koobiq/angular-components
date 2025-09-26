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
import { delay, filter } from 'rxjs/operators';
import { KbqFilterBar } from '../filter-bar';
import { KbqPipeData, KbqPipeTemplate, KbqPipeType } from '../filter-bar.types';

/** Injection Token for providing configuration of filter-bar */
export const KBQ_PIPE_DATA = new InjectionToken('KBQ_PIPE_DATA');

/** function to get unique identifier of an element */
export function getId(item: KbqPipeTemplate): KbqPipeType | string | number {
    return item?.id ?? item?.name;
}

@Directive({
    standalone: true,
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

    /** values to select from the pipe template */
    protected values;
    /** TemplateRef for selecting an option */
    protected valueTemplate?: TemplateRef<any> | string;

    /** Whether the current platform is a Mac. */
    isMac = isMac();

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
    }

    ngAfterViewInit(): void {
        if (this.data.openOnAdd) {
            delete this.data.openOnAdd;

            this.open();
        }

        this.filterBar?.openPipe.pipe(filter(Boolean), takeUntilDestroyed(this.destroyRef)).subscribe((id) => {
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

        this.filterBar?.onChangePipe.next(this.data);
    }

    /** @docs-private */
    abstract open(): void;
}

@Directive({
    standalone: true,
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
