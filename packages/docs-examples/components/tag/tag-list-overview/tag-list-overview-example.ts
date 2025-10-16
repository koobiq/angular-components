import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';

const getTags = (): string[] => Array.from({ length: 3 }, (_, i) => `Tag ${i}`);

/**
 * @title Tag list overview
 */
@Component({
    standalone: true,
    selector: 'tag-list-overview-example',
    imports: [KbqTagsModule, KbqIconModule],
    template: `
        <kbq-tag-list removable multiple draggable>
            @for (tag of tags(); track $index) {
                <kbq-tag [value]="tag" (removed)="remove($event)">
                    {{ tag }}
                    <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
                </kbq-tag>
            } @empty {
                <i kbq-icon-button="kbq-arrow-rotate-left_16" [color]="colors.ContrastFade" (click)="restart()"></i>
            }
        </kbq-tag-list>
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
export class TagListOverviewExample {
    protected readonly colors = KbqComponentColors;
    protected readonly tags = model(getTags());

    protected remove(event: KbqTagEvent): void {
        this.tags.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            return tags;
        });
    }

    protected restart(): void {
        this.tags.update(() => getTags());
    }
}
