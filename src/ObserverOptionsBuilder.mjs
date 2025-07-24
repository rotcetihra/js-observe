import ObserverOptions from './ObserverOptions.mjs';

/**
 * 🛠️✨ `ObserverOptionsBuilder` — удобный и безопасный builder для создания конфигурации наблюдателя за DOM.
 *
 * Позволяет с помощью fluent-интерфейса (цепочки вызовов) гибко и наглядно настраивать,
 * какие именно изменения DOM следует отслеживать: атрибуты, текст, дочерние элементы, вложенные узлы и т.д.
 *
 * ### 🌟 Преимущества:
 *
 * - 🚫 Исключает ошибки в ручной сборке объекта опций.
 * - 📝 Позволяет явно и декларативно описывать нужное поведение.
 * - 🔁 Упрощает повторное использование и читаемость кода.
 *
 * ────────────────
 *
 * ### 🧩 Методы:
 *
 * - `children()` — 👶 отслеживать только прямых потомков (`childList`)
 * - `descendants()` — 🌳 отслеживать все вложенные элементы (`childList` + `subtree`)
 * - `attributes(filter?)` — 🏷️ отслеживать изменения атрибутов, опционально только указанных
 * - `text()` — ✏️ отслеживать изменения текстовых узлов
 * - `subtree()` — 🌲 включить наблюдение за потомками
 * - `useOldValue()` — ⏪ возвращать старые значения атрибутов/текста (требует вызова `attributes()` и/или `text()`)
 * - `build()` — 🏗️ получить итоговый объект ObserverOptions
 *
 * ────────────────
 *
 * ### ✅ Пример
 *
 * ```js
 *
 * const options = new ObserverOptionsBuilder()
 *     .descendants()
 *     .attributes(['class', 'style'])
 *     .text()
 *     .useOldValue()
 *     .build();
 *
 * const observer = new Observer(callback, options, targetNode);
 *
 * observer.observe();
 *
 * ```
 */
class ObserverOptionsBuilder {
    #options;

    constructor() {
        this.#options = new ObserverOptions();
    }

    /**
     * 👶 Включает отслеживание **дочерних элементов** указанного узла.
     *
     * Устанавливает опцию `childList: true` в объекте {@link ObserverOptions}, что позволяет наблюдателю отслеживать:
     *
     * - добавление новых узлов (например, `appendChild`, `insertBefore`)
     * - удаление дочерних узлов (например, `removeChild`)
     *
     * ⚠️ По умолчанию отслеживаются **только прямые потомки** (`subtree: false`).
     *
     * Чтобы следить за вложенными элементами на любом уровне — вызовите дополнительно `.subtree()` или `.descendants()`.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .children()
     *     .build();
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         if (mutation.type === 'childList') {
     *             console.log('Изменены дочерние элементы:', mutation);
     *         }
     *     }
     * });
     *
     * observer.observe(document.getElementById('content'), options);
     *
     * // Пример вызова, который спровоцирует срабатывание:
     * document.getElementById('content').appendChild(document.createElement('div'));
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    children() {
        this.#options.childList = true;

        return this;
    }

    /**
     * 🌳 Включает отслеживание **всех вложенных** DOM-изменений.
     *
     * Комбинирует опции:
     *
     * - `childList: true` — отслеживание добавления/удаления дочерних элементов
     * - `subtree: true` — отслеживание изменений не только в самом узле, но и во **всех его потомках**
     *
     * Это эквивалентно вызову `.children().subtree()`, но в более читаемой и декларативной форме.
     *
     * ---
     *
     * ### 🧠 Полезно, когда:
     *
     * - Нужно следить за **динамически обновляемыми разделами страницы**
     * - Изменения могут происходить **глубоко в иерархии DOM**
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .descendants()
     *     .build();
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log('Изменения в потомках:', mutation);
     *     }
     * });
     *
     * observer.observe(document.getElementById('tree'), options);
     *
     * // Добавление элемента на глубине
     * const deep = document.createElement('div');
     * document.querySelector('#tree .nested .leaf').appendChild(deep); // => будет зафиксировано
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    descendants() {
        this.children();
        this.subtree();

        return this;
    }

    /**
     * 🏷️ Включает отслеживание **изменений атрибутов** у целевого элемента.
     *
     * Устанавливает флаг `attributes: true` в конфигурации наблюдателя.
     * Дополнительно позволяет указать фильтр — список атрибутов, за изменениями которых нужно следить.
     *
     * ---
     *
     * ### ⚠️ Важно:
     *
     * Чтобы также отслеживать **предыдущее значение** атрибута, вызовите дополнительно `.useOldValue()`.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .attributes(['class', 'data-state'])
     *     .useOldValue()
     *     .build();
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const m of mutations) {
     *         console.log(`Атрибут ${m.attributeName} изменился`);
     *         console.log(`Предыдущее значение: ${m.oldValue}`);
     *     }
     * });
     *
     * observer.observe(document.querySelector('#target'), options);
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Используется для:
     *
     * - Слежения за изменением стилей, классов, состояний (`data-*`)
     * - Реализации реактивных компонентов или собственных директив
     *
     * ---
     *
     * @param {string[]|null} [filter=null] - Список атрибутов для отслеживания (необязательный).
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    attributes(filter = null) {
        this.#options.attributes = true;

        if (filter) {
            this.#options.attributeFilter = filter;
        }

        return this;
    }

    /**
     * 🏷️🌳 Включает отслеживание **изменений атрибутов во всех потомках** целевого элемента.
     *
     * Это сокращение для цепочки вызовов:
     *
     * ```js
     *
     * .attributes(filter).subtree()
     *
     * ```
     *
     * ---
     *
     * ### 🔍 Что делает:
     *
     * - Включает флаг `attributes: true` — отслеживает изменения атрибутов
     * - Включает `subtree: true` — применяет наблюдение ко **всем вложенным элементам**
     * - Если указан параметр `filter`, включает `attributeFilter` — ограничивает наблюдение только определёнными атрибутами
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .descendantAttributes(['data-state', 'class'])
     *     .useOldValue()
     *     .build();
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const m of mutations) {
     *         console.log(`Атрибут "${m.attributeName}" изменён в:`, m.target);
     *     }
     * });
     *
     * observer.observe(document.getElementById('app'), options);
     *
     * // При изменении атрибута на любом уровне вложенности внутри #app — будет зафиксировано
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Используйте когда:
     *
     * - Нужно следить за изменением `class`, `style`, `data-*` и других атрибутов **в глубоко вложенных элементах**
     * - Важно централизованно отслеживать состояние всей вложенной структуры (например, в компонентных системах)
     *
     * ---
     *
     * @param {string[]|null} [filter=null] - Список атрибутов, за которыми нужно следить. Если не указан — отслеживаются все.
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    descendantAttributes(filter = null) {
        this.attributes(filter);
        this.subtree();
    }

    /**
     * ✏️ Включает отслеживание **изменений текстовых узлов** (`characterData`).
     *
     * Устанавливает флаг `characterData: true` в конфигурации `MutationObserver`,
     * что позволяет отслеживать изменение **текстового содержимого** в DOM-узлах.
     *
     * ---
     *
     * ### 🧠 Что отслеживается:
     *
     * - Изменения текста внутри узлов типа `Text`, включая:
     *
     *   - обычные текстовые узлы
     *   - содержимое внутри `<span>`, `<div>` и других контейнеров
     *   - любые динамические текстовые обновления (например, через `.textContent`)
     *
     * ---
     *
     * ### ⚠️ Важно:
     *
     * Чтобы также получить **старое значение текста**, вызовите `.useOldValue()` после `.text()`.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .text()
     *     .useOldValue()
     *     .subtree() // следим за вложенными текстами
     *     .build();
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const m of mutations) {
     *         console.log(`Текст изменился с "${m.oldValue}" на "${m.target.data}"`);
     *     }
     * });
     *
     * observer.observe(document.getElementById('content'), options);
     *
     * // Позже:
     * document.querySelector('#content .line').textContent = 'Новый текст';
     *
     * ```
     *
     * ---
     *
     * ### 🔍 Полезно для:
     *
     * - Слежения за пользовательским вводом (например, `contenteditable`)
     * - Реализации реактивных текстовых блоков
     * - Автоматического логирования/откатов изменений текста
     *
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    text() {
        this.#options.characterData = true;

        return this;
    }

    /**
     * ✏️🌲 Включает отслеживание **изменений текста во всех вложенных узлах**.
     *
     * Это удобное сокращение для комбинации:
     *
     * ```js
     *
     * .text().subtree()
     *
     * ```
     *
     * ---
     *
     * ### 🔍 Что делает:
     *
     * - Устанавливает `characterData: true` — отслеживает изменения текстовых узлов
     * - Устанавливает `subtree: true` — позволяет отслеживать изменения **в любых вложенных элементах**
     *
     * ---
     *
     * ⚠️ Чтобы получить старое значение текста, вызовите также `.useOldValue()` после этого метода.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .descendantText()
     *     .useOldValue()
     *     .build();
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log(`Текст изменился:`, mutation.oldValue, '→', mutation.target.data);
     *     }
     * });
     *
     * observer.observe(document.getElementById('output'), options);
     *
     * // Позже:
     * document.querySelector('#output .info .line').textContent = 'Новая строка';
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Полезно для:
     *
     * - Отслеживания текста в `contenteditable`-областях
     * - Реактивных интерфейсов, где важно знать, что изменилось в тексте
     * - Логирования и визуализации изменений
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    descendantText() {
        this.text();
        this.subtree();

        return this;
    }

    /**
     * 🌳 Включает наблюдение за **вложенными (дочерними) элементами** внутри целевого узла.
     *
     * Устанавливает флаг `subtree: true` в конфигурации `MutationObserver`,
     * позволяя отслеживать изменения **не только в самом узле**, но и **во всех его потомках** на любом уровне вложенности.
     *
     * ---
     *
     * ### 🔍 Без этого флага:
     *
     * Наблюдение применяется **только к самому целевому узлу** (например, изменения текстов или атрибутов внутри него не отслеживаются).
     *
     * С `subtree: true` вы можете следить за **всем вложенным содержимым**.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .text()
     *     .subtree()
     *     .build();
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const m of mutations) {
     *         console.log(`Изменение в потомке:`, m.target);
     *     }
     * });
     *
     * observer.observe(document.getElementById('container'), options);
     *
     * // Теперь даже такие изменения будут замечены:
     * document.querySelector('#container .nested span').textContent = 'Обновление';
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Используется, когда:
     *
     * - Нужно отслеживать вложенные узлы любого уровня
     * - Требуется реактивность для глубоко вложенных DOM-структур
     * - Невозможно заранее предсказать, где именно произойдут изменения
     *
     * ---
     *
     * ⚠️ **Важно**: `subtree: true` **не работает самостоятельно** — его нужно комбинировать с другими флагами:
     *
     * - `childList`
     * - `attributes`
     * - `characterData`
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    subtree() {
        this.#options.subtree = true;

        return this;
    }

    /**
     * ⏪ Включает сохранение **старых значений** для атрибутов и/или текстовых узлов.
     *
     * В зависимости от активированных ранее опций (`attributes()` и/или `text()`),
     * устанавливает флаги `attributeOldValue` и/или `characterDataOldValue`.
     * Это позволяет `MutationObserver` передавать **предыдущее значение** изменённого содержимого в `MutationRecord.oldValue`.
     *
     * ---
     *
     * ### 🔍 Как работает:
     *
     * - Если вы включили `attributes()` — будет активирован `attributeOldValue: true`.
     * - Если вы включили `text()` — будет активирован `characterDataOldValue: true`.
     * - Если не указано ни то, ни другое — выбрасывается исключение.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .attributes(['class'])
     *     .useOldValue()
     *     .build();
     *
     * const observer = new MutationObserver((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log(`Атрибут изменился с "${mutation.oldValue}" на "${mutation.target.getAttribute(mutation.attributeName)}"`);
     *     }
     * });
     *
     * observer.observe(document.body, options);
     *
     * // Позже:
     * document.body.className = 'new-class';
     *
     * ```
     *
     * ---
     *
     * ### ⚠️ Обязательное условие:
     *
     * Метод `.useOldValue()` должен быть вызван **после** `.attributes()` и/или `.text()`.
     *
     * В противном случае выбрасывается ошибка: `ObserverOptionsBuilder.useOldValue() требует предварительного вызова attributes() и/или text()`
     *
     * ---
     *
     * ### 🧠 Полезно для:
     *
     * - Логирования изменений
     * - Реализации откатов
     * - Сравнения новых и старых значений
     *
     * ---
     *
     * @throws {Error} Если не указаны ни `attributes`, ни `characterData`.
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    useOldValue() {
        if (!this.#options.attributes && !this.#options.characterData) {
            throw new Error(
                'ObserverOptionsBuilder.useOldValue() требует предварительного вызова attributes() и/или text()',
            );
        }

        if (this.#options.attributes) {
            this.#options.attributeOldValue = true;
        }

        if (this.#options.characterData) {
            this.#options.characterDataOldValue = true;
        }

        return this;
    }

    /**
     * 🧿 Включает **все основные типы наблюдаемых изменений** в DOM-дереве.
     *
     * Это удобный метод, активирующий сразу весь набор параметров:
     *
     * - `childList: true` — наблюдение за добавлением и удалением дочерних узлов
     * - `attributes: true` — наблюдение за изменениями атрибутов
     * - `characterData: true` — наблюдение за изменениями текстовых узлов
     * - `subtree: true` — распространение наблюдения на все вложенные элементы
     * - `attributeOldValue: true` и `characterDataOldValue: true` — сохранение старых значений атрибутов и текста
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .all()
     *     .build();
     *
     * const observer = new MutationObserver(console.log);
     * observer.observe(document.body, options);
     *
     * // Будут зафиксированы любые DOM-изменения внутри body
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Используется, когда:
     *
     * - Требуется полный контроль над изменениями DOM
     * - Нужно "всё включено" без ручной настройки
     * - Наблюдение применяется к динамически обновляемым секциям
     *
     * ---
     *
     * ⚠️ Обратите внимание:
     *
     * Этот метод включает всё — но это **может быть избыточно** для производительности.
     * Используйте его, когда вы действительно хотите отслеживать **всё**, или на этапе отладки.
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    all() {
        this.children().attributes().text().subtree().useOldValue();

        return this;
    }

    /**
     * 🏗️ Завершает построение конфигурации и возвращает итоговый объект опций.
     *
     * Метод используется в конце цепочки вызовов для получения сформированного
     * объекта конфигурации {@link ObserverOptions}, который можно передать в
     * {@link Observer.observe()} или в конструктор класса {@link Observer}.
     *
     * ---
     *
     * ### 📦 Что возвращается:
     *
     * Объект с типом `ObserverOptions`, включающий все опции,
     * установленные через предыдущие вызовы методов builder-а.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .descendants()
     *     .attributes(['class', 'style'])
     *     .text()
     *     .useOldValue()
     *     .build();
     *
     * const observer = new MutationObserver(callback);
     * observer.observe(targetNode, options);
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Когда использовать:
     *
     * - Когда вы завершили настройку builder-а и хотите получить результат.
     * - Для повторного использования с разными DOM-узлами.
     *
     * ---
     *
     * @returns {ObserverOptions} Конфигурация для `Observer.observe()`.
     */
    build() {
        return this.#options;
    }
}

export default ObserverOptionsBuilder;
