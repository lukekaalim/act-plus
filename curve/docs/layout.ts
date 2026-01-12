import { Vector } from "@lukekaalim/act-graphit";
import { Vector2D } from "../vectors";

type Direction = 'horizontal' | 'vertical';
type Alignment = 'start' | 'end' | 'center';

export type LayoutNode = (
  | { type: 'rect', size: Vector<2> }
  | { type: 'list', direction: Direction, contents: LayoutNode[], align: Alignment }
) & { id: string }
export const LayoutNode = {
  rect(id: string, 
    size: Vector<2>): LayoutNode {
    return { id, type: 'rect', size }
  },
  list(id: string, direction: Direction, align: Alignment, contents: LayoutNode[]): LayoutNode {
    return { id, type: 'list', direction, contents, align };
  },
}

export type LayoutOutput = { position: Vector<2>, size: Vector<2> };

const calcNodeSizes = (node: LayoutNode): Vector<2> => {
  switch (node.type) {
    case 'rect':
      return node.size;
    case 'list':
      return node.contents
        .map(content => calcNodeSizes(content))
        .reduce((left, right) => {
          if (node.direction === 'horizontal') {
            return { x: left.x + right.x, y: Math.max(left.y, right.y) }
          } else {
            return { x: Math.max(left.x, right.x), y: left.y + right.y,  }
          }
        })
  }
}

const align = (
  direction: 'vertical' | 'horizontal',
  alignment: 'start' | 'end' | 'center',
  container: Vector<2>, position: Vector<2>, size: Vector<2>
) => {
  const alignment_multiplier = alignment === 'start' ? 0 : alignment === 'center' ? 0.5 : 1;
  const direction_coefficient = direction === 'vertical' ? { x: 1, y: 0 } : { x: 0, y: 1 };

  return {
    x: position.x + (direction_coefficient.x * ((alignment_multiplier * container.x) - (alignment_multiplier * size.x))),
    y: position.y + (direction_coefficient.y * ((alignment_multiplier * container.y) - (alignment_multiplier * size.y))),
  };
}

export const calcNodeLayouts = (node: LayoutNode, position: Vector<2>, out: Map<string, LayoutOutput> = new Map()): Map<string, LayoutOutput> => {
  const size = calcNodeSizes(node);
  out.set(node.id, { size, position });

  if (node.type === 'list') {
    let current_position = position;
    
    for (const child of node.contents) {
      const childSize = calcNodeSizes(child);

      const childPosition = align(node.direction, node.align, size, current_position, childSize);

      calcNodeLayouts(child, childPosition, out);

      if (node.direction === 'vertical') {
        current_position = {
          x: current_position.x,
          y: current_position.y + childSize.y,
        }
      } else {
        current_position = {
          x: current_position.x + childSize.x,
          y: current_position.y,
        }
      }
    }
  }
  
  return out;
};
