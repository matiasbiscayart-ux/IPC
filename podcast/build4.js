const fs = require('fs');
const L = require('./lib.js');
const d = L.d;
const { Document, Packer, Paragraph, AlignmentType, TextRun, ImageRun, PageBreak,
        Footer, PageNumber, BorderStyle } = d;
const { run, table } = L;

/* paleta tomada del logo */
const NAVY = '163989', ACC = '2F5BB7', LIGHT = 'DDE4F3', SOFT = 'F0F3FA',
      WARM = 'FDF0D5', MUT = '5A6475', LINE = 'C9D3E8';

const usd = n => 'USD ' + n.toLocaleString('es-AR');
const K = [];

function P(txt, o = {}) {
  return new Paragraph({
    children: Array.isArray(txt) ? txt : [run(txt, { size: o.size || 19, bold: o.bold,
      italics: o.italics, color: o.color || '1A1A1A' })],
    alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 100, line: o.line || 280 },
  });
}
function H(n, txt) {
  const sizes = { 1: 26, 2: 20 };
  return new Paragraph({
    children: [run(txt, { size: sizes[n], bold: true, color: n === 1 ? NAVY : ACC })],
    spacing: { before: n === 1 ? 250 : 180, after: n === 1 ? 110 : 80 }, keepNext: true,
    border: n === 1 ? { bottom: { style: BorderStyle.SINGLE, size: 10, color: NAVY, space: 5 } } : undefined,
  });
}
const note = t => P(t, { size: 15, italics: true, color: MUT, after: 140 });

/* ═══════════ ENCABEZADO ═══════════ */
K.push(table([1500, 8100], [[
  { t: '', kids: [new Paragraph({
      children: [new ImageRun({ data: fs.readFileSync(__dirname + '/assets/logo-fhc.png'),
        type: 'png', transformation: { width: 92, height: 92 } })],
      spacing: { after: 0 } })] },
  { t: '', kids: [
      new Paragraph({ children: [run('PODCAST', { size: 58, bold: true, color: NAVY })],
        spacing: { before: 200, after: 0 } }),
      new Paragraph({ children: [run('Qué queremos hacer, cómo lo haríamos y cuánto pensamos gastar',
        { size: 19, color: MUT })], spacing: { after: 0 } }),
  ] },
]], { header: false, noBorders: true }));

K.push(new Paragraph({ children: [], spacing: { after: 60 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 14, color: NAVY, space: 4 } } }));
K.push(P([run('Temporada 1  ·  12 episodios  ·  noviembre 2026 – junio 2027', { size: 17, color: MUT })],
  { after: 260 }));

/* ═══════════ 1. LA IDEA ═══════════ */
K.push(H(1, '1.  La idea'));
K.push(P('Un programa de entrevistas del Center: una conversación en profundidad cada 20 días, de 45 a 60 minutos, grabada en video en un set fijo en la oficina y publicada en YouTube y Spotify.'));
K.push(P('Los invitados piensan la libertad desde lugares distintos —economía, derecho, empresa, tecnología, historia, periodismo, filosofía— y no hace falta que coincidan entre sí. La conversación es el producto: cada episodio dedica un bloque a la objeción más fuerte a lo que el invitado sostiene.'));
K.push(P('Hoy el Center produce contenido de alto valor que sucede una sola vez. El podcast es un formato recurrente, con cara visible, pensado desde el inicio para circular y para traer gente nueva a la base de contactos.', { after: 200 }));

K.push(table([2400, 2400, 2400, 2400], [
  [{ t: '12', size: 32, bold: true, align: AlignmentType.CENTER, fill: LIGHT, color: NAVY },
   { t: '20', size: 32, bold: true, align: AlignmentType.CENTER, fill: LIGHT, color: NAVY },
   { t: '45-60', size: 32, bold: true, align: AlignmentType.CENTER, fill: LIGHT, color: NAVY },
   { t: '108', size: 32, bold: true, align: AlignmentType.CENTER, fill: LIGHT, color: NAVY }],
  [{ t: 'episodios en la temporada', size: 14, align: AlignmentType.CENTER },
   { t: 'días entre episodios', size: 14, align: AlignmentType.CENTER },
   { t: 'minutos cada uno', size: 14, align: AlignmentType.CENTER },
   { t: 'piezas publicadas', size: 14, align: AlignmentType.CENTER }],
], { header: false }));

K.push(H(2, 'A quién le hablamos'));
K.push(table([2600, 7000], [
  ['Audiencia', 'Perfil'],
  ['Estudiantes universitarios', 'De 18 a 28 años, de universidades públicas y privadas de todo el país. Economía, Derecho, Negocios y Ciencia Política'],
  ['Profesionales jóvenes', 'De 25 a 40, sector privado, consultoría, finanzas y tecnología. Escuchan en audio, mientras viajan o entrenan'],
  ['Emprendedores y PyMEs', 'Dueños de negocios y fundadores, con o sin formación económica formal'],
  ['Comunidad de ideas en español', 'Argentina, Chile, Perú, Colombia, México, Uruguay y España. Es la que hace crecer los números'],
  ['Alumni y comunidad UCEMA', 'Ya están en la base. Son la audiencia de sostén'],
  ['Donantes, sponsors y prensa', 'Miran el proyecto para evaluar si el Center es un socio serio'],
], { zebra: true, size: 16, headFill: NAVY }));
K.push(note('Las cuatro primeras están mayormente fuera de la universidad y fuera de la base actual: son las audiencias de crecimiento.'));

/* ═══════════ 2. CÓMO LO HARÍAMOS ═══════════ */
K.push(H(1, '2.  Cómo lo haríamos'));

K.push(H(2, '2.1  Cómo es cada episodio'));
K.push(table([1400, 2600, 5600], [
  ['Minuto', 'Bloque', 'Qué pasa'],
  ['0:00 – 2:00', 'Apertura', 'El mejor fragmento de la charla, sacado en edición, y presentación del invitado'],
  ['2:00 – 15:00', 'La persona', 'Cómo llegó hasta acá. Trayectoria, no currículum'],
  ['15:00 – 40:00', 'La idea', 'El núcleo temático del episodio'],
  ['40:00 – 52:00', 'La objeción', 'El contraargumento más fuerte a su posición, puesto sin suavizar'],
  ['52:00 – 58:00', 'Cierre', 'Tres preguntas fijas que se repiten en los 12 episodios'],
  ['58:00 – 60:00', 'Llamado', 'Newsletter y próxima actividad del Center'],
], { zebra: true, size: 16, numCols: [0], headFill: NAVY }));
K.push(note('El bloque de la objeción es obligatorio: es lo que distingue una entrevista de un comunicado.'));

K.push(H(2, '2.2  A quién invitaríamos'));
K.push(P('Los nombres los pone el equipo. Estos son los doce temas y el tipo de perfil que busca cada uno.', { size: 17, after: 110 }));
K.push(table([600, 4100, 4900], [
  ['Ep.', 'Tema', 'Perfil del invitado'],
  ['1', 'Por qué la economía no es lo que te contaron', 'Economista de consultora o think tank con oficio en medios'],
  ['2', 'Emprender donde todo cambia', 'Fundador de PyME o scale-up que haya atravesado una crisis'],
  ['3', 'La ley como límite al poder', 'Constitucionalista, juez o profesor de Derecho Público'],
  ['4', 'De dónde venimos: las ideas de la libertad', 'Historiador de las ideas con libro publicado'],
  ['5', 'Qué hacer con lo que ganás', 'Portfolio manager, analista o fundador de fintech'],
  ['6', 'Decir lo que no conviene', 'Periodista o editor que haya pagado un costo por publicar algo'],
  ['7', 'Poder sin permiso: tecnología y cripto', 'Founder o CTO del ecosistema cripto o fintech'],
  ['8', 'Reformar el Estado desde adentro', 'Ex funcionario técnico o cuadro de gestión pública'],
  ['9', 'Aprender de otra manera', 'Director de colegio con modelo alternativo o fundador de edtech'],
  ['10', 'Las críticas más serias al liberalismo', 'Filósofo o académico que NO se identifique como liberal'],
  ['11', 'El país que exporta', 'Empresario agroexportador o especialista en comercio exterior'],
  ['12', 'Los que vienen', 'Alguien de menos de 30: emprendedor, líder estudiantil o alumni'],
], { zebra: true, size: 15, numCols: [0], headFill: NAVY }));
K.push(table([9600], [[{ t: 'Reglas de balance: máximo 3 economistas en los 12, mínimo 4 invitadas mujeres, al menos 3 menores de 40 y al menos 1 que no comparta la posición del Center. Chequeo reputacional obligatorio antes de confirmar.', fill: WARM, size: 16 }]], { header: false }));

K.push(H(2, '2.3  Dónde lo grabaríamos'));
K.push(P('Un set fijo montado en la sala de la oficina, con lo que ya hay más lo que haya que comprar. El sofá pasa a área de espera y el escritorio existente se reutiliza como mesa técnica. El panel de color es portátil, con pie: se arma y se guarda, no se pinta la pared.', { size: 17, after: 130 }));
const REND = __dirname + '/assets/set-plano-general.png';
if (fs.existsSync(REND)) {
  K.push(new Paragraph({
    children: [new ImageRun({ data: fs.readFileSync(REND), type: 'png',
      transformation: { width: 430, height: 242 } })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }));
  K.push(P([run('El set montado en la sala: butacas enfrentadas, fondo con biblioteca y panel, luz difusa y las tres cámaras en posición.', { size: 14, italics: true, color: MUT })],
    { align: AlignmentType.CENTER, after: 160 }));
}
K.push(table([2200, 7400], [
  ['Qué hace falta', 'Detalle'],
  ['Mobiliario', 'Dos butacas individuales, mesa ratona baja, estantería de fondo y ambientación'],
  ['Acústica', 'Paneles absorbentes, alfombra y cortinado. Es lo más barato con más impacto'],
  ['Video', 'Tres cámaras con trípode: plano general y un primer plano para cada uno'],
  ['Audio', 'Cuatro micrófonos dinámicos con brazo, consola multicanal y grabador de respaldo'],
  ['Luz', 'Dos paneles con softbox, una luz de recorte y una de fondo'],
  ['Posproducción', 'Equipo de edición, disco de archivo y software'],
], { zebra: true, size: 16, headFill: NAVY }));
K.push(note('Si hay que recortar, se recorta en video: un audio malo hace abandonar a los treinta segundos.'));

K.push(H(2, '2.4  Con qué ritmo'));
K.push(P('Se publica cada 20 días. La grabación va entre 9 y 13 días antes, siempre martes, miércoles o jueves. Ese colchón es lo que permite que una edición complicada no tire abajo la fecha.', { size: 17, after: 120 }));
K.push(table([1500, 3400, 4700], [
  ['Momento', 'Qué se hace', 'Quién'],
  ['D-20 a D-14', 'Confirmar invitado, cargar la actividad, pedir la sala y mandar la lista de seguridad', 'Frank · Matías'],
  ['D-12 a D-9', 'Investigación, guion de preguntas, instrucciones al invitado, catering y traslado', 'Frank · Matías'],
  ['D-8', 'Grabación y respaldo del material antes de desarmar el set', 'Matías'],
  ['D-7 a D-2', 'Edición, corrección, portada y clips', 'Editor · Paz'],
  ['D-1 y D0', 'Subida programada, newsletter y publicación', 'Matías · Martina'],
], { zebra: true, size: 16, headFill: NAVY }));

K.push(H(2, '2.5  Quién lo hace'));
K.push(table([2300, 2500, 4800], [
  ['Función', 'Quién', 'Horas por episodio'],
  ['Dirección editorial e invitados', 'Frank', '4 h — temas, invitación, guion y revisión del corte'],
  ['Diseño, clips y difusión', 'Paz', '6 h — portada, clips, carrusel y redes'],
  ['Producción y grabación', 'Matías', '7 h — sala, set, grabación, respaldo y publicación'],
  ['Web, envíos y base de datos', 'Martina', '3 h — transcripción, Perfit y Base Maestra'],
  ['Edición', 'Freelance', 'Contratado por episodio'],
], { zebra: true, size: 16, headFill: NAVY }));
K.push(note('20 horas internas por episodio, unas 240 en la temporada: alrededor de 7 horas semanales repartidas entre cuatro personas.'));

/* ═══════════ 3. CUÁNTO GASTARÍAMOS ═══════════ */
K.push(H(1, '3.  Cuánto pensamos gastar'));
K.push(P('Los montos están en dólares porque los equipos se cotizan en esa moneda y así el presupuesto no se desactualiza entre que se presenta y se aprueba. Son estimaciones de referencia para dimensionar: antes de aprobar se piden tres cotizaciones por rubro.', { size: 17, after: 160 }));

K.push(table([4900, 1900, 2800], [
  ['Concepto', 'Monto', 'Qué es'],
  ['Equipamiento y set', { t: usd(9030), align: AlignmentType.CENTER }, 'Una sola vez. Queda como activo'],
  ['Operación de los 12 episodios', { t: usd(3096), align: AlignmentType.CENTER }, usd(258) + ' por episodio'],
  ['Marca, dominio y música con licencia', { t: usd(270), align: AlignmentType.CENTER }, 'Una sola vez'],
  ['Contingencia (10%)', { t: usd(1240), align: AlignmentType.CENTER }, ''],
  ['Pauta paga en 6 episodios', { t: usd(660), align: AlignmentType.CENTER }, 'Opcional, desde el episodio 4'],
  [{ t: 'TOTAL A SOLICITAR', bold: true, fill: LIGHT },
   { t: usd(14296), align: AlignmentType.CENTER, bold: true, size: 24, fill: LIGHT, color: NAVY },
   { t: 'Temporada 1 completa', fill: LIGHT, bold: true }],
], { zebra: true, size: 17, headFill: NAVY }));

K.push(new Paragraph({ children: [], spacing: { after: 120 } }));
K.push(table([9600], [[{ t: 'El 63% del total es equipamiento que queda en la casa y sirve además para grabar seminarios y transmitir eventos. A partir de la Temporada 2 el podcast cuesta USD 258 por episodio.', fill: WARM, bold: true, size: 18, align: AlignmentType.CENTER }]], { header: false }));

K.push(H(2, '3.1  En qué se va el equipamiento'));
K.push(table([3000, 1500, 5100], [
  ['Rubro', 'Monto', 'Por qué'],
  ['Video', { t: usd(2775), align: AlignmentType.CENTER }, 'Tres cámaras permiten cortar entre planos sin saltos y salvar el episodio si una falla'],
  ['Audio', { t: usd(1960), align: AlignmentType.CENTER }, 'Es lo que decide si alguien se queda o abandona. Incluye respaldo por si falla la consola'],
  ['Mobiliario y ambientación', { t: usd(1750), align: AlignmentType.CENTER }, 'Butacas, mesa, estantería y ambientación: el fondo es lo que separa un set de una oficina'],
  ['Posproducción', { t: usd(1295), align: AlignmentType.CENTER }, 'Equipo de edición y archivo. Cada episodio genera entre 80 y 120 GB'],
  ['Iluminación', { t: usd(750), align: AlignmentType.CENTER }, 'Luz difusa para cada participante y separación del fondo'],
  ['Acústica', { t: usd(500), align: AlignmentType.CENTER }, 'Paneles, alfombra y cortinado contra el eco de la sala'],
  [{ t: 'Total equipamiento', bold: true }, { t: usd(9030), align: AlignmentType.CENTER, bold: true }, ''],
], { zebra: true, size: 15, totalRows: [7], headFill: NAVY }));

K.push(H(2, '3.2  Cómo se financiaría'));
K.push(table([3400, 1700, 1100, 3400], [
  ['Fuente', 'Monto', '%', 'Qué recibe'],
  ['Sponsor principal', { t: usd(9000), align: AlignmentType.CENTER }, { t: '63%', align: AlignmentType.CENTER }, 'Mención en los 12 episodios, logo en portada y set, mención en las 12 newsletters'],
  ['Dos sponsors de apoyo', { t: usd(4000), align: AlignmentType.CENTER }, { t: '28%', align: AlignmentType.CENTER }, 'Mención al cierre de 6 episodios y logo en sus piezas'],
  ['Aporte del Center', { t: usd(1296), align: AlignmentType.CENTER }, { t: '9%', align: AlignmentType.CENTER }, 'Contingencia y gastos institucionales'],
  [{ t: 'Total', bold: true }, { t: usd(14296), align: AlignmentType.CENTER, bold: true }, { t: '100%', align: AlignmentType.CENTER, bold: true }, ''],
], { zebra: true, size: 15, totalRows: [4], headFill: NAVY }));
K.push(table([9600], [[{ t: 'Ningún sponsor tiene injerencia sobre el contenido, la selección de invitados ni la edición. La cláusula va escrita en el acuerdo.', fill: SOFT, size: 16, italics: true }]], { header: false }));

/* ═══════════ 4. PARA ARRANCAR ═══════════ */
K.push(H(1, '4.  Para arrancar'));
K.push(H(2, 'Primeras fechas'));
K.push(table([2400, 2400, 2400, 2400], [
  [{ t: 'Jue 22/10/26', align: AlignmentType.CENTER, bold: true, fill: LIGHT, color: NAVY },
   { t: 'Jue 05/11/26', align: AlignmentType.CENTER, bold: true, fill: LIGHT, color: NAVY },
   { t: 'Mié 25/11/26', align: AlignmentType.CENTER, bold: true, fill: LIGHT, color: NAVY },
   { t: 'Lun 14/06/27', align: AlignmentType.CENTER, bold: true, fill: LIGHT, color: NAVY }],
  [{ t: 'Grabación del 1º', size: 14, align: AlignmentType.CENTER },
   { t: 'Sale el 1º', size: 14, align: AlignmentType.CENTER },
   { t: 'Sale el 2º', size: 14, align: AlignmentType.CENTER },
   { t: 'Sale el 12º', size: 14, align: AlignmentType.CENTER }],
], { header: false }));
K.push(note('El episodio 2 sale un día antes de las Jornadas Adam Smith y funciona de antesala. Los de enero se graban anticipados en diciembre.'));

K.push(H(2, 'Tres decisiones antes de aprobar'));
K.push(table([700, 3000, 5900], [
  [{ t: '1', align: AlignmentType.CENTER, bold: true, fill: LIGHT, color: NAVY }, { t: 'Quién conduce', bold: true },
   'Es lo que condiciona el resto. Si tiene que ser externo, suma entre USD 150 y 300 por episodio, que hoy no está en el número'],
  [{ t: '2', align: AlignmentType.CENTER, bold: true, fill: LIGHT, color: NAVY }, { t: 'La sala', bold: true },
   'Idealmente asignada de forma permanente: armar y desarmar el set cuesta 3 horas por episodio, 36 en la temporada'],
  [{ t: '3', align: AlignmentType.CENTER, bold: true, fill: LIGHT, color: NAVY }, { t: 'Las cotizaciones', bold: true },
   'Tres por rubro. Y verificar qué equipamiento ya tiene UCEMA y es reutilizable: baja el total de forma directa'],
], { header: false, size: 16 }));

K.push(new Paragraph({ children: [], spacing: { after: 100 } }));
K.push(P([run('El detalle completo está en los documentos de proyecto, presupuesto y flujo de producción.', { size: 14, italics: true, color: MUT })],
  { align: AlignmentType.CENTER }));

const doc = new Document({
  creator: 'UCEMA — Friedman Hayek Center',
  title: 'Podcast — Friedman Hayek Center',
  styles: { default: { document: { run: { font: 'Calibri', size: 19 } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 900, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({
      children: [run('UCEMA · Friedman Hayek Center — Podcast     ', { size: 13, color: MUT }),
                 new TextRun({ children: [PageNumber.CURRENT], size: 13, color: MUT, font: 'Calibri' })],
      alignment: AlignmentType.RIGHT })] }) },
    children: K,
  }],
});
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(__dirname + '/0-Podcast-FHC-Resumen.docx', b);
  console.log('OK 0-Podcast-FHC-Resumen.docx', (b.length/1024).toFixed(0)+' KB');
});
