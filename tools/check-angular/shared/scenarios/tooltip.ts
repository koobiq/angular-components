import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * A toolbar of a draft: a button with a hint that can be switched off, and a button opening a popover that renames
 * the draft. Every visibility change the consumer is told about is recorded.
 */
@Component({
    selector: 'check-tooltip',
    imports: [
        ReactiveFormsModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqPopoverModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <button
            kbq-button
            data-check="save"
            kbqTooltip="Saves the draft without publishing it"
            [kbqTooltipDisabled]="hintsDisabled()"
            (kbqVisibleChange)="onTooltipVisibleChange($event)"
        >
            Save
        </button>

        <button
            kbq-button
            data-check="rename"
            kbqPopover
            kbqPopoverAriaLabel="Rename the draft"
            [kbqPopoverHeader]="renameHeader"
            [kbqPopoverContent]="renameContent"
            (kbqPopoverVisibleChange)="onPopoverVisibleChange($event)"
        >
            Rename
        </button>

        <ng-template #renameHeader>Rename the draft</ng-template>

        <ng-template #renameContent>
            <kbq-form-field>
                <input kbqInput aria-label="Draft name" [formControl]="name" />
            </kbq-form-field>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipScenario {
    readonly hintsDisabled = signal(false);
    readonly name = new FormControl('Quarterly report', { nonNullable: true });

    /** Every `kbqVisibleChange` of the tooltip, in order. */
    readonly tooltipVisibility = signal<boolean[]>([]);
    /** Every `kbqPopoverVisibleChange` of the popover, in order. */
    readonly popoverVisibility = signal<boolean[]>([]);

    protected onTooltipVisibleChange(visible: boolean): void {
        this.tooltipVisibility.update((events) => [...events, visible]);
    }

    protected onPopoverVisibleChange(visible: boolean): void {
        this.popoverVisibility.update((events) => [...events, visible]);
    }
}
