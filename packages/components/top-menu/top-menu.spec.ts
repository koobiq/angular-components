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
        expect(menuElement.classList.contains('kbq-top-menu_with-shadow')).toBeFalsy();
    });

    it('should add the overflow class when withShadow is true', () => {
        component.withShadow = true;
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-menu_with-shadow')).toBeTruthy();
    });

    it('should remove the overflow class when withShadow is false', () => {
        component.withShadow = true;
        fixture.detectChanges();
        component.withShadow = false;
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-menu_with-shadow')).toBeFalsy();
    });
});

@Component({
    selector: 'test-app',
    template: '<kbq-top-menu [withShadow]="withShadow" />'
})
class TestApp {
    @ViewChild(KbqTopMenu) topMenu: KbqTopMenu;
    withShadow = false;
}
