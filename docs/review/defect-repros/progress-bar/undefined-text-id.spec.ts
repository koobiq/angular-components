import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import axe from 'axe-core';

describe('KbqProgressBar triage: undefined text id', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [UndefinedIdApp] });
    });

    it('DEFECT: binding undefined to the text id leaves the bar with neither aria-label nor aria-labelledby', async () => {
        const fixture = TestBed.createComponent(UndefinedIdApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const host: HTMLElement = fixture.debugElement.query(By.css('kbq-progress-bar')).nativeElement;
        const text: HTMLElement = fixture.debugElement.query(By.css('[kbq-progress-bar-text]')).nativeElement;

        expect(text.hasAttribute('id')).toBe(false);
        expect(host.getAttribute('aria-labelledby')).toBeNull();
        expect(host.getAttribute('aria-label')).toBeNull();

        const { violations } = await axe.run(fixture.nativeElement, {
            runOnly: { type: 'rule', values: ['aria-progressbar-name'] }
        });

        expect(violations.map(({ id }) => id)).toEqual(['aria-progressbar-name']);
    });
});

@Component({
    selector: 'undefined-id-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar [value]="30">
            <div kbq-progress-bar-text [id]="textId">Uploading the archive</div>
        </kbq-progress-bar>
    `
})
class UndefinedIdApp {
    textId = undefined as unknown as string;
}
