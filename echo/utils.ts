import ts from 'typescript';

export const getFlags = (flagEnum: Record<string, number>, value: number) => {
  const flagList: string[] = [];
  for (const [flagName, flagValue] of Object.entries(flagEnum)) {
    const isFlag = (value & flagValue) === flagValue;
    if (isFlag)
      flagList.push(flagName)
  }
  return flagList;
}

export const getIdentifier = (name: ts.BindingName | ts.EntityName | ts.PropertyName): string => {
  switch (name.kind) {
    case ts.SyntaxKind.Identifier:
      const identifier = name as ts.Identifier;
      return identifier.text;
    case ts.SyntaxKind.QualifiedName:
      const qualifiedName = name as ts.QualifiedName;
      return [
        getIdentifier(qualifiedName.left),
        getIdentifier(qualifiedName.right),
      ].join('.');
    default:
      return `UnknownNameType(${ts.SyntaxKind[name.kind]})`
  }
}

let latestId = 1;

declare const opaqueType: unique symbol;
export type OpaqueID<T extends string> = number & { readonly [opaqueType]: T };


/**
 * Produces a (relatively within this runtime) unique incrementing value
 */
export const createId = <T extends string>(): OpaqueID<T> => {
  return latestId++ as OpaqueID<T>;
};
