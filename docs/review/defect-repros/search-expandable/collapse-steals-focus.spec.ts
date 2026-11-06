import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

@Component({
    selector: 'test-toolbar-toggle',
    imports: [KbqSearchExpandableModule, FormsModule],
    template: `
        <kbq-search-expandable #ref [(ngModel)]="search" />
        <button type="button" class="toolbar-toggle" (click)="ref.toggle()">Toggle search</button>
    `
})
class ToolbarToggle {
    search = '';
}

@Component({
    selector: 'test-parent-collapse',
    imports: [KbqSearchExpandableModule, ReactiveFormsModule],
    template: `
        <kbq-search-expandable [isOpened]="opened" [formControl]="searchControl" />
        <button type="button" class="elsewhere">Elsewhere</button>
    `
})
class ParentCollapse {
    opened = false;
    readonly searchControl = new FormControl<string>('');
}

describe('triage: focus on collapse', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [ToolbarToggle, ParentCollapse] }).compileComponents());

    it('DEFECT: collapsing through toggle() from another control pulls focus off that control', () => {
        const fixture = TestBed.createComponent(ToolbarToggle);

        fixture.detectChanges();

        const debug = fixture.debugElement.query(By.directive(KbqSearchExpandable));
        const toolbarButton: HTMLButtonElement = fixture.debugElement.query(By.css('.toolbar-toggle')).nativeElement;

        toolbarButton.click();
        fixture.detectChanges();

        expect(debug.nativeElement.querySelector('.kbq-search-expandable__search')).not.toBeNull();

        toolbarButton.focus();

        expect(document.activeElement).toBe(toolbarButton);

        toolbarButton.click();
        fixture.detectChanges();

        const collapsedButton = debug.nativeElement.querySelector('.kbq-search-expandable__button');

        expect(collapsedButton).not.toBeNull();
        expect(document.activeElement).not.toBe(toolbarButton);
        expect(document.activeElement).toBe(collapsedButton);
    });

    it('DEFECT: a parent collapsing through [isOpened] pulls focus from an unrelated element', () => {
        const fixture = TestBed.createComponent(ParentCollapse);

        fixture.detectChanges();

        const debug = fixture.debugElement.query(By.directive(KbqSearchExpandable));
        const elsewhere: HTMLButtonElement = fixture.debugElement.query(By.css('.elsewhere')).nativeElement;

        fixture.componentInstance.opened = true;
        fixture.detectChanges();

        elsewhere.focus();

        expect(document.activeElement).toBe(elsewhere);

        fixture.componentInstance.opened = false;
        fixture.detectChanges();

        expect(document.activeElement).toBe(debug.nativeElement.querySelector('.kbq-search-expandable__button'));
    });
});
