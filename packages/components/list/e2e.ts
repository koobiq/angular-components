import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule, KbqListSelectionDroppedEvent } from '@koobiq/components/list';

@Component({
    selector: 'e2e-list-states',
    imports: [KbqListModule, KbqIconModule, KbqBadgeModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="width: 400px">
            <kbq-list-selection class="cdk-keyboard-focused">
                <kbq-list-option>Normal</kbq-list-option>
                <kbq-list-option class="kbq-hovered">Hovered</kbq-list-option>
                <kbq-list-option class="kbq-active">Active</kbq-list-option>
                <kbq-list-option class="kbq-focused">Focused</kbq-list-option>
                <kbq-list-option class="kbq-selected">Selected</kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-hovered">Selected + Hover</kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-active">Selected + Active</kbq-list-option>
                <kbq-list-option class="kbq-disabled">Disabled</kbq-list-option>
            </kbq-list-selection>

            <br />

            <kbq-list-selection class="cdk-keyboard-focused" multiple="keyboard">
                <kbq-list-option>Normal</kbq-list-option>
                <kbq-list-option class="kbq-hovered">Hovered</kbq-list-option>
                <kbq-list-option class="kbq-active">Active</kbq-list-option>
                <kbq-list-option class="kbq-focused">Focused</kbq-list-option>
                <kbq-list-option class="kbq-selected">Selected</kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-hovered">Selected + Hover</kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-active">Selected + Active</kbq-list-option>
                <kbq-list-option class="kbq-disabled">Disabled</kbq-list-option>
            </kbq-list-selection>

            <br />

            <kbq-list-selection class="cdk-keyboard-focused" multiple="checkbox">
                <kbq-list-option>Normal</kbq-list-option>
                <kbq-list-option class="kbq-hovered">Hovered</kbq-list-option>
                <kbq-list-option class="kbq-active">Active</kbq-list-option>
                <kbq-list-option class="kbq-focused">Focused</kbq-list-option>
                <kbq-list-option class="kbq-selected">Selected</kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-hovered">Selected + Hover</kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-active">Selected + Active</kbq-list-option>
                <kbq-list-option class="kbq-disabled">Disabled</kbq-list-option>
            </kbq-list-selection>

            <br />

            <kbq-list-selection class="cdk-keyboard-focused">
                <kbq-list-option>
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        Normal
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-hovered">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        hovered
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-hovered">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">hovered</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-active">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        active
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-focused">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        focused
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-focused">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">focused</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-selected">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        selected
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-hovered">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">selected + hovered</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-focused">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">selected + focused</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-disabled">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        disabled
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
            </kbq-list-selection>

            <br />

            <kbq-list-selection class="cdk-keyboard-focused" multiple="checkbox">
                <kbq-list-option>
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        Normal
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-hovered">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        hovered
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-hovered">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">hovered</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-active">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        active
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-focused">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        focused
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-focused">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">focused</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-selected">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        selected
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-hovered">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">selected + hovered</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-selected kbq-focused">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">selected + focused</div>
                    <kbq-option-action />
                </kbq-list-option>
                <kbq-list-option class="kbq-disabled">
                    <i kbq-icon="kbq-play_16"></i>

                    <div class="layout-row layout-align-space-between">
                        disabled
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action />
                </kbq-list-option>
            </kbq-list-selection>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eListStates'
    }
})
export class E2eListStates {}

@Component({
    selector: 'e2e-list-selection-state',
    imports: [KbqListModule, FormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [(ngModel)]="selected">
            <kbq-list-option [value]="1">Selected</kbq-list-option>
            <kbq-list-option disabled [value]="2">Selected + Disabled</kbq-list-option>
            <kbq-list-option [value]="3">Selected</kbq-list-option>
        </kbq-list-selection>
    `,
    styles: `
        :host {
            display: block;
            width: 400px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eListSelectionState'
    }
})
export class E2eListSelectionState {
    protected readonly selected = [1, 2, 3];
}

/**
 * Unlike `E2eListStates`, this fixture forces no state classes at all — the option action must be
 * revealed by real hover / real keyboard focus only. See `kbq-option-action-visibility` mixin.
 */
@Component({
    selector: 'e2e-list-option-action-visibility',
    imports: [KbqListModule, KbqOptionModule, KbqDropdownModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="width: 400px">
            <kbq-list-selection data-testid="e2eList">
                @for (option of options; track option) {
                    <kbq-list-option [attr.data-testid]="option">
                        {{ option }}
                        <kbq-option-action [kbqDropdownTriggerFor]="dropdown" />
                    </kbq-list-option>
                }
            </kbq-list-selection>
        </div>

        <kbq-dropdown #dropdown>
            <button kbq-dropdown-item data-testid="dropdownItem">action</button>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eListOptionActionVisibility'
    }
})
export class E2eListOptionActionVisibility {
    protected readonly options = ['option-1', 'option-2', 'option-3'];
}

/**
 * Two connected draggable lists. Reordering never mutates the data on its own, so the fixture applies
 * every `dropped` event itself — exactly what a consumer has to do.
 */
@Component({
    selector: 'e2e-list-drag-and-drop',
    imports: [KbqListModule],
    template: `
        <div data-testid="e2eScreenshotTarget" style="display: flex; gap: 16px; width: 400px">
            <kbq-list-selection
                #source="kbqListSelection"
                data-testid="e2eSourceList"
                style="flex: 1"
                [connectedTo]="[target]"
                [draggable]="true"
                (dropped)="handleDropped($event)"
            >
                @for (item of sourceItems(); track item) {
                    <kbq-list-option [attr.data-testid]="item" [value]="item">{{ item }}</kbq-list-option>
                }
            </kbq-list-selection>
            <kbq-list-selection
                #target="kbqListSelection"
                data-testid="e2eTargetList"
                style="flex: 1"
                [connectedTo]="[source]"
                [draggable]="true"
                (dropped)="handleDropped($event)"
            >
                @for (item of targetItems(); track item) {
                    <kbq-list-option [attr.data-testid]="item" [value]="item">{{ item }}</kbq-list-option>
                }
            </kbq-list-selection>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eListDragAndDrop'
    }
})
export class E2eListDragAndDrop {
    protected readonly sourceItems = signal(['source-1', 'source-2', 'source-3']);
    protected readonly targetItems = signal(['target-1']);

    protected handleDropped({
        previousIndex,
        currentIndex,
        previousContainer,
        container,
        option
    }: KbqListSelectionDroppedEvent): void {
        const fromSource = this.sourceItems().includes(option.value);
        const source = fromSource ? this.sourceItems : this.targetItems;

        if (previousContainer === container) {
            const items = [...source()];

            moveItemInArray(items, previousIndex, currentIndex);
            source.set(items);

            return;
        }

        const target = fromSource ? this.targetItems : this.sourceItems;
        const from = [...source()];
        const to = [...target()];

        transferArrayItem(from, to, previousIndex, currentIndex);

        source.set(from);
        target.set(to);
    }
}

/** A list whose options are picked up by a projected handle rather than by the whole row. */
@Component({
    selector: 'e2e-list-drag-handle',
    imports: [KbqListModule, KbqIconModule],
    template: `
        <kbq-list-selection
            style="width: 200px"
            data-testid="e2eHandleList"
            [draggable]="true"
            (dropped)="dropped($event)"
        >
            @for (item of items(); track item) {
                <kbq-list-option [attr.data-testid]="item" [value]="item">
                    <i kbq-icon="kbq-grip-vertical-s_16" cdkDragHandle></i>
                    {{ item }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eListDragHandle'
    }
})
export class E2eListDragHandle {
    protected readonly items = signal(['handle-1', 'handle-2', 'handle-3']);

    protected dropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent): void {
        const items = [...this.items()];

        moveItemInArray(items, previousIndex, currentIndex);
        this.items.set(items);
    }
}

/**
 * A draggable list split into sections by a group and a divider, with one option that cannot be moved.
 * The backing array stays flat: the sections are slices of it, so the indices `dropped` reports address
 * it directly.
 */
@Component({
    selector: 'e2e-list-drag-grouped',
    imports: [KbqListModule, KbqDividerModule],
    template: `
        <kbq-list-selection
            style="width: 240px"
            data-testid="e2eGroupedList"
            [draggable]="true"
            (dropped)="dropped($event)"
        >
            @for (item of beforeGroup(); track item) {
                <kbq-list-option [attr.data-testid]="item" [value]="item">{{ item }}</kbq-list-option>
            }
            <kbq-optgroup label="GROUP HEADER">
                @for (item of grouped(); track item) {
                    <kbq-list-option [attr.data-testid]="item" [value]="item">{{ item }}</kbq-list-option>
                }
            </kbq-optgroup>
            <kbq-divider aria-hidden="true" />
            @for (item of afterDivider(); track item) {
                <kbq-list-option [attr.data-testid]="item" [draggable]="item !== pinned()" [value]="item">
                    {{ item }}
                </kbq-list-option>
            }
        </kbq-list-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eListDragGrouped'
    }
})
export class E2eListDragGrouped {
    protected readonly items = signal(['row-1', 'row-2', 'row-3', 'row-4', 'row-5', 'row-6', 'row-7']);
    protected readonly pinned = signal('row-7');

    protected readonly beforeGroup = computed(() => this.items().slice(0, 2));
    protected readonly grouped = computed(() => this.items().slice(2, 5));
    protected readonly afterDivider = computed(() => this.items().slice(5));

    protected dropped({ previousIndex, currentIndex }: KbqListSelectionDroppedEvent): void {
        const items = [...this.items()];

        moveItemInArray(items, previousIndex, currentIndex);
        this.items.set(items);
    }
}
