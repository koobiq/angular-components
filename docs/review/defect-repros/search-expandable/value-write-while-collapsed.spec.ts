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
    selector: 'test-collapsed-with-form-control',
    imports: [KbqSearchExpandableModule, ReactiveFormsModule],
    template: `
        <kbq-search-expandable [formControl]="searchControl" />
    `
})
class CollapsedWithFormControl {
    readonly searchControl = new FormControl<string>('');
}

describe('triage: write into value while collapsed', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [CollapsedWithFormControl] }).compileComponents());

    afterEach(() => vi.useRealTimers());

    it('DEFECT: a write into value while collapsed reaches the bound control but leaves the field collapsed', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(CollapsedWithFormControl);

        fixture.detectChanges();

        const debug = fixture.debugElement.query(By.directive(KbqSearchExpandable));
        const component = debug.componentInstance as KbqSearchExpandable;

        expect(component.isOpened).toBe(false);

        component.value.set('written');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(defaultEmitValueTimeout);
        fixture.detectChanges();

        expect(fixture.componentInstance.searchControl.value).toBe('written');
        expect(component.isOpened).toBe(false);
        expect(debug.nativeElement.querySelector('.kbq-search-expandable__search')).toBeNull();
        expect(debug.nativeElement.querySelector('.kbq-search-expandable__button')).not.toBeNull();
    });
});
