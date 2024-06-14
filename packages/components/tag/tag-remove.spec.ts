// tslint:disable: no-empty
import { Component, DebugElement } from '@angular/core';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KbqTag, KbqTagModule } from './index';


describe('Tag Remove', () => {
    let fixture: ComponentFixture<TestTag>;
    let testTag: TestTag;
    let chipDebugElement: DebugElement;
    let chipNativeElement: HTMLElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqTagModule],
            declarations: [TestTag]
        });

        TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(TestTag);
        testTag = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        chipDebugElement = fixture.debugElement.query(By.directive(KbqTag));
        chipNativeElement = chipDebugElement.nativeElement;
    }));

    describe('basic behavior', () => {
        it('should applies the `kbq-tag-remove` CSS class', () => {
            const hrefElement = chipNativeElement.querySelector('a')!;

            expect(hrefElement.classList).toContain('kbq-tag-remove');
        });

        it('should emits (removed) on click', () => {
            const hrefElement = chipNativeElement.querySelector('a')!;

            testTag.removable = true;
            fixture.detectChanges();

            spyOn(testTag, 'didRemove');

            hrefElement.click();

            expect(testTag.didRemove).toHaveBeenCalled();
        });
    });
});

@Component({
    template: `
        <kbq-tag [removable]="removable" (removed)="didRemove()"><a kbqTagRemove></a></kbq-tag>
    `
})
class TestTag {
    removable: boolean;

    didRemove() {}
}
