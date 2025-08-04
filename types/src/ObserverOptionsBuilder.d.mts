export default ObserverOptionsBuilder;
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
declare class ObserverOptionsBuilder {
    /**
     * 👶 Включает отслеживание **дочерних узлов** указанного элемента.
     *
     * ---
     *
     * ### 📌 Что делает
     *
     * Устанавливает `childList: true` в {@link ObserverOptions}, чтобы наблюдать за:
     *
     * - ➕ добавлением дочерних узлов (например, `appendChild`, `insertBefore`)
     * - ➖ удалением дочерних узлов (например, `removeChild`)
     *
     * ---
     *
     * ### 📎 Особенности
     *
     * - Отслеживаются **только прямые** потомки (1 уровень вложенности).
     * - Для отслеживания вложенных изменений — добавьте `.subtree()` или `.descendants()`.
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const options = ObserverOptions
     *     .new()
     *     .children()
     *     .build();
     *
     * const observer = new Observer(callback);
     * observer.observe(document.getElementById('list'), options);
     *
     * document.getElementById('list').appendChild(document.createElement('li'));
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} `this` — для продолжения цепочки.
     */
    children(): ObserverOptionsBuilder;
    /**
     * 🌳 Включает отслеживание **всех вложенных** DOM-изменений — не только прямых, но и глубоких потомков.
     *
     * ---
     *
     * ### 📌 Что делает
     *
     * Комбинирует два режима:
     *
     * - `childList: true` — отслеживает добавление и удаление узлов
     * - `subtree: true` — расширяет область наблюдения на **всех потомков**
     *
     * Эквивалентно: `.children().subtree()`, но читается декларативнее.
     *
     * ---
     *
     * ### 📎 Когда использовать
     *
     * - При отслеживании **динамически изменяемого контента**
     * - Когда изменения могут происходить **в глубине дерева**
     *
     * ---
     *
     * ### ✅ Пример
     *
     * ```js
     *
     * const options = ObserverOptions
     *     .new()
     *     .descendants()
     *     .build();
     *
     * const observer = new Observer(callback);
     * observer.observe(document.getElementById('tree'), options);
     *
     * // Добавление вложенного узла:
     * document.querySelector('#tree .deep').appendChild(document.createElement('div'));
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} `this` — для цепочки вызовов.
     */
    descendants(): ObserverOptionsBuilder;
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
     * const observer = new Observer((mutations) => {
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
    attributes(filter?: string[] | null): ObserverOptionsBuilder;
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
     * - Включает `attributes: true` — отслеживает изменения атрибутов
     * - Включает `subtree: true` — расширяет наблюдение на **всех потомков**
     * - Если указан параметр `filter`, устанавливает `attributeFilter` — ограничивает отслеживание указанными атрибутами
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
     * const observer = new Observer((mutations) => {
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
     * ### 🧠 Используйте, когда:
     *
     * - Нужно следить за `class`, `style`, `data-*` и другими атрибутами **в глубоко вложенных элементах**
     * - Важно централизованно отслеживать состояние всей DOM-структуры (например, в компонентных системах)
     *
     * ---
     *
     * @param {string[]|null} [filter=null] - Список атрибутов, за которыми нужно следить. Если не указан — отслеживаются все.
     * @returns {ObserverOptionsBuilder} `this` — для продолжения цепочки вызовов.
     */
    descendantAttributes(filter?: string[] | null): ObserverOptionsBuilder;
    /**
     * ✏️ Включает отслеживание **изменений текстовых узлов** (`characterData`).
     *
     * Устанавливает `characterData: true` в конфигурации `Observer`,
     * что позволяет отслеживать любые изменения **текстового содержимого** в DOM-дереве.
     *
     * ---
     *
     * ### 🧠 Что отслеживается:
     *
     * - Изменения текста внутри узлов типа `Text`, включая:
     *
     *   - обычные текстовые узлы
     *   - текст внутри `<span>`, `<div>` и других контейнеров
     *   - любые динамические обновления (например, через `.textContent`)
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
     *     .subtree()
     *     .build();
     *
     * const observer = new Observer((mutations) => {
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
     * - Отслеживания изменений в `contenteditable`-элементах
     * - Реализации реактивных текстовых блоков
     * - Логирования или восстановления предыдущего текста
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} `this` — для продолжения цепочки вызовов.
     */
    text(): ObserverOptionsBuilder;
    /**
     * ✏️🌲 Включает отслеживание **изменений текста во всех вложенных узлах**.
     *
     * Это удобное сокращение для цепочки вызовов:
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
     * - Устанавливает `characterData: true` — отслеживает изменения в текстовых узлах
     * - Устанавливает `subtree: true` — расширяет наблюдение на **всех потомков**
     *
     * ---
     *
     * ⚠️ Чтобы получить **предыдущее значение текста**, вызовите `.useOldValue()` после `.descendantText()`.
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
     * const observer = new Observer((mutations) => {
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
     * - Слежения за текстом внутри `contenteditable`-областей
     * - Реактивных интерфейсов, где важно понимать, что именно изменилось
     * - Отладки и логирования текстовых изменений
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} `this` — для продолжения цепочки вызовов.
     */
    descendantText(): ObserverOptionsBuilder;
    /**
     * 🌳 Включает наблюдение за **вложенными (дочерними) элементами** внутри целевого узла.
     *
     * Устанавливает флаг `subtree: true` в конфигурации {@link Observer},
     * позволяя отслеживать изменения **не только в самом узле**, но и **во всех его потомках** на любом уровне вложенности.
     *
     * ---
     *
     * ### 🔍 Без этого флага:
     *
     * Наблюдение применяется **только к целевому узлу**. Изменения внутри вложенных элементов (например, `textContent`, `attributes`) — игнорируются.
     *
     * С `subtree: true` вы получаете **полный охват всех вложенных изменений**.
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
     * const observer = new Observer((mutations) => {
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
     * ### 🧠 Используйте, если:
     *
     * - Нужно отслеживать любые вложенные DOM-изменения
     * - Важна реактивность на глубоко вложенные изменения
     * - DOM-структура может быть динамически изменяемой
     *
     * ---
     *
     * ⚠️ **Важно**: `subtree: true` работает **только в сочетании** с одним из следующих флагов:
     *
     * - `childList`
     * - `attributes`
     * - `characterData`
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} `this` — для продолжения цепочки вызовов.
     */
    subtree(): ObserverOptionsBuilder;
    /**
     * ⏪ Включает сохранение **старых значений** для атрибутов и/или текстовых узлов.
     *
     * В зависимости от ранее активированных опций (`attributes()` и/или `text()`),
     * устанавливает флаги `attributeOldValue` и/или `characterDataOldValue`.
     * Это позволяет {@link Observer} передавать **предыдущее значение** в `mutation.oldValue`.
     *
     * ---
     *
     * ### 🔍 Как работает:
     *
     * - Если ранее был вызван `.attributes()` — устанавливается `attributeOldValue: true`
     * - Если ранее был вызван `.text()` — устанавливается `characterDataOldValue: true`
     * - Если ни один из этих методов не был вызван — выбрасывается исключение
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
     * const observer = new Observer((mutations) => {
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
     * В противном случае будет выброшено исключение:
     *
     * ```
     * ObserverOptionsBuilder.useOldValue() требует предварительного вызова attributes() и/или text()
     * ```
     *
     * ---
     *
     * ### 🧠 Полезно для:
     *
     * - Логирования изменений
     * - Реализации откатов
     * - Сравнения старых и новых значений
     *
     * ---
     *
     * @throws {Error} Если не были активированы ни `attributes`, ни `characterData`
     * @returns {ObserverOptionsBuilder} `this` — для продолжения цепочки вызовов
     */
    useOldValue(): ObserverOptionsBuilder;
    /**
     * 🧾 Включает отслеживание **изменений содержимого (контента)** внутри целевого элемента и его потомков.
     *
     * Это сочетание трёх опций:
     *
     * ```js
     *
     * .children().text().subtree()
     *
     * ```
     *
     * ---
     *
     * ### 🔍 Что делает:
     *
     * - `childList: true` — отслеживает добавление и удаление дочерних узлов
     * - `characterData: true` — отслеживает изменения в текстовых узлах
     * - `subtree: true` — распространяет наблюдение на все вложенные элементы
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .content()
     *     .useOldValue()
     *     .build();
     *
     * const observer = new MutationObserver(console.log);
     * observer.observe(document.getElementById('editor'), options);
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Полезно для:
     *
     * - Слежения за изменениями в `contenteditable`-областях
     * - Обнаружения любых изменений DOM внутри контентной секции
     * - Редакторов, комментариев, чатов, динамических блоков
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} this — для продолжения цепочки вызовов.
     */
    content(): ObserverOptionsBuilder;
    /**
     * 🧿 Включает **все основные типы наблюдаемых изменений** в DOM-дереве.
     *
     * Это удобный метод, активирующий сразу весь набор параметров:
     *
     * - `childList: true` — наблюдение за добавлением и удалением дочерних узлов
     * - `attributes: true` — наблюдение за изменениями атрибутов
     * - `characterData: true` — наблюдение за изменениями текстовых узлов
     * - `subtree: true` — распространение наблюдения на все вложенные элементы
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
     * const observer = new Observer(console.log);
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
     * - Нужна конфигурация "всё включено" без ручной настройки
     * - Вы отслеживаете изменения в динамически обновляемых секциях
     *
     * ---
     *
     * ⚠️ Обратите внимание:
     *
     * Этот метод включает **всё**, что может быть избыточным для производительности.
     * Используйте его, если вы действительно хотите отслеживать **все типы изменений**, либо на этапе отладки.
     *
     * ---
     *
     * @returns {ObserverOptionsBuilder} `this` — для продолжения цепочки вызовов.
     */
    all(): ObserverOptionsBuilder;
    /**
     * 🏗️ Завершает построение конфигурации и возвращает итоговый объект опций.
     *
     * Метод вызывается в конце цепочки для получения финального объекта {@link ObserverOptions},
     * который затем можно передать в `Observer.observe(...)`.
     *
     * ---
     *
     * ⚠️ **Обязательное условие — должен быть включён хотя бы один тип наблюдения!**
     *
     * Если вы **не вызвали ни один из методов**: `.children()`, `.attributes()`, `.text()` —
     * будет выброшена **ошибка**. Без этих флагов наблюдатель не будет работать, и конфигурация станет бессмысленной.
     *
     * ---
     *
     * ### ❌ Что вызовет ошибку:
     *
     * ```js
     * const options = new ObserverOptionsBuilder()
     *     .subtree()
     *     .build(); // ❗ Ошибка — не задано, что именно отслеживать
     * ```
     *
     * ---
     *
     * ### ✅ Как правильно:
     *
     * ```js
     * const options = new ObserverOptionsBuilder()
     *     .children()
     *     .text()
     *     .useOldValue()
     *     .build(); // ✅ корректно — указаны типы изменений
     * ```
     *
     * ---
     *
     * ### 🧠 Используйте, когда:
     *
     * - Завершили настройку цепочки методов
     * - Хотите получить готовую конфигурацию
     *
     * ---
     *
     * @throws {Error} Если не указан ни один тип наблюдаемых изменений.
     * @returns {ObserverOptions} Готовая конфигурация для MutationObserver.
     */
    build(): ObserverOptions;
    #private;
}
import ObserverOptions from './ObserverOptions.mjs';
