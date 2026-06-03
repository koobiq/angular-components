import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqTopBarModule } from './module';
import { KbqTopBar } from './top-bar';

describe(KbqTopBar.name, () => {
    let fixture: ComponentFixture<TestApp>;
    let component: TestApp;
    let menuElement: HTMLElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqTopBarModule, TestApp]
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

    it('should default demoteOverlay to false on a KbqDropdownTrigger nested inside kbq-top-bar', async () => {
        await TestBed.resetTestingModule()
            .configureTestingModule({
                imports: [KbqTopBarModule, KbqDropdownModule, NoopAnimationsModule, TopBarWithDropdownApp]
            })
            .compileComponents();

        const dropdownFixture = TestBed.createComponent(TopBarWithDropdownApp);

        dropdownFixture.detectChanges();

        expect(dropdownFixture.componentInstance.trigger().demoteOverlay).toBe(false);
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqTopBarModule],
    template: '<kbq-top-bar [withShadow]="withShadow" />'
})
class TestApp {
    readonly topBar = viewChild.required(KbqTopBar);
    withShadow = false;
}

@Component({
    selector: 'test-app-top-bar-with-dropdown',
    imports: [KbqTopBarModule, KbqDropdownModule],
    template: `
        <kbq-top-bar>
            <button [kbqDropdownTriggerFor]="dropdown">Open</button>
            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item>Item</button>
            </kbq-dropdown>
        </kbq-top-bar>
    `
})
class TopBarWithDropdownApp {
    readonly trigger = viewChild.required(KbqDropdownTrigger);
}
