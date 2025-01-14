import { ChangeDetectionStrategy, Component, inject, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule } from '@koobiq/components/list';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqDatepickerModule } from '../../datepicker';
import { KbqPopoverTrigger } from '../../popover';
import { KbqTimepickerModule } from '../../timepicker';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipe } from '../filter-bar.types';
import { KbqPipeStates } from './pipe-states.component';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[date]',
    templateUrl: 'pipe-date.template.html',
    styleUrls: [
        'pipe.component.scss',
        '../../datepicker/datepicker-tokens.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe kbq-pipe_date',
        '[class.kbq-pipe_empty]': 'isEmpty',
        '[class.kbq-pipe_readonly]': 'data.required',
        '[class.kbq-pipe_disabled]': 'data.disabled'
    },
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        KbqDividerModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqListModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqLuxonDateModule,
        KbqPipeStates
    ],
    providers: [
        {
            provide: KbqPipeBase,
            useExisting: KbqPipeDateComponent
        }
    ]
})
export class KbqPipeDateComponent extends KbqPipeBase {
    protected readonly filterBar = inject(KbqFilterBar);

    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;
    protected startDate;
    protected endDate;

    @ViewChild('popover') popover: KbqPopoverTrigger;

    @Input() data!: KbqPipe;

    get isEmpty(): boolean {
        return this.data.value === undefined;
    }

    protected readonly onkeydown = onkeydown;

    onKeydown($event: KeyboardEvent) {
        if ($event.ctrlKey && $event.keyCode === ENTER) {
            console.log('need apply params: ');
        }
    }

    onSelect(item: unknown) {
        this.data.value = item;
        this.stateChanges.next();

        this.popover.hide();

        console.log('onSelect: ');
    }

    override onDeleteOrClear() {
        if (this.data.cleanable) {
            this.data.value = undefined;
        } else if (this.data.removable) {
            super.onDeleteOrClear();
        }

        this.stateChanges.next();
    }
}
