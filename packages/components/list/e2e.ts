import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqListModule } from '@koobiq/components/list';

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
