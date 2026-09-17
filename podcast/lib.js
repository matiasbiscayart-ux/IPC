const d = require('docx');
const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
        AlignmentType, HeadingLevel, BorderStyle, VerticalAlign } = d;

const NAVY='1F3864', ACC='2E75B6', LIGHT='D9E2F3', GREY='F2F2F2',
      GREEN='E2EFDA', WARN='FFF2CC', ORANGE='F8CBAD', BLUE='BDD7EE', MUT='595959';
const W = 9600;                 // ancho util A4 vertical (margenes 2 cm)
const FONT = 'Calibri';

const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const cellBorder = { style: BorderStyle.SINGLE, size: 2, color: 'BFBFBF' };
const B4 = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
const NOB = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function run(text, o = {}) {
  return new TextRun({ text: String(text), font: FONT, size: o.size || 18,
    bold: !!o.bold, italics: !!o.italics, color: o.color || '000000' });
}
function p(text, o = {}) {
  const runs = Array.isArray(text) ? text : [run(text, o)];
  return new Paragraph({
    children: runs, alignment: o.align || AlignmentType.LEFT,
    spacing: { before: o.before ?? 0, after: o.after ?? 60, line: o.line || 240 },
    indent: o.indent, keepNext: !!o.keepNext,
    border: o.rule ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 6 } } : undefined,
  });
}
function h1(text) {
  return new Paragraph({
    children: [run(text, { size: 30, bold: true, color: NAVY })],
    heading: HeadingLevel.HEADING_1, spacing: { before: 380, after: 170 }, keepNext: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: NAVY, space: 6 } },
  });
}
function h2(text) {
  return new Paragraph({
    children: [run(text, { size: 23, bold: true, color: ACC })],
    heading: HeadingLevel.HEADING_2, spacing: { before: 260, after: 110 }, keepNext: true });
}
function h3(text) {
  return new Paragraph({
    children: [run(text, { size: 20, bold: true, color: '333333' })],
    heading: HeadingLevel.HEADING_3, spacing: { before: 180, after: 80 }, keepNext: true });
}
function note(text) { return p(text, { size: 16, italics: true, color: MUT, after: 100 }); }
function spacer(h = 100) { return new Paragraph({ children: [], spacing: { after: h } }); }
function bullet(text, o = {}) {
  return new Paragraph({ children: [run(text, { size: o.size || 18 })],
    bullet: { level: o.level || 0 }, spacing: { after: 50 } });
}

function cell(content, o = {}) {
  const kids = Array.isArray(content) ? content : [
    new Paragraph({
      children: (Array.isArray(content) ? content : [run(content, {
        size: o.size || 16, bold: o.bold, italics: o.italics,
        color: o.color || (o.head ? 'FFFFFF' : '000000') })]),
      alignment: o.align || AlignmentType.LEFT,
      spacing: { before: 30, after: 30, line: 230 } })];
  return new TableCell({
    children: kids,
    width: { size: o.w, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: { top: 40, bottom: 40, left: 90, right: 90 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: o.span, borders: o.noBorders ? NOB : B4,
  });
}

/** rows: [[c,c,...],...]; primera fila = encabezado */
function table(widths, rows, o = {}) {
  const trs = rows.map((r, i) => {
    const head = i === 0 && o.header !== false;
    return new TableRow({
      tableHeader: head, cantSplit: true,
      children: r.map((c, j) => {
        const spec = (c && typeof c === 'object' && !Array.isArray(c)) ? c : { t: c };
        const isTot = spec.total || (o.totalRows || []).includes(i);
        if (spec.kids) return new TableCell({
          children: spec.kids,
          width: { size: widths[j], type: WidthType.DXA },
          shading: spec.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: spec.fill } : undefined,
          margins: { top: 40, bottom: 40, left: 90, right: 90 },
          verticalAlign: VerticalAlign.CENTER,
          borders: o.noBorders ? NOB : B4,
        });
        return cell(spec.t ?? '', {
          noBorders: o.noBorders,
          w: widths[j], head,
          fill: head ? ACC : (spec.fill || (isTot ? LIGHT : (i % 2 === 0 && o.zebra ? GREY : undefined))),
          bold: head || isTot || spec.bold,
          italics: spec.italics,
          color: spec.color,
          size: spec.size || (head ? 16 : (o.size || 16)),
          align: spec.align || ((o.numCols || []).includes(j) ? AlignmentType.CENTER : undefined),
        });
      }) });
  });
  return new Table({ columnWidths: widths, rows: trs,
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA } });
}

module.exports = { d, Paragraph, TextRun, AlignmentType, WidthType, ShadingType, BorderStyle,
  NAVY, ACC, LIGHT, GREY, GREEN, WARN, ORANGE, BLUE, MUT, W, FONT,
  run, p, h1, h2, h3, note, spacer, bullet, cell, table };
