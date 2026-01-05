import { createContext } from "@lukekaalim/act";
import { Subject } from 'rxjs';
import { createBeat } from "../../heartbeat";

export type ProgressController = {
  progress: number,

  update(): void,

  subscribe: Subject<number>,
};

export const ProgressControllerContext = createContext<ProgressController | null>(null);

export const ProgressAnim = createBeat<{ progress: number }>("DemoAnimationProgress", { progress: 0 });
