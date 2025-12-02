import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

@Component({
    selector: 'kbq-pipe-readonly',
    imports: [
        KbqButtonModule,
        KbqTitleModule,
        KbqPipeState,
        KbqPipeTitleDirective,
        KbqPipeMinWidth,
        KbqPipeButton
    ],
    template: `
        <button kbq-button [disabled]="data.disabled" [kbqPipeState]="data" [kbqPipeTitle]="pipeTooltip">
            <span #kbqTitleText class="kbq-pipe__name" kbqPipeMinWidth>{{ data.name }}</span>
            <span #kbqTitleText class="kbq-pipe__value" kbqPipeMinWidth [class.kbq-pipe__value_empty]="!data.value">
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ]
})
export class KbqPipeReadonlyComponent extends KbqBasePipe<string | null> {
    open(): void {}
}
