import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqTopMenuModule } from './module';

describe('KbqTopMenu', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let component: TestHostComponent;
    let menuElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqTopMenuModule],
            declarations: [TestHostComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        component = fixture.componentInstance;
        menuElement = fixture.nativeElement.querySelector('kbq-top-menu');
    });

    it('should create the component', () => {
        expect(menuElement).toBeTruthy();
    });

    it('should not have the overflow class by default', () => {
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-menu-overflow')).toBeFalsy();
    });

    it('should add the overflow class when hasOverflow is true', () => {
        component.hasOverflow = true;
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-menu-overflow')).toBeTruthy();
    });

    it('should remove the overflow class when hasOverflow is false', () => {
        component.hasOverflow = true;
        fixture.detectChanges();
        component.hasOverflow = false;
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-menu-overflow')).toBeFalsy();
    });
});

@Component({
    selector: 'test-app',
    template: '<kbq-top-menu [hasOverflow]="hasOverflow" />'
})
class TestHostComponent {
    hasOverflow = false;
}
