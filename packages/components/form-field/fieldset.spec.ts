import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqFieldset, KbqFieldsetItem, KbqLegend } from './fieldset';
import { KbqFormFieldModule } from './form-field.module';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getFieldsetNativeElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqFieldset)).nativeElement;
};

const getLegendNativeElement = (debugElement: DebugElement): HTMLElement => {
    return debugElement.query(By.directive(KbqLegend)).nativeElement;
};

@Component({
    selector: 'fieldset-with-legend',
    imports: [KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-fieldset>
            <legend kbqLegend>{{ legend }}</legend>

            <kbq-form-field kbqFieldsetItem>
                <input kbqInput />
            </kbq-form-field>

            <kbq-hint>Hint</kbq-hint>
        </kbq-fieldset>
    `
})
class FieldsetWithLegend {
    legend = 'Field group title';
}

@Component({
    selector: 'fieldset-without-legend',
    imports: [KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-fieldset>
            <kbq-form-field kbqFieldsetItem>
                <input kbqInput />
            </kbq-form-field>
        </kbq-fieldset>
    `
})
class FieldsetWithoutLegend {}

@Component({
    selector: 'fieldset-with-custom-legend-id',
    imports: [KbqFormFieldModule, KbqInputModule],
    template: `
        <kbq-fieldset>
            <legend id="custom-legend-id" kbqLegend>Legend</legend>

            <kbq-form-field kbqFieldsetItem>
                <input kbqInput />
            </kbq-form-field>
        </kbq-fieldset>
    `
})
class FieldsetWithCustomLegendId {}

describe(KbqFieldset.name, () => {
    it('should group the content', () => {
        const { debugElement } = createComponent(FieldsetWithLegend);
        const fieldset = getFieldsetNativeElement(debugElement);

        expect(fieldset.classList.contains('kbq-fieldset')).toBe(true);
        expect(fieldset.getAttribute('role')).toBe('group');
    });

    it('should label the group by the legend', () => {
        const { debugElement } = createComponent(FieldsetWithLegend);
        const legend = getLegendNativeElement(debugElement);

        expect(legend.id).toBeTruthy();
        expect(getFieldsetNativeElement(debugElement).getAttribute('aria-labelledby')).toBe(legend.id);
    });

    it('should keep the accessible name in sync with the legend text', () => {
        const fixture = createComponent(FieldsetWithLegend);
        const { debugElement, componentInstance } = fixture;

        componentInstance.legend = 'Renamed group';
        fixture.detectChanges();

        const legend = getLegendNativeElement(debugElement);

        expect(getFieldsetNativeElement(debugElement).getAttribute('aria-labelledby')).toBe(legend.id);
        expect(legend.textContent?.trim()).toBe('Renamed group');
    });

    it('should allow overriding the legend id', () => {
        const { debugElement } = createComponent(FieldsetWithCustomLegendId);

        expect(getLegendNativeElement(debugElement).id).toBe('custom-legend-id');
        expect(getFieldsetNativeElement(debugElement).getAttribute('aria-labelledby')).toBe('custom-legend-id');
    });

    it('should NOT set aria-labelledby without a legend', () => {
        const { debugElement } = createComponent(FieldsetWithoutLegend);

        expect(getFieldsetNativeElement(debugElement).hasAttribute('aria-labelledby')).toBe(false);
    });

    it(`should add ${KbqLegend.name} class`, () => {
        const { debugElement } = createComponent(FieldsetWithLegend);

        expect(getLegendNativeElement(debugElement).classList.contains('kbq-legend')).toBe(true);
    });

    it(`should add ${KbqFieldsetItem.name} class`, () => {
        const { debugElement } = createComponent(FieldsetWithLegend);
        const item = debugElement.query(By.directive(KbqFieldsetItem)).nativeElement;

        expect(item.classList.contains('kbq-fieldset-item')).toBe(true);
    });

    it('should render the hint area', () => {
        const { debugElement } = createComponent(FieldsetWithLegend);
        const hint = getFieldsetNativeElement(debugElement).querySelector('.kbq-fieldset > .kbq-form-field__hint');

        expect(hint?.textContent?.trim()).toBe('Hint');
    });
});
