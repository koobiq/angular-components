import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

describe('KbqSearchExpandable', () => {
    let debugElement: DebugElement;
    let nativeElement: HTMLElement;
    let fixture: ComponentFixture<TestApp>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqSearchExpandableModule, TestApp]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        debugElement = fixture.debugElement.query(By.directive(KbqSearchExpandable));
        nativeElement = debugElement.nativeElement;
        fixture.detectChanges();
    });

    it('should init', () => {
        expect(nativeElement.classList.contains('kbq-search-expandable')).toBe(true);
    });

    it('should toggle', () => {
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);

        debugElement.query(By.css('.kbq-search-expandable__button')).nativeElement.click();
        fixture.detectChanges();

        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(0);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(1);

        debugElement.query(By.css('.kbq-icon-button.kbq-icon.kbq-suffix')).nativeElement.click();
        fixture.detectChanges();

        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);
    });

    it('should open by [isOpened]', () => {
        fixture.componentInstance.openedState = true;
        fixture.detectChanges();

        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(0);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(1);
    });
});

@Component({
    standalone: true,
    selector: 'test-app',
    imports: [KbqSearchExpandableModule, FormsModule],
    template: `
        <kbq-search-expandable [isOpened]="openedState" [(ngModel)]="search" />
    `
})
class TestApp {
    openedState: boolean = false;
    search: string;
}
