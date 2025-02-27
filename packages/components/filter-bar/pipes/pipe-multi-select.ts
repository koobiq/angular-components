import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqPipeTitleDirective } from './pipe-title';

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
        KbqDividerModule,
        KbqSelectModule,
        NgClass,
        KbqPipeState,
        KbqBadgeModule,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeTitleDirective
    ]
})
export class KbqPipeMultiSelectComponent extends KbqBasePipe<string[]> {
    @ViewChild(KbqSelect) select: KbqSelect;

    get selected() {
        return this.data.value;
    }

    get isEmpty(): boolean {
        return !this.data.value?.length;
    }

    onSelect(item: string[]) {
        this.data.value = item;
        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();
    }

    onClear() {
        this.data.value = [];

        this.filterBar?.onChangePipe.emit(this.data);
        this.stateChanges.next();
    }

    compareByValue = (o1: any, o2: any): boolean => o1?.id === o2?.id;

    override open() {
        this.select.open();
    }
}
