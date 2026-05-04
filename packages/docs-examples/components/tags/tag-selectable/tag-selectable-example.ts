import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqTagSelectionChange, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag selectable
 */
@Component({
    selector: 'tag-selectable-example',
    imports: [KbqTagsModule],
    template: `
        <kbq-tag selectable selected (selectionChange)="onSelectionChange($event)">Selectable tag</kbq-tag>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class TagSelectableExample {
    protected onSelectionChange(event: KbqTagSelectionChange): void {
        console.log('Selection changed:', event);
    }
}
