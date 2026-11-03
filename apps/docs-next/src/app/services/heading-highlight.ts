import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { filter } from 'rxjs/operators';

const CLASS_NAME = 'docs-next-heading_target';
const DURATION = 2000;
/** How long a quiet page has to be before a scroll counts as over, where `scrollend` is not there. */
const SCROLL_IDLE = 150;
/** How long after the article arrives the heading of the address is kept in view. */
const SETTLE_DURATION = 1500;
const INPUT_EVENTS = ['wheel', 'touchstart', 'keydown', 'mousedown'];

/**
 * Lights the heading a link has led to, for a moment. `:target` would do it for a link that was followed, but not for
 * the table of contents, which scrolls and writes the address itself, and not for a link copied from the icon.
 */
@Injectable({ providedIn: 'root' })
export class DocsNextHeadingHighlight {
    private readonly document = inject(DOCUMENT);
    private readonly window = inject(KBQ_WINDOW);

    private pendingId: string | null = this.fragmentOf(this.window.location.hash);
    private timer?: ReturnType<typeof setTimeout>;
    private settling: { id: string; until: number } | null = null;
    /** Cancels the wait of the call before, and the listening for the reader's own scroll. */
    private cancelScrollWait: (() => void) | null = null;
    private releaseInput: (() => void) | null = null;

    constructor() {
        // The article may still be loading when the address arrives, so the heading is lit once it is on the page.
        inject(Router)
            .events.pipe(filter((event) => event instanceof NavigationEnd))
            .subscribe(({ urlAfterRedirects }) => (this.pendingId = this.fragmentOf(urlAfterRedirects.split('#')[1])));
    }

    /**
     * Lights the heading once the page has got there: the fill would otherwise fade while the smooth scroll is still on
     * its way, and the reader would arrive at a heading that has already gone out.
     */
    highlightAfterScroll(id: string): void {
        const heading = this.document.getElementById(id);

        this.cancelScrollWait?.();

        if (!heading) return;

        const target = parseFloat(this.window.getComputedStyle(this.document.documentElement).scrollPaddingTop) || 0;

        // Nothing to scroll: the heading is there already, and no `scrollend` would come.
        if (Math.abs(heading.getBoundingClientRect().top - target) < 1) {
            this.highlight(id);

            return;
        }

        let idle: ReturnType<typeof setTimeout>;
        const cancel = (): void => {
            clearTimeout(idle);
            this.window.removeEventListener('scroll', wait);
            this.window.removeEventListener('scrollend', light);
            this.cancelScrollWait = null;
        };
        const light = (): void => {
            cancel();
            this.highlight(id);
        };
        // `scrollend` is the end of the scroll; a browser without it is judged by the scroll going quiet.
        const wait = (): void => {
            clearTimeout(idle);
            idle = setTimeout(light, SCROLL_IDLE);
        };

        this.cancelScrollWait = cancel;
        wait();
        this.window.addEventListener('scroll', wait, { passive: true });
        this.window.addEventListener('scrollend', light, { once: true });
    }

    highlight(id: string): void {
        const heading = this.document.getElementById(id);

        if (!heading) return;

        this.clear();
        // A reflow between the two class changes restarts the animation when the same heading is lit again.
        void heading.offsetWidth;
        heading.classList.add(CLASS_NAME);
        this.timer = setTimeout(() => heading.classList.remove(CLASS_NAME), DURATION);
    }

    /**
     * Lights the heading the address names, once, as soon as it exists, and keeps it in place while the article settles.
     * Called after the article renders and again after later changes to it. The router scrolls to a fragment before an
     * article that loads late is on the page, and code blocks that render afterwards move the heading, so the scroll is
     * repeated until the reader takes over.
     */
    flushPending(): void {
        const heading = this.pendingId && this.document.getElementById(this.pendingId);

        if (heading) {
            const id = this.pendingId!;

            this.pendingId = null;
            this.settling = { id, until: Date.now() + SETTLE_DURATION };
            this.stopOnInput();
            this.highlight(id);
        }

        if (!this.settling) return;

        if (Date.now() > this.settling.until) {
            this.settling = null;
            this.releaseInput?.();
        } else {
            this.document.getElementById(this.settling.id)?.scrollIntoView();
        }
    }

    /** Whether the address names a heading the page has yet to settle on, which scrolling must not overwrite. */
    isSettling(): boolean {
        // An address that names no heading of the page is nothing to settle on, and must not hold the address still.
        const pending = !!this.pendingId && !!this.document.getElementById(this.pendingId);

        return pending || (!!this.settling && Date.now() <= this.settling.until);
    }

    /** The reader's own scroll ends the repeating. */
    private stopOnInput(): void {
        this.releaseInput?.();

        const release = (): void => {
            for (const type of INPUT_EVENTS) this.window.removeEventListener(type, stop);

            this.releaseInput = null;
        };
        const stop = (): void => {
            this.settling = null;
            release();
        };

        this.releaseInput = release;

        for (const type of INPUT_EVENTS) this.window.addEventListener(type, stop, { passive: true });
    }

    private clear(): void {
        clearTimeout(this.timer);
        this.document.querySelector(`.${CLASS_NAME}`)?.classList.remove(CLASS_NAME);
    }

    private fragmentOf(hash: string | undefined): string | null {
        const id = hash?.replace(/^#/, '');

        try {
            return id ? decodeURIComponent(id) : null;
        } catch {
            // A truncated or mistyped address names no heading.
            return null;
        }
    }
}
