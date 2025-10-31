import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KBQ_LOCALE_SERVICE } from '@koobiq/components/core';
import { KbqFileUploadModule, KbqInputFileLabel, KbqInputFileMultipleLabel } from '@koobiq/components/file-upload';
import { KbqIconModule } from '@koobiq/components/icon';
import { of, skip } from 'rxjs';

const localeData = {
    'en-US': {
        single: {
            captionText: 'Drop file here or {{ browseLink }}',
            browseLink: 'secure upload',
            title: 'Submit security file'
        } satisfies Partial<KbqInputFileLabel>,

        multiple: {
            captionText: 'Drop reports here or {{ browseLink }}',
            captionTextWhenSelected: 'Add more evidence or {{ browseLink }}',
            captionTextForCompactSize: 'Attach logs or {{ browseLink }}',
            browseLink: 'secure upload',
            title: 'Submit security files'
        } satisfies Partial<KbqInputFileMultipleLabel>
    },

    'es-LA': {
        single: {
            captionText: 'Arrastra archivo aquí o {{ browseLink }}',
            browseLink: 'subida segura',
            title: 'Enviar archivo de seguridad'
        } satisfies Partial<KbqInputFileLabel>,

        multiple: {
            captionText: 'Arrastra reportes aquí o {{ browseLink }}',
            captionTextWhenSelected: 'Agrega evidencia o {{ browseLink }}',
            captionTextForCompactSize: 'Adjunta logs o {{ browseLink }}',
            browseLink: 'subida segura',
            title: 'Enviar archivos de seguridad'
        } satisfies Partial<KbqInputFileMultipleLabel>
    },

    'pt-BR': {
        single: {
            captionText: 'Arraste arquivo aqui ou {{ browseLink }}',
            browseLink: 'upload seguro',
            title: 'Enviar arquivo de segurança'
        } satisfies Partial<KbqInputFileLabel>,

        multiple: {
            captionText: 'Arraste relatórios aqui ou {{ browseLink }}',
            captionTextWhenSelected: 'Adicione evidências ou {{ browseLink }}',
            captionTextForCompactSize: 'Anexe logs ou {{ browseLink }}',
            browseLink: 'upload seguro',
            title: 'Enviar arquivos de segurança'
        } satisfies Partial<KbqInputFileMultipleLabel>
    },

    'ru-RU': {
        single: {
            captionText: 'Перетащите файл сюда или {{ browseLink }}',
            browseLink: 'безопасная загрузка',
            title: 'Загрузка файла безопасности'
        } satisfies Partial<KbqInputFileLabel>,

        multiple: {
            captionText: 'Перетащите отчёты сюда или {{ browseLink }}',
            captionTextWhenSelected: 'Добавьте доказательства или {{ browseLink }}',
            captionTextForCompactSize: 'Прикрепите логи или {{ browseLink }}',
            browseLink: 'безопасная загрузка',
            title: 'Загрузка файлов безопасности'
        } satisfies Partial<KbqInputFileMultipleLabel>
    }
};

/**
 * @title File-upload custom text via input example
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'file-upload-custom-text-via-input-example',
    template: `
        <kbq-file-upload multiple [localeConfig]="multipleLocaleConfig()">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-file-upload>

        <kbq-file-upload [localeConfig]="singleLocaleConfig()">
            <ng-template #kbqFileIcon>
                <i kbq-icon="kbq-file-o_16"></i>
            </ng-template>
        </kbq-file-upload>
    `,
    imports: [
        KbqFileUploadModule,
        KbqIconModule
    ],
    host: {
        class: 'layout-column layout-gap-l'
    }
})
export class FileUploadCustomTextViaInputExample {
    private readonly exampleDefaultLocale = 'en-US';
    protected readonly localeId = toSignal(
        inject(KBQ_LOCALE_SERVICE, { optional: true })?.changes.pipe(skip(1)) ?? of(this.exampleDefaultLocale),
        { initialValue: this.exampleDefaultLocale }
    );
    protected readonly multipleLocaleConfig = computed(() => {
        const selectedLocaleData = localeData[this.localeId()] ?? localeData[this.exampleDefaultLocale];

        return selectedLocaleData.multiple;
    });

    protected readonly singleLocaleConfig = computed(() => {
        const selectedLocaleData = localeData[this.localeId()] ?? localeData[this.exampleDefaultLocale];

        return selectedLocaleData.single;
    });
}
