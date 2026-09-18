import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitle } from './pipe-title';

@Component({
    selector: 'kbq-pipe-readonly',
    imports: [
        KbqButtonModule,
        KbqPipeTitle,
        KbqPipeState,
        KbqPipeButton
    ],
    template: `
        <button
            kbq-button
            [disabled]="data.disabled"
            [ignoreTooltipPointerEvents]="true"
            [kbqPipeState]="data"
            [kbqPipeTitle]="pipeTooltip"
        >
            <span #kbqTitleText class="kbq-pipe__name">{{ data.name }}</span>
            <span #kbqTitleText class="kbq-pipe__value" [class.kbq-pipe__value_empty]="!data.value">
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
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeReadonlyComponent extends KbqBasePipe<string | null> {
    open(): void {}
}
