import {
    AbstractControl,
    FormControl,
    FormGroup,
    FormGroupDirective,
    ValidationErrors,
    Validators
} from '@angular/forms';
import {
    CrossFieldErrorScope,
    ShowOnCrossFieldErrorStateMatcher,
    ShowRequiredOnSubmitErrorStateMatcher
} from './error-state-matcher';

// Names the two controls the `mismatch` rule connects, and ignores every other error.
const mismatchScope: CrossFieldErrorScope = (key) => (key === 'mismatch' ? ['first', 'second'] : null);

const submittedForm = (submitted: boolean) => ({ submitted }) as FormGroupDirective;

// The error value is a bare `true` on purpose: the matcher is not supposed to require any particular error
// shape from the validator.
const createGroup = () =>
    new FormGroup(
        {
            first: new FormControl('one'),
            second: new FormControl('another'),
            unrelated: new FormControl('')
        },
        {
            validators: (group): ValidationErrors | null =>
                group.get('first')!.value === group.get('second')!.value ? null : { mismatch: true }
        }
    );

describe(ShowOnCrossFieldErrorStateMatcher.name, () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should NOT show the error while only one of the named controls is touched', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(mismatchScope);
        const group = createGroup();

        group.controls.first.markAsTouched();

        expect(matcher.isErrorState(group.controls.first, null)).toBe(false);
        expect(matcher.isErrorState(group.controls.second, null)).toBe(false);
    });

    it('should show the error on every named control once all of them are touched', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(mismatchScope);
        const group = createGroup();

        group.markAllAsTouched();

        expect(matcher.isErrorState(group.controls.first, null)).toBe(true);
        expect(matcher.isErrorState(group.controls.second, null)).toBe(true);
    });

    it('should NOT show the error on a control the scope does not name', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(mismatchScope);
        const group = createGroup();

        group.markAllAsTouched();

        expect(matcher.isErrorState(group.controls.unrelated, null)).toBe(false);
    });

    it('should stop showing the error once the rule passes', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(mismatchScope);
        const group = createGroup();

        group.markAllAsTouched();
        group.controls.second.setValue('one');

        expect(matcher.isErrorState(group.controls.first, null)).toBe(false);
    });

    it('should show the error after the form is submitted, even when nothing is touched', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(mismatchScope);
        const group = createGroup();

        expect(matcher.isErrorState(group.controls.first, submittedForm(false))).toBe(false);
        expect(matcher.isErrorState(group.controls.first, submittedForm(true))).toBe(true);
    });

    it('should let a subclass replace the reveal rule', () => {
        class ShowOnAnyTouched extends ShowOnCrossFieldErrorStateMatcher {
            protected override shouldReveal(controls: AbstractControl[]): boolean {
                return controls.some(({ touched }) => touched);
            }
        }

        const matcher = new ShowOnAnyTouched(mismatchScope);
        const group = createGroup();

        group.controls.first.markAsTouched();

        expect(matcher.isErrorState(group.controls.first, null)).toBe(true);
        expect(matcher.isErrorState(group.controls.second, null)).toBe(true);
    });

    it('should ignore errors the scope does not recognise', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(() => null);
        const group = createGroup();

        group.markAllAsTouched();

        expect(matcher.isErrorState(group.controls.first, null)).toBe(false);
    });

    it('should keep the default per-control behavior', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(() => null);
        const control = new FormControl('', Validators.required);

        expect(matcher.isErrorState(control, null)).toBe(false);

        control.markAsTouched();

        expect(matcher.isErrorState(control, null)).toBe(true);
    });

    it('should find a rule set on an ancestor and resolve control paths', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher((key) =>
            key === 'mismatch' ? ['outer', 'inner.second'] : null
        );
        const inner = new FormGroup({ second: new FormControl('another') });
        const root = new FormGroup(
            { outer: new FormControl('one'), inner },
            { validators: (): ValidationErrors | null => ({ mismatch: true }) }
        );

        root.markAllAsTouched();

        expect(matcher.isErrorState(inner.controls.second, null)).toBe(true);
        expect(matcher.isErrorState(root.controls.outer, null)).toBe(true);
    });

    it('should warn once about a control name that does not resolve', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const matcher = new ShowOnCrossFieldErrorStateMatcher((key) => (key === 'mismatch' ? ['typo'] : null));
        const group = createGroup();

        group.markAllAsTouched();
        matcher.isErrorState(group.controls.first, null);
        matcher.isErrorState(group.controls.first, null);

        expect(warn).toHaveBeenCalledTimes(1);
        expect(warn.mock.calls[0][0]).toContain('"typo"');
    });

    it('should require submit when a named control fails to resolve, instead of revealing early on the rest', () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        const matcher = new ShowOnCrossFieldErrorStateMatcher((key) => (key === 'mismatch' ? ['first', 'typo'] : null));
        const group = createGroup();

        group.controls.first.markAsTouched();

        expect(matcher.isErrorState(group.controls.first, null)).toBe(false);
        expect(matcher.isErrorState(group.controls.first, submittedForm(true))).toBe(true);
    });

    it('should not let a disabled control block the reveal gate, but never flag the disabled control itself', () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(mismatchScope);
        const group = createGroup();

        group.controls.second.disable();
        group.controls.first.markAsTouched();

        expect(matcher.isErrorState(group.controls.first, null)).toBe(true);
        expect(matcher.isErrorState(group.controls.second, null)).toBe(false);
    });

    it("should delegate the control's own errors to the matcher passed as `own`, instead of the default", () => {
        const matcher = new ShowOnCrossFieldErrorStateMatcher(() => null, new ShowRequiredOnSubmitErrorStateMatcher());
        const control = new FormControl('', Validators.required);

        control.markAsTouched();

        expect(matcher.isErrorState(control, null)).toBe(false);
        expect(matcher.isErrorState(control, submittedForm(true))).toBe(true);
    });
});
