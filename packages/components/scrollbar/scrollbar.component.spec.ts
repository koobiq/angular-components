import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqScrollbar } from './scrollbar.component';
import { KbqScrollbarModule } from './scrollbar.module';
import {
    KBQ_SCROLLBAR_CONFIG,
    KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG,
    KbqScrollbarEvents,
    KbqScrollbarOptions
} from './scrollbar.types';

const configureTestingModule = () => {
    TestBed.configureTestingModule({
        imports: [KbqScrollbarModule],
        providers: [
            {
                provide: KBQ_SCROLLBAR_CONFIG,
                useValue: null
            }
        ]
    }).compileComponents();
};

describe(KbqScrollbarModule.name, () => {
    describe('core', () => {
        let component: KbqScrollbar;
        let fixture: ComponentFixture<KbqScrollbar>;

        beforeAll(() => {
            Object.defineProperty(global.window, 'getComputedStyle', {
                value: () => ({
                    getPropertyValue: (_property: string) => ''
                })
            });
        });

        beforeEach(() => {
            configureTestingModule();

            fixture = TestBed.createComponent(KbqScrollbar);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should initialize OverlayScrollbars on ngAfterViewInit', () => {
            const runOutsideAngularSpyFn = jest.spyOn(component['ngZone'], 'runOutsideAngular');

            component.ngAfterViewInit();
            fixture.detectChanges();
            expect(runOutsideAngularSpyFn).toHaveBeenCalled();
            expect(component['kbqScrollbarDirective']!.scrollbarInstance).toBeDefined();
        });

        it('should destroy scrollbar instance on component destroy', () => {
            const instance = component['kbqScrollbarDirective']!.scrollbarInstance;

            expect(instance?.state().destroyed).toBeFalsy();

            fixture.destroy();

            expect(instance?.state().destroyed).toBeTruthy();
        });
    });

    describe('with event listeners', () => {
        let component: ScrollEventListener;
        let fixture: ComponentFixture<ScrollEventListener>;

        beforeEach(() => {
            configureTestingModule();

            fixture = TestBed.createComponent(ScrollEventListener);
            component = fixture.componentInstance;
        });

        it('should emit initialize event', () => {
            fixture.detectChanges();

            expect(component.initialize).toHaveBeenCalledTimes(1);
        });

        it('should emit scroll event', () => {
            fixture.detectChanges();

            fixture.nativeElement.querySelectorAll('*').forEach((e) => dispatchFakeEvent(e, 'scroll'));

            expect(component.scroll).toHaveBeenCalledTimes(1);
        });

        it('should emit update on options update', () => {
            fixture.detectChanges();

            component.options = KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG;
            fixture.detectChanges();

            expect(component.update).toHaveBeenCalledTimes(1);
        });
    });
});

@Component({
    imports: [
        KbqScrollbarModule
    ],
    template: `
        <div
            style="height: 300px; max-width: 200px; overflow: auto"
            kbq-scrollbar
            [options]="options"
            [events]="events"
            (onUpdate)="update()"
            (onInitialize)="initialize()"
            (onScroll)="scroll($event)"
        >
            <div style="width: 400px">
                Vivamus suscipit tortor eget felis porttitor volutpat. Vivamus magna justo, lacinia eget consectetur
                sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim. Pellentesque in
                ipsum id orci porta dapibus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Donec
                sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.
                Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Praesent sapien
                massa, convallis a pellentesque nec, egestas non nisi. Mauris blandit aliquet elit, eget tincidunt nibh
                pulvinar a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;
                Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Nulla porttitor accumsan
                tincidunt. Nulla quis lorem ut libero malesuada feugiat. Curabitur non nulla sit amet nisl tempus
                convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi.
                Pellentesque in ipsum id orci porta dapibus. Praesent sapien massa, convallis a pellentesque nec,
                egestas non nisi. Donec rutrum congue leo eget malesuada. Proin eget tortor risus. Lorem ipsum dolor sit
                amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Donec sollicitudin molestie malesuada. Pellentesque in ipsum id orci porta dapibus. Curabitur aliquet
                quam id dui posuere blandit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed porttitor lectus nibh. Donec sollicitudin molestie malesuada. Praesent sapien
                massa, convallis a pellentesque nec, egestas non nisi. Curabitur arcu erat, accumsan id imperdiet et,
                porttitor at sem. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vivamus suscipit tortor
                eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat. Curabitur aliquet quam id
                dui posuere blandit. Donec sollicitudin molestie malesuada. Quisque velit nisi, pretium ut lacinia in,
                elementum id enim. Donec sollicitudin molestie malesuada. Proin eget tortor risus. Vivamus magna justo,
                lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Cras
                ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit. Proin eget tortor risus. Proin eget tortor risus. Curabitur arcu
                erat, accumsan id imperdiet et, porttitor at sem. Vestibulum ante ipsum primis in faucibus orci luctus
                et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet
                ligula. Vivamus suscipit tortor eget felis porttitor volutpat. Vivamus magna justo, lacinia eget
                consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim.
                Pellentesque in ipsum id orci porta dapibus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at
                sem. Donec sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus convallis quis ac
                lectus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Mauris blandit aliquet elit, eget
                tincidunt nibh pulvinar a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
                cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Nulla
                porttitor accumsan tincidunt. Nulla quis lorem ut libero malesuada feugiat. Curabitur non nulla sit amet
                nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non
                nisi. Pellentesque in ipsum id orci porta dapibus. Praesent sapien massa, convallis a pellentesque nec,
                egestas non nisi. Donec rutrum congue leo eget malesuada. Proin eget tortor risus. Lorem ipsum dolor sit
                amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Donec sollicitudin molestie malesuada. Pellentesque in ipsum id orci porta dapibus. Curabitur aliquet
                quam id dui posuere blandit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed porttitor lectus nibh. Donec sollicitudin molestie malesuada. Praesent sapien
                massa, convallis a pellentesque nec, egestas non nisi. Curabitur arcu erat, accumsan id imperdiet et,
                porttitor at sem. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vivamus suscipit tortor
                eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat. Curabitur aliquet quam id
                dui posuere blandit. Donec sollicitudin molestie malesuada. Quisque velit nisi, pretium ut lacinia in,
                elementum id enim. Donec sollicitudin molestie malesuada. Proin eget tortor risus. Vivamus magna justo,
                lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Cras
                ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit. Proin eget tortor risus. Proin eget tortor risus. Curabitur arcu
                erat, accumsan id imperdiet et, porttitor at sem. Vestibulum ante ipsum primis in faucibus orci luctus
                et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet
                ligula. Vivamus suscipit tortor eget felis porttitor volutpat. Vivamus magna justo, lacinia eget
                consectetur sed, convallis at tellus. Quisque velit nisi, pretium ut lacinia in, elementum id enim.
                Pellentesque in ipsum id orci porta dapibus. Curabitur arcu erat, accumsan id imperdiet et, porttitor at
                sem. Donec sollicitudin molestie malesuada. Curabitur non nulla sit amet nisl tempus convallis quis ac
                lectus. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Mauris blandit aliquet elit, eget
                tincidunt nibh pulvinar a. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
                cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Nulla
                porttitor accumsan tincidunt. Nulla quis lorem ut libero malesuada feugiat. Curabitur non nulla sit amet
                nisl tempus convallis quis ac lectus. Praesent sapien massa, convallis a pellentesque nec, egestas non
                nisi. Pellentesque in ipsum id orci porta dapibus. Praesent sapien massa, convallis a pellentesque nec,
                egestas non nisi. Donec rutrum congue leo eget malesuada. Proin eget tortor risus. Lorem ipsum dolor sit
                amet, consectetur adipiscing elit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Donec sollicitudin molestie malesuada. Pellentesque in ipsum id orci porta dapibus. Curabitur aliquet
                quam id dui posuere blandit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui.
                Curabitur arcu erat, accumsan id imperdiet et, porttitor at sem. Lorem ipsum dolor sit amet, consectetur
                adipiscing elit. Sed porttitor lectus nibh. Donec sollicitudin molestie malesuada. Praesent sapien
                massa, convallis a pellentesque nec, egestas non nisi. Curabitur arcu erat, accumsan id imperdiet et,
                porttitor at sem. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Vivamus suscipit tortor
                eget felis porttitor volutpat. Nulla quis lorem ut libero malesuada feugiat. Curabitur aliquet quam id
                dui posuere blandit. Donec sollicitudin molestie malesuada. Quisque velit nisi, pretium ut lacinia in,
                elementum id enim. Donec sollicitudin molestie malesuada. Proin eget tortor risus. Vivamus magna justo,
                lacinia eget consectetur sed, convallis at tellus. Cras ultricies ligula sed magna dictum porta. Cras
                ultricies ligula sed magna dictum porta. Cras ultricies ligula sed magna dictum porta. Lorem ipsum dolor
                sit amet, consectetur adipiscing elit. Proin eget tortor risus. Proin eget tortor risus. Curabitur arcu
                erat, accumsan id imperdiet et, porttitor at sem. Vestibulum ante ipsum primis in faucibus orci luctus
                et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet
                ligula.
            </div>
        </div>
    `
})
class ScrollEventListener {
    options: KbqScrollbarOptions;
    events: KbqScrollbarEvents;

    @ViewChild(KbqScrollbar) scrollbar: KbqScrollbar;

    scroll = jest.fn();
    initialize = jest.fn();
    update = jest.fn();
}
