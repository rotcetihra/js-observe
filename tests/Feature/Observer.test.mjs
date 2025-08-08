import { describe, test, expect, jest } from '@jest/globals';
import fc from 'fast-check';
import Observer from '/dist/Observer.mjs';
import Options from '/dist/ObserverOptions.mjs';
import Builder from '/dist/ObserverBuilder.mjs';
import Test from '/tests/TestObserver.mjs';

describe('Observer', () => {
    describe('поведение соответствует MutationObserver', () => {
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
                        target: t.target(),
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

    describe('отсутствует в MutationObserver', () => {
        test('метод new(), возвращающий экземпляр ObserverBuilder', () => {
            expect(Observer.new()).toBeInstanceOf(Builder);
        });

        describe('метод autoDisconnect()', () => {
            test('отключает наблюдение через заданное время и не реагирует на мутации после отключения', async () => {
                const t = await Test.setupObserver(Options.children());

                const disconnectSpy = jest.spyOn(t.observer, 'disconnect');
                t.observer.autoDisconnect(30);

                // Мутация до отключения — должна быть замечена
                t.removeChild();
                await t.awaitMutation();
                t.expectToHaveBeenCalledTimes(1);

                // Мутация после отключения — не должна быть замечена
                await new Promise((r) => setTimeout(r, 40));

                t.target().appendChild(document.createElement('span'));
                await t.awaitMutation();
                t.expectToHaveBeenCalledTimes(1);

                expect(disconnectSpy).toHaveBeenCalled();
                disconnectSpy.mockRestore();

                t.teardownObserver();
            });

            test('выбрасывает ошибку при ms <= 0 с ожидаемым текстом', async () => {
                const t = await Test.setupObserver(Options.children());

                expect(() => t.observer.autoDisconnect(0)).toThrow(
                    'Время до автоматического отключения не может быть меньше или равно нулю.',
                );
                expect(() => t.observer.autoDisconnect(-100)).toThrow(
                    'Время до автоматического отключения не может быть меньше или равно нулю.',
                );

                t.teardownObserver();
            });

            test('можно вызвать повторно без ошибок, отключение происходит только один раз, промис резолвится один раз', async () => {
                const t = await Test.setupObserver(Options.children());

                const disconnectSpy = jest.spyOn(t.observer, 'disconnect');
                const p1 = t.observer.autoDisconnect(20);
                const p2 = t.observer.autoDisconnect(10);

                expect(p1).toBeInstanceOf(Promise);
                expect(p2).toBeInstanceOf(Promise);

                await Promise.all([p1, p2]);
                await new Promise((r) => setTimeout(r, 10));

                expect(disconnectSpy).toHaveBeenCalledTimes(1);
                disconnectSpy.mockRestore();

                t.teardownObserver();
            });

            test('работает с разными значениями времени', async () => {
                const t = await Test.setupObserver(Options.children());

                const disconnectSpy = jest.spyOn(t.observer, 'disconnect');
                await t.observer.autoDisconnect(1);
                await new Promise((r) => setTimeout(r, 10));
                expect(disconnectSpy).toHaveBeenCalled();
                disconnectSpy.mockRestore();

                t.teardownObserver();
            });

            test('onDisconnect вызывается после отключения', async () => {
                const t = await Test.setupObserver(Options.children());
                const onDisconnect = jest.fn();

                await t.observer.autoDisconnect(5, onDisconnect);
                await new Promise((r) => setTimeout(r, 10));

                expect(onDisconnect).toHaveBeenCalledTimes(1);

                t.teardownObserver();
            });

            test('после ручного disconnect таймер не вызывает повторное отключение, промис autoDisconnect резолвится', async () => {
                const t = await Test.setupObserver(Options.children());

                const disconnectSpy = jest.spyOn(t.observer, 'disconnect');
                const p = t.observer.autoDisconnect(20);
                t.observer.disconnect(); // вручную

                await p;
                await new Promise((r) => setTimeout(r, 10));
                // disconnect должен быть вызван только один раз
                expect(disconnectSpy).toHaveBeenCalledTimes(1);
                disconnectSpy.mockRestore();

                t.teardownObserver();
            });

            test('после disconnect можно снова вызвать autoDisconnect', async () => {
                const t = await Test.setupObserver(Options.children());
                const disconnectSpy = jest.spyOn(t.observer, 'disconnect');

                await t.observer.autoDisconnect(5);

                await new Promise((r) => setTimeout(r, 10));
                expect(disconnectSpy).toHaveBeenCalledTimes(1);

                t.observer.observe();
                await t.observer.autoDisconnect(5); // после отключения можно снова

                await new Promise((r) => setTimeout(r, 10));
                expect(disconnectSpy).toHaveBeenCalledTimes(2);
                disconnectSpy.mockRestore();

                t.teardownObserver();
            });

            test('autoDisconnect не мешает повторному observe/disconnect', async () => {
                const t = await Test.setupObserver(Options.children());

                await t.observer.autoDisconnect(5);

                await new Promise((r) => setTimeout(r, 10));
                expect(() => t.observer.observe()).not.toThrow();
                expect(() => t.observer.disconnect()).not.toThrow();

                t.teardownObserver();
            });

            test('autoDisconnect не вызывает disconnect, если наблюдение не запущено, промис резолвится сразу', async () => {
                const callback = jest.fn();
                const target = document.createElement('div');
                const observer = new Observer(
                    callback,
                    { childList: true },
                    target,
                );
                const disconnectSpy = jest.spyOn(observer, 'disconnect');

                const p = observer.autoDisconnect(5);

                await p;
                await new Promise((r) => setTimeout(r, 10));
                // disconnect не должен быть вызван, так как observe не запускался
                expect(disconnectSpy).not.toHaveBeenCalled();
                disconnectSpy.mockRestore();
            });

            test('cancelAutoDisconnect отменяет таймер и промис autoDisconnect резолвится', async () => {
                const t = await Test.setupObserver(Options.children());

                const disconnectSpy = jest.spyOn(t.observer, 'disconnect');
                const onDisconnect = jest.fn();

                const p = t.observer.autoDisconnect(50, onDisconnect);

                // Отменяем до истечения времени
                t.observer.cancelAutoDisconnect();

                // Ждём чуть больше времени, чтобы убедиться, что disconnect не был вызван автоматически
                await new Promise((r) => setTimeout(r, 60));
                expect(disconnectSpy).not.toHaveBeenCalled();
                expect(onDisconnect).not.toHaveBeenCalled();

                // Промис должен быть резолвлен
                await expect(p).resolves.toBeUndefined();

                t.teardownObserver();
            });

            test('cancelAutoDisconnect можно вызывать несколько раз без ошибок', async () => {
                const t = await Test.setupObserver(Options.children());

                t.observer.autoDisconnect(10);
                t.observer.cancelAutoDisconnect();
                expect(() => t.observer.cancelAutoDisconnect()).not.toThrow();
                expect(() => t.observer.cancelAutoDisconnect()).not.toThrow();

                t.teardownObserver();
            });

            test('после cancelAutoDisconnect можно снова вызвать autoDisconnect', async () => {
                const t = await Test.setupObserver(Options.children());
                const disconnectSpy = jest.spyOn(t.observer, 'disconnect');

                t.observer.autoDisconnect(10);
                t.observer.cancelAutoDisconnect();

                await t.observer.autoDisconnect(5);
                await new Promise((r) => setTimeout(r, 10));
                expect(disconnectSpy).toHaveBeenCalledTimes(1);

                disconnectSpy.mockRestore();
                t.teardownObserver();
            });
        });
    });

    describe('дополнительные edge-cases и устойчивость', () => {
        test('повторный вызов observe/disconnect не вызывает ошибок', async () => {
            const t = await Test.setupObserver(Options.children());

            expect(() => t.observer.observe()).not.toThrow();
            expect(() => t.observer.observe()).not.toThrow();
            expect(() => t.observer.disconnect()).not.toThrow();
            expect(() => t.observer.disconnect()).not.toThrow();

            t.teardownObserver();
        });

        test('observe(target, options) переопределяет значения из конструктора', async () => {
            const target1 = document.createElement('div');
            const target2 = document.createElement('div');

            document.body.appendChild(target1);
            document.body.appendChild(target2);

            const callback = jest.fn();
            const observer = new Observer(
                callback,
                { childList: true },
                target1,
            );

            observer.observe(target2, { attributes: true });
            target2.setAttribute('data-x', '1');

            await Promise.resolve();

            expect(callback).toHaveBeenCalled();

            observer.disconnect();
        });

        test('takeRecords возвращает массив MutationRecord', async () => {
            const t = await Test.setupObserver(Options.children());

            t.target().appendChild(document.createElement('span'));

            const records = t.observer.takeRecords();

            expect(Array.isArray(records)).toBe(true);
            expect(records[0]).toHaveProperty('type');

            t.teardownObserver();
        });

        test('работает с Document и DocumentFragment как target', () => {
            const callback = jest.fn();
            const docFrag = document.createDocumentFragment();
            const observer1 = new Observer(
                callback,
                { childList: true },
                docFrag,
            );

            expect(() => observer1.observe()).not.toThrow();

            observer1.disconnect();

            const observer2 = new Observer(
                callback,
                { childList: true },
                document,
            );

            expect(() => observer2.observe()).not.toThrow();

            observer2.disconnect();
        });

        test('выбрасывает ошибку, если не указан target', () => {
            const callback = jest.fn();
            const observer = new Observer(callback, { childList: true });

            expect(() => observer.observe()).toThrow('Не указан DOM-узел');
        });

        test('выбрасывает ошибку, если не указаны опции', () => {
            const callback = jest.fn();
            const target = document.createElement('div');
            const observer = new Observer(callback, undefined, target);

            expect(() => observer.observe()).toThrow(
                'Не заданы параметры наблюдения',
            );
        });

        test('выбрасывает ошибку, если опции невалидны (MutationObserver сам выбросит)', () => {
            const callback = jest.fn();
            const target = document.createElement('div');
            const observer = new Observer(callback, {}, target);

            expect(() => observer.observe()).toThrow(
                "The options object must set at least one of 'attributes', 'characterData', or 'childList' to true.",
            );
        });
    });

    describe('отслеживание состояния isObserving', () => {
        test('isObserving: false после создания, true после observe, false после disconnect', async () => {
            const t = await Test.setupObserver(Options.children());

            // После создания и до observe — false
            const observer = new Observer(
                () => {},
                Options.children(),
                t.target(),
            );
            expect(observer.isObserving).toBe(false);

            observer.observe();
            expect(observer.isObserving).toBe(true);

            observer.disconnect();
            expect(observer.isObserving).toBe(false);

            t.teardownObserver();
        });

        test('isObserving не меняется при повторном observe/disconnect', async () => {
            const t = await Test.setupObserver(Options.children());

            t.observer.observe();
            expect(t.observer.isObserving).toBe(true);

            t.observer.observe();
            expect(t.observer.isObserving).toBe(true);

            t.observer.disconnect();
            expect(t.observer.isObserving).toBe(false);

            t.observer.disconnect();
            expect(t.observer.isObserving).toBe(false);

            t.teardownObserver();
        });

        test('isObserving сбрасывается после autoDisconnect', async () => {
            const t = await Test.setupObserver(Options.children());

            expect(t.observer.isObserving).toBe(true);

            await t.observer.autoDisconnect(5);
            await new Promise((r) => setTimeout(r, 10));

            expect(t.observer.isObserving).toBe(false);

            t.teardownObserver();
        });

        test('isObserving сбрасывается после cancelAutoDisconnect + disconnect', async () => {
            const t = await Test.setupObserver(Options.children());

            expect(t.observer.isObserving).toBe(true);

            t.observer.autoDisconnect(50);
            t.observer.cancelAutoDisconnect();
            t.observer.disconnect();

            expect(t.observer.isObserving).toBe(false);

            t.teardownObserver();
        });

        test('isObserving корректно отражает состояние', () => {
            fc.assert(
                fc.property(fc.boolean(), (startObserved) => {
                    const target = document.createElement('div');
                    const observer = new Observer(
                        () => {},
                        Options.children(),
                        target,
                    );
                    if (startObserved) observer.observe();
                    else observer.disconnect();
                    observer.observe();
                    expect(observer.isObserving).toBe(true);
                    observer.disconnect();
                    expect(observer.isObserving).toBe(false);
                }),
            );
        });
    });

    describe('property-based', () => {
        test('isObserving корректно отражает состояние при случайных последовательностях observe/disconnect', () => {
            fc.assert(
                fc.property(
                    fc.array(fc.constantFrom('observe', 'disconnect'), {
                        minLength: 1,
                        maxLength: 10,
                    }),
                    (actions) => {
                        const target = document.createElement('div');
                        const observer = new Observer(
                            () => {},
                            { childList: true },
                            target,
                        );
                        let expected = false;
                        for (const act of actions) {
                            if (act === 'observe') {
                                observer.observe();
                                expected = true;
                            } else {
                                observer.disconnect();
                                expected = false;
                            }
                            expect(observer.isObserving).toBe(expected);
                        }
                    },
                ),
            );
        });

        test('observe(target, options) всегда запускает наблюдение и isObserving становится true', () => {
            fc.assert(
                fc.property(
                    fc.boolean(),
                    fc.boolean(),
                    (withTarget, withOptions) => {
                        const target = document.createElement('div');
                        const options = { childList: true };
                        const observer = new Observer(
                            () => {},
                            withOptions ? options : undefined,
                            withTarget ? target : undefined,
                        );
                        if (withTarget && withOptions) {
                            observer.observe();
                            expect(observer.isObserving).toBe(true);
                        } else if (withTarget) {
                            observer._options = options;
                            observer.observe();
                            expect(observer.isObserving).toBe(true);
                        } else if (withOptions) {
                            observer._target = target;
                            observer.observe();
                            expect(observer.isObserving).toBe(true);
                        } else {
                            // Ожидается ошибка
                            expect(() => observer.observe()).toThrow();
                        }
                    },
                ),
            );
        });

        test('последовательные observe/disconnect не вызывают ошибок', () => {
            fc.assert(
                fc.property(fc.integer({ min: 1, max: 5 }), (n) => {
                    const target = document.createElement('div');
                    const observer = new Observer(
                        () => {},
                        { childList: true },
                        target,
                    );
                    for (let i = 0; i < n; ++i) {
                        expect(() => observer.observe()).not.toThrow();
                        expect(observer.isObserving).toBe(true);
                        expect(() => observer.disconnect()).not.toThrow();
                        expect(observer.isObserving).toBe(false);
                    }
                }),
            );
        });
    });
});
