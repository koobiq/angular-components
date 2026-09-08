import { Component, DebugElement, Type, viewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqEllipsisCenterDirective, KbqEllipsisCenterModule } from './ellipsis-center.directive';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getEllipsisDirectiveDebugElement = (debugElement: DebugElement): DebugElement => {
    return debugElement.query(By.directive(KbqEllipsisCenterDirective));
};

@Component({
    imports: [
        KbqEllipsisCenterModule,
        KbqToolTipModule
    ],
    template: `
        <div
            [kbqEllipsisCenter]="text"
            [charWidth]="charWidth"
            [minVisibleLength]="minLength"
            [kbqTooltipDisabled]="tooltipDisabled"
        ></div>
    `
})
class SimpleTestComponent {
    readonly ellipsisCenterDirective = viewChild.required(KbqEllipsisCenterDirective);

    text = 'This is a long sample string used to test ellipsis center logic.';
    charWidth = 7;
    minLength = 50;
    tooltipDisabled = false;
}

/**
 * Drives a refresh against a host of `clientWidth` pixels whose text would need `textWidth` to render in
 * full, and reports what each half ended up holding. jsdom lays nothing out, so both sides of the
 * directive's fit test have to be supplied: `scrollWidth` is stubbed on the prototype because the element
 * the directive measures is created inside `refresh()` and cannot be spied on beforehand.
 */
const refreshAt = (fixture: ComponentFixture<SimpleTestComponent>, clientWidth: number, textWidth: number) => {
    const nativeElement: HTMLElement = getEllipsisDirectiveDebugElement(fixture.debugElement).nativeElement;

    jest.spyOn(nativeElement, 'clientWidth', 'get').mockReturnValue(clientWidth);
    jest.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(textWidth);

    fixture.componentInstance.ellipsisCenterDirective().refresh();
    tick();

    return {
        start: (nativeElement.querySelector('.kbq-ellipsis-center_data-text-start') as HTMLElement).innerText,
        end: (nativeElement.querySelector('.kbq-ellipsis-center_data-text-end') as HTMLElement).innerText
    };
};

describe(KbqEllipsisCenterDirective.name, () => {
    afterEach(() => jest.restoreAllMocks());

    it('should create the directive', () => {
        const { debugElement } = createComponent(SimpleTestComponent);
        const directiveDebugElement = getEllipsisDirectiveDebugElement(debugElement);

        expect(directiveDebugElement).toBeTruthy();
    });

    it('should let clicks reach whatever the hint floats over', () => {
        const { componentInstance } = createComponent(SimpleTestComponent);

        expect(componentInstance.ellipsisCenterDirective().ignoreTooltipPointerEvents()).toBe(true);
    });

    it('should initialize with input value and call refresh', () => {
        const fixture = createComponent(SimpleTestComponent);
        const { debugElement, componentInstance } = fixture;
        const directiveDebugElement = getEllipsisDirectiveDebugElement(debugElement);

        expect(directiveDebugElement).toBeTruthy();

        componentInstance.text = 'Updated string for testing.';
        fixture.detectChanges();

        expect(componentInstance.ellipsisCenterDirective()['content']).toBe('Updated string for testing.');
    });

    it('should properly split content on refresh', fakeAsync(() => {
        const fixture = createComponent(SimpleTestComponent);
        const { componentInstance } = fixture;

        componentInstance.text = '123456789012345678901234567890123456789012345678901234567890';
        fixture.detectChanges();

        const { start, end } = refreshAt(fixture, 150, 420);

        expect(end).not.toBe('');
        expect(start + end).toBe(componentInstance.text);
        expect(start.length + end.length).toBeLessThanOrEqual(componentInstance.text.length);
    }));

    it('should keep the whole text in the start element when it is shorter than minVisibleLength', fakeAsync(() => {
        const fixture = createComponent(SimpleTestComponent);
        const { componentInstance } = fixture;

        componentInstance.text = 'short.pdf';
        fixture.detectChanges();

        // Only the start element carries `text-overflow: ellipsis`, so unsplit text has to land there.
        const { start, end } = refreshAt(fixture, 40, 420);

        expect(start).toBe('short.pdf');
        expect(end).toBe('');
    }));

    it('should show the hint only for text that does not fit', fakeAsync(() => {
        const fixture = createComponent(SimpleTestComponent);
        const directive = fixture.componentInstance.ellipsisCenterDirective();

        refreshAt(fixture, 150, 420);

        expect(directive.disabled).toBe(false);

        jest.restoreAllMocks();
        refreshAt(fixture, 420, 420);

        expect(directive.disabled).toBe(true);
    }));

    it('should keep an explicit kbqTooltipDisabled across a refresh that finds the text truncated', fakeAsync(() => {
        const fixture = createComponent(SimpleTestComponent);

        fixture.componentInstance.tooltipDisabled = true;
        fixture.detectChanges();

        refreshAt(fixture, 150, 420);

        expect(fixture.componentInstance.ellipsisCenterDirective().disabled).toBe(true);
    }));

    it('should leave text that fits without a hint after kbqTooltipDisabled is toggled off again', fakeAsync(() => {
        const fixture = createComponent(SimpleTestComponent);
        const { componentInstance } = fixture;

        refreshAt(fixture, 420, 420);

        expect(componentInstance.ellipsisCenterDirective().disabled).toBe(true);

        componentInstance.tooltipDisabled = true;
        fixture.detectChanges();
        componentInstance.tooltipDisabled = false;
        fixture.detectChanges();

        // The consumer releasing the input must not resurrect a hint for text that is fully visible.
        expect(componentInstance.ellipsisCenterDirective().disabled).toBe(true);
    }));
});
