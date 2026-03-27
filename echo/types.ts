import ts from 'typescript';
import { EchoDeclaration, EchoType } from './reflections';
import { TypescriptContext } from './module';
import { createExternalTypeBuilder, EchoExternalReference, EchoExternalReferenceID } from './types/external';
import { createDeclarationBuilder } from './types/declarations';
import { createTypeInstanceBuilder } from './types/instances';

export type TypeBuildContext = {
  ts: TypescriptContext,

  declarationBySymbol: Map<ts.Symbol, EchoDeclaration.ID>,
  referenceBySymbol: Map<ts.Symbol, EchoExternalReferenceID>,
  typeByTypescript: Map<ts.Type, EchoType.ID>,

  exploredSymbols: Set<ts.Symbol>,

  packages: Map<string, ts.SourceFile>,
  unusedReferences: Map<EchoExternalReferenceID, EchoExternalReference>,

  declarations: Map<EchoDeclaration.ID, EchoDeclaration>,
  references: Map<EchoExternalReferenceID, EchoExternalReference>,
  types: Map<EchoType.ID, EchoType>,
}

export type PackageFileReferenceInfo = {
  /**
   * The name of the package (the `.name` field in the package.json)
   */
  package: string,
  /**
   * The absolute path to the directory that has the package.json
   */
  packagePath: string,
  /**
   * The relative path of the file to the package
   */
  relativePath: string,
}

export const createTypeBuilder2 = (context: TypeBuildContext) => {
  const external = createExternalTypeBuilder(context);
  const declarations = createDeclarationBuilder(context, external);
  const instances = createTypeInstanceBuilder(context, external, declarations);

  return {
    instances,
    declarations,
  }
}
