import * as consts from "./consts.js";

export function pageWPercent(n: number): number {
  return pxToMM(consts.Wpx * (n / 100));
}

export function pageHPercent(n: number): number {
  return pxToMM(consts.Hpx * (n / 100));
}

export function ptToMM(pt: number): number {
  return pt * 0.352778;
}

export function pxToMM(px: number): number {
  return (px / consts.DPI) * 25.4;
}

// Return the days in the given month
export function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}
