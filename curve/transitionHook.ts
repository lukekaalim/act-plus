import { useMemo, useRef } from '@lukekaalim/act';

export type TransitionType<Key = unknown, Value = unknown, ValueState = unknown> = {
  Key: Key,
  Value: Value,
  ValueState: ValueState
}

/**
 * Determine what "changed" between two arrays.
 * 
 * Assumed that:
 *  - values are directly (`===`) comparable
 *  - unique (only one instance of each value can exist in each array
 */
const calculateDiff = <T>(prevs: ReadonlyArray<T>, nexts: ReadonlyArray<T>) => {
  const newValueIndicies = [];
  const removedValueIndicies = [];
  const movedValueIndices = [];
  const persistedValueIndicies = [];

  for (let nextIndex = 0; nextIndex < nexts.length; nextIndex++) {
    const prevIndex = prevs.indexOf(nexts[nextIndex]);
    if (prevIndex === -1)
      newValueIndicies.push(nextIndex);
    else if (prevIndex !== nextIndex)
      movedValueIndices.push({ prevIndex, nextIndex });
    else
      persistedValueIndicies.push(prevIndex);
  }
  for (let prevIndex = 0; prevIndex < prevs.length; prevIndex++) {
    const nextIndex = nexts.indexOf(prevs[prevIndex]);
    if (nextIndex === -1)
      removedValueIndicies.push(prevIndex);
  }

  return {
    newValueIndicies,
    removedValueIndicies,
    movedValueIndices,
    persistedValueIndicies,
  }
}

export type TransitionHookConfig<Value, Key, ValueState> = {
  calculateKey(value: Value): Key,

  createState(value: Value, index: number): ValueState,

  updateState(prevState: ValueState, next: Value): ValueState,
  moveState(prevState: ValueState, nextIndex: number, next: Value): ValueState,

  removeState(prevState: ValueState): ValueState,

  stateFilter(state: ValueState): boolean,
}

export type TransitionHook<Value, Key, State> = (nextValues: ReadonlyArray<Value>, initialValues?: ReadonlyArray<[Key, State]>) => State[]

export type TransitionAPIState<T extends TransitionType> = {
  entries: Map<T["Key"], T["ValueState"]>,

  currentValues: T["Value"][],
  currentKeys: T["Key"][],

  removedStates: T["ValueState"][],
}

export type TransitionAPI<T extends TransitionType> = {
  start(initialValues?: [T["Value"], T["ValueState"]][]): TransitionAPIState<T>,
  get(state: TransitionAPIState<T>): T["ValueState"][],
  update(state: TransitionAPIState<T>, newValues: T["Value"][]): void
}

export const createTransitionAPI = <T extends TransitionType>(
  config: TransitionHookConfig<T["Value"], T["Key"], T["ValueState"]>
): TransitionAPI<T> => {
  return {
    start(initialValues = []) {
      const currentKeys = initialValues.map(([value, _]) => config.calculateKey(value));
      return {
        currentKeys,
        currentValues: initialValues,
        entries: new Map(initialValues),
        removedStates: [],
      }
    },
    get(state) {
      return [
        ...state.currentKeys.map(key => state.entries.get(key)) as T["ValueState"][],
        ...state.removedStates,
      ];
    },
    update(state, nextValues) {
      const nextKeys = nextValues.map(config.calculateKey);
      const diff = calculateDiff(state.currentKeys, nextKeys);
      for (const newValueIndex of diff.newValueIndicies) {
        const key = nextKeys[newValueIndex];
        const value = nextValues[newValueIndex];
        state.entries.set(key, config.createState(value, newValueIndex));
      }
      for (const valueIndex of diff.persistedValueIndicies) {
        const key = nextKeys[valueIndex];
        const value = nextValues[valueIndex];
        const prevState = state.entries.get(key) as T["ValueState"];
        state.entries.set(key, config.updateState(prevState, value));
      }
      for (const { nextIndex } of diff.movedValueIndices) {
        const key = nextKeys[nextIndex];
        const value = nextValues[nextIndex];
        const prevState = state.entries.get(key) as T["ValueState"];
        state.entries.set(key, config.moveState(prevState, nextIndex, value))
      }
      for (const removedIndex of diff.removedValueIndicies) {
        const key = state.currentKeys[removedIndex];
        const prevState = state.entries.get(key) as T["ValueState"];
        state.entries.delete(key);
        state.removedStates.push(config.removeState(prevState));
      }
      state.currentKeys = nextKeys;
      state.currentValues = nextValues;
      state.removedStates = state.removedStates.filter(config.stateFilter);
    },
  }
}
