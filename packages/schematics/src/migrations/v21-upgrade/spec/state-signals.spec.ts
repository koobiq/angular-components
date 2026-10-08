import { runV21Upgrade } from '../testing';

const NOTIFICATION_FLAGS = 'The flags of `KbqNotificationCenterService` (`silentMode`';
const NOTIFICATION_FLAGS_ASYNC = 'The flags of `KbqNotificationCenterService` are signals: bind';
const UNREAD_COUNTER_ASYNC = '`unreadItemsCounter` of the notification center service and trigger is a signal';
const NOTIFICATION_STREAMS = '`unreadItemsCounter` and `groupedItems` of `KbqNotificationCenterService` are signals';
const NOTIFICATION_CHANGES = 'If this subscribes to `KbqNotificationCenterService.changes`';
const TOAST_FLAGS = '`hovered` and `focused` of `KbqToastService` and `KbqToastComponent`';
const FILTERED_OPTIONS = '`filteredOptions` of `KbqFilters`, `KbqPipeSelectComponent`';
const FILTERED_OPTIONS_ASYNC = '`filteredOptions` of the filter bar is a signal';
const PIPE_SELECT_INIT = '`KbqPipeSelectComponent` no longer implements `ngOnInit`';
const DATE_PIPE_FLAGS = '`isListMode`, `showStartCalendar` and `showEndCalendar` of the date pipes are signals';
const SELECT_HIDDEN_ITEMS = 'If this reads `KbqSelect.hiddenItems`';
const SELECT_HIDDEN_ITEMS_TEMPLATE = 'If this reads `hiddenItems` of a `kbq-select`';
const SEARCH_VALUE = 'If this uses `KbqSearchExpandable.value`';
const DATEPICKER_TOGGLE_HOOKS = '`KbqDatepickerToggleIconComponent` no longer implements';

describe('v21-upgrade: state as signals', () => {
    it('reports the subject reads and writes of the notification center flags', async () => {
        const run = await runV21Upgrade({
            'center.ts': [
                "import { KbqNotificationCenterService } from '@koobiq/components/notification-center';",
                '',
                'export class Center {',
                '    constructor(private readonly service: KbqNotificationCenterService) {',
                '        this.service.silentMode.next(true);',
                '    }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(NOTIFICATION_FLAGS);
    });

    it('does not report a call of a notification center flag', async () => {
        const run = await runV21Upgrade({
            'center.ts': [
                "import { KbqNotificationCenterService } from '@koobiq/components/notification-center';",
                '',
                'export class Center {',
                '    constructor(private readonly service: KbqNotificationCenterService) {',
                '        this.service.setSilentMode(!this.service.silentMode());',
                '    }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(NOTIFICATION_FLAGS);
    });

    it('reports the flags, the counter and the groups of the notification center piped through async', async () => {
        const run = await runV21Upgrade({
            'center.html': [
                '<kbq-notification-center-trigger #trigger="kbqNotificationCenterTrigger" />',
                '<span>{{ trigger.unreadItemsCounter | async }}</span>',
                '@if (service.loadingMode | async) {<span>Loading</span>}',
                '@for (group of service.groupedItems | async; track group.id) {<span>{{ group.id }}</span>}',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(UNREAD_COUNTER_ASYNC);
        expect(run.log).toContain(NOTIFICATION_FLAGS_ASYNC);
        expect(run.log).toContain('`KbqNotificationCenterService.groupedItems` is a signal');
    });

    it('reports a subscription to the counter and to the changes of the notification center', async () => {
        const run = await runV21Upgrade({
            'center.ts': [
                "import { KbqNotificationCenterService } from '@koobiq/components/notification-center';",
                '',
                'export class Center {',
                '    constructor(service: KbqNotificationCenterService) {',
                '        service.unreadItemsCounter.subscribe(console.log);',
                '        service.changes.subscribe(() => this.render());',
                '    }',
                '',
                '    render(): void {}',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(NOTIFICATION_STREAMS);
        expect(run.log).toContain(NOTIFICATION_CHANGES);
    });

    it('reports the toast flags read as subjects, but not the pop-up hovered of core', async () => {
        const toast = await runV21Upgrade({
            'toast.ts': [
                "import { KbqToastService } from '@koobiq/components/toast';",
                '',
                'export const isHovered = (service: KbqToastService) => service.hovered.getValue();',
                ''
            ].join('\n')
        });
        const popUp = await runV21Upgrade({
            'pop-up.ts': [
                "import { KbqPopUp } from '@koobiq/components/core';",
                '',
                'export const watch = (popUp: KbqPopUp) => popUp.hovered.subscribe();',
                ''
            ].join('\n')
        });

        expect(toast.log).toContain(TOAST_FLAGS);
        expect(popUp.log).not.toContain(TOAST_FLAGS);
    });

    it('reports a subscription to and an assignment of the filtered options of the filter bar', async () => {
        const run = await runV21Upgrade({
            'filters.ts': [
                "import { KbqFilters } from '@koobiq/components/filter-bar';",
                '',
                'export const watch = (filters: KbqFilters) => filters.filteredOptions.subscribe();',
                ''
            ].join('\n'),
            'filters.html': '@for (filter of filters.filteredOptions | async; track filter) {}\n<kbq-filters />\n'
        });

        expect(run.log).toContain(FILTERED_OPTIONS);
        expect(run.log).toContain(FILTERED_OPTIONS_ASYNC);
    });

    it('reports the hooks and flags that the filter bar pipes no longer have to a subclass', async () => {
        const run = await runV21Upgrade({
            'pipes.ts': [
                "import { KbqPipeDateComponent, KbqPipeSelectComponent } from '@koobiq/components/filter-bar';",
                '',
                'export class AppPipeSelect extends KbqPipeSelectComponent {',
                '    override ngOnInit(): void {',
                '        super.ngOnInit();',
                '    }',
                '}',
                '',
                'export class AppPipeDate extends KbqPipeDateComponent {',
                '    toggle(): void {',
                '        this.isListMode = !this.isListMode;',
                '    }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(PIPE_SELECT_INIT);
        expect(run.log).toContain(DATE_PIPE_FLAGS);
    });

    it('does not report the date pipe flags read and written as signals', async () => {
        const run = await runV21Upgrade({
            'pipe.ts': [
                "import { KbqPipeDateComponent } from '@koobiq/components/filter-bar';",
                '',
                'export class AppPipeDate extends KbqPipeDateComponent {',
                '    toggle(): void {',
                '        this.isListMode.set(!this.isListMode());',
                '    }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(DATE_PIPE_FLAGS);
    });

    it('reports hiddenItems of the select read as a field, in code and in a template', async () => {
        const run = await runV21Upgrade({
            'select.ts': [
                "import { KbqSelect } from '@koobiq/components/select';",
                '',
                'export const count = (select: KbqSelect) => select.hiddenItems;',
                ''
            ].join('\n'),
            'select.html': '<kbq-select #select multiple />\n<span>+{{ select.hiddenItems }}</span>\n'
        });

        expect(run.log).toContain(SELECT_HIDDEN_ITEMS);
        expect(run.log).toContain(SELECT_HIDDEN_ITEMS_TEMPLATE);
    });

    it('does not report hiddenItems of the select called as a signal', async () => {
        const run = await runV21Upgrade({
            'select.ts': [
                "import { KbqSelect } from '@koobiq/components/select';",
                '',
                'export const count = (select: KbqSelect) => select.hiddenItems();',
                ''
            ].join('\n')
        });

        expect(run.log).not.toContain(SELECT_HIDDEN_ITEMS);
    });

    it('reports the value of the search expandable used as a subject', async () => {
        const run = await runV21Upgrade({
            'search.ts': [
                "import { KbqSearchExpandable } from '@koobiq/components/search-expandable';",
                '',
                "export const clear = (search: KbqSearchExpandable) => search.value.next('');",
                ''
            ].join('\n')
        });

        expect(run.log).toContain(SEARCH_VALUE);
    });

    it('reports the super calls of the lifecycle hooks the datepicker toggle no longer implements', async () => {
        const run = await runV21Upgrade({
            'toggle.ts': [
                "import { KbqDatepickerToggleIconComponent } from '@koobiq/components/datepicker';",
                '',
                'export class AppToggle<D> extends KbqDatepickerToggleIconComponent<D> {',
                '    override ngOnDestroy(): void {',
                '        super.ngOnDestroy();',
                '    }',
                '}',
                ''
            ].join('\n')
        });

        expect(run.log).toContain(DATEPICKER_TOGGLE_HOOKS);
    });
});
