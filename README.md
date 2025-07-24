# 🔭 js-observe

**js-observe** — умная, декларативная и лаконичная обёртка над
[MutationObserver](https://developer.mozilla.org/ru/docs/Web/API/MutationObserver)
для отслеживания изменений DOM в современном стиле.

## 🚀 Возможности

-   ✅ Fluent Builder API для конфигурации наблюдения
-   ✅ Безопасная настройка без ручных ошибок
-   ✅ Повторное использование наблюдателей и опций
-   ✅ Поддержка старых значений (`oldValue`)
-   ✅ Фильтрация по атрибутам (`attributeFilter`)
-   ✅ Вложенное наблюдение (`subtree`)
-   ✅ Простая точка входа: `observer()` и `observe()`
-   ✅ Поддержка отключения и получения записей (`disconnect`, `takeRecords`)
-   ✅ Подробные JSDoc и примеры

## 📦 Установка

```bash
npm install js-observe
```

## 🧁 Быстрый пример

```js
import { observer } from 'js-observe';

const obs = observer()
    .for(document.body)
    .options((o) =>
        o
            .descendants()
            .attributes(['data-state', 'class'])
            .text()
            .useOldValue(),
    )
    .call((mutations) => {
        for (const m of mutations) {
            console.log(`[${m.type}]`, m);
        }
    })
    .build();

obs.observe();
```

## 📐 Примеры

### 🔧 Минимальный запуск через observe()

```js
import observe from 'js-observe/observe';

observe(document.querySelector('#root'), { childList: true }, (mutations) => {
    console.log('Изменения:', mutations);
});
```

### 🧱 Конфигурация через билдера

```js
import observer from 'js-observe/observer';

const obs = observer()
    .for(document.querySelector('#container'))
    .options((o) => o.children().text().attributes().useOldValue())
    .call((mutations) => {
        console.log('Обнаружены изменения в DOM:', mutations);
    })
    .build();

obs.observe();
```

### 🧠 Использование Observer напрямую

```js
import Observer from 'js-observe/Observer';

const obs = new Observer(
    (mutations) => console.log(mutations),
    {
        attributes: true,
        characterData: true,
        subtree: true,
        attributeOldValue: true,
        characterDataOldValue: true,
    },
    document.body,
);

obs.observe();
```

### 🧪 Получение отложенных изменений

```js
const observer = new Observer(() => {}, { childList: true }, document.body);
observer.observe();

// ...изменения в DOM...
document.body.appendChild(document.createElement('div'));

// Получаем записи напрямую
const changes = observer.takeRecords();
console.log(changes);
```

---

## 🛠️ API

### ObserverBuilder

-   `.for(node: Node)` — указать целевой узел
-   `.with(options: ObserverOptions)` — задать опции напрямую
-   `.options((builder: ObserverOptionsBuilder) => void)` — сконфигурировать
    через билдер
-   `.call(callback: MutationCallback)` — задать callback
-   `.build()` — получить экземпляр Observer

### ObserverOptionsBuilder

| Метод           | Что делает                                       |
| --------------- | ------------------------------------------------ |
| children()      | Отслеживает только прямых потомков (`childList`) |
| descendants()   | Прямые + вложенные (`childList` + `subtree`)     |
| attributes([…]) | Отслеживает атрибуты, можно указать фильтр       |
| text()          | Отслеживает изменения текста (`characterData`)   |
| subtree()       | Включает вложенные узлы                          |
| useOldValue()   | Возвращает старые значения атрибутов/текста      |
| all()           | Включает всё сразу                               |
| build()         | Возвращает готовую конфигурацию                  |

---

## ⚠️ Обязательные опции

По спецификации MutationObserver, необходимо указать хотя бы одну из:

-   `childList`
-   `attributes`
-   `characterData`

Иначе произойдёт ошибка:

```
"An invalid or illegal string was specified"
```

---

## 🧼 Отключение наблюдения

```js
const obs = observer()
    .for(document.body)
    .options((o) => o.all())
    .call(console.log)
    .build();

obs.observe();

// позже
obs.disconnect(); // Отключить
```

## 💡 Идеи для расширения

-   Поддержка таймеров/батчей для обновлений
-   Возможность указания debounce/throttle
-   Поддержка MutationRecord фильтрации
-   Интеграция с React/Vue

---

## 📄 Лицензия

[MIT](./LICENSE)

---

## 👤 Автор

Архитектор — <rotcetihra@mail.ru>

Создано с любовью к чистому и предсказуемому DOM-наблюдению.
