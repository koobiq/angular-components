import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule } from '@koobiq/components/list';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqDatepickerModule } from '../../datepicker';
import { KbqTimepickerModule } from '../../timepicker';
import { KbqPipe } from '../filter-bar.types';
import { KbqPipeBase } from './pipe.component';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';

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
        class: 'kbq-pipe'
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
        FormsModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqLuxonDateModule
    ],
    providers: [
        {
            provide: KbqPipeBase,
            useExisting: KbqPipeDateComponent
        }
    ]
})
export class KbqPipeDateComponent extends KbqPipeBase {
    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;
    protected startDate;
    protected endDate;

    @Input() data!: KbqPipe;
    showStartCalendar: boolean = true;
    showEndCalendar: boolean = true;

    get isEmpty(): boolean {
        return false;
    }
}
