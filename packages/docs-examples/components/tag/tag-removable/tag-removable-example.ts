import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';
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

        @if (!removed()) {
            <kbq-tag [removable]="removable()" (removed)="removed.set(true)">
                Removable tag
                <kbq-icon-button kbqTagRemove kbq-icon-button="kbq-xmark-s_16" />
            </kbq-tag>
        } @else {
            <i
                kbq-icon-button="kbq-arrow-rotate-left_16"
                [color]="colors.ContrastFade"
                (click)="removed.set(false)"
            ></i>
        }
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
export class TagRemovableExample {
    protected readonly colors = KbqComponentColors;
    protected readonly removable = model(true);
    protected readonly removed = signal(false);
}
