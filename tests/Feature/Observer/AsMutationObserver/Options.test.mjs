import { describe, test, expect } from '@jest/globals';
import Options from '/dist/ObserverOptions.mjs';
import Test from '/tests/TestObserver.mjs';

describe('Observer', () => {
    describe('поведение опций соответствует MutationObserver', () => {
        describe('при использовании опции children', () => {
            test('наблюдает за дочерними элементами', async () => {
                const t = await Test.setup(Options.children());

                await t.removeChild();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'childList',
                    target: t.target(),
                });

                t.teardown();
            });

            test('наблюдает за изменением текста', async () => {
                const t = await Test.setup(Options.children());

                // Удаление дочерних элементов и добавление текстового узла.
                t.target().textContent = 'text';

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'childList',
                    target: t.target(),
                });

                t.teardown();
            });

            const nonObservableChanges = [
                [
                    'потомками',
                    (t) =>
                        t.child().appendChild(document.createElement('span')),
                ],
                [
                    'атрибутами',
                    (t) => t.target().setAttribute('data-test', 'true'),
                ],
                [
                    'атрибутами потомков',
                    (t) => t.child().setAttribute('data-test', 'true'),
                ],
                [
                    'изменением текста в родителе',
                    (t) => {
                        expect(t.target().lastChild.data).toBe('root');
                        t.target().lastChild.data = 'updated';
                        expect(t.target().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    (t) => {
                        expect(t.child().firstChild.data).toBe('child');
                        t.child().firstChild.data = 'updated';
                        expect(t.child().firstChild.data).toBe('updated');
                    },
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    const t = await Test.setup(Options.children());

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                const t = await Test.setup(Options.children());

                await t.awaitMutation(); // ничего не делаем

                t.expectBothNotToHaveBeenCalled();

                t.teardown();
            });
        });

        describe('при использовании опции descendants', () => {
            test('наблюдает за удалением дочернего элемента', async () => {
                const t = await Test.setup(Options.descendants());

                await t.removeChild();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'childList',
                    target: t.target(),
                });

                t.teardown();
            });

            test('наблюдает за изменением потомков', async () => {
                const t = await Test.setup(Options.descendants());

                t.child().appendChild(document.createElement('span'));

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'childList',
                    target: t.child(),
                });

                t.teardown();
            });

            test('наблюдает за изменением текста внутри потомка', async () => {
                const t = await Test.setup(Options.descendants());

                t.child().textContent = 'обновлённый текст';

                await t.awaitMutation();

                // Здесь будет characterData только если characterData: true
                // В текущем случае, childList:true + subtree:true
                // => текстовое изменение будет сопровождаться заменой текстового узла — childList

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'childList',
                    target: t.child(),
                });

                t.teardown();
            });

            const nonObservableChanges = [
                [
                    'атрибутами родителя',
                    (t) => t.target().setAttribute('data-test', 'true'),
                ],
                [
                    'атрибутами потомка',
                    (t) => t.child().setAttribute('data-test', 'true'),
                ],
                [
                    'изменением текста в родителе',
                    (t) => {
                        expect(t.target().lastChild.data).toBe('root');
                        t.target().lastChild.data = 'updated';
                        expect(t.target().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    (t) => {
                        expect(t.child().firstChild.data).toBe('child');
                        t.child().firstChild.data = 'updated';
                        expect(t.child().firstChild.data).toBe('updated');
                    },
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    const t = await Test.setup(Options.descendants());

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                const t = await Test.setup(Options.descendants());

                await t.awaitMutation(); // ничего не делаем

                t.expectBothNotToHaveBeenCalled();

                t.teardown();
            });
        });

        describe('при использовании опции attributes', () => {
            test('наблюдает за изменением атрибута родителя', async () => {
                const t = await Test.setup(Options.attributes());

                t.target().setAttribute('data-test', 'true');

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'attributes',
                    target: t.target(),
                    attributeName: 'data-test',
                });

                t.teardown();
            });

            const nonObservableChanges = [
                ['изменением дочернего элемента', (t) => t.removeChild()],
                [
                    'изменением потомка',
                    (t) =>
                        t.child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    (t) => {
                        expect(t.target().lastChild.data).toBe('root');
                        t.target().lastChild.data = 'updated';
                        expect(t.target().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    (t) => {
                        expect(t.child().firstChild.data).toBe('child');
                        t.child().firstChild.data = 'updated';
                        expect(t.child().firstChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением атрибутов потомка',
                    (t) => t.child().setAttribute('data-test', 'true'),
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    const t = await Test.setup(Options.attributes());

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                const t = await Test.setup(Options.attributes());

                await t.awaitMutation(); // ничего не делаем

                t.expectBothNotToHaveBeenCalled();

                t.teardown();
            });
        });

        describe('при использовании опции attributes с параметром filter', () => {
            test('наблюдает за изменением конкретного атрибута родителя', async () => {
                const t = await Test.setup(Options.attributes(['data-test']));

                t.target().setAttribute('data-test', 'true');

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'attributes',
                    target: t.target(),
                    attributeName: 'data-test',
                });

                t.teardown();
            });

            const nonObservableChanges = [
                ['изменением дочернего элемента', (t) => t.removeChild()],
                [
                    'изменением потомка',
                    (t) =>
                        t.child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    (t) => {
                        expect(t.target().lastChild.data).toBe('root');
                        t.target().lastChild.data = 'updated';
                        expect(t.target().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    (t) => {
                        expect(t.child().firstChild.data).toBe('child');
                        t.child().firstChild.data = 'updated';
                        expect(t.child().firstChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением других атрибутов родителя',
                    (t) => t.child().setAttribute('data-value', 'true'),
                ],
                [
                    'изменением атрибутов потомка',
                    (t) => t.child().setAttribute('data-test', 'true'),
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    const t = await Test.setup(
                        Options.attributes(['data-test']),
                    );

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                const t = await Test.setup(Options.attributes(['data-test']));

                await t.awaitMutation(); // ничего не делаем

                t.expectBothNotToHaveBeenCalled();

                t.teardown();
            });
        });

        describe('при использовании опции descendantAttributes', () => {
            test('наблюдает за изменением атрибута родителя', async () => {
                const t = await Test.setup(Options.descendantAttributes());

                t.target().setAttribute('data-test', 'true');

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'attributes',
                    target: t.target(),
                    attributeName: 'data-test',
                });

                t.teardown();
            });

            test('наблюдает за изменением атрибута потомка', async () => {
                const t = await Test.setup(Options.descendantAttributes());

                t.child().setAttribute('data-test', 'true');

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'attributes',
                    target: t.child(),
                    attributeName: 'data-test',
                });

                t.teardown();
            });

            const nonObservableChanges = [
                ['изменением дочернего элемента', (t) => t.removeChild()],
                [
                    'изменением потомка',
                    (t) =>
                        t.child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    (t) => {
                        expect(t.target().lastChild.data).toBe('root');
                        t.target().lastChild.data = 'updated';
                        expect(t.target().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    (t) => {
                        expect(t.child().firstChild.data).toBe('child');
                        t.child().firstChild.data = 'updated';
                        expect(t.child().firstChild.data).toBe('updated');
                    },
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    const t = await Test.setup(Options.descendantAttributes());

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                const t = await Test.setup(Options.descendantAttributes());

                await t.awaitMutation(); // ничего не делаем

                t.expectBothNotToHaveBeenCalled();

                t.teardown();
            });
        });

        describe('при использовании опции descendantAttributes с параметром filter', () => {
            test('наблюдает за изменением конкретного атрибута родителя', async () => {
                const t = await Test.setup(
                    Options.descendantAttributes(['data-test']),
                );

                t.target().setAttribute('data-test', 'true');

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'attributes',
                    target: t.target(),
                    attributeName: 'data-test',
                });

                t.teardown();
            });

            test('наблюдает за изменением конкретного атрибута потомка', async () => {
                const t = await Test.setup(
                    Options.descendantAttributes(['data-test']),
                );

                t.child().setAttribute('data-test', 'true');

                await t.awaitMutation();

                t.expectBothToHaveBeenCalledTimes(1);
                t.expectBothToMatchObject({
                    type: 'attributes',
                    target: t.child(),
                    attributeName: 'data-test',
                });

                t.teardown();
            });

            const nonObservableChanges = [
                ['изменением дочернего элемента', (t) => t.removeChild()],
                [
                    'изменением потомка',
                    (t) =>
                        t.child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    (t) => {
                        expect(t.target().lastChild.data).toBe('root');
                        t.target().lastChild.data = 'updated';
                        expect(t.target().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    (t) => {
                        expect(t.child().firstChild.data).toBe('child');
                        t.child().firstChild.data = 'updated';
                        expect(t.child().firstChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением других атрибутов родителя',
                    (t) => t.child().setAttribute('data-value', 'true'),
                ],
                [
                    'изменением других атрибутов потомка',
                    (t) => t.child().setAttribute('data-value', 'true'),
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    const t = await Test.setup(
                        Options.descendantAttributes(['data-test']),
                    );

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                const t = await Test.setup(
                    Options.descendantAttributes(['data-test']),
                );

                await t.awaitMutation(); // ничего не делаем

                t.expectBothNotToHaveBeenCalled();

                t.teardown();
            });
        });

        describe('при использовании опции text', () => {
            describe('реагирует на', () => {
                test('изменение текстового узла только при прямом его наблюдении', async () => {
                    const t = await Test.setup(
                        Options.text(),
                        () => document.querySelector('#root').lastChild,
                    );

                    t.target().data = 'updated';

                    await t.awaitMutation();

                    t.expectBothToHaveBeenCalledTimes(1);
                    t.expectBothToMatchObject({
                        type: 'characterData',
                        target: t.target(),
                    });

                    t.teardown();
                });
            });

            describe('не реагирует на', () => {
                test('изменение текста родителя с помощью textContent', async () => {
                    const t = await Test.setup(Options.text());

                    // Удаление дочерних элементов и добавление текстового узла определяется как мутация типа childList.
                    t.target().textContent = 'text';

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                });

                test('изменение текста родителя с помощью изменения поля data текстового узла', async () => {
                    const t = await Test.setup(Options.text());

                    t.target().lastChild.data = 'text';

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                });

                const nonObservableChanges = [
                    ['изменение дочерних элементов', (t) => t.removeChild()],
                    [
                        'изменение потомков',
                        (t) =>
                            t
                                .child()
                                .appendChild(document.createElement('span')),
                    ],
                    [
                        'изменение атрибутов родителя',
                        (t) => t.target().setAttribute('data-test', 'true'),
                    ],
                    [
                        'изменение атрибутов дочерних элементов',
                        (t) => t.child().setAttribute('data-test', 'true'),
                    ],
                    [
                        'изменение текста в дочернем элементе',
                        (t) => {
                            expect(t.child().firstChild.data).toBe('child');
                            t.child().firstChild.data = 'updated';
                            expect(t.child().firstChild.data).toBe('updated');
                        },
                    ],
                    ['отсутствие изменений', () => {}],
                ];

                test.each(nonObservableChanges)('%s', async (_, mutateDom) => {
                    const t = await Test.setup(Options.text());

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                });
            });
        });

        describe('при использовании опции descendantText', () => {
            describe('реагирует на', () => {
                test('изменение текстового узла при прямом его наблюдении', async () => {
                    const t = await Test.setup(
                        Options.descendantText(),
                        () => document.querySelector('#root').lastChild,
                    );

                    t.target().data = 'updated';

                    await t.awaitMutation();

                    t.expectBothToHaveBeenCalledTimes(1);
                    t.expectBothToMatchObject({
                        type: 'characterData',
                        target: t.target(),
                    });

                    t.teardown();
                });

                test('изменение текста родителя с помощью изменения поля data текстового узла', async () => {
                    const t = await Test.setup(Options.descendantText());

                    t.target().lastChild.data = 'text';

                    await t.awaitMutation();

                    t.expectBothToHaveBeenCalledTimes(1);
                    t.expectBothToMatchObject({
                        type: 'characterData',
                        target: t.target().lastChild,
                    });

                    t.teardown();
                });
            });

            describe('не реагирует на', () => {
                test('изменение текста родителя с помощью textContent', async () => {
                    const t = await Test.setup(Options.descendantText());

                    // Удаление дочерних элементов и добавление текстового узла определяется как мутация типа childList.
                    t.target().textContent = 'text';

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                });

                const nonObservableChanges = [
                    ['изменение дочерних элементов', (t) => t.removeChild()],
                    [
                        'изменение потомков',
                        (t) =>
                            t
                                .child()
                                .appendChild(document.createElement('span')),
                    ],
                    [
                        'изменение атрибутов родителя',
                        (t) => t.target().setAttribute('data-test', 'true'),
                    ],
                    [
                        'изменение атрибутов дочерних элементов',
                        (t) => t.child().setAttribute('data-test', 'true'),
                    ],
                    ['отсутствие изменений', () => {}],
                ];

                test.each(nonObservableChanges)('%s', async (_, mutateDom) => {
                    const t = await Test.setup(Options.descendantText());

                    mutateDom(t);

                    await t.awaitMutation();

                    t.expectBothNotToHaveBeenCalled();

                    t.teardown();
                });
            });
        });
    });
});
