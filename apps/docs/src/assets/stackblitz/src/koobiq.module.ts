import { NgModule } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCardModule } from '@koobiq/components/card';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqCodeBlockModule } from '@koobiq/components/code-block';
import { KbqFormattersModule, KbqHighlightModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqListModule } from '@koobiq/components/list';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqMarkdownModule } from '@koobiq/components/markdown';
import { KbqModalModule } from '@koobiq/components/modal';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqSidebarModule } from '@koobiq/components/sidebar';
import { KbqSidepanelModule } from '@koobiq/components/sidepanel';
import { KbqSplitterModule } from '@koobiq/components/splitter';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqTimezoneModule } from '@koobiq/components/timezone';
import { KbqToastModule } from '@koobiq/components/toast';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';

const KBQ_COMPONENTS = [
    KbqAlertModule,
    KbqAutocompleteModule,
    KbqBadgeModule,
    KbqButtonModule,
    KbqButtonToggleModule,
    KbqCardModule,
    KbqCheckboxModule,
    KbqDatepickerModule,
    KbqDividerModule,
    KbqDropdownModule,
    KbqFormFieldModule,
    KbqIconModule,
    KbqInputModule,
    KbqLinkModule,
    KbqListModule,
    KbqLoaderOverlayModule,
    KbqMarkdownModule,
    KbqModalModule,
    KbqLuxonDateModule,
    KbqNavbarModule,
    KbqPopoverModule,
    KbqProgressBarModule,
    KbqProgressSpinnerModule,
    KbqRadioModule,
    KbqSelectModule,
    KbqSidebarModule,
    KbqSidepanelModule,
    KbqSplitterModule,
    KbqTableModule,
    KbqTabsModule,
    KbqTagsModule,
    KbqTextareaModule,
    KbqTimepickerModule,
    KbqTimezoneModule,
    KbqToggleModule,
    KbqToolTipModule,
    KbqToastModule,
    KbqTreeModule,
    KbqTreeSelectModule,
    KbqFileUploadModule,
    KbqCodeBlockModule,
];

const KBQ_CORE = [KbqHighlightModule, KbqPseudoCheckboxModule, KbqFormattersModule];

@NgModule({
    exports: [...KBQ_COMPONENTS, ...KBQ_CORE],
})
export class DemoMosaicModule {}
