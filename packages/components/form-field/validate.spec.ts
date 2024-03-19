import { Component } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed
} from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';


@Component({
    selector: 'test-app',
    template: `
        <kbq-form-field>
            <input kbqInput [formControl]="testControl" type="text"/>
        </kbq-form-field>
    `
})
class TestApp {
    testControl = new FormControl('');
}

describe('KbqValidate', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let input: HTMLInputElement;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                KbqFormFieldModule,
                KbqInputModule
            ],
            declarations: [TestApp]
        });
        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        testComponent = fixture.debugElement.componentInstance;
        input = fixture.debugElement.query(By.css('input')).nativeElement;

        fixture.detectChanges();
    }));

    it('Should apply validators dynamically', () => {
        const testControl = testComponent.testControl;

        input.focus();
        testControl.addValidators(Validators.required);
        testControl.updateValueAndValidity();
        testControl.setValue('');
        input.blur();

        expect(testControl.errors).toEqual({
            required: true
        });
    });
});
