import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEditChange, KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';

const getTags = (): string[] => Array.from({ length: 3 }, (_, i) => `Editable tag ${i}`);

/**
 * @title Tag list editable
 */
@Component({
    standalone: true,
    selector: 'tag-list-editable-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule, KbqInputModule, JsonPipe],
    template: `
        <kbq-tag-list editable>
            @for (tag of tags(); track $index) {
                <kbq-tag [value]="tag" (editChange)="editChange($event, $index)" (removed)="remove($event)">
                    {{ tag }}
                    <input kbqInput kbqTagEditInput [(ngModel)]="tags()[$index]" />
                    @if (tag.length === 0) {
                        <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                    } @else {
                        <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                    }
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                </kbq-tag>
            } @empty {
                <i kbq-icon-button="kbq-arrow-rotate-left_16" [color]="color.ContrastFade" (click)="restart()"></i>
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
            min-height: var(--kbq-size-7xl);
            margin: var(--kbq-size-5xl);
        }

        .kbq-tag-list {
            max-width: 100%;
        }

        small {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListEditableExample {
    protected readonly color = KbqComponentColors;
    protected readonly tags = model(getTags());
    private prevTags = this.tags().slice();

    protected editChange({ reason, type, tag }: KbqTagEditChange, index: number): void {
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

                break;
            }
            case 'submit': {
                console.info(`Tag #${index} edit was submitted. Reason: "${reason}".`);

                if (!tag.value) tag.remove();

                break;
            }
            default:
        }
    }

    protected remove(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.info(`Tag #${index} was removed.`);

            return tags;
        });
    }

    protected restart(): void {
        this.tags.update(() => getTags());
    }
}
