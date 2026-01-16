import test from "node:test";
import assert from "node:assert/strict";
import { fastCos, fastSin } from "../src/utils/math.js";

test("fastSin/fastCos stay within a small error band", () => {
  const samples = 360;
  const maxError = 0.02;

  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const sinError = Math.abs(Math.sin(angle) - fastSin(angle));
    const cosError = Math.abs(Math.cos(angle) - fastCos(angle));
    assert.ok(sinError < maxError, `sin error too high: ${sinError}`);
    assert.ok(cosError < maxError, `cos error too high: ${cosError}`);
  }
});
