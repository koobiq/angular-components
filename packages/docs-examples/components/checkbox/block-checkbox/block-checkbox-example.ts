import { ChangeDetectionStrategy, Component, inject, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckable } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * EXAMPLE ONLY - not a published Koobiq component.
 *
 * A checkbox-like "card" control built directly on top of the shared `KbqCheckable` primitive.
 * Demonstrates that custom markup/styling can reuse the same click, form, and a11y behavior as
 * `kbq-checkbox` and `kbq-toggle` via `hostDirectives`, without reimplementing any of it.
 */
@Component({
    selector: 'block-checkbox-component',
    imports: [KbqIconModule],
    template: `
        <label class="example-block-checkbox__layout">
            <input
                #input
                type="checkbox"
                class="example-block-checkbox__input"
                [attr.aria-checked]="checkable.getAriaChecked()"
                [checked]="checkable.checked()"
                [disabled]="checkable.disabled()"
                [tabIndex]="checkable.effectiveTabIndex()"
                (click)="onInputClick($event)"
                (change)="$event.stopPropagation()"
            />

            <div class="example-block-checkbox__thumb">
                <ng-content select="[block-checkbox-thumb]" />
            </div>

            <div class="example-block-checkbox__body">
                <div class="example-block-checkbox__title kbq-text-normal-strong">
                    <ng-content select="[block-checkbox-title]" />
                </div>
                <div class="example-block-checkbox__description kbq-text-normal">
                    <ng-content />
                </div>
            </div>

            <span class="example-block-checkbox__indicator" aria-hidden="true">
                @if (checkable.checked()) {
                    <i kbq-icon="kbq-check-s_16" color="empty"></i>
                }
            </span>
        </label>
    `,
    styleUrl: './block-checkbox-example.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'example-block-checkbox',
        '[class.example-block-checkbox_checked]': 'checkable.checked()',
        '[class.example-block-checkbox_disabled]': 'checkable.disabled()'
    },
    hostDirectives: [
        { directive: KbqCheckable, inputs: ['checked', 'disabled'] }
    ]
})
export class BlockCheckboxComponent {
    protected readonly checkable = inject(KbqCheckable, { self: true });

    /** Emitted with the new `checked` value when the card is toggled by the user. */
    readonly checkedChange = output<boolean>();

    protected onInputClick(event: Event): void {
        // See KbqCheckbox/KbqToggleComponent#onInputClick - stops the label's generated click event
        // on the native input from bubbling and firing this handler a second time.
        event.stopPropagation();

        const { shouldToggle } = this.checkable.resolveClick(undefined);

        if (shouldToggle) {
            this.checkable.toggle();
            this.checkedChange.emit(this.checkable.checked());
        }
    }
}

/**
 * @title Custom checkbox block
 */
@Component({
    selector: 'block-checkbox-example',
    imports: [KbqIconModule, BlockCheckboxComponent, FormsModule],
    template: `
        <block-checkbox-component [(ngModel)]="checked">
            <span block-checkbox-title>Title</span>
            <div>Lorem ipsum</div>
        </block-checkbox-component>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class BlockCheckboxExample {
    checked = model(true);
}
