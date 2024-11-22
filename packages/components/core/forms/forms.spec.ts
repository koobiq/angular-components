import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFormElement, KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

const classWithMargin = 'kbq-form-row_margin';

@Component({
    template: `
        <form class="kbq-form-horizontal" novalidate>
            <div class="kbq-form__row">
                <label class="kbq-form__label">Подпись поля</label>
                <kbq-form-field class="kbq-form__control">
                    <input name="input" kbqInput />

                    <kbq-hint>Подсказка под полем</kbq-hint>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label">Подпись поля</label>
                <kbq-form-field class="kbq-form__control">
                    <input name="input" kbqInput />

                    <kbq-hint>Подсказка под полем</kbq-hint>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label">Подпись поля</label>
                <kbq-form-field class="kbq-form__control">
                    <input name="input" kbqInput />

                    <kbq-hint>Подсказка под полем</kbq-hint>
                </kbq-form-field>
            </div>
        </form>
    `
})
class HorizontalForm {}

@Component({
    template: `
        <form class="kbq-form-vertical" novalidate>
            <div class="kbq-form__row">
                <label class="kbq-form__label">Подпись поля</label>
                <kbq-form-field class="kbq-form__control">
                    <input name="input" kbqInput />

                    <kbq-hint>Подсказка под полем</kbq-hint>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label">Подпись поля</label>
                <kbq-form-field class="kbq-form__control">
                    <input name="input" kbqInput />

                    <kbq-hint>Подсказка под полем</kbq-hint>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <label class="kbq-form__label">Подпись поля</label>
                <kbq-form-field class="kbq-form__control">
                    <input name="input" kbqInput />

                    <kbq-hint>Подсказка под полем</kbq-hint>
                </kbq-form-field>
            </div>
        </form>
    `
})
class VerticalForm {}

xdescribe('Forms', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqFormsModule,
                KbqInputModule,
                KbqFormFieldModule
            ],
            declarations: [HorizontalForm, VerticalForm]
        }).compileComponents();
    });

    describe('Horizontal', () => {
        it('kbq-form__row should contain classes', () => {
            const fixture = TestBed.createComponent(HorizontalForm);
            fixture.detectChanges();

            const elements = fixture.debugElement.queryAll(By.directive(KbqFormElement));

            const firstRow = elements[0].nativeElement;
            expect(firstRow.classList).toContain(classWithMargin);

            const secondRow = elements[1].nativeElement;
            expect(secondRow.classList).toContain(classWithMargin);

            const lastRow = elements[2].nativeElement;
            expect(lastRow.classList).not.toContain(classWithMargin);
        });
    });

    describe('Vertical', () => {
        it('kbq-form__row should contain classes', () => {
            const fixture = TestBed.createComponent(VerticalForm);
            fixture.detectChanges();

            const elements = fixture.debugElement.queryAll(By.directive(KbqFormElement));

            const firstRow = elements[0].nativeElement;
            expect(firstRow.classList).toContain(classWithMargin);

            const secondRow = elements[1].nativeElement;
            expect(secondRow.classList).toContain(classWithMargin);

            const lastRow = elements[2].nativeElement;
            expect(lastRow.classList).not.toContain(classWithMargin);
        });
    });
});
