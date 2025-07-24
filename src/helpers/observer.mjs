import ObserverBuilder from '../ObserverBuilder.mjs';

/**
 * 🧱 Фабричная функция `observer()` — точка входа для построения {@link Observer} с помощью fluent-интерфейса.
 *
 * Создаёт и возвращает новый экземпляр {@link ObserverBuilder}, позволяющий декларативно и удобно
 * настроить наблюдатель ({@link Observer}) с помощью цепочки методов:
 *
 * - задать целевой DOM-узел
 * - указать параметры наблюдения через {@link ObserverOptionsBuilder}
 * - задать callback
 * - собрать итоговый `Observer`
 *
 * ---
 *
 * ### ✅ Пример:
 *
 * ```js
 *
 * const obs = observer()
 *     .for(document.body)
 *     .options((o) => o.descendants().attributes().text().useOldValue())
 *     .call((mutations) => console.log(mutations))
 *     .build();
 *
 * obs.observe();
 *
 * ```
 *
 * ---
 *
 * @returns {ObserverBuilder} Новый экземпляр билдера для конфигурирования {@link Observer}.
 */
export default function observer() {
    return new ObserverBuilder();
}
