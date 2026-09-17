const fs = require('fs');
const L = require('./lib.js');
const d = L.d;
const { Document, Packer, Paragraph, AlignmentType, TextRun, ImageRun } = d;
const { p, run, table, NAVY, ACC, LIGHT, GREY, GREEN, WARN, MUT } = L;

const usd = n => 'USD ' + n.toLocaleString('es-AR');
const kids = [];

/* ── Encabezado con el logo ── */
const LOGO = __dirname + '/assets/logo-fhc.png';   // si existe, se usa el logo real
const hayLogo = fs.existsSync(LOGO);
kids.push(table([1250, 8350], [[
  hayLogo
    ? { t: '', kids: [new Paragraph({
        children: [new ImageRun({ data: fs.readFileSync(LOGO), type: 'png',
          transformation: { width: 58, height: 58 } })],
        alignment: AlignmentType.CENTER })] }
    : { t: 'FH', fill: NAVY, color: 'FFFFFF', bold: true, size: 40, align: AlignmentType.CENTER },
  { t: '', kids: [
      new Paragraph({ children: [run('FRIEDMAN HAYEK CENTER', { size: 22, bold: true, color: NAVY })],
        spacing: { before: 60, after: 0 } }),
      new Paragraph({ children: [run('UCEMA', { size: 16, color: MUT })], spacing: { after: 40 } }),
  ] },
]], { header: false, noBorders: true }));

kids.push(new Paragraph({
  children: [run('PODCAST FHC', { size: 44, bold: true, color: NAVY })],
  spacing: { before: 260, after: 20 },
  border: { bottom: { style: d.BorderStyle.SINGLE, size: 12, color: ACC, space: 6 } } }));
kids.push(p([run('Resumen del proyecto y presupuesto  ·  Temporada 1  ·  noviembre 2026 – junio 2027',
  { size: 19, color: MUT })], { after: 220 }));

/* ── La idea ── */
kids.push(p([run('LA IDEA', { size: 19, bold: true, color: ACC })], { after: 70 }));
kids.push(p('Una entrevista en profundidad cada 20 días, de 45 a 60 minutos, grabada en video en un set fijo en la oficina. Invitados que piensan la libertad desde lugares distintos: economía, derecho, empresa, tecnología, historia, periodismo y filosofía. Se publica en YouTube y en Spotify, y cada episodio alimenta redes, newsletter y la base de contactos del Center.',
  { size: 19, line: 280, after: 200 }));

/* ── Los números del formato ── */
kids.push(table([2400, 2400, 2400, 2400], [
  [{ t: '12', size: 30, bold: true, align: AlignmentType.CENTER, fill: LIGHT },
   { t: '20', size: 30, bold: true, align: AlignmentType.CENTER, fill: LIGHT },
   { t: '45-60', size: 30, bold: true, align: AlignmentType.CENTER, fill: LIGHT },
   { t: '108', size: 30, bold: true, align: AlignmentType.CENTER, fill: LIGHT }],
  [{ t: 'episodios', size: 15, align: AlignmentType.CENTER },
   { t: 'días entre cada uno', size: 15, align: AlignmentType.CENTER },
   { t: 'minutos por episodio', size: 15, align: AlignmentType.CENTER },
   { t: 'piezas publicadas', size: 15, align: AlignmentType.CENTER }],
], { header: false }));
kids.push(p('', { after: 200 }));

/* ── A quién y qué se entrega ── */
kids.push(table([2100, 7500], [
  [{ t: 'A QUIÉN', fill: LIGHT, bold: true, size: 15 },
   { t: 'Estudiantes universitarios, profesionales jóvenes, emprendedores y la comunidad de ideas de la libertad en español. Alumni del Center, donantes y prensa.', size: 17 }],
  [{ t: 'QUÉ SE ENTREGA', fill: LIGHT, bold: true, size: 15 },
   { t: 'Por episodio: 1 video, 1 audio, 5 a 7 clips para redes, 1 carrusel, 1 envío de newsletter y 1 transcripción.', size: 17 }],
  [{ t: 'DÓNDE', fill: LIGHT, bold: true, size: 15 },
   { t: 'Set fijo montado en la sala de la oficina. El equipamiento queda disponible para grabar seminarios y transmitir eventos.', size: 17 }],
], { header: false }));
kids.push(p('', { after: 240 }));

/* ── Presupuesto ── */
kids.push(p([run('PRESUPUESTO', { size: 19, bold: true, color: ACC })], { after: 70 }));
kids.push(table([5400, 2000, 2200], [
  ['Concepto', 'Monto', 'Qué es'],
  ['Equipamiento y set', { t: usd(9030), align: AlignmentType.CENTER }, { t: 'Una sola vez', size: 15 }],
  ['Operación de los 12 episodios', { t: usd(3096), align: AlignmentType.CENTER }, { t: usd(258) + ' por ep.', size: 15 }],
  ['Marca, dominio y música con licencia', { t: usd(270), align: AlignmentType.CENTER }, { t: 'Una sola vez', size: 15 }],
  ['Contingencia (10%)', { t: usd(1240), align: AlignmentType.CENTER }, { t: '', size: 15 }],
  ['Pauta paga en 6 episodios', { t: usd(660), align: AlignmentType.CENTER }, { t: 'Opcional', size: 15 }],
  [{ t: 'TOTAL A SOLICITAR', bold: true, fill: GREEN },
   { t: usd(14296), align: AlignmentType.CENTER, bold: true, size: 22, fill: GREEN },
   { t: 'Temporada 1', size: 15, fill: GREEN }],
], { zebra: true }));

kids.push(p('', { after: 160 }));
kids.push(table([9600], [[{
  t: 'El 63% del total es equipamiento que queda en la casa y no se vuelve a pagar. A partir de la Temporada 2 el podcast cuesta USD 258 por episodio.',
  fill: WARN, bold: true, size: 18, align: AlignmentType.CENTER }]], { header: false }));

/* ── Para arrancar ── */
kids.push(p('', { after: 200 }));
kids.push(p([run('PARA ARRANCAR', { size: 19, bold: true, color: ACC })], { after: 70 }));
kids.push(table([3200, 6400], [
  [{ t: 'Definir quién conduce', bold: true, size: 17 },
   { t: 'Es la decisión que condiciona el resto. Si es externo, suma entre USD 150 y 300 por episodio.', size: 17 }],
  [{ t: 'Confirmar la sala', bold: true, size: 17 },
   { t: 'Idealmente asignada de forma permanente: armar y desarmar el set cuesta 3 horas por episodio.', size: 17 }],
  [{ t: 'Cotizar el equipamiento', bold: true, size: 17 },
   { t: 'Tres cotizaciones por rubro. Los montos de esta hoja son estimaciones de referencia.', size: 17 }],
], { header: false, zebra: true }));

kids.push(p('', { after: 120 }));
kids.push(p([run('Detalle completo en los documentos 1 (proyecto), 2 (presupuesto) y 3 (flujo de producción).',
  { size: 15, italics: true, color: MUT })], { align: AlignmentType.CENTER }));

const doc = new Document({
  creator: 'Friedman Hayek Center — UCEMA',
  title: 'Podcast FHC — Resumen',
  styles: { default: { document: { run: { font: 'Calibri', size: 18 } } } },
  sections: [{
    properties: { page: { margin: { top: 900, bottom: 700, left: 1134, right: 1134 } } },
    children: kids,
  }],
});
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(__dirname + '/0-Podcast-FHC-Resumen.docx', b);
  console.log('OK 0-Podcast-FHC-Resumen.docx', (b.length/1024).toFixed(0)+' KB', hayLogo ? '(con logo)' : '(lockup tipografico)');
});
