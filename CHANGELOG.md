# Changelog

Все заметные изменения в этом проекте документируются в этом файле.

## [1.0.3] - 2025-07-31

-   Исправлена опечатка в поле `main` файла `package.json`.

## [1.0.2] - 2025-07-31

-   Удалена публикация в npm документации и тестов.

## [1.0.1] — 2025-07-31

-   Исправлена ошибка в имени пакета: `js-observe` → `@rotcetihra/js-observe`.

## [1.0.0] — 2025-07-31

-   Первый стабильный релиз.
-   Fluent API для создания MutationObserver через ObserverBuilder и
    ObserverOptionsBuilder.
-   Поддержка всех опций MutationObserver: childList, attributes, characterData,
    subtree, attributeOldValue, characterDataOldValue, attributeFilter.
-   Методы для декларативной сборки опций: `.children()`, `.descendants()`,
    `.attributes()`, `.descendantAttributes()`, `.text()`, `.descendantText()`,
    `.content()`, `.all()`, `.useOldValue()`, `.build()`.
-   Поддержка повторного использования конфигураций.
-   Подробная документация и примеры.
-   Покрытие тестами (Jest).
