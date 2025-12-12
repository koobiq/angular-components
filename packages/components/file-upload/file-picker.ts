import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
    inject,
    input,
    OnInit,
    output,
    signal,
    viewChild
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { KbqFileItem } from './file-upload';

/**
 * File upload context.
 * Responsible for CVA, localeService
 * and ErrorStateMatcher
 */
@Directive({
    selector: '[kbqFileUploadPrimitive]'
})
export class KbqFileUploadPrimitive implements ControlValueAccessor, OnInit {
    disabled = input(false);

    readonly fileList = contentChild(KbqFileList);
    fileLoader = contentChild(KbqFileLoader);

    innerDisabled = signal<boolean | undefined>(undefined);

    ngOnInit(): void {
        this.innerDisabled.set(this.disabled());
    }

    /** @docs-private */
    writeValue(fileList: KbqFileItem[] | null): void {
        const updatedList = fileList === null ? [] : fileList;

        this.fileList()?.list.set(updatedList);
    }
    /** @docs-private */
    cvaOnChange = (_: KbqFileItem[]) => {};

    /** @docs-private */
    onTouched = () => {};

    /** @docs-private */
    registerOnChange(fn: any): void {
        this.cvaOnChange = fn;
    }
    /** @docs-private */
    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
    /** @docs-private */
    setDisabledState?(isDisabled: boolean): void {
        this.innerDisabled.set(isDisabled);
    }
}

/**
 * Loader component to trigger Browser API.
 */
@Component({
    selector: '[kbqFileLoader]',
    template: `
        <ng-content />
        <input
            #input
            tabindex="0"
            type="file"
            class="cdk-visually-hidden"
            [attr.multiple]="multiple()"
            [accept]="accept()"
            [disabled]="disabled()"
            [id]="for()"
            (change)="change.emit($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqFileLoader {
    for = input.required<string>();
    disabled = input<boolean>(false);
    accept = input.required<string>();
    multiple = input(undefined, { transform: booleanAttribute });
    readonly change = output<Event>();

    input = viewChild.required<HTMLInputElement>('input');
}

/**
 * Responsible for list update (add/remove)
 */
@Directive({
    selector: '[kbqFileList]',
    exportAs: 'kbqFileList'
})
export class KbqFileList {
    list = signal<any[]>([]);

    private fileUpload = inject(KbqFileUploadPrimitive, { host: true, optional: true });

    private update(fn: (current: any[]) => any[]) {
        this.list.update(fn);
        this.fileUpload?.cvaOnChange(this.list());
    }

    add<T>(item: T) {
        this.update((current) => [...current, item]);
    }

    addArray<T>(items: T[]) {
        this.update((current) => [...current, ...items]);
    }

    remove(item: KbqFileItem) {
        this.update((current) => current.filter((i) => i !== item));
    }

    removeAt(index: number) {
        if (index >= 0 && index < this.list().length) {
            this.update((current) => {
                current.splice(index, 1);

                return current;
            });
        }
    }
}
