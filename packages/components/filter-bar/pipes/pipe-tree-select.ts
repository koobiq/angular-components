import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqTreeModule, KbqTreeOption } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { KbqPipeTemplate, KbqSelectValue, KbqTreeSelectNode } from '../filter-bar.types';
import { getId, KbqBasePipe, KbqPipeMinWidth } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';
import { KbqTreeSelectPipeBase } from './tree-select-pipe-base';

@Component({
    selector: 'kbq-pipe-tree-select',
    imports: [
        KbqButtonModule,
        KbqDividerModule,
        KbqPipeState,
        KbqPipeButton,
        KbqTitleModule,
        KbqPipeMinWidth,
        KbqIconModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqHighlightModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        FormsModule
    ],
    templateUrl: 'pipe-tree-select.html',
    styleUrls: ['base-pipe.scss', 'pipe-tree-select.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPipeTreeSelectComponent extends KbqTreeSelectPipeBase<KbqSelectValue> {
    /** selected value */
    get selected() {
        return this.data.value;
    }

    /** Whether the current pipe is empty. */
    get isEmpty(): boolean {
        return !this.data.value;
    }

    constructor() {
        super();

        // See the field-init note in `KbqTreeSelectPipeBase`: subscribing here (after this class's
        // `updateTemplates` initializer) ensures the initial replay writes `dataSource.data`.
        this.filterBar?.internalTemplatesChanges.pipe(takeUntilDestroyed()).subscribe(this.updateTemplates);
    }

    onSelect(item: KbqTreeOption) {
        this.data.value = item.value;
        this.filterBar?.onChangePipe.emit(this.data);
        this.select().close();
        setTimeout(() => this.restoreTriggerFocus());
        this.stateChanges.next();
    }

    /**
     * Populates the tree data source from the pipe template. The shared `values`/`valueTemplate`
     * assignment is already performed by the base subscription, so this override only does the
     * tree-specific work and avoids a redundant double assignment.
     */
    override updateTemplates = (templates: KbqPipeTemplate[] | null) => {
        const template = templates?.find((item) => getId(item) === getId(this.data));

        if (template?.values) {
            this.dataSource.data = template.values as KbqTreeSelectNode[];
        }
    };
}
