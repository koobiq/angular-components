/**
 * Data for the `modal-signals` migration.
 *
 * `KbqModalComponent` finished its move to signals:
 *
 * - every option is an `input()` now, `kbqVisible` is a `model()`, and the hand-written
 *   `kbqVisibleChange` output is the one the model generates;
 * - `kbqOnOk`/`kbqOnCancel` are an output each, and the decision handler they used to double as
 *   is a separate input: `kbqOkClick`/`kbqCancelClick`;
 * - `KbqModalService` stopped applying the options with `Object.assign` — they reach the dialog
 *   through `KBQ_MODAL_OPTIONS` as the initial values of its inputs;
 * - the `okText`/`cancelText` getters and the four template type guards are gone.
 *
 * Reads are rewritten to calls by the shared engine. The two renames are reported rather than
 * rewritten: `kbqOnOk` survives as an output under the same name, so the key has to be judged in
 * context — an option object and an `[kbqOnOk]` input binding move, a `(kbqOnOk)` listener does not.
 */

import { SignalMembersConfig } from '../../utils/signal-members-migration';

/** Import specifier that marks a file as a modal consumer. */
export const MODAL_PACKAGE = '@koobiq/components/modal';

/** Identifier and attribute shapes that mark a consumer without an import. */
export const MODAL_TYPE = '\\bKbqModal\\w*\\b|\\bkbq-modal\\b';

/** Every input that became a signal. `kbqVisible` is the `model()`; the rest are read-only. */
const MODAL_MEMBERS: readonly string[] = [
    'kbqModalType',
    'kbqComponent',
    'kbqContent',
    'kbqFooter',
    'kbqVisible',
    'kbqWidth',
    'kbqSize',
    'kbqWrapClassName',
    'kbqClassName',
    'kbqStyle',
    'kbqTitle',
    'kbqCaption',
    'kbqCloseByESC',
    'kbqAutoFocus',
    'kbqAriaLabel',
    'kbqClosable',
    'kbqMask',
    'kbqMaskClosable',
    'kbqMaskStyle',
    'kbqBodyStyle',
    'kbqOkText',
    'kbqOkType',
    'kbqRestoreFocus',
    'kbqOkLoading',
    'kbqOkClick',
    'kbqCancelText',
    'kbqCancelLoading',
    'kbqCancelClick',
    'kbqGetContainer'
];

export const config: SignalMembersConfig = {
    label: '[modal-signals]',
    package: MODAL_PACKAGE,
    membersByType: { KbqModalComponent: MODAL_MEMBERS },
    // The dialog is a component with no `exportAs`, so a template names it by its own element.
    exportAsToType: {},
    elementToType: { 'kbq-modal': 'KbqModalComponent' },
    writableMembers: new Set(['kbqVisible']),
    warnPatterns: [
        {
            anchor: MODAL_TYPE,
            pattern: '\\bkbqOnOk\\s*:|\\bkbqOnCancel\\s*:',
            message:
                'The decision handler moved off kbqOnOk/kbqOnCancel. In an options object or an ' +
                '[kbqOnOk] input binding, rename the key to kbqOkClick/kbqCancelClick: ' +
                'modalService.create({ kbqOnOk: fn }) becomes create({ kbqOkClick: fn }). kbqOnOk and ' +
                'kbqOnCancel survive as outputs under the same names, so a (kbqOnOk) listener in a ' +
                'template is unaffected — and ModalOptions.kbqOnOk is an EventEmitter now, so a ' +
                'function left under the old key is a compile error rather than a silent change.'
        },
        {
            anchor: MODAL_TYPE,
            pattern: '\\[\\s*(?:kbqOnOk|kbqOnCancel)\\s*\\]',
            message:
                'An [kbqOnOk]/[kbqOnCancel] input binding is now [kbqOkClick]/[kbqCancelClick]. The old ' +
                'names are outputs only, so the binding would be dropped silently.'
        },
        {
            anchor: MODAL_TYPE,
            pattern: '\\.\\s*getInstance\\(\\)\\s*\\.\\s*kbq[A-Z]',
            message:
                'Reads through KbqModalRef.getInstance() are not rewritten, because the ref is what ' +
                'KbqModalService returns and its static type carries none of these members. Every input ' +
                'read behind getInstance() needs a call now — getInstance().kbqVisible() — and a write ' +
                'needs a binding, except kbqVisible, which is a model(): getInstance().kbqVisible.set(v), ' +
                'or just open()/close().'
        },
        {
            anchor: MODAL_TYPE,
            pattern: '\\.\\s*(?:okText|cancelText)\\b',
            message:
                'KbqModalComponent.okText / cancelText were removed. They were getters that returned ' +
                'kbqOkText / kbqCancelText unchanged and existed only to feed the template; read the ' +
                'inputs instead — kbqOkText().'
        },
        {
            anchor: MODAL_TYPE,
            pattern: '\\.\\s*(?:isTemplateRef|isNonEmptyString|isComponent|isModalButtons)\\b',
            message:
                'The four template type guards of KbqModalComponent were removed — isTemplateRef, ' +
                'isNonEmptyString, isComponent and isModalButtons. The template classifies each slot ' +
                'once instead. They were already protected and @docs-private, so only a subclass is ' +
                'affected.'
        }
    ],
    messages: {
        unparseableTemplate:
            'This template renders a kbq-modal but could not be parsed, so reads through a template ' +
            'reference variable were left alone. Check them by hand.',
        unresolvedReceiver:
            'KbqModalComponent is named here, but these reads could not be tied to one receiver, so ' +
            'they were left alone:',
        summary: [
            '  Every option of KbqModalComponent is a signal input now, and kbqVisible is a model(). ' +
                'Template bindings are unchanged, including [(kbqVisible)]; what breaks is programmatic ' +
                'access — a read takes a call and a write takes a binding.',
            '  KbqModalService no longer applies the options with Object.assign. They are provided as ' +
                'KBQ_MODAL_OPTIONS and become the initial values of the inputs, so a dialog created by ' +
                'the service keeps them for life.',
            '  kbqOkLoading, kbqCancelLoading and kbqMask keep a private writable shadow inside the ' +
                'dialog, because a pending promise and a covering dialog drive them. The inputs keep ' +
                'reporting what was bound, so re-binding one still takes effect.',
            '  kbqFooter is no longer overwritten with its own formatted copy on init, and the ' +
                'predefined OK/Cancel buttons finally render the progress state kbqOkLoading and ' +
                'kbqCancelLoading always described.',
            '  KbqModalComponent no longer declares `implements ModalOptions`: that interface is the ' +
                "service's contract, and the component's inputs are signals, so the two no longer match."
        ]
    }
};
