const fs = require('fs');
const d = require('docx');
const { Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType, BorderStyle,
        Tab, TabStopType, LeaderType } = d;

const ANCHO = 9066;   // ancho util en twips: A4 menos los margenes laterales

const NAVY = '163989', MUT = '5A6475', FONT = 'Calibri';
const usd = n => 'USD ' + n.toLocaleString('es-AR');

const r = (t, o = {}) => new TextRun({ text: String(t), font: FONT, size: o.size || 21,
  bold: !!o.bold, italics: !!o.italics, color: o.color || '1A1A1A' });

const P = (t, o = {}) => new Paragraph({
  children: Array.isArray(t) ? t : [r(t, o)],
  alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 180, line: o.line || 300 },
});

/* renglon con guia de puntos y el monto alineado a la derecha, sin tabla */
const linea = (concepto, monto, o = {}) => new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: ANCHO,
               leader: o.bold ? LeaderType.NONE : LeaderType.DOT }],
  children: [
    r(concepto, { size: 21, bold: o.bold }),
    new TextRun({ children: [new Tab()] }),
    r(monto, { size: 21, bold: o.bold, color: o.bold ? NAVY : '1A1A1A' }),
  ],
  spacing: { before: o.before || 0, after: o.after ?? 130, line: 300 },
});

const K = [];

/* membrete */
K.push(new Paragraph({
  children: [new ImageRun({ data: fs.readFileSync(__dirname + '/assets/logo-fhc.png'),
    type: 'png', transformation: { width: 76, height: 76 } })],
  spacing: { after: 140 } }));

K.push(new Paragraph({
  children: [r('Podcast del Friedman Hayek Center', { size: 34, bold: true, color: NAVY })],
  spacing: { after: 60 } }));
K.push(new Paragraph({
  children: [r('Propuesta y presupuesto  ·  Temporada 1', { size: 19, color: MUT })],
  spacing: { after: 40 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: NAVY, space: 8 } } }));
K.push(new Paragraph({ children: [], spacing: { after: 260 } }));

/* el parrafo */
K.push(P('Queremos hacer un programa de entrevistas del Center: una conversación en profundidad con un invitado por episodio, de entre 45 y 60 minutos, grabada en video en un set fijo montado en la sala de la oficina y publicada en YouTube y en Spotify. Arrancaríamos con la primera grabación el jueves 22 de octubre de 2026 y el primer episodio saldría el jueves 5 de noviembre, para después publicar uno cada veinte días hasta completar doce episodios el 14 de junio de 2027. Cada grabación se hace entre nueve y trece días antes de la fecha de publicación, siempre un martes, miércoles o jueves, de modo que siempre haya más de una semana de margen para editar sin que se caiga la fecha. Los invitados los conseguimos nosotros y la idea es que vengan de rubros distintos —economía, derecho, empresa, tecnología, historia, periodismo y filosofía—, sin necesidad de que coincidan entre sí: de hecho queremos que al menos uno no comparta la posición del Center, porque cada episodio dedica un bloque a la objeción más fuerte a lo que el invitado sostiene, y eso es lo que separa una entrevista de un comunicado. La producción queda en manos del equipo que ya está, con unas veinte horas de trabajo interno por episodio repartidas entre los cuatro, y contratamos por afuera solamente la edición, que es lo que garantiza que la cadencia se sostenga. De cada grabación salen además unos cinco a siete clips para redes, un envío de newsletter y la transcripción para la web, y los contactos de los invitados y la audiencia nueva entran a la base del Center.',
  { after: 300 }));

/* presupuesto */
K.push(new Paragraph({
  children: [r('Presupuesto', { size: 26, bold: true, color: NAVY })],
  spacing: { before: 120, after: 120 }, keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 6 } } }));

K.push(P('Los montos están en dólares porque los equipos se cotizan en esa moneda y así el presupuesto no se desactualiza entre que se presenta y se aprueba. Son estimaciones de referencia para dimensionar el proyecto: antes de aprobar hay que pedir tres cotizaciones por rubro.',
  { size: 19, after: 240 }));

K.push(linea('Equipamiento y set', usd(9030)));
K.push(linea('Operación de los doce episodios', usd(3096)));
K.push(linea('Marca, dominio y música con licencia', usd(270)));
K.push(linea('Contingencia', usd(1240)));
K.push(linea('Pauta paga en seis episodios', usd(660)));
K.push(new Paragraph({ children: [], spacing: { after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 6 } } }));
K.push(linea('Total a solicitar', usd(14296), { bold: true, before: 100, after: 280 }));

K.push(P('El equipamiento es la mayor parte del pedido y se paga una sola vez: cámaras, micrófonos, luces, tratamiento acústico, mobiliario del set y equipo de edición. Queda como activo de la casa y sirve además para grabar los seminarios y transmitir eventos, así que el costo se reparte entre varias actividades del Center. La operación de los doce episodios son doscientos cincuenta y ocho dólares por episodio, que cubren la edición, la transcripción, el catering, el traslado del invitado, un regalo institucional y el hosting. Eso significa que a partir de la segunda temporada el podcast cuesta esos doscientos cincuenta y ocho dólares por episodio y nada más.'));

K.push(P('La idea es financiarlo con un sponsor principal que cubra el equipamiento, dos sponsors de apoyo que cubran la operación y un aporte del Center para la contingencia. Ningún sponsor tendría injerencia sobre el contenido, la selección de invitados ni la edición, y conviene que esa cláusula quede escrita en el acuerdo.'));

K.push(P('Antes de aprobar quedan tres cosas por definir: quién conduce, que es lo que condiciona el resto porque si tiene que ser alguien externo se suman entre ciento cincuenta y trescientos dólares por episodio que hoy no están en el número; si la sala queda asignada de forma permanente, porque armar y desarmar el set cuesta tres horas cada vez; y las cotizaciones, verificando primero qué equipamiento ya tiene UCEMA y es reutilizable, porque eso baja el total de forma directa.',
  { after: 0 }));

const doc = new Document({
  creator: 'UCEMA — Friedman Hayek Center',
  title: 'Podcast del Friedman Hayek Center — Propuesta y presupuesto',
  styles: { default: { document: { run: { font: FONT, size: 21 } } } },
  sections: [{
    properties: { page: { margin: { top: 1250, bottom: 1250, left: 1420, right: 1420 } } },
    children: K,
  }],
});
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(__dirname + '/0-Podcast-FHC-Resumen.docx', b);
  console.log('OK', (b.length/1024).toFixed(0)+' KB');
});
