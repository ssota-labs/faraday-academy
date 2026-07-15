/** Shared physics helpers for Star Chart (SI-inspired, dimensionless teaching units). */

/** Kepler ellipse: focus at origin, parametric true anomaly θ. */
export function keplerPosition(a: number, e: number, theta: number): { x: number; y: number } {
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
  return { x: r * Math.cos(theta), y: r * Math.sin(theta) };
}

/** Vis-viva speed (GM = 1 teaching units): v² = GM(2/r − 1/a). */
export function visViva(r: number, a: number, GM = 1): number {
  return Math.sqrt(Math.max(1e-9, GM * (2 / r - 1 / a)));
}

/** Orbital period from Kepler III: T² = 4π² a³ / GM (GM=1 → T = 2π a^{3/2}). */
export function keplerPeriod(a: number, GM = 1): number {
  return (2 * Math.PI * Math.pow(a, 1.5)) / Math.sqrt(GM);
}

/**
 * Schwarzschild gravitational time-dilation factor for a static clock:
 * dτ/dt = √(1 − r_s / r), valid for r > r_s.
 */
export function gravTimeFactor(r: number, rs: number): number {
  if (r <= rs) return 0;
  return Math.sqrt(1 - rs / r);
}

/**
 * Approximate light deflection angle (radians) for a grazing ray:
 * α ≈ 4GM/(c² b) = 2 r_s / b  (in geometric units where c=1).
 */
export function lightDeflection(impactParam: number, rs: number): number {
  return (2 * rs) / Math.max(impactParam, rs * 1.01);
}
