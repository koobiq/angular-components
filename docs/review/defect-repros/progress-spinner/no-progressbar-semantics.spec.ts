import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

@Component({
    selector: 'test-app',
    imports: [KbqProgressSpinnerModule],
    template: `
        <kbq-progress-spinner class="determinate" mode="determinate" [value]="40">
            <div kbq-progress-spinner-text>Uploading</div>
            <div kbq-progress-spinner-caption>4 of 10 MB</div>
        </kbq-progress-spinner>
        <kbq-progress-spinner class="indeterminate" mode="indeterminate" />
    `
})
class TestApp {}

describe('KbqProgressSpinner triage: progress semantics', () => {
    it('DEFECT: a determinate spinner exposes no progressbar role, value or accessible name', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('.determinate');
        const text: HTMLElement = host.querySelector('[kbq-progress-spinner-text]')!;
        const caption: HTMLElement = host.querySelector('[kbq-progress-spinner-caption]')!;

        expect(host.getAttribute('role')).toBeNull();
        expect(host.getAttribute('aria-valuenow')).toBeNull();
        expect(host.getAttribute('aria-valuemin')).toBeNull();
        expect(host.getAttribute('aria-valuemax')).toBeNull();
        expect(host.getAttribute('aria-label')).toBeNull();
        expect(host.getAttribute('aria-labelledby')).toBeNull();
        expect(host.getAttribute('aria-describedby')).toBeNull();
        expect(text.id).toBe('');
        expect(caption.id).toBe('');
        expect(host.querySelector('[role], [aria-valuenow], [aria-label], [aria-live]')).toBeNull();
    });

    it('DEFECT: an indeterminate spinner exposes no progressbar role or accessible name', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('.indeterminate');

        expect(host.getAttribute('role')).toBeNull();
        expect(host.getAttribute('aria-label')).toBeNull();
        expect(host.getAttribute('aria-busy')).toBeNull();
        expect(host.querySelector('[role], [aria-label], [aria-live]')).toBeNull();
    });

    it('DEFECT: axe reports nothing, so the missing semantics go unnoticed', async () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        await expect(fixture.nativeElement).toHaveNoViolations();
    });
});
