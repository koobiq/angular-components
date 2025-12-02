import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KbqButtonModule } from '@koobiq/components/button';
import { KbqSplitButton, KbqSplitButtonModule } from '@koobiq/components/split-button';

describe('KbqSearchExpandable', () => {
    let debugElement: DebugElement;
    let nativeElement: HTMLElement;
    let fixture: ComponentFixture<TestApp>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqSplitButtonModule, KbqButtonModule, TestApp]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestApp);
        debugElement = fixture.debugElement.query(By.directive(KbqSplitButton));
        nativeElement = debugElement.nativeElement;
        fixture.detectChanges();
    });

    it('should init', () => {
        expect(nativeElement.classList.contains('kbq-split-button')).toBe(true);
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button>
            <button kbq-button [disabled]="true">
                <i kbq-icon="kbq-plus_16"></i>
            </button>
            <button kbq-button>
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>
    `
})
class TestApp {}
