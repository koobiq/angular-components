import { ChangeDetectionStrategy, Component, ErrorHandler, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    kbqDefaultProfileMapping,
    kbqFormatUsername,
    kbqFormatUsernameCustom,
    kbqInjectUsernameFormatter,
    KbqUsername,
    KbqUsernameCustomPipe,
    KbqUsernamePipe
} from '@koobiq/components/username';

const profile = { firstName: 'Maxwell', middleName: 'Alan', lastName: 'Root', login: 'mroot' };

@Component({
    selector: 'test-app',
    imports: [KbqUsername],
    template: `
        <kbq-username [userInfo]="userInfo" [fullNameFormat]="format()" [mode]="mode()" [type]="type()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly userInfo = profile;
    readonly format = signal<any>('lf.m.');
    readonly mode = signal<any>('inline');
    readonly type = signal<any>('default');
}

describe('triage: null or undefined format', () => {
    const errors: unknown[] = [];

    beforeEach(() => {
        errors.length = 0;
        TestBed.configureTestingModule({
            imports: [TestApp],
            providers: [{ provide: ErrorHandler, useValue: { handleError: (error: unknown) => errors.push(error) } }]
        });
    });

    it('DEFECT: the formatting functions throw a TypeError for a null format', () => {
        expect(() => kbqFormatUsername(profile, null as any, kbqDefaultProfileMapping)).toThrow(TypeError);
        expect(() => kbqFormatUsernameCustom(profile, null as any, kbqDefaultProfileMapping)).toThrow(TypeError);
    });

    it('DEFECT: both pipes throw a TypeError for a null format, while undefined falls back to the default', () => {
        const pipe = TestBed.runInInjectionContext(() => new KbqUsernamePipe<any>());
        const customPipe = TestBed.runInInjectionContext(() => new KbqUsernameCustomPipe<any>());

        expect(pipe.transform(profile, undefined)).toBe('Root M. A.');
        expect(customPipe.transform(profile, undefined)).toBe('Root M. A.');

        expect(() => pipe.transform(profile, null as any)).toThrow(TypeError);
        expect(() => customPipe.transform(profile, null as any)).toThrow(TypeError);
    });

    it('DEFECT: the injected formatter throws a TypeError for a null format', () => {
        const format = TestBed.runInInjectionContext(() => kbqInjectUsernameFormatter());

        expect(format(profile)).toBe('Root M. A.');
        expect(() => format(profile, null as any)).toThrow(TypeError);
    });

    it('DEFECT: kbq-username throws a TypeError when fullNameFormat is bound to null', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.format.set(null);

        expect(() => fixture.detectChanges()).toThrow(TypeError);
    });

    it('DEFECT: kbq-username throws a TypeError when fullNameFormat is bound to undefined', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.format.set(undefined);

        expect(() => fixture.detectChanges()).toThrow(TypeError);
    });

    it('DEFECT: undefined mode and type produce kbq-username_undefined classes instead of the defaults', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.mode.set(undefined);
        fixture.componentInstance.type.set(undefined);
        fixture.detectChanges();

        const host: HTMLElement = fixture.debugElement.query(By.directive(KbqUsername)).nativeElement;

        expect(host.classList.contains('kbq-username_undefined')).toBe(true);
        expect(host.classList.contains('kbq-username_inline')).toBe(false);
        expect(host.classList.contains('kbq-username_default')).toBe(false);
        expect(errors).toHaveLength(0);
    });
});
