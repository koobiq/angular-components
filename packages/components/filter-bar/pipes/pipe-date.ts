import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqListModule } from '@koobiq/components/list';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeDateBaseComponent } from './pipe-date-base';
import { KbqPipeState } from './pipe-state';

@Component({
    selector: 'kbq-pipe-date',
    imports: [
        ReactiveFormsModule,
        KbqIconModule,
        KbqInputModule,
        KbqDividerModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqListModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqPipeState,
        KbqFormattersModule,
        KbqPipeButton,
        KbqTitleModule,
        FormsModule
    ],
    templateUrl: 'pipe-date.html',
    styleUrls: ['base-pipe.scss', 'pipe-date.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeDateComponent<D> extends KbqPipeDateBaseComponent<D> {
    protected usesTime(): boolean {
        return false;
    }

    protected formatRange(start: D, end: D): string {
        return this.formatter.rangeShortDate(start, end);
    }

    protected getDefaultStart(): D {
        return this.adapter.today();
    }

    protected getDefaultEnd(): D {
        return this.adapter.today().plus({ days: 1 });
    }
}
