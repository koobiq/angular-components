Эти изменения вошли в **Koobiq v21.0.0** — переход на Angular 21. Пошаговый сценарий обновления описан в [гайде по миграции](/ru/main/migration); ниже — полный список ломающих изменений.

### Angular 21

**Angular 21**. Библиотека обновлена до Angular 21: requiredAngularVersion стал `^21.0.0`, все peerDependencies публикуемых пакетов нацелены на `^21.0.0`. Потребителям необходимо обновиться до Angular 21 и TypeScript 5.9. Требования к Node.js — те же, что у Angular: 20.19, 22.12 или 24 и новее.

### Инструменты

| Пакет                     | Версия    |
| ------------------------- | --------- |
| TypeScript                | 5.9.3     |
| ng-packagr                | ^21.2.7   |
| @angular/build            | 21.2.25   |
| @angular-builders/jest    | 21.0.4    |
| @angular-eslint/\*        | ^21.4.0   |
| @schematics/angular       | 21.2.25   |
| @angular-devkit/architect | 0.2102.25 |

Приложения и библиотеки репозитория собираются сборщиками `@angular/build` (`application`, `dev-server`, `ng-packagr`), а корневой `tsconfig.json` использует `moduleResolution: "bundler"`.
