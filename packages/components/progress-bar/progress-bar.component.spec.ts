import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqProgressBarModule, ProgressBarMode } from './index';

// tslint:disable no-magic-numbers
const percentPairs = [
    [40, 40],
    [-50, 0],
    [140, 100],
];
// tslint:enable no-magic-numbers

describe('KbqProgressBar', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqProgressBarModule],
            declarations: [TestApp],
        });

        TestBed.compileComponents();
    }));

    // koobiq has one color
    // it('should apply class based on color attribute', () => {
    //     const fixture = TestBed.createComponent(TestApp);
    //     const testComponent = fixture.debugElement.componentInstance;
    //     const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));
    //
    //     Object.keys(KbqComponentColors).forEach((key) => {
    //         if (KbqComponentColors[key]) {
    //             testComponent.color = KbqComponentColors[key];
    //             fixture.detectChanges();
    //             expect(
    //                 progressBarDebugElement.nativeElement.classList.contains(`kbq-${KbqComponentColors[key]}`)
    //             ).toBe(true);
    //         }
    //     });
    // });

    // koobiq has one color
    // it('should has default primary color', () => {
    //     const fixture = TestBed.createComponent(TestApp);
    //     const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));
    //
    //     expect(progressBarDebugElement.nativeElement.classList.contains(`kbq-${KbqComponentColors.Theme}`)).toBe(true);
    // });

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
    template: `
        <kbq-progress-bar class="first" [id]="id" [value]="value" [mode]="mode"> </kbq-progress-bar>
        <kbq-progress-bar class="default"></kbq-progress-bar>
    `,
})
class TestApp {
    value: number = 0;
    mode: ProgressBarMode;
    id: string;
}
