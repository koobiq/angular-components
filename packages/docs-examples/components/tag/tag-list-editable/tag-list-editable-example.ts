import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEditChange, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Tag list editable
 */
@Component({
    standalone: true,
    selector: 'tag-list-editable-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule, JsonPipe],
    template: `
        @let _tags = tags();

        <kbq-tag-list editable [(ngModel)]="tags">
            @for (tag of _tags; track $index) {
                <kbq-tag [value]="tag" (editChange)="editChange($event, $index)" (removed)="remove($index)">
                    {{ tag }}
                    <input kbqTagEditInput [(ngModel)]="_tags[$index]" />
                    <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>
            }
        </kbq-tag-list>

        <small>
            <code>{{ _tags | json }}</code>
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

        small {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListEditableExample {
    protected readonly tags = model(Array.from({ length: 3 }, (_, i) => `Editable tag ${i}`));
    protected readonly color = KbqComponentColors;
    private readonly toast = inject(KbqToastService);

    protected editChange({ reason, type }: KbqTagEditChange, index: number): void {
        switch (type) {
            case 'start': {
                this.toast.show({
                    title: `Tag #${index} edit was started`,
                    style: KbqToastStyle.Contrast,
                    caption: `Reason: ${reason}`
                });
                break;
            }
            case 'cancel': {
                this.toast.show({
                    title: `Tag #${index} edit was canceled`,
                    style: KbqToastStyle.Warning,
                    caption: `Reason: ${reason}`
                });
                break;
            }
            case 'submit': {
                this.toast.show({
                    title: `Tag #${index} edit was submitted`,
                    style: KbqToastStyle.Success,
                    caption: `Reason: ${reason}`
                });
                break;
            }
            default:
        }
    }

    protected remove(index: number): void {
        this.toast.show({
            title: `Tag #${index} was removed`,
            style: KbqToastStyle.Warning
        });
    }
}
