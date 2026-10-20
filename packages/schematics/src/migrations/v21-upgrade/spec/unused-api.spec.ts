import { runV21Upgrade } from '../testing';

const INPUT_HELPERS = 'normalizeSplitter(), isInt() and isDigit() are no longer exported';
const TIME_RANGE = 'KbqTimeRangeTranslateTypeMap was removed';
const TAB_BODY_ORIGIN = 'KbqTabBodyOriginState was removed';
const DATEPICKER_INTL = 'KbqDatepickerIntl was removed';
const PANEL_REACHED = 'KbqDropdown.onPanelReached() was removed';
const ITEM_HEIGHT = 'The protected KbqTreeSelection.getItemHeight() was removed';
const FOCUSED_OPTION = 'The protected KbqTreeSelection.setFocusedOption() was removed';
const TAG_LIST_MEMBERS = 'KbqTagList.tagSelectionChanges and shouldLabelFloat were removed';
const TREE_OUTLET_CDR = 'KbqTreeNodeOutlet.changeDetectorRef was removed';
const PROTECTED_CDR = 'The protected changeDetectorRef of KbqAccordion';
const ACCORDION_TRIGGER = 'The protected KbqAccordionTrigger.nativeElement was removed';
const NOTIFICATION_CENTER = 'The protected KbqNotificationCenterComponent.dateAdapter was removed';
const FILTERS_STYLES = 'The protected KbqFilters.styles was removed';
const TITLE_MEMBERS = 'The protected isHorizontalOverflown, isVerticalOverflown and child of KbqTitleDirective';
const VALIDATE_CLASSES = 'The kbq-control_has-validate-directive and kbq-form-field_has-validate-directive classes';
const NO_SELECT = 'The kbq-no-select class was removed';

describe('v21-upgrade: unused API', () => {
    it('reports the removed exports where they are imported', async () => {
        const run = await runV21Upgrade({
            'input.ts': "import { isDigit, KbqInputNumber } from '@koobiq/components/input';\n",
            'range.ts': "import type { KbqTimeRangeTranslateTypeMap } from '@koobiq/components/time-range';\n",
            'tabs.ts': "import type { KbqTabBodyOriginState } from '@koobiq/components/tabs';\n",
            'intl.ts': "import { KbqDatepickerIntl } from '@koobiq/components/datepicker';\n"
        });

        expect(run.log).toContain(`input.ts\n  ${INPUT_HELPERS}`);
        expect(run.log).toContain(`range.ts\n  ${TIME_RANGE}`);
        expect(run.log).toContain(`tabs.ts\n  ${TAB_BODY_ORIGIN}`);
        expect(run.log).toContain(`intl.ts\n  ${DATEPICKER_INTL}`);
    });

    it('leaves an isDigit of core or of the app alone', async () => {
        const run = await runV21Upgrade({
            'core.ts': "import { isDigit } from '@koobiq/components/core';\n",
            'own.ts': "import { isDigit } from './utils';\n"
        });

        expect(run.log).not.toContain(INPUT_HELPERS);
    });

    it('reports the removed public members on the components that had them', async () => {
        const run = await runV21Upgrade({
            'dropdown.ts': [
                "import { KbqDropdown } from '@koobiq/components/dropdown';",
                'export const reached = (dropdown: KbqDropdown) => dropdown.onPanelReached();',
                ''
            ].join('\n'),
            'tags.ts': [
                "import { KbqTagList } from '@koobiq/components/tags';",
                'export const float = (list: KbqTagList) => list.shouldLabelFloat;',
                ''
            ].join('\n'),
            'tree.ts': [
                "import { KbqTreeNodeOutlet } from '@koobiq/components/tree';",
                'export const cdr = (outlet: KbqTreeNodeOutlet) => outlet.changeDetectorRef;',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(`dropdown.ts\n  ${PANEL_REACHED}`);
        expect(run.log).toContain(`tags.ts\n  ${TAG_LIST_MEMBERS}`);
        expect(run.log).toContain(`tree.ts\n  ${TREE_OUTLET_CDR}`);
    });

    it('reports the removed protected members only in a subclass', async () => {
        const run = await runV21Upgrade({
            'icon.ts': [
                "import { KbqIconButton } from '@koobiq/components/icon';",
                'export class AppIcon extends KbqIconButton {',
                '    refresh() { this.changeDetectorRef.markForCheck(); }',
                '}',
                ''
            ].join('\n'),
            'trigger.ts': [
                "import { KbqAccordionTrigger } from '@koobiq/components/accordion';",
                'export class AppTrigger extends KbqAccordionTrigger {',
                '    width() { return this.nativeElement.offsetWidth; }',
                '}',
                ''
            ].join('\n'),
            'center.ts': [
                'export class AppCenter extends KbqNotificationCenterComponent {',
                '    now() { return this.dateAdapter.today(); }',
                '}',
                ''
            ].join('\n'),
            'filters.ts': [
                'export class AppFilters extends KbqFilters {',
                '    readonly buttonStyle = this.styles.Transparent;',
                '}',
                ''
            ].join('\n'),
            'title.ts': [
                'export class AppTitle extends KbqTitleDirective {',
                '    get clipped() { return this.isHorizontalOverflown; }',
                '}',
                ''
            ].join('\n'),
            'tree.ts': [
                'export class AppTree extends KbqTreeSelection {',
                '    focus(option: KbqTreeOption) { this.setFocusedOption(option); }',
                '    rowHeight() { return this.getItemHeight(); }',
                '}',
                ''
            ].join('\n'),
            'app.ts': [
                "import { KbqIconButton } from '@koobiq/components/icon';",
                "import { KbqSelect } from '@koobiq/components/select';",
                'export class App {',
                '    readonly icon = viewChild(KbqIconButton);',
                '    readonly select = viewChild.required(KbqSelect);',
                '    refresh() { this.changeDetectorRef.markForCheck(); }',
                '    rowHeight() { return this.select().getItemHeight(); }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(`icon.ts\n  ${PROTECTED_CDR}`);
        expect(run.log).toContain(`trigger.ts\n  ${ACCORDION_TRIGGER}`);
        expect(run.log).toContain(`center.ts\n  ${NOTIFICATION_CENTER}`);
        expect(run.log).toContain(`filters.ts\n  ${FILTERS_STYLES}`);
        expect(run.log).toContain(`title.ts\n  ${TITLE_MEMBERS}`);
        expect(run.log).toContain(`tree.ts\n  ${FOCUSED_OPTION}`);
        expect(run.log).toContain(`tree.ts\n  ${ITEM_HEIGHT}`);
        expect(run.log).not.toContain(`app.ts\n  ${PROTECTED_CDR}`);
        expect(run.log).not.toContain(`app.ts\n  ${ITEM_HEIGHT}`);
    });

    it('reports the classes nothing sets any more', async () => {
        const run = await runV21Upgrade({
            'form.html': '<kbq-select class="kbq-control_has-validate-directive" formControlName="city" />\n',
            'form.scss': '.kbq-form-field_has-validate-directive.ng-invalid { outline: 1px solid red; }\n',
            'list.html': '<div class="kbq-no-select">Drag me</div>\n',
            'own.scss': '.app-no-select-zone, .my-kbq-no-selection { user-select: none; }\n'
        });

        expect(run.log).toContain(`form.html\n  ${VALIDATE_CLASSES}`);
        expect(run.log).toContain(`form.scss\n  ${VALIDATE_CLASSES}`);
        expect(run.log).toContain(`list.html\n  ${NO_SELECT}`);
        expect(run.log).not.toContain(`own.scss\n  ${NO_SELECT}`);
    });
});
