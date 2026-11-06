import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_USERNAME_DEFAULT_LOCALE_CONFIGURATION, KbqUserInfo, KbqUsername } from '@koobiq/components/username';

@Component({
    selector: 'test-app',
    imports: [KbqUsername],
    template: `
        <kbq-username [userInfo]="userInfo()" [isCompact]="isCompact()" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly userInfo = signal<KbqUserInfo>({ firstName: 'Maxwell', lastName: 'Root', login: 'mroot', site: 'corp' });
    readonly isCompact = signal(false);
}

describe('triage: whitespace around the visually hidden site label', () => {
    const label = KBQ_USERNAME_DEFAULT_LOCALE_CONFIGURATION.siteLabel;

    beforeEach(() => TestBed.configureTestingModule({ imports: [TestApp] }));

    it('DEFECT: the site label and the (corp) hint are adjacent with no whitespace between them', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const hidden: HTMLElement = fixture.debugElement.query(By.css('.cdk-visually-hidden')).nativeElement;
        const hint: HTMLElement = fixture.debugElement.query(By.css('.kbq-username__secondary-hint')).nativeElement;
        const secondary: HTMLElement = fixture.debugElement.query(By.css('.kbq-username__secondary')).nativeElement;

        expect(hidden.nextSibling).toBe(hint);
        expect(secondary.textContent!.replace(/\s+/g, ' ').trim()).toBe(`mroot ${label}(corp)`);

        const host: HTMLElement = fixture.debugElement.query(By.directive(KbqUsername)).nativeElement;

        expect(host.textContent).toContain(label);
    });

    it('DEFECT: in compact mode the name and the site label are adjacent with no whitespace between them', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.isCompact.set(true);
        fixture.detectChanges();

        const primary: HTMLElement = fixture.debugElement.query(By.css('.kbq-username__primary')).nativeElement;

        expect(primary.textContent!.trim()).toBe(`Root M.${label}\u00A0(corp)`);
    });
});
