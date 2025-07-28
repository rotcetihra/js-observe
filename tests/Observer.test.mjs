import Observer from '../src/Observer.mjs';
import {
    describe,
    test,
    expect,
    jest,
    beforeEach,
    afterEach,
} from '@jest/globals';
import ObserverOptions from '../src/ObserverOptions.mjs';
import ObserverBuilder from '../src/ObserverBuilder.mjs';

let observer, native, observerCallback, nativeCallback;

function root() {
    return document.querySelector('#root');
}

function child() {
    return document.querySelector('#child');
}

function awaitMutation() {
    return new Promise((resolve) => queueMicrotask(resolve));
}

function expectBothToHaveBeenCalledTimes(times) {
    expect(observerCallback).toHaveBeenCalledTimes(times);
    expect(nativeCallback).toHaveBeenCalledTimes(times);
}

function expectBothToMatchObject(object) {
    expect(observerCallback).toHaveBeenCalled();
    expect(nativeCallback).toHaveBeenCalled();

    expect(observerCallback.mock.calls[0][0][0]).toMatchObject(object);
    expect(nativeCallback.mock.calls[0][0][0]).toMatchObject(object);
}

function expectBothNotToHaveBeenCalled() {
    expect(observerCallback).not.toHaveBeenCalled();
    expect(nativeCallback).not.toHaveBeenCalled();
}

function setup(options, target = root) {
    document.body.innerHTML =
        '<div id="root"><p id="child">child</p>root</div>';

    observerCallback = jest.fn();
    nativeCallback = jest.fn();

    observer = new Observer(observerCallback, options, target());
    native = new MutationObserver(nativeCallback);

    observer.observe();
    native.observe(target(), options);
}

function teardown() {
    observer.disconnect();
    native.disconnect();

    document.body.innerHTML = '';
}

describe('Observer', () => {
    describe('поведение соответствует MutationObserver', () => {
        describe('при использовании опции children', () => {
            beforeEach(() => setup(ObserverOptions.children()));
            afterEach(teardown);

            test('наблюдает за дочерними элементами', async () => {
                root().removeChild(child());

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'childList',
                    target: root(),
                });
            });

            test('наблюдает за изменением текста', async () => {
                // Удаление дочерних элементов и добавление текстового узла.
                root().textContent = 'text';

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'childList',
                    target: root(),
                });
            });

            const nonObservableChanges = [
                [
                    'потомками',
                    () => child().appendChild(document.createElement('span')),
                ],
                ['атрибутами', () => root().setAttribute('data-test', 'true')],
                [
                    'атрибутами потомков',
                    () => child().setAttribute('data-test', 'true'),
                ],
                [
                    'изменением текста в родителе',
                    () => {
                        expect(root().lastChild.data).toBe('root');
                        root().lastChild.data = 'updated';
                        expect(root().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    () => {
                        expect(child().firstChild.data).toBe('child');
                        child().firstChild.data = 'updated';
                        expect(child().firstChild.data).toBe('updated');
                    },
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                await awaitMutation(); // ничего не делаем

                expectBothNotToHaveBeenCalled();
            });
        });

        describe('при использовании опции descendants', () => {
            beforeEach(() => setup(ObserverOptions.descendants()));
            afterEach(teardown);

            test('наблюдает за удалением дочернего элемента', async () => {
                root().removeChild(child());

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'childList',
                    target: root(),
                });
            });

            test('наблюдает за изменением потомков', async () => {
                child().appendChild(document.createElement('span'));

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'childList',
                    target: child(),
                });
            });

            test('наблюдает за изменением текста внутри потомка', async () => {
                child().textContent = 'обновлённый текст';

                await awaitMutation();

                // Здесь будет characterData только если characterData: true
                // В текущем случае, childList:true + subtree:true
                // => текстовое изменение будет сопровождаться заменой текстового узла — childList

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'childList',
                    target: child(),
                });
            });

            const nonObservableChanges = [
                [
                    'атрибутами родителя',
                    () => root().setAttribute('data-test', 'true'),
                ],
                [
                    'атрибутами потомка',
                    () => child().setAttribute('data-test', 'true'),
                ],
                [
                    'изменением текста в родителе',
                    () => {
                        expect(root().lastChild.data).toBe('root');
                        root().lastChild.data = 'updated';
                        expect(root().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    () => {
                        expect(child().firstChild.data).toBe('child');
                        child().firstChild.data = 'updated';
                        expect(child().firstChild.data).toBe('updated');
                    },
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                await awaitMutation(); // ничего не делаем

                expectBothNotToHaveBeenCalled();
            });
        });

        describe('при использовании опции attributes', () => {
            beforeEach(() => setup(ObserverOptions.attributes()));
            afterEach(teardown);

            test('наблюдает за изменением атрибута родителя', async () => {
                root().setAttribute('data-test', 'true');

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'attributes',
                    target: root(),
                    attributeName: 'data-test',
                });
            });

            const nonObservableChanges = [
                [
                    'изменением дочернего элемента',
                    () => root().removeChild(child()),
                ],
                [
                    'изменением потомка',
                    () => child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    () => {
                        expect(root().lastChild.data).toBe('root');
                        root().lastChild.data = 'updated';
                        expect(root().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    () => {
                        expect(child().firstChild.data).toBe('child');
                        child().firstChild.data = 'updated';
                        expect(child().firstChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением атрибутов потомка',
                    () => child().setAttribute('data-test', 'true'),
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                await awaitMutation(); // ничего не делаем

                expectBothNotToHaveBeenCalled();
            });
        });

        describe('при использовании опции attributes с параметром filter', () => {
            beforeEach(() => setup(ObserverOptions.attributes(['data-test'])));
            afterEach(teardown);

            test('наблюдает за изменением конкретного атрибута родителя', async () => {
                root().setAttribute('data-test', 'true');

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'attributes',
                    target: root(),
                    attributeName: 'data-test',
                });
            });

            const nonObservableChanges = [
                [
                    'изменением дочернего элемента',
                    () => root().removeChild(child()),
                ],
                [
                    'изменением потомка',
                    () => child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    () => {
                        expect(root().lastChild.data).toBe('root');
                        root().lastChild.data = 'updated';
                        expect(root().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    () => {
                        expect(child().firstChild.data).toBe('child');
                        child().firstChild.data = 'updated';
                        expect(child().firstChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением других атрибутов родителя',
                    () => child().setAttribute('data-value', 'true'),
                ],
                [
                    'изменением атрибутов потомка',
                    () => child().setAttribute('data-test', 'true'),
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                await awaitMutation(); // ничего не делаем

                expectBothNotToHaveBeenCalled();
            });
        });

        describe('при использовании опции descendantAttributes', () => {
            beforeEach(() => setup(ObserverOptions.descendantAttributes()));
            afterEach(teardown);

            test('наблюдает за изменением атрибута родителя', async () => {
                root().setAttribute('data-test', 'true');

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'attributes',
                    target: root(),
                    attributeName: 'data-test',
                });
            });

            test('наблюдает за изменением атрибута потомка', async () => {
                child().setAttribute('data-test', 'true');

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'attributes',
                    target: child(),
                    attributeName: 'data-test',
                });
            });

            const nonObservableChanges = [
                [
                    'изменением дочернего элемента',
                    () => root().removeChild(child()),
                ],
                [
                    'изменением потомка',
                    () => child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    () => {
                        expect(root().lastChild.data).toBe('root');
                        root().lastChild.data = 'updated';
                        expect(root().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    () => {
                        expect(child().firstChild.data).toBe('child');
                        child().firstChild.data = 'updated';
                        expect(child().firstChild.data).toBe('updated');
                    },
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                await awaitMutation(); // ничего не делаем

                expectBothNotToHaveBeenCalled();
            });
        });

        describe('при использовании опции descendantAttributes с параметром filter', () => {
            beforeEach(() =>
                setup(ObserverOptions.descendantAttributes(['data-test'])),
            );
            afterEach(teardown);

            test('наблюдает за изменением конкретного атрибута родителя', async () => {
                root().setAttribute('data-test', 'true');

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'attributes',
                    target: root(),
                    attributeName: 'data-test',
                });
            });

            test('наблюдает за изменением конкретного атрибута потомка', async () => {
                child().setAttribute('data-test', 'true');

                await awaitMutation();

                expectBothToHaveBeenCalledTimes(1);
                expectBothToMatchObject({
                    type: 'attributes',
                    target: child(),
                    attributeName: 'data-test',
                });
            });

            const nonObservableChanges = [
                [
                    'изменением дочернего элемента',
                    () => root().removeChild(child()),
                ],
                [
                    'изменением потомка',
                    () => child().appendChild(document.createElement('span')),
                ],
                [
                    'изменением текста в родителе',
                    () => {
                        expect(root().lastChild.data).toBe('root');
                        root().lastChild.data = 'updated';
                        expect(root().lastChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением текста в потомке',
                    () => {
                        expect(child().firstChild.data).toBe('child');
                        child().firstChild.data = 'updated';
                        expect(child().firstChild.data).toBe('updated');
                    },
                ],
                [
                    'изменением других атрибутов родителя',
                    () => child().setAttribute('data-value', 'true'),
                ],
                [
                    'изменением других атрибутов потомка',
                    () => child().setAttribute('data-value', 'true'),
                ],
            ];

            test.each(nonObservableChanges)(
                'не наблюдает за %s',
                async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                },
            );

            test('не реагирует на отсутствие изменений', async () => {
                await awaitMutation(); // ничего не делаем

                expectBothNotToHaveBeenCalled();
            });
        });

        describe('при использовании опции text', () => {
            describe('реагирует на', () => {
                beforeEach(() =>
                    setup(ObserverOptions.text(), () => root().lastChild),
                );
                afterEach(teardown);

                test('изменение текстового узла только при прямом его наблюдении', async () => {
                    root().lastChild.data = 'updated';

                    await awaitMutation();

                    expectBothToHaveBeenCalledTimes(1);
                    expectBothToMatchObject({
                        type: 'characterData',
                        target: root().lastChild,
                    });
                });
            });

            describe('не реагирует на', () => {
                beforeEach(() => setup(ObserverOptions.text()));
                afterEach(teardown);

                test('изменение текста родителя с помощью textContent', async () => {
                    // Удаление дочерних элементов и добавление текстового узла определяется как мутация типа childList.
                    root().textContent = 'text';

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                });

                test('изменение текста родителя с помощью изменения поля data текстового узла', async () => {
                    root().lastChild.data = 'text';

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                });

                const nonObservableChanges = [
                    [
                        'изменение дочерних элементов',
                        () => root().removeChild(child()),
                    ],
                    [
                        'изменение потомков',
                        () =>
                            child().appendChild(document.createElement('span')),
                    ],
                    [
                        'изменение атрибутов родителя',
                        () => root().setAttribute('data-test', 'true'),
                    ],
                    [
                        'изменение атрибутов дочерних элементов',
                        () => child().setAttribute('data-test', 'true'),
                    ],
                    [
                        'изменение текста в дочернем элементе',
                        () => {
                            expect(child().firstChild.data).toBe('child');
                            child().firstChild.data = 'updated';
                            expect(child().firstChild.data).toBe('updated');
                        },
                    ],
                    ['отсутствие изменений', () => {}],
                ];

                test.each(nonObservableChanges)('%s', async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                });
            });
        });

        describe('при использовании опции descendantText', () => {
            describe('реагирует на', () => {
                test('изменение текстового узла при прямом его наблюдении', async () => {
                    setup(
                        ObserverOptions.descendantText(),
                        () => root().lastChild,
                    );

                    root().lastChild.data = 'updated';

                    await awaitMutation();

                    expectBothToHaveBeenCalledTimes(1);
                    expectBothToMatchObject({
                        type: 'characterData',
                        target: root().lastChild,
                    });

                    teardown();
                });

                beforeEach(() => setup(ObserverOptions.descendantText()));
                afterEach(teardown);

                test('изменение текста родителя с помощью изменения поля data текстового узла', async () => {
                    root().lastChild.data = 'text';

                    await awaitMutation();

                    expectBothToHaveBeenCalledTimes(1);
                    expectBothToMatchObject({
                        type: 'characterData',
                        target: root().lastChild,
                    });
                });
            });

            describe('не реагирует на', () => {
                beforeEach(() => setup(ObserverOptions.descendantText()));
                afterEach(teardown);

                test('изменение текста родителя с помощью textContent', async () => {
                    // Удаление дочерних элементов и добавление текстового узла определяется как мутация типа childList.
                    root().textContent = 'text';

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                });

                const nonObservableChanges = [
                    [
                        'изменение дочерних элементов',
                        () => root().removeChild(child()),
                    ],
                    [
                        'изменение потомков',
                        () =>
                            child().appendChild(document.createElement('span')),
                    ],
                    [
                        'изменение атрибутов родителя',
                        () => root().setAttribute('data-test', 'true'),
                    ],
                    [
                        'изменение атрибутов дочерних элементов',
                        () => child().setAttribute('data-test', 'true'),
                    ],
                    ['отсутствие изменений', () => {}],
                ];

                test.each(nonObservableChanges)('%s', async (_, mutateDom) => {
                    mutateDom();

                    await awaitMutation();

                    expectBothNotToHaveBeenCalled();
                });
            });
        });
    });

    describe('отсутствует в MutationObserver', () => {
        test('метод new(), возвращающий экземпляр ObserverBuilder', () => {
            expect(Observer.new()).toBeInstanceOf(ObserverBuilder);
        });
    });
});
