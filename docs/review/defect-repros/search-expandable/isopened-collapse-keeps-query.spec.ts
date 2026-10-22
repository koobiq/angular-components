import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    defaultEmitValueTimeout,
    KbqSearchExpandable,
    KbqSearchExpandableModule
} from '@koobiq/components/search-expandable';

@Component({
    selector: 'test-two-way-opened',
    imports: [KbqSearchExpandableModule, ReactiveFormsModule],
    template: `
        <kbq-search-expandable [formControl]="searchControl" [(isOpened)]="opened" />
    `
})
class TwoWayOpened {
    opened = false;
    readonly searchControl = new FormControl<string>('');
}

describe('triage: collapse through [isOpened]', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [TwoWayOpened] }).compileComponents());

    afterEach(() => vi.useRealTimers());

    it('DEFECT: a parent collapsing a [(isOpened)] search leaves the typed query in the bound control', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TwoWayOpened);

        fixture.detectChanges();

        const debug = fixture.debugElement.query(By.directive(KbqSearchExpandable));
        const component = debug.componentInstance as KbqSearchExpandable;

        fixture.componentInstance.opened = true;
        fixture.detectChanges();

        const input: HTMLInputElement = debug.query(By.css('input')).nativeElement;

        input.value = 'query';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(defaultEmitValueTimeout);

        expect(fixture.componentInstance.searchControl.value).toBe('query');

        fixture.componentInstance.opened = false;
        fixture.detectChanges();

        // Collapsed: the field is gone, the collapsed button is back.
        expect(component.isOpened).toBe(false);
        expect(debug.nativeElement.querySelector('.kbq-search-expandable__search')).toBeNull();
        expect(debug.nativeElement.querySelector('.kbq-search-expandable__button')).not.toBeNull();

        // Yet the filter is still applied and kept in the component, unlike toggle(), the close button and Escape.
        expect(fixture.componentInstance.searchControl.value).toBe('query');
        expect(component.value()).toBe('query');

        await vi.advanceTimersByTimeAsync(defaultEmitValueTimeout);

        expect(fixture.componentInstance.searchControl.value).toBe('query');
    });
});
