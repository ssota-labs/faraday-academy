/** Constant-acceleration kinematics helpers (x₀ = 0). */
export const posAt = (v0: number, a: number, t: number) => v0 * t + 0.5 * a * t * t;
export const velAt = (v0: number, a: number, t: number) => v0 + a * t;

export function sampleMotion(v0: number, a: number, tMax: number, steps = 40) {
  const pts: { t: number; x: number; v: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (tMax * i) / steps;
    pts.push({ t, x: posAt(v0, a, t), v: velAt(v0, a, t) });
  }
  return pts;
}
