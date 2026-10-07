Эти изменения вошли в **Koobiq v21.0.0** — переход на Angular 21. Пошаговый сценарий обновления описан в [гайде по миграции](/ru/main/migration); ниже — полный список ломающих изменений.

### Angular 21

**Angular 21**. Библиотека обновлена до Angular 21: requiredAngularVersion стал `^21.0.0`, все peerDependencies публикуемых пакетов нацелены на `^21.0.0`. Потребителям необходимо обновиться до Angular 21 и TypeScript 5.9. Требования к Node.js — те же, что у Angular: 20.19, 22.12 или 24 и новее.

### Инструменты

| Пакет                     | Версия    |
| ------------------------- | --------- |
| TypeScript                | 5.9.3     |
| ng-packagr                | ^21.2.7   |
| @angular/build            | 21.2.25   |
| vitest                    | 4.1.11    |
| @analogjs/vitest-angular  | 2.8.0     |
| @angular-eslint/\*        | ^21.4.0   |
| @schematics/angular       | 21.2.25   |
| @angular-devkit/architect | 0.2102.25 |

Приложения и библиотеки репозитория собираются сборщиками `@angular/build` (`application`, `dev-server`, `ng-packagr`), а корневой `tsconfig.json` использует `moduleResolution: "bundler"`. Юнит-тесты запускаются Vitest с `@analogjs/vitest-angular` вместо Jest.

### Обнаружение изменений без zone.js

Компоненты больше не зависят от zone.js: они работают в приложении, запущенном с `provideZonelessChangeDetection()`, и по-прежнему работают с `provideZoneChangeDetection()`. То, что ждало `NgZone.onStable`, теперь выполняется после следующей отрисовки. Сайт документации, шаблон StackBlitz и приложения для разработки в репозитории работают без zone.js.

`MockNgZone` удален из `@koobiq/components/core`: библиотека больше не ждет `onStable`, и его `simulateZoneExit()` нечего выполнять. Чем заменить его в тестах, описано в [руководстве по миграции](/ru/main/migration), а схематик `zoneless-change-detection` сообщает о каждом использовании.

В приложении без zone.js select, открытый мышью, переводит фокус в поле поиска или на активную опцию — так же, как при открытии с клавиатуры, поэтому, пока панель открыта, у form-field нет рамки фокуса. С zone.js form-field возвращал себе фокус в том же клике.

### Оверлеи

CDK 21 по умолчанию показывает оверлеи как popover в верхнем слое браузера (top layer), и компоненты сохраняют это поведение: их панели рисуются поверх всей страницы, какие бы контексты наложения ни окружали триггер. `z-index` у `.cdk-overlay-container` больше не задает их порядок относительно собственных фиксированных элементов приложения; приложение, которое на это полагалось, может отключить popover через `OVERLAY_DEFAULT_CONFIG` (`usePopover: false`) из `@angular/cdk/overlay`. `KbqActionsPanel`, открытый с `overlayContainer`, по-прежнему отображается внутри этого контейнера.

### Анимации

Компоненты больше не используют `@angular/animations`, который Angular объявил устаревшим: их движение задается в CSS: это анимации и переходы, окончания которых компоненты дожидаются сами, и `animate.enter` / `animate.leave` в шаблонах. `@angular/animations` больше не входит в peer-зависимости, `ng add` больше не устанавливает его и не добавляет `provideAnimations()`, и ни одно приложение репозитория от него не зависит. Движение отключается при `prefers-reduced-motion: reduce` и через `KBQ_ANIMATIONS_CONFIG` (`animationsDisabled: true`).

Экспортируемые компонентами триггеры и члены, принимавшие или отдававшие `AnimationEvent`, удалены. Они перечислены вместе с заменами в [руководстве по миграции](/ru/main/migration), а схематик `angular-animations-removal` сообщает о каждом использовании.
