import { jsPDF } from "jspdf";

export type PlannerConfig = {
  year: string;
  includeYearCal: boolean;
  notePageCount: number;
};

export type CoverPageOptions = { year: string };
export type CalendarMonthOptions = { year: string; month: number };
export type PageOptions = CoverPageOptions | CalendarMonthOptions | null;

export type Page = {
  layout:
    | ((doc: jsPDF) => void | Promise<void>)
    | ((doc: jsPDF, options: PageOptions) => void | Promise<void>);
  options?: PageOptions;
};

export type PageIndex = Record<string, number>;
