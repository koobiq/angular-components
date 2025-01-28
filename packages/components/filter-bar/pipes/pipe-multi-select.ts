import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';

@Component({
    standalone: true,
    selector: 'kbq-pipe-multi-select',
    templateUrl: 'pipe-multi-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-multiselect.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqIcon,
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeState,
        KbqBadgeModule,
        KbqPipeButton,
        KbqTitleModule
    ]
})
export class KbqPipeMultiSelectComponent extends KbqBasePipe {
    get selected() {
        return this.data.value;
    }

    get isEmpty(): boolean {
        return !this.data.value?.length;
    }

    onSelect(item: unknown) {
        this.data.value = item;
        this.stateChanges.next();
    }

    compareByValue = (o1: any, o2: any): boolean => o1?.value === o2?.id;
}
