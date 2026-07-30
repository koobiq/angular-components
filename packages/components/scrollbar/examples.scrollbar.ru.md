## Отображение скроллбара

Входной параметр `kbqScrollbarVisibility` управляет тем, когда показываются кастомные трек и ползунок — `hover`, `always`, `scroll` или `hidden`; скролл при этом всегда остаётся рабочим.

<!-- example(private-scrollbar-visibility) -->

## Виртуальный скролл

Директива `kbqScrollbarVirtualViewport` помечает вложенный `cdk-virtual-scroll-viewport` как элемент, который `kbqScrollbar` должен измерять, слушать и скроллить вместо собственного хоста.

<!-- example(private-scrollbar-virtual-scroll) -->

## Программное управление скроллом

Через `exportAs="kbqScrollbar"` директива открывает методы `scrollTo`, `scrollToElement`, `scrollToTop`/`scrollToBottom`, `scrollStart`/`scrollEnd`, а также сигналы `isTopReached`/`isBottomReached`/`isStartReached`/`isEndReached`.

<!-- example(private-scrollbar-scroll-to) -->

## Поддержка RTL

Скроллбар учитывает направление, заданное родительским элементом (например, через `Directionality`/`Dir`), и соответствующим образом изменяет перетаскивание, `scrollStart`/`scrollEnd` и состояние достижения краёв.

<!-- example(private-scrollbar-rtl) -->

## Нативный скроллбар

Значение `native: true`, переданное через `kbqScrollbarConfigProvider`, полностью переключает директиву на нативный скроллбар браузера вместо пользовательского трека/ползунка — так же, как это происходит автоматически на устройствах с сенсорным вводом.

<!-- example(private-scrollbar-native) -->

## Отключение взаимодействия

Входной параметр `kbqScrollbarDisableInteraction` оставляет скролл рабочим, но отключает перетаскивание ползунка и клик по треку.

<!-- example(private-scrollbar-disable-interaction) -->
