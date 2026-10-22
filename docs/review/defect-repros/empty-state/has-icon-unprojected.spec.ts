import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqEmptyState, KbqEmptyStateModule } from '@koobiq/components/empty-state';

@Component({
    selector: 'icon-in-unslotted-wrapper',
    imports: [KbqEmptyStateModule],
    template: `
        <kbq-empty-state>
            <div class="wrapper">
                <img kbq-empty-state-icon alt="" src="data:," />
            </div>
            <h2 kbq-empty-state-title>Title</h2>
            <div kbq-empty-state-text>Text</div>
        </kbq-empty-state>
    `
})
class IconInUnslottedWrapper {}

@Component({
    selector: 'icon-inside-text-slot',
    imports: [KbqEmptyStateModule],
    template: `
        <kbq-empty-state>
            <h2 kbq-empty-state-title>Title</h2>
            <div kbq-empty-state-text>
                <img kbq-empty-state-icon alt="" src="data:," />
                Text
            </div>
        </kbq-empty-state>
    `
})
class IconInsideTextSlot {}

describe('triage: kbq-empty-state_has-icon follows a descendant query, not projection', () => {
    it('DEFECT: an unprojected icon (inside a wrapper without a slot attribute) sets has-icon', () => {
        const fixture = TestBed.createComponent(IconInUnslottedWrapper);

        fixture.detectChanges();

        const host: HTMLElement = fixture.debugElement.query(By.directive(KbqEmptyState)).nativeElement;

        // Nothing is rendered in the illustration slot: the wrapper is not projected at all.
        expect(host.querySelector('.kbq-empty-state-icon')).toBeNull();
        expect(host.querySelector('.wrapper')).toBeNull();
        // ...yet the host still gets the compensation class.
        expect(host.classList).toContain('kbq-empty-state_has-icon');
        expect(host.classList).toContain('kbq-empty-state_align-center');
    });

    it('DEFECT: an icon nested inside the text slot sets has-icon with the illustration slot empty', () => {
        const fixture = TestBed.createComponent(IconInsideTextSlot);

        fixture.detectChanges();

        const host: HTMLElement = fixture.debugElement.query(By.directive(KbqEmptyState)).nativeElement;
        const illustrationSlot = Array.from(host.children).filter((child) =>
            child.hasAttribute('kbq-empty-state-icon')
        );

        expect(illustrationSlot).toHaveLength(0);
        expect(host.classList).toContain('kbq-empty-state_has-icon');
    });
});
