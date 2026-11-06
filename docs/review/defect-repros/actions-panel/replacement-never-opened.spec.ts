import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqActionsPanel } from '@koobiq/components/actions-panel';
import { lastValueFrom } from 'rxjs';

@Component({
    selector: 'triage-host',
    template: `
        <ng-template #panel>
            <button id="panel-action">Delete</button>
        </ng-template>
    `,
    providers: [KbqActionsPanel],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TriageHost {
    readonly actionsPanel = inject(KbqActionsPanel, { self: true });
    readonly template = viewChild.required('panel', { read: TemplateRef });
}

describe('KbqActionsPanel triage: a replacement closed while the replaced panel is closing', () => {
    it('DEFECT: never emits nor completes beforeOpened and afterOpened', async () => {
        const fixture = TestBed.createComponent(TriageHost);

        fixture.autoDetectChanges();

        const { actionsPanel, template } = fixture.componentInstance;
        const replaced = actionsPanel.open(template());

        await lastValueFrom(replaced.afterOpened);
        await fixture.whenStable();

        const replacement = actionsPanel.open(template());
        const emitted: string[] = [];

        replacement.beforeOpened.subscribe({
            next: () => emitted.push('beforeOpened'),
            complete: () => emitted.push('beforeOpened complete')
        });
        replacement.afterOpened.subscribe({
            next: () => emitted.push('afterOpened'),
            complete: () => emitted.push('afterOpened complete')
        });
        replacement.beforeClosed.subscribe(() => emitted.push('beforeClosed'));
        replacement.afterClosed.subscribe(() => emitted.push('afterClosed'));

        const replacedClosed = lastValueFrom(replaced.afterClosed);
        const replacementClosed = lastValueFrom(replacement.afterClosed);

        // The replaced panel is still playing its exit.
        actionsPanel.close();

        await replacedClosed;
        await replacementClosed;
        await fixture.whenStable();

        expect(emitted).toEqual(['beforeClosed', 'afterClosed']);
    });
});
