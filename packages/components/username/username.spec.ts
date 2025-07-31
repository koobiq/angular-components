import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqUsernameMode, KbqUsernameStyle } from './types';
import { KbqUsername } from './username';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

describe(KbqUsername.name, () => {
    it('should use default input values', () => {
        const { debugElement } = createComponent(TestComponent);

        expect(debugElement.query(By.directive(KbqUsername)).classes).toMatchSnapshot();
    });
});

@Component({
    selector: 'test-component',
    standalone: true,
    imports: [
        KbqUsername
    ],
    template: `
        <kbq-username
            [userInfo]="userInfo"
            [fullNameFormat]="fullNameFormat"
            [isCompact]="isCompact"
            [mode]="selectedMode"
            [type]="selectedType"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {
    userInfo: any = {
        firstName: 'firstName',
        middleName: 'MiddleName',
        lastName: 'LastName',
        login: 'login'
    };
    selectedMode: KbqUsernameMode = 'inline';
    selectedType: KbqUsernameStyle = 'default';
    isCompact = false;
    fullNameFormat = 'f.m.l';
}
