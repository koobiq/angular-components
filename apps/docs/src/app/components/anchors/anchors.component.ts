import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqTitleModule } from '@koobiq/components/title';
import { filter, fromEvent, Subscription, timer } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { DOCS_MARKDOWN_HEADING_CLASSES } from '../live-example/markdown-content';

interface KbqDocsAnchor {
    href: string;
    name: string;
    /** If the anchor is in view of the page */
    active: boolean;
    level: number;
    element: HTMLElement;
}

@Component({
    selector: 'docs-anchors',
    imports: [
        RouterLink,
        KbqTitleModule
    ],
    templateUrl: './anchors.component.html',
    styleUrls: ['./anchors.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-anchors'
    }
})
export class DocsAnchorsComponent implements OnDestroy, OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private ref = inject(ChangeDetectorRef);
    private document = inject<Document>(DOCUMENT);

    @Input() anchors: KbqDocsAnchor[] = [];
    @Input() headerSelectors: string;

    pathName: string;

    private readonly headerHeight: number = 64;

    private fragment = '';

    private readonly debounceTime = 15;

    private scrollSubscription: Subscription;
    private fragmentScrollSubscription: Subscription | undefined;
    private fragmentScrollTimer: ReturnType<typeof setTimeout> | undefined;

    // The scroll container lives outside this component's view, so it can be absent (e.g. on a page
    // that renders `docs-anchors` without a `docs-component-viewer` host). Return `null` and let
    // callers no-op rather than dereferencing a non-null assertion that can lie.
    private get scrollContainer(): HTMLElement | null {
        return this.document.querySelector('docs-component-viewer');
    }

    private get firstAnchor(): KbqDocsAnchor {
        return this.anchors[0];
    }

    private get lastAnchor(): KbqDocsAnchor {
        return this.anchors[this.anchors.length - 1];
    }

    private get scrollOffset(): number {
        return (this.scrollContainer?.scrollTop ?? 0) + this.headerHeight;
    }

    private readonly destroyRef = inject(DestroyRef);
    private readonly resizeObserver = inject(SharedResizeObserver);

    constructor() {
        const router = this.router;

        this.pathName = router.url.split('#')[0];

        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                const [rootUrl] = router.url.split('#');

                if (rootUrl !== this.pathName) {
                    this.pathName = rootUrl;
                }
            });
    }

    ngOnInit() {
        // attached to anchor's change in the address bar manually or by clicking on the anchor
        this.route.fragment
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((fragment) => (this.fragment = fragment || ''));
    }

    ngOnDestroy() {
        this.scrollSubscription?.unsubscribe();
        this.fragmentScrollSubscription?.unsubscribe();
        clearTimeout(this.fragmentScrollTimer);
    }

    getAnchorByHref(href: string): KbqDocsAnchor | null {
        return this.anchors.find((anchor) => anchor.href === href) || this.firstAnchor;
    }

    setScrollPosition(): void {
        this.anchors = this.createAnchors();

        this.updateActiveAnchor();

        const container = this.scrollContainer;

        if (!container) {
            this.ref.detectChanges();

            return;
        }

        const target = this.document.getElementById(this.fragment);

        if (target) {
            this.scrollToFragment(target);
        } else {
            // For SSR compatibility
            if (typeof container.scroll === 'function') container.scroll(0, 0);
        }

        this.scrollSubscription?.unsubscribe();

        // For SSR compatibility
        if (typeof container.scroll === 'function') {
            this.scrollSubscription = fromEvent(container, 'scroll')
                .pipe(debounceTime(this.debounceTime), takeUntilDestroyed(this.destroyRef))
                .subscribe(this.onScroll);
        }

        this.ref.detectChanges();
    }

    scrollIntoView(anchor: KbqDocsAnchor) {
        anchor.element.scrollIntoView({ behavior: 'smooth' });
    }

    private scrollToFragment(target: HTMLElement): void {
        clearTimeout(this.fragmentScrollTimer);
        this.fragmentScrollSubscription?.unsubscribe();

        this.fragmentScrollTimer = setTimeout(() => {
            target.scrollIntoView({ behavior: 'instant' });

            const container = this.scrollContainer;

            if (!container) {
                return;
            }

            // Guard against layout shifts caused by lazily-loaded example components:
            // re-scroll to target whenever the scroll container grows, for up to 2s.
            this.fragmentScrollSubscription = this.resizeObserver
                .observe(container)
                .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(timer(2000)))
                .subscribe(() => {
                    const distanceFromTop = target.getBoundingClientRect().top - container.getBoundingClientRect().top;

                    if (distanceFromTop > 10) {
                        target.scrollIntoView({ behavior: 'instant' });
                    }
                });
        });
    }

    private updateActiveAnchor() {
        let anchor = this.getAnchorByHref(this.fragment);

        if (!anchor) {
            return;
        }

        if (this.isScrolledToEnd()) {
            anchor = this.lastAnchor;
        }

        this.setActiveAnchor(anchor);
    }

    private isScrolledToEnd(): boolean {
        const container = this.scrollContainer;

        if (!container) {
            return false;
        }

        const scrollHeight = Math.ceil(container.scrollTop + container.clientHeight);

        // scrollHeight should be strictly equal to documentHeight, but in Edge it is slightly larger
        return scrollHeight >= container.scrollHeight;
    }

    private createAnchors(): KbqDocsAnchor[] {
        return Array.from(this.document.querySelectorAll<HTMLElement>(this.headerSelectors)).map(
            (header: HTMLElement, i: number): KbqDocsAnchor => ({
                href: header.id,
                name: header.innerText.trim(),
                active: i === 0,
                level: this.getLevel(header.classList),
                element: header
            })
        );
    }

    /** Returns the element's absolute scroll position within the scroll container. */
    private getHeaderTopOffset(header: HTMLElement): number {
        const container = this.scrollContainer;

        // For SSR compatibility / missing container
        if (!container || typeof container.getBoundingClientRect !== 'function') return 0;

        return container.scrollTop + header.getBoundingClientRect().top - container.getBoundingClientRect().top;
    }

    private getLevel(classList: DOMTokenList): number {
        const className = Array.from<string>(classList).find((name) => name.startsWith('kbq-markdown__')) || '';

        return DOCS_MARKDOWN_HEADING_CLASSES.indexOf(className);
    }

    private onScroll = () => {
        if (this.isScrolledToEnd() && this.lastAnchor) {
            this.setActiveAnchor(this.lastAnchor);

            return;
        }

        this.anchors.forEach((anchor, i, anchors) => {
            if (this.isLinkActive(anchor, anchors[i + 1])) {
                this.setActiveAnchor(anchor);
            }
        });
    };

    private isLinkActive(current: KbqDocsAnchor, next?: KbqDocsAnchor): boolean {
        const currentTop = this.getHeaderTopOffset(current.element);
        const nextTop = next ? this.getHeaderTopOffset(next.element) : Infinity;

        return this.scrollOffset >= currentTop && !(nextTop < this.scrollOffset);
    }

    private setActiveAnchor(anchor: KbqDocsAnchor) {
        this.anchors.forEach((item) => (item.active = false));

        anchor.active = true;

        this.ref.detectChanges();
    }

    protected readonly popUpPlacements = PopUpPlacements;
}
