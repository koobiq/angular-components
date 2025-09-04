import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagSelectionChange, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Tag selectable
 */
@Component({
    standalone: true,
    selector: 'tag-selectable-example',
    imports: [KbqTagsModule, KbqIconModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="selectable">Selectable</kbq-toggle>

        <kbq-tag [selectable]="selectable()" (selectionChange)="selectionChange($event)">Selectable tag</kbq-tag>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--kbq-size-m);
            min-height: var(--kbq-size-7xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagSelectableExample {
    protected readonly selectable = model(true);

    protected selectionChange(event: KbqTagSelectionChange): void {
        console.log('Tag selection was changed :', event);
    }
}
