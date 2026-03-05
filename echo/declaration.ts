import ts from "typescript";
import { ModuleBuildContext } from "./module";
import { EchoDeclaration, EchoType } from "./reflections";
import { createId } from "./utils";
import { createTypeBuilder2, PackageFileReferenceInfo } from "./types";
import { buildExternalReferences, getModuleSource } from "./external";

export type TSExportableDeclaration =
  | ts.ExportDeclaration
  | ts.VariableDeclaration
  | ts.TypeAliasDeclaration
  | ts.ClassDeclaration
  | ts.ModuleDeclaration
  | ts.InterfaceDeclaration
  | ts.EnumDeclaration
  | ts.FunctionDeclaration

export const isStatementExported = (statement: ts.TypeAliasDeclaration | ts.VariableStatement) => {
  if (!statement.modifiers)
    return;

  return statement.modifiers.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
}

/**
 * Traverse through a sourceFile, looking for every declaration that includes
 * an `exports` modifier.
 * 
 * @param sourceFile 
 * @param program 
 * @param host 
 * @returns 
 */
export const findTSExportableDeclarations = (
  statements: ts.Statement[] | ts.NodeArray<ts.Statement>,
  filename: string,
  context: ModuleBuildContext,
): TSExportableDeclaration[] => {
  const { program, host } = context;
  return statements.map((statement): TSExportableDeclaration | TSExportableDeclaration[] => {
    switch (statement.kind) {
      case ts.SyntaxKind.ExportDeclaration:
        const exportDeclaration = statement as ts.ExportDeclaration;
        const specifier = exportDeclaration.moduleSpecifier as ts.StringLiteral;
        
        const resolvedName = ts.resolveModuleName(
          specifier.text,
          filename.startsWith('/')
            ? filename
            : program.getCurrentDirectory() + '/' + filename,
          program.getCompilerOptions(),
          host);
          
        if (!resolvedName.resolvedModule)
          break;
        const specifiedSourceFile = program.getSourceFile(resolvedName.resolvedModule.resolvedFileName)
        if (!specifiedSourceFile)
          break;

        // With no clause, this is an "export * from" situation
        if (!exportDeclaration.exportClause)
          return findTSExportableDeclarations(specifiedSourceFile.statements, specifiedSourceFile.fileName, context);

        if (exportDeclaration.exportClause.kind === ts.SyntaxKind.NamespaceExport)
          return exportDeclaration;

        // We don't support "export { X } from" statements yet
        return [];

      case ts.SyntaxKind.VariableStatement:
        const variableStatement = statement as ts.VariableStatement;

        if (!isStatementExported(variableStatement))
          return [];

        const variableDeclarations: ts.VariableDeclaration[] = []

        for (const declaration of variableStatement.declarationList.declarations) {
          if (declaration.name.kind !== ts.SyntaxKind.Identifier)
            continue;

          const symbol = context.checker.getSymbolAtLocation(declaration.name) as ts.Symbol;

          const id = createId<"EchoDeclarationID">()
          context.internalSymbols.set(symbol, id);
          context.identifiers.set(id, declaration.name.text)

          variableDeclarations.push(declaration);
          console.log(`Found`, declaration.name.text)
        }

        return variableDeclarations;
      case ts.SyntaxKind.TypeAliasDeclaration: {
        const declaration = statement as ts.TypeAliasDeclaration;


        if (!isStatementExported(declaration))
          return [];

        const symbol = context.checker.getSymbolAtLocation(declaration.name) as ts.Symbol;
        const id = createId<"EchoDeclarationID">()
        context.internalSymbols.set(symbol, id);
        context.identifiers.set(id, declaration.name.text)

        return declaration;
      }
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
      case ts.SyntaxKind.EnumDeclaration:
      case ts.SyntaxKind.ModuleDeclaration:
      default:
        return [];
    }
    return [];
  }).flat(1)
}


const createEchoTypeParameterDeclaration = (
  parameter: ts.TypeParameterDeclaration,
  context: ModuleBuildContext,
): EchoDeclaration.TypeParameter => {
  const identifier = parameter.name.text;
  const symbol = context.checker.getSymbolAtLocation(parameter.name);
  const id = createId<"EchoDeclarationID">()

  if (!symbol)
    throw new Error(`Missing symbol for Type Parameter Declaration`);

  const builder = createTypeBuilder2({
    module: context,
    // TODO: TypeParameters can include each other - this should be extended to
    // capture this
    parametricTypes: new Map(),
    visitedTypes: new Map(),
  });

  context.internalSymbols.set(symbol, id);
  context.identifiers.set(id, identifier);

  let _extends = null;
  if (parameter.constraint) {
    _extends = builder.declarations.fromAnyTypeNode(parameter.constraint);
  }
  let _default = null;
  if (parameter.default) {
    _default = builder.declarations.fromAnyTypeNode(parameter.default);
  }

  return {
    identifier,
    id,
    extends: _extends,
    default: _default
  }
}

export const createEchoDeclaration = (tsDeclaration: TSExportableDeclaration, context: ModuleBuildContext): EchoDeclaration => {
  const source = tsDeclaration.getSourceFile();
  const ranges = ts.getLeadingCommentRanges(source.text, tsDeclaration.pos);
  let doc: string | null = null;
  if (ranges) {
    doc = source.text.slice(ranges[0].pos, ranges[0].end)
  }

  switch (tsDeclaration.kind) {
    case ts.SyntaxKind.TypeAliasDeclaration: {
      const symbol = context.checker.getSymbolAtLocation(tsDeclaration.name) as ts.Symbol;
      const id = context.internalSymbols.get(symbol);
      if (id === undefined)
        throw new Error(`TypeAliasDeclaration should already have ID`);

      const identifier = tsDeclaration.name.text
      context.identifiers.set(id, identifier);

      const parameters = (tsDeclaration.typeParameters || [])
        .map(param => createEchoTypeParameterDeclaration(param, context));

      const typeBuilder = createTypeBuilder2({
        module: context,
        parametricTypes: new Map(),
        visitedTypes: new Map(),
      })

      const declares = typeBuilder.declarations.fromAnyTypeNode(tsDeclaration.type);

      return EchoDeclaration.create(id, 'type', { declares, parameters, doc, identifier })
    }
    case ts.SyntaxKind.VariableDeclaration: {
      const symbol = context.checker.getSymbolAtLocation(tsDeclaration.name) as ts.Symbol;
      const id = context.internalSymbols.get(symbol) as EchoDeclaration.ID;
    
      const name = tsDeclaration.name as ts.Identifier;

      const type = context.checker.getTypeOfSymbol(symbol);
      const typeBuilder = createTypeBuilder2({
        module: context,
        parametricTypes: new Map(),
        visitedTypes: new Map(),
      })
      context.identifiers.set(id, name.text);

      const echoTypeID = typeBuilder.instances.fromType(type);
      const echoType = context.includedTypes.get(echoTypeID) as EchoType;
      
      switch (echoType.type) {
        case 'callable':
          return EchoDeclaration.create(id, 'function', { identifier: name.text, doc: null, signature: echoTypeID });
        default:
          return EchoDeclaration.create(id, 'variable', { identifier: name.text, doc: null, typeof: echoTypeID });
      }
    }
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration:
    case ts.SyntaxKind.EnumDeclaration:
    case ts.SyntaxKind.ModuleDeclaration:
    case ts.SyntaxKind.ExportDeclaration:
      return EchoDeclaration.create(createId(), "unsupported", { message: 'Not supported yet', doc: '', identifier: '' })
  }
}



export const findExternalDeclarations = (declarationPackage: PackageFileReferenceInfo, sourceFile: ts.SourceFile, context: ModuleBuildContext) => {
  const packageSource = getModuleSource(declarationPackage.package, sourceFile, context)
  if (packageSource) {
    findExternalDeclarationsInSource(declarationPackage.package, packageSource, context);
  }
}

export const findExternalDeclarationsInSource = (packageName: string, sourceFile: ts.SourceFile, context: ModuleBuildContext) => {
  const packageSymbol = context.checker.getSymbolAtLocation(sourceFile);
  if (packageSymbol && !context.exploredPackagesModules.has(packageSymbol)) {
    context.exploredPackagesModules.add(packageSymbol)
    // visit every export for this module, and build some external declaration ids
    buildExternalReferences(packageSymbol, packageName, context);
  }
}