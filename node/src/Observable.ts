/** An Observable instance; can emit values at any time. Can be subscribed to by any number of observers */
interface Observable<T> {
    constructor(subscriber: (observer: Observer<T>) => UnsubscribeFn | undefined): Observable<T>;
    subscribe(observer: Observer<T>): Subscription<T>;
}
/** An Observer; Consumes values emitted by an observable */
interface Observer<T> {
    next(value: T): void;
    error(err: Error): void;
    complete(): void;
}
/** A Subscription instance describes the relationship between an observable and one of it's observers */
interface Subscription<T> {
    unsubscribe(): void;
}
/** A cleanup function that is called when unsubscribing to an Observable */
type UnsubscribeFn = () => void;