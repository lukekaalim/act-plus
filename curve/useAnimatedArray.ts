import { useMemo, useRef } from '@lukekaalim/act';

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

export type TransitionHookConfig<Value, Key, State> = {
  calculateKey(value: Value): Key,

  createState(value: Value, index: number): State,

  updateState(prevState: State, next: Value): State,
  moveState(prevState: State, nextIndex: number, next: Value): State,

  removeState(prevState: State): State,

  stateFilter(state: State): boolean,
}

export const createTransitionHook = <Value, Key, State>(
  config: TransitionHookConfig<Value, Key, State>,
) => {
  const useTransition = (
    nextValues: ReadonlyArray<Value>,
    initialValues: ReadonlyArray<[Key, State]> = [],
  ): State[] => {
    const entries = useRef(new Map<Key, State>(initialValues)).current;
    const currentKeysRef = useRef<ReadonlyArray<Key>>(initialValues.map(([key]) => key));
    const removedStates = useRef<State[]>([]);

    const nextKeys = useMemo(() => {
      return nextValues.map(config.calculateKey);
    }, [nextValues])
    
    useMemo(() => {
      const diff = calculateDiff(currentKeysRef.current, nextKeys);
      for (const newValueIndex of diff.newValueIndicies) {
        const key = nextKeys[newValueIndex];
        const value = nextValues[newValueIndex];
        entries.set(key, config.createState(value, newValueIndex));
      }
      for (const valueIndex of diff.persistedValueIndicies) {
        const key = nextKeys[valueIndex];
        const value = nextValues[valueIndex];
        const prevState = entries.get(key) as State;
        entries.set(key, config.updateState(prevState, value));
      }
      for (const { nextIndex } of diff.movedValueIndices) {
        const key = nextKeys[nextIndex];
        const value = nextValues[nextIndex];
        const prevState = entries.get(key) as State;
        entries.set(key, config.moveState(prevState, nextIndex, value))
      }
      for (const removedIndex of diff.removedValueIndicies) {
        const key = currentKeysRef.current[removedIndex];
        const prevState = entries.get(key) as State;
        entries.delete(key);
        removedStates.current.push(config.removeState(prevState));
      }
      currentKeysRef.current = nextKeys;
      removedStates.current = removedStates.current.filter(config.stateFilter);
    }, [nextKeys, nextValues]);

    return useMemo(() => {
      return [
        ...nextKeys.map(key => entries.get(key)) as State[],
        ...removedStates.current,
      ];
    }, [nextKeys])
  };

  return useTransition;
};