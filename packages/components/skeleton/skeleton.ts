import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import {
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    Directive,
    inject,
    Injectable,
    InjectionToken,
    input,
    NgZone,
    numberAttribute,
    type Provider,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_WINDOW, kbqAnimationsDisabled, kbqInjectNativeElement } from '@koobiq/components/core';

const WAVE_ANIMATION_NAME = 'kbq-skeleton-wave';
const OFFSCREEN_SELECTOR = 'kbq-skeleton_offscreen';

const findWave = (host: HTMLElement): Animation | undefined =>
    host
        .getAnimations()
        .find((animation) => 'animationName' in animation && animation.animationName === WAVE_ANIMATION_NAME);

/**
 * Component used to load the styles of `.kbq-skeleton` and of the presets, each of which renders a `.kbq-skeleton`.
 */
@Component({
    selector: 'skeleton-style-loader',
    template: '',
    styleUrls: ['./skeleton.scss', './skeleton-presets.scss', './skeleton-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
class SkeletonStyleLoader {}

/**
 * The single wave shared by every skeleton on the page. Hosts outside the viewport stop animating, the ones that
 * animate are pinned to one start time, and their offsets are measured in one batch per frame.
 *
 * Everything here runs outside Angular: none of it changes a binding, and a wave pass must not start change
 * detection once per skeleton.
 */
@Injectable({ providedIn: 'root' })
class SkeletonWave {
    // Widened because TypeScript declares the observer constructors on `globalThis` rather than on `Window`.
    private readonly window = inject(KBQ_WINDOW) as Window & typeof globalThis;
    private readonly ngZone = inject(NgZone);

    private readonly observer = this.createObserver();
    private readonly hosts = new Set<Element>();

    /** Hosts waiting to be measured, with whether their wave has just started and needs to be pinned. */
    private readonly pending = new Map<HTMLElement, boolean>();
    private frame: number | null = null;
    private startTime: CSSNumberish | null = null;

    /** Adds a host to the wave and returns the function that removes it. */
    add(host: HTMLElement): () => void {
        const onAnimationEvent = ({ target, type, animationName }: AnimationEvent) => {
            if (target === host && animationName === WAVE_ANIMATION_NAME)
                this.schedule(host, type === 'animationstart');
        };

        this.hosts.add(host);
        this.ngZone.runOutsideAngular(() => {
            host.addEventListener('animationstart', onAnimationEvent);
            host.addEventListener('animationiteration', onAnimationEvent);
        });
        this.observer?.observe(host);

        return () => {
            this.hosts.delete(host);
            host.removeEventListener('animationstart', onAnimationEvent);
            host.removeEventListener('animationiteration', onAnimationEvent);
            this.observer?.unobserve(host);
            host.classList.remove(OFFSCREEN_SELECTOR);
            host.style.removeProperty('--kbq-skeleton-offset');
            this.pending.delete(host);

            if (!this.hosts.size) {
                this.startTime = null;
            }
        };
    }

    private createObserver(): IntersectionObserver | null {
        const view = this.window;

        // Missing on the server and in jsdom: the wave then simply runs on every host.
        if (typeof view.IntersectionObserver !== 'function') return null;

        // The margin starts the wave just before a host scrolls in.
        return this.ngZone.runOutsideAngular(
            () =>
                new view.IntersectionObserver(
                    (entries) => {
                        for (const { target, isIntersecting } of entries) {
                            // Entries queued before `unobserve` are still delivered, for hosts that have left.
                            if (this.hosts.has(target)) {
                                target.classList.toggle(OFFSCREEN_SELECTOR, !isIntersecting);
                            }
                        }
                    },
                    { rootMargin: '100px' }
                )
        );
    }

    private schedule(host: HTMLElement, sync: boolean): void {
        this.pending.set(host, sync || !!this.pending.get(host));
        this.frame ??= this.window.requestAnimationFrame(() => this.flush());
    }

    // Every host is read before any is written: a whole row of skeletons then costs one style and layout flush
    // instead of one per host.
    private flush(): void {
        const hosts = [...this.pending].map(([host, sync]) => ({
            host,
            offset: `${host.getBoundingClientRect().left}px`,
            wave: sync ? findWave(host) : undefined
        }));

        this.pending.clear();
        this.frame = null;

        for (const { host, offset, wave } of hosts) {
            if (wave) {
                this.startTime ??= wave.startTime;

                // Still unresolved on a wave that has not started yet: setting it would pause the wave.
                if (this.startTime !== null) {
                    wave.startTime = this.startTime;
                }
            }

            // Writing an unchanged offset back would invalidate the host's style for nothing.
            if (host.style.getPropertyValue('--kbq-skeleton-offset') !== offset) {
                host.style.setProperty('--kbq-skeleton-offset', offset);
            }
        }
    }
}

/** Default options of every skeleton in an application or a part of it. */
export type KbqSkeletonOptions = {
    /**
     * Default of the `animationDuration` input of `kbq-skeleton` and `kbqSkeleton`, in milliseconds. Defaults to
     * `1200`.
     */
    animationDuration: number;
};

const KBQ_SKELETON_DEFAULT_OPTIONS: KbqSkeletonOptions = {
    animationDuration: 1200
};

/**
 * Default options of the skeletons, which `kbqSkeletonOptionsProvider` provides.
 *
 * @docs-private
 */
export const KBQ_SKELETON_OPTIONS = new InjectionToken<KbqSkeletonOptions>('KBQ_SKELETON_OPTIONS', {
    factory: () => KBQ_SKELETON_DEFAULT_OPTIONS
});

/**
 * Utility provider for the default options of the skeletons, for an application or a part of it. The keys it
 * leaves out keep the values of the closest provider above.
 */
export const kbqSkeletonOptionsProvider = (options: Partial<KbqSkeletonOptions>): Provider => ({
    provide: KBQ_SKELETON_OPTIONS,
    useFactory: (): KbqSkeletonOptions => ({
        ...KBQ_SKELETON_DEFAULT_OPTIONS,
        ...inject(KBQ_SKELETON_OPTIONS, { skipSelf: true, optional: true }),
        ...options
    })
});

/**
 * Directive representing a skeleton placeholder.
 *
 * Paints the host, children included, as one flat shape of the host's own outline with a wave running across it,
 * and makes the host inert: it leaves the tab order and the accessibility tree until the skeleton is disabled.
 */
@Directive({
    selector: 'kbq-skeleton, [kbqSkeleton]',
    host: {
        class: 'kbq-skeleton',
        '[class.kbq-skeleton_disabled]': '!enabled()',
        '[class.kbq-animations-disabled]': 'animationsDisabled',
        '[attr.inert]': 'enabled() || null',
        '[style.--kbq-skeleton-animation-duration.ms]': 'enabled() ? animationDuration() : null'
    },
    exportAs: 'kbqSkeleton'
})
export class KbqSkeleton {
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);
    private readonly element = kbqInjectNativeElement();
    private readonly wave = inject(SkeletonWave);
    private readonly options = inject(KBQ_SKELETON_OPTIONS);

    /** Whether the skeleton is enabled. */
    readonly enabled = input(true, { transform: booleanAttribute, alias: 'kbqSkeleton' });

    /**
     * Duration of one pass of the wave, in milliseconds: the longer it is, the slower the wave. A value that is not
     * a number keeps the default. Defaults to `animationDuration` of `kbqSkeletonOptionsProvider`, `1200`.
     */
    readonly animationDuration = input(this.options.animationDuration, {
        transform: (value: number | string | null | undefined): number =>
            numberAttribute(value, this.options.animationDuration)
    });

    /**
     * Whether the fill stands still, without the wave.
     *
     * @docs-private
     */
    protected readonly animationsDisabled = kbqAnimationsDisabled();

    constructor() {
        this.styleLoader.load(SkeletonStyleLoader);

        afterRenderEffect((onCleanup) => {
            if (this.enabled()) {
                onCleanup(this.wave.add(this.element));
            }
        });
    }
}
