import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPipe } from '../filter-bar.types';
import { KbqPipeBase } from './pipe.component';

@Component({
    standalone: true,
    selector: 'kbq-pipe[multi-tree-select]',
    templateUrl: 'pipe-multi-tree-select.template.html',
    styleUrls: ['pipe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe'
    },
    imports: [
        KbqButtonModule,
        KbqDropdownModule,
        KbqFormFieldModule,
        KbqIcon,
        KbqInputModule,
        KbqDividerModule
    ]
})
export class KbqPipeMultiTreeSelectComponent extends KbqPipeBase {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;

    @Input() data!: KbqPipe;

    get isEmpty(): boolean {
        if (Array.isArray(this.data.value)) {
            return this.data.value.length === 0;
        }

        return false;
    }
}
