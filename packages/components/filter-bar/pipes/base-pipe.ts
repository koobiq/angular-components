import { afterNextRender, AfterViewInit, ChangeDetectorRef, Directive, ElementRef, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { delay, filter } from 'rxjs/operators';
import { UAParser } from 'ua-parser-js';
import { KbqFilterBar } from '../filter-bar';
import { KbqPipeData, KbqPipeTemplate } from '../filter-bar.types';

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
export abstract class KbqBasePipe implements AfterViewInit {
    readonly stateChanges = new Subject<void>();
    readonly data = inject(KbqPipeData);

    protected readonly filterBar = inject(KbqFilterBar, { optional: true });
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected values: KbqPipeTemplate[];

    private uaParser: UAParser.UAParserInstance = new UAParser();

    isMac: boolean;

    get isEmpty(): boolean {
        return this.data.value === null || this.data.value === undefined;
    }

    get showRemoveButton(): boolean {
        return !this.data.required && (this.data.removable || (this.data.cleanable && !this.isEmpty));
    }

    constructor() {
        this.stateChanges.subscribe(() => {
            this.changeDetectorRef.markForCheck();
        });

        const template = this.filterBar?.pipeTemplates.find((template) => template.type === this.data?.type);

        if (template) {
            this.values = template.values as KbqPipeTemplate[];
        }

        this.isMac = (this.uaParser.getOS().name || '').includes('Mac');
    }

    ngAfterViewInit(): void {
        if (this.data.openOnAdd) {
            delete this.data.openOnAdd;

            this.open();
        }

        this.filterBar?.openPipe.pipe(filter(Boolean)).subscribe((name) => {
            if (this.data.name === name) {
                this.open();
            }
        });
    }

    onRemove() {
        this.filterBar?.removePipe(this.data);

        this.stateChanges.next();
    }

    onClear() {
        this.data.value = null;

        this.stateChanges.next();
    }

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
    protected readonly filterBar = inject(KbqFilterBar, { optional: true });

    protected readonly elementRef = inject(ElementRef);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    minWidth: string;
    maxSymbolsForFitContent: number = 20;

    get textLength(): number {
        return this.elementRef.nativeElement.innerText.length || 0;
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
