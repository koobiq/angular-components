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
        <button [class.kbq-disabled]="data.removable" [kbqPipeState]="data" [kbqPipeTitle]="pipeTooltip" kbq-button>
            <span class="kbq-pipe__name" #kbqTitleText kbqPipeMinWidth>{{ data.name }}</span>
            <span class="kbq-pipe__value" #kbqTitleText [class.kbq-pipe__value_empty]="!data.value" kbqPipeMinWidth>
                {{ data.value }}
            </span>
        </button>

        @if (!data.required || (data.required && !isEmpty)) {
            <kbq-pipe-button [readonly]="!!data.removable" />
        }

        <ng-template #pipeTooltip>
            <div class="kbq-pipe-tooltip__name kbq-text-compact">{{ data.name }}</div>
            <div class="kbq-pipe-tooltip__value kbq-text-compact">{{ data.value }}</div>
        </ng-template>
    `,
    styleUrls: ['base-pipe.scss'],
    host: {
        // by design. we need to use disabled styles for removable pipes
        '[class.kbq-pipe_disabled]': 'data.removable'
    },
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
