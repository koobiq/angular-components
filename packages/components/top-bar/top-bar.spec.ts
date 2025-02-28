import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqTopBarModule } from './module';
import { KbqTopBar } from './top-bar';

describe(KbqTopBar.name, () => {
    let fixture: ComponentFixture<TestApp>;
    let component: TestApp;
    let menuElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqTopBarModule],
            declarations: [TestApp]
        }).compileComponents();

        fixture = TestBed.createComponent(TestApp);
        component = fixture.componentInstance;
        menuElement = fixture.nativeElement.querySelector('kbq-top-bar');
    });

    it('should not have the overflow class by default', () => {
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-bar_with-shadow')).toBeFalsy();
    });

    it('should add the overflow class when withShadow is true', () => {
        component.withShadow = true;
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-bar_with-shadow')).toBeTruthy();
    });

    it('should remove the overflow class when withShadow is false', () => {
        component.withShadow = true;
        fixture.detectChanges();
        component.withShadow = false;
        fixture.detectChanges();
        expect(menuElement.classList.contains('kbq-top-bar_with-shadow')).toBeFalsy();
    });
});

@Component({
    selector: 'test-app',
    template: '<kbq-top-bar [withShadow]="withShadow" />'
})
class TestApp {
    @ViewChild(KbqTopBar) topBar: KbqTopBar;
    withShadow = false;
}
