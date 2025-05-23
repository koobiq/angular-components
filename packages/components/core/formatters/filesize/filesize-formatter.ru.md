**Filesize formatter** нужен для удобного форматирования размера файлов (или любых числовых значений в байтах) в читаемый вид, понятный человеку. Он автоматически конвертирует в килобайты, мегабайты, гигабайты и т. д., учитывая локализацию, также можно настроить округление.

<!-- example(filesize-formatter-overview) -->

### Подключение

Добавьте `KbqDataSizePipe` в `imports` компонента. Он работает как стандартный [`Angular pipe`](https://angular.dev/guide/templates/pipes):

```ts
import { KbqDataSizePipe } from '@koobiq/components/core';

@Component({
    imports: [KbqDataSizePipe],
    template: `
        <div>{{ 1024 | kbqDataSize }}</div>
    `
})
```

### Использование в компонентах

Форматер поддерживает локализацию, выбор системы измерения (SI/IEC) и настройку точности округления.

#### Локальная настройка

Можно задать параметры напрямую в шаблоне с помощью аргументов пайпа:

```ts
@Component({
    imports: [KbqDataSizePipe],
    template: `
        <div>{{ 1536 | kbqDataSize : 1 : 'IEC' : 'en-US' }}</div><!-- 1.5 KB -->
    `
})
```

#### Глобальная настройка через DI

Для задания общих параметров форматирования во всем приложении или модуле используйте провайдер:

```ts
import { kbqFilesizeFormatterConfigurationProvider } from '@koobiq/components/core';

@NgModule({
    providers: [
        kbqFilesizeFormatterConfigurationProvider({
            defaultPrecision: 3,
            defaultUnitSystem: 'SI'
        })
    ]
})
```
