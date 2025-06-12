export type Subscription = { cancel: () => void, id: number };
export type EventHandler<T> = (event: T) => unknown; 

export type EventEmitter<T> = {
  subscribe(handler: EventHandler<T>): Subscription,
  cancel(id: number): void,
  emit(event: T): void;
};

export const createEventEmitter = <T>(): EventEmitter<T> => {
  const handlers = new Map<number, EventHandler<T>>();
  let counter = 0;

  return {
    cancel(id) {
      handlers.delete(id);
    },
    subscribe(handler) {
      const id = counter++;
      handlers.set(id, handler);
      return {
        id,
        cancel() {
          handlers.delete(id);
        },
      }
    },
    emit(event) {
      for (const handler of handlers.values())
        try {
          handler(event);
        } finally {}
    },
  }
};
