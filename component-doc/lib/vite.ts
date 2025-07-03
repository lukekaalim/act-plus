import { DynamicModule } from "./Module"

export type ViteGlobImport<T> = Record<string, () => DynamicModule<T>>;

export const createGlobImportRegistry = async <T>(importer: ViteGlobImport<T>) => {
  const map = new Map();

  return {
    get(key: string) {

    }
  }
};
