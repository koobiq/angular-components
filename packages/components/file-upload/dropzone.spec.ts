import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Provider, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_ANIMATIONS_CONFIG } from '@koobiq/components/core';
import { KbqFullScreenDropzoneService, KbqLocalDropzone } from './dropzone';

@Component({
    selector: 'test-local-dropzone',
    imports: [KbqLocalDropzone],
    template: `
        <div kbqLocalDropzone></div>
    `
})
class LocalDropzone {
    readonly dropzone = viewChild.required(KbqLocalDropzone);
}

const animationsDisabled: Provider = { provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } };

/** Opens the overlay and waits for the timer that fades it in. */
const openPane = async (open: () => void): Promise<HTMLElement> => {
    open();

    await new Promise((resolve) => setTimeout(resolve));

    const pane: HTMLElement = TestBed.inject(OverlayContainer)
        .getContainerElement()
        .querySelector('.kbq-dropzone-overlay')!;

    expect(pane.classList).toContain('kbq-dropzone-overlay__attached');

    return pane;
};

describe(KbqLocalDropzone.name, () => {
    const openLocal = (providers: Provider[] = []): Promise<HTMLElement> => {
        TestBed.configureTestingModule({ providers });

        const fixture = TestBed.createComponent(LocalDropzone);

        fixture.detectChanges();

        return openPane(() => fixture.componentInstance.dropzone().open());
    };

    it('should fade the overlay in by default', async () => {
        expect((await openLocal()).classList).not.toContain('kbq-animations-disabled');
    });

    it('should show the overlay without fading in when animations are disabled', async () => {
        expect((await openLocal([animationsDisabled])).classList).toContain('kbq-animations-disabled');
    });
});

describe(KbqFullScreenDropzoneService.name, () => {
    const openFullScreen = (providers: Provider[] = []): Promise<HTMLElement> => {
        TestBed.configureTestingModule({ providers });

        return openPane(() => TestBed.inject(KbqFullScreenDropzoneService).open());
    };

    it('should fade the overlay in by default', async () => {
        expect((await openFullScreen()).classList).not.toContain('kbq-animations-disabled');
    });

    it('should show the overlay without fading in when animations are disabled', async () => {
        expect((await openFullScreen([animationsDisabled])).classList).toContain('kbq-animations-disabled');
    });
});
