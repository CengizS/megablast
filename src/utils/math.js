const TAU = Math.PI * 2;
const LUT_SIZE = 2048;
const SIN_LUT = new Float32Array(LUT_SIZE);
const COS_LUT = new Float32Array(LUT_SIZE);

for (let i = 0; i < LUT_SIZE; i++) {
  const angle = (i / LUT_SIZE) * TAU;
  SIN_LUT[i] = Math.sin(angle);
  COS_LUT[i] = Math.cos(angle);
}

function normalizeAngle(angle) {
  let normalized = angle % TAU;
  if (normalized < 0) normalized += TAU;
  return normalized;
}

function lutIndex(angle) {
  return Math.floor((normalizeAngle(angle) / TAU) * LUT_SIZE);
}

export function fastSin(angle) {
  return SIN_LUT[lutIndex(angle)];
}

export function fastCos(angle) {
  return COS_LUT[lutIndex(angle)];
}

export function randBetween(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
