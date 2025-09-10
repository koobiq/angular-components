import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';

const INITIAL_TAGS = Array.from({ length: 3 }, (_, i) => `Removable tag ${i}`);

/**
 * @title Tag list removable
 */
@Component({
    standalone: true,
    selector: 'tag-list-removable-example',
    imports: [KbqTagsModule, KbqIconModule, JsonPipe],
    template: `
        <kbq-tag-list removable multiple>
            @for (tag of tags(); track tag) {
                <kbq-tag [value]="tag" (removed)="remove($event)">
                    {{ tag }}
                    <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
                </kbq-tag>
            } @empty {
                <i kbq-icon-button="kbq-arrow-rotate-left_16" [color]="colors.ContrastFade" (click)="restart()"></i>
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
            gap: var(--kbq-size-m);
            min-height: var(--kbq-size-7xl);
            margin: var(--kbq-size-5xl);
        }

        small {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListRemovableExample {
    protected readonly colors = KbqComponentColors;
    protected readonly tags = model(INITIAL_TAGS.slice());

    protected remove(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            return tags;
        });
    }

    protected restart(): void {
        this.tags.update(() => INITIAL_TAGS.slice());
    }
}
