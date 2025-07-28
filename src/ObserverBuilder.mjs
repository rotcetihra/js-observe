import Observer from './Observer.mjs';
import ObserverOptionsBuilder from './ObserverOptionsBuilder.mjs';

/**
 * 🧱 `ObserverBuilder` — строитель (builder) для удобного создания экземпляров {@link Observer}.
 *
 * Позволяет наглядно и пошагово задать конфигурацию наблюдателя за DOM: целевой узел, параметры отслеживания и callback.
 * Поддерживает декларативную и безопасную настройку параметров через встроенный {@link ObserverOptionsBuilder}.
 *
 * ---
 *
 * ### 🚀 Преимущества:
 *
 * - 📦 Инкапсуляция логики и валидации конфигурации.
 * - 💬 Fluent-интерфейс: цепочки вызовов для читаемости и наглядности.
 * - 🔧 Поддержка двух способов конфигурации:
 *   - `.with(options)` — если параметры уже известны
 *   - `.options(builder => builder.…)` — декларативная сборка параметров через {@link ObserverOptionsBuilder}
 * - 🛡️ Встроенная проверка обязательного callback перед созданием.
 *
 * ---
 *
 * ### 🛠️ Методы:
 *
 * - `for(target)` — установить DOM-узел, за которым нужно наблюдать.
 * - `with(options)` — напрямую передать объект опций ({@link MutationObserverInit} / {@link ObserverOptions}).
 * - `options(configureFn)` — передать функцию, конфигурирующую {@link ObserverOptionsBuilder}.
 * - `call(callback)` — задать callback-функцию, вызываемую при мутациях.
 * - `build()` — создать экземпляр {@link Observer} с указанными параметрами.
 *
 * ---
 *
 * ### ✅ Пример использования:
 *
 * ```js
 *
 * import ObserverBuilder from './ObserverBuilder.mjs';
 *
 * const observer = new ObserverBuilder()
 *     .for(document.getElementById('content'))
 *     .options((b) => b.descendants().attributes(['data-state']).text().useOldValue())
 *     .call((mutations) => {
 *         for (const mutation of mutations) {
 *             console.log(mutation);
 *         }
 *     })
 *     .build();
 *
 * observer.observe();
 *
 * ```
 *
 * ---
 *
 * ### ⚠️ Важно:
 *
 * Метод `call()` является обязательным — без указания callback вызов `.build()` выбросит исключение.
 *
 * ---
 *
 * @class ObserverBuilder
 */
class ObserverBuilder {
    /**
     * 🧩 Callback-функция, вызываемая при срабатывании {@link Observer}.
     *
     * Представляет собой обязательную часть конфигурации наблюдателя.
     * Задаётся с помощью метода `.call(callback)` и передаётся в конструктор `Observer` при вызове `.build()`.
     *
     * ---
     *
     * ### 📐 Сигнатура:
     *
     * ```ts
     *
     * (mutations: MutationRecord[], observer: MutationObserver) => void
     *
     * ```
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * builder.call((mutations, observer) => {
     *     mutations.forEach(m => console.log(m));
     * });
     *
     * ```
     *
     * ---
     *
     * @type {MutationCallback}
     * @private
     */
    #callback;

    /**
     * ⚙️ Конфигурация параметров наблюдения ({@link ObserverOptions}), применяемая при вызове `observe()`.
     *
     * Устанавливается двумя способами:
     *
     * - с помощью метода `.with(options)`, где `options` — это вручную собранный объект
     * - или через метод `.options(builderCallback)`, используя {@link ObserverOptionsBuilder} для декларативной сборки
     *
     * ---
     *
     * ### 🔍 Пример использования с `.with()`:
     *
     * ```js
     *
     * builder.with({ childList: true, subtree: true });
     *
     * ```
     *
     * ### 🔍 Пример с `.options()` и builder-ом:
     *
     * ```js
     *
     * builder.options((b) => b.descendants().attributes(['class']).useOldValue());
     *
     * ```
     *
     * ---
     *
     * Если параметр не установлен, при сборке через `.build()` будет передан `undefined`,
     * что может привести к созданию наблюдателя без настроек (необходимо будет передать опции непосредственно в метод `observe`).
     *
     * ---
     *
     * @type {MutationObserverInit | undefined}
     * @private
     */
    #options;

    /**
     * 🎯 Целевой DOM-элемент, за изменениями которого будет вестись наблюдение.
     *
     * Устанавливается через метод `.for(target)`, где `target` — это любой `Node`,
     * поддерживаемый {@link MutationObserver}, например: `Element`, `Document`, `DocumentFragment`.
     *
     * ---
     *
     * ### ✅ Пример использования:
     *
     * ```js
     *
     * builder.for(document.querySelector('#app'));
     *
     * ```
     *
     * ---
     *
     * Если целевой узел не задан, его можно передать напрямую при вызове `observer.observe(target)`.
     * Однако для полного построения наблюдателя через `.build()`, рекомендуется явно указать target.
     *
     * ---
     *
     * ### 💡 Особенности:
     * - Можно вызывать в любой момент до `.build()`.
     * - Позволяет удобно переиспользовать одну и ту же конфигурацию для разных узлов (создавая несколько Observer-ов).
     * - Если вызвать несколько раз — будет использоваться последний переданный target.
     *
     * ---
     *
     * @type {Node | undefined}
     * @private
     */
    #target;

    /**
     * 🎯 Устанавливает **целевой DOM-узел** для наблюдения.
     *
     * Этот метод задаёт `target` — узел, за изменениями которого будет следить {@link Observer}.
     * Обычно это элемент страницы (`HTMLElement`), но также может быть `Document` или `DocumentFragment`.
     *
     * ---
     *
     * ### ✅ Пример использования:
     *
     * ```js
     *
     * const builder = new ObserverBuilder()
     *     .for(document.getElementById('content'));
     *
     * ```
     *
     * ---
     *
     * Если целевой узел не задан, его можно передать напрямую при вызове `observer.observe(target)`.
     * Однако для полного построения наблюдателя через `.build()`, рекомендуется явно указать target.
     *
     * ---
     *
     * ### 💡 Особенности
     *
     * - Можно вызывать в любой момент до `.build()`.
     * - Позволяет удобно переиспользовать одну и ту же конфигурацию для разных узлов (создавая несколько Observer-ов).
     * - Если вызвать несколько раз — будет использоваться последний переданный target.
     *
     * ---
     *
     * @param {Node} target - DOM-узел (например, HTMLElement, Document, DocumentFragment), за которым нужно наблюдать.
     * @returns {ObserverBuilder} this — для продолжения цепочки вызовов.
     */
    for(target) {
        this.#target = target;

        return this;
    }

    /**
     * ⚙️ Устанавливает **объект параметров** ({@link ObserverOptions}) для наблюдения.
     *
     * Позволяет явно передать готовый объект опций, например, собранный вручную
     * или с помощью {@link ObserverOptionsBuilder}, чтобы настроить, какие изменения DOM нужно отслеживать:
     * атрибуты, текст, дочерние узлы и т.д.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const options = new ObserverOptionsBuilder()
     *     .descendants()
     *     .attributes(['data-state'])
     *     .useOldValue()
     *     .build();
     *
     * const builder = new ObserverBuilder()
     *     .with(options);
     *
     * ```
     *
     * ---
     *
     * ### 💡 Особенности
     *
     * - Можно использовать как с обычным объектом MutationObserverInit, так и с экземпляром ObserverOptions.
     * - Если вы используете метод `.options(cb)`, то `.with()` вызывать не нужно.
     * - Последний вызов перезапишет предыдущие параметры.
     * - Если не вызвать ни `.with()`, ни `.options()`, то при вызове `.build()` опции будут не заданы (undefined).
     *
     * ---
     *
     * @param {MutationObserverInit} options - Объект конфигурации наблюдателя (например, из ObserverOptionsBuilder или вручную).
     * @returns {ObserverBuilder} this — для продолжения цепочки вызовов.
     */
    with(options) {
        this.#options = options;

        return this;
    }

    /**
     * 🧱 Упрощённый способ **создания конфигурации наблюдателя** через билдер {@link ObserverOptionsBuilder}.
     *
     * Позволяет декларативно и наглядно собрать параметры наблюдения через fluent-интерфейс билдера,
     * избегая ручного создания объекта опций. Внутри callback-функции вы вызываете методы билдера,
     * определяя нужные типы изменений (children, attributes, text и т.д.).
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = new ObserverBuilder()
     *     .for(document.body)
     *     .options((o) => o
     *         .descendants()
     *         .attributes(['class'])
     *         .text()
     *         .useOldValue()
     *     )
     *     .call(callback)
     *     .build();
     *
     * observer.observe();
     *
     * ```
     *
     * ---
     *
     * ### 💡 Особенности
     *
     * - Делает код более читаемым и декларативным.
     * - Исключает ошибки ручной сборки объекта опций.
     * - Позволяет легко расширять и переиспользовать конфигурацию.
     * - Последний вызов перезапишет предыдущие параметры, заданные через `.with()`.
     * - Если не вызвать ни `.with()`, ни `.options()`, опции будут не заданы (undefined).
     *
     * ---
     *
     * @param {function(ObserverOptionsBuilder): void} callback — функция, принимающая билдер опций для пошаговой настройки.
     * @returns {ObserverBuilder} this — для продолжения цепочки вызовов.
     */
    options(callback) {
        const builder = new ObserverOptionsBuilder();

        callback(builder);

        this.#options = builder.build();

        return this;
    }

    /**
     * 📞 Устанавливает **callback-функцию** для {@link Observer}, которая будет вызываться
     * при срабатывании наблюдателя (при изменениях в DOM).
     *
     * Этот метод обязателен: без него {@link ObserverBuilder.build()} выбросит ошибку.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = new ObserverBuilder()
     *     .for(document.body)
     *     .options((o) => o.descendants().text())
     *     .call((mutations, observer) => {
     *         for (const m of mutations) {
     *             console.log('Изменение:', m);
     *         }
     *     })
     *     .build();
     *
     * observer.observe();
     *
     * ```
     *
     * ---
     *
     * ### 💡 Особенности
     *
     * - Callback обязателен для работы {@link Observer}.
     * - Можно вызывать несколько раз — будет использоваться последний переданный callback.
     * - Callback получает два аргумента: массив `MutationRecord[]` и экземпляр `MutationObserver`.
     * - Можно использовать стрелочные или обычные функции.
     *
     * ---
     *
     * @param {MutationCallback} callback - Функция, вызываемая при изменениях в DOM. Принимает массив `MutationRecord[]` и объект `MutationObserver`.
     * @returns {ObserverBuilder} this — для продолжения цепочки вызовов.
     */
    call(callback) {
        this.#callback = callback;

        return this;
    }

    /**
     * 🏗️ Завершает построение наблюдателя и возвращает готовый экземпляр {@link Observer}.
     *
     * Метод должен вызываться в конце цепочки, после настройки целевого узла (`.for()`),
     * конфигурации наблюдения (`.with()` или `.options()`), и назначения обработчика (`.call()`).
     *
     * ---
     *
     * ### ⚠️ Обязательные условия перед вызовом `.build()`:
     *
     * - Должен быть вызван метод `.call(callback)`, иначе выбрасывается ошибка.
     * - Желательно указать целевой узел через `.for()` и опции через `.with()` или `.options()`.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = new ObserverBuilder()
     *     .for(document.getElementById('app'))
     *     .options((o) => o.descendants().text().useOldValue())
     *     .call((mutations) => {
     *         console.log('Мутации:', mutations);
     *     })
     *     .build();
     *
     * observer.observe();
     *
     * ```
     *
     * ---
     *
     * ### 🧠 Когда использовать:
     *
     * - Когда вы завершили конфигурацию {@link ObserverBuilder} и хотите получить готовый {@link Observer}
     * - При использовании fluent-интерфейса для создания наблюдателя
     *
     * ---
     *
     * @throws {Error} Если не был вызван `.call()`.
     * @returns {Observer} Экземпляр класса {@link Observer}, готовый к вызову `.observe()`.
     */
    build() {
        if (!this.#callback) {
            throw new Error(
                'Пропущен вызов обязательного метода ObserverBuilder.call().',
            );
        }

        return new Observer(this.#callback, this.#options, this.#target);
    }
}

export default ObserverBuilder;
