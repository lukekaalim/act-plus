import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { clamp, Vector2D } from "@lukekaalim/act-curve";
import { SVG } from "@lukekaalim/act-web";

const HEIGHT = 8;
const WIDTH = 32;
type P = {
  readonly position: Vector2D,
  readonly velocity: Vector2D,
}
type S = {
  readonly points: P[],

  mouseActive: boolean,
  mousePoint: Vector2D,
}


const createHeroSimulation = () => {
  const volumeCache = Array.from({ length: HEIGHT * WIDTH }).map(() => new Set<number>());

  const state: S = {
    points: [],
    mousePoint: { x: 0, y: 0 },
    mouseActive: false,
  }


  const getIndex = (x: number, y: number) => {
    const i = Math.min(Math.round(x), WIDTH - 1) + (Math.min(Math.round(y), HEIGHT - 1) * WIDTH);
    if (!volumeCache[i])
      debugger;

    return i;
  }
  const getNeighbors = (position: Vector2D) => {
    // round to full number
    const x = Math.round(position.x)
    const y = Math.round(position.y)
    const neighbors = [...volumeCache[getIndex(x, y)]];

    if (x > 0) {
      neighbors.push(...volumeCache[getIndex(x - 1, y)])

      if (y > 0) {
        neighbors.push(...volumeCache[getIndex(x - 1, y - 1 )])
      }
      if (y < HEIGHT) {
        neighbors.push(...volumeCache[getIndex(x - 1,y + 1)])
      }
    }
    if (x < WIDTH) {
      neighbors.push(...volumeCache[getIndex(x + 1, y )])
      if (y > 0) {
        neighbors.push(...volumeCache[getIndex(x + 1, y - 1 )])
      }
      if (y < HEIGHT) {
        neighbors.push(...volumeCache[getIndex(x + 1, y + 1 )])
      }
    }
    if (y > 0) {
      neighbors.push(...volumeCache[getIndex(x, y - 1 )])
    }
    if (y < HEIGHT) {
      neighbors.push(...volumeCache[getIndex(x, y + 1 )])
    }

    return neighbors;
  }

  const updateParticle = (p: P) => {
    // Apply velocity
    p.position.x += p.velocity.x
    p.position.y += p.velocity.y

    // Pushed by mouse
    if (state.mouseActive) {
      const distance = Vector2D.distance(p.position, state.mousePoint);
      if (distance < 2) {
        const power = (1 - (distance / 2)) / 50;
        let offset = Vector2D.subtract(p.position, state.mousePoint)
        offset = Vector2D.scalar.multiply(offset, power)
        p.velocity.x += offset.x
        p.velocity.y += offset.y
      }
    }

    // Bounce of edges
    if (p.position.x < 0) {
      p.position.x = -p.position.x;
      p.velocity.x = Math.abs(p.velocity.x);
    }
    if (p.position.x > WIDTH) {
      p.position.x = WIDTH - (p.position.x - WIDTH);
      p.velocity.x = -Math.abs(p.velocity.x);
    }
    if (p.position.y < 0) {
      p.position.y = -p.position.y;
      p.velocity.y = Math.abs(p.velocity.y);
    }
    if (p.position.y > HEIGHT) {
      p.position.y = HEIGHT - (p.position.y - HEIGHT);
      p.velocity.y = -Math.abs(p.velocity.y);
    }

    // Apply Drag (lose 1% velocity per tick)
    p.velocity.x = p.velocity.x * 0.99
    p.velocity.y = p.velocity.y * 0.99
  }

  // init data
  for (let i = 0; i < 256; i++) {
    state.points[i] = {
      position: { x: i % WIDTH, y: Math.floor(i / WIDTH), },
      velocity: { x: ((Math.random() * 2) - 1) * 0.05, y: ((Math.random() * 2) - 1) * 0.05 }
    }
    volumeCache[getIndex(state.points[i].position.x, state.points[i].position.y)].add(i)
  }

  return {
    getNeighbors,
    state,
    tick() {
      for (let i = 0; i < state.points.length; i++) {
        const p = state.points[i];
        const prev_index = getIndex(p.position.x, p.position.y);

        updateParticle(p);

        const next_index = getIndex(p.position.x, p.position.y);

        if (prev_index !== next_index) {
          volumeCache[prev_index].delete(i)
          volumeCache[next_index].add(i)
          // nothing
        }
      }
      for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
          const i = getIndex(x, y);
          const cache = volumeCache[i];
          const neighbors = getNeighbors({ x, y });

          for (const pi of cache) {
            const p = state.points[pi];

            for (let y = 0; y < neighbors.length; y++) {
              if (neighbors[y] === i)
                continue;

              const n = state.points[neighbors[y]];

              const difference = Vector2D.subtract(p.position, n.position);
              const distance = Vector2D.length(difference);
              
              if (distance < 0.5 && distance !== 0) {
                p.velocity.x += difference.x / distance / 1000;
                p.velocity.y += difference.y / distance / 1000;
              }
            }
          }
        }
      }
    }
  }
};

export const DocHero = () => {
  const [sim] = useState(createHeroSimulation());
  const ref = useRef<SVGSVGElement | null>(null);

  const rects = useRef<SVGRectElement[]>([]).current;
  const lines = useRef<SVGLineElement[]>([]).current;



  useEffect(() => {
    const svg = ref.current;
    if (!svg)
      return;

    const svgRect = svg.getBoundingClientRect();

    const onSimStart = () => {
      for (let i = 0; i < sim.state.points.length; i++) {
        const point = sim.state.points[i];

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        rect.cx.baseVal.value = point.position.x;
        rect.cy.baseVal.value = point.position.y;
        rect.style.fill = 'black';


        rect.r.baseVal.value = 0.05;
        svg.append(rect);

        rects[i] = rect;
      }
    };
    const every100Milliseconds = () => {
      sim.tick();

      for (let i = 0; i < sim.state.points.length; i++) {
        const rect = rects[i];
        const point = sim.state.points[i];

        rect.cx.baseVal.value = point.position.x;
        rect.cy.baseVal.value = point.position.y;
      }
      
      rafId = requestAnimationFrame(every100Milliseconds);
    }
    const everyRandomSeconds = () => {
      const i = Math.floor(sim.state.points.length * Math.random())
      const p = sim.state.points[i];

      p.velocity.x += (Math.random() - 0.5) * 0.1;
      p.velocity.y += (Math.random() - 0.5) * 0.1;

      /*
      const constraintIndex = Math.min(Math.floor(sim.state.constraints.length * Math.random()), sim.state.constraints.length);
      const constraint = sim.state.constraints[constraintIndex];

      lines[constraintIndex].style.visibility = 'visible';

      constraint.left = Math.floor(sim.state.points.length * Math.random())
      constraint.right = Math.floor(sim.state.points.length * Math.random())
      
      constraint.enabled = constraint.left !== constraint.right;
      constraint.distance = (Math.random() * 3) + 1;

      */
      randomId = setTimeout(everyRandomSeconds, Math.random() * 50);
    }
    const onMouseEnter = (e: MouseEvent) => {
      sim.state.mouseActive = true;
    }
    const onMouseMove = (e: MouseEvent) => {
      const point = sim.state.mousePoint as Vector2D;
      

      point.x = (e.offsetX / svgRect.width) * WIDTH;
      point.y = (e.offsetY / svgRect.height) * HEIGHT;
    }
    const onMouseLeave = (e: MouseEvent) => {
      sim.state.mouseActive = false;
    }

    svg.addEventListener('mouseenter', onMouseEnter);
    svg.addEventListener('mousemove', onMouseMove);
    svg.addEventListener('mouseleave', onMouseLeave);

    
    onSimStart();
    let rafId = requestAnimationFrame(every100Milliseconds);
    let randomId = setTimeout(everyRandomSeconds, Math.random() * 100);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(randomId);
      svg.removeEventListener('mouseenter', onMouseEnter);
      svg.removeEventListener('mousemove', onMouseMove);
      svg.removeEventListener('mouseleave', onMouseLeave);
    }
  }, []);

  return h(SVG, {}, h('svg', { viewBox: `0 0 ${WIDTH} ${HEIGHT}`, ref, style, preserveAspectRatio: 'none' }))
};

const style = {
  height: '50vh',
  width: '100%',
  display: 'block'
}