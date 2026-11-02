import { Direction, Directionality } from '@angular/cdk/bidi';
import { PortalModule, TemplatePortal } from '@angular/cdk/portal';
import {
    AfterContentInit,
    Component,
    MAX_ANIMATION_TIMEOUT,
    TemplateRef,
    ViewContainerRef,
    inject,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { KbqTabBody, KbqTabBodyPortal } from './tab-body.component';
import { KbqTabsModule } from './tabs.module';

describe('KbqTabBody', () => {
    let dir: Direction = 'ltr';
    let dirChange: Subject<Direction>;

    beforeAll(() => {
        dirChange = new Subject<Direction>();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        dir = 'ltr';
        TestBed.configureTestingModule({
            imports: [PortalModule, KbqTabBody, KbqTabBodyPortal, SimpleTabBodyApp],
            providers: [
                { provide: Directionality, useFactory: () => ({ value: dir, change: dirChange }) }
            ]
        }).compileComponents();
    });

    describe('when initialized as center', () => {
        let fixture: ComponentFixture<SimpleTabBodyApp>;

        it('should be center position if origin is unchanged', () => {
            fixture = TestBed.createComponent(SimpleTabBodyApp);
            fixture.componentInstance.position = 0;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('center');
        });

        it('should be center position if origin is explicitly set to null', () => {
            fixture = TestBed.createComponent(SimpleTabBodyApp);
            fixture.componentInstance.position = 0;

            // It can happen that the `origin` is explicitly set to null through the Angular input
            // binding. This test should ensure that the body does properly such origin value.
            // The `KbqTab` class sets the origin by default to null. See related issue: #12455
            fixture.componentInstance.origin = null;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('center');
        });

        describe('in LTR direction', () => {
            beforeEach(() => {
                dir = 'ltr';
                fixture = TestBed.createComponent(SimpleTabBodyApp);
            });
            it('should be left-origin-center position with negative or zero origin', () => {
                fixture.componentInstance.position = 0;
                fixture.componentInstance.origin = 0;
                fixture.detectChanges();

                expect(fixture.componentInstance.tabBody().bodyPosition).toBe('left-origin-center');
            });

            it('should be right-origin-center position with positive nonzero origin', () => {
                fixture.componentInstance.position = 0;
                fixture.componentInstance.origin = 1;
                fixture.detectChanges();

                expect(fixture.componentInstance.tabBody().bodyPosition).toBe('right-origin-center');
            });
        });

        describe('in RTL direction', () => {
            beforeEach(() => {
                dir = 'rtl';
                fixture = TestBed.createComponent(SimpleTabBodyApp);
            });

            it('should be right-origin-center position with negative or zero origin', () => {
                fixture.componentInstance.position = 0;
                fixture.componentInstance.origin = 0;
                fixture.detectChanges();

                expect(fixture.componentInstance.tabBody().bodyPosition).toBe('right-origin-center');
            });

            it('should be left-origin-center position with positive nonzero origin', () => {
                fixture.componentInstance.position = 0;
                fixture.componentInstance.origin = 1;
                fixture.detectChanges();

                expect(fixture.componentInstance.tabBody().bodyPosition).toBe('left-origin-center');
            });
        });
    });

    describe('position in LTR', () => {
        let fixture: ComponentFixture<SimpleTabBodyApp>;

        beforeEach(() => {
            dir = 'ltr';
            fixture = TestBed.createComponent(SimpleTabBodyApp);
            fixture.detectChanges();
        });

        it('should be left position with negative position', () => {
            fixture.componentInstance.position = -1;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('left');
        });

        it('should be center position with zero position', () => {
            fixture.componentInstance.position = 0;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('center');
        });

        it('should be right position with positive position', () => {
            fixture.componentInstance.position = 1;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('right');
        });
    });

    describe('position in RTL', () => {
        let fixture: ComponentFixture<SimpleTabBodyApp>;

        beforeEach(() => {
            dir = 'rtl';
            fixture = TestBed.createComponent(SimpleTabBodyApp);
            fixture.detectChanges();
        });

        it('should be right position with negative position', () => {
            fixture.componentInstance.position = -1;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('right');
        });

        it('should be center position with zero position', () => {
            fixture.componentInstance.position = 0;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('center');
        });

        it('should be left position with positive position', () => {
            fixture.componentInstance.position = 1;
            fixture.detectChanges();

            expect(fixture.componentInstance.tabBody().bodyPosition).toBe('left');
        });
    });

    it('should update position if direction changed at runtime', () => {
        const fixture = TestBed.createComponent(SimpleTabBodyApp);

        fixture.componentInstance.position = 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody().bodyPosition).toBe('right');

        dirChange.next('rtl');
        dir = 'rtl';

        fixture.detectChanges();

        expect(fixture.componentInstance.tabBody().bodyPosition).toBe('left');
    });

    it('should stop waiting for a translation that never finishes after MAX_ANIMATION_TIMEOUT', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(SimpleTabBodyApp);
        const centered = vi.fn();
        const timeout = TestBed.inject(MAX_ANIMATION_TIMEOUT);

        fixture.componentInstance.position = 1;
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);

        fixture.componentInstance.tabBody().onCentered.subscribe(centered);

        // A paused translation: a finite end, but `finished` never settles.
        fixture.nativeElement.querySelector('.kbq-tab-body__content').getAnimations = () => [
            {
                effect: { getComputedTiming: () => ({ endTime: 500 }) },
                finished: new Promise(() => {})
            } as unknown as Animation
        ];

        fixture.componentInstance.position = 0;
        fixture.detectChanges();

        await vi.advanceTimersByTimeAsync(timeout - 1);
        expect(centered).not.toHaveBeenCalled();

        await vi.advanceTimersByTimeAsync(1);
        expect(centered).toHaveBeenCalledTimes(1);
    });
});

@Component({
    imports: [PortalModule, KbqTabsModule],
    template: `
        <ng-template>Tab Body Content</ng-template>
        <kbq-tab-body [content]="content" [position]="position" [origin]="origin" />
    `
})
class SimpleTabBodyApp implements AfterContentInit {
    private viewContainerRef = inject(ViewContainerRef);

    content: TemplatePortal;
    position: number;
    origin: number | null;

    readonly tabBody = viewChild.required(KbqTabBody);
    readonly template = viewChild.required(TemplateRef);

    ngAfterContentInit() {
        this.content = new TemplatePortal(this.template(), this.viewContainerRef);
    }
}
