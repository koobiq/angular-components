import { ChangeDetectionStrategy, Component, ElementRef, inject, input, signal, viewChild } from '@angular/core';
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
            <button
                #button
                class="docs-next-search__button"
                type="button"
                [class.docs-next-search__button_held]="held()"
                (click)="open()"
            >
                <span class="docs-next-search__inner">
                    <i kbq-icon="kbq-magnifying-glass_16" color="contrast-fade"></i>
                    <span class="docs-next-search__label">{{ state.t('search') }}</span>
                    <kbd class="docs-next-search__hotkey">⌘K</kbd>
                </span>
            </button>
        }

        <!-- closedby="any" closes it on a click outside, as well as on Escape. -->
        <dialog
            #dialog
            class="docs-next-search__dialog"
            closedby="any"
            [attr.aria-label]="state.t('search')"
            (close)="held.set(false)"
        >
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

    /**
     * The field is drawn in while the dialog is open when it was opened from the button, with the pointer on it or with
     * the keyboard from its focus: the backdrop takes the hover away and the focus moves into the dialog, which would
     * widen the field behind it. Opened with the hotkey from elsewhere, the field stays as it was.
     */
    protected readonly held = signal(false);

    private readonly button = viewChild<ElementRef<HTMLButtonElement>>('button');
    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
    private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

    open(): void {
        const button = this.button()?.nativeElement;

        this.held.set(!!button && (button.matches(':hover') || button.matches(':focus-visible')));
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
