Структура каталогов верхнего уровня:

```
├─ docs ····················· Проектная документация и руководства
├─ scripts ·················· Общедоступные скрипты sh
├─ packages ··················Общедоступные пакеты и исходный код компонентов
├─ tests ···················· Конфигурации для тестов
├─ tools ···················· инфраструктура/сценарии сборки
└─ package.json ············· Project config
``` 

### packages

```
├─ cdk ················· component development kit
├─ components ·········· исходный код компонентов
├─ components-dev ······ внутренние dev примеры
└─ docs-examples ······· примеры для сайта документации
```

#### @koobiq/button

```
└─ button ···························· имя компоненты
    ├─ _button-base.scss ············· Базовые стили компонента (включают button.scss)
    ├─ _button-theme.scss ············ Стили темы & типографики (включают to _all-themes & _all-typography)
    ├─ button.component.html ········· Шаблон компонента
    ├─ button.component.spec.ts
    ├─ button.component.ts
    ├─ button.md ····················· Документация компонента
    ├─ button.module.ts
    ├─ button.scss ··················· Основные стили (inline to component)
    ├─ index.ts ······················ Основная точка входа
    ├─ public-api.ts ················· Общедоступные exports
    ├─ README.md
    └─ tsconfig.build.json
```
