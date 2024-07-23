import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { BrowserTestingModule } from '@angular/platform-browser/testing';
import { dispatchFakeEvent } from '@koobiq/cdk/testing';
import { KbqScrollbar } from './scrollbar.component';
import { KbqScrollbarModule } from './scrollbar.module';
import {
    KBQ_SCROLLBAR_CONFIG,
    KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG,
    KbqScrollbarEvents,
    KbqScrollbarOptions
} from './scrollbar.types';

export const configureTestingModule = (declarations?: any[]) => {
    TestBed.configureTestingModule({
        imports: [KbqScrollbarModule, BrowserTestingModule],
        declarations,
        providers: [
            {
                provide: KBQ_SCROLLBAR_CONFIG,
                useValue: null
            }
        ]
    }).compileComponents();
};

describe('KbqScrollbar', () => {
    describe('core', () => {
        let component: KbqScrollbar;
        let fixture: ComponentFixture<KbqScrollbar>;

        beforeEach(waitForAsync(() => configureTestingModule([KbqScrollbar])));

        beforeEach(() => {
            fixture = TestBed.createComponent(KbqScrollbar);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should create the component', () => {
            expect(component).toBeTruthy();
        });

        it('should set options', () => {
            component.options = { scrollbars: { autoHide: 'never' } };
            expect(component.options).toEqual((component as any).options);
        });

        it('should set events', () => {
            component.events = { initialized: () => {} };
            expect(component.events).toEqual((component as any).events);
        });

        it('should initialize OverlayScrollbars on ngAfterViewInit', () => {
            spyOn((component as any).ngZone, 'runOutsideAngular');
            component.ngAfterViewInit();
            expect((component as any).ngZone.runOutsideAngular).toHaveBeenCalled();
            expect((component as any).kbqScrollbarDirective.scrollbarInstance).toBeDefined();
        });

        it('should destroy scrollbar instance on component destroy', () => {
            const instance = (component as any).kbqScrollbarDirective.scrollbarInstance;
            expect(instance?.state().destroyed).toBeFalse();

            fixture.destroy();

            expect(instance?.state().destroyed).toBeTrue();
        });
    });

    describe('with event listeners', () => {
        let component: ScrollEventListener;
        let fixture: ComponentFixture<ScrollEventListener>;

        beforeEach(waitForAsync(() => configureTestingModule([ScrollEventListener])));

        beforeEach(() => {
            fixture = TestBed.createComponent(ScrollEventListener);
            component = fixture.componentInstance;
        });

        it('should emit initialize event', () => {
            spyOn(component, 'initialize');
            fixture.detectChanges();

            expect(component.initialize).toHaveBeenCalledTimes(1);
        });

        it('should emit scroll event', () => {
            fixture.detectChanges();
            spyOn(component, 'scroll');

            fixture.nativeElement.querySelectorAll('*').forEach((e) => dispatchFakeEvent(e, 'scroll'));

            expect(component.scroll).toHaveBeenCalled();
        });

        it('should emit update on options update', () => {
            spyOn(component, 'update');
            fixture.detectChanges();

            component.options = KBQ_SCROLLBAR_OPTIONS_DEFAULT_CONFIG;
            fixture.detectChanges();

            expect(component.update).toHaveBeenCalledTimes(2);
        });
    });
});

@Component({
    template: `
        <div
            [options]="options"
            [events]="events"
            (onUpdate)="update()"
            (onInitialize)="initialize()"
            (onScroll)="scroll($event)"
            style="height: 300px; max-width: 200px; overflow: auto"
            kbq-scrollbar
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

    scroll(event) {
        console.info(event);
    }

    initialize() {}

    update() {}
}
