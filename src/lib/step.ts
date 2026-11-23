// The step of the walk lives in the address, as #tawaf-6 (D30). Any other address opens step 1.
const STEP = /^#tawaf-([1-9]\d*)$/;

export function readStep(hash: string, total: number): number {
  const match = STEP.exec(hash);
  const step = match ? Number(match[1]) : 1;
  return step <= total ? step : 1;
}

export function stepHash(step: number): string {
  return `#tawaf-${step}`;
}
