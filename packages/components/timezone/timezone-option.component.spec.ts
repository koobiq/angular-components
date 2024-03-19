import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KbqTimezoneOption } from './timezone-option.component';
import { KbqTimezoneModule } from './timezone.module';


@Component({ template: `<kbq-timezone-option [timezone]="zone"></kbq-timezone-option>`})
class TimezoneOptionComponent {
    zone = {
        id: 'Europe/city3',
        offset: '03:00:00',
        city: 'city3',
        countryCode: 'ru',
        countryName: 'Russia',
        cities: 'city1, city2'
    };
}

describe('KbqTimezoneOption component', () => {

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqTimezoneModule],
            declarations: [TimezoneOptionComponent]
        }).compileComponents();
    }));

    it('TimezoneOptionComponent: viewValue', () => {
        const fixture = TestBed.createComponent(TimezoneOptionComponent);
        fixture.detectChanges();

        const optionInstance: KbqTimezoneOption =
            fixture.debugElement.query(By.directive(KbqTimezoneOption)).componentInstance;

        expect(optionInstance.viewValue).toBe('UTC +03:00 city3, city1, city2');
    });
});
