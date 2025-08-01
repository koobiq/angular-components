import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqUsernameModule } from './module';
import {
    KbqFormatKeyToProfileMapping,
    KbqFormatKeyToProfileMappingExtended,
    KbqUsernameFormatKey,
    KbqUsernameMode,
    KbqUsernameStyle
} from './types';
import { KbqUsername, KbqUsernameCustomView } from './username';
import { KbqUsernameCustomPipe, KbqUsernamePipe } from './username.pipe';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

type ExampleUser = {
    firstName?: string;
    lastName?: string;
    middleName?: string;
};

const mockProfile: ExampleUser = {
    firstName: 'Alice',
    middleName: 'Bishop',
    lastName: 'Carter'
};

describe(KbqUsernamePipe.name, () => {
    const mockMapping: KbqFormatKeyToProfileMapping<ExampleUser> = {
        [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
        [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
        [KbqUsernameFormatKey.LastNameShort]: 'lastName',
        [KbqUsernameFormatKey.Dot]: undefined
    };

    let pipe: KbqUsernamePipe<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqUsernameModule],
            providers: [
                KbqUsernamePipe
            ]
        }).compileComponents();
    });

    beforeEach(inject([KbqUsernamePipe], (p: KbqUsernamePipe<any>) => {
        pipe = p;
    }));

    it('should format full name using default format', () => {
        const result = pipe.transform(mockProfile, undefined, mockMapping);

        expect(result).toBe('Carter A. B.');
    });

    it('should return empty string for empty profile', () => {
        const result = pipe.transform(null as any, 'FML', mockMapping);

        expect(result).toBe('');
    });

    it('should return empty string if profile is not an object', () => {
        const result = pipe.transform([], 'FML', mockMapping);

        expect(result).toBe('');
    });

    it('should skip irrelevant letters in format', () => {
        const irrelevantLetter = 's';
        const result = pipe.transform(mockProfile, `lf.m.${irrelevantLetter}`, mockMapping);

        expect(result.includes(irrelevantLetter)).toBeFalsy();
    });
});

describe(KbqUsernamePipe.name, () => {
    let pipe: KbqUsernameCustomPipe<any>;
    const mockMapping: KbqFormatKeyToProfileMappingExtended<ExampleUser> = {
        [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
        [KbqUsernameFormatKey.FirstNameFull]: 'firstName',
        [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
        [KbqUsernameFormatKey.MiddleNameFull]: 'middleName',
        [KbqUsernameFormatKey.LastNameShort]: 'lastName',
        [KbqUsernameFormatKey.LastNameFull]: 'lastName',
        [KbqUsernameFormatKey.Dot]: undefined
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqUsernameModule],
            providers: [
                KbqUsernameCustomPipe
            ]
        }).compileComponents();
    });

    beforeEach(inject([KbqUsernameCustomPipe], (p: KbqUsernameCustomPipe<any>) => {
        pipe = p;
    }));

    it('should format full name using default format', () => {
        const result = pipe.transform(mockProfile, undefined, mockMapping);

        expect(result).toBe('Carter A. B.');
    });

    it('should format full name using custom format', () => {
        const formats = ['F m l', 'F m. l.', 'Fm.l.', 'f m l', 'f.m.l.', 'F\u2009m.\u2009l.'];

        expect(formats.map((format) => pipe.transform(mockProfile, format, mockMapping))).toMatchSnapshot();
    });

    it('should return empty string for empty profile', () => {
        const result = pipe.transform(null as any, 'FML', mockMapping);

        expect(result).toBe('');
    });

    it('should return empty string if profile is not an object', () => {
        const result = pipe.transform([], 'FML', mockMapping);

        expect(result).toBe('');
    });

    it('should add irrelevant letters in format', () => {
        const irrelevantLetter = 's';
        const result = pipe.transform(mockProfile, `lf.m.${irrelevantLetter}`, mockMapping);

        expect(result.includes(irrelevantLetter)).toBeTruthy();
    });
});

describe(KbqUsername.name, () => {
    it('should use default input values', () => {
        const { debugElement } = createComponent(TestComponent);

        expect(debugElement.query(By.directive(KbqUsername)).classes).toMatchSnapshot();
    });

    it('should use custom view instead default if provided', () => {
        const fixture = createComponent(CustomView);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.kbq-username__primary'))).toBeFalsy();
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

@Component({
    selector: 'test-component',
    standalone: true,
    imports: [
        KbqUsername,
        KbqUsernameCustomView
    ],
    template: `
        <kbq-username [userInfo]="userInfo" [isCompact]="isCompact" [mode]="selectedMode" [type]="selectedType">
            <kbq-username-custom-view>Test</kbq-username-custom-view>
        </kbq-username>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomView {
    userInfo: any = {
        firstName: 'firstName',
        middleName: 'MiddleName',
        lastName: 'LastName',
        login: 'login'
    };
    selectedMode: KbqUsernameMode = 'inline';
    selectedType: KbqUsernameStyle = 'default';
    isCompact = false;
}
