import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

describe('KbqSearchExpandable', () => {
    let debugElement: DebugElement;
    let nativeElement: HTMLElement;
    let fixture: ComponentFixture<TestApp>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqSearchExpandableModule],
            declarations: [TestApp]
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
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-search-expandable />
    `
})
class TestApp {}
