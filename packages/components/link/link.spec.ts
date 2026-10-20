import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, Directive, signal, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterLink } from '@angular/router';
import { dispatchKeyboardEvent, ENTER, KbqDefaultSizes, SPACE } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink, kbqLinkOptionsProvider, KbqLinkPrefix, KbqLinkSuffix, KbqLinkUnderline } from './index';

const getLink = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement.querySelector('[kbqLink]');

const getText = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('.kbq-link__text');

const getTrailing = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('.kbq-link__trailing');

const pressKey = (element: HTMLElement, keyCode: number, key: string): KeyboardEvent =>
    dispatchKeyboardEvent(element, 'keydown', keyCode, undefined, key);

const createLink = <T>(component: Type<T>): ComponentFixture<T> => {
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

describe(KbqLink.name, () => {
    describe('structure', () => {
        it('should put the text between the prefix and the suffix', () => {
            const fixture = createLink(IconsLink);
            const [prefix, text, trailing] = Array.from(getLink(fixture).children);

            expect(prefix.classList).toContain('kbq-link__prefix');
            expect(text.classList).toContain('kbq-link__text');
            expect(trailing.classList).toContain('kbq-link__trailing');
            expect(getText(fixture).textContent).toBe('Save');
            expect(getTrailing(fixture).querySelector('.kbq-icon')?.classList).toContain('kbq-link__suffix');
        });

        it('should keep the punctuation of a suffix out of the text', () => {
            const fixture = createLink(PunctuationLink);

            expect(getText(fixture).textContent).toBe('but is not underlined');
            expect(getTrailing(fixture).textContent).toBe('.');
        });

        it('should leave the suffix empty when there is nothing after the text', () => {
            const fixture = createLink(TextLink);

            expect(getTrailing(fixture).childElementCount).toBe(0);
        });
    });

    describe('whitespace', () => {
        it('should trim the space a formatted template leaves around the text', () => {
            const fixture = createLink(IconsLink);

            expect(getText(fixture).firstChild?.textContent).toBe('Save');
        });

        it('should trim an interpolated text again after it changes', () => {
            const fixture = createLink(InterpolatedLink);

            expect(getText(fixture).textContent).toBe('first');

            fixture.componentInstance.text.set('second');
            fixture.detectChanges();

            expect(getText(fixture).textContent).toBe('second');
        });

        it('should give a trimmed text its space back once a block renders before it', () => {
            const fixture = createLink(CountedLink);

            expect(getText(fixture).textContent).toBe('new messages');

            fixture.componentInstance.count.set(3);
            fixture.detectChanges();

            expect(getText(fixture).textContent).toBe('3 new messages');

            fixture.componentInstance.count.set(0);
            fixture.detectChanges();

            expect(getText(fixture).textContent).toBe('new messages');
        });

        it('should trim a text projected through a wrapper that is not checked', () => {
            const fixture = createLink(WrappedLink);

            fixture.componentInstance.text.set('second');
            fixture.detectChanges();

            expect(getText(fixture).textContent).toBe('second');
        });

        it('should keep the spaces inside the text', () => {
            const fixture = createLink(IconsLink);

            fixture.componentInstance.text.set('Save   report');
            fixture.detectChanges();

            expect(getText(fixture).textContent).toBe('Save   report');
        });
    });

    describe('external', () => {
        it('should add the external icon after the text', () => {
            const fixture = createLink(ExternalLink);

            expect(getTrailing(fixture).querySelector('.kbq-link__external-icon')?.classList).toContain(
                'kbq-north-east_16'
            );
        });

        it('should place the external icon before the suffix content', () => {
            const fixture = createLink(ExternalLink);

            fixture.componentInstance.withSuffix.set(true);
            fixture.detectChanges();

            const [icon, punctuation] = Array.from(getTrailing(fixture).children);

            expect(icon.classList).toContain('kbq-link__external-icon');
            expect(punctuation.textContent).toBe('.');
        });

        it('should not set the target itself', () => {
            const fixture = createLink(ExternalLink);

            expect(getLink(fixture).hasAttribute('target')).toBe(false);
        });

        it('should render no external icon by default', () => {
            const fixture = createLink(TextLink);

            expect(fixture.nativeElement.querySelector('.kbq-link__external-icon')).toBeNull();
        });
    });

    describe('pseudo', () => {
        it('should make any element but an anchor a pseudo link', () => {
            const fixture = createLink(PseudoLink);

            expect(getLink(fixture).classList).toContain('kbq-link_pseudo');
            expect(getLink(fixture).getAttribute('role')).toBe('button');
        });

        it('should keep an anchor a regular link unless it is marked pseudo', () => {
            const fixture = createLink(PseudoAnchor);
            const link = getLink(fixture);

            expect(link.classList).not.toContain('kbq-link_pseudo');
            expect(link.hasAttribute('role')).toBe(false);

            fixture.componentInstance.pseudo.set(true);
            fixture.detectChanges();

            expect(link.classList).toContain('kbq-link_pseudo');
            expect(link.getAttribute('role')).toBe('button');
        });

        it('should activate a pseudo link with Enter and Space', () => {
            const fixture = createLink(PseudoLink);
            const link = getLink(fixture);

            const enter = pressKey(link, ENTER, 'Enter');
            const space = pressKey(link, SPACE, ' ');

            expect(fixture.componentInstance.clicks).toBe(2);
            expect(enter.defaultPrevented).toBe(true);
            expect(space.defaultPrevented).toBe(true);
        });

        it('should not activate a disabled pseudo link', () => {
            const fixture = createLink(PseudoLink);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();
            pressKey(getLink(fixture), ENTER, 'Enter');

            expect(fixture.componentInstance.clicks).toBe(0);
        });

        it('should leave Enter to the browser on an anchor with a href', () => {
            const fixture = createLink(PseudoAnchorWithHref);
            const link = getLink(fixture);

            const enter = pressKey(link, ENTER, 'Enter');

            expect(enter.defaultPrevented).toBe(false);
            expect(fixture.componentInstance.clicks).toBe(0);

            pressKey(link, SPACE, ' ');

            expect(fixture.componentInstance.clicks).toBe(1);
        });

        it('should leave the semantics to a role written on the element', () => {
            const fixture = createLink(PseudoWithOwnRole);
            const link = getLink(fixture);

            pressKey(link, ENTER, 'Enter');

            expect(link.getAttribute('role')).toBe('link');
            expect(fixture.componentInstance.clicks).toBe(0);
        });

        it('should leave a pseudo link out of the tab order to what activates it', () => {
            const fixture = createLink(PseudoOutOfTabOrder);
            const link = getLink(fixture);

            pressKey(link, ENTER, 'Enter');

            expect(link.hasAttribute('role')).toBe(false);
            expect(link.getAttribute('tabindex')).toBe('-1');
            expect(fixture.componentInstance.clicks).toBe(0);
        });

        it('should keep a role written on a regular link', () => {
            const fixture = createLink(RegularLinkWithOwnRole);

            expect(getLink(fixture).getAttribute('role')).toBe('menuitem');
        });

        it('should leave a key that another directive on the element has handled to it', () => {
            const fixture = createLink(PseudoWithKeyHandler);
            const link = getLink(fixture);

            pressKey(link, ENTER, 'Enter');
            pressKey(link, SPACE, ' ');

            expect(link.getAttribute('role')).toBe('button');
            expect(fixture.componentInstance.handled).toBe(2);
            expect(fixture.componentInstance.clicks).toBe(0);
        });

        it('should take the tab order from a tabindex attribute', () => {
            const fixture = createLink(PseudoWithTabindexAttribute);
            const link = getLink(fixture);

            pressKey(link, ENTER, 'Enter');

            expect(link.getAttribute('tabindex')).toBe('-1');
            expect(link.hasAttribute('role')).toBe(false);
            expect(fixture.componentInstance.clicks).toBe(0);
        });

        it('should leave a label to its own activation', () => {
            const fixture = createLink(PseudoLabel);
            const link = getLink(fixture);

            pressKey(link, ENTER, 'Enter');

            expect(link.hasAttribute('role')).toBe(false);
            expect(fixture.componentInstance.clicks).toBe(0);
        });

        it('should leave a label out of the tab order', () => {
            const fixture = createLink(PseudoLabel);

            expect(getLink(fixture).hasAttribute('tabindex')).toBe(false);
        });

        it('should activate a pseudo link once while Space is held', () => {
            const fixture = createLink(PseudoLink);
            const link = getLink(fixture);

            pressKey(link, SPACE, ' ');

            const repeated = new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true, cancelable: true });

            link.dispatchEvent(repeated);

            expect(fixture.componentInstance.clicks).toBe(1);
            expect(repeated.defaultPrevented).toBe(true);
        });
    });

    describe('disabled', () => {
        it('should take a disabled link out of the tab order', () => {
            const fixture = createLink(DisabledLink);
            const link = getLink(fixture);

            expect(link.getAttribute('tabindex')).toBe('5');
            expect(link.classList).not.toContain('kbq-disabled');

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();

            expect(link.getAttribute('tabindex')).toBe('-1');
            expect(link.classList).toContain('kbq-disabled');
            // `disabled` is not a valid attribute on an anchor, so the state is exposed via ARIA.
            expect(link.hasAttribute('disabled')).toBe(false);
            expect(link.getAttribute('aria-disabled')).toBe('true');
        });

        it('should stop the click on a disabled link', () => {
            const fixture = createLink(DisabledLink);
            const link = getLink(fixture);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();

            const event = new MouseEvent('click', { bubbles: true, cancelable: true });

            link.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(true);
            expect(fixture.componentInstance.clicks).toBe(0);
        });

        it('should stop the keys before the other directives on a disabled link', () => {
            const fixture = createLink(PseudoWithKeyHandler);
            const link = getLink(fixture);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();
            pressKey(link, ENTER, 'Enter');

            expect(fixture.componentInstance.handled).toBe(0);
        });

        it('should let the click through once enabled again', () => {
            const fixture = createLink(DisabledLink);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();
            fixture.componentInstance.disabled.set(false);
            fixture.detectChanges();
            getLink(fixture).click();

            expect(fixture.componentInstance.clicks).toBe(1);
        });

        it('should use the native attribute on a button', () => {
            const fixture = createLink(DisabledButton);
            const link = getLink(fixture);

            expect(link.hasAttribute('disabled')).toBe(true);
            expect(link.hasAttribute('aria-disabled')).toBe(false);
        });

        it('should keep reporting the bound tabIndex while disabled', () => {
            const fixture = createLink(DisabledLink);

            fixture.componentInstance.disabled.set(true);
            fixture.detectChanges();

            const link = fixture.debugElement.query(By.directive(KbqLink)).injector.get(KbqLink);

            expect(link.tabIndex()).toBe(5);
            expect(link.disabled()).toBe(true);
        });

        it('should let a forDisabledComponent consumer drive disabledSignal', () => {
            const fixture = createLink(DisabledLink);
            const link = fixture.debugElement.query(By.directive(KbqLink)).injector.get(KbqLink);

            link.disabledSignal.set(true);
            fixture.detectChanges();

            expect(getLink(fixture).classList).toContain('kbq-disabled');
        });
    });

    describe('size', () => {
        it('should use the normal size by default', () => {
            const fixture = createLink(TextLink);

            expect(getLink(fixture).classList).toContain('kbq-link_size_normal');
        });

        it('should carry exactly one size class', () => {
            const fixture = createLink(SizedLink);
            const link = getLink(fixture);

            fixture.componentInstance.size.set('compact');
            fixture.detectChanges();

            expect(link.classList).toContain('kbq-link_size_compact');
            expect(link.classList).not.toContain('kbq-link_size_normal');
            expect(link.classList).not.toContain('kbq-link_size_big');

            fixture.componentInstance.size.set('big');
            fixture.detectChanges();

            expect(link.classList).toContain('kbq-link_size_big');
            expect(link.classList).not.toContain('kbq-link_size_compact');
        });
    });

    describe('print', () => {
        it('should print the href without its protocol', () => {
            const fixture = createLink(PrintLink);

            expect(getLink(fixture).getAttribute('data-print')).toBe('localhost:3003/');
        });

        it('should drop the www of the href', () => {
            const fixture = createLink(PrintLink);

            fixture.componentInstance.href.set('https://www.cvedetails.com/cve/CVE-2019-1020010/');
            fixture.detectChanges();

            expect(getLink(fixture).getAttribute('data-print')).toBe('cvedetails.com/cve/CVE-2019-1020010/');
        });

        it('should print a bound text as is', () => {
            const fixture = createLink(PrintLink);

            fixture.componentInstance.print.set('cvedetails.com/cve');
            fixture.detectChanges();

            expect(getLink(fixture).getAttribute('data-print')).toBe('cvedetails.com/cve');
        });

        it('should print nothing for a null print', () => {
            const fixture = createLink(PrintLink);

            fixture.componentInstance.print.set(null);
            fixture.detectChanges();

            expect(getLink(fixture).hasAttribute('data-print')).toBe(false);
        });

        it('should print the href that routerLink sets', () => {
            TestBed.configureTestingModule({ providers: [provideRouter([])] });

            const fixture = createLink(PrintRouterLink);

            expect(getLink(fixture).getAttribute('data-print')).toBe('localhost/docs');

            fixture.componentInstance.path.set('/other');
            fixture.detectChanges();

            expect(getLink(fixture).getAttribute('data-print')).toBe('localhost/other');
        });

        it('should print nothing for an unbound print', () => {
            const fixture = createLink(TextLink);

            expect(getLink(fixture).hasAttribute('data-print')).toBe(false);
        });

        it('should print nothing for a pseudo link without a text of its own', () => {
            const fixture = createLink(PrintPseudoLink);

            expect(getLink(fixture).hasAttribute('data-print')).toBe(false);
        });
    });

    describe('underline', () => {
        it('should underline a link always and a pseudo link on hover by default', () => {
            const link = getLink(createLink(TextLink));
            const pseudo = getLink(createLink(PseudoLink));

            expect(link.classList).toContain('kbq-link_underline_always');
            expect(pseudo.classList).toContain('kbq-link_underline_hover');
        });

        it('should carry exactly the bound underline', () => {
            const fixture = createLink(UnderlinedLink);
            const link = getLink(fixture);

            fixture.componentInstance.underline.set('none');
            fixture.detectChanges();

            expect(link.classList).toContain('kbq-link_underline_none');
            expect(link.classList).not.toContain('kbq-link_underline_always');
            expect(link.classList).not.toContain('kbq-link_underline_hover');
        });
    });

    describe('options', () => {
        it('should take the defaults from the options provider', () => {
            TestBed.configureTestingModule({
                providers: [
                    kbqLinkOptionsProvider({
                        size: 'compact',
                        underline: 'hover',
                        pseudoUnderline: 'none',
                        useVisited: true
                    })
                ]
            });

            const link = getLink(createLink(TextLink));
            const pseudo = getLink(createLink(PseudoLink));

            expect(link.classList).toContain('kbq-link_size_compact');
            expect(link.classList).toContain('kbq-link_underline_hover');
            expect(link.classList).toContain('kbq-link_use-visited');
            expect(pseudo.classList).toContain('kbq-link_underline_none');
        });

        it('should keep the defaults the provider leaves out', () => {
            TestBed.configureTestingModule({ providers: [kbqLinkOptionsProvider({ size: 'big' })] });

            const link = getLink(createLink(TextLink));
            const pseudo = getLink(createLink(PseudoLink));

            expect(link.classList).toContain('kbq-link_size_big');
            expect(link.classList).toContain('kbq-link_underline_always');
            expect(link.classList).not.toContain('kbq-link_use-visited');
            expect(pseudo.classList).toContain('kbq-link_underline_hover');
        });

        it('should let the inputs override the provider', () => {
            TestBed.configureTestingModule({
                providers: [kbqLinkOptionsProvider({ size: 'compact', underline: 'none' })]
            });

            const fixture = createLink(SizedLink);
            const link = getLink(fixture);

            fixture.componentInstance.size.set('big');
            fixture.detectChanges();

            expect(link.classList).toContain('kbq-link_size_big');

            const underlined = createLink(UnderlinedLink);

            underlined.componentInstance.underline.set('always');
            underlined.detectChanges();

            expect(getLink(underlined).classList).toContain('kbq-link_underline_always');
        });

        it('should apply a provider to the subtree of the component that declares it', () => {
            const fixture = createLink(ScopedOptions);
            const [scoped, outside] = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('[kbqLink]'));

            expect(scoped.classList).toContain('kbq-link_size_big');
            expect(outside.classList).toContain('kbq-link_size_normal');
        });
    });

    describe('focus', () => {
        it('should mark the keyboard focus on the link', () => {
            const fixture = createLink(TextLink);
            const link = getLink(fixture);

            TestBed.inject(FocusMonitor).focusVia(link, 'keyboard');

            expect(link.classList).toContain('cdk-keyboard-focused');

            link.blur();

            expect(link.classList).not.toContain('cdk-keyboard-focused');
        });
    });

    describe('label focus', () => {
        it('should mark the keyboard focus of the control inside a label', () => {
            const fixture = createLink(LabelWithInput);
            const link = getLink(fixture);

            TestBed.inject(FocusMonitor).focusVia(fixture.nativeElement.querySelector('input'), 'keyboard');

            expect(link.classList).toContain('cdk-keyboard-focused');
        });
    });

    describe('accessibility', () => {
        it('should have no violations on a link with icons', async () => {
            const fixture = createLink(IconsLink);

            await expect(fixture.nativeElement).toHaveNoViolations();
        });

        it('should have no violations on an external link', async () => {
            const fixture = createLink(ExternalLink);

            await expect(fixture.nativeElement).toHaveNoViolations();
        });

        it('should have no violations on a pseudo link', async () => {
            const fixture = createLink(PseudoLink);

            await expect(fixture.nativeElement).toHaveNoViolations();
        });
    });
});

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/">Scan report</a>
    `
})
class TextLink {}

@Component({
    imports: [KbqLink, KbqLinkPrefix, KbqLinkSuffix, KbqIconModule],
    template: `
        <a kbqLink href="https://koobiq.io/">
            <i kbq-icon="kbq-calendar-o_16" kbqLinkPrefix></i>
            {{ text() }}
            <i kbq-icon="kbq-chevron-down-s_16" kbqLinkSuffix></i>
        </a>
    `
})
class IconsLink {
    readonly text = signal('Save');
}

@Component({
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <a kbqLink href="https://koobiq.io/">
            but is not underlined
            <span kbqLinkSuffix>.</span>
        </a>
    `
})
class PunctuationLink {}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/">
            {{ text() }}
        </a>
    `
})
class InterpolatedLink {
    readonly text = signal('first');
}

@Component({
    imports: [KbqLink, KbqLinkSuffix],
    template: `
        <a kbqLink external href="https://koobiq.io/">
            Technical support center
            @if (withSuffix()) {
                <span kbqLinkSuffix>.</span>
            }
        </a>
    `
})
class ExternalLink {
    readonly withSuffix = signal(false);
}

@Component({
    imports: [KbqLink],
    template: `
        <span kbqLink [disabled]="disabled()" (click)="clicks = clicks + 1">Scan report</span>
    `
})
class PseudoLink {
    readonly disabled = signal(false);
    clicks = 0;
}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink pseudo href="#" (click)="$event.preventDefault(); clicks = clicks + 1">Scan report</a>
    `
})
class PseudoAnchorWithHref {
    clicks = 0;
}

@Component({
    imports: [KbqLink],
    template: `
        <span kbqLink role="link" tabindex="0" (click)="clicks = clicks + 1">Scan report</span>
    `
})
class PseudoWithOwnRole {
    clicks = 0;
}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink [pseudo]="pseudo()">Scan report</a>
    `
})
class PseudoAnchor {
    readonly pseudo = signal(false);
}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink role="menuitem" href="https://koobiq.io/">Scan report</a>
    `
})
class RegularLinkWithOwnRole {}

@Component({
    imports: [KbqLink],
    template: `
        <span kbqLink [tabIndex]="-1" (click)="clicks = clicks + 1">Scan report</span>
    `
})
class PseudoOutOfTabOrder {
    clicks = 0;
}

@Component({
    imports: [KbqLink],
    template: `
        <input id="file" type="file" aria-label="File" />
        <label kbqLink for="file" (click)="$event.preventDefault(); clicks = clicks + 1">choose a file</label>
    `
})
class PseudoLabel {
    clicks = 0;
}

@Component({
    imports: [KbqLink],
    template: `
        <a
            kbqLink
            href="https://koobiq.io/"
            [disabled]="disabled()"
            [tabIndex]="5"
            (click)="$event.preventDefault(); clicks = clicks + 1"
        >
            Scan report
        </a>
    `
})
class DisabledLink {
    readonly disabled = signal(false);
    clicks = 0;
}

@Component({
    imports: [KbqLink],
    template: `
        <button kbqLink disabled>Scan report</button>
    `
})
class DisabledButton {}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink [href]="href()" [print]="print()">Scan report</a>
    `
})
class PrintLink {
    readonly href = signal('http://localhost:3003/');
    readonly print = signal<string | null>('');
}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/" [size]="size()">Scan report</a>
    `
})
class SizedLink {
    readonly size = signal<KbqDefaultSizes>('normal');
}

@Component({
    imports: [KbqLink],
    template: `
        <span kbqLink print>Scan report</span>
    `
})
class PrintPseudoLink {}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/" [underline]="underline()">Scan report</a>
    `
})
class UnderlinedLink {
    readonly underline = signal<KbqLinkUnderline | undefined>(undefined);
}

@Component({
    selector: 'scoped-link',
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/">Scan report</a>
    `,
    providers: [kbqLinkOptionsProvider({ size: 'big' })]
})
class ScopedLink {}

@Component({
    imports: [KbqLink, ScopedLink],
    template: `
        <scoped-link />
        <a kbqLink href="https://koobiq.io/">Scan report</a>
    `
})
class ScopedOptions {}

@Component({
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/">
            @if (count()) {
                <b>{{ count() }}</b>
            }
            new messages
        </a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class CountedLink {
    readonly count = signal(0);
}

@Component({
    selector: 'link-wrapper',
    imports: [KbqLink],
    template: `
        <a kbqLink href="https://koobiq.io/"><ng-content /></a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class LinkWrapper {}

@Component({
    imports: [LinkWrapper],
    template: `
        <link-wrapper>
            {{ text() }}
        </link-wrapper>
    `
})
class WrappedLink {
    readonly text = signal('first');
}

@Directive({
    selector: '[handlesKeys]',
    host: {
        '(keydown.enter)': 'handle($event)',
        '(keydown.space)': 'handle($event)'
    }
})
class HandlesKeys {
    count = 0;

    handle(event: Event): void {
        event.preventDefault();
        this.count++;
    }
}

@Component({
    imports: [KbqLink, HandlesKeys],
    template: `
        <span kbqLink handlesKeys [disabled]="disabled()" (click)="clicks = clicks + 1">Scan report</span>
    `
})
class PseudoWithKeyHandler {
    private readonly keys = viewChild.required(HandlesKeys);

    readonly disabled = signal(false);
    clicks = 0;

    get handled(): number {
        return this.keys().count;
    }
}

@Component({
    imports: [KbqLink],
    template: `
        <span kbqLink tabindex="-1" (click)="clicks = clicks + 1">Scan report</span>
    `
})
class PseudoWithTabindexAttribute {
    clicks = 0;
}

@Component({
    imports: [KbqLink, RouterLink],
    template: `
        <a kbqLink print [routerLink]="path()">Docs</a>
    `
})
class PrintRouterLink {
    readonly path = signal('/docs');
}

@Component({
    imports: [KbqLink],
    template: `
        <label kbqLink>
            <input type="file" aria-label="File" />
            choose a file
        </label>
    `
})
class LabelWithInput {}
