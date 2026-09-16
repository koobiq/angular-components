import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { DocsLocaleState } from '../../services/locale';
import { DocsMigrationProgress } from './docs-migration-progress';

/** The reader's "done" mark on one step of the migration guide. */
@Component({
    selector: 'docs-migration-step-done',
    imports: [KbqCheckboxModule],
    template: `
        <!-- Every step has one of these, so the name says which step it marks. The hidden part has to
             follow the label with no whitespace in between, which formatting would put there. -->
        <!-- prettier-ignore -->
        <kbq-checkbox [checked]="done()" (change)="progress.mark(step(), $event.checked)">
            {{ t('migrationStepDone') }}<span class="cdk-visually-hidden">: {{ title() }}</span>
        </kbq-checkbox>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-migration-step-done'
    }
})
export class DocsMigrationStepDone extends DocsLocaleState {
    protected readonly progress = inject(DocsMigrationProgress);

    /** The id of the step's heading. */
    readonly step = input.required<string>();
    /** The step's heading text. */
    readonly title = input.required<string>();

    protected readonly done = computed(() => this.progress.done().has(this.step()));
}
