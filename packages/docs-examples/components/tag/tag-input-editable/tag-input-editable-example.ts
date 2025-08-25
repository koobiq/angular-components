import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEditChange, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Tag input editable
 */
@Component({
    standalone: true,
    selector: 'tag-input-editable-example',
    imports: [KbqTagsModule, KbqIconModule, JsonPipe, KbqFormFieldModule, FormsModule],
    template: `
        @let _tags = tags();

        <kbq-form-field>
            <kbq-tag-list #tagList [(ngModel)]="tags">
                @for (tag of _tags; track $index) {
                    <kbq-tag
                        editable
                        [value]="tag"
                        [color]="color.ContrastFade"
                        (editChange)="editChange($event, $index)"
                        (removed)="remove($index)"
                    >
                        {{ tag }}
                        <input kbqTagEditInput [(ngModel)]="_tags[$index]" />
                        <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input placeholder="New tag" [kbqTagInputFor]="tagList" (kbqTagInputTokenEnd)="create($event)" />

                <kbq-cleaner #kbqTagListCleaner (click)="clear()" />
            </kbq-tag-list>
        </kbq-form-field>

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
export class TagInputEditableExample {
    protected readonly color = KbqComponentColors;
    protected readonly tags = model(Array.from({ length: 3 }, (_, i) => `Editable tag ${i}`));
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
        this.tags.update((tags) => {
            tags.splice(index, 1);

            return tags;
        });

        this.toast.show({
            title: `Tag #${index} was removed`,
            style: KbqToastStyle.Warning
        });
    }

    protected create({ input, value }: KbqTagInputEvent): void {
        const _value = (value || '').trim();

        if (_value) {
            this.tags.update((tags) => {
                tags.push(_value);

                return tags;
            });
            input.value = '';
        }
    }

    protected clear(): void {
        this.tags.update(() => []);
    }
}
