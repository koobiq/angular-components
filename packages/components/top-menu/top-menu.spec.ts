import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqTopMenuModule } from './module';
import { KbqTopMenu } from './top-menu';

describe(KbqTopMenu.name, () => {
    let fixture: ComponentFixture<TestApp>;
    let component: TestApp;
    let menuElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqTopMenuModule],
            declarations: [TestApp]
        }).compileComponents();

        fixture = TestBed.createComponent(TestApp);
        component = fixture.componentInstance;
        menuElement = fixture.nativeElement.querySelector('kbq-top-menu');
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

    it('should add box-shadow on hover class by default when isShadowOnHoverEnabled not provided', () => {
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-menu-shadow-on-hover')).toBeTruthy();
    });

    it('should remove box-shadow on hover class when isShadowOnHoverEnabled is false', () => {
        fixture.detectChanges();
        fixture.componentInstance.topMenu.isShadowOnHoverEnabled = false;
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-menu-shadow-on-hover')).toBeFalsy();
    });
});

@Component({
    selector: 'test-app',
    template: '<kbq-top-menu [hasOverflow]="hasOverflow" />'
})
class TestApp {
    @ViewChild(KbqTopMenu) topMenu: KbqTopMenu;
    hasOverflow = false;
}
