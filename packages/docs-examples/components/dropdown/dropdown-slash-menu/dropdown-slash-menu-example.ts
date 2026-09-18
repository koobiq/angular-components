import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    Renderer2,
    signal,
    viewChild
} from '@angular/core';
import {
    createSearchPredicate,
    KbqCaretRect,
    kbqCreateCaretOrigin,
    kbqGetSelectionRect,
    kbqGetTextQuery,
    KbqHighlightBackgroundPipe,
    kbqListenForCaretMoves,
    KbqOptgroup,
    tokenizeSearchQuery
} from '@koobiq/components/core';
import { KbqDropdown, KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

/** `Node.TEXT_NODE`, spelled out so that the example never reads a DOM global. */
const TEXT_NODE = 3;

const TRIGGER = '/';

const EMPTY_RECT: KbqCaretRect = { x: 0, y: 0, width: 0, height: 0 };

/** The keys the menu lives on while the caret stays in the editor. */
const MENU_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'];

const GROUPS: { label: string; items: { name: string; icon: string }[] }[] = [
    {
        label: 'Suggested',
        items: [
            { name: 'Text', icon: 'kbq-paragraph-sign_16' },
            { name: 'Bulleted list', icon: 'kbq-list-ul_16' },
            { name: 'To-do list', icon: 'kbq-checkbox-multiple_16' }
        ]
    },
    {
        label: 'Basic blocks',
        items: [
            { name: 'Numbered list', icon: 'kbq-list-ol_16' },
            { name: 'Code', icon: 'kbq-code_16' },
            { name: 'Table', icon: 'kbq-table_16' },
            { name: 'Image', icon: 'kbq-image_16' },
            { name: 'Divider', icon: 'kbq-minus_16' }
        ]
    }
];

/**
 * @title Dropdown at the caret
 */
@Component({
    selector: 'dropdown-slash-menu-example',
    imports: [
        KbqDropdownModule,
        KbqHighlightBackgroundPipe,
        KbqIconModule,
        KbqOptgroup
    ],
    template: `
        <div
            #editor
            aria-label="Article text"
            aria-multiline="true"
            class="example-editor kbq-text-normal"
            contenteditable="plaintext-only"
            role="textbox"
            (keydown)="handleKeydown($event)"
        >
            Type / anywhere in this text to open the block menu.
        </div>

        <!--
            The panel is positioned against the caret, so the trigger only has to stay out of the editor:
            on the editor itself it would swallow Enter and Space.
        -->
        <span
            class="example-anchor"
            [kbqDropdownTriggerAutoFocus]="false"
            [kbqDropdownTriggerFor]="menu"
            [kbqDropdownTriggerOrigin]="origin"
            [kbqDropdownTriggerRestoreFocus]="false"
        ></span>

        <kbq-dropdown
            #menu="kbqDropdown"
            class="example-slash-menu"
            [activeDescendantNavigation]="true"
            [panelWidth]="280"
        >
            @for (group of filteredGroups(); track group.label) {
                @if (group.items.length) {
                    <kbq-optgroup [label]="group.label" />

                    @for (item of group.items; track item.name) {
                        <!-- Taking focus would drop the caret the menu is anchored to. -->
                        <button kbq-dropdown-item (click)="insert(item.name)" (mousedown)="$event.preventDefault()">
                            <i [kbq-icon]="item.icon"></i>
                            <span [innerHTML]="item.name | kbqHighlightBackground: tokens()"></span>
                        </button>
                    }
                }
            }

            @if (isEmpty()) {
                <button disabled kbq-dropdown-item>Nothing found</button>
            }

            <kbq-dropdown-footer>Press Esc to close</kbq-dropdown-footer>
        </kbq-dropdown>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px 0 160px;
        }

        /* The field look, taken from the form-field tokens: a contenteditable cannot live in kbq-form-field. */
        .example-editor {
            max-width: 440px;
            min-height: 96px;
            margin: 0 auto;
            padding: var(--kbq-size-xs) var(--kbq-size-s);
            border: var(--kbq-size-border-width) solid var(--kbq-line-contrast-fade);
            border-radius: var(--kbq-size-border-radius);
            outline: none;
            background: var(--kbq-background-bg);
            color: var(--kbq-foreground-contrast);
        }

        .example-editor:focus {
            border-color: var(--kbq-states-line-focus-theme);
            box-shadow: inset 0 0 0.1px var(--kbq-size-border-width) var(--kbq-states-line-focus-theme);
        }

        .example-anchor {
            display: block;
            width: 0;
            height: 0;
        }

        /* The panel lives in an overlay, outside this component's DOM. */
        ::ng-deep .example-slash-menu .kbq-dropdown__content {
            max-height: 240px;
            overflow-y: auto;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownSlashMenuExample {
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly editor = viewChild<ElementRef<HTMLElement>>('editor');
    private readonly menu = viewChild(KbqDropdown);
    private readonly trigger = viewChild(KbqDropdownTrigger);

    /** The `/…` the menu filters by, as a live range, so the panel keeps up with the token as it grows. */
    private token: Range | null = null;
    /** Whether the menu was dismissed for the token the caret still sits in. */
    private dismissed = false;

    /** Stays on the token: the rectangle is measured again every time the panel is positioned. */
    protected readonly origin = kbqCreateCaretOrigin(() => this.measureToken());
    protected readonly query = signal('');
    protected readonly tokens = computed(() => tokenizeSearchQuery(this.query()));

    protected readonly filteredGroups = computed(() => {
        const matches = createSearchPredicate(this.query());

        return GROUPS.map(({ label, items }) => ({ label, items: items.filter(({ name }) => matches(name)) }));
    });

    protected readonly isEmpty = computed(() => this.filteredGroups().every(({ items }) => !items.length));

    constructor() {
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            const editor = this.editor()?.nativeElement;

            if (!editor) return;

            destroyRef.onDestroy(kbqListenForCaretMoves(this.renderer, editor, () => this.syncMenu()));
        });
    }

    protected handleKeydown(event: KeyboardEvent): void {
        if (!this.trigger()?.opened || !MENU_KEYS.includes(event.key)) return;

        if (event.key === 'Escape') {
            this.dismissed = true;
        }

        // The panel never takes focus, so the editor has to hand the keys it lives on over to it.
        this.menu()?.handleKeydown(event);
    }

    protected insert(name: string): void {
        const token = this.token;
        const editor = this.editor()?.nativeElement;

        if (!token || !editor) return;

        token.deleteContents();
        token.insertNode(this.document.createTextNode(`${name} `));
        token.collapse(false);

        // A click leaves the caret behind; put it back after the inserted block.
        editor.focus();

        const selection = this.document.getSelection();

        selection?.removeAllRanges();
        selection?.addRange(token);

        this.syncMenu();
    }

    private syncMenu(): void {
        const trigger = this.trigger();

        if (!trigger) return;

        const caret = this.readCaret();
        const query = caret && kbqGetTextQuery(caret.value, caret.caret, { triggers: [TRIGGER] });
        const token = query && this.getTokenRange(query.end - query.start);

        if (!query || !token) {
            this.token = null;
            this.dismissed = false;
            trigger.close();

            return;
        }

        if (this.dismissed) return;

        this.token = token;
        this.query.set(query.text);

        // The trigger has to see the new origin, and the panel its filtered items, before it opens.
        this.changeDetectorRef.detectChanges();

        if (trigger.opened) {
            trigger.updatePosition();
        } else {
            trigger.open();
        }
    }

    private measureToken(): KbqCaretRect {
        const rect = this.token?.getBoundingClientRect();

        if (rect?.height) return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };

        const editor = this.editor()?.nativeElement;

        return (editor && kbqGetSelectionRect(editor)) ?? EMPTY_RECT;
    }

    /** The editor's text and the caret offset within it, or `null` when the caret is somewhere else. */
    private readCaret(): { value: string; caret: number } | null {
        const editor = this.editor()?.nativeElement;
        const selection = this.document.getSelection();
        const node = selection?.focusNode;

        if (!editor || !node || !selection.isCollapsed || !editor.contains(node)) return null;

        const beforeCaret = this.document.createRange();

        beforeCaret.selectNodeContents(editor);
        beforeCaret.setEnd(node, selection.focusOffset);

        return { value: editor.textContent ?? '', caret: beforeCaret.toString().length };
    }

    /** The last `length` characters before the caret, as a range that outlives the keystrokes extending it. */
    private getTokenRange(length: number): Range | null {
        const selection = this.document.getSelection();
        const node = selection?.focusNode;

        // A token is typed into one text node; anything else is left to the next keystroke.
        if (!node || node.nodeType !== TEXT_NODE || selection.focusOffset < length) return null;

        const range = this.document.createRange();

        range.setStart(node, selection.focusOffset - length);
        range.setEnd(node, selection.focusOffset);

        return range;
    }
}
