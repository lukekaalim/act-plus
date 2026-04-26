import { ModuleBuildContext } from "../echo";
import { createExternalTypeBuilder, ExternalTypeBuilder } from "./external";
import { createTypeInstanceBuilder, InstanceTypeBuilder } from "./instances";
import { createSyntaxTypeBuilder, SyntaxTypeBuilder } from "./syntax";

export type TypeBuilder = ExternalTypeBuilder & SyntaxTypeBuilder & InstanceTypeBuilder;

export const createTypeBuilder = (cx: ModuleBuildContext) => {
  const builder: TypeBuilder = {} as any;

  createExternalTypeBuilder(cx, builder);
  createTypeInstanceBuilder(cx, builder)
  createSyntaxTypeBuilder(cx, builder);

  return builder
}