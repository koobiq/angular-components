Структура каталогов верхнего уровня:

```
├─ docs ····················· Проектная документация и руководства
├─ scripts ·················· Общедоступные скрипты sh
├─ packages ················· Общедоступные пакеты и исходный код компонентов
├─ tests ···················· Конфигурации для тестов
├─ tools ···················· инфраструктура/сценарии сборки
└─ package.json ············· Project config
```

### packages

```
├─ cdk ························· Component Development Kit
├─ components ·················· Исходный код компонентов
├─ components-dev ·············· Внутренние dev примеры
├─ components-experimental ····· Прототипы и эксперименты
└─ docs-examples ··············· Примеры для сайта документации
```

#### @koobiq/button

```
└─ button ···························· Имя компонента
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
