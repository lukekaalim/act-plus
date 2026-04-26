import ts from 'typescript';
import { Type, TypeID } from './definitions/type';
import { Echo } from './definitions/module';

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


export const getChildTypeIds = (type: Type): TypeID[] => {
  switch (type.type) {
    case 'array':
      return [type.element]
    case 'keyword':
    case 'literal':
      return [];
    case 'object':
    case 'class':
    case 'interface':
      return type.properties.map(prop => prop.typeof)
    case 'function':
      return [
        ...type.parameters.map(p => p.typeof),
        type.returns
      ]
    case 'union':
      return type.unions;
    case 'intersection':
      return type.intersections;
    case 'reference':
    case 'namespace':
      return []
    case 'index-access':
      return [type.target, type.index];
    case 'tuple':
      return type.elements.map(el => el.typeof);
    case 'parser-error':
      return [];
    default:
      return (type as never);
  }
}

export const visitTypes = (echo: Echo, startingId: TypeID, visitor: (type: Type, depth: number) => void) => {
  const visit = (id: TypeID, depth: number = 0) => {
    visitor(echo.types[id], depth);
    for (const child of getChildTypeIds(echo.types[id])) {
      visit(child, depth + 1);
    }
  }

  visit(startingId);
};
