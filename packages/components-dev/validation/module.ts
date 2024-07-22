/* tslint:disable:no-console no-reserved-keywords */
import { ChangeDetectorRef, Component, NgModule, ViewEncapsulation } from '@angular/core';
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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KBQ_LUXON_DATE_FORMATS, LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import { COMMA, ENTER } from '@koobiq/cdk/keycodes';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { DateAdapter, KBQ_DATE_FORMATS, KBQ_DATE_LOCALE, ThemePalette } from '@koobiq/components/core';
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

export class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
}

export const DATA_OBJECT = {
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        PhotoBoothLibrary: {
            Contents: 'dir',
            Pictures_2: 'dir'
        }
    },
    Documents: {
        Pictures_3: 'Pictures',
        angular: {
            src: {
                core: 'ts',
                compiler: 'ts'
            }
        },
        material2: {
            src: {
                button: 'ts',
                checkbox: 'ts',
                input: 'ts'
            }
        }
    },
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf'
    },
    Applications: {
        Chrome: 'app',
        Calendar: 'app',
        Webstorm: 'app'
    }
};

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
export function buildFileTree(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === undefined) {
            // no action
        } else if (typeof v === 'object') {
            node.children = buildFileTree(v, level + 1);
        } else {
            node.type = v;
        }

        data.push(node);
    }

    return data;
}

export function ldapLoginValidator(loginRegex: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const allowed = loginRegex.test(control.value);

        return allowed ? null : { ldapLogin: { value: control.value } };
    };
}

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: KBQ_DATE_LOCALE, useValue: 'en' },
        {
            provide: KBQ_DATE_FORMATS,
            useFactory: () => ({ ...KBQ_LUXON_DATE_FORMATS, dateInput: 'yyyy-MM-dd' })
        },
        {
            provide: DateAdapter,
            useFactory: (locale: string) => new LuxonDateAdapter(locale),
            deps: [KBQ_DATE_LOCALE]
        }
    ]
})
export class DemoComponent {
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

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

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

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);

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
            console.log('reactiveForm valueChanges: ', value); // tslint:disable-line:no-console
        });
        //
        this.inputControl.valueChanges.subscribe((value) => {
            console.log('inputControl valueChanges: ', value); // tslint:disable-line:no-console
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

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    reactiveInputOnCreate(event: KbqTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        if ((value || '').trim()) {
            this.reactiveTypeaheadItems.push(value.trim());
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

        if (index >= 0) {
            this.reactiveTypeaheadItems.splice(index, 1);
        }
    }

    reactiveFormControlInputOnRemoveTag(tag: string): void {
        const index = this.reactiveFormControlTypeaheadItems.indexOf(tag);

        if (index >= 0) {
            this.reactiveFormControlTypeaheadItems.splice(index, 1);
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

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    };

    private getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: FileFlatNode): string => {
        return `${node.name} view`;
    };
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
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
        KbqTimepickerModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
