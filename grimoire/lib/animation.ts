import { createBeat } from "@lukekaalim/act-curve";

export const RAFBeat = createBeat<{
  now: DOMHighResTimeStamp,
  delta: number,
}>("Grimoire/RequestAnimationFrame", { now: 0, delta: 0 });

const realSubscribe = RAFBeat.global.subscribe;

let subscriberCount = 0;
let requestId: number | null = null;
let lastCall = 0;

RAFBeat.global.subscribe = (subscriber) => {
  const realSubscription = realSubscribe(subscriber);

  if (subscriberCount === 0)
    requestId = requestAnimationFrame(animate);

  subscriberCount++;

  return {
    stop() {
      subscriberCount--;
      if (subscriberCount === 0 && requestId !== null)
        cancelAnimationFrame(requestId);

      realSubscription.stop();
    },
  }
}

const event = { now: 0, delta: 0 }

const animate = () => {
  event.now = performance.now();
  event.delta = lastCall === 0 ? 0 : event.now - lastCall;

  RAFBeat.global.run(event);

  if (subscriberCount >= 1)
    requestId = requestAnimationFrame(animate)
  else
    lastCall = 0;
}
