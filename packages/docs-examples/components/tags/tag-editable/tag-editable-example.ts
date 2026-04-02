import { ChangeDetectionStrategy, Component, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagEditChange, KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqTitleModule } from '@koobiq/components/title';

const TAG = 'Editable tag';

/**
 * @title Tag editable
 */
@Component({
    selector: 'tag-editable-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule, KbqInputModule, KbqTitleModule],
    template: `
        @if (!isTagRemoved()) {
            <kbq-tag editable kbq-title [value]="tag()" (editChange)="editChange($event)" (removed)="removed($event)">
                {{ tag() }}
                <input kbqInput kbqTagEditInput [(ngModel)]="tag" />
                @if (tag().length > 0) {
                    <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                } @else {
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                }
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
            </kbq-tag>
        } @else {
            <i kbq-icon-button="kbq-arrow-rotate-left_16" [color]="color.ContrastFade" (click)="restart()"></i>
        }
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
export class TagEditableExample {
    protected readonly tag = model(TAG);
    protected readonly isTagRemoved = signal(false);
    protected readonly color = KbqComponentColors;

    protected editChange({ type, reason, tag }: KbqTagEditChange): void {
        switch (type) {
            case 'start': {
                console.info(`Tag edit was started. Reason: "${reason}".`);
                break;
            }
            case 'cancel': {
                console.info(`Tag edit was canceled. Reason: "${reason}".`);
                break;
            }
            case 'submit': {
                console.info(`Tag edit was submitted. Reason: "${reason}".`);

                if (!tag.value) tag.remove();

                break;
            }
            default:
        }
    }

    protected removed(event: KbqTagEvent): void {
        console.info('Tag was removed: ', event);

        this.isTagRemoved.set(true);
    }

    protected restart(): void {
        this.tag.set(TAG);
        this.isTagRemoved.set(false);
    }
}
