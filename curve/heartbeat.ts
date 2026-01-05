import {
  Component, createContext,
  Deps, h, useContext, useEffect
} from "@lukekaalim/act";

/**
 * The BeatController is responsible for collecting
 * all the subscribers, and sending out the "run"
 * event to them.
 * 
 * You would typically create the controller via
 * {@link Beat.createController} directly.
 */
export type BeatController<T> = {
  run(value: T): void,

  subscribe(callback: (value: T) => void): { stop(): void },

  setCurrentValueProvider(provider: () => T): void,

  getCurrentValue(): T
};


export type BeatProvider<T> = Component<{
  controller: BeatController<T>,
}>

/**
 * A "Beat" is a simple event-subscription interface for {@link @lukekaaalim/act}
 */
export type Beat<T> = {
  id: string,
  
  Provider: BeatProvider<T>,

  createController(): BeatController<T>,

  useCallback(callback: BeatCallback<T>, deps?: Deps): void,
  useCurrent(): T,

  global: BeatController<T>
};

/**
 * Creates a "Beat", an organizational object for coordinating
 * a callback (like an animation frame or a render).
 * 
 * @param id The unique ID that identifies this kind of Beat. Using
 * during performance debugging.
 * 
 * @returns 
 */
export const createBeat = <T>(id: string, initial_value: T): Beat<T> => {

  const Provider: BeatProvider<T> = ({ controller, children }) => {
    return h(context.Provider, { value: controller }, children);
  };


  const createController = (): BeatController<T> => {
    const subscribers = new Set<(value: T) => void>();

    let lastValue: T = initial_value;
    let current_value_provider: (() => T) = () => {
      return lastValue;
    };

    const controller: BeatController<T> = {
      run(value) {
        lastValue = value;
        for (const subscriber of subscribers) {
          try {
            subscriber(value)
          } catch {}
        }
      },
      setCurrentValueProvider(new_provider) {
        current_value_provider = new_provider
      },
      getCurrentValue() {
        return current_value_provider();
      },
      subscribe(callback) {
        const subscription = (value: T) => {
          callback(value);
        }

        subscribers.add(subscription);
        controller.run(controller.getCurrentValue())


        return {
          stop() {
            subscribers.delete(subscription);
          },
        }
      },
    }

    return controller;
  }

  const useCallback = (setupCallback: BeatCallback<T>, deps: unknown[] = []) => {
    const controller = useContext(context);

    useEffect(() => {
      try {
        if (!controller)
          return;

        let cleanup: null | (() => void) = null;
        let callback: null | ((value: T) => void) = null;

        const api: BeatCallbackAPI<T> = {
          setCallback(newCallback) {
            callback = newCallback;
          },
          setCleanup(newCleanup) {
            cleanup = newCleanup;
          },
        }

        setupCallback(api);
        const subscription = controller.subscribe((value) => {
          if (callback)
            callback(value);
        });

        
        return () => {
          subscription.stop();
          if (cleanup)
            cleanup();
        }
      } catch {}
    }, [controller, ...deps]);
  }
  const useCurrent = (): T => {
    const controller = useContext(context);

    if (!controller)
      throw new Error()

    return controller.getCurrentValue();
  }

  const global = createController();
  const context = createContext<BeatController<T> | null>(global);

  return {
    id,
    global,
    createController,
    useCurrent,
    useCallback,
    Provider
  }
};

export type BeatCallbackAPI<T> = {
  setCallback(callback: (value: T) => void): void,
  setCleanup(callback: () => void): void,
}

export type BeatCallback<T> = (api: BeatCallbackAPI<T>) => void;
