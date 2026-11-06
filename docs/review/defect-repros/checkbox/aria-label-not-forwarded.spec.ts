import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import axe from 'axe-core';

@Component({
    imports: [KbqCheckboxModule],
    template: `
        <span id="external-label">Select row</span>
        <kbq-checkbox aria-label="Select all rows" />
        <kbq-checkbox aria-labelledby="external-label" />
    `
})
class LabellessCheckboxes {}

describe('KbqCheckbox triage: host ARIA naming is not forwarded', () => {
    it('DEFECT: aria-label / aria-labelledby on the host leave the native input without an accessible name', async () => {
        const fixture = TestBed.createComponent(LabellessCheckboxes);

        fixture.detectChanges();

        const inputs = Array.from<HTMLInputElement>(fixture.nativeElement.querySelectorAll('input[type="checkbox"]'));

        expect(inputs).toHaveLength(2);

        for (const input of inputs) {
            expect(input.hasAttribute('aria-label')).toBe(false);
            expect(input.hasAttribute('aria-labelledby')).toBe(false);
        }

        // The attributes stay on the host, which has no role.
        const hosts = fixture.nativeElement.querySelectorAll('kbq-checkbox');

        expect(hosts[0].getAttribute('aria-label')).toBe('Select all rows');
        expect(hosts[1].getAttribute('aria-labelledby')).toBe('external-label');

        const { violations } = await axe.run(fixture.nativeElement, { runOnly: { type: 'rule', values: ['label'] } });
        const unlabelled = violations.find(({ id }) => id === 'label');

        expect(unlabelled).toBeDefined();
        expect(unlabelled!.nodes).toHaveLength(2);
        expect(unlabelled!.nodes.every(({ html }) => html.startsWith('<input'))).toBe(true);
    });
});
