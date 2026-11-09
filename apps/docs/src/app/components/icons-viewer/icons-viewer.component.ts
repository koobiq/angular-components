import { AsyncPipe, Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    ElementRef,
    inject,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { auditTime, BehaviorSubject, combineLatest, distinctUntilChanged, map, startWith } from 'rxjs';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalService } from '@koobiq/components/modal';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import type { KbqIconsMetadata } from '@koobiq/icons/types/icons';
import { type DocsIconItem, DocsIconItems } from 'src/app/services/icon-items';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocStates } from '../../services/doc-states';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';
import {
    DocsIconPreviewModalComponent,
    type DocsIconPreviewModalData
} from './icon-preview-modal/icon-preview-modal.component';

const SEARCH_DEBOUNCE_TIME = 300;

@Component({
    selector: 'docs-icons-viewer',
    imports: [
        AsyncPipe,
        KbqFormFieldModule,
        KbqInputModule,
        DocsRegisterHeaderDirective,
        KbqIconModule,
        ReactiveFormsModule,
        KbqHighlightModule,
        KbqEmptyStateModule,
        KbqToolTipModule,
        KbqCheckboxModule
    ],
    templateUrl: './icons-viewer.template.html',
    styleUrls: ['./icons-viewer.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-icons-viewer',
        '[attr.data-docsearch-lvl0]': "t('iconsTitle')"
    },
    hostDirectives: [KbqScrollbarViewport]
})
export class DocsIconsViewerComponent extends DocsLocaleState {
    private readonly http = inject(HttpClient);
    private readonly modalService = inject(KbqModalService);
    private readonly activeRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly docStates = inject(DocsDocStates);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);

    searchControl = new FormControl<string>('');
    accentColorFilterControl = new FormControl<boolean>(false, { nonNullable: true });
    filteredIcons = new BehaviorSubject<DocsIconItem[] | undefined>([]);

    availableSizes: number[] = [];

    private searchQuery: string | null = null;

    constructor() {
        super();

        this.http
            .get<KbqIconsMetadata>('assets/SVGIcons/kbq-icons-info.json', { responseType: 'json' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
                const iconItems = new DocsIconItems(data);

                this.availableSizes = Array.from(iconItems.sizes).sort((a, b) => a - b);

                this.init(iconItems);

                this.changeDetectorRef.markForCheck();
            });

        // `Location` is a root/app-scoped service, so this popstate handler outlives the
        // component unless it is torn down explicitly.
        const locationSubscription = this.location.subscribe(() => this.modalService.closeAll());

        this.destroyRef.onDestroy(() => locationSubscription.unsubscribe());

        this.activeRoute.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
            this.searchQuery = params.get('s');
            this.searchControl.setValue(this.searchQuery);
        });

        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }

    init(iconItems: DocsIconItems) {
        combineLatest([
            this.searchControl.valueChanges.pipe(auditTime(SEARCH_DEBOUNCE_TIME), distinctUntilChanged()),
            this.accentColorFilterControl.valueChanges.pipe(startWith(this.accentColorFilterControl.value))
        ])
            .pipe(
                map(([value, accentColorOnly]) => {
                    this.syncSearchQuery(value);

                    const lowered = value?.toLowerCase() || '';

                    const items = iconItems.getItems().filter((item) => {
                        if (accentColorOnly && !item.hasAccentColor) {
                            return false;
                        }

                        return (
                            !lowered ||
                            item.name.toLowerCase().includes(lowered) ||
                            item.cssClass.toLowerCase().includes(lowered) ||
                            (Array.isArray(item.tags) && item.tags.some((tag) => tag.toLowerCase().includes(lowered)))
                        );
                    });

                    return items.length ? items : undefined;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((filteredItems) => this.filteredIcons.next(filteredItems));

        this.activeRoute.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
            const id = params.get('id');

            if (id) {
                const iconItem = iconItems.getItemById(id);

                if (iconItem) {
                    this.openIconPreview(iconItem);
                } else {
                    this.setActiveIcon(undefined);
                }

                return;
            }

            this.searchControl.setValue(params.get('s'));
        });
    }

    filterBySize(icons: DocsIconItem[], size: number): DocsIconItem[] {
        return icons.filter((iconItem: DocsIconItem) => iconItem.size === size);
    }

    setActiveIcon(iconItem: DocsIconItem | undefined): void {
        this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: {
                id: iconItem?.id,
                s: this.searchControl.value ? this.searchControl.value : undefined
            }
        });
    }

    openIconPreview(iconItem: DocsIconItem): void {
        this.modalService
            .open({
                kbqComponent: DocsIconPreviewModalComponent,
                data: { iconItem } satisfies DocsIconPreviewModalData,
                kbqClassName: 'docs-icon-preview-modal',
                kbqMaskClosable: true,
                kbqWidth: 400
            })
            .afterClose.subscribe((result) => {
                if (typeof result === 'string') {
                    this.searchControl.setValue(result);
                }

                this.setActiveIcon(undefined);
            });
    }

    private syncSearchQuery(value: string | null) {
        if (value === this.searchQuery) {
            return;
        }

        // Typing is not navigation: without `replaceUrl` every debounced keystroke pushes a history
        // entry, so "Back" walks the query letter by letter instead of leaving the page.
        this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: { s: value || undefined },
            queryParamsHandling: 'merge',
            replaceUrl: true
        });
    }
}
