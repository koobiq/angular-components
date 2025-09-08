import { ChangeDetectionStrategy, Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Tag removable
 */
@Component({
    standalone: true,
    selector: 'tag-removable-example',
    imports: [KbqTagsModule, KbqIconModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="removable">Removable</kbq-toggle>

        @if (display()) {
            <kbq-tag [removable]="removable()" (removed)="removed($event)">
                {{ tag() }}
                <kbq-icon-button kbqTagRemove kbq-icon-button="kbq-xmark-s_16" />
            </kbq-tag>
        } @else {
            <i kbq-icon-button="kbq-arrow-rotate-left_16" [color]="colors.ContrastFade" (click)="restart()"></i>
        }
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagRemovableExample {
    protected readonly colors = KbqComponentColors;
    protected readonly removable = model(true);
    protected readonly tag = computed(() => (this.removable() ? 'Removable tag' : 'Not removable tag'));
    protected readonly display = signal(true);

    protected removed(event: KbqTagEvent): void {
        console.log('Tag was removed:', event);

        this.display.set(false);
    }

    protected restart(): void {
        this.display.set(true);
    }
}
