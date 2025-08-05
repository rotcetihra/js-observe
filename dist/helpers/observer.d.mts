import ObserverBuilder from '../ObserverBuilder.mjs';
/**
 * 🛠️ Создаёт новый экземпляр {@link ObserverBuilder} — строитель для конфигурации {@link Observer}.
 *
 * Используется для декларативного и цепочного создания наблюдателя за изменениями DOM.
 * Позволяет настроить `target`, `options`, `callback` и вызвать `.build()` для получения {@link Observer}.
 *
 * ---
 *
 * ### ✅ Пример использования
 *
 * ```js
 *
 * const observer = observer()
 *   .for(document.body)
 *   .options((b) => b.children())
 *   .call((mutations) => console.log(mutations))
 *   .build();
 *
 * observer.observe();
 *
 * ```
 *
 * ---
 *
 * @returns {ObserverBuilder}
 * @function observer
 */
export default function observer(): ObserverBuilder;
