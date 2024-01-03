import * as fs from 'fs';
import { jsPDF } from "jspdf";
import ImageDataURI from "image-data-uri";

const DPI = 226;
const pWmm = 157, pHmm = 210;
const pWpx = 1404, pHpx = 1872;
var doc = new jsPDF("p", "mm", [pWmm, pHmm]);

// TODO
// Configure fonts
// See https://github.com/parallax/jsPDF/tree/master/fontconverter
console.log(doc.getFontList());

// Utils
function pageWPercent(n) {
    return pWmm * (n/100);
}

function pageHPercent(n) {
    return pHmm * (n/100);
}

function ptToMM(pt) {
    return pt * .352778;
}

function numberPage(n) {
    let r = 2.5;
    let d = r * 2;
    let ogFill = doc.getFillColor();
    doc.setFillColor("#ffffff");
    doc.setDrawColor("#666666");
    doc.circle(pWmm - d, pHmm - d, r, "FD");
    let ogTS = doc.getFontSize();
    doc.setFontSize(8);
    doc.text(""+n, pWmm-d, pHmm-d, {"align": "center", "baseline": "middle"});
    doc.setFontSize(ogTS);
    doc.setFillColor(ogFill);
}

// Title Page
const imgData = await ImageDataURI.encodeFromFile("./static/cover-sheet-muted-opt.png");
doc.addImage(imgData, "PNG", 0, 0, pWmm, pHmm);
doc.setFont("helvetica", "bold");
doc.setFontSize(100);
doc.setTextColor("#3a3a3a");
doc.text("2024", pageWPercent(50), pageHPercent(75), {
    "align": "center",
});

// Credits
doc.addPage();
doc.setTextColor("#3a3a3a");
doc.setFontSize(8);
let textTop = pageHPercent(75);
doc.text("reMarkable Yearly Planner", pageWPercent(5), textTop);
textTop += ptToMM(12);
doc.text("by Lee", pageWPercent(5), textTop);

doc.setFontSize(6);
textTop = pageHPercent(80);
doc.text("Cover Photo from Unsplash", pageWPercent(5), textTop);
textTop += ptToMM(6);
doc.textWithLink("Massimiliano Morosinotto by therawhunter", pageWPercent(5), textTop, {
    url: "https://unsplash.com/photos/gray-mountain-during-daytime-photo-3i5PHVp1Fkw"
});

numberPage(2);

// Calendar
doc.addPage();
doc.setFontSize(16);
doc.text("Year Calendar Here", 10, 30);
numberPage(3);

// Index
doc.addPage();
doc.setFontSize(16);
doc.text("Index Here", 10, 30);
numberPage(4);

// Grid
doc.addPage();
doc.setFontSize(16);

doc.setFillColor("#aeaeae");
const dia = .15, pad = 4.9;
let cols = Math.floor((pWmm - pad) / pad);
let rows = Math.floor((pHmm - pad) / pad);

for (let x = 1; x <= cols; x++) {
    for (let y = 1; y <= rows; y++) {
        let thisX = x * pad; 
        let thisY = y * pad;
        doc.circle(thisX, thisY, dia, "F");
    }
}

let tSize = doc.getTextDimensions("Grid Example");
doc.setFillColor("#ddd");
let rX = pWmm / 2 - (tSize.w /2);
let rY = 12
doc.roundedRect(rX - 1, rY - tSize.h, tSize.w + 2, tSize.h + 2, 1.5, 1.5, "F");

doc.text("Grid Example", rX, rY);

numberPage(5);

// Double Height
doc.addPage([pWmm, pHmm * 2]);
doc.setFillColor("#ddd");
doc.roundedRect(rX - 1, rY - tSize.h, tSize.w + 2, tSize.h + 2, 1.5, 1.5, "F");

doc.text("Double High", rX, rY);
numberPage(6);


doc.save("jstest.pdf");