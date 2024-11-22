import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqTag, KbqTagsModule } from './index';

describe('Tag Remove', () => {
    let fixture: ComponentFixture<TestTag>;
    let testTag: TestTag;
    let chipDebugElement: DebugElement;
    let chipNativeElement: HTMLElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqTagsModule],
            declarations: [TestTag]
        }).compileComponents();

        fixture = TestBed.createComponent(TestTag);
        testTag = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        chipDebugElement = fixture.debugElement.query(By.directive(KbqTag));
        chipNativeElement = chipDebugElement.nativeElement;
    });

    describe('basic behavior', () => {
        it('should applies the `kbq-tag-remove` CSS class', () => {
            const hrefElement = chipNativeElement.querySelector('a')!;

            expect(hrefElement.classList).toContain('kbq-tag-remove');
        });

        it('should emits (removed) on click', () => {
            const hrefElement = chipNativeElement.querySelector('a')!;

            testTag.removable = true;
            fixture.detectChanges();

            const didRemoveSpyFn = jest.spyOn(testTag, 'didRemove');

            hrefElement.click();

            expect(didRemoveSpyFn).toHaveBeenCalled();
        });
    });
});

@Component({
    template: `
        <kbq-tag [removable]="removable" (removed)="didRemove()">
            <a kbqTagRemove></a>
        </kbq-tag>
    `
})
class TestTag {
    removable: boolean;

    didRemove() {}
}
