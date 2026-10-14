import {
    AfterContentChecked,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
    QueryList,
    ViewEncapsulation,
    contentChildren,
    inject,
    runInInjectionContext,
    untracked
} from '@angular/core';
import { KbqLine, kbqQueryListFrom } from '@koobiq/components/core';

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
export class KbqListItem implements AfterContentChecked {
    private elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly injector = inject(Injector);
    private readonly destroyRef = inject(DestroyRef);

    private readonly linesQuery = contentChildren(KbqLine);
    // Built on the first read of `lines`: the list costs a root effect, and most items are never asked for it.
    private linesList: (() => QueryList<KbqLine>) | undefined;

    get lines(): QueryList<KbqLine> {
        this.linesList ??= this.createLinesList();

        return this.linesList();
    }

    ngAfterContentChecked(): void {
        // Syncs the list once it is built, so `changes` emits after the projected items are bound and before the
        // host bindings.
        this.linesList?.();
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

    private createLinesList(): () => QueryList<KbqLine> {
        if (this.destroyRef.destroyed) {
            // Nothing is left to sync, and a destroyed view takes no destroy hook.
            const list = new QueryList<KbqLine>(true);

            list.reset([...untracked(this.linesQuery)]);

            return () => list;
        }

        // Untracked: an effect cannot be created inside a reactive context, such as a template reading `lines`.
        return untracked(() => runInInjectionContext(this.injector, () => kbqQueryListFrom(this.linesQuery)));
    }
}
