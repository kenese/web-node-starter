export class Observable {
    subscriptions = new Set();

    constructor(subscriber) {
        this.subscription = subscriber;
    }

    subscribe(observer) {
        this.subscriptions.add(observer);

        this.subscription({
            next: (thing) => {
                if (this.subscriptions.has(observer)) {
                    observer.next(thing);
                }
            },
            complete: () => {
                observer.complete();
            },
            error: err => {
                if (this.subscriptions.has(observer)) {
                    observer.error(err);
                }
            }
        })

        return {
            unsubscribe: () => {
                this.subscriptions.delete(observer);
            }
        }
    }
}


// Simple counter example
const counter = new Observable(observer => {
    for (let i = 0; i < 10; i++) {
        observer.next(i);
    }
    observer.complete();
});
counter.subscribe({next: console.log, complete: () => console.log('completed 1')}); // 0, 1, 2, 3 ... 9
counter.subscribe({next: console.log, complete: () => console.log('completed 2')}); // 0, 1, 2, 3 ... 9


// 2. Error Handling
const errorObservable$ = new Observable(subscriber => {
    try {
        subscriber.next(1);
        throw new Error('Something went wrong!');
    } catch (err) {
        subscriber.error(err); // Deliver the error notification
    }
});

const observer = {
    next: (value) => console.log('Received value:', value),
    error: (err) => console.error('Observer caught an error:', err.message),
    complete: () => console.log('Completed:')
};

errorObservable$.subscribe(observer);


// 3. Unsubscribe example
const toggleButton = document.getElementById('toggle');
const clickButton = document.getElementById('click');
const clickEvents = new Observable((observer) => {
    const handler = (event) => {
        return observer.next(event);
    }
    clickButton.addEventListener('click', handler, true);

    return () => {
        clickButton.removeEventListener('click', handler, true);
    };
});
let clickEventsSubscription;

function toggle() {
    if (clickEventsSubscription) {
        clickEventsSubscription.unsubscribe();
        clickEventsSubscription = undefined;
        toggleButton.innerText = 'Listen';
        return;
    }
    clickEventsSubscription = clickEvents.subscribe({next: console.log});
    toggleButton.innerText = 'Stop Listening';
}

toggleButton.addEventListener('click', toggle);







// Promise

// executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;

class PromiseNew {
    constructor(executor) {
        this.executor = executor;
    }
    then (onFullFilled, onRejected) {
        const thing = this.executor(onFullFilled, onRejected);
        debugger;
        return this;
    }
}

const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
    constructor(executor) {
        this.state = PENDING;
        this.value = null;
        this.handlers = [];

        // The executor runs immediately and receives resolve/reject functions
        try {
            executor(this._resolve, this._reject);
        } catch (err) {
            this._reject(err);
        }
    }

    _resolve = (value) => {
        if (this.state !== PENDING) return;

        this.state = FULFILLED;
        this.value = value;
        this._executeHandlers();
    }

    _reject = (error) => {
        if (this.state !== PENDING) return;

        this.state = REJECTED;
        this.value = error;
        this._executeHandlers();
    }

    then(onFulfilled, onRejected) {
        this.handlers.push({ onFulfilled, onRejected });

        // If the promise is already settled, run handlers immediately
        if (this.state !== PENDING) {
            this._executeHandlers();
        }

        return this;
    }

    _executeHandlers() {
        if (this.state === PENDING) return;

        this.handlers.forEach((handler) => {
            debugger;
            if (this.state === FULFILLED) {
                if (typeof handler.onFulfilled === 'function') {
                    this.value = handler.onFulfilled(this.value);
                }
            } else {
                if (typeof handler.onRejected === 'function') {
                    this.value = handler.onRejected(this.value);
                }
            }
        });

        debugger;
        this.handlers = []; // Clear handlers after execution
    }

}


const myPromise = new MyPromise((resolve, reject) => {
    console.log('Promise setup');
    // reject('nah');
    try {
        // throw "nah";
        setTimeout(() => {
            console.log('Promise resolving');
            resolve("foo");
        }, 300);
    } catch (err) {
        reject(err);
    }
});

const thing = myPromise.then((value) => {
    console.log(value);
    throw value;
    // return value + ' baa';
}, (err) => {
    console.error(err);
    return 'twas an error';
}).then(value => {
    console.log(value);
}, console.error)
