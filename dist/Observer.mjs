import ObserverBuilder from './ObserverBuilder.mjs';
/**
 * 🧭 **`Observer`** — расширенная обёртка над стандартным [`MutationObserver`](https://developer.mozilla.org/ru/docs/Web/API/MutationObserver) с поддержкой предустановленных параметров и (опционально) целевого DOM-узла.
 *
 * Класс инкапсулирует логику повторного использования конфигурации и узла, позволяя отслеживать изменения
 * в разных элементах без повторного указания одних и тех же опций.
 *
 * ---
 *
 * ### 🧩 **Возможности**
 *
 * - ♻️ **Повторное использование** набора опций и callback для разных DOM-узлов.
 * - 🚀 **Упрощённый вызов** `.observe()` без необходимости каждый раз передавать параметры и целевой узел.
 * - 🏗️ **Fluent-интерфейс** через {@link ObserverBuilder} и {@link ObserverOptionsBuilder}.
 * - 🛑 Методы управления жизненным циклом: `observe`, `disconnect`, `autoDisconnect`, `cancelAutoDisconnect`, `takeRecords`.
 * - 🟢 Безопасная работа с состоянием наблюдения (`isObserving`).
 *
 * ---
 *
 * ### 📐 **Сигнатура конструктора**
 *
 * ```ts
 *
 * new Observer(callback, options?, target?)
 *
 * ```
 * - `callback` `{MutationCallback}` — вызывается при каждом изменении.
 * - `options` `{MutationObserverInit}` — конфигурация (например, `{ childList: true, subtree: true }`).
 * - `target` `{Node}` — DOM-узел, за которым нужно следить по умолчанию.
 *
 * ---
 *
 * ### ✅ **Пример использования**
 *
 * ```js
 *
 * import { Observer, ObserverOptions } from '@rotcetihra/js-observe';
 *
 * const observer = new Observer(
 *     (mutations) => { mutations.forEach(m => console.log(m)); },
 *     ObserverOptions.all(),
 *     document.body
 * );
 *
 * observer.observe(); // будет использовать document.body и указанные опции
 * observer.observe(document.querySelector('#header')); // target переопределён
 *
 * ```
 *
 * ---
 *
 * ### ⚠️ **Важно**
 *
 * По спецификации MutationObserver необходимо указать хотя бы один из параметров:
 *
 * - 👶 `childList`
 * - 🏷️ `attributes`
 * - ✏️ `characterData`
 *
 * В противном случае вызов `.observe()` приведёт к исключению:
 * 🚫 `"An invalid or illegal string was specified"`
 *
 * ---
 *
 * Для декларативного создания используйте {@link Observer.new} или функцию {@link observer}.
 *
 * @class
 */
class Observer extends MutationObserver {
    /**
     * 🟢 `isObserving` — флаг, указывающий, активно ли в данный момент наблюдение за DOM-узлом.
     *
     * ---
     *
     * ### 📋 Описание:
     *
     * - Значение `true` означает, что метод {@link observe} был вызван и {@link Observer} следит за изменениями.
     * - После вызова {@link disconnect} значение сбрасывается в `false`.
     * - Используется для предотвращения повторного запуска наблюдения и корректного управления жизненным циклом Observer.
     * - Позволяет безопасно вызывать `observe()` и `disconnect()` несколько раз подряд без ошибок.
     *
     * ---
     *
     * ### 🧑‍💻 Пример использования:
     *
     * ```js
     *
     * const obs = new Observer(callback, { childList: true }, document.body);
     *
     * obs.observe();
     * console.log(obs.isObserving); // 👉 true
     *
     * obs.disconnect();
     * console.log(obs.isObserving); // 👉 false
     *
     * ```
     *
     * ---
     *
     * @type {boolean}
     */
    isObserving = false;
    /**
     * ⚙️ Конфигурация для {@link Observer}.
     *
     * Содержит параметры, указывающие, какие типы изменений в DOM необходимо отслеживать:
     *
     * - `childList`: отслеживание добавления/удаления узлов.
     * - `attributes`: отслеживание изменений атрибутов.
     * - `characterData`: отслеживание изменений текста.
     * - `subtree`, `attributeOldValue`, `characterDataOldValue`, `attributeFilter` и др.
     *
     * Значение передаётся в метод `.observe()` при вызове.
     *
     * @readonly
     * @type {ObserverOptions | MutationObserverInit | undefined}
     * @protected
     */
    _options;
    /**
     * 🎯 Целевой DOM-узел для наблюдения по умолчанию.
     *
     * Используется в методе `observe()`, если не был явно передан `target`.
     * Позволяет задать основной элемент для отслеживания прямо при создании экземпляра {@link Observer},
     * избавляя от необходимости указывать его каждый раз.
     *
     * ---
     *
     * ### Применение:
     *
     * Если `observe()` вызывается без аргументов, будет использован `#target`.
     *
     * ---
     *
     * ### Пример:
     *
     * ```js
     *
     * const observer = new Observer(callback, options, document.body);
     *
     * observer.observe(); // будет использован document.body
     *
     * ```
     *
     * @readonly
     * @type {Node | undefined}
     * @protected
     */
    _target;
    /**
     * 📞 Callback-функция, вызываемая при каждом изменении DOM.
     *
     * Передаётся в конструктор и используется как основной обработчик мутаций.
     * Сигнатура: `(mutations: MutationRecord[], observer: MutationObserver) => void`
     *
     * ---
     *
     * ### Пример:
     * ```js
     *
     * const observer = new Observer((mutations) => {
     *     mutations.forEach(m => console.log(m));
     * });
     *
     * ```
     *
     * ---
     *
     * @readonly
     * @type {MutationCallback}
     * @protected
     */
    _callback;
    /**
     * 🔒 Внутренний флаг блокировки для autoDisconnect.
     *
     * Используется для предотвращения повторного запуска автоматического отключения:
     * если autoDisconnect() уже был вызван и таймер ещё не сработал, повторные вызовы игнорируются.
     * После срабатывания таймера и вызова disconnect() флаг сбрасывается.
     *
     * @type {boolean}
     * @protected
     */
    _autoDisconnectLock = false;
    /**
     * ⏲️ `_autoDisconnectTimer` — идентификатор активного таймера автоотключения.
     *
     * ---
     *
     * Используется для хранения результата `setTimeout` из {@link autoDisconnect}.
     * Позволяет отменить или сбросить таймер через {@link cancelAutoDisconnect}.
     *
     * - `undefined` — таймер не запущен.
     * - После срабатывания или отмены всегда сбрасывается в `undefined`.
     *
     * @type {NodeJS.Timeout|number}
     * @protected
     */
    _autoDisconnectTimer = undefined;
    /**
     * 🔗 Внутренняя функция-resolve для промиса autoDisconnect.
     *
     * ---
     *
     * Используется для ручного завершения промиса, возвращаемого методом {@link autoDisconnect},
     * если отключение происходит не по таймеру, а вручную через {@link disconnect}.
     * Это позволяет корректно резолвить промис даже при ручном отключении наблюдения.
     *
     * - Устанавливается при запуске autoDisconnect.
     * - Вызывается и сбрасывается при disconnect или по таймеру.
     *
     * @type {Function|undefined}
     * @protected
     */
    _autoDisconnectPromiseResolve = undefined;
    /**
     *
     * @param {MutationCallback} callback
     * @param {ObserverOptions | MutationObserverInit | undefined} options
     * @param {Node | undefined} target
     */
    constructor(callback, options, target) {
        super(callback);
        this._callback = callback;
        this._options = options;
        this._target = target;
    }
    /**
     * 🛰️ Запускает отслеживание изменений в DOM-узле.
     *
     * Обёртка над `MutationObserver.observe()`, использующая параметры и целевой узел,
     * заданные в конструкторе, либо переопределяемые вручную при вызове.
     *
     * ---
     *
     * ### 📋 Что делает:
     *
     * - Если параметры `target` и/или `options` не переданы, используются значения из конструктора.
     * - Если не указан ни один из обязательных параметров (`childList`, `attributes`, `characterData`), будет выброшено исключение.
     * - Повторный вызов `observe()` без предварительного `disconnect()` не приведёт к повторному запуску наблюдения.
     *
     * ---
     *
     * ### 📝 Что можно отслеживать:
     *
     * - ➕➖ добавление/удаление дочерних элементов (`childList`)
     * - 🏷️ изменения атрибутов (`attributes`)
     * - 📝✏️ изменения текстового содержимого (`characterData`)
     * - 🌳 изменения во вложенных узлах (`subtree`)
     *
     * ---
     *
     * ### ⚠️ Важно:
     *
     * - По спецификации `MutationObserver`, обязательно должна быть указана хотя бы одна из опций:
     *
     *   - `childList`
     *   - `attributes`
     *   - `characterData`
     *
     * - Иначе будет выброшено исключение: `"An invalid or illegal string was specified"`
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = new Observer((mutations) => {
     *     for (const mutation of mutations) {
     *         console.log(mutation);
     *     }
     * }, {
     *     attributes: true,
     *     attributeOldValue: true,
     *     subtree: true
     * }, document.getElementById('app'));
     *
     * observer.observe();
     *
     * // или переопределить target и options вручную:
     * observer.observe(document.querySelector('#header'), { childList: true });
     *
     * ```
     *
     * ---
     *
     * @param {Node|undefined} [target] - DOM-узел, за которым будет вестись наблюдение. Если не указан — используется target из конструктора.
     * @param {ObserverOptions|MutationObserverInit|undefined} [options] - Объект параметров наблюдения. Если не указан — используется options из конструктора.
     * @throws {TypeError} Если `target` не является допустимым DOM-узлом.
     * @throws {TypeError} Если не заданы параметры наблюдения.
     * @throws {SyntaxError} Если не указана ни одна из обязательных опций (`childList`, `attributes`, `characterData`).
     * @returns {void}
     */
    observe(target, options) {
        if (!target) {
            target = this._target;
        }
        if (!target) {
            throw new TypeError('Не указан DOM-узел для запуска наблюдения.');
        }
        if (!options) {
            options = this._options;
        }
        if (!options) {
            throw new TypeError('Не заданы параметры наблюдения.');
        }
        if (!this.isObserving) {
            super.observe(target, options);
            this.isObserving = true;
        }
    }
    /**
     * 🔌 Останавливает наблюдение за всеми ранее отслеживаемыми DOM-узлами.
     *
     * ---
     *
     * ### 📋 Что делает:
     *
     * - Прекращает получение уведомлений обо всех изменениях, за которыми следил данный {@link Observer}.
     * - Сбрасывает флаг {@link isObserving} в `false`.
     * - Если был активен таймер автоотключения (`autoDisconnect`), отменяет его через {@link cancelAutoDisconnect} и завершает промис autoDisconnect.
     * - Безопасно вызывать несколько раз подряд — повторные вызовы не приводят к ошибкам.
     *
     * ---
     *
     * ### 🧑‍💻 Пример использования:
     *
     * ```js
     *
     * const observer = new Observer(callback, { childList: true }, document.body);
     * observer.observe();
     *
     * // ...позже
     * observer.disconnect(); // Отключение отслеживания
     *
     * ```
     *
     * ---
     *
     * ### 📝 Когда использовать:
     *
     * - Когда наблюдение больше не требуется.
     * - Чтобы освободить ресурсы и предотвратить утечки памяти.
     * - Перед повторным запуском наблюдения с другими параметрами.
     *
     * ---
     *
     * ### ⚠️ Особенности:
     *
     * - Если был запущен autoDisconnect, таймер будет отменён и промис autoDisconnect завершится.
     * - После вызова disconnect можно снова запускать observe или autoDisconnect.
     *
     * @returns {void}
     */
    disconnect() {
        if (this.isObserving) {
            if (this._autoDisconnectLock) {
                this.cancelAutoDisconnect();
            }
            super.disconnect();
            this.isObserving = false;
        }
    }
    /**
     * ⏳ Автоматически отключает наблюдение через заданное количество миллисекунд.
     *
     * ---
     *
     * ### 📋 Что делает:
     *
     * - Запускает таймер, по истечении которого вызывается {@link disconnect()} и наблюдение прекращается.
     * - Если наблюдение уже неактивно (`isObserving: false`), метод ничего не делает и возвращает сразу резолвящийся Promise.
     * - Если autoDisconnect уже был вызван и таймер ещё не сработал, повторные вызовы возвращают новый Promise, который резолвится одновременно с первым.
     * - После отключения (или ручного вызова {@link disconnect}) возможность автоотключения восстанавливается.
     *
     * ---
     *
     * ### ⚠️ Особенности:
     *
     * - Если `ms <= 0`, выбрасывается ошибка.
     * - Отключение происходит асинхронно через `setTimeout`.
     * - Безопасно вызывать несколько раз подряд — отключение произойдёт только один раз, все промисы резолвятся.
     * - Возвращает Promise, который резолвится после отключения (или сразу, если наблюдение неактивно).
     * - Можно передать необязательный колбэк `onDisconnect`, который будет вызван после отключения.
     *
     * ---
     *
     * ### 🧑‍💻 Пример использования:
     *
     * ```js
     *
     * const observer = new Observer(callback, { childList: true }, document.body);
     * observer.observe();
     * await observer.autoDisconnect(5000, () => {
     *     console.log('Наблюдение отключено!');
     * });
     *
     * ```
     *
     * ---
     *
     * @param {number} ms - Время в миллисекундах до автоматического отключения.
     * @param {Function} [onDisconnect] - Необязательный колбэк, вызываемый после отключения.
     * @throws {Error} Если время меньше или равно нулю.
     * @returns {Promise<void>} Промис, который резолвится после отключения (или сразу, если наблюдение неактивно).
     */
    autoDisconnect(ms, onDisconnect) {
        if (ms <= 0) {
            throw new Error('Время до автоматического отключения не может быть меньше или равно нулю.');
        }
        if (!this.isObserving || this._autoDisconnectLock) {
            return Promise.resolve();
        }
        this._autoDisconnectLock = true;
        return new Promise((resolve) => {
            this._autoDisconnectPromiseResolve = resolve;
            this._autoDisconnectTimer = setTimeout(() => {
                if (this._autoDisconnectLock) {
                    this.disconnect();
                    if (onDisconnect) {
                        onDisconnect();
                    }
                    resolve();
                }
            }, ms);
        });
    }
    /**
     * ⏹️ Отменяет запланированное автоматическое отключение наблюдения.
     *
     * ---
     *
     * ### 📋 Что делает:
     *
     * - Если был запущен таймер через {@link autoDisconnect}, отменяет его с помощью `clearTimeout`.
     * - Завершает все промисы, возвращённые autoDisconnect, вызвав их resolve.
     * - Сбрасывает внутренние флаги блокировки, позволяя снова вызвать {@link autoDisconnect}.
     * - Если таймер не был установлен, метод ничего не делает.
     *
     * ---
     *
     * ### 🧑‍💻 Пример использования:
     *
     * ```js
     *
     * const observer = new Observer(callback, { childList: true }, document.body);
     * observer.observe();
     * observer.autoDisconnect(5000);
     * // ...решили отменить автоотключение:
     * observer.cancelAutoDisconnect();
     *
     * ```
     *
     * ---
     *
     * @returns {void}
     */
    cancelAutoDisconnect() {
        if (this._autoDisconnectTimer) {
            clearTimeout(this._autoDisconnectTimer);
            if (this._autoDisconnectPromiseResolve) {
                this._autoDisconnectPromiseResolve();
                this._autoDisconnectPromiseResolve = undefined;
            }
            this._autoDisconnectTimer = undefined;
            this._autoDisconnectLock = false;
        }
    }
    /**
     * 📦 Получает все накопленные, но ещё не обработанные записи об изменениях.
     *
     * Метод возвращает массив объектов `MutationRecord`, которые были зафиксированы,
     * но ещё не переданы в `callback` наблюдателя (например, если изменения произошли,
     * но `callback` ещё не был вызван из-за задержки обработки очереди событий).
     *
     * ---
     *
     * ### 🧠 Когда использовать:
     *
     * - Когда нужно немедленно получить список изменений без ожидания вызова колбэка.
     * - В ситуациях с ручным управлением или синхронной обработкой изменений.
     *
     * ---
     *
     * ### 📝 Примечание:
     *
     * Метод **не очищает очередь изменений** в `MutationObserver`. Он **забирает** накопленные записи и очищает её.
     * Повторный вызов вернёт пустой массив, если не произошло новых изменений.
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = new Observer(() => {}, { childList: true }, document.body);
     * observer.observe();
     *
     * // Изменение DOM
     * document.body.appendChild(document.createElement('div'));
     *
     * const records = observer.takeRecords();
     * console.log(records); // Выведет массив с MutationRecord
     *
     * ```
     *
     * ---
     *
     * @returns {MutationRecord[]}
     */
    takeRecords() {
        return super.takeRecords();
    }
    /**
     * 🆕 `Observer.new()` — удобный способ создания {@link Observer} с помощью билдера {@link ObserverBuilder}.
     *
     * ---
     *
     * ### 📖 Назначение:
     *
     * Предоставляет fluent-интерфейс для создания {@link Observer} с пошаговой конфигурацией:
     *
     * - целевого DOM-узла (`for(...)`)
     * - параметров наблюдения (`with(...)` или `options(builder => ...)`)
     * - колбэка (`call(...)`)
     *
     * ---
     *
     * ### ✅ Пример:
     *
     * ```js
     *
     * const observer = Observer
     *     .new()
     *     .for(document.body)
     *     .options((builder) =>
     *         builder
     *             .descendants()
     *             .attributes(['data-id'])
     *             .text()
     *             .useOldValue()
     *     )
     *     .call((mutations) => {
     *         console.log('Mutations:', mutations);
     *     })
     *     .build();
     *
     * observer.observe();
     *
     * ```
     *
     * ---
     *
     * @returns {ObserverBuilder}
     */
    static new() {
        return new ObserverBuilder();
    }
}
export default Observer;
//# sourceMappingURL=Observer.mjs.map