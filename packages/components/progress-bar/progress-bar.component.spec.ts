import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqProgressBarModule, ProgressBarMode } from './index';

const percentPairs = [
    [40, 40],
    [-50, 0],
    [140, 100]
];

describe('KbqProgressBar', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqProgressBarModule, TestApp]
        }).compileComponents();
    });

    it('should return percentage', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));

        percentPairs.forEach(([percent, expected]) => {
            testComponent.value = percent;
            fixture.detectChanges();
            expect(progressBarDebugElement.componentInstance.percentage).toBe(expected);
        });
    });

    it('should return 0 percentage by default', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressBarDebugElement.componentInstance.percentage).toBe(0);
    });

    it('should show determinate line', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));

        testComponent.mode = 'determinate';
        fixture.detectChanges();

        expect(progressBarDebugElement.query(By.css('.kbq-progress-bar__line_determinate'))).toBeDefined();
    });

    it('should show indeterminate line', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));

        testComponent.mode = 'indeterminate';
        fixture.detectChanges();

        expect(progressBarDebugElement.query(By.css('.kbq-progress-bar__line_indeterminate'))).toBeDefined();
    });

    it('should show determinate line by default', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressBarDebugElement.query(By.css('.kbq-progress-bar__line_determinate'))).toBeDefined();
    });

    it('should set id attribute', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));

        testComponent.id = 'foo';
        fixture.detectChanges();

        expect(progressBarDebugElement.nativeElement.getAttribute('id')).toBe('foo');
    });

    it('should auto generate id', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressBarDebugElement.nativeElement.getAttribute('id')).toBeDefined();
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqProgressBarModule],
    template: `
        <kbq-progress-bar class="first" [id]="id" [value]="value" [mode]="mode" />
        <kbq-progress-bar class="default" />
    `
})
class TestApp {
    value: number = 0;
    mode: ProgressBarMode;
    id: string;
}
