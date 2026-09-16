import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTag, KbqTagEvent, KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';

/** Tags the user is not allowed to take off. */
const lockedTags = ['Beta'];

/**
 * @title Tag input cleaner with disabled tags
 */
@Component({
    selector: 'tag-input-cleaner-with-disabled-example',
    imports: [KbqIconModule, KbqInputModule, KbqTagsModule],
    template: `
        <kbq-form-field>
            <kbq-tag-list #keptList="kbqTagList">
                @for (tag of kept(); track tag) {
                    <kbq-tag [value]="tag" [disabled]="isLocked(tag)" (removed)="removedFromKept($event)">
                        {{ tag }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
                    kbqInput
                    placeholder="Kept"
                    [kbqTagInputFor]="keptList"
                    [kbqTagInputSeparatorKeyCodes]="separators"
                    (kbqTagInputTokenEnd)="createInKept($event)"
                />

                <kbq-cleaner />
            </kbq-tag-list>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-tag-list #clearedList="kbqTagList" [clearPredicate]="clearEverything">
                @for (tag of cleared(); track tag) {
                    <kbq-tag [value]="tag" [disabled]="isLocked(tag)" (removed)="removedFromCleared($event)">
                        {{ tag }}
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                    </kbq-tag>
                }

                <input
                    autocomplete="off"
                    kbqInput
                    placeholder="Cleared"
                    [kbqTagInputFor]="clearedList"
                    [kbqTagInputSeparatorKeyCodes]="separators"
                    (kbqTagInputTokenEnd)="createInCleared($event)"
                />

                <kbq-cleaner />
            </kbq-tag-list>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 240px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagInputCleanerWithDisabledExample {
    protected readonly separators = [COMMA, ENTER];
    protected readonly kept = model(['Alpha', 'Beta', 'Gamma']);
    protected readonly cleared = model(['Alpha', 'Beta', 'Gamma']);

    /** Opts out of the default, which leaves the disabled tags in place. */
    protected readonly clearEverything = (_tag: KbqTag) => true;

    protected isLocked(tag: string): boolean {
        return lockedTags.includes(tag);
    }

    protected createInKept({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.kept.update((tags) => [...tags, value]);
            input.value = '';
        }
    }

    protected createInCleared({ input, value = '' }: KbqTagInputEvent): void {
        if (value) {
            this.cleared.update((tags) => [...tags, value]);
            input.value = '';
        }
    }

    protected removedFromKept({ tag }: KbqTagEvent): void {
        this.kept.update((tags) => tags.filter((value) => value !== tag.value));
    }

    protected removedFromCleared({ tag }: KbqTagEvent): void {
        this.cleared.update((tags) => tags.filter((value) => value !== tag.value));
    }
}
