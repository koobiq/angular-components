import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagSelectionChange, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Tag list selectable
 */
@Component({
    standalone: true,
    selector: 'tag-list-selectable-example',
    imports: [KbqTagsModule, KbqIconModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="selectable">Selectable</kbq-toggle>

        <kbq-tag-list [selectable]="selectable()" [multiple]="true">
            @for (tag of tags; track $index) {
                <kbq-tag (selectionChange)="selectionChange($event)">{{ tag }}</kbq-tag>
            }
        </kbq-tag-list>
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
export class TagListSelectableExample {
    protected readonly selectable = model(true);
    protected readonly multiple = model(true);

    protected tags = Array.from({ length: 3 }, (_, i) => `Selectable tag ${i}`);

    protected selectionChange(event: KbqTagSelectionChange): void {
        console.log('Tag selection was changed :', event);
    }
}
