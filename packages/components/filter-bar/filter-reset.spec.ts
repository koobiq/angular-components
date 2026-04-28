import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqFilter, KbqFilterBarModule, KbqFilterReset } from '@koobiq/components/filter-bar';

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [filter]="activeFilter">
            <kbq-filter-reset (onResetFilter)="onResetFilter($event)" />
        </kbq-filter-bar>
    `
})
class TestComponent {
    activeFilter: KbqFilter | null = {
        name: 'Test',
        readonly: false,
        disabled: false,
        changed: true,
        saved: false,
        pipes: []
    };

    onResetFilter = jest.fn();
}

describe('KbqFilterReset', () => {
    let fixture: ComponentFixture<TestComponent>;
    let resetDebugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        resetDebugElement = fixture.debugElement.query(By.directive(KbqFilterReset));
    });

    it('should have kbq-filter-reset class on the host', () => {
        expect(resetDebugElement.nativeElement.classList).toContain('kbq-filter-reset');
    });

    it('should emit onResetFilter when the button is clicked', () => {
        expect(fixture.componentInstance.onResetFilter).not.toHaveBeenCalled();

        resetDebugElement.query(By.css('button')).nativeElement.click();

        expect(fixture.componentInstance.onResetFilter).toHaveBeenCalledWith(fixture.componentInstance.activeFilter);
    });
});
