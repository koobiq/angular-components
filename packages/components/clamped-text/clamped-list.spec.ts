import { ENTER, SPACE } from '@angular/cdk/keycodes';
import { Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqClampedList, KbqClampedListTrigger } from './clamped-list';

const AXE_TIMEOUT = 15000;

/** jsdom has no Web Animations API, so `animate` is supplied for the specs that observe the animation. */
const mockAnimate = () => {
    const animate = vi.fn(() => ({ cancel: vi.fn() }) as unknown as Animation);

    Object.defineProperty(HTMLElement.prototype, 'animate', { value: animate, configurable: true, writable: true });

    return animate;
};

const mockReducedMotion = () => {
    Object.defineProperty(window, 'matchMedia', {
        value: () => ({ matches: true }),
        configurable: true,
        writable: true
    });
};

const restoreAnimationEnvironment = () => {
    delete (HTMLElement.prototype as { animate?: unknown }).animate;
    delete (window as { matchMedia?: unknown }).matchMedia;
};

function getItems(debugElement: DebugElement) {
    return debugElement.queryAll(By.css('.item'));
}

function getTrigger(debugElement: DebugElement) {
    return debugElement.query(By.css('.trigger'));
}

function getHost(debugElement: DebugElement): HTMLElement {
    return debugElement.query(By.directive(KbqClampedList)).nativeElement;
}

@Component({
    imports: [
        KbqClampedListTrigger,
        KbqClampedList
    ],
    template: `
        <div
            #clampedList="kbqClampedList"
            kbqClampedList
            [items]="items()"
            [collapsedVisibleCount]="collapsedVisibleCount()"
            [hiddenThreshold]="hiddenThreshold()"
            [duration]="duration()"
        >
            @for (item of clampedList.visibleItems(); track item) {
                <span class="item">{{ item }}</span>
            }

            @if (clampedList.hasToggle()) {
                <span kbqClampedListTrigger class="trigger">
                    @if (clampedList.isCollapsed()) {
                        open
                    } @else {
                        close
                    }
                </span>
            }
        </div>
    `
})
class TestHostComponent {
    readonly items = signal(Array.from({ length: 17 }, (_, i) => `Item ${i + 1}`));
    readonly collapsedVisibleCount = signal(10);
    readonly hiddenThreshold = signal(6);
    readonly duration = signal(100);
}

describe('KbqClampedList', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let debugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        debugElement = fixture.debugElement;
    });

    it('should render collapsed list by default', () => {
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.collapsedVisibleCount());
    });

    it('should render toggle when exceeded items >= threshold', () => {
        expect(getTrigger(debugElement)).toBeTruthy();
    });

    it('should expand list when trigger clicked', () => {
        getTrigger(debugElement).nativeElement.click();
        fixture.detectChanges();

        expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
    });

    it('should toggle trigger text', () => {
        const trigger = getTrigger(debugElement).nativeElement;

        expect(trigger.textContent.trim()).toBe('open');

        trigger.click();
        fixture.detectChanges();

        expect(trigger.textContent.trim()).toBe('close');
    });

    it('should not render trigger if items do not exceed threshold', () => {
        fixture.componentInstance.items.set(Array.from({ length: 9 }, (_, i) => `Item ${i + 1}`));
        fixture.detectChanges();

        expect(getTrigger(debugElement)).toBeNull();
    });

    it('should show all items when exceeded count is below hiddenThreshold', () => {
        fixture.componentInstance.items.set(Array.from({ length: 12 }, (_, i) => `Item ${i + 1}`));
        fixture.detectChanges();

        expect(getTrigger(debugElement)).toBeNull();
        expect(getItems(debugElement).length).toBe(12);
    });

    it('should collapse back when clicked twice', () => {
        const trigger = getTrigger(debugElement).nativeElement;

        trigger.click();
        fixture.detectChanges();
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);

        trigger.click();
        fixture.detectChanges();
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.collapsedVisibleCount());
    });

    describe('disclosure semantics', () => {
        it('should carry role and tabindex on the trigger', () => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;

            expect(trigger.getAttribute('role')).toBe('button');
            expect(trigger.getAttribute('tabindex')).toBe('0');
        });

        it('should update aria-expanded on the trigger', () => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;

            expect(trigger.getAttribute('aria-expanded')).toBe('false');

            trigger.click();
            fixture.detectChanges();

            expect(trigger.getAttribute('aria-expanded')).toBe('true');
        });

        it('should point aria-controls at the list', () => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;

            expect(debugElement.nativeElement.querySelector(`#${trigger.getAttribute('aria-controls')}`)).toBe(
                getHost(debugElement)
            );
        });

        it('should keep an id the host already carries', () => {
            const host = getHost(debugElement);

            expect(host.id).toBeTruthy();
        });

        it('should not publish aria-expanded on the role-less host', () => {
            expect(getHost(debugElement).hasAttribute('aria-expanded')).toBe(false);
        });

        it.each<[string, number, string]>([
            ['space', SPACE, ' '],
            ['enter', ENTER, 'Enter']
        ])('should toggle on %s and prevent the default action', (_key, keyCode, key) => {
            const trigger: HTMLElement = getTrigger(debugElement).nativeElement;
            const event = dispatchKeyboardEvent(trigger, 'keydown', keyCode, undefined, key);

            fixture.detectChanges();

            expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
            expect(event.defaultPrevented).toBe(true);
        });

        it(
            'should have no axe violations in both states',
            async () => {
                await expect(fixture.nativeElement).toHaveNoViolations();

                getTrigger(debugElement).nativeElement.click();
                fixture.detectChanges();

                await expect(fixture.nativeElement).toHaveNoViolations();
            },
            AXE_TIMEOUT
        );
    });

    describe('animation', () => {
        const ITEM_HEIGHT = 10;

        beforeEach(() => {
            vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
                return { height: this.querySelectorAll('.item').length * ITEM_HEIGHT } as DOMRect;
            });
        });

        afterEach(restoreAnimationEnvironment);

        it('should animate block-size of the host between the heights before and after the toggle', async () => {
            const animate = mockAnimate();

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();
            expect(animate).toHaveBeenCalledWith(
                {
                    blockSize: ['100px', '170px'],
                    overflow: ['clip', 'clip'],
                    alignContent: ['flex-start', 'flex-start']
                },
                { duration: 100, easing: 'ease-in-out' }
            );
        });

        it('should respect the duration', async () => {
            const animate = mockAnimate();

            fixture.componentInstance.duration.set(250);
            fixture.detectChanges();

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();

            expect(animate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ duration: 250 }));
        });

        it('should not animate when the height does not change', async () => {
            const animate = mockAnimate();

            vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ height: 100 } as DOMRect);

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();

            expect(animate).not.toHaveBeenCalled();
        });

        it('should not animate when the user prefers reduced motion', async () => {
            const animate = mockAnimate();

            mockReducedMotion();

            getTrigger(debugElement).nativeElement.click();
            await fixture.whenStable();

            expect(animate).not.toHaveBeenCalled();
            expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
        });

        it('should not animate when the items change without a toggle', async () => {
            const animate = mockAnimate();

            fixture.componentInstance.items.set(Array.from({ length: 30 }, (_, i) => `Item ${i + 1}`));
            await fixture.whenStable();

            expect(animate).not.toHaveBeenCalled();
        });
    });
});
