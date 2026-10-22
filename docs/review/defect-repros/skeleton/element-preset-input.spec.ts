import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqSkeleton, KbqSkeletonButton } from '@koobiq/components/skeleton';

@Component({
    selector: 'test-element-preset-input',
    imports: [KbqSkeleton, KbqSkeletonButton],
    template: `
        <kbq-skeleton-button [kbqSkeleton]="loading()" />
    `
})
class TestApp {
    readonly loading = signal(true);
}

describe('KbqSkeleton element presets (triage)', () => {
    it('DEFECT: binding [kbqSkeleton] on an element preset with KbqSkeleton imported throws NG0309', () => {
        expect(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
        }).toThrow(/NG0309.*KbqSkeleton matches multiple times/s);
    });
});
