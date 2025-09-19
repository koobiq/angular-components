import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqTagSelectionChange, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag list selectable
 */
@Component({
    standalone: true,
    selector: 'tag-list-selectable-example',
    imports: [KbqTagsModule],
    template: `
        <kbq-tag-list selectable multiple>
            @for (tag of tags(); track $index) {
                <kbq-tag [selected]="$index > 0" [value]="tag" (selectionChange)="selectionChange($event)">
                    {{ tag }}
                </kbq-tag>
            }
        </kbq-tag-list>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListSelectableExample {
    protected readonly tags = model(Array.from({ length: 3 }, (_, i) => `Selectable tag ${i}`));

    protected selectionChange(event: KbqTagSelectionChange): void {
        console.log('Tag selection was changed :', event);
    }
}
