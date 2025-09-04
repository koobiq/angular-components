import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

const INITIAL_TAGS = Array.from({ length: 3 }, (_, i) => `Tag removable ${i}`);

/**
 * @title Tag list removable
 */
@Component({
    standalone: true,
    selector: 'tag-list-removable-example',
    imports: [KbqTagsModule, KbqIconModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="removable">Removable</kbq-toggle>

        <kbq-tag-list [multiple]="true">
            @for (tag of tags; track $index) {
                <kbq-tag [value]="tag" [removable]="removable()" (removed)="remove($event, $index)">
                    {{ tag }}
                    <kbq-icon-button kbqTagRemove kbq-icon-button="kbq-xmark-s_16" />
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
            justify-content: center;
            gap: var(--kbq-size-m);
            min-height: var(--kbq-size-7xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagListRemovableExample {
    protected readonly colors = KbqComponentColors;
    protected readonly removable = model(true);
    protected readonly tags = INITIAL_TAGS.slice();

    protected remove(event: KbqTagEvent, index: number): void {
        console.log('Tag was removed:', event);

        this.tags.splice(index, 1);
    }

    protected restart(): void {
        this.tags.push(...INITIAL_TAGS.slice());
    }
}
