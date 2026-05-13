import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    Input,
    OnChanges,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_FORM_FIELD_REF, KbqColorDirective } from '@koobiq/components/core';
import { EMPTY, ReplaySubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KbqIconRegistry } from './icon-registry';

@Component({
    selector: '[kbq-icon]',
    template: '<ng-content />',
    styleUrls: ['icon.scss', 'icon-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq kbq-icon',
        '[class]': 'svgIcon ? null : iconName',
        '[class.kbq-error]': 'color === "error" || hasError'
    }
})
export class KbqIcon extends KbqColorDirective implements AfterContentInit, OnChanges {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true });
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);
    protected readonly registry = inject(KbqIconRegistry, { optional: true });
    protected readonly destroyRef = inject(DestroyRef);

    @Input() small = false;
    @Input() autoColor = false;

    hasError: boolean = false;

    /** Name of an icon within a @koobiq/icons. Accepts "namespace:name" syntax. */
    @Input({ alias: 'kbq-icon' }) iconName: string;

    protected name = 'KbqIcon';

    /**
     * True when icon is being rendered as inline SVG.
     * @docs-private
     */
    protected svgIcon = false;

    /** @docs-private */
    protected readonly svgIconName = new ReplaySubject<string | undefined>(1);

    getHostElement() {
        return this.elementRef.nativeElement;
    }

    updateMaxHeight() {
        if (this.name !== 'KbqIcon') {
            return;
        }

        const size = this.parseIconSize();

        if (size) {
            this.getHostElement().style.maxHeight = `${size}px`;
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.iconName) {
            this.svgIconName.next(changes['iconName'].currentValue);
        }
    }

    ngAfterContentInit(): void {
        if (this.autoColor) {
            this.formField?.control?.stateChanges.subscribe(this.updateState);
            this.updateState();
        }

        this.updateMaxHeight();

        this.svgIconName
            .pipe(
                switchMap((name) => {
                    if (!this.registry || !name) {
                        this.svgIcon = false;

                        return EMPTY;
                    }

                    return this.registry.getNamedSvgIcon(name);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (svg) => {
                    this.svgIcon = true;
                    const host = this.getHostElement();

                    // Remove any previously injected SVG.
                    const existing = host.querySelector('svg');

                    if (existing) {
                        host.removeChild(existing);
                    }

                    const size = this.parseIconSize();

                    if (size) {
                        svg.setAttribute('width', `${size}`);
                        svg.setAttribute('height', `${size}`);
                    }

                    host.insertBefore(svg, host.firstChild);
                    this.changeDetectorRef.markForCheck();
                },
                error: () => {
                    // Icon not registered — fall through to font-class path.
                    this.svgIcon = false;
                    this.updateMaxHeight();
                    this.changeDetectorRef.markForCheck();
                }
            });
    }

    private updateState = () => {
        this.hasError = this.formField?.control?.errorState;

        this.changeDetectorRef.markForCheck();
    };

    private parseIconSize(): number {
        const baseName = this.iconName?.includes(':') ? this.iconName.split(':')[1] : this.iconName;

        return parseInt(baseName?.split('_').pop() ?? '');
    }
}
