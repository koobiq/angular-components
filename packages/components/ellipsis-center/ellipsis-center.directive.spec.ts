import { Component, DebugElement, Type, ViewChild } from '@angular/core';
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
    standalone: true,
    template: `
        <div [kbqEllipsisCenter]="text" [charWidth]="charWidth" [minVisibleLength]="minLength"></div>
    `,
    imports: [
        KbqEllipsisCenterModule,
        KbqToolTipModule
    ]
})
class SimpleTestComponent {
    @ViewChild(KbqEllipsisCenterDirective) ellipsisCenterDirective: KbqEllipsisCenterDirective;

    text = 'This is a long sample string used to test ellipsis center logic.';
    charWidth = 7;
    minLength = 50;
}

describe(KbqEllipsisCenterDirective.name, () => {
    it('should create the directive', () => {
        const { debugElement } = createComponent(SimpleTestComponent);
        const directiveDebugElement = getEllipsisDirectiveDebugElement(debugElement);

        expect(directiveDebugElement).toBeTruthy();
    });

    it('should initialize with input value and call refresh', () => {
        const fixture = createComponent(SimpleTestComponent);
        const { debugElement, componentInstance } = fixture;
        const directiveDebugElement = getEllipsisDirectiveDebugElement(debugElement);

        expect(directiveDebugElement).toBeTruthy();

        componentInstance.text = 'Updated string for testing.';
        fixture.detectChanges();

        expect(componentInstance.ellipsisCenterDirective['content']).toBe('Updated string for testing.');
    });

    it('should properly split content on refresh', fakeAsync(() => {
        const fixture = createComponent(SimpleTestComponent);
        const { debugElement, componentInstance } = fixture;
        const directiveDebugElement = getEllipsisDirectiveDebugElement(debugElement);

        componentInstance.text = '123456789012345678901234567890123456789012345678901234567890';
        fixture.detectChanges();

        const nativeElement: HTMLElement = directiveDebugElement.nativeElement;

        jest.spyOn(nativeElement, 'clientWidth', 'get').mockImplementation(() => 150);
        componentInstance.ellipsisCenterDirective.refresh();
        tick(); // wait for setTimeout

        const startEl: HTMLElement = nativeElement.querySelector('.data-text-start')!;
        const endEl: HTMLElement = nativeElement.querySelector('.data-text-end')!;

        expect(startEl).toBeTruthy();
        expect(endEl).toBeTruthy();
        expect(startEl.innerText.length + endEl.innerText.length).toBeLessThanOrEqual(componentInstance.text.length);
    }));
});
