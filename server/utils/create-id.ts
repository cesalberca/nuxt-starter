import { init } from "@paralleldrive/cuid2";

const random = () => {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] / (0xffffffff + 1);
};

export const createId = init({ random, length: 32 });
