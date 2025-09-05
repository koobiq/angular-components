import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEditChange, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag list editable
 */
@Component({
    standalone: true,
    selector: 'tag-list-editable-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule, JsonPipe, KbqInputModule],
    template: `
        <kbq-tag-list editable [(ngModel)]="tags">
            @for (tag of tags(); track $index) {
                <kbq-tag [value]="tag" (editChange)="editChange($event, $index)" (removed)="remove($index)">
                    {{ tag }}
                    <input kbqInput kbqTagEditInput [(ngModel)]="tags()[$index]" />
                    <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>
            }
        </kbq-tag-list>

        <small>
            <code>{{ tags() | json }}</code>
        </small>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            margin: var(--kbq-size-xl);
        }

        .kbq-tag-list {
            width: 100%;
        }

        small {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListEditableExample {
    protected readonly tags = model(Array.from({ length: 3 }, (_, i) => `Editable tag ${i}`));
    protected readonly color = KbqComponentColors;

    protected editChange({ reason, type }: KbqTagEditChange, index: number): void {
        switch (type) {
            case 'start': {
                console.info(`Tag #${index} edit was started. Reason: "${reason}".`);
                break;
            }
            case 'cancel': {
                console.info(`Tag #${index} edit was canceled. Reason: "${reason}".`);
                break;
            }
            case 'submit': {
                console.info(`Tag #${index} edit was submitted. Reason: "${reason}".`);
                break;
            }
            default:
        }
    }

    protected remove(index: number): void {
        console.info(`Tag #${index} edit was removed.`);
    }
}
