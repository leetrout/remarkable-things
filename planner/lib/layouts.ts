import { jsPDF } from "jspdf";
import * as utils from "./utils.js";
import * as consts from "./consts.js";
import { Page, PageIndex } from "./types.js";
import ImageDataURI from "image-data-uri";
import Colors from "./palette.js";
import Icons from "./icons.js";

const headerW = utils.pageWPercent(100);
const headerH = 10;
const pageMargin = 5;
const marginTop = 15;
const availWidth = consts.Wmm - pageMargin * 2;
const availHeight = consts.Hmm - marginTop - pageMargin;

// FIXME: Pass around in context
const YEAR = 2024;

export const layoutMap = {
  cover: cover,
  credit: credit,
};

export async function cover(doc: jsPDF) {
  const imgData: string = await ImageDataURI.encodeFromFile(
    "./static/cover-sheet-muted-opt.png"
  );
  doc.addImage(imgData, "PNG", 0, 0, consts.Wmm, consts.Hmm, undefined, "SLOW");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(100);
  doc.setTextColor(Colors.text);
  doc.text("2024", utils.pageWPercent(50), utils.pageHPercent(75), {
    align: "center",
  });
}

// The credit page
export async function credit(doc: jsPDF) {
  doc.setTextColor(Colors.text);
  doc.setFontSize(8);

  const lineHeight = utils.ptToMM(9);
  let textTop = utils.pageHPercent(75);

  doc.setFont("helvetica", "bold");
  doc.text("Simple PDF Planner", utils.pageWPercent(5), textTop);

  doc.setFont("helvetica", "normal", 400);
  textTop += lineHeight + 2;
  doc.text("© 2024 Lee Trout", utils.pageWPercent(5), textTop);
  textTop += lineHeight;
  doc.text("Licensed under CC BY 4.0", utils.pageWPercent(5), textTop);
  textTop += lineHeight;
  doc.textWithLink(
    "Cover photo by Massimiliano Morosinotto on Unsplash",
    utils.pageWPercent(5),
    textTop,
    {
      url: "https://unsplash.com/photos/gray-mountain-during-daytime-photo-3i5PHVp1Fkw",
    }
  );
  textTop += lineHeight;

  // HACK: Unsure what is going on with the context save / reset
  // but even though it says the lineWidth is 1 as default it is not
  // behaving correctly without being set to .1 first.

  // Draw Twitter logo
  const ctx = doc.canvas.getContext("2d");
  ctx.lineWidth = 0.1;
  ctx.save();
  ctx.translate(utils.pageWPercent(5), textTop);
  ctx.scale(0.1, 0.1);
  Icons.twitter.draw(ctx);
  ctx.restore();

  doc.setTextColor(Colors.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.textWithLink("TheCodeWritesMe", utils.pageWPercent(5) + 3, textTop + 2, {
    url: "https://twitter.com/TheCodeWritesMe",
  });

  doc.setFontSize(6);
  textTop = utils.pageHPercent(80);
}

// Draw a page header box
function pageHeaderBox(doc: jsPDF) {
  doc.setFillColor(Colors.lightest);
  doc.rect(0, 0, headerW, headerH, "F");
}

function drawMonthCell(
  doc: jsPDF,
  month: number,
  pageIndex: PageIndex,
  x: number,
  y: number,
  w: number,
  h: number
) {
  doc.setDrawColor(Colors.midDark);
  doc.setFontSize(10);
  const cellW = w / 7;
  const cellH = h / 7;

  // Get the page number for the detail page
  const targetMonthDetailPage = pageIndex[`monthDetail${YEAR}${month}`];

  const lastDay = utils.daysInMonth(month, YEAR);
  const firstDay = new Date(YEAR, month, 1).getDay();

  // 7 Rows x 7 cols
  let currentDay = null;
  for (let r = 1; r <= 6; r++) {
    const cellY = y + cellH * r;

    // Draw the line at the bottom of the current row
    doc.line(x, cellY, x + w, cellY);

    for (let c = 0; c <= 6; c++) {
      const cellX = x + cellW * c;

      if (c > 0) {
        doc.line(cellX, cellY, cellX, cellY + cellH);
      }

      // Put day abbreviations above the first row
      if (r == 1) {
        const ogFS = doc.getFontSize();
        const ogTC = doc.getTextColor();
        doc.setFontSize(6);
        doc.setTextColor(Colors.midLight);
        doc.text(consts.dayOfWeekAbbr[c], cellX + cellW / 2, cellY - 0.5, {
          align: "center",
        });
        doc.setFontSize(ogFS);
        doc.setTextColor(ogTC);
      }

      // Determine the text value for the cell
      // The date starts counting in the first row
      let cellText = "";
      if (r == 1 && c == firstDay) {
        currentDay = 1;
      }

      if (currentDay && currentDay <= lastDay) {
        cellText = `${currentDay}`;
        currentDay++;
      } else {
        continue;
      }

      // Now write the date in the cell.
      // The cell is located at cellX, cellY so
      // to center the text horizontally we align the
      // text to center and place the x coordinate at the
      // middle of the cell by adding half the width of the cell
      // to the x coordinate.
      // For the y coordinate we want to vertically center the text
      // which is the cell's y coordinate in addition to the height
      // of the text in addtion to a third the difference between
      // the text dimension and the cell height.
      const dims = doc.getTextDimensions(cellText);

      // Get the page number for the detail page
      const targetDayDetailPage =
        pageIndex[`dayDetail${YEAR}${month}${cellText}`];

      doc.textWithLink(
        cellText,
        cellX + cellW / 2,
        cellY + dims.h + (cellH - dims.h) / 3,
        {
          align: "center",
          pageNumber: targetDayDetailPage,
        }
      );
    }
  }

  // Write the name of the month
  const dims = doc.getTextDimensions(consts.months[month]);
  doc.textWithLink(consts.months[month], x + w / 2, y + dims.h, {
    align: "center",
    pageNumber: targetMonthDetailPage,
  });
}

function drawMonthDetail(
  doc: jsPDF,
  month: number,
  pageIndex: PageIndex,
  x: number,
  y: number,
  w: number,
  h: number
) {
  doc.setDrawColor(Colors.midLight);
  const cellW = w / 7;
  const cellH = h / 7;
  const lastDay = utils.daysInMonth(month, YEAR);
  const firstDay = new Date(YEAR, month, 1).getDay();

  pageHeaderBox(doc);
  doc.setTextColor(Colors.text);
  doc.setFontSize(24);
  doc.text(
    consts.months[month],
    utils.pageWPercent(50),
    marginTop - pageMargin - 2,
    {
      align: "center",
    }
  );

  doc.setFontSize(10);

  // 7 Rows x 7 cols
  let currentDay = null;
  for (let r = 1; r <= 7; r++) {
    const cellY = y + cellH * r;

    // Draw the line at the bottom of the current row
    doc.line(x, cellY, x + w, cellY);

    // Stop after drawing the bottom line
    if (r == 7) {
      break;
    }

    for (let c = 0; c <= 7; c++) {
      const cellX = x + cellW * c;

      doc.line(cellX, cellY, cellX, cellY + cellH);

      // Stop after drawing the last line
      if (c == 7) {
        break;
      }

      // Put day abbreviations above the first row
      if (r == 1) {
        const ogFS = doc.getFontSize();
        const ogTC = doc.getTextColor();
        doc.setFontSize(9);
        doc.setTextColor(Colors.midLight);
        doc.text(consts.dayOfWeekAbbr[c], cellX + cellW / 2, cellY - 1, {
          align: "center",
        });
        doc.setFontSize(ogFS);
        doc.setTextColor(ogTC);
      }

      // Determine the text value for the cell
      // The date starts counting in the first row
      let cellText = "";
      if (r == 1 && c == firstDay) {
        currentDay = 1;
      }

      if (currentDay && currentDay <= lastDay) {
        cellText = `${currentDay}`;
        currentDay++;
      } else {
        continue;
      }

      // Get the page number for the detail page
      const targetDayDetailPage =
        pageIndex[`dayDetail${YEAR}${month}${cellText}`];

      const dims = doc.getTextDimensions(cellText);

      // Put the date in the top left
      doc.textWithLink(cellText, cellX + 1, cellY + dims.h + 0.5, {
        pageNumber: targetDayDetailPage,
      });
    }
  }
}

export function getCalYear(pageIndex: PageIndex): (doc: jsPDF) => void {
  return (doc: jsPDF) => {
    calYear(doc, pageIndex);
  };
}

// A page with a year long calendar
export function calYear(doc: jsPDF, pageIndex: PageIndex) {
  const cellWidth = availWidth / 3;
  const cellHeight = availHeight / 4;

  // Year header
  pageHeaderBox(doc);
  doc.setTextColor(Colors.text);
  doc.setFontSize(24);
  doc.text(`${YEAR}`, utils.pageWPercent(50), marginTop - pageMargin - 2, {
    align: "center",
  });

  doc.rect(pageMargin, marginTop, availWidth, availHeight);

  // 3 cols
  doc.line(
    pageMargin + cellWidth,
    marginTop,
    pageMargin + cellWidth,
    availHeight + marginTop
  );
  doc.line(
    pageMargin + cellWidth * 2,
    marginTop,
    pageMargin + cellWidth * 2,
    availHeight + marginTop
  );

  // 4 rows
  doc.line(
    pageMargin,
    marginTop + cellHeight,
    pageMargin + availWidth,
    marginTop + cellHeight
  );
  doc.line(
    pageMargin,
    marginTop + cellHeight * 2,
    pageMargin + availWidth,
    marginTop + cellHeight * 2
  );
  doc.line(
    pageMargin,
    marginTop + cellHeight * 3,
    pageMargin + availWidth,
    marginTop + cellHeight * 3
  );

  for (let idx = 0; idx < consts.months.length; idx++) {
    const rowOffset = Math.floor(idx / 3);
    const colOffset = idx % 3;
    drawMonthCell(
      doc,
      idx,
      pageIndex,
      colOffset * cellWidth + pageMargin,
      marginTop + cellHeight * rowOffset,
      cellWidth,
      cellHeight
    );
  }
}

export function getCalMonthDetail(
  year: string,
  month: number,
  pageIndex: PageIndex
): (doc: jsPDF) => void {
  return function (doc: jsPDF) {
    calMonthDetail(doc, pageIndex, year, month);
  };
}

// A single month
function calMonthDetail(
  doc: jsPDF,
  pageIndex: PageIndex,
  year: string,
  month: number
) {
  drawMonthDetail(
    doc,
    month,
    pageIndex,
    5,
    10,
    consts.Wmm - 10,
    consts.Hmm / 2
  );
}

export function getCalDayDetail(
  pageIndex: PageIndex,
  year: string,
  month: number,
  date: number
): (doc: jsPDF) => void {
  return function (doc: jsPDF) {
    calDayDetail(doc, pageIndex, year, month, date);
  };
}

// A single day
function calDayDetail(
  doc: jsPDF,
  pageIndex: PageIndex,
  year: string,
  month: number,
  date: number
) {
  // Set these before the calculations
  doc.setTextColor(Colors.text);
  doc.setFontSize(16);

  const d = new Date(parseInt(year), month, date);
  const dayName = d.toLocaleDateString("en-US", { weekday: "long" });

  const padding = 2;
  const dateStr = `${date}`;
  const monthStr = consts.months[month];
  const yearStr = `${YEAR}`;
  const dayWidth = doc.getTextWidth(dayName);
  const monthWidth = doc.getTextWidth(monthStr);
  const dateWidth = doc.getTextWidth(dateStr);
  const yearWidth = doc.getTextWidth(yearStr);
  const totalWidth =
    padding * 3 + dayWidth + monthWidth + dateWidth + yearWidth;
  const firstPosX = (consts.Wmm - totalWidth) / 2;

  pageHeaderBox(doc);

  let y = marginTop - pageMargin - 3;
  let x = firstPosX;
  doc.text(dayName, x, y);
  x += padding + dayWidth;

  // Link month
  doc.textWithLink(monthStr, x, y, {
    pageNumber: pageIndex[`monthDetail${year}${month}`]
  });
  x += padding + monthWidth;

  doc.text(dateStr, x, y);
  x += padding + dateWidth;

  // Link year
  doc.textWithLink(yearStr, x, y, {
    pageNumber: pageIndex.calYearCurrent
  });
}

// Text in a rounded rect
function bubbleText(doc: jsPDF, text: string, x: number, y: number) {
  const tSize = doc.getTextDimensions(text);
  const rX = x - tSize.w / 2;
  const rY = y;
  doc.roundedRect(
    rX - 1,
    rY - tSize.h,
    tSize.w + 2,
    tSize.h + 2,
    1.5,
    1.5,
    "F"
  );

  doc.text(text, rX, rY);
}

// Dotted grid
// Rect's are smaller filesizes that cirlces for
// reasons I've yet to uncover
export function grid(doc: jsPDF) {
  doc.setFontSize(16);

  doc.setFillColor(Colors.darkest);
  const dia = 0.25;
  const pad = 4.9;
  const cols = Math.round((consts.Wmm - pad) / pad);
  const rows = Math.round((consts.Hmm - pad) / pad);

  for (let x = 1; x <= cols; x++) {
    for (let y = 1; y <= rows; y++) {
      const thisX = x * pad;
      const thisY = y * pad;
      // doc.circle(thisX, thisY, dia, "F");
      doc.rect(thisX, thisY, dia, dia, "F");
    }
  }

  doc.setFillColor(Colors.midDark);
  // bubbleText(doc, "FooBar", consts.Wmm / 2, 12);
}
