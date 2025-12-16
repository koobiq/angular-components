import { CdkScrollable } from '@angular/cdk/scrolling';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { AccordionOverviewExample } from 'packages/docs-examples/components/accordion';
import { ActionsPanelOverviewExample } from 'packages/docs-examples/components/actions-panel';
import { AlertStatusExample } from 'packages/docs-examples/components/alert';
import { AppSwitcherOverviewExample } from 'packages/docs-examples/components/app-switcher';
import { AutocompleteOverviewExample } from 'packages/docs-examples/components/autocomplete';
import { BadgeFillAndStyleExample } from 'packages/docs-examples/components/badge';
import { BreadcrumbsOverviewExample } from 'packages/docs-examples/components/breadcrumbs';
import { ButtonOverviewExample } from 'packages/docs-examples/components/button';
import { ButtonToggleAlignmentOverviewExample } from 'packages/docs-examples/components/button-toggle';
import { CheckboxOverviewExample } from 'packages/docs-examples/components/checkbox';
import { ClampedTextOverviewExample } from 'packages/docs-examples/components/clamped-text';
import { CodeBlockWithLineNumbersExample } from 'packages/docs-examples/components/code-block';
import { ContentPanelOverviewExample } from 'packages/docs-examples/components/content-panel';
import { DatepickerOverviewExample } from 'packages/docs-examples/components/datepicker';
import { DividerOverviewExample } from 'packages/docs-examples/components/divider';
import { DlHorizontalOverviewExample } from 'packages/docs-examples/components/dl';
import { DropdownOverviewExample } from 'packages/docs-examples/components/dropdown';
import { DynamicTranslationOverviewExample } from 'packages/docs-examples/components/dynamic-translation';
import { EmptyStateDefaultExample } from 'packages/docs-examples/components/empty-state';
import {
    FileUploadCvaOverviewExample,
    FileUploadMultipleDefaultValidationReactiveFormsOverviewExample
} from 'packages/docs-examples/components/file-upload';
import { FilterBarOverviewExample } from 'packages/docs-examples/components/filter-bar';
import { FormFieldPasswordOverviewExample } from 'packages/docs-examples/components/form-field';
import { FormFieldsetOverviewExample } from 'packages/docs-examples/components/forms';
import { IconItemDefaultExample } from 'packages/docs-examples/components/icon-item';
import { InlineEditOverviewExample } from 'packages/docs-examples/components/inline-edit';
import { InputNumberOverviewExample } from 'packages/docs-examples/components/input';
import { LinkOverviewExample } from 'packages/docs-examples/components/link';
import { ListOverviewExample } from 'packages/docs-examples/components/list';
import { LoaderOverlayOverviewExample } from 'packages/docs-examples/components/loader-overlay';
import { MarkdownHeadersExample } from 'packages/docs-examples/components/markdown';
import { ModalOverviewExample } from 'packages/docs-examples/components/modal';
import { NavbarOverviewExample } from 'packages/docs-examples/components/navbar';
import { NavbarIcOverviewExample } from 'packages/docs-examples/components/navbar-ic';
import { NotificationCenterOverviewExample } from 'packages/docs-examples/components/notification-center';
import { OverflowItemsOverviewExample } from 'packages/docs-examples/components/overflow-items';
import { PopoverCommonExample } from 'packages/docs-examples/components/popover';
import { ProgressBarOverviewExample } from 'packages/docs-examples/components/progress-bar';
import { ProgressSpinnerOverviewExample } from 'packages/docs-examples/components/progress-spinner';
import { RadioSizeExample } from 'packages/docs-examples/components/radio';
import { ScrollbarWithOptionsExample } from 'packages/docs-examples/components/scrollbar';
import { SearchExpandableOverviewExample } from 'packages/docs-examples/components/search-expandable';
import { SelectOverviewExample } from 'packages/docs-examples/components/select';
import { SidebarOverviewExample } from 'packages/docs-examples/components/sidebar';
import { SidepanelOverlayedExample } from 'packages/docs-examples/components/sidepanel';
import { SplitButtonOverviewExample } from 'packages/docs-examples/components/split-button';
import { SplitterOverviewExample } from 'packages/docs-examples/components/splitter';
import { TableOverviewExample } from 'packages/docs-examples/components/table';
import { TabsNavBarOverviewExample } from 'packages/docs-examples/components/tabs';
import {
    TagAutocompleteOverviewExample,
    TagEditableExample,
    TagInputOverviewExample
} from 'packages/docs-examples/components/tag';
import { TextareaOverviewExample } from 'packages/docs-examples/components/textarea';
import { TimeRangeOverviewExample } from 'packages/docs-examples/components/time-range';
import { TimepickerValidationSymbolsExample } from 'packages/docs-examples/components/timepicker';
import { TimezoneOverviewExample } from 'packages/docs-examples/components/timezone';
import { TitleOverviewExample } from 'packages/docs-examples/components/title';
import { ToastActionsOverviewExample } from 'packages/docs-examples/components/toast';
import { ToggleOverviewExample } from 'packages/docs-examples/components/toggle';
import { TooltipOverviewExample } from 'packages/docs-examples/components/tooltip';
import { TopBarOverviewExample } from 'packages/docs-examples/components/top-bar';
import { TreeOverviewExample } from 'packages/docs-examples/components/tree';
import { TreeSelectChildSelectionOverviewExample } from 'packages/docs-examples/components/tree-select';
import { UsernameOverviewExample } from 'packages/docs-examples/components/username';
import { DevLocaleSelector } from '../locale-selector';
import { DevThemeToggle } from '../theme-toggle';
import { DevBreadcrumbsHydration } from './components/breadcrumbs';

@Component({
    selector: 'dev-examples',
    imports: [
        AccordionOverviewExample,
        ActionsPanelOverviewExample,
        AlertStatusExample,
        AppSwitcherOverviewExample,
        AutocompleteOverviewExample,
        BadgeFillAndStyleExample,
        BreadcrumbsOverviewExample,
        ButtonOverviewExample,
        ButtonToggleAlignmentOverviewExample,
        CheckboxOverviewExample,
        ClampedTextOverviewExample,
        CodeBlockWithLineNumbersExample,
        ContentPanelOverviewExample,
        DatepickerOverviewExample,
        DividerOverviewExample,
        DlHorizontalOverviewExample,
        DropdownOverviewExample,
        DynamicTranslationOverviewExample,
        EmptyStateDefaultExample,
        IconItemDefaultExample,
        FileUploadCvaOverviewExample,
        FileUploadMultipleDefaultValidationReactiveFormsOverviewExample,
        FilterBarOverviewExample,
        FormFieldPasswordOverviewExample,
        FormFieldsetOverviewExample,
        InlineEditOverviewExample,
        InputNumberOverviewExample,
        LinkOverviewExample,
        ListOverviewExample,
        LoaderOverlayOverviewExample,
        MarkdownHeadersExample,
        ModalOverviewExample,
        NavbarOverviewExample,
        NavbarIcOverviewExample,
        NotificationCenterOverviewExample,
        OverflowItemsOverviewExample,
        PopoverCommonExample,
        ProgressBarOverviewExample,
        ProgressSpinnerOverviewExample,
        RadioSizeExample,
        SearchExpandableOverviewExample,
        SelectOverviewExample,
        SidebarOverviewExample,
        SidepanelOverlayedExample,
        SplitButtonOverviewExample,
        SplitterOverviewExample,
        ScrollbarWithOptionsExample,
        TableOverviewExample,
        TabsNavBarOverviewExample,
        TagAutocompleteOverviewExample,
        TagInputOverviewExample,
        TagEditableExample,
        TextareaOverviewExample,
        TimeRangeOverviewExample,
        TimezoneOverviewExample,
        TitleOverviewExample,
        ToastActionsOverviewExample,
        ToggleOverviewExample,
        TooltipOverviewExample,
        TopBarOverviewExample,
        TreeOverviewExample,
        TimepickerValidationSymbolsExample,
        TreeSelectChildSelectionOverviewExample,
        UsernameOverviewExample
    ],
    template: `
        <accordion-overview-example />
        <hr />
        <actions-panel-overview-example />
        <hr />
        <app-switcher-overview-example />
        <hr />
        <autocomplete-overview-example />
        <hr />
        <alert-status-example />
        <hr />
        <badge-fill-and-style-example />
        <hr />
        <breadcrumbs-overview-example />
        <hr />
        <button-overview-example />
        <hr />
        <button-toggle-alignment-overview-example />
        <hr />
        <checkbox-overview-example />
        <hr />
        <clamped-text-overview-example />
        <hr />
        <code-block-with-line-numbers-example />
        <hr />
        <icon-item-default-example />
        <hr />
        <content-panel-overview-example />
        <hr />
        <datepicker-overview-example />
        <hr />
        <divider-overview-example />
        <hr />
        <dl-horizontal-overview-example />
        <hr />
        <dropdown-overview-example />
        <hr />
        <dynamic-translation-overview-example />
        <hr />
        <empty-state-default-example />
        <hr />
        <file-upload-cva-overview-example />
        <hr />
        <file-upload-multiple-default-validation-reactive-forms-overview-example />
        <hr />
        <filter-bar-overview-example />
        <hr />
        <form-field-password-overview-example />
        <hr />
        <form-fieldset-overview-example />
        <hr />
        <inline-edit-overview-example />
        <hr />
        <input-number-overview-example />
        <hr />
        <link-overview-example />
        <hr />
        <list-overview-example />
        <hr />
        <loader-overlay-overview-example />
        <hr />
        <markdown-headers-example />
        <hr />
        <modal-overview-example />
        <hr />
        <navbar-overview-example />
        <hr />
        <navbar-ic-overview-example />
        <hr />
        <notification-center-overview-example />
        <hr />
        <overflow-items-overview-example />
        <hr />
        <popover-common-example />
        <hr />
        <progress-bar-overview-example />
        <hr />
        <progress-spinner-overview-example />
        <hr />
        <radio-size-example />
        <hr />
        <sidepanel-overlayed-example />
        <hr />
        <search-expandable-overview-example />
        <hr />
        <select-overview-example />
        <hr />
        <sidebar-overview-example />
        <hr />
        <split-button-overview-example />
        <hr />
        <splitter-overview-example />
        <hr />
        <scrollbar-with-options-example />
        <hr />
        <table-overview-example />
        <hr />
        <tabs-nav-bar-overview-example />
        <hr />
        <tag-autocomplete-overview-example />
        <hr />
        <tag-input-overview-example />
        <hr />
        <tag-editable-example />
        <hr />
        <textarea-overview-example />
        <hr />
        <time-range-overview-example />
        <hr />
        <timezone-overview-example />
        <hr />
        <title-overview-example />
        <hr />
        <toast-actions-overview-example />
        <hr />
        <toggle-overview-example />
        <hr />
        <tooltip-overview-example />
        <hr />
        <top-bar-overview-example />
        <hr />
        <tree-overview-example />
        <hr />
        <timepicker-validation-symbols-example />
        <hr />
        <tree-select-child-selection-overview-example />
        <hr />
        <username-overview-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [DevDocsExamples, DevThemeToggle, DevLocaleSelector, DevBreadcrumbsHydration],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [
        // Required for components with overlays that use scrolling strategies
        CdkScrollable
    ]
})
export class DevApp {
    constructor() {
        const platformID = inject(PLATFORM_ID);

        console.info('[dev:ssr] isPlatformServer: ', isPlatformServer(platformID));
        console.info('[dev:ssr] isPlatformBrowser: ', isPlatformBrowser(platformID));
    }
}
