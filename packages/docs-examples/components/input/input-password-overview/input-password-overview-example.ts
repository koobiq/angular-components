import { Component, ViewEncapsulation } from '@angular/core';
import { PasswordRules } from '@koobiq/components/form-field';


/**
 * @title Password Input
 */
@Component({
    selector: 'input-password-overview-example',
    templateUrl: 'input-password-overview-example.html',
    styleUrls: ['input-password-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class InputPasswordOverviewExample {
    passwordRules = PasswordRules;

    value = '';

    atLeastNCapitalLetters = (n: number): (value: string) => boolean => {
        return (value: string) => {
            const found = value.match(/[A-Z]/g);

            return !!found && found!.length >= n;
        };
    }
}
