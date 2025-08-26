import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEditChange, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag editable
 */
@Component({
    standalone: true,
    selector: 'tag-editable-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule],
    template: `
        <kbq-tag editable (editChange)="editChange($event)" (removed)="remove()">
            {{ tag() }}
            <input kbqTagEditInput [(ngModel)]="tag" />
            <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit></i>

            <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagEditableExample {
    protected readonly tagValue = signal('Editable tag');
    protected readonly tag = model(this.tagValue());

    protected editChange({ type, reason }: KbqTagEditChange): void {
        switch (type) {
            case 'start': {
                console.info(`Tag edit was started. Reason: "${reason}".`);

                break;
            }
            case 'cancel': {
                console.info(`Tag edit was canceled. Reason: "${reason}".`);
                break;
            }
            case 'submit': {
                console.info(`Tag edit was submitted. Reason: "${reason}".`);
                break;
            }
            default:
        }
    }

    protected remove(): void {
        console.info('Tag was removed.');
    }
}
