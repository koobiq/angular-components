import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqUserInfo, KbqUsername } from '@koobiq/components/username';

@Component({
    selector: 'test-app',
    imports: [KbqUsername],
    template: `
        <kbq-username [userInfo]="userInfo">
            <span class="custom-content" kbq-username-custom-view>Custom</span>
        </kbq-username>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {
    readonly userInfo: KbqUserInfo = { lastName: 'Root', login: 'mroot' };
}

describe('triage: custom view attribute without importing KbqUsernameCustomView', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [TestApp] }));

    it('DEFECT: the custom content is projected and the default view still renders, with no error', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const custom = fixture.debugElement.query(By.css('.custom-content'));

        expect(custom).toBeTruthy();
        expect(custom.nativeElement.classList.contains('kbq-username__custom-view')).toBe(false);
        expect(fixture.debugElement.query(By.css('.kbq-username__primary'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.kbq-username__secondary'))).toBeTruthy();
        expect(fixture.nativeElement.textContent.replace(/\s+/g, ' ').trim()).toBe('CustomRoot mroot');
    });
});
