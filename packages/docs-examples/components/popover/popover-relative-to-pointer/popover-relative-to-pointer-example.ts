import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover at the click point
 */
@Component({
    selector: 'popover-relative-to-pointer-example',
    imports: [KbqButtonModule, KbqPopoverModule],
    template: `
        <ng-template #owner let-owner>Information about {{ owner }}.</ng-template>

        <button
            type="button"
            kbq-button
            kbqPopover
            kbqRelativeToPointer
            kbqPopoverAriaLabel="Owner information"
            class="example-owner-trigger"
            [kbqPopoverContent]="owner"
            [kbqPopoverContext]="selectedOwner"
            (click)="selectOwner($event)"
        >
            <span data-owner="Ivan Ivanov">Ivan Ivanov</span>
            ,
            <span data-owner="Petr Petrov">Petr Petrov</span>
        </button>
    `,
    styles: `
        .example-owner-trigger {
            width: 100%;
            white-space: normal;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverRelativeToPointerExample {
    protected selectedOwner = 'Ivan Ivanov';

    protected selectOwner(event: MouseEvent): void {
        if (!(event.target instanceof Element)) return;

        const owner = event.target.closest<HTMLElement>('[data-owner]')?.dataset['owner'];

        if (owner) {
            this.selectedOwner = owner;
        }
    }
}
