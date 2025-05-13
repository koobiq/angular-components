import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    standalone: true,
    selector: 'kbq-pipe-readonly',
    template: `
        <button class="kbq-disabled" [kbqPipeState]="data" [kbqPipeTitle]="pipeTooltip" kbq-button>
            <span class="kbq-pipe__name" #kbqTitleText kbqPipeMinWidth>{{ data.name }}</span>
            <span class="kbq-pipe__value" #kbqTitleText [class.kbq-pipe__value_empty]="!data.value" kbqPipeMinWidth>
                {{ data.value }}
            </span>
        </button>

        @if (!data.required || (data.required && !isEmpty)) {
            <button
                class="kbq-pipe__remove-button kbq-disabled"
                [kbqPipeState]="data"
                (click)="data.required ? onClear() : onRemove()"
                kbq-button
                kbqTooltip="{{ data.required ? localeData.clearButtonTooltip : localeData.removeButtonTooltip }}"
            >
                <i [color]="'contrast'" kbq-icon="kbq-xmark-s_16"></i>
            </button>
        }

        <ng-template #pipeTooltip>
            <div class="kbq-pipe-tooltip__name kbq-text-compact">{{ data.name }}</div>
            <div class="kbq-pipe-tooltip__value kbq-text-compact">{{ data.value }}</div>
        </ng-template>
    `,
    styleUrls: ['base-pipe.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    imports: [
        KbqButtonModule,
        KbqTitleModule,
        KbqPipeState,
        KbqPipeTitleDirective,
        KbqPipeMinWidth,
        KbqIcon,
        KbqTooltipTrigger
    ]
})
export class KbqPipeReadonlyComponent extends KbqBasePipe<string | null> {
    readonly placements = PopUpPlacements;

    get localeData() {
        return this.filterBar?.configuration.pipe;
    }

    open(): void {}
}
