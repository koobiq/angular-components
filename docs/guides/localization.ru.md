## Локализация

Компоненты Koobiq выводят собственные строки — меню фильтров в filter bar, подсказки в code block,
доступные имена всех кнопок-иконок, плейсхолдер поля даты и так далее. Все они приходят из одного места:
`KbqLocaleService`.

Ваши данные не переводятся. Названия опций, значения фильтров, ячейки таблиц и всё остальное, что вы
передаёте в компонент, остаётся ровно таким, как вы его написали.

Доступные идентификаторы локали: `en-US`, `es-LA`, `pt-BR`, `ru-RU` и `tk-TM`.

### Подключение локали

`KbqLocaleService` объявлен как `providedIn: 'root'`, но компоненты читают его через токен
`KBQ_LOCALE_SERVICE`, у которого нет фабрики. Пока вы не предоставите его, локализация не работает:

```ts
import { KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';

bootstrapApplication(AppComponent, {
    providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
});
```

Без этого провайдера каждый компонент использует собственные значения по умолчанию (`ru-RU`), а смена
локали во время работы приложения ничего не меняет.

Управлять активной локалью можно тремя способами:

- **`KBQ_DEFAULT_LOCALE_ID`** — значение по умолчанию, `ru-RU`. Это обычная экспортируемая константа, а не
  injection token: её нельзя предоставить, только прочитать.
- **`KBQ_LOCALE_ID`** фиксирует локаль один раз, в момент создания `KbqLocaleService`. Токен должен лежать
  в **том же массиве `providers`**, что и сам сервис, потому что сервис читает его из создавшего инжектора.
- **`setLocale(id)`** меняет локаль во время работы приложения.

```ts
providers: [
    { provide: KBQ_LOCALE_ID, useValue: 'en-US' },
    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
];
```

Чтение активной локали:

```ts
readonly localeService = inject(KBQ_LOCALE_SERVICE);

readonly currentLocale = this.localeService.localeId;   // Signal<KbqLocaleIdLike>
readonly localeData = this.localeService.data;          // Signal<KbqLocaleData>
readonly available = this.localeService.items;          // Signal<KbqLocaleItem[]>, для выбора локали
```

`changes` (`BehaviorSubject`), `id` и `current` продолжают работать и синхронизированы с сигналами. В новом
коде используйте сигналы: чтение сигнала в шаблоне регистрируется на читающем представлении, поэтому
`setLocale()` во время работы приложения доходит до `OnPush`-потомков, чего подписка в родителе сделать
не может.

### Переопределение строк одного компонента

У каждого локализованного компонента есть токен конфигурации и соответствующий провайдер. Переопределяются
только переданные ключи — остальные сохраняют значения по умолчанию:

```ts
import { kbqCodeBlockLocaleConfigurationProvider } from '@koobiq/components/code-block';

providers: [kbqCodeBlockLocaleConfigurationProvider({ copyTooltip: 'Скопировать фрагмент' })];
```

Эти токены работают и в element injector, поэтому провайдер на компоненте ограничивает переопределение его
поддеревом.

Обратите внимание на приоритет: сервис локали важнее токена. Если нужны оба, зарегистрируйте
переопределение как локаль (см. ниже) или отключите сервис для поддерева через
`{ provide: KBQ_LOCALE_SERVICE, useValue: null }`.

### Регистрация собственной локали

`addLocale()` принимает частичные данные — каждая секция и каждый ключ внутри секции необязательны. Всё,
что вы не указали, дополняется из поставляемой локали с тем же идентификатором, а для нового
идентификатора — из `KBQ_DEFAULT_LOCALE_ID`. Поэтому `getParams()` всегда возвращает полную секцию,
что бы вы ни зарегистрировали:

```ts
localeService.addLocale('en-GB', {
    select: { selectAll: 'Select everything' },
    a11y: { close: 'Dismiss' }
});
```

Те же данные можно передать заранее через `KBQ_LOCALE_DATA`:

```ts
{ provide: KBQ_LOCALE_DATA, useValue: { 'en-GB': { select: { selectAll: 'Select everything' } } } }
```

Полный контракт описан типом `KbqLocaleData`, поэтому опечатка в названии секции или ключа — это ошибка
компиляции, а не строка, которая молча никогда не появится.

### Чтение секции напрямую

```ts
const { selectAll } = localeService.getParams('select'); // KbqSelectLocaleConfiguration
const select = localeService.params('select'); // Signal<KbqSelectLocaleConfiguration>
```

Название секции проверяется по `KbqLocaleSection`, а тип результата выводится из него.

### Даты и числа

Адаптеры дат и числовые пайпы используют тот же сервис, но им нужны собственные провайдеры. Учтите, что
`KbqLocaleServiceModule` — его подключают модули адаптеров дат — регистрирует `KBQ_LOCALE_SERVICE` через
`useClass`, а значит создаёт **второй экземпляр**, независимый от `providedIn: 'root'`. Если менять локаль
на одном, а читать с другого, ничего не произойдёт. Всегда инжектируйте токен `KBQ_LOCALE_SERVICE`,
а не класс `KbqLocaleService`.

Чтобы ограничить локаль поддеревом, в котором есть даты, объявите адаптер и форматтер в том же массиве
`providers`: `imports: [KbqLuxonDateModule]` помещает их в environment injector, где они получат корневой
сервис локали и выведут названия месяцев на другом языке.
