import {
    AfterViewInit,
    Component,
    Inject,
    NgModule,
    QueryList,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_LOCALE_SERVICE, KbqLocaleService, KbqLocaleServiceModule } from '@koobiq/components/core';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { startWith } from 'rxjs';
import {
    KbqFormField,
    KbqFormFieldModule,
    KbqPasswordHint,
    PasswordRules,
    hasPasswordStrengthError
} from '../../components/form-field';
import { KbqIconModule } from '../../components/icon';
import { KbqInputModule } from '../../components/input/';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InputDemoComponent implements AfterViewInit {
    passwordRules = PasswordRules;
    password = '456';

    control = new FormControl('');

    value: string = '';
    numberValue: number | null = null;
    min = -5;
    customRegex = /\D/;

    locales: string[];

    @ViewChildren(KbqPasswordHint) passwordHints: QueryList<KbqPasswordHint>;
    @ViewChild('formField') formField: KbqFormField;

    constructor(@Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService) {
        this.locales = Object.keys(this.localeService.locales).filter((key) => key !== 'items');
    }

    ngAfterViewInit() {
        this.formField.control.stateChanges.pipe(startWith()).subscribe((state: any) => {
            if (!state?.focused && hasPasswordStrengthError(this.passwordHints)) {
                this.formField.control.ngControl?.control?.setErrors({ passwordStrength: true });
            }
        });
    }

    atLeastNCapitalLetters = (n: number): ((value: string) => boolean) => {
        return (value: string) => {
            const found = value.match(/[A-Z]/g);

            return !!found && found!.length >= n;
        };
    };
}

@NgModule({
    declarations: [InputDemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        KbqLocaleServiceModule,
        KbqFormFieldModule,
        KbqButtonModule,
        KbqInputModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    bootstrap: [InputDemoComponent]
})
export class DemoModule {}
