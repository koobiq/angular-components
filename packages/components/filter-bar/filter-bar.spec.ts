import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFilterBar, KbqFilterBarModule } from './index';

describe('KbqFilterBar', () => {
    let fixture: ComponentFixture<TestApp>;
    let filterBarDebugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqFilterBarModule],
            declarations: [
                TestApp,
                KbqFilterBar
            ]
        }).compileComponents();
    });

    describe('default', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        });

        it('should add classes', () => {
            expect(filterBarDebugElement.nativeElement.classList).toContain('kbq-filter-bar');
        });
    });
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-filter-bar />
    `
})
class TestApp {}
