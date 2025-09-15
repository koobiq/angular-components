import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqTagSelectionChange, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Tag selectable
 */
@Component({
    standalone: true,
    selector: 'tag-selectable-example',
    imports: [KbqTagsModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="selectable">Selectable</kbq-toggle>

        <kbq-tag [selectable]="selectable()" (selectionChange)="selectionChange($event)">{{ tag() }}</kbq-tag>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-m);
            min-height: var(--kbq-size-7xl);
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagSelectableExample {
    protected readonly selectable = model(true);
    protected readonly tag = computed(() => (this.selectable() ? 'Selectable tag' : 'Not selectable tag'));

    protected selectionChange(event: KbqTagSelectionChange): void {
        console.log('Tag selection was changed :', event);
    }
}
