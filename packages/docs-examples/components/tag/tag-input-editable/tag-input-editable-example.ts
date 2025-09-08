import { JsonPipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    inject,
    model,
    viewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEditChange, KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqTagEditChange, KbqTagEvent, KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag input editable
 */
@Component({
    standalone: true,
    selector: 'tag-input-editable-example',
    imports: [KbqTagsModule, KbqIconModule, JsonPipe, KbqFormFieldModule, FormsModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList editable [(ngModel)]="tags">
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag" (editChange)="editChange($event, $index)" (removed)="remove($event)">
                        {{ tag }}
                        <input kbqInput kbqTagEditInput [(ngModel)]="tags()[$index]" />
                        <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    kbqInput
                    placeholder="New tag"
                    [kbqTagInputFor]="tagList"
                    (kbqTagInputTokenEnd)="create($event)"
                />

                <kbq-cleaner #kbqTagListCleaner (click)="clear()" />
            </kbq-tag-list>
        </kbq-form-field>

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

        small {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputEditableExample {
    protected readonly color = KbqComponentColors;
    protected readonly tags = model(Array.from({ length: 3 }, (_, i) => `Editable tag ${i}`));
    private prevTags = this.tags().slice();
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    protected editChange({ reason, type, tag }: KbqTagEditChange, index: number): void {
        const input = this.input().nativeElement as HTMLInputElement;

        switch (type) {
            case 'start': {
                console.info(`Tag #${index} edit was started. Reason: "${reason}".`);

                this.prevTags = this.tags().slice();

                break;
            }
            case 'cancel': {
                console.info(`Tag #${index} edit was canceled. Reason: "${reason}".`);

                this.tags.update((tags) => {
                    tags[index] = this.prevTags[index];

                    return tags;
                });

                input.focus();

                break;
            }
            case 'submit': {
                console.info(`Tag #${index} edit was submitted. Reason: "${reason}".`);

                if (!tag.value) tag.remove();

                input.focus();

                break;
            }
            default:
        }
    }

    protected remove(event: KbqTagEvent): void {
        const index = this.tags().indexOf(event.tag.value);

        this.tags.update((tags) => {
            tags.splice(index, 1);

            return tags;
        });

        this.changeDetectorRef.detectChanges();

        console.info(`Tag #${index} was removed.`);
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
