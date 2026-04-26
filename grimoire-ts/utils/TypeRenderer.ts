
import { h } from "@lukekaalim/act";
import { EchoReadingContext, Type, Identifier, TypeID, TypeParameterIdentifier, TypeIdentifier, ValueIdentifier } from "@lukekaalim/echo";
import { DocApp, HLJSBuilder, hljsClassNames } from "@lukekaalim/grimoire";
import { EchoPlugin } from "../Echo";

export const createTypeRenderer = (context: EchoReadingContext, docApp: DocApp<[EchoPlugin]>) => {
  // keep a list of all types to make sure we don't
  // infinitely recurse
  const visitedTypes = new Set<TypeID>();

  /**
   * Render some elements, separated by a "delimiter"
   * @param elements 
   * @param renderElement 
   * @param renderDelimiter 
   */
  const renderDelimitedList = <T>(elements: T[], renderElement: (element: T) => void, renderDelimiter: () => void) => {
    for (let i = 0; i < elements.length; i++) {
      renderElement(elements[i]);
      if (i !== elements.length - 1)
        renderDelimiter()
    }
  }


  const renderTypeParameters = (syntax: HLJSBuilder, typeParameters: Type[]) => {
    if (typeParameters.length === 0)
      return syntax;

    syntax.text('<')
    renderDelimitedList(typeParameters, parameter => renderType(syntax, parameter), () => syntax.text(', '))
    syntax.text('>')
    return syntax;
  }

  const renderTypeParametersDeclaration = (syntax: HLJSBuilder, parameters: TypeParameterIdentifier[]) => {
    if (parameters.length === 0)
      return syntax;

    syntax.text('<')
    renderDelimitedList(parameters, parameter => {
      syntax.title(parameter.name);
      if (parameter.constraint) {
        syntax.type(' extends ');
        renderType(syntax, context.getTypeOrThrow(parameter.constraint))
      }
      if (parameter.default) {
        syntax.type(' = ');
        renderType(syntax, context.getTypeOrThrow(parameter.default))
      }
    }, () => syntax.text(', '))
    syntax.text('>')
    return syntax;
  }

  const renderType = (syntax: HLJSBuilder, echoType: Type): HLJSBuilder => {
    if (!echoType)
      debugger;
    if (visitedTypes.has(echoType.id)) {
      return syntax.comment(`<Recursive id="${echoType.id}" />`);
    }

    // if (echoType.meta) {
    //   for (const [name, value] of Object.entries(echoType.meta)) {
    //     syntax.comment(`${name}=${value}`)
    //   }
    // }

    switch (echoType.type) {
      case 'keyword':
        return syntax.keyword(echoType.keyword);
      case 'parser-error':
        return syntax.comment(`Unsupported(Reflector) type [${echoType.message}] />`);
      case 'literal':
        switch (typeof echoType.literal) {
          default:
          case 'object':
            return syntax.keyword('null');
          case 'string':
            return syntax.string(`"` + (echoType.literal as string).toString() + `"`);
          case 'number':
            return syntax.number((echoType.literal).toString());
          case 'boolean':
            return syntax.literal((echoType.literal).toString());
        }
      case 'intersection':
        if (echoType.intersections.length < 3) {
          renderType(syntax, context.types.get(echoType.intersections[0]) as Type)
          syntax.text(' & ')
          renderType(syntax, context.types.get(echoType.intersections[1]) as Type)
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.intersections) {
            syntax.newLine().text('& ')
            renderType(syntax, context.types.get(branch) as Type)
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'union':
        if (echoType.unions.length < 3) {
          renderType(syntax, context.types.get(echoType.unions[0]) as Type)
          syntax.text(' | ')
          renderType(syntax, context.types.get(echoType.unions[1]) as Type)
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.unions) {
            syntax.newLine().text('| ')
            renderType(syntax, context.types.get(branch) as Type)
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'operation':
        syntax.keyword(echoType.operation).text(' ');
        renderType(syntax, context.getTypeOrThrow(echoType.target));
        return syntax;
      case 'tuple':
        syntax.text('[')
        renderDelimitedList(
          echoType.elements,
          element => renderType(syntax, context.types.get(element.typeof) as Type),
          () => syntax.text(', ')
        );
        syntax.text(']')
        return syntax;
      case 'array':
        return renderType(syntax, context.types.get(echoType.element) as Type)
          .text('[]')
      case 'index-access':
        renderType(syntax, context.getTypeOrThrow(echoType.target))
        syntax.text('[')
        renderType(syntax, context.getTypeOrThrow(echoType.index));
        syntax.text(']')
        return syntax;
      case 'reference':
        const qualifiedName = context.qualifiedNameByIdentifier.get(echoType.target);

        if (qualifiedName) {
          const location = docApp.reference.resolveRouteLink(`echo:${context.echo.moduleName}:${qualifiedName}`)
          if (location)
            syntax.node(h('a', { href: location.href, classList: [hljsClassNames.titleClass] }, qualifiedName))
          else
            syntax.titleClass(qualifiedName)
        } else {
          syntax.titleClass(`<ReferenceNotFound id="${echoType.target}" />`)
        }

        renderTypeParameters(syntax, echoType.parameters.map(id => context.getTypeOrThrow(id)));
        return syntax;
      case 'function':
        visitedTypes.add(echoType.id);
        renderCallableSignature(syntax, echoType, false);
        return syntax;
      default:
        return syntax.comment(`<Unsupported(Renderer) type "${echoType.type}" />`)
      case 'object': {
        visitedTypes.add(echoType.id);
        if (echoType.properties.length === 0) {
          syntax.text('{}');
          return syntax;
        }
        syntax.text('{').newLine(1);
        renderDelimitedList(echoType.properties, (property) => {
          const propertyType = context.getTypeOrThrow(property.typeof);

          if (propertyType.type === 'function') {
            syntax.titleClass(property.identifier);
            renderCallableSignature(syntax, propertyType, true);
          } else {
            syntax.text(property.identifier).text(': ');
            renderType(syntax, propertyType);
          }
        }, () => syntax.text(', ').newLine())
        syntax.newLine(-1).text('}')
        return syntax;
      }
    }
  }

  const renderCallableSignature = (syntax: HLJSBuilder, callable: Type.Function, isMethod: boolean) => {
    const typeParameters = callable.typeParameters
      .map(id => context.identifiers.get(id) as Identifier)
      .filter(id => id.type === 'type-parameter')

    renderTypeParametersDeclaration(syntax, typeParameters);
    syntax.text('(');
    if (callable.parameters.length > 0) {
      syntax.indent(1).newLine()
      renderDelimitedList(callable.parameters, param => {
        syntax.params(param.identifier)
        syntax.text(': ')
        renderType(syntax, context.getTypeOrThrow(param.typeof));
      }, () => syntax.text(', ').newLine())
      syntax.indent(-1).newLine()
    }
    if (isMethod)
      syntax.text('): ');
    else
      syntax.text(') => ');
    renderType(syntax, context.getTypeOrThrow(callable.returns))
  }

  const renderIdentifier = (syntax: HLJSBuilder, identifier: TypeIdentifier | ValueIdentifier) => {
    const qualifiedName = context.qualifiedNameByIdentifier.get(identifier.id) as string;
    const type = context.getTypeOrThrow(identifier.typeId)
    
    switch (identifier.type) {
      case 'type':
        syntax
          .keyword('type ')
          .title(qualifiedName);
        renderTypeParametersDeclaration(syntax, identifier.parameters.map(id => context.getIdentifierOrThrow(id, 'type-parameter')));
        syntax.text(' = ');

        renderType(syntax, type);
        return syntax;
      case 'value': {
        switch (type.type) {
          case 'namespace':
            syntax.keyword("namespace ").titleClass(qualifiedName);
            return syntax;
          case 'function':
            syntax.keyword('function ').titleClass(qualifiedName)
              renderCallableSignature(syntax, type, true);
            return syntax;
          case 'parser-error':
            return syntax.comment(`<Unsupported(Reflector) declaration "${type.message}" />`)
          default:
            syntax.keyword('let ')
              .title(qualifiedName);
            syntax.text(': ')
            renderType(syntax, type);
            return syntax;
        } 
      }
    }
  }

  return {
    renderCallableSignature,
    renderIdentifier,
    renderType,
    renderTypeParameters,
    renderTypeParametersDeclaration,
  }
}
