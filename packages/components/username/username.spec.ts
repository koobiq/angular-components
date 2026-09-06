import { ChangeDetectionStrategy, Component, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqTitleDirective } from '@koobiq/components/title';
import { axe } from 'jest-axe';
import {
    KBQ_PROFILE_MAPPING,
    KBQ_USERNAME_DEFAULT_LOCALE_CONFIGURATION,
    kbqUsernameLocaleConfigurationProvider
} from './constants';
import { KbqUsernameModule } from './module';
import {
    KbqFormatKeyToProfileMapping,
    KbqFormatKeyToProfileMappingExtended,
    KbqUserInfo,
    KbqUsernameFormatKey,
    KbqUsernameMode,
    KbqUsernameStyle
} from './types';
import { KbqUsername, KbqUsernameCustomView } from './username';
import {
    kbqBuildUsernameText,
    kbqInjectUsernameFormatter,
    KbqUsernameCustomPipe,
    KbqUsernamePipe
} from './username.pipe';

const AXE_TIMEOUT = 15000;

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });

    const fixture = TestBed.createComponent<T>(component);

    fixture.detectChanges();

    return fixture;
};

/** Rendered text with the template's own indentation and the `&nbsp;` separators collapsed. */
const textOf = (fixture: ComponentFixture<unknown>): string =>
    (fixture.nativeElement.textContent ?? '').replace(/\s+/g, ' ').trim();

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
        TestBed.configureTestingModule({});
        pipe = TestBed.runInInjectionContext(() => new KbqUsernamePipe<any>());
    });

    it('should format full name using the shipped default format and mapping', () => {
        expect(pipe.transform(mockProfile)).toBe('Carter A. B.');
    });

    it('should format full name using default format and an explicit mapping', () => {
        const result = pipe.transform(mockProfile, undefined, mockMapping);

        expect(result).toBe('Carter A. B.');
    });

    it('should return empty string for empty profile', () => {
        const result = pipe.transform(null as any, undefined, mockMapping);

        expect(result).toBe('');
    });

    it('should return empty string if profile is not an object', () => {
        const result = pipe.transform([], undefined, mockMapping);

        expect(result).toBe('');
    });

    it('should skip irrelevant letters in format', () => {
        const irrelevantLetter = 's';
        const result = pipe.transform(mockProfile, `lf.m.${irrelevantLetter}`, mockMapping);

        expect(result.includes(irrelevantLetter)).toBeFalsy();
    });

    it('should skip the fields the profile does not carry', () => {
        expect(pipe.transform({ lastName: 'Carter' })).toBe('Carter');
        expect(pipe.transform({ firstName: 'Alice', middleName: 'Bishop' })).toBe('A. B.');
        expect(pipe.transform({})).toBe('');
    });

    it('should abbreviate by code point, keeping a surrogate pair whole', () => {
        expect(pipe.transform({ firstName: '\u{1D4A5}ohn', lastName: 'Root' })).toBe('Root \u{1D4A5}.');
    });

    it('should resolve an uppercase key through the shipped default mapping', () => {
        expect(pipe.transform(mockProfile, 'L F M')).toBe('Carter Alice Bishop');
    });
});

describe(KbqUsernameCustomPipe.name, () => {
    const mockMapping: KbqFormatKeyToProfileMappingExtended<ExampleUser> = {
        [KbqUsernameFormatKey.FirstNameShort]: 'firstName',
        [KbqUsernameFormatKey.FirstNameFull]: 'firstName',
        [KbqUsernameFormatKey.MiddleNameShort]: 'middleName',
        [KbqUsernameFormatKey.MiddleNameFull]: 'middleName',
        [KbqUsernameFormatKey.LastNameShort]: 'lastName',
        [KbqUsernameFormatKey.LastNameFull]: 'lastName',
        [KbqUsernameFormatKey.Dot]: undefined
    };

    let pipe: KbqUsernameCustomPipe<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        pipe = TestBed.runInInjectionContext(() => new KbqUsernameCustomPipe<any>());
    });

    it('should format full name using the shipped default format and mapping', () => {
        expect(pipe.transform(mockProfile)).toBe('Carter A. B.');
    });

    it('should format full name using default format and an explicit mapping', () => {
        const result = pipe.transform(mockProfile, undefined, mockMapping);

        expect(result).toBe('Carter A. B.');
    });

    it('should format full name using custom format', () => {
        const formats = ['F m l', 'F m. l.', 'Fm.l.', 'f m l', 'f.m.l.', 'F\u2009m.\u2009l.'];

        expect(formats.map((format) => pipe.transform(mockProfile, format, mockMapping))).toMatchSnapshot();
    });

    it('should return empty string for empty profile', () => {
        const result = pipe.transform(null as any, undefined, mockMapping);

        expect(result).toBe('');
    });

    it('should return empty string if profile is not an object', () => {
        const result = pipe.transform([], undefined, mockMapping);

        expect(result).toBe('');
    });

    it('should add irrelevant letters in format', () => {
        const irrelevantLetter = 's';
        const result = pipe.transform(mockProfile, `lf.m.${irrelevantLetter}`, mockMapping);

        expect(result.includes(irrelevantLetter)).toBeTruthy();
    });

    it('should abbreviate by code point, keeping a surrogate pair whole', () => {
        expect(pipe.transform({ firstName: '\u{1D4A5}ohn', lastName: 'Root' }, 'L f.')).toBe('Root \u{1D4A5}.');
    });

    it('should warn once about a format key with no mapped field', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
        const mappingWithoutLastName = { ...mockMapping, [KbqUsernameFormatKey.LastNameFull]: undefined };

        expect(pipe.transform(mockProfile, 'L f.', mappingWithoutLastName)).toBe('L A.');
        pipe.transform(mockProfile, 'L f.', mappingWithoutLastName);

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('"L"');

        warn.mockRestore();
    });
});

describe('kbqBuildUsernameText', () => {
    it('should return name only when login and site are absent', () => {
        expect(kbqBuildUsernameText({ name: 'Root M. A.' })).toMatchSnapshot();
    });

    it('should append login after name', () => {
        expect(kbqBuildUsernameText({ name: 'Root M. A.', login: 'mroot' })).toMatchSnapshot();
    });

    it('should wrap site in parentheses by default', () => {
        expect(kbqBuildUsernameText({ name: 'Root M. A.', login: 'mroot', site: 'corp' })).toMatchSnapshot();
    });

    it('should include site without login', () => {
        expect(kbqBuildUsernameText({ name: 'Root M. A.', site: 'corp' })).toMatchSnapshot();
    });

    it('should use custom formatSite', () => {
        expect(kbqBuildUsernameText({ name: 'Root M. A.', site: 'corp' }, { formatSite: (s) => s })).toMatchSnapshot();
    });

    it('should use custom formatLogin', () => {
        expect(
            kbqBuildUsernameText({ name: 'Root M. A.', login: 'mroot' }, { formatLogin: (s) => `[@${s}]` })
        ).toMatchSnapshot();
    });

    it('should skip empty name and join remaining parts', () => {
        expect(kbqBuildUsernameText({ name: '', login: 'mroot', site: 'corp' })).toMatchSnapshot();
    });

    it('should isolate every segment when asked to', () => {
        const isolated = kbqBuildUsernameText({ name: 'רוט מ.', login: 'mroot', site: 'corp' }, { bidiIsolate: true });

        expect(isolated).toBe('\u2068רוט מ.\u2069 \u2068mroot\u2069 \u2068(corp)\u2069');
    });

    it('should leave the string free of invisible characters by default', () => {
        expect(kbqBuildUsernameText({ name: 'רוט מ.', login: 'mroot' })).toBe('רוט מ. mroot');
    });
});

describe(KbqUsername.name, () => {
    it('should use default input values', () => {
        const { debugElement } = createComponent(TestComponent);

        expect(debugElement.query(By.directive(KbqUsername)).classes).toMatchSnapshot();
    });

    it('should use custom view instead default if provided', () => {
        const fixture = createComponent(CustomViewComponent);

        expect(fixture.debugElement.query(By.css('.kbq-username__primary'))).toBeFalsy();
    });

    describe('partial profiles', () => {
        const cases: [description: string, userInfo: KbqUserInfo, full: string, compact: string][] = [
            [
                'both name parts and a login',
                { firstName: 'Maxwell', lastName: 'Root', login: 'mroot' },
                'Root M. mroot',
                'Root M.'
            ],
            ['a last name and a login', { lastName: 'Root', login: 'mroot' }, 'Root mroot', 'Root'],
            ['a first name only', { firstName: 'Maxwell' }, 'M.', 'M.'],
            ['a first and a middle name', { firstName: 'Maxwell', middleName: 'Alan' }, 'M. A.', 'M. A.'],
            ['a login only', { login: 'mroot' }, 'mroot', 'mroot'],
            ['nothing at all', {}, '', '']
        ];

        it.each(cases)('should render a profile with %s', (_, userInfo, full) => {
            const fixture = createComponent(TestComponent);

            fixture.componentInstance.userInfo.set(userInfo);
            fixture.detectChanges();

            expect(textOf(fixture)).toBe(full);
        });

        it.each(cases)('should render a compact profile with %s', (_, userInfo, __, compact) => {
            const fixture = createComponent(TestComponent);

            fixture.componentInstance.isCompact.set(true);
            fixture.componentInstance.userInfo.set(userInfo);
            fixture.detectChanges();

            expect(textOf(fixture)).toBe(compact);
        });
    });

    it('should honour a component-scoped mapping on both the rendered and the injected path', () => {
        const fixture = createComponent(ScopedMappingComponent);

        expect(textOf(fixture)).toBe('Root M. mroot');
        expect(fixture.componentInstance.formatted()).toBe('Root M.');
    });

    it('should no longer be resolvable as a root service', () => {
        TestBed.configureTestingModule({});

        expect(() => TestBed.inject(KbqUsernamePipe)).toThrow();
    });

    it('should declare every styling directive in KbqUsernameModule', () => {
        const fixture = createComponent(ModuleConsumerComponent);

        expect(fixture.debugElement.query(By.css('.kbq-username__primary'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.kbq-username__secondary'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.kbq-username__secondary-hint'))).toBeTruthy();
    });

    describe('accessibility', () => {
        it('should offer the unabbreviated name as the tooltip of the primary part', () => {
            const fixture = createComponent(TestComponent);
            const primary = fixture.debugElement.query(By.css('.kbq-username__primary'));

            expect(primary.injector.get(KbqTitleDirective).titleContent()).toBe('LastName firstName MiddleName');
        });

        it('should name the site hint for assistive tech', () => {
            const fixture = createComponent(TestComponent);

            fixture.componentInstance.userInfo.set({ lastName: 'Root', login: 'mroot', site: 'corp' });
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('.cdk-visually-hidden'));

            expect(label.nativeElement.textContent.trim()).toBe(KBQ_USERNAME_DEFAULT_LOCALE_CONFIGURATION.siteLabel);
        });

        it('should follow a locale override of the site label', () => {
            const fixture = createComponent(TestComponent, [
                kbqUsernameLocaleConfigurationProvider({ siteLabel: 'site' })
            ]);

            fixture.componentInstance.userInfo.set({ lastName: 'Root', login: 'mroot', site: 'corp' });
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('.cdk-visually-hidden')).nativeElement.textContent.trim()).toBe(
                'site'
            );
        });

        it(
            'should have no axe violations',
            async () => {
                const fixture = createComponent(TestComponent);

                expect(await axe(fixture.nativeElement)).toHaveNoViolations();
            },
            AXE_TIMEOUT
        );
    });

    describe('title', () => {
        it('should not attach the directive in text mode, which has no ellipsis to measure', () => {
            const fixture = createComponent(TestComponent);

            fixture.componentInstance.selectedMode.set('text');
            fixture.detectChanges();

            expect(fixture.debugElement.queryAll(By.directive(KbqTitleDirective))).toHaveLength(0);
            expect(textOf(fixture)).toBe('LastName f. M. login');
        });

        it('should attach the directive in the modes that truncate', () => {
            const fixture = createComponent(TestComponent);

            expect(fixture.debugElement.queryAll(By.directive(KbqTitleDirective)).length).toBeGreaterThan(0);
        });
    });
});

@Component({
    selector: 'test-component',
    imports: [
        KbqUsername
    ],
    template: `
        <kbq-username
            [userInfo]="userInfo()"
            [fullNameFormat]="fullNameFormat()"
            [isCompact]="isCompact()"
            [mode]="selectedMode()"
            [type]="selectedType()"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestComponent {
    readonly userInfo = signal<KbqUserInfo>({
        firstName: 'firstName',
        middleName: 'MiddleName',
        lastName: 'LastName',
        login: 'login'
    });
    readonly selectedMode = signal<KbqUsernameMode>('inline');
    readonly selectedType = signal<KbqUsernameStyle>('default');
    readonly isCompact = signal(false);
    readonly fullNameFormat = signal('lf.m.');
}

@Component({
    selector: 'custom-view-component',
    imports: [
        KbqUsername,
        KbqUsernameCustomView
    ],
    template: `
        <kbq-username [userInfo]="userInfo">
            <kbq-username-custom-view>Test</kbq-username-custom-view>
        </kbq-username>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomViewComponent {
    readonly userInfo: KbqUserInfo = { firstName: 'firstName', lastName: 'LastName', login: 'login' };
}

/** Maps the format keys onto field names of its own, which only a scoped provider can supply. */
const scopedMapping: KbqFormatKeyToProfileMapping = {
    [KbqUsernameFormatKey.FirstNameShort]: 'given',
    [KbqUsernameFormatKey.MiddleNameShort]: undefined,
    [KbqUsernameFormatKey.LastNameShort]: 'surname',
    [KbqUsernameFormatKey.Dot]: undefined
};

@Component({
    selector: 'scoped-mapping-component',
    imports: [
        KbqUsername
    ],
    template: `
        <kbq-username [userInfo]="userInfo" />
    `,
    providers: [
        { provide: KBQ_PROFILE_MAPPING, useValue: scopedMapping }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScopedMappingComponent {
    private readonly formatter = kbqInjectUsernameFormatter();

    readonly userInfo: KbqUserInfo = { surname: 'Root', given: 'Maxwell', login: 'mroot' } as KbqUserInfo;

    formatted(): string {
        return this.formatter(this.userInfo);
    }
}

@Component({
    selector: 'module-consumer-component',
    imports: [KbqUsernameModule],
    template: `
        <kbq-username>
            <kbq-username-custom-view>
                <span kbqUsernamePrimary>{{ userInfo | kbqUsername }}</span>
                <span kbqUsernameSecondary>
                    {{ userInfo.login }}
                    <span kbqUsernameSecondaryHint>({{ userInfo.site }})</span>
                </span>
            </kbq-username-custom-view>
        </kbq-username>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModuleConsumerComponent {
    readonly userInfo: KbqUserInfo = { lastName: 'Root', login: 'mroot', site: 'corp' };
}
