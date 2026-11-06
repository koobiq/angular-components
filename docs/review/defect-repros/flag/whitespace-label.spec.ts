import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqFlag } from '@koobiq/components/flag';

/** An axe audit runs on real timers and needs more than the repo-wide 2s default. */
const AXE_TIMEOUT = 15000;

describe('KbqFlag triage: label made of spaces', () => {
    it(
        'DEFECT: a label of spaces exposes role="img" with a blank aria-label, which axe reports as role-img-alt',
        async () => {
            @Component({
                imports: [KbqFlag],
                template: `
                    <kbq-flag [label]="label"><img src="DE.svg" alt="" /></kbq-flag>
                `
            })
            class TestApp {
                readonly label = '   ';
            }

            TestBed.configureTestingModule({ imports: [TestApp] });
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            const flag: HTMLElement = fixture.debugElement.query(By.directive(KbqFlag)).nativeElement;

            expect(flag.getAttribute('role')).toBe('img');
            expect(flag.getAttribute('aria-label')).toBe('   ');
            expect(flag.hasAttribute('aria-hidden')).toBe(false);

            document.body.appendChild(fixture.nativeElement);

            await expect(fixture.nativeElement).not.toHaveNoViolations({
                runOnly: { type: 'rule', values: ['role-img-alt'] }
            });

            fixture.nativeElement.remove();
        },
        AXE_TIMEOUT
    );
});
