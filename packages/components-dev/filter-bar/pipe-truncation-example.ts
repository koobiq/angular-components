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
const MEDIUM_OPTION: KbqSelectValue = { name: 'Отдел безопасности', value: 'medium', id: 'medium' };
const LONG_OPTION: KbqSelectValue = {
    name: 'Исходный код и развернутое приложение из внешнего репозитория',
    value: 'long',
    id: 'long'
};
const OTHER_OPTION: KbqSelectValue = { name: 'Прочее', value: 'other', id: 'other' };

const SHORT_NAME = 'Тип';
const MEDIUM_NAME = 'Ответственный отдел';
const LONG_NAME = 'Источник исходного кода и развернутое приложение';
const SHORT_TEXT_VALUE = 'Файл';
const MEDIUM_TEXT_VALUE = MEDIUM_OPTION.name;
const LONG_TEXT_VALUE = LONG_OPTION.name;

function createPipeTruncationCase(
    type: PipeTruncationType,
    id: string,
    label: string,
    name: string,
    selectedValue: KbqSelectValue | KbqSelectValue[] | string | null,
    options: KbqSelectValue[] = [SHORT_OPTION, MEDIUM_OPTION, LONG_OPTION],
    selectedAllEqualsSelectedNothing?: boolean
): PipeTruncationCase {
    const value = selectedValue
        ? type === KbqPipeTypes.MultiSelect
            ? Array.isArray(selectedValue)
                ? selectedValue
                : [selectedValue]
            : selectedValue
        : null;

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
                    cleanable: selectedValue !== null,
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
            ...(type === KbqPipeTypes.Text ? {} : { values: options }),
            cleanable: true,
            removable: false,
            disabled: false
        }
    };
}

function createPipeTruncationCases(type: PipeTruncationType): PipeTruncationCase[] {
    const typeName = type;

    if (type === KbqPipeTypes.Text) {
        return [
            createPipeTruncationCase(
                type,
                'text-short-name-short-value',
                'Короткое название + короткое значение',
                SHORT_NAME,
                SHORT_TEXT_VALUE
            ),
            createPipeTruncationCase(
                type,
                'text-medium-name-medium-value',
                'Название средней длины + значение средней длины',
                MEDIUM_NAME,
                MEDIUM_TEXT_VALUE
            ),
            createPipeTruncationCase(
                type,
                'text-short-name-long-value',
                'Короткое название + длинное значение',
                SHORT_NAME,
                LONG_TEXT_VALUE
            ),
            createPipeTruncationCase(
                type,
                'text-long-name-short-value',
                'Длинное название + короткое значение',
                LONG_NAME,
                SHORT_TEXT_VALUE
            ),
            createPipeTruncationCase(
                type,
                'text-long-name-long-value',
                'Длинное название + длинное значение',
                LONG_NAME,
                LONG_TEXT_VALUE
            )
        ];
    }

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
            `${typeName}-medium-name-medium-value`,
            'Название средней длины + значение средней длины',
            MEDIUM_NAME,
            MEDIUM_OPTION
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
            cases: createPipeTruncationCases(KbqPipeTypes.Text)
        }
    ];
}
