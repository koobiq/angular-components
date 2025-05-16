import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    standalone: true,
    selector: 'kbq-pipe-readonly',
    template: `
        <button [disabled]="data.disabled" [kbqPipeState]="data" [kbqPipeTitle]="pipeTooltip" kbq-button>
            <span class="kbq-pipe__name" #kbqTitleText kbqPipeMinWidth>{{ data.name }}</span>
            <span class="kbq-pipe__value" #kbqTitleText [class.kbq-pipe__value_empty]="!data.value" kbqPipeMinWidth>
                {{ data.value }}
            </span>
        </button>

        @if (showRemoveButton) {
            <kbq-pipe-button />
        }

        <ng-template #pipeTooltip>
            <div class="kbq-pipe-tooltip__name kbq-text-compact">{{ data.name }}</div>
            <div class="kbq-pipe-tooltip__value kbq-text-compact">{{ data.value }}</div>
        </ng-template>
    `,
    styleUrls: ['base-pipe.scss', 'pipe-readonly.scss'],
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
        KbqPipeButton
    ]
})
export class KbqPipeReadonlyComponent extends KbqBasePipe<string | null> {
    open(): void {}
}
