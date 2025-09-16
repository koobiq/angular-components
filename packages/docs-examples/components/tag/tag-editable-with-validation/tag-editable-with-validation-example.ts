import { ChangeDetectionStrategy, Component, computed, model, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEditChange, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * @title Tag editable with validation
 */
@Component({
    standalone: true,
    selector: 'tag-editable-with-validation-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule, KbqToolTipModule],
    template: `
        @let length = tagModelTrimmed().length;

        <kbq-tag
            editable
            [preventEditSubmit]="!isModelValid()"
            [color]="tagColor()"
            (editChange)="editChange($event)"
            (removed)="remove()"
        >
            {{ tagValue() }}
            <input
                kbqTagEditInput
                kbqTrigger="none"
                kbqTooltip="Maximum {{ initialMaxLength }} characters (actual: {{ length }})"
                [kbqTooltipColor]="color.Error"
                [(ngModel)]="tagModel"
            />
            @if (length === 0) {
                <i kbq-icon-button="kbq-xmark-s_16" kbqTagEditSubmit></i>
            } @else {
                <i
                    kbq-icon-button="kbq-check-s_16"
                    kbqTagEditSubmit
                    [disabled]="!isModelValid()"
                    [color]="color.Theme"
                ></i>
            }
            <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagEditableWithValidationExample {
    private readonly tooltip = viewChild.required(KbqTooltipTrigger);
    protected readonly popUpPlacements = PopUpPlacements;
    protected readonly color = KbqComponentColors;
    protected readonly tagValue = signal('Editable tag with validation');
    protected readonly initialMaxLength = this.tagValue().length;
    protected readonly tagModel = model(this.tagValue());
    protected readonly tagModelTrimmed = computed(() => this.tagModel().trim());
    protected readonly isModelValid = computed(() => this.tagModelTrimmed().length <= this.initialMaxLength);
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

    protected remove(): void {
        console.info('Tag was removed.');
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

        const model = this.tagModelTrimmed();

        if (model.length === 0) {
            this.tagModel.set(this.tagValue());

            return this.remove();
        }

        if (!this.isModelValid()) {
            return this.cancel({ ...event, reason: 'Handle cancel when model is invalid' });
        }

        this.tagValue.set(model);
        this.tagModel.set(this.tagValue());
    }
}
