import {
    AfterContentChecked,
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    QueryList,
    ViewEncapsulation,
    contentChildren,
    inject
} from '@angular/core';
import { KbqLine, KbqLineSetter, kbqQueryListFrom } from '@koobiq/components/core';

/**
 * A plain, non-selectable list container.
 *
 * Intentionally carries no ARIA role: it is used both as a semantic list (consumers add
 * `role="list"` themselves, as `kbq-file-upload` does) and as a purely visual grouping.
 * For a selectable listbox use `kbq-list-selection` instead.
 */
@Component({
    selector: 'kbq-list',
    template: '<ng-content />',
    styleUrls: ['./list.scss', 'list-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: { class: 'kbq-list' }
})
export class KbqList {}

/** A single row of a `kbq-list`. Non-selectable — see `kbq-list-option` for the selectable variant. */
@Component({
    selector: 'kbq-list-item, a[kbq-list-item]',
    templateUrl: './list-item.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-list-item',
        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()'
    },
    preserveWhitespaces: false
})
export class KbqListItem implements AfterContentChecked, AfterContentInit {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    private readonly linesQuery = contentChildren(KbqLine);
    private readonly linesList = kbqQueryListFrom(this.linesQuery);

    get lines(): QueryList<KbqLine> {
        return this.linesList();
    }

    ngAfterContentInit(): void {
        new KbqLineSetter(this.lines, this.elementRef);
    }

    ngAfterContentChecked(): void {
        // Emits `changes` where a decorator query did: after the projected items are bound, before the host bindings.
        this.linesList();
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }

    protected handleFocus(): void {
        this.elementRef.nativeElement.classList.add('kbq-focused');
    }

    protected handleBlur(): void {
        this.elementRef.nativeElement.classList.remove('kbq-focused');
    }
}
