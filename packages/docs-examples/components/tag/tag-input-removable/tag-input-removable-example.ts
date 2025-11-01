import { ChangeDetectionStrategy, Component, ElementRef, model, viewChild } from '@angular/core';
import { KbqComponentColors, kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEvent, KbqTagInput, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

const getTags = () => Array.from({ length: 3 }, (_, i) => ({ value: `Removable tag ${i}` }));

/**
 * @title Tag input removable
 */
@Component({
    standalone: true,
    selector: 'tag-input-removable-example',
    imports: [KbqTagsModule, KbqIconModule, KbqFormFieldModule, KbqInputModule],
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    template: `
        <kbq-form-field>
            <kbq-tag-list #tagList="kbqTagList" removable>
                @for (tag of tags(); track tag) {
                    <kbq-tag [value]="tag" (removed)="removed($event)">
                        {{ tag.value }}
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
            gap: var(--kbq-size-m);
            min-height: var(--kbq-size-xxl);
            margin: var(--kbq-size-5xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputRemovableExample {
    protected readonly colors = KbqComponentColors;
    protected readonly removable = model(true);
    protected readonly tags = model(getTags());
    private readonly input = viewChild.required(KbqTagInput, { read: ElementRef });

    protected removed(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            return tags;
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
        this.input().nativeElement.focus();
    }
}
