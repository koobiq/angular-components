import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    KbqFilter,
    KbqFilterBarModule,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSelectValue
} from '@koobiq/components/filter-bar';

type SelectPipeType = KbqPipeTypes.Select | KbqPipeTypes.MultiSelect;

type PipeTruncationType = SelectPipeType | KbqPipeTypes.Text;

interface PipeTruncationCase {
    id: string;
    label: string;
    filter: KbqFilter;
    template: KbqPipeTemplate;
}

interface PipeTruncationGroup {
    title: string;
    type: PipeTruncationType;
    cases: PipeTruncationCase[];
}

const SHORT_OPTION: KbqSelectValue = { name: 'Файл', value: 'short', id: 'short' };
const LONG_OPTION: KbqSelectValue = {
    name: 'Исходный код и развернутое приложение из внешнего репозитория',
    value: 'long',
    id: 'long'
};
const OTHER_OPTION: KbqSelectValue = { name: 'Прочее', value: 'other', id: 'other' };

const SHORT_NAME = 'Тип';
const LONG_NAME = 'Источник исходного кода и развернутое приложение';
const SHORT_TEXT_VALUE = 'Файл';
const LONG_TEXT_VALUE = LONG_OPTION.name;

function createPipeTruncationCase(
    type: SelectPipeType,
    id: string,
    label: string,
    name: string,
    selectedOption: KbqSelectValue | KbqSelectValue[] | null,
    options: KbqSelectValue[] = [SHORT_OPTION, LONG_OPTION],
    selectedAllEqualsSelectedNothing?: boolean
): PipeTruncationCase {
    const value = selectedOption
        ? type === KbqPipeTypes.MultiSelect
            ? Array.isArray(selectedOption)
                ? selectedOption
                : [selectedOption]
            : selectedOption
        : null;
    const hasLongText =
        name.length > 20 ||
        (Array.isArray(selectedOption)
            ? selectedOption.some((option) => option.name.length > 20)
            : (selectedOption?.name.length ?? 0) > 20);

    return {
        id,
        label,
        filter: {
            name: id,
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    id,
                    name,
                    type,
                    value,
                    cleanable: hasLongText,
                    removable: false,
                    disabled: false,
                    selectedAllEqualsSelectedNothing
                }
            ]
        },
        template: {
            id,
            name,
            type,
            values: options,
            cleanable: hasLongText,
            removable: false,
            disabled: false
        }
    };
}

function createPipeTruncationCases(type: SelectPipeType): PipeTruncationCase[] {
    const typeName = type === KbqPipeTypes.Select ? 'select' : 'multiselect';

    return [
        createPipeTruncationCase(
            type,
            `${typeName}-short-name-short-value`,
            'Короткое название + короткое значение',
            SHORT_NAME,
            SHORT_OPTION
        ),
        createPipeTruncationCase(
            type,
            `${typeName}-short-name-long-value`,
            'Короткое название + длинное значение',
            SHORT_NAME,
            LONG_OPTION
        ),
        createPipeTruncationCase(
            type,
            `${typeName}-long-name-short-value`,
            'Длинное название + короткое значение',
            LONG_NAME,
            SHORT_OPTION
        ),
        createPipeTruncationCase(
            type,
            `${typeName}-long-name-long-value`,
            'Длинное название + длинное значение',
            LONG_NAME,
            LONG_OPTION
        ),
        ...(type === KbqPipeTypes.MultiSelect ? [
                  createPipeTruncationCase(
                      type,
                      `${typeName}-long-name-two-values`,
                      'Длинное название + 2 выбранные опции',
                      LONG_NAME,
                      [SHORT_OPTION, LONG_OPTION],
                      [SHORT_OPTION, LONG_OPTION, OTHER_OPTION],
                      false
                  )
              ] : []),
        createPipeTruncationCase(
            type,
            `${typeName}-empty-short-name`,
            'Пустой пайп + короткое название',
            SHORT_NAME,
            null
        ),
        createPipeTruncationCase(type, `${typeName}-empty-long-name`, 'Пустой пайп + длинное название', LONG_NAME, null)
    ];
}

function createTextPipeTruncationCases(): PipeTruncationCase[] {
    const createCase = (id: string, label: string, name: string, value: string): PipeTruncationCase => {
        const hasLongText = name.length > 20 || value.length > 20;

        return {
            id,
            label,
            filter: {
                name: id,
                readonly: false,
                disabled: false,
                changed: false,
                saved: false,
                pipes: [
                    {
                        id,
                        name,
                        type: KbqPipeTypes.Text,
                        value,
                        cleanable: hasLongText,
                        removable: false,
                        disabled: false
                    }
                ]
            },
            template: {
                id,
                name,
                type: KbqPipeTypes.Text,
                cleanable: hasLongText,
                removable: false,
                disabled: false
            }
        };
    };

    return [
        createCase(
            'text-short-name-short-value',
            'Короткое название + короткое значение',
            SHORT_NAME,
            SHORT_TEXT_VALUE
        ),
        createCase('text-short-name-long-value', 'Короткое название + длинное значение', SHORT_NAME, LONG_TEXT_VALUE),
        createCase('text-long-name-short-value', 'Длинное название + короткое значение', LONG_NAME, SHORT_TEXT_VALUE),
        createCase('text-long-name-long-value', 'Длинное название + длинное значение', LONG_NAME, LONG_TEXT_VALUE)
    ];
}

@Component({
    selector: 'dev-filter-bar-pipe-truncation-example',
    imports: [KbqFilterBarModule],
    templateUrl: './pipe-truncation-example.html',
    styleUrls: ['./pipe-truncation-example.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevFilterBarPipeTruncationExample {
    readonly groups: PipeTruncationGroup[] = [
        {
            title: 'Select',
            type: KbqPipeTypes.Select,
            cases: createPipeTruncationCases(KbqPipeTypes.Select)
        },
        {
            title: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            cases: createPipeTruncationCases(KbqPipeTypes.MultiSelect)
        },
        {
            title: 'Text',
            type: KbqPipeTypes.Text,
            cases: createTextPipeTruncationCases()
        }
    ];
}
