import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * The two Angular 22 regressions that fail silently — no error, no warning, just wrong behaviour.
 * Both pass on Angular 20 whether or not the library carries the fix, so this file is only
 * meaningful against Angular 22.
 */
@Component({
    selector: 'silent-breaks-host',
    imports: [ReactiveFormsModule, KbqFormFieldModule, KbqInputModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <input id="trimmed" kbqInput [formControl]="trimmed" />
        </kbq-form-field>

        <kbq-form-field>
            <input id="untrimmed" kbqInput no-trim [formControl]="untrimmed" />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-select [panelWidth]="0">
                <kbq-option value="a">option a, deliberately long enough to widen the panel</kbq-option>
                <kbq-option value="b">option b</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class SilentBreaksHost {
    readonly trimmed = new FormControl('');
    readonly untrimmed = new FormControl('');
}

describe('@koobiq/components on Angular 22', () => {
    let fixture: ComponentFixture<SilentBreaksHost>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SilentBreaksHost],
            providers: [provideNoopAnimations()]
        }).compileComponents();

        fixture = TestBed.createComponent(SilentBreaksHost);
        fixture.detectChanges();
    });

    const type = (id: string, value: string): void => {
        const input = fixture.nativeElement.querySelector(`#${id}`) as HTMLInputElement;

        input.value = value;
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
    };

    it('KbqTrim still trims through the lazily resolved value accessor', () => {
        type('trimmed', '  koobiq  ');

        expect(fixture.componentInstance.trimmed.value).toBe('koobiq');
    });

    it('keeps honouring the no-trim opt-out', () => {
        type('untrimmed', '  koobiq  ');

        expect(fixture.componentInstance.untrimmed.value).toBe('  koobiq  ');
    });

    it('applies an explicit zero panelWidth to the overlay pane', () => {
        (fixture.nativeElement.querySelector('kbq-select') as HTMLElement).click();
        fixture.detectChanges();

        const pane = document.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(pane).toBeTruthy();
        expect(pane.style.width).toBe('0px');
    });
});
