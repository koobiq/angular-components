import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqDdComponent, KbqDlComponent, KbqDlModule, KbqDtComponent } from './index';

const getDlElement = ({ nativeElement }: ComponentFixture<unknown>): HTMLElement => nativeElement;

describe('KbqDl', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqDlModule, TestApp]
        }).compileComponents();
    });

    it('default rendering', () => {
        const fixture = TestBed.createComponent(TestApp);

        const dlDebugElement = fixture.debugElement.query(By.directive(KbqDlComponent));
        const dtDebugElement = fixture.debugElement.query(By.directive(KbqDtComponent));
        const ddDebugElement = fixture.debugElement.query(By.directive(KbqDdComponent));

        expect(dlDebugElement.nativeElement.classList.contains('kbq-dl')).toBe(true);
        expect(dtDebugElement.nativeElement.classList.contains('kbq-dt')).toBe(true);
        expect(ddDebugElement.nativeElement.classList.contains('kbq-dd')).toBe(true);
    });

    it('should choose the vertical layout during the first change detection when the host is at the breakpoint', () => {
        const fixture = TestBed.createComponent(KbqDlComponent);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 400 } as DOMRect]
        });
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should keep the horizontal layout during the first change detection when the host is wider than the breakpoint', () => {
        const fixture = TestBed.createComponent(KbqDlComponent);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 401 } as DOMRect]
        });
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should keep the consumer-set vertical input over the measured width', () => {
        const fixture = TestBed.createComponent(KbqDlComponent);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 400 } as DOMRect]
        });
        fixture.componentRef.setInput('vertical', false);
        fixture.autoDetectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should re-evaluate the layout on window resize, debounced', fakeAsync(() => {
        TestBed.configureTestingModule({ imports: [KbqDlComponent] });
        const fixture = TestBed.createComponent(KbqDlComponent);
        let width = 500;

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width } as DOMRect]
        });
        fixture.autoDetectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        width = 400;
        window.dispatchEvent(new Event('resize'));
        tick(99);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        tick(1);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    }));
});

@Component({
    selector: 'test-app',
    imports: [KbqDlModule],
    template: `
        <kbq-dl [minWidth]="600">
            <kbq-dt>Тип инцидента</kbq-dt>
            <kbq-dd>Вредоносное ПО</kbq-dd>

            <kbq-dt>Идентификатор</kbq-dt>
            <kbq-dd>INC-2022-125-78253</kbq-dd>

            <kbq-dt>Статус</kbq-dt>
            <kbq-dd>Новый</kbq-dd>

            <kbq-dt>Ответственный</kbq-dt>
            <kbq-dd>Иванов Иван</kbq-dd>

            <kbq-dt>Описание</kbq-dt>
            <kbq-dd>
                Здесь нужно добавить очень длинное описание, но Я не знаю, что еще можно сюда добавить, поэтому Вы
                видите этот текст.
            </kbq-dd>
        </kbq-dl>
    `
})
class TestApp {}
