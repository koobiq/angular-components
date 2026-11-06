import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';

@Component({
    imports: [KbqButtonToggleModule],
    template: `
        <kbq-button-toggle-group multiple [(value)]="values">
            <kbq-button-toggle [value]="'one'">One</kbq-button-toggle>
            <kbq-button-toggle [value]="'two'">Two</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class TwoWayMultipleGroup {
    values: string[] = ['one', 'two'];
}

describe('triage: button-toggle out-of-order array through [(value)]', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [TwoWayMultipleGroup] }));

    it('DEFECT: changing the selection after init with an out-of-order array throws NG0100', () => {
        const fixture = TestBed.createComponent(TwoWayMultipleGroup);

        fixture.componentInstance.values = ['one'];
        fixture.detectChanges();

        fixture.componentInstance.values = ['two', 'one'];

        expect(() => fixture.detectChanges()).toThrow(/NG0100/);
    });

    it('a pure reorder of the already reported selection is silent', () => {
        const fixture = TestBed.createComponent(TwoWayMultipleGroup);

        fixture.detectChanges();

        fixture.componentInstance.values = ['two', 'one'];

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(fixture.componentInstance.values).toEqual(['two', 'one']);
    });

    it('DEFECT: an initial value in reverse order throws NG0100 on the first render', () => {
        const fixture = TestBed.createComponent(TwoWayMultipleGroup);

        fixture.componentInstance.values = ['two', 'one'];

        expect(() => fixture.detectChanges()).toThrow(/NG0100/);
    });
});
