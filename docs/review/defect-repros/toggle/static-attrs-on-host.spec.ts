import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqToggleModule } from '@koobiq/components/toggle';

const createFixture = <T>(component: new () => T): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] });

    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle aria-label="Notifications" />
    `
})
class StaticAriaLabel {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <span id="external-label">Notifications</span>
        <kbq-toggle aria-labelledby="external-label" />
    `
})
class StaticAriaLabelledby {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle tabIndex="5">Notifications</kbq-toggle>
    `
})
class StaticTabIndex {}

@Component({
    imports: [KbqToggleModule],
    template: `
        <kbq-toggle [aria-label]="label" [tabIndex]="tabIndex" />
    `
})
class BoundAttributes {
    label = 'Notifications';
    tabIndex = 5;
}

describe('triage: static attributes left on the kbq-toggle host', () => {
    it('DEFECT: a static aria-label stays on the host as well as reaching the checkbox', () => {
        const fixture = createFixture(StaticAriaLabel);
        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-toggle');
        const input: HTMLInputElement = host.querySelector('input')!;

        expect(input.getAttribute('aria-label')).toBe('Notifications');
        expect(host.getAttribute('aria-label')).toBe('Notifications');
    });

    it('DEFECT: a static aria-labelledby stays on the host as well as reaching the checkbox', () => {
        const fixture = createFixture(StaticAriaLabelledby);
        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-toggle');
        const input: HTMLInputElement = host.querySelector('input')!;

        expect(input.getAttribute('aria-labelledby')).toBe('external-label');
        expect(host.getAttribute('aria-labelledby')).toBe('external-label');
    });

    it('DEFECT: a static tabIndex makes the host a tab stop besides the checkbox', () => {
        const fixture = createFixture(StaticTabIndex);
        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-toggle');
        const input: HTMLInputElement = host.querySelector('input')!;

        expect(input.tabIndex).toBe(5);
        expect(host.getAttribute('tabindex')).toBe('5');
        expect(host.tabIndex).toBe(5);
    });

    // The checkbox inside carries the same name, so axe finds text in the host's subtree and asks for a review
    // instead of reporting a violation: `toHaveNoViolations()` would not catch it.
    it('DEFECT: axe flags the aria-label left on the host as aria-prohibited-attr (needs review, not a violation)', async () => {
        const fixture = createFixture(StaticAriaLabel);
        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-toggle');
        const { default: axe } = await import('axe-core');
        const { violations, incomplete } = await axe.run(fixture.nativeElement, {
            runOnly: { type: 'rule', values: ['aria-prohibited-attr'] }
        });
        const summary = (results: typeof violations) =>
            results.flatMap(({ id, nodes }) => nodes.map(({ target }) => `${id} at ${target.join(' ')}`));

        expect(summary(violations)).toEqual([]);
        expect(summary(incomplete)).toEqual([`aria-prohibited-attr at #${host.id}`]);
    });

    it('bound [aria-label] and [tabIndex] do not reach the host (control)', () => {
        const fixture = createFixture(BoundAttributes);
        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-toggle');
        const input: HTMLInputElement = host.querySelector('input')!;

        expect(input.getAttribute('aria-label')).toBe('Notifications');
        expect(input.tabIndex).toBe(5);
        expect(host.hasAttribute('aria-label')).toBe(false);
        expect(host.hasAttribute('tabindex')).toBe(false);
    });
});
