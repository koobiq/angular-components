import { ChangeDetectionStrategy, Component, inject, model, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagEditChange, KbqTagsModule } from '@koobiq/components/tags';
import { KbqToastService } from '@koobiq/components/toast';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * @title Tag editable
 */
@Component({
    standalone: true,
    selector: 'tag-editable-example',
    imports: [KbqTagsModule, KbqIconModule, FormsModule, KbqToolTipModule],
    template: `
        <kbq-tag editable [color]="color.ContrastFade" (editChange)="editChange($event)" (removed)="removed()">
            {{ tagValue() }}
            <input
                kbqTagEditInput
                kbqTrigger="manual"
                kbqTooltip="Maximum {{ this.maxLength }} characters (actual: {{ tagModel().trim().length }})"
                [kbqTooltipColor]="color.Error"
                [(ngModel)]="tagModel"
            />
            <i kbq-icon-button="kbq-check-s_16" kbqTagEditSubmit></i>
            <i kbq-icon="kbq-xmark-s_16" kbqTagRemove></i>
        </kbq-tag>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagEditableExample {
    private readonly toast = inject(KbqToastService);
    private readonly tooltip = viewChild.required(KbqTooltipTrigger);

    protected readonly popUpPlacements = PopUpPlacements;
    protected readonly color = KbqComponentColors;

    protected readonly tagValue = signal('Editable tag');
    protected readonly maxLength = this.tagValue().length;
    protected readonly tagModel = model(this.tagValue());

    constructor() {
        toObservable(this.tagModel)
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((model) => {
                const tooltip = this.tooltip();

                if (tooltip.isOpen) tooltip.hide();
                if (model.trim().length > this.maxLength) tooltip.show(0);
            });
    }

    protected editChange(event: KbqTagEditChange): void {
        console.log('Tag edit change event:', event);

        switch (event.type) {
            case 'start': {
                this.toast.show({ title: 'Tag edit was started' });
                break;
            }
            case 'cancel': {
                this.toast.show({ title: 'Tag edit was canceled' });
                break;
            }
            case 'submit': {
                this.tagValue.set(this.tagModel().trim());
                this.toast.show({ title: 'Tag edit was submitted' });
                break;
            }
            default:
        }
    }

    protected removed(): void {
        this.toast.show({ title: 'Tag removed' });
    }
}
