Поле с датой (дейтпикер) — специальное поле с виджетом для ввода даты.

<!-- example(datepicker-overview) -->

### Когда использовать

Используйте дейтпикер для ввода одиночной даты. Если нужно указать диапазон дат, используйте компонент выбора диапазона даты и времени.

Не используйте дейтпикер в тех случаях, когда пользователь точно знает нужную дату. Для ввода даты рождения достаточно простого поля ввода с маской.

### Структура компонента

-   Поле ввода
-   Маска
-   Кнопка открытия виджета
-   Виджет с календарем
    -   Переключатели года и месяца
    -   Кнопки листания месяца
    -   Кнопка быстрого перехода к текущему месяцу

<!-- example(datepicker-overview) -->

### Описание работы

#### Состояние по умолчанию

Поле пустое, виджет скрыт.

<!-- example(datepicker-overview) -->

#### Фокус с клавиатуры

##### Поле не заполнено

Поле подсвечивается.

Если начать ввод, маска исчезает.

<!-- example(datepicker-overview) -->

##### Поле заполнено

Поле подсвечивается, значение полностью выделяется.

Если начать ввод, значение стирается.

<!-- example(datepicker-not-empty) -->

#### Клик в поле с датой

Поле подсвечивается, открывается виджет с текущем месяцем. Каретка ввода остается в поле.

Если поле с датой не заполнено, то после его заполнения в виджете отобразится указанная дата.

Если поле с датой заполнено, то во время ее изменения меняется и виджет.

<!-- example(datepicker-not-empty) -->

#### Выбор даты

В большинстве случаев пользователю достаточно выбрать нужный день. Можно выбрать месяц и год с помощью одноименных кнопок в меню вверху виджета. После выбора дня виджет скрывается, результат записывается в поле. Фокус переходит в поле ввода.

<!-- example(datepicker-overview) -->

#### Ручной ввод даты

Пользователь может ввести полную дату вручную. После ввода двух цифр (день или месяц) подставляется точка, каретка перескакивает в следующую часть маски (в месяц или в год). После ввода четырех цифр года каретка не меняет своего положения, точка не подставляется.

Клавиши ↑ ↓ увеличивают или уменьшают выделенную часть маски (день, месяц или год) на 1. Увеличение (уменьшение) затрагивает только выделенную часть маски (например, в месяце за 12 следует 01, и наоборот).

Подробнее про ручной ввод см. в разделе [Фокус и работа с клавиатурой](/components/datepicker/overview#фокус-и-работа-с-клавиатурой).

##### Ввод двух цифр года

При вводе значения до 30 по уходу с поля подставляется текущее тысячелетие. Например, если пользователь ввел дату 12.04.23, то по уходу с поля значение преобразуется в 12.04.2023.

При вводе значения более 30 по уходу с поля подставляется прошедшее тысячелетие. Например, если пользователь ввел дату 12.04.65, то по уходу с поля значение преобразуется в 12.04.1965.

<br>
<div class="kbq-alert kbq-alert_warning">
    <i class="mc kbq-icon kbq-error_16 kbq-alert__icon"></i>
    Нужную вариацию выбирают дизайнер и аналитик в зависимости от задачи
</div>

#### Скрытие виджета

-   Кликнуть мимо виджета
-   Выбрать день
-   Нажать Esc

После закрытия виджета фокус получает поле ввода.

#### Положение виджета

Положение виджета подчиняется правилам позиционирования [дропдаун-меню](/components/dropdown/overview).

#### Локализация дат

Дейтпикер учитывает особенности страны и правильно форматирует значение. Ожидаемый формат даты выводится как плейсхолдер.

<!-- cspell:ignore Português, فارسی -->

| Язык      | Плейсхолдер  |
| --------- | ------------ |
| English   | yyyy-mm-dd   |
| 简体中文  | 年/月/日     |
| Español   | dd/mm/aaaa   |
| Português | dd/mm/yyyy   |
| Русский   | дд.мм.гггг   |
| فارسی     | روز/ ماه/سال |

<!-- example(datepicker-language) -->

### Фокус и работа с клавиатурой

| Клавиша                                                                                                                       | Действие                                 |
| ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| <span class="hot-key-button">Tab</span> \ <span class="hot-key-button">Shift</span> + <span class="hot-key-button">Tab</span> | Перевести фокус в поле (из поля) с датой |
| <span class="hot-key-button">alt</span> + <span class="hot-key-button">↓</span>                                               | Открыть виджет с календарем              |
| <span class="hot-key-button">alt</span> + <span class="hot-key-button">↑</span>                                               | Закрыть виджет с календарем              |
| <span class="hot-key-button">Esc</span>                                                                                       | Закрыть виджет                           |

**Поле с датой**

| Клавиша                                                                             | Действие                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span class="hot-key-button">Tab</span>                                             | Перевести фокус на кнопку открытия виджета                                                                                                                                                                                                                                                                                                        |
| <span class="hot-key-button">↑</span> <span class="hot-key-button">↓</span>         | Каретка установлена на любой части маски (день, месяц или год) → уменьшение или увеличение значения на 1                                                                                                                                                                                                                                          |
| <span class="hot-key-button">→</span>                                               | Перенести каретку на следующий символ.<br>Если каретка установлена в конце поля ввода — поместить каретку в начало поля ввода                                                                                                                                                                                                                     |
| <span class="hot-key-button">←</span>                                               | Перенести каретку на предыдущий символ.<br>Если каретка установлена в начале поля ввода — поместить каретку в конец поля ввода                                                                                                                                                                                                                    |
| <span class="hot-key-button">PgDn</span> \ <span class="hot-key-button">Home</span> | Поместить каретку в начало поля ввода                                                                                                                                                                                                                                                                                                             |
| <span class="hot-key-button">PgDn</span> \ <span class="hot-key-button">End</span>  | Поместить каретку в конец поля ввода                                                                                                                                                                                                                                                                                                              |
| <span class="hot-key-button">Space</span>                                           | — Если в любой части маски (день, месяц или год) → ничего не происходит<br>— Если после ввода двух цифр (день или месяц) → переход к следующей части маски (месяц или год)<br>— Если после ввода одной цифры (в день или месяц) → поле воспринимает эту клавишу как разделитель, подставляется точка, а перед введенной цифрой подставляется ноль |

### Валидация

#### Проверка во время ввода

**Ввод букв и символов**

Срабатывает [валидация во время ввода значений](/other/validation/overview#во-время-ввода-значения):

-   При вводе букв в любую часть маски
-   При вводе первого символа, кроме цифр, в день или месяц
-   При вводе символа, кроме цифр, в год

<!-- example(datepicker-overview) -->

**Ввод символов и цифр**

Если после ввода двух цифр (в день или месяц) вводится любой символ, кроме цифр и букв, поле игнорирует этот ввод.

Если после ввода одной цифры (в день или месяц) вводится любой символ, кроме цифр и букв, поле воспринимает этот символ как разделитель и преобразует его в точку, а перед введенной цифрой подставляется ноль.

Если ввести значения больше 31 (для дня) и 12 (для месяца), то при вводе значения в следующую часть маски эти значения преобразуются в 31 (для дня) и 12 (для месяца).

<!-- example(datepicker-overview) -->

#### Проверка при потере фокуса

Если указана одна или три цифры года, поле получается состояние ошибки с текстом: «Укажите две или четыре цифры года».

Если количество введенных дней не соответствует введенному месяцу, поле получает состояние ошибки с текстом о том, сколько дней должно быть в указанном месяце.

При открытии виджета с календарем показана текущая дата.

<!-- example(datepicker-overview) -->

#### Проверка скопированных значений

При копировании значений из буфера или вставке их с помощью drag-and-drop срабатывает [валидация при потере фокуса](/other/validation/overview#по-уходу-с-поля-%28по-потере-фокуса%29).

Если в скопированном значении содержались символы кроме цифр и букв, к ним применяются правила из раздела выше «Ввод символов и цифр».

<!-- example(datepicker-overview) -->

### Дизайн и анимация

Ширина поля — 136px.

Размер виджета — w:296px; h:348px

### Дополнительно

#### Использование Datepicker и Timepicker вместе

Это пример совместного использования Datepicker и [Timepicker](/components/timepicker/overview) для выбора определенной даты и времени. Этот подход удобен в тех случаях, когда требуется задать точное время события или дедлайна.

<div style="margin-top: 15px;">
    <img src="./assets/images/timepicker/timepicker-with-datepicker.png" alt="Using timepicker with datepicker" width="100%"/>
</div>

Пользователь может выбрать дату через Datepicker, а затем указать конкретное время через Timepicker.

<!-- Example from DS-2490 -->
