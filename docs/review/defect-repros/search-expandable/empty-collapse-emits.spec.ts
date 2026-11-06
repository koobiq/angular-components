import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

@Component({
    selector: 'test-reactive-search',
    imports: [KbqSearchExpandableModule, ReactiveFormsModule],
    template: `
        <kbq-search-expandable [formControl]="searchControl" />
    `
})
class ReactiveSearch {
    readonly searchControl = new FormControl<string>('');
}

@Component({
    selector: 'test-ng-model-search',
    imports: [KbqSearchExpandableModule, FormsModule],
    template: `
        <kbq-search-expandable [(ngModel)]="search" (ngModelChange)="changes.push($event)" />
    `
})
class NgModelSearch {
    search = '';
    readonly changes: string[] = [];
}

const openAndClose = (root: HTMLElement, detectChanges: () => void): void => {
    (root.querySelector('.kbq-search-expandable__button') as HTMLButtonElement).click();
    detectChanges();

    expect(root.querySelector('.kbq-search-expandable__search')).not.toBeNull();

    (root.querySelector('.kbq-search-expandable__search button') as HTMLButtonElement).click();
    detectChanges();

    expect(root.querySelector('.kbq-search-expandable__button')).not.toBeNull();
};

describe('triage: collapse of an untouched field', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [ReactiveSearch, NgModelSearch] }).compileComponents());

    it('DEFECT: opening and closing without typing marks the control dirty and fires valueChanges', async () => {
        const fixture = TestBed.createComponent(ReactiveSearch);

        fixture.detectChanges();
        await fixture.whenStable();

        const control = fixture.componentInstance.searchControl;
        const valueChanges = vi.fn();

        control.valueChanges.subscribe(valueChanges);

        expect(control.pristine).toBe(true);

        openAndClose(fixture.debugElement.query(By.directive(KbqSearchExpandable)).nativeElement, () =>
            fixture.detectChanges()
        );

        expect(control.value).toBe('');
        expect(valueChanges).toHaveBeenCalledTimes(1);
        expect(valueChanges).toHaveBeenCalledWith('');
        expect(control.dirty).toBe(true);
    });

    it('DEFECT: opening and closing without typing fires ngModelChange with an unchanged empty value', async () => {
        const fixture = TestBed.createComponent(NgModelSearch);

        fixture.detectChanges();
        await fixture.whenStable();

        openAndClose(fixture.debugElement.query(By.directive(KbqSearchExpandable)).nativeElement, () =>
            fixture.detectChanges()
        );

        expect(fixture.componentInstance.changes).toEqual(['']);
    });
});
