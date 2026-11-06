import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import axe from 'axe-core';

describe('KbqProgressBar triage: empty aria-label', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [UnnamedApp, TextedApp] });
    });

    it('DEFECT: an empty aria-label skips the locale fallback and leaves the bar without a name', async () => {
        const fixture = TestBed.createComponent(UnnamedApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.debugElement.query(By.css('kbq-progress-bar')).nativeElement;

        expect(host.getAttribute('aria-label')).toBe('');
        expect(host.getAttribute('aria-labelledby')).toBeNull();

        const { violations } = await axe.run(fixture.nativeElement, {
            runOnly: { type: 'rule', values: ['aria-progressbar-name'] }
        });

        expect(violations.map(({ id }) => id)).toEqual(['aria-progressbar-name']);
    });

    it('DEFECT: an empty aria-label is rendered next to aria-labelledby when a text is projected', async () => {
        const fixture = TestBed.createComponent(TextedApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.debugElement.query(By.css('kbq-progress-bar')).nativeElement;
        const text: HTMLElement = fixture.debugElement.query(By.css('[kbq-progress-bar-text]')).nativeElement;

        expect(host.getAttribute('aria-label')).toBe('');
        expect(host.getAttribute('aria-labelledby')).toBe(text.id);
    });
});

@Component({
    selector: 'unnamed-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar [aria-label]="label" [value]="30" />
    `
})
class UnnamedApp {
    label = '';
}

@Component({
    selector: 'texted-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar [aria-label]="label" [value]="30">
            <div kbq-progress-bar-text>Uploading the archive</div>
        </kbq-progress-bar>
    `
})
class TextedApp {
    label = '';
}
