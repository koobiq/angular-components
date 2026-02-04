import { ChangeDetectionStrategy, Component, computed, model, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEditChange, KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

const TAG = 'Editable tag with validation';

/**
 * @title Tag editable with validation
 */
@Component({
    selector: 'tag-editable-with-validation-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule, KbqToolTipModule, KbqTitleModule],
    template: `
        @if (tagValue().length > 0) {
            <kbq-tag
                editable
                kbq-title
                [preventEditSubmit]="!isModelValid()"
                [color]="tagColor()"
                (editChange)="editChange($event)"
                (removed)="removed($event)"
            >
                {{ tagValue() }}
                <input
                    kbqTooltip="Maximum {{ initialMaxLength }} characters (actual: {{ trimmedTagModel().length }})"
                    kbqTagEditInput
                    kbqTrigger="none"
                    [kbqTooltipColor]="color.Error"
                    [(ngModel)]="tagModel"
                />
                @if (trimmedTagModel().length === 0) {
                    <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit [color]="color.Theme"></i>
                } @else {
                    <i
                        kbq-icon-button="kbq-check-s_16"
                        kbqTagEditSubmit
                        [color]="color.Theme"
                        [disabled]="!isModelValid()"
                    ></i>
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
export class TagEditableWithValidationExample {
    private readonly tooltip = viewChild.required(KbqTooltipTrigger);
    protected readonly popUpPlacements = PopUpPlacements;
    protected readonly color = KbqComponentColors;
    protected readonly tagValue = signal(TAG);
    protected readonly initialMaxLength = this.tagValue().length;
    protected readonly tagModel = model(this.tagValue());
    protected readonly trimmedTagModel = computed(() => this.tagModel().trim());
    protected readonly isModelValid = computed(() => this.trimmedTagModel().length <= this.initialMaxLength);
    protected readonly tagColor = computed(() => (this.isModelValid() ? this.color.ContrastFade : this.color.Error));

    constructor() {
        toObservable(this.isModelValid)
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((isModelValid) => {
                const tooltip = this.tooltip();

                if (tooltip.isOpen) tooltip.hide();
                if (!isModelValid) tooltip.show(0);
            });
    }

    protected editChange(event: KbqTagEditChange): void {
        switch (event.type) {
            case 'start': {
                this.start(event);
                break;
            }
            case 'cancel': {
                this.cancel(event);
                break;
            }
            case 'submit': {
                this.submit(event);
                break;
            }
            default:
        }
    }

    protected removed(event: KbqTagEvent): void {
        console.info('Tag was removed: ', event);

        this.tagValue.set('');
    }

    protected restart(): void {
        this.tagValue.set(TAG);
        this.tagModel.set(this.tagValue());
    }

    private start({ reason }: KbqTagEditChange): void {
        console.info(`Tag edit was started. Reason: "${reason}".`);
    }

    private cancel(event: KbqTagEditChange): void {
        console.info(`Tag edit was canceled. Reason: "${event.reason}".`);

        if (event.reason === 'focusout' && this.isModelValid()) {
            return this.submit({ ...event, reason: 'Handle submit when focusout' });
        }

        this.tagModel.set(this.tagValue());
    }

    private submit(event: KbqTagEditChange): void {
        console.info(`Tag edit was submitted. Reason: "${event.reason}".`);

        const model = this.trimmedTagModel();

        if (model.length === 0) {
            this.tagModel.set(this.tagValue());

            return event.tag.remove();
        }

        if (!this.isModelValid()) {
            return this.cancel({ ...event, reason: 'Handle cancel when model is invalid' });
        }

        this.tagValue.set(model);
        this.tagModel.set(this.tagValue());
    }
}
