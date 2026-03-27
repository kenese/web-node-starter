// /** An Observable instance; can emit values at any time. Can be subscribed to by any number of observers */
// interface Observable<T> {
//   constructor(subscriber: (observer: Observer<T>) => UnsubscribeFn | undefined): Observable<T>;
//   subscribe(observer: Observer<T>): Subscription<T>;
// }
// /** An Observer; Consumes values emitted by an observable */
// interface Observer<T> {
//   next(value: T): void;
//   error(err: Error): void;
//   complete(): void;
// }
// /** A Subscription instance describes the relationship between an observable and one of it's observers */
// interface Subscription<T> {
//   unsubscribe(): void;
// }
// /** A cleanup function that is called when unsubscribing to an Observable */
// type UnsubscribeFn = () => void;


// Add this to the top of index.js
const { Observable } = rxjs;






class Observable1 {
  callback
  observers = new Set();

  constructor(callback) {
    this.callback = callback;
  }

  subscribe (observer) {
    this.observers.add(observer);
    this.callback({
      next: (...props) => {
        this.observers.values().forEach(observer => {
          observer.next(...props);
        })
    }})

    return () => {
      this.observers.delete(observer);
    }
  }
}

// Simple counter example
const counter = new Observable(observer => {
  console.log(observer);
  for (let i = 0; i < 10; i++) {
    observer.next(i);
  }
});
counter.subscribe({ next: console.log }); // 0, 1, 2, 3 ... 9
counter.subscribe({ next: console.log }); // 0, 1, 2, 3 ... 9

//
//
// // Unsubscribe example
// const toggleButton = document.getElementById('toggle');
// const clickButton = document.getElementById('click');
// const clickEvents = new Observable((observer) => {
//   const handler = (event) => {
//     return observer.next(event);
//   }
//   clickButton.addEventListener('click', handler, true);
//   return () => {
//     clickButton.removeEventListener('click', handler, true);
//   };
// });
// let clickEventsSubscription;
// function toggle() {
//   if (clickEventsSubscription) {
//     clickEventsSubscription.unsubscribe();
//     clickEventsSubscription = undefined;
//     toggleButton.innerText = 'Listen';
//     return;
//   }
//   clickEventsSubscription = clickEvents.subscribe({ next: console.log });
//   toggleButton.innerText = 'Stop Listening';
// }
// toggleButton.addEventListener('click', toggle);
//
//
//
