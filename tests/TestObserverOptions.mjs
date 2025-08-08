import Options from '/dist/ObserverOptions.mjs';
import { expect } from '@jest/globals';

class TestObserverOptions {
    _default;
    _expectOptions;

    constructor(expectOptions) {
        this._expectOptions = expectOptions;
        this._default = new Options();
    }

    static expect(expectOptions) {
        return new TestObserverOptions(expectOptions);
    }

    toEqual(options) {
        expect(this._expectOptions).toEqual(
            Object.assign(this._default, options),
        );
    }
}

export default TestObserverOptions;
