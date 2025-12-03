import { AsyncPipe, Location, NgClass } from '@angular/common';
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
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { KbqHighlightModule, ThemePalette } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { auditTime, BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { DocsIconItem, DocsIconItems } from 'src/app/services/icon-items';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocStates } from '../../services/doc-states';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';
import { DocsIconPreviewModalComponent } from './icon-preview-modal/icon-preview-modal.component';

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
        NgClass,
        KbqToolTipModule,
        // Prevents: "NullInjectorError: No provider for KbqModalService!"
        KbqModalModule
    ],
    templateUrl: './icons-viewer.template.html',
    styleUrls: ['./icons-viewer.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'docs-icons-viewer kbq-scrollbar'
    }
})
export class DocsIconsViewerComponent extends DocsLocaleState {
    private readonly http = inject(HttpClient);
    private readonly modalService = inject(KbqModalService);
    private readonly activeRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    private readonly titleService = inject(Title);
    private readonly docStates = inject(DocsDocStates);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly destroyRef = inject(DestroyRef);

    readonly themePalette = ThemePalette;

    searchControl = new FormControl<string>('');
    filteredIcons = new BehaviorSubject<DocsIconItem[]>([]);

    availableSizes: number[];

    private iconItems: DocsIconItems;
    private queryParamMap: Params;

    constructor() {
        super();

        this.http.get('assets/SVGIcons/kbq-icons-info.json', { responseType: 'json' }).subscribe((data) => {
            this.iconItems = new DocsIconItems(data);

            this.availableSizes = Array.from(this.iconItems.sizes).sort((a, b) => a - b);

            this.init();
            this.refreshTitle(undefined);

            this.changeDetectorRef.markForCheck();
        });

        this.location.subscribe(() => this.modalService.closeAll());

        this.activeRoute.queryParamMap.pipe(takeUntilDestroyed()).subscribe(({ params }: Params) => {
            this.searchControl.setValue(params.s);
            this.queryParamMap = params;
        });

        this.docStates.registerHeaderScrollContainer(this.elementRef.nativeElement);
    }

    init() {
        this.searchControl.valueChanges
            .pipe(
                auditTime(SEARCH_DEBOUNCE_TIME),
                distinctUntilChanged(),
                map((value) => {
                    this.syncSearchQuery(value!);

                    if (!value) {
                        return this.iconItems.getItems();
                    }

                    const lowered = value?.toLowerCase() || '';

                    const items = this.iconItems
                        .getItems()
                        .filter(
                            (item) =>
                                item.name.toLowerCase().includes(lowered) ||
                                item.cssClass.toLowerCase().includes(lowered) ||
                                (Array.isArray(item.tags) &&
                                    item.tags.some((tag) => tag.toLowerCase().includes(lowered)))
                        );

                    return items.length ? items : undefined;
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((filteredItems) => this.filteredIcons.next(filteredItems!));

        this.activeRoute.queryParams.subscribe((params) => {
            if (params.id) {
                const iconItem = this.iconItems.getItemById(params.id);

                if (iconItem) {
                    this.openIconPreview(iconItem);
                } else {
                    this.setActiveIcon(undefined);
                }

                return;
            }

            this.searchControl.setValue(params.s);
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

        this.refreshTitle(iconItem);
    }

    openIconPreview(iconItem: DocsIconItem): void {
        this.modalService
            .open({
                kbqComponent: DocsIconPreviewModalComponent,
                kbqComponentParams: { iconItem },
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

    private syncSearchQuery(value: string) {
        if (value === this.queryParamMap.s) {
            return;
        }

        this.router.navigate([], {
            relativeTo: this.activeRoute,
            queryParams: { s: value || undefined },
            queryParamsHandling: 'merge'
        });
    }

    private refreshTitle(activeIcon: DocsIconItem | undefined): void {
        this.titleService.setTitle(`${activeIcon ? `${activeIcon.name} \u00B7 ` : ''} Icon \u00B7 Mosaic`);
    }
}
