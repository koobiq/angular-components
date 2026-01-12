import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@koobiq/components/tooltip';
import { KbqTitleDirective } from './title.directive';

describe('KbqTitleDirective', () => {
    let fixture: ComponentFixture<any>;
    let debugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, BaseKbqTitleComponent, WithParamsKbqTitleComponent],
            providers: [
                KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER
            ]
        });
    });

    describe('on html elements', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BaseKbqTitleComponent);
            debugElement = fixture.debugElement;
            fixture.detectChanges();
        });

        it('should open tooltip for overflown text', fakeAsync(() => {
            dispatchMouseEvent(debugElement.query(By.css('#parent1')).nativeElement, 'mouseenter');

            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));

        it('should open tooltip for overflown text with inline element', fakeAsync(() => {
            dispatchMouseEvent(debugElement.query(By.css('#parent3')).nativeElement, 'mouseenter');

            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));

        it('should NOT open tooltip for text with wide parent', fakeAsync(() => {
            dispatchMouseEvent(debugElement.query(By.css('#parent2')).nativeElement, 'mouseenter');

            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).toBeNull();
        }));

        it('should open tooltip for overflown text with difference in pixel fraction', fakeAsync(() => {
            dispatchMouseEvent(debugElement.query(By.css('#parent4')).nativeElement, 'mouseenter');

            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));
    });

    describe('on html elements with complex structure and params', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(WithParamsKbqTitleComponent);
            debugElement = fixture.debugElement;
            fixture.detectChanges();
        });

        it('should open tooltip for overflown complex container', fakeAsync(() => {
            dispatchMouseEvent(debugElement.query(By.css('#parent1')).nativeElement as HTMLDivElement, 'mouseenter');

            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));

        it('should NOT open tooltip for wide complex container with short text', fakeAsync(() => {
            dispatchMouseEvent(debugElement.query(By.css('#parent2')).nativeElement as HTMLDivElement, 'mouseenter');

            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).toBeNull();
        }));
    });

    describe('on html elements with vertical overflown', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(VerticalOverflownKbqTitleComponent);
            debugElement = fixture.debugElement;
            fixture.detectChanges();
        });

        it('should open tooltip for overflown', fakeAsync(() => {
            dispatchMouseEvent(
                debugElement.query(By.css('.vertical-overflown')).nativeElement as HTMLDivElement,
                'mouseenter'
            );

            fixture.detectChanges();
            flush();

            const tooltipInstance = document.querySelector('.kbq-tooltip');

            expect(tooltipInstance).not.toBeNull();
        }));
    });
});

@Component({
    imports: [
        KbqTitleDirective
    ],
    template: `
        <div class="parent" id="parent1" style="max-width: 150px;" kbq-title>
            {{ longValue }}
        </div>
        <div class="parent" id="parent2" style="max-width: 600px;" kbq-title>
            {{ defaultValue }}
        </div>
        <div class="parent" id="parent3" style="max-width: 600px;" kbq-title>
            <span>{{ longValue }}</span>
        </div>
        <div
            id="parent4"
            style="width: 121px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
            kbq-title
        >
            Protocol: udp/nbns
        </div>
    `,
    styles: [
        `
            .parent {
                display: inline-block;
                flex-grow: 1;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        `
    ]
})
class BaseKbqTitleComponent {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}

@Component({
    imports: [
        KbqTitleDirective
    ],
    template: `
        <div id="parent1" style="max-width: 150px" kbq-title>
            <div #kbqTitleContainer class="parent">
                <div #kbqTitleText class="child">
                    {{ longValue }}
                </div>
            </div>
        </div>

        <div id="parent2" style="max-width: 600px" kbq-title>
            <div #kbqTitleContainer class="parent">
                <div #kbqTitleText class="child">
                    {{ defaultValue }}
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .parent {
                display: flex;
                flex-direction: row;
                align-items: center;
                box-sizing: border-box;
                position: relative;
                max-width: 100%;
            }

            .child {
                display: inline-block;
                flex-grow: 1;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        `
    ]
})
class WithParamsKbqTitleComponent {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}

@Component({
    imports: [
        KbqTitleDirective
    ],
    template: `
        <div kbq-title class="vertical-overflown">
            {{ longValue }}
        </div>
    `,
    styles: [
        `
            .vertical-overflown {
                width: 200px;

                display: -webkit-box;
                overflow: hidden;
                text-overflow: ellipsis;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                word-wrap: break-word;
            }
        `
    ]
})
class VerticalOverflownKbqTitleComponent {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}
