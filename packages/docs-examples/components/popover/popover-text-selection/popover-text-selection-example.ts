import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCaretRect, kbqCreateCaretOrigin, kbqGetSelectionRect } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { debounceTime, fromEvent } from 'rxjs';

/** `Node.TEXT_NODE`, spelled out so that the example never reads a DOM global. */
const TEXT_NODE = 3;

const EMPTY_RECT: KbqCaretRect = { x: 0, y: 0, width: 0, height: 0 };

/** How long a keyboard selection has to stand still before the toolbar follows it, in milliseconds. */
const SELECTION_SETTLE_DELAY = 200;

/** Each format is the element the selected text is wrapped in. */
const FORMATS = [
    { tag: 'strong', icon: 'kbq-text-bold_16', label: 'Bold' },
    { tag: 'em', icon: 'kbq-text-italic_16', label: 'Italic' },
    { tag: 'u', icon: 'kbq-text-underline_16', label: 'Underline' }
] as const;

type Format = (typeof FORMATS)[number];

/**
 * @title Popover next to a text selection
 */
@Component({
    selector: 'popover-text-selection-example',
    imports: [
        KbqButtonModule,
        KbqIconModule,
        KbqPopoverModule
    ],
    template: `
        <ng-template #toolbar>
            <!-- A click on the toolbar would otherwise drop the selection the toolbar is attached to. -->
            <div
                aria-label="Text formatting"
                class="example-toolbar__buttons"
                role="group"
                (mousedown)="$event.preventDefault()"
            >
                @for (format of formats; track format.tag) {
                    <button
                        kbq-button
                        kbqStyle="transparent"
                        [attr.aria-label]="format.label"
                        [attr.aria-pressed]="active().includes(format.tag)"
                        [class.kbq-active]="active().includes(format.tag)"
                        (click)="toggle(format)"
                    >
                        <i [kbq-icon]="format.icon"></i>
                    </button>
                }
            </div>
        </ng-template>

        <p
            #text
            class="example-article"
            kbqPopover
            kbqPopoverAriaLabel="Text formatting"
            kbqPopoverClass="example-toolbar"
            kbqPopoverPlacement="top"
            kbqPopoverSize="custom"
            kbqTrigger="manual"
            [kbqPopoverArrow]="false"
            [kbqPopoverAutoFocus]="false"
            [kbqPopoverContent]="toolbar"
            [kbqPopoverDefaultPaddings]="false"
            [kbqPopoverOrigin]="origin"
            [kbqPopoverVisible]="visible()"
        >
            Select any part of this paragraph to format it: the toolbar appears right above the selected text and
            follows it while the page scrolls. Press Escape or click anywhere else to close it.
        </p>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: 48px 0 24px;
        }

        .example-article {
            max-width: 440px;
            margin: 0;
        }

        /* The panel holds a toolbar, so it never scrolls: a pixel of overflow would show a scrollbar. */
        ::ng-deep .example-toolbar .kbq-popover__content {
            overflow: hidden;
        }

        .example-toolbar__buttons {
            display: flex;
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverTextSelectionExample {
    private readonly document = inject(DOCUMENT);
    private readonly text = viewChild<ElementRef<HTMLElement>>('text');
    private readonly popover = viewChild(KbqPopoverTrigger);

    /** Stays on the selection: the rectangle is measured again every time the panel is positioned. */
    protected readonly origin = kbqCreateCaretOrigin(() => this.measureSelection());
    protected readonly visible = signal(false);
    /** The formats the selection already carries. */
    protected readonly active = signal<string[]>([]);
    protected readonly formats = FORMATS;

    /** Whether a pointer selection is still being dragged out. */
    private selecting = false;

    constructor() {
        // A pointer selection is only final on `pointerup`: shown on the first `selectionchange`, the toolbar
        // would anchor to the first characters of a selection the user is still dragging out.
        fromEvent<PointerEvent>(this.document, 'pointerdown')
            .pipe(takeUntilDestroyed())
            .subscribe((event) => {
                if (this.isInsideToolbar(event.target)) return;

                this.selecting = true;
                this.visible.set(false);
            });

        fromEvent<PointerEvent>(this.document, 'pointerup')
            .pipe(takeUntilDestroyed())
            .subscribe((event) => {
                if (this.isInsideToolbar(event.target)) return;

                this.selecting = false;
                this.readSelection();
            });

        // A keyboard selection has no such end, so the toolbar follows it once it stops growing.
        fromEvent(this.document, 'selectionchange')
            .pipe(debounceTime(SELECTION_SETTLE_DELAY), takeUntilDestroyed())
            .subscribe(() => {
                if (!this.selecting) {
                    this.readSelection();
                }
            });

        // The toolbar never takes focus on its own, so its `Escape` and `Tab` handlers are out of reach.
        fromEvent<KeyboardEvent>(this.document, 'keydown')
            .pipe(takeUntilDestroyed())
            .subscribe((event) => this.handleKeydown(event));
    }

    protected toggle(format: Format): void {
        const range = this.getRange();

        if (!range) return;

        const wrapper = this.findWrapper(range, format.tag);
        const next = this.document.createRange();

        if (wrapper) {
            // The whole wrapper goes, so a selection inside a longer formatted run unformats that run.
            const contents = Array.from(wrapper.childNodes);

            if (!contents.length) return;

            wrapper.replaceWith(...contents);

            next.setStartBefore(contents[0]);
            next.setEndAfter(contents[contents.length - 1]);
        } else {
            const element = this.document.createElement(format.tag);

            // Unlike `surroundContents`, this survives a selection that starts or ends inside another element.
            element.append(range.extractContents());
            range.insertNode(element);

            next.selectNodeContents(element);
        }

        this.select(next);

        this.readSelection();
        this.popover()?.updatePosition(true);
    }

    private handleKeydown(event: KeyboardEvent): void {
        if (!this.visible()) return;

        if (event.key === 'Escape') {
            this.visible.set(false);
        }

        // The panel is in an overlay at the end of the document, so `Tab` would walk past it.
        if (event.key === 'Tab' && !event.shiftKey && !this.isInsideToolbar(this.document.activeElement)) {
            const button = this.document.querySelector<HTMLButtonElement>('.example-toolbar button');

            if (button) {
                event.preventDefault();
                button.focus();
            }
        }
    }

    private readSelection(): void {
        const range = this.getRange();
        const wasVisible = this.visible();

        this.visible.set(!!range);
        this.active.set(range ? FORMATS.filter(({ tag }) => this.findWrapper(range, tag)).map(({ tag }) => tag) : []);

        // An open panel has to be told to move, and only a re-applied position re-reads the origin rectangle.
        if (wasVisible && range) {
            this.popover()?.updatePosition(true);
        }
    }

    private isInsideToolbar(target: EventTarget | null): boolean {
        return !!(target as HTMLElement | null)?.closest?.('.example-toolbar');
    }

    private measureSelection(): KbqCaretRect {
        const element = this.text()?.nativeElement;

        return (element && kbqGetSelectionRect(element)) ?? EMPTY_RECT;
    }

    /** The current selection, when it is a range of text inside the paragraph. */
    private getRange(): Range | null {
        const selection = this.document.getSelection();
        const element = this.text()?.nativeElement;

        if (!element || !selection || selection.isCollapsed || !selection.rangeCount) return null;

        if (!element.contains(selection.anchorNode) || !element.contains(selection.focusNode)) return null;

        return selection.getRangeAt(0);
    }

    private findWrapper(range: Range, tag: string): HTMLElement | null {
        const article = this.text()?.nativeElement;
        const node = range.commonAncestorContainer;
        const element = node.nodeType === TEXT_NODE ? node.parentElement : (node as HTMLElement);
        const wrapper = element?.closest<HTMLElement>(tag);

        return wrapper && article?.contains(wrapper) ? wrapper : null;
    }

    private select(range: Range): void {
        const selection = this.document.getSelection();

        selection?.removeAllRanges();
        selection?.addRange(range);
    }
}
