import { Dimension } from "./dimensions";
import { Vector } from "./vector";

export type Box<D extends Dimension> = {
  position: Vector<D>,
  size: Vector<D>,
};
