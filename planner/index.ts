import { jsPDF as JSPDF } from "jspdf";

import * as consts from "./lib/consts.js";
import * as utils from "./lib/utils.js";
import * as layouts from "./lib/layouts.js";
import { PlannerConfig, Page, PageIndex } from "./lib/types.js";

const PLANNER_OUTPUT_NAME="planner.pdf"

// TODO
// Configure fonts
// See https://github.com/parallax/jsPDF/tree/master/fontconverter
//console.log(doc.getFontList());
console.log("util width", utils.pageWPercent(50));

// TODO: This to support making this extensible
const plannerCfg: PlannerConfig = {
  year: "2024",
  includeYearCal: true,
  notePageCount: 0,
};

// Build the list of pages and index the pages we want to navigate to
function generatePageSet(cfg: PlannerConfig): [Page[], PageIndex] {
  const pages = [];
  const pageIndex: PageIndex = {};

  pages.push({ layout: layouts.cover, options: { year: cfg.year } });
  pageIndex.cover = 1;
  
  pages.push({ layout: layouts.credit });
  pageIndex.credit = 2;
  
  pages.push({ layout: layouts.getCalYear(pageIndex) });
  pageIndex.calYearCurrent = 3;

  let curPage = 4;
  for (let month = 0; month < 12; month++) {
    pages.push({
      layout: layouts.getCalMonthDetail(cfg.year, month, pageIndex),
    });
    pageIndex[`monthDetail${cfg.year}${month}`] = curPage;
    curPage++;

    for (let date = 1; date <= utils.daysInMonth(month, parseInt(cfg.year)); date++) {
      pages.push({
        layout: layouts.getCalDayDetail(cfg.year, month, date),
      });
      pageIndex[`dayDetail${cfg.year}${month}${date}`] = curPage;
      curPage++;

      for (let notes = 0; notes < cfg.notePageCount; notes++) {
        pages.push({
          layout: layouts.grid,
        });
      }
    }
  }
  // pages.push({ layout: layouts.grid });
  return [pages, pageIndex];
}

async function createPlanner(cfg: PlannerConfig) {
  const [pageSet, pageIndex] = generatePageSet(cfg);
  const doc = new JSPDF("p", "mm", [consts.Wmm, consts.Hmm], true);
  for (let pgNum=0; pgNum<pageSet.length; pgNum++) {
    const page = pageSet[pgNum]
    
    // The first page is created when the PDF is initialized
    // so only generate new pages after that.
    if (pgNum > 0) {
      doc.addPage();
    }
    await page.layout(doc, page.options ? page.options : null);
  }

  // All pages are in-place, now we need to update all links
  // for (let pgNum=0; pgNum<pageSet.length; pgNum++) {
  //   const page = pageSet[pgNum]
  //   if (!page.link) {
  //     continue;
  //   }
  //   await page.link(doc, pgNum, pageIndex);
  // }

  doc.save(PLANNER_OUTPUT_NAME);
}

await createPlanner(plannerCfg);
