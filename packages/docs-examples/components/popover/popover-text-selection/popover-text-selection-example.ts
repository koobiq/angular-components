import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCaretRect, kbqCreateCaretOrigin, kbqGetSelectionRect } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { fromEvent } from 'rxjs';

const EMPTY_RECT: KbqCaretRect = { x: 0, y: 0, width: 0, height: 0 };

/**
 * @title Popover next to a text selection
 */
@Component({
    selector: 'popover-text-selection-example',
    imports: [
        KbqButtonToggleModule,
        KbqIconModule,
        KbqPopoverModule
    ],
    template: `
        <ng-template #toolbar>
            <!-- A click on the toolbar would otherwise drop the selection the toolbar is attached to. -->
            <kbq-button-toggle-group
                aria-label="Text formatting"
                [multiple]="true"
                (mousedown)="$event.preventDefault()"
            >
                <kbq-button-toggle aria-label="Bold" value="bold">
                    <i kbq-icon="kbq-text-bold_16"></i>
                </kbq-button-toggle>
                <kbq-button-toggle aria-label="Italic" value="italic">
                    <i kbq-icon="kbq-text-italic_16"></i>
                </kbq-button-toggle>
                <kbq-button-toggle aria-label="Underline" value="underline">
                    <i kbq-icon="kbq-text-underline_16"></i>
                </kbq-button-toggle>
            </kbq-button-toggle-group>
        </ng-template>

        <p
            #text
            class="example-article"
            kbqPopover
            kbqPopoverAriaLabel="Text formatting"
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
            Select any part of this paragraph, and the formatting toolbar will appear right above the selected text and
            follow it while the page scrolls. Press Escape or click anywhere else to close it.
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverTextSelectionExample {
    private readonly document = inject(DOCUMENT);
    private readonly text = viewChild<ElementRef<HTMLElement>>('text');

    /** Stays on the selection: the rectangle is measured again every time the panel is positioned. */
    protected readonly origin = kbqCreateCaretOrigin(() => this.measureSelection());
    protected readonly visible = signal(false);

    constructor() {
        fromEvent(this.document, 'selectionchange')
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.visible.set(this.hasSelection()));

        // The toolbar never takes focus, so its own `Escape` handler is out of reach.
        fromEvent<KeyboardEvent>(this.document, 'keydown')
            .pipe(takeUntilDestroyed())
            .subscribe((event) => {
                if (event.key === 'Escape') {
                    this.visible.set(false);
                }
            });
    }

    private measureSelection(): KbqCaretRect {
        const element = this.text()?.nativeElement;

        return (element && kbqGetSelectionRect(element)) ?? EMPTY_RECT;
    }

    private hasSelection(): boolean {
        const selection = this.document.getSelection();
        const element = this.text()?.nativeElement;

        if (!element || !selection || selection.isCollapsed) return false;

        return element.contains(selection.anchorNode) && element.contains(selection.focusNode);
    }
}
