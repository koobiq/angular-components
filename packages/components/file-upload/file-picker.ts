import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    ElementRef,
    inject,
    input,
    output,
    signal,
    viewChild
} from '@angular/core';
import { KbqFileItem } from './file-upload';

/**
 * File upload context.
 */
@Directive({
    selector: '[kbqFileUploadPrimitive]',
    exportAs: 'kbqFileUploadPrimitive'
})
export class KbqFileUploadPrimitive {
    id = input();
    disabled = input(false);
    multiple = input(undefined, { transform: booleanAttribute });
    accept = input<string | null>(null);
    onlyDirectory = input(undefined, { transform: booleanAttribute });
}

/**
 * Loader component to trigger Browser API.
 */
@Component({
    selector: '[kbqFileLoader]',
    exportAs: 'kbqFileLoader',
    template: `
        <ng-content />
        <input
            #input
            tabindex="0"
            type="file"
            class="cdk-visually-hidden"
            aria-hidden="true"
            [attr.multiple]="multiple()"
            [attr.webkitdirectory]="onlyDirectory()"
            [accept]="accept()"
            [disabled]="disabled()"
            [id]="for()"
            (change)="fileChange.emit($event)"
        />
    `,
    host: {
        class: 'kbq-file-loader',
        '(click)': 'input()?.nativeElement?.click()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileLoader {
    private fileUpload = inject(KbqFileUploadPrimitive, { host: true, optional: true });

    disabled = computed(() => this.fileUpload?.disabled() ?? false);
    multiple = computed(() => this.fileUpload?.multiple() ?? false);
    accept = computed(() => this.fileUpload?.accept() ?? null);
    for = computed(() => this.fileUpload?.id() ?? null);
    onlyDirectory = computed(() => this.fileUpload?.onlyDirectory() ?? null);

    /** Event fires when file selected in file-picker. */
    readonly fileChange = output<Event>();

    input = viewChild.required<ElementRef<HTMLInputElement>>('input');
}

/**
 * Responsible for list update (add/remove)
 */
@Directive({
    selector: '[kbqFileList]',
    exportAs: 'kbqFileList'
})
export class KbqFileList {
    list = signal<KbqFileItem[]>([]);

    private update(fn: (current: KbqFileItem[]) => KbqFileItem[]) {
        this.list.update(fn);
    }

    add(item: KbqFileItem): void {
        this.update((current) => [...current, item]);
    }

    addArray(items: KbqFileItem[]): void {
        this.update((current) => [...current, ...items]);
    }

    remove(item: KbqFileItem): void {
        this.update((current) => current.filter((i) => i !== item));
    }

    removeAt(index: number): void {
        if (index >= 0 && index < this.list().length) {
            this.update((current) => {
                current.splice(index, 1);

                return current;
            });
        }
    }
}
