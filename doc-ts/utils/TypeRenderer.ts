
import { h } from "@lukekaalim/act";
import { EchoDeclaration, EchoModule, EchoType } from "@lukekaalim/echo";
import { DocApp, HLJSBuilder, hljsClassNames } from "@lukekaalim/grimoire";
import { EchoPlugin } from "../Echo";
import { EchoModuleContext } from "./ModuleContext";

export const createTypeRenderer = (context: EchoModuleContext, docApp: DocApp<[EchoPlugin]>) => {
  const visitedTypes = new Set<EchoType.ID>();

  const { module } = context;

  const renderDelimitedList = <T>(elements: T[], renderElement: (element: T) => void, renderDelimiter: () => void) => {
    for (let i = 0; i < elements.length; i++) {
      renderElement(elements[i]);
      if (i !== elements.length - 1)
        renderDelimiter()
    }
  }


  const renderTypeParameters = (syntax: HLJSBuilder, typeParameters: EchoType.Any[]) => {
    if (typeParameters.length === 0)
      return syntax;

    syntax.text('<')
    renderDelimitedList(typeParameters, parameter => renderType(syntax, parameter), () => syntax.text(', '))
    syntax.text('>')
    return syntax;
  }
  const renderTypeParametersDeclaration = (syntax: HLJSBuilder, parameters: EchoDeclaration.Generic[]) => {
    if (parameters.length === 0)
      return syntax;

    syntax.text('<')
    renderDelimitedList(parameters, parameter => {
      syntax.title(parameter.identifier);
      if (parameter.extends) {
        syntax.type(' extends ');
        renderType(syntax, module.types[parameter.extends])
      }
      if (parameter.default) {
        syntax.type(' = ');
        renderType(syntax, module.types[parameter.default])
      }
    }, () => syntax.text(', '))
    syntax.text('>')
    return syntax;
  }

  const renderType = (syntax: HLJSBuilder, echoType: EchoType.Any): HLJSBuilder => {
    if (!echoType)
      debugger;
    if (visitedTypes.has(echoType.id)) {
      return syntax.comment(`<Recursive id="${echoType.id}" />`);
    }

    switch (echoType.type) {
      case 'builtin':
        return syntax.builtIn(echoType.builtin);
      case 'keyword':
        return syntax.keyword(echoType.keyword);
      case 'unsupported':
        return syntax.comment(`Unsupported(Reflector) type [${echoType.message}] />`);
      case 'literal':
        switch (typeof echoType.value) {
          default:
          case 'object':
            return syntax.keyword('null');
          case 'string':
            return syntax.string(`"` + (echoType.value as string).toString() + `"`);
          case 'number':
            return syntax.number((echoType.value).toString());
          case 'boolean':
            return syntax.literal((echoType.value).toString());
        }
      case 'intersection':
        if (echoType.branches.length < 3) {
          renderType(syntax, module.types[echoType.branches[0]])
          syntax.text(' & ')
          renderType(syntax, module.types[echoType.branches[1]])
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.branches) {
            syntax.newLine().text('& ')
            renderType(syntax, module.types[branch])
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'union':
        if (echoType.branches.length < 3) {
          renderType(syntax, module.types[echoType.branches[0]])
          syntax.text(' | ')
          renderType(syntax, module.types[echoType.branches[1]])
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.branches) {
            syntax.newLine().text('| ')
            renderType(syntax, module.types[branch])
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'tuple':
        syntax.text('[')
        renderDelimitedList(echoType.values, id => renderType(syntax, module.types[id]), () => syntax.text(', '));
        syntax.text(']')
        return syntax;
      case 'array':
        return renderType(syntax, module.types[echoType.element])
          .text('[]')
      case 'indexed-access':
        renderType(syntax, module.types[echoType.target])
        syntax.text('[')
        renderType(syntax, module.types[echoType.accessor]);
        syntax.text(']')
        return syntax;
      case 'reference':
        if (echoType.target.type === 'declaration') {
          const declaration = module.declarations[echoType.target.id]
          if (!declaration)
            syntax.titleClass(`<ReferenceNotFound id="${echoType.target.id}" />`)
          else {
            const namespaces = context.namespacesByDeclarations.get(declaration.id);
            if (!namespaces) {
              syntax.titleClass(`<IdentifierNotFound id="${echoType.target.id}" />`)
            }
            else {
              const qualifiedName = [...namespaces.map(n => n.identifier), declaration.identifier].join('.');

              const location = docApp.reference.resolveRouteLink(`echo:${module.name}:${qualifiedName}`)
              
              if (location)
                syntax.node(h('a', { href: location.href, classList: [hljsClassNames.titleClass] }, qualifiedName))
              else
                syntax.titleClass(qualifiedName)
            }
          }
        } else if (echoType.target.type === 'reference') {
          const reference = module.references[echoType.target.id]
          if (!reference)
            syntax.comment(`<ReferenceNotFound id="${echoType.target.id}" />`)
          else {
            const location = docApp.reference.resolveRouteLink(`echo:${reference.module}:${reference.identifier}`)
            if (location) {
              syntax.node(h('a', { href: location.href, classList: [hljsClassNames.titleClass] }, reference.identifier))
            }
            else
              syntax.titleClass(reference.identifier);
          }
        }
        renderTypeParameters(syntax, echoType.typeParameters.map(id => module.types[id]));
        return syntax;
      case 'callable':
        visitedTypes.add(echoType.id);
        renderCallableSignature(syntax, echoType, false);
        return syntax;
      default:
        return syntax.comment(`<Unsupported(Renderer) type "${echoType.type}" />`)
      case 'object': {
        visitedTypes.add(echoType.id);
        syntax.text('{').newLine(1);
        renderDelimitedList(Object.entries(echoType.properties), ([key, propertyId]) => {
          const property = module.types[propertyId];
          if (property.type === 'callable') {
            syntax.titleClass(key);
            renderCallableSignature(syntax, property, true);
          } else {
            syntax.text(key).text(': ');
            renderType(syntax, property);
          }
        }, () => syntax.text(', ').newLine())
        syntax.newLine(-1).text('}')
        return syntax;
      }
    }
  }

  const renderCallableSignature = (syntax: HLJSBuilder, callable: EchoType.Callable, isMethod: boolean) => {
    renderTypeParametersDeclaration(syntax, callable.typeParameters.map(id => module.declarations[id]).filter(d => d.type === 'generic'));
    syntax.text('(');
    if (callable.parameters.length > 0) {
      syntax.indent(1).newLine()
      renderDelimitedList(callable.parameters, param => {
        syntax.params(param.name)
        if (param.optional) {
          syntax.text('?: ')
        } else {
          syntax.text(': ')
        }
        renderType(syntax, module.types[param.type]);
      }, () => syntax.text(', ').newLine())
      syntax.indent(-1).newLine()
    }
    if (isMethod)
      syntax.text('): ');
    else
      syntax.text(') => ');
    renderType(syntax, module.types[callable.returns])
  }

  const renderDeclaration = (syntax: HLJSBuilder, echoDeclaration: EchoDeclaration.Any) => {
    const namespaces = context.namespacesByDeclarations.get(echoDeclaration.id) || [];
    const identifier = [...namespaces.map(n => n.identifier), echoDeclaration.identifier].join('.');
    
    switch (echoDeclaration.type) {
      case 'type':
        syntax
          .keyword('type ')
          .title(identifier);
        renderTypeParametersDeclaration(syntax, echoDeclaration.parameters.map(param => module.declarations[param] as EchoDeclaration.Generic));
        syntax.text(' = ');

        renderType(syntax, module.types[echoDeclaration.declares]);
        return syntax;
      case 'namespace':
        syntax.keyword("namespace ").titleClass(identifier);
        return syntax;
      case 'function':
        syntax.keyword('function ').titleClass(identifier)
        const type = module.types[echoDeclaration.signature];
        if (type.type === 'callable')
          renderCallableSignature(syntax, type, true);
        else {
          syntax.comment(`<Function Type "${type.type}" is not a callable?? />`)
        }
        return syntax;
      case 'unsupported':
        return syntax.comment(`<Unsupported(Reflector) declaration "${echoDeclaration.message}" />`)
      case 'variable':
        syntax.keyword('let ')
          .title(identifier);
        if (echoDeclaration.typeof) {
          syntax.text(': ')
          renderType(syntax, module.types[echoDeclaration.typeof]);
        }
        return syntax;
      default:
        return syntax
          .comment(`<Unsupported(Renderer) declaration "${echoDeclaration.type}" />`);
    }
  }

  return {
    renderCallableSignature,
    renderDeclaration,
    renderType,
    renderTypeParameters,
    renderTypeParametersDeclaration,
  }
}
