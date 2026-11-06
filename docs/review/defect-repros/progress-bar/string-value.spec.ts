import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';

describe('KbqProgressBar triage: string value', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [StaticApp, BoundApp] });
    });

    const lineOf = (host: HTMLElement): HTMLElement => host.querySelector('.kbq-progress-bar__line')!;

    it('DEFECT: a static value="30" renders an empty bar with aria-valuenow="0"', async () => {
        const fixture = TestBed.createComponent(StaticApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.debugElement.query(By.css('kbq-progress-bar')).nativeElement;

        expect(host.getAttribute('aria-valuenow')).toBe('0');
        expect(lineOf(host).style.width).toBe('0%');
    });

    it('DEFECT: a bound string value such as a form control value renders an empty bar', async () => {
        const fixture = TestBed.createComponent(BoundApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.debugElement.query(By.css('kbq-progress-bar')).nativeElement;

        expect(host.getAttribute('aria-valuenow')).toBe('0');
        expect(lineOf(host).style.width).toBe('0%');
        // The clamp the 20.x line used (Math.max/Math.min, no finiteness check) coerced the same string.
        expect(Math.max(0, Math.min(100, fixture.componentInstance.value as unknown as number))).toBe(30);
    });
});

@Component({
    selector: 'static-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar value="30" />
    `
})
class StaticApp {}

@Component({
    selector: 'bound-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar [value]="value" />
    `
})
class BoundApp {
    value = '30' as unknown as number;
}
