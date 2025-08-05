# 🔭 js-observe

**js-observe** — современная, декларативная и безопасная обёртка над
[MutationObserver](https://developer.mozilla.org/ru/docs/Web/API/MutationObserver)
для отслеживания изменений DOM с помощью fluent-интерфейса.

[Документация](https://rotcetihra.github.io/js-observe/index.html)

---

## 🚀 Возможности

-   🧩 Fluent Builder API — лаконичная цепочка методов
-   🛡️ Безопасная конфигурация — исключает ошибки при настройке
-   🔁 Повторное использование — один билдер, много наблюдателей
-   🏷️ Фильтрация атрибутов и поддержка `oldValue`
-   🌳 Наблюдение за потомками (`subtree`)
-   ⚡ Быстрый запуск: `observer()` и `observe()`
-   🛑 Контроль: `disconnect()`, `takeRecords()`
-   📚 Подробный JSDoc и реальные примеры

---

## 📦 Установка

```bash

npm install @rotcetihra/js-observe

```

---

## 🍰 Быстрый старт

```js
import { observer, ObserverOptions } from '@rotcetihra/js-observe';

const obs = observer()
    .for(document.body)
    .with(ObserverOptions.all())
    .call((mutations) => {
        for (const m of mutations) {
            console.log(`🔔 [${m.type}]`, m);
        }
    })
    .build();

obs.observe();
```

---

## 🧩 Примеры

### 🛠️ Минимальный запуск (без билдера)

```js
import { observe, ObserverOptions } from '@rotcetihra/js-observe';

observe(
    document.querySelector('#root'),
    ObserverOptions.children(),
    (mutations) => {
        console.log('📝 Изменения:', mutations);
    },
);
```

### 🏗️ Конфигурация через билдер

```js
import { observer } from '@rotcetihra/js-observe';

const obs = observer()
    .for(document.querySelector('#container'))
    .options((o) => o.children().text().attributes().useOldValue())
    .call((mutations) => {
        console.log('🧬 Изменения в DOM:', mutations);
    })
    .build();

obs.observe();
```

### 🧠 Использование напрямую

```js
import { Observer, ObserverOptions } from '@rotcetihra/js-observe';

const obs = new Observer(
    (mutations) => console.log('🔎', mutations),
    ObserverOptions.all(),
    document.body,
);

obs.observe();
```

### 📦 Получение накопленных изменений

```js
const obs = new Observer(() => {}, ObserverOptions.children(), document.body);
obs.observe();

document.body.appendChild(document.createElement('div'));

const changes = obs.takeRecords();
console.log('📦', changes);
```

---

## 🛠️ API

### 🧩 `ObserverBuilder`

| Метод             | Назначение                     |
| ----------------- | ------------------------------ |
| `.for(node)`      | 🎯 Целевой DOM-узел            |
| `.with(options)`  | ⚙️ Прямые опции (без билдера)  |
| `.options(fn)`    | 🏗️ Билдер-режим для опций      |
| `.call(callback)` | 📞 Обработчик изменений        |
| `.build()`        | 🏁 Получить готовый `Observer` |

---

### 🏗️ `ObserverOptionsBuilder`

| Метод                   | Что делает                               |
| ----------------------- | ---------------------------------------- |
| `.children()`           | 👶 Прямые потомки (`childList`)          |
| `.descendants()`        | 🌳 Все потомки (`childList` + `subtree`) |
| `.attributes([filter])` | 🏷️ Атрибуты с фильтром (или без)         |
| `.text()`               | ✏️ Текстовые узлы (`characterData`)      |
| `.subtree()`            | 🌲 Вложенные узлы (`subtree`)            |
| `.useOldValue()`        | ⏪ Возврат старых значений (`oldValue`)  |
| `.all()`                | 🧿 Включить всё сразу                    |
| `.build()`              | 📦 Готовый объект опций                  |

---

## ⚠️ Обязательные параметры

MutationObserver требует хотя бы **один** из параметров:

-   👶 `childList`
-   🏷️ `attributes`
-   ✏️ `characterData`

Иначе будет ошибка:

```
🚫 The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.
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

// Позже
obs.disconnect(); // 🛑 Остановить наблюдение
```

---

## Изменения

[CHANGELOG](./CHANGELOG.md)

---

## 📄 Лицензия

[MIT](./LICENSE)

---

## 👤 Автор

Разработано с вниманием к деталям и чистоте DOM.

📧 Архитектор [rotcetihra@mail.ru](mailto:rotcetihra@mail.ru)
