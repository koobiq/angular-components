import { ChangeDetectionStrategy, Component, ElementRef, model, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEditChange, KbqTagEvent, KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqTitleModule } from '@koobiq/components/title';

const getTags = () => Array.from({ length: 3 }, (_, i) => ({ value: `Editable tag ${i}` }));

/**
 * @title Tag input editable
 */
@Component({
    selector: 'tag-input-editable-example',
    imports: [KbqTagsModule, KbqIconModule, KbqFormFieldModule, FormsModule, KbqInputModule, KbqTitleModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" editable>
                @for (tag of tags(); track tag) {
                    <kbq-tag
                        kbq-title
                        [value]="tag"
                        (editChange)="editChange($event, $index)"
                        (removed)="removed($event)"
                    >
                        {{ tag.value }}
                        <input kbqInput kbqTagEditInput [(ngModel)]="editInputModel" />
                        @if (editInputModel().length === 0) {
                            <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                        } @else {
                            <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                        }
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove (click)="afterRemove()"></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    (kbqTagInputTokenEnd)="create($event)"
                />

                <kbq-cleaner #kbqTagListCleaner (click)="clear()" />
            </kbq-tag-list>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            margin: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputEditableExample {
    protected readonly color = KbqComponentColors;
    protected readonly tags = model(getTags());
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });
    protected readonly editInputModel = model<string>('');

    protected editChange({ reason, type, tag }: KbqTagEditChange, index: number): void {
        switch (type) {
            case 'start': {
                console.info(`Tag #${index} edit was started. Reason: "${reason}".`);

                this.editInputModel.set(tag.value.value);

                break;
            }
            case 'cancel': {
                console.info(`Tag #${index} edit was canceled. Reason: "${reason}".`);

                this.editInputModel.set('');

                this.focusInput();

                break;
            }
            case 'submit': {
                console.info(`Tag #${index} edit was submitted. Reason: "${reason}".`);

                if (!this.editInputModel()) {
                    tag.remove();
                } else {
                    this.tags.update((tags) => {
                        tags[index].value = this.editInputModel();

                        return tags;
                    });
                    this.editInputModel.set('');
                }

                this.focusInput();

                break;
            }
            default:
        }
    }

    protected removed(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.info(`Tag #${index} was removed.`);

            return [...tags];
        });
    }

    protected create({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.tags.update((tags) => {
                tags.push({ value });

                return tags;
            });

            input.value = '';
        }
    }

    protected clear(): void {
        this.tags.update(() => []);
    }

    protected afterRemove(): void {
        this.focusInput();
    }

    private focusInput(): void {
        this.input().nativeElement.focus();
    }
}
