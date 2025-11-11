import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFieldSizingContent } from './field-sizing-content';

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component] }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getInputNativeElement = ({ debugElement }: ComponentFixture<unknown>): HTMLInputElement => {
    return debugElement.query(By.directive(KbqFieldSizingContent)).nativeElement;
};

@Component({
    selector: 'test-field-sizing-content',
    standalone: true,
    imports: [KbqFieldSizingContent],
    template: `
        <input kbqFieldSizingContent />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestFieldSizingContent {}

describe(KbqFieldSizingContent.name, () => {
    it('should apply kbq-field-sizing-content class', () => {
        const fixture = createComponent(TestFieldSizingContent);
        const input = getInputNativeElement(fixture);

        expect(input.classList).toContain('kbq-field-sizing-content');
    });

    it('should use native field-sizing when browser supports it', () => {
        (CSS.supports as jest.Mock).mockReturnValue(true);

        const fixture = createComponent(TestFieldSizingContent);
        const input = getInputNativeElement(fixture);

        expect(input.style['fieldSizing']).toBe('content');
    });
});
