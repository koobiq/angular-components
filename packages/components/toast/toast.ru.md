Тост — это немодальное сообщение поверх всех элементов на экране. Отличается от всплывающего окна тем, что выводится в правом верхнем углу экрана и не привязан ни к какому конкретному элементу интерфейса. Его используют, когда не требуется обязательная реакция пользователя (то есть не нужно модальное окно).

<!-- example(toast-overview) -->

### Описание работы

#### Длина сообщения

Рекомендованная длина сообщения — 144 символа, заголовка — 80 символов. Длинный текст не обрезается, тост увеличивается по высоте.

#### Виды тостов

**Информация.** Любое сообщение от системы, которое не требует немедленной реакции или для которого не нашлось места, чтобы встроить в контент на экране. Например, может сообщать, что по команде пользователя запущена фоновая операция.

**Успех.** Сообщение о выполненной операции. Может содержать кнопку «Отмена». Полезно предложить пользователю просмотреть результат операции, если это возможно.

**Предупреждение.** Помогает пользователю избежать ошибки. Этот вид тостов используется редко.

**Ошибка.** Сообщает о неуспешной операции, когда ситуация не требует немедленного вмешательства пользователя, и можно продолжить работу.

<!-- example(toast-types-overview) -->

#### Появление сообщений

Тост появляется в правом верхнем углу. Несколько сообщений образуют стопку на экране. Новые сообщения появляются внизу списка. Если тостов много, то новые уходят даже за нижнюю границу видимой области. Чаще всего тост открывается в качестве реакции на команду пользователя, но система может показывать уведомления и самостоятельно.

#### Исчезновение

По умолчанию тост скрывается автоматически. Сообщение должно находиться в списке тостов минимум 5 секунд перед скрытием. Тосты пропадают с интервалом в 2 секунды после последнего скрытия, автоматического или ручного, чтобы пользователь успел прочитать текст в них, а исчезновение не воспринималось внезапным.

##### По таймеру (настройка по умолчанию)

Тост скрывается автоматически. Сообщение должно показываться как минимум 5 секунд.

##### По команде

Сообщения не исчезают со времени. Пользователь может скрыть тост по кнопке «Закрыть».

По требованию проектировщика тост может закрываться по кнопке из панели действий, при переходе по ссылке в тексте сообщения или после любого другого события. Например, после завершения загрузки файла или другого процесса, о ходе которого сообщал тост.

##### Ховер или фокус

По фокусу или ховеру на сообщении все тосты перестают пропадать. После ухода фокуса или потере ховера сообщения с автоматическим скрытием начинают пропадают друг за другом с интервалом от 2–5 секунд. Должно быть выполнено условие, чтобы сообщение было показано минимум 5 секунд и между закрытием тостов прошло 2 секунды.

#### Кнопка «Закрыть»

Возможность скрыть тост по кнопке-иконке в углу доступна по умолчанию. Это действие не дублируется элементом в панели действий.

Иногда полезно сделать тост без кнопки-иконки «Закрыть». Например, когда надо показать ход фоновой операции. В этом случае следует расположить в панели действий кнопку с текстом «Отмена», чтобы прервать операцию.

#### Действия

Не используйте <nobr>тосты</nobr> [для подтверждения команд](/components/modal/overview#простой-диалог-без-шапки).

В панели действий тоста можно расположить два элемента. Как правило, запуск действия закрывает тост.

Если действий больше, то следует показать основное на первом месте, а остальные скрыть в меню «Еще». Название меню может отличаться, если другое название лучше подходит.

<!-- example(toast-actions-overview) -->

Тост-уведомление может содержать кнопку отмены операции. Кнопка-иконка «Закрыть» не может служить для этого, она только скрывает тост.

<!-- example(toast-report-overview) -->

#### Ссылки в тексте сообщений

В текст сообщения можно вставлять ссылку (рекомендация: не больше одной).

<!-- example(toast-link-overview) -->

#### Центр уведомлений и тост-сообщения

Пуш-сообщения Центра уведомлений следует показывать в виде тостов в едином списке с системными сообщениями.

По требованию проектировщика некоторые тост-сообщения могут отмечаться в Центре уведомлений. Когда закроется тост, полезно иметь возможность восстановить ход событий, прочитать детали ошибок. Вместе с тем нет требования записывать в системный журнал каждое сообщение Центра уведомлений.

### Фокус и работа с клавиатурой

| <div style="min-width: 130px;">Клавиша</div>                                          | Действие                                                |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| <span class="hot-key-button">Tab</span> <span class="hot-key-button">Shift+Tab</span> | Переход к следующему или предыдущему focusable-элементу |
| <span class="hot-key-button">Esc</span>                                               | Закрыть тост                                            |

#### Tab-sequence

1. Инлайн-ссылка внутри текста тоста
2. Кнопка «Закрыть»
3. Действие 1
4. Действие 2
5. Инлайн-ссылка внутри текста следующего тоста
6. …
7. Ссылка «Skip to content» (опционально)
8. Первый элемент в [Главном меню](/components/navbar)
9. …

### Дизайн и анимация

#### Положение на экране

Тост появляется в правом верхнем углу экрана. Несколько сообщений образуют в стопку на экране, новые тосты добавляются снизу стопки.

#### Размеры

Ширина тоста фиксированная, а высота зависит от содержания.

#### Анимация

##### Появление

Тост появляется слева по горизонтали. По мере сдвига новый элемент становится полностью непрозрачным. Высота панели тоста не меняется.

##### Исчезновение

Тост сдвигается по горизонтали за правую границу экрана. Высота окна тоста не меняется. По мере сдвига элемент становится прозрачным. Сообщения под ним плавно поднимаются на освободившееся место в стопке.