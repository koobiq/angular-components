import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import {
    AbstractControl,
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormControl,
    UntypedFormGroup,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { COMMA, ENTER } from '@koobiq/cdk/keycodes';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqDatepickerModule } from '@koobiq/components/datepicker';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagInputEvent, KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { ValidationExamplesModule } from '../../docs-examples/components/validation';
import { DEV_DATA_OBJECT, devBuildFileTree, DevFileFlatNode, DevFileNode } from '../tree/module';

function ldapLoginValidator(loginRegex: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const allowed = loginRegex.test(control.value);

        return allowed ? null : { ldapLogin: { value: control.value } };
    };
}

@Component({
    standalone: true,
    imports: [ValidationExamplesModule],
    selector: 'dev-examples',
    template: `
        <validation-tag-list-example />
        <validation-on-open-example />
        <validation-optional-label-example />
        <validation-required-label-example />
        <validation-on-type-example />
        <validation-on-blur-example />
        <validation-on-blur-filled-example />
        <validation-on-submit-example />
        <validation-message-for-specific-field-example />
        <validation-no-message-example />
        <validation-message-global-example />
        <validation-message-global-with-links-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqAutocompleteModule,
        KbqTagsModule,
        KbqInputModule,
        KbqTextareaModule,
        KbqSelectModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqDatepickerModule,
        KbqTimepickerModule,
        KbqLuxonDateModule,
        DevExamples
    ],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    themePalette = ThemePalette;

    reactiveTypeaheadItems: string[] = [];
    reactiveFormControlTypeaheadItems: string[] = [];
    typeaheadItems: string[] = [];
    inputValue: string = '';
    selectValue: string = '';
    treeSelectValue: string = '';

    control = new UntypedFormControl('', [Validators.pattern('[a-zA-Z]*')]);

    inputControl = new UntypedFormControl('', [Validators.pattern('[a-zA-Z]*')]);
    tagsControl = new UntypedFormControl([], Validators.required);

    value = '';

    date;
    time;

    reactiveForm: UntypedFormGroup;
    reactiveFormControl: UntypedFormGroup;

    formWithCustomValidator = new UntypedFormGroup({
        login: new UntypedFormControl('', [
            Validators.required,
            ldapLoginValidator(/^[a-zA-Z0-9_\-.+]+@[a-zA-Z0-9_\-.]+$/)]),
        password: new UntypedFormControl('', Validators.required)
    });

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    treeControl: FlatTreeControl<DevFileFlatNode>;
    treeFlattener: KbqTreeFlattener<DevFileNode, DevFileFlatNode>;

    dataSource: KbqTreeFlatDataSource<DevFileNode, DevFileFlatNode>;

    formControlDate: UntypedFormControl;
    formControlTime: UntypedFormControl;
    formControlInput: UntypedFormControl;
    formControlSelect: UntypedFormControl;
    formControlTreeSelect: UntypedFormControl;
    formControlTags: UntypedFormControl;
    formControlTagInputFormControl: UntypedFormControl;

    constructor(
        private formBuilder: UntypedFormBuilder,
        public changeDetectorRef: ChangeDetectorRef
    ) {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<DevFileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = devBuildFileTree(DEV_DATA_OBJECT, 0);

        this.reactiveForm = this.formBuilder.group({
            time: new UntypedFormControl(null, Validators.required),
            date: new UntypedFormControl(null, Validators.required),
            reactiveInputValue: new UntypedFormControl('', [
                Validators.required,
                Validators.pattern('[a-zA-Z]*')]),
            reactiveSelectValue: new UntypedFormControl('', [Validators.required]),
            reactiveTreeSelectValue: new UntypedFormControl('', [Validators.required]),
            reactiveTypeaheadValue: new UntypedFormControl([], Validators.required),
            tagInputFormControl: new UntypedFormControl('', [Validators.pattern('[a-zA-Z]*')])
        });

        this.reactiveForm.valueChanges.subscribe((value) => {
            console.log('reactiveForm valueChanges: ', value);
        });
        //
        this.inputControl.valueChanges.subscribe((value) => {
            console.log('inputControl valueChanges: ', value);
        });

        this.reactiveFormControl = this.formBuilder.group({});

        this.formControlDate = this.formBuilder.control(null, Validators.required);
        this.formControlTime = this.formBuilder.control(null, Validators.required);
        this.formControlInput = this.formBuilder.control(null, Validators.required);
        this.formControlSelect = this.formBuilder.control(null, Validators.required);
        this.formControlTreeSelect = this.formBuilder.control(null, Validators.required);
        this.formControlTags = this.formBuilder.control(null, Validators.required);
        this.formControlTagInputFormControl = this.formBuilder.control(null, Validators.required);
    }

    onSubmitReactiveForm(form: UntypedFormGroup) {
        console.log('onSubmitReactiveForm: ', form);
    }

    onSubmitReactiveFormControl(form: UntypedFormGroup) {
        console.log('onSubmitReactiveFormControl: ', form);
    }

    onSubmitTemplateForm(form: NgForm) {
        console.log('onSubmitTemplateForm: ', form);
    }

    onSubmitFormWithCustomValidator(form: UntypedFormGroup) {
        console.log('onSubmitFormWithCustomValidator: ', form);
    }

    hasChild(_: number, nodeData: DevFileFlatNode) {
        return nodeData.expandable;
    }

    reactiveInputOnCreate(event: KbqTagInputEvent): void {
        console.log(event);
        const input = event.input;
        const value = event.value;
        const control = this.reactiveForm.controls['reactiveTypeaheadValue'];

        if ((value || '').trim()) {
            this.reactiveTypeaheadItems.push(value.trim());
            control.patchValue(this.reactiveTypeaheadItems);
        }

        if (input) {
            input.value = '';
        }
    }

    reactiveFormControlInputOnCreate(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.reactiveFormControlTypeaheadItems.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    reactiveInputOnRemoveTag(tag: string): void {
        const index = this.reactiveTypeaheadItems.indexOf(tag);

        const control = this.reactiveForm.controls['reactiveTypeaheadValue'];

        if (index >= 0) {
            this.reactiveTypeaheadItems.splice(index, 1);
            control.patchValue(this.reactiveTypeaheadItems.slice());
        }
    }

    reactiveFormControlInputOnRemoveTag(tag: string): void {
        const index = this.reactiveFormControlTypeaheadItems.indexOf(tag);

        const control = this.reactiveForm.controls['reactiveTypeaheadValue'];

        if (index >= 0) {
            this.reactiveFormControlTypeaheadItems.splice(index, 1);
            control.patchValue(this.reactiveFormControlTypeaheadItems.slice());
        }
    }

    inputOnCreate(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.typeaheadItems.push(value.trim());
        }

        if (input) {
            input.value = '';
        }
    }

    inputOnRemoveTag(tag: string): void {
        const index = this.typeaheadItems.indexOf(tag);

        if (index >= 0) {
            this.typeaheadItems.splice(index, 1);
        }
    }

    private transformer = (node: DevFileNode, level: number, parent: any) => {
        const flatNode = new DevFileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: DevFileFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: DevFileFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: DevFileNode): DevFileNode[] => {
        return node.children;
    };

    private getValue = (node: DevFileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: DevFileFlatNode): string => {
        return `${node.name} view`;
    };
}
