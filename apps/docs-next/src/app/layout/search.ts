import { ChangeDetectionStrategy, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { DocsNextSiteState } from '../services/site-state';

/**
 * Search button shaped like a field, opening a centred spotlight dialog (spec/navigation/search.md). The prototype
 * shows the dialog only: results come with the search itself.
 */
@Component({
    selector: 'docs-next-search',
    imports: [KbqIconModule],
    template: `
        @if (withButton()) {
            <button class="docs-next-search__button" type="button" (click)="open()">
                <i kbq-icon="kbq-magnifying-glass_16"></i>
                <span class="docs-next-search__label">{{ state.t('search') }}</span>
                <kbd class="docs-next-search__hotkey">⌘K</kbd>
            </button>
        }

        <!-- closedby="any" closes it on a click outside, as well as on Escape. -->
        <dialog #dialog class="docs-next-search__dialog" closedby="any" [attr.aria-label]="state.t('search')">
            <div class="docs-next-search__field">
                <i kbq-icon="kbq-magnifying-glass_16"></i>
                <input
                    #input
                    class="docs-next-search__input"
                    type="search"
                    [attr.aria-label]="state.t('searchPlaceholder')"
                    [placeholder]="state.t('searchPlaceholder')"
                />
                <kbd class="docs-next-search__hotkey">Esc</kbd>
            </div>
            <p class="docs-next-search__empty">{{ state.t('searchEmpty') }}</p>
        </dialog>
    `,
    styleUrl: './search.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { '(document:keydown)': 'onKeydown($event)' }
})
export class DocsNextSearch {
    protected readonly state = inject(DocsNextSiteState);

    /** Whether the field-shaped button shows; the phone header opens the dialog from its own icon. */
    readonly withButton = input(true);

    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
    private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

    open(): void {
        this.dialog().nativeElement.showModal();
        this.input().nativeElement.focus();
    }

    protected onKeydown(event: KeyboardEvent): void {
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
            event.preventDefault();
            this.open();
        }
    }
}
