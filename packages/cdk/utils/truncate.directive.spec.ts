import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KbqTruncateDirective } from './truncate.directive';

describe('TruncateDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let truncate: DebugElement[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestComponent],
            imports: [KbqTruncateDirective]
        });
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        component.truncateLength = 100;

        fixture.detectChanges();

        truncate = fixture.debugElement.queryAll(By.directive(KbqTruncateDirective));
    });

    it('should create an instance', () => {
        expect(truncate).toBeTruthy();
    });

    it('Should truncate when isTruncate is true', () => {
        expect(truncate[0].nativeElement.style.maxWidth).toBe(`${component.truncateLength}px`);
        expect(truncate[2].nativeElement.style.maxWidth).toBe(`250px`);
    });

    it('Should not truncate when isTruncate is false', () => {
        expect(truncate[1].nativeElement.style.maxWidth).toBe('');
    });

    it("Should preserve element's default style", () => {
        expect(truncate[2].nativeElement.style.color).toEqual('red');
    });
});

@Component({
    template: `
        <span kbqTruncate [isTruncate]="true" [truncateLength]="truncateLength">This element should by truncated</span>
        <span kbqTruncate [isTruncate]="false" [truncateLength]="truncateLength">
            This element should not be truncated
        </span>
        <span [style.color]="'red'" kbqTruncate [isTruncate]="true">
            This element should by truncated and apply color Red
        </span>
    `
})
class TestComponent {
    @Input() truncateLength: number;
}
