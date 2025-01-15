import { ChangeDetectionStrategy, Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { KbqPipeComponent } from '../pipe.component';
import { KbqPipeStates } from './pipe-states.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe-date',
    templateUrl: 'pipe-date.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
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
    ]
})
export class KbqPipeDateComponent {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly basePipe = inject(KbqPipeComponent);

    protected readonly placements = PopUpPlacements;
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    protected list = true;
    protected startDate;
    protected endDate;

    @ViewChild('popover') popover: KbqPopoverTrigger;

    protected readonly onkeydown = onkeydown;

    onKeydown($event: KeyboardEvent) {
        if ($event.ctrlKey && $event.keyCode === ENTER) {
            console.log('need apply params: ');
        }
    }

    onSelect(item: unknown) {
        this.basePipe.data.value = item;
        this.basePipe.stateChanges.next();

        this.popover.hide();

        console.log('onSelect: ');
    }

    onDeleteOrClear() {
        if (this.basePipe.data.cleanable) {
            this.basePipe.data.value = undefined;
        } else if (this.basePipe.data.removable) {
            this.basePipe.onDeleteOrClear();
        }

        this.basePipe.stateChanges.next();
    }
}
