import { DOCUMENT, NgClass } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
    Inject,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { KBQ_WINDOW, PopUpPlacements } from '@koobiq/components/core';
import { KbqTitleModule } from '@koobiq/components/title';
import { filter, fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

interface KbqDocsAnchor {
    href: string;
    name: string;
    /* If the anchor is in view of the page */
    active: boolean;
    /* top offset px of the anchor */
    top: number;
    level: number;
    element: HTMLElement;
}

const NEXT_ROUTE_KEY = 'KBQ_nextRoute';

@Component({
    standalone: true,
    imports: [
        RouterLink,
        NgClass,
        KbqTitleModule
    ],
    selector: 'docs-anchors',
    templateUrl: './anchors.component.html',
    styleUrls: ['./anchors.component.scss'],
    host: {
        class: 'docs-anchors'
    },
    encapsulation: ViewEncapsulation.None
})
export class DocsAnchorsComponent implements OnDestroy, OnInit {
    @Input() anchors: KbqDocsAnchor[] = [];
    @Input() headerSelectors: string;

    // If smooth scroll is supported bigger debounce time is needed to avoid active anchor's hitch
    readonly isSmoothScrollSupported;

    pathName: string;

    private headerHeight: number = 64;

    private fragment = '';

    // coef for calculating the distance between anchor and header when scrolling (== headerHeight * anchorHeaderCoef)
    private anchorHeaderCoef: number = 2;

    private noSmoothScrollDebounce = 10;
    private debounceTime = 15;

    private scrollSubscription: Subscription;

    private get scrollContainer(): HTMLElement {
        return this.document.querySelector('docs-component-viewer')!;
    }

    private get firstAnchor(): KbqDocsAnchor {
        return this.anchors[0];
    }

    private get lastAnchor(): KbqDocsAnchor {
        return this.anchors[this.anchors.length - 1];
    }

    private get scrollOffset(): number {
        return this.scrollContainer.scrollTop + this.headerHeight * this.anchorHeaderCoef;
    }

    private readonly destroyRef = inject(DestroyRef);
    private readonly window = inject(KBQ_WINDOW);

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private ref: ChangeDetectorRef,
        @Inject(DOCUMENT) private document: Document
    ) {
        this.isSmoothScrollSupported = 'scrollBehavior' in this.scrollContainer.style;

        if (!this.isSmoothScrollSupported) {
            this.debounceTime = this.noSmoothScrollDebounce;
        }

        this.pathName = router.url.split('#')[0];
        this.window.localStorage.setItem(NEXT_ROUTE_KEY, this.pathName);

        this.router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                const [rootUrl] = router.url.split('#');

                if (rootUrl !== this.pathName) {
                    this.window.localStorage.setItem(NEXT_ROUTE_KEY, rootUrl);

                    this.pathName = rootUrl;
                }

                this.ref.detectChanges();
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
    }

    getAnchorByHref(href: string): KbqDocsAnchor | null {
        return this.anchors.find((anchor) => anchor.href === href) || this.firstAnchor;
    }

    setScrollPosition(): void {
        this.anchors = this.createAnchors();

        this.updateActiveAnchor();

        const target = this.document.getElementById(this.fragment);

        if (target) {
            target.scrollTop += this.headerHeight;
            // scroll after docs-sidepanel scrolled
            setTimeout(() => target.scrollIntoView());
        } else {
            // For SSR compatibility
            if (typeof this.scrollContainer.scroll === 'function') this.scrollContainer.scroll(0, 0);
        }

        this.scrollSubscription?.unsubscribe();

        // For SSR compatibility
        if (typeof this.scrollContainer.scroll === 'function') {
            this.scrollSubscription = fromEvent(this.scrollContainer, 'scroll')
                .pipe(debounceTime(this.debounceTime), takeUntilDestroyed(this.destroyRef))
                .subscribe(this.onScroll);
        }
    }

    /* TODO Техдолг: при изменении ширины экрана должен переопределяться параметр top
     *   делать это по window:resize нельзя, т.к. изменение ширины контента страницы происходит после window:resize */
    onResize() {
        const headers = Array.from(this.document.querySelectorAll(this.headerSelectors));

        for (let i = 0; i < this.anchors.length; i++) {
            const { top } = headers[i].getBoundingClientRect();

            this.anchors[i].top = top;
        }

        this.ref.detectChanges();
    }

    scrollIntoView(anchor: KbqDocsAnchor) {
        setTimeout(() => anchor.element.scrollIntoView());
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
        const scrollHeight = Math.ceil(this.scrollContainer.scrollTop + this.scrollContainer.clientHeight);

        // scrollHeight should be strictly equal to documentHeight, but in Edge it is slightly larger
        return scrollHeight >= this.scrollContainer.scrollHeight;
    }

    private createAnchors(): KbqDocsAnchor[] {
        return Array.from(this.document.querySelectorAll<HTMLElement>(this.headerSelectors)).map(
            (header: HTMLElement, i: number): KbqDocsAnchor => {
                return {
                    href: header ? `${header.id}` : '',
                    name: header.innerText.trim(),
                    top: this.getHeaderTopOffset(header),
                    active: i === 0,
                    level: this.getLevel(header.classList),
                    element: header
                };
            }
        );
    }

    private getHeaderTopOffset(header: HTMLElement): number {
        // For SSR compatibility
        if (typeof this.document.body.getBoundingClientRect !== 'function') return 0;

        return (
            this.scrollContainer.scrollTop +
            header.getBoundingClientRect().top -
            this.document.body.getBoundingClientRect().top +
            this.headerHeight
        );
    }

    private getLevel(classList): number {
        const className = Array.from<string>(classList).find((name) => name.startsWith('kbq-markdown__')) || '';

        return [
            'kbq-markdown__h3',
            'kbq-markdown__h4',
            'kbq-markdown__h5'
        ].indexOf(className);
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

    private isLinkActive(currentLink, nextLink): boolean {
        // A link is active if the scroll position is lower than the anchor position + headerHeight*anchorHeaderCoef
        // and above the next anchor
        return this.scrollOffset >= currentLink.top && !(nextLink?.top < this.scrollOffset);
    }

    private setActiveAnchor(anchor: KbqDocsAnchor) {
        this.anchors.forEach((item) => (item.active = false));

        anchor.active = true;

        this.ref.detectChanges();
    }

    protected readonly popUpPlacements = PopUpPlacements;
}
