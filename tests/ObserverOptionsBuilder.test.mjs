import ObserverOptions from '../src/ObserverOptions.mjs';
import ObserverOptionsBuilder from '../src/ObserverOptionsBuilder.mjs';
import { describe, test, expect } from '@jest/globals';

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

describe('ObserverOptionsBuilder', () => {
    describe('создаёт опции', () => {
        test('для дочерних элементов', () => {
            expectEqual(new ObserverOptionsBuilder().children().build(), {
                childList: true,
            });
        });

        test('для потомков', () => {
            expectEqual(new ObserverOptionsBuilder().descendants().build(), {
                childList: true,
                subtree: true,
            });
        });

        test('для любых атрибутов', () => {
            expectEqual(new ObserverOptionsBuilder().attributes().build(), {
                attributes: true,
            });
        });

        test('для конкретных атрибутов', () => {
            expectEqual(
                new ObserverOptionsBuilder()
                    .attributes(['class', 'id'])
                    .build(),
                {
                    attributes: true,
                    attributeFilter: ['class', 'id'],
                },
            );
        });

        test('для любых атрибутов потомков', () => {
            expectEqual(
                new ObserverOptionsBuilder().descendantAttributes().build(),
                {
                    attributes: true,
                    subtree: true,
                },
            );
        });

        test('для конкретных атрибутов потомков', () => {
            expectEqual(
                new ObserverOptionsBuilder()
                    .descendantAttributes(['class', 'id'])
                    .build(),
                {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['class', 'id'],
                },
            );
        });

        test('для текста в конкретном текстовом узле', () => {
            expectEqual(new ObserverOptionsBuilder().text().build(), {
                characterData: true,
            });
        });

        test('для текста в любом текстовом узле внутри целевого элемента', () => {
            expectEqual(new ObserverOptionsBuilder().descendantText().build(), {
                characterData: true,
                subtree: true,
            });
        });

        test('для отслеживания изменений в потомках', () => {
            expectEqual(
                new ObserverOptionsBuilder().children().subtree().build(),
                {
                    childList: true,
                    subtree: true,
                },
            );
        });

        test('для получения старого значения атрибута', () => {
            expectEqual(
                new ObserverOptionsBuilder().attributes().useOldValue().build(),
                {
                    attributes: true,
                    attributeOldValue: true,
                },
            );
        });

        test('для получения старого значения текста', () => {
            expectEqual(
                new ObserverOptionsBuilder().text().useOldValue().build(),
                {
                    characterData: true,
                    characterDataOldValue: true,
                },
            );
        });

        test('для получения старого значения текста и атрибута', () => {
            expectEqual(
                new ObserverOptionsBuilder()
                    .text()
                    .attributes()
                    .useOldValue()
                    .build(),
                {
                    attributes: true,
                    characterData: true,
                    attributeOldValue: true,
                    characterDataOldValue: true,
                },
            );
        });

        test('для отслеживания изменений содержимого целевого элемента', () => {
            expectEqual(new ObserverOptionsBuilder().content().build(), {
                childList: true,
                characterData: true,
                subtree: true,
            });
        });

        test('для отслеживания всех изменений', () => {
            expectEqual(new ObserverOptionsBuilder().all().build(), {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true,
            });
        });
    });

    describe('выбрасывает ошибку, если', () => {
        test('не вызваны методы attributes()/text() до вызова useOldValue', () => {
            expect(() => new ObserverOptionsBuilder().useOldValue()).toThrow(
                'ObserverOptionsBuilder.useOldValue() требует предварительного вызова attributes() и/или text()',
            );
        });

        test('не указан тип наблюдаемых изменений', () => {
            expect(() =>
                new ObserverOptionsBuilder().subtree().build(),
            ).toThrow(
                'ObserverOptionsBuilder.build() требует включить хотя бы один тип наблюдения: childList(), attributes() или text()',
            );
        });
    });

    test('build возвращает один и тот же объект при повторных вызовах', () => {
        const builder = new ObserverOptionsBuilder().children();

        const opts1 = builder.build();
        const opts2 = builder.build();

        expect(opts1).toBe(opts2);
        expect(opts1).toBeInstanceOf(ObserverOptions);
    });
});
