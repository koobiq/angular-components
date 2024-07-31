import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqDdComponent, KbqDlComponent, KbqDlModule, KbqDtComponent } from './index';

describe('KbqDl', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqDlModule],
            declarations: [TestApp]
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
});

@Component({
    selector: 'test-app',
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
