import ObserverOptions from '../dist/ObserverOptions.mjs';
import { describe, test, expect } from '@jest/globals';
import ObserverOptionsBuilder from '../dist/ObserverOptionsBuilder.mjs';

function expectEqual(options, object) {
    expect(options).toEqual(
        Object.assign(
            {
                childList: false,
                attributes: false,
                characterData: false,
                subtree: false,
                attributeOldValue: false,
                characterDataOldValue: false,
                attributeFilter: undefined,
            },
            object,
        ),
    );
}

describe('ObserverOptions', () => {
    test('по умолчанию содержит корректные значения', () => {
        const opts = new ObserverOptions();

        expect(new ObserverOptions()).toEqual({
            childList: false,
            attributes: false,
            characterData: false,
            subtree: false,
            attributeOldValue: false,
            characterDataOldValue: false,
            attributeFilter: undefined,
        });
    });

    test('метод new возвращает экземпляр ObserverOptionsBuilder', () => {
        expect(ObserverOptions.new()).toBeInstanceOf(ObserverOptionsBuilder);
    });

    test('метод children возвращает опции для наблюдения за дочерними элементами', () => {
        expectEqual(ObserverOptions.children(), {
            childList: true,
        });
    });

    test('метод descendants возвращает опции для наблюдения за потомками', () => {
        expectEqual(ObserverOptions.descendants(), {
            childList: true,
            subtree: true,
        });
    });

    test('метод attributes возвращает опции для наблюдения за любыми атрибутами целевого элемента', () => {
        expectEqual(ObserverOptions.attributes(), {
            attributes: true,
        });
    });

    test('метод attributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента', () => {
        expectEqual(ObserverOptions.attributes(['class', 'data-state']), {
            attributes: true,
            attributeFilter: ['class', 'data-state'],
        });
    });

    test('метод attributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента с сохранением старого значения атрибута', () => {
        expectEqual(ObserverOptions.attributes(['class', 'data-state'], true), {
            attributes: true,
            attributeFilter: ['class', 'data-state'],
            attributeOldValue: true,
        });
    });

    test('метод descendantAttributes возвращает опции для наблюдения за любыми атрибутами целевого элемента и его потомков', () => {
        expectEqual(ObserverOptions.descendantAttributes(), {
            attributes: true,
            subtree: true,
        });
    });

    test('метод descendantAttributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента и его потомков', () => {
        expectEqual(
            ObserverOptions.descendantAttributes(['class', 'data-state']),
            {
                attributes: true,
                subtree: true,
                attributeFilter: ['class', 'data-state'],
            },
        );
    });

    test('метод descendantAttributes возвращает опции для наблюдения за конкретными атрибутами целевого элемента и его потомков с сохранением старого значения атрибута', () => {
        expectEqual(
            ObserverOptions.descendantAttributes(['class', 'data-state'], true),
            {
                attributes: true,
                subtree: true,
                attributeFilter: ['class', 'data-state'],
                attributeOldValue: true,
            },
        );
    });

    test('метод text возвращает опции для наблюдения за текстом в текстовом узле', () => {
        expectEqual(ObserverOptions.text(), {
            characterData: true,
        });
    });

    test('метод text возвращает опции для наблюдения за текстом в текстовом узле с сохранением старого значения', () => {
        expectEqual(ObserverOptions.text(true), {
            characterData: true,
            characterDataOldValue: true,
        });
    });

    test('метод descendantText возвращает опции для наблюдения за текстом в целевом элементе и его потомках', () => {
        expectEqual(ObserverOptions.descendantText(), {
            characterData: true,
            subtree: true,
        });
    });

    test('метод descendantText возвращает опции для наблюдения за текстом в целевом элементе и его потомках с сохранением старого значения', () => {
        expectEqual(ObserverOptions.descendantText(true), {
            characterData: true,
            characterDataOldValue: true,
            subtree: true,
        });
    });

    test('метод content возвращает опции для наблюдения за содержимом внутри целевого элемента', () => {
        expectEqual(ObserverOptions.content(), {
            childList: true,
            characterData: true,
            subtree: true,
        });
    });

    test('метод content возвращает опции для наблюдения за содержимом внутри целевого элемента с сохранением старого значения', () => {
        expectEqual(ObserverOptions.content(true), {
            childList: true,
            characterData: true,
            subtree: true,
            characterDataOldValue: true,
        });
    });

    test('метод all возвращает опции для наблюдения за всеми изменениями', () => {
        expectEqual(ObserverOptions.all(), {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
        });
    });

    test('метод all возвращает опции для наблюдения за всеми изменениями с сохранением старых значений', () => {
        expectEqual(ObserverOptions.all(true), {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true,
        });
    });

    test('при передаче объекта ObserverOptions в MutationObserver без изменения опций, будет выброшена ошибка', () => {
        expect(() =>
            new MutationObserver(() => {}).observe(
                document.body,
                new ObserverOptions(),
            ),
        ).toThrow(
            "The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.",
        );
    });
});
