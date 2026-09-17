const fs = require('fs');
const L = require('./lib.js');
const d = L.d;
const { Document, Packer, Paragraph, ImageRun, AlignmentType, PageOrientation,
        HeadingLevel, TextRun, PageBreak, Footer, PageNumber } = d;
const { p, h1, h2, h3, note, spacer, table, run, cell, W,
        NAVY, ACC, LIGHT, GREY, GREEN, WARN, ORANGE, BLUE, MUT } = L;

/* ─────────────────────────── CALENDARIO ─────────────────────────── */
const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = [
  { n: 'OCTUBRE 2026',   first: 3, days: 31, ev: { 22: ['G', 'E01'], 29: ['F', 'Ayn Rand'] } },
  { n: 'NOVIEMBRE 2026', first: 6, days: 30, ev: { 5: ['P', 'E01'], 12: ['G', 'E02'], 25: ['P', 'E02'], 26: ['F', 'A. Smith'] } },
  { n: 'DICIEMBRE 2026', first: 1, days: 31, ev: { 2: ['G', 'E03'], 15: ['P', 'E03'], 17: ['G', 'E04+E05'] } },
  { n: 'ENERO 2027',     first: 4, days: 31, ev: { 4: ['P', 'E04'], 25: ['P', 'E05'] } },
  { n: 'FEBRERO 2027',   first: 0, days: 28, ev: { 3: ['G', 'E06'], 15: ['P', 'E06'], 24: ['G', 'E07'] } },
  { n: 'MARZO 2027',     first: 0, days: 31, ev: { 5: ['P', 'E07'], 17: ['G', 'E08'], 30: ['P', 'E08'] } },
  { n: 'ABRIL 2027',     first: 3, days: 30, ev: { 1: ['G', 'E09'], 14: ['P', 'E09'], 21: ['G', 'E10'] } },
  { n: 'MAYO 2027',      first: 5, days: 31, ev: { 4: ['P', 'E10'], 12: ['G', 'E11'], 24: ['P', 'E11'] } },
  { n: 'JUNIO 2027',     first: 1, days: 30, ev: { 2: ['G', 'E12'], 14: ['P', 'E12'] } },
];
const FILL = { G: ORANGE, P: BLUE, F: GREEN };
const CW = Math.floor(W / 7);
const CWS = Array(7).fill(CW);

function mesTabla(m) {
  const rows = [];
  rows.push(DOW.map(x => ({ t: x, align: AlignmentType.CENTER })));
  let day = 1 - m.first;
  while (day <= m.days) {
    const r = [];
    for (let i = 0; i < 7; i++, day++) {
      if (day < 1 || day > m.days) { r.push({ t: '', fill: 'FFFFFF' }); continue; }
      const e = m.ev[day];
      const weekend = i >= 5;
      const kids = [new Paragraph({
        children: [run(String(day), { size: 17, bold: !!e, color: e ? '000000' : (weekend ? '9A9A9A' : '000000') })],
        alignment: AlignmentType.CENTER, spacing: { before: 20, after: e ? 0 : 20 } })];
      if (e) kids.push(new Paragraph({
        children: [run(e[0] === 'F' ? e[1] : `${e[0]} ${e[1]}`, { size: 13, bold: true, color: '1F3864' })],
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 20 } }));
      r.push({ t: '', fill: e ? FILL[e[0]] : (weekend ? GREY : 'FFFFFF'), kids });
    }
    rows.push(r);
  }
  const trs = rows.map((r, i) => new d.TableRow({
    tableHeader: i === 0, cantSplit: true,
    children: r.map((c, j) => new d.TableCell({
      children: c.kids || [new Paragraph({
        children: [run(c.t, { size: 15, bold: i === 0, color: i === 0 ? 'FFFFFF' : '000000' })],
        alignment: AlignmentType.CENTER, spacing: { before: 30, after: 30 } })],
      width: { size: CWS[j], type: d.WidthType.DXA },
      shading: { type: d.ShadingType.CLEAR, color: 'auto', fill: i === 0 ? ACC : (c.fill || 'FFFFFF') },
      margins: { top: 20, bottom: 20, left: 40, right: 40 },
      verticalAlign: d.VerticalAlign.CENTER,
      borders: { top: { style: d.BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
                 bottom: { style: d.BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
                 left: { style: d.BorderStyle.SINGLE, size: 2, color: 'BFBFBF' },
                 right: { style: d.BorderStyle.SINGLE, size: 2, color: 'BFBFBF' } },
    })) }));
  return [
    new Paragraph({ children: [run(m.n, { size: 19, bold: true, color: NAVY })],
      spacing: { before: 200, after: 70 }, keepNext: true }),
    new d.Table({ columnWidths: CWS, rows: trs, width: { size: W, type: d.WidthType.DXA } }),
  ];
}

/* ─────────────────────────── CONTENIDO ─────────────────────────── */
const kids = [];

// Portada
kids.push(
  new Paragraph({ children: [], spacing: { after: 1400 } }),
  new Paragraph({ children: [run('PODCAST', { size: 64, bold: true, color: NAVY })],
    alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
  new Paragraph({ children: [run('FRIEDMAN HAYEK CENTER', { size: 30, bold: true, color: ACC })],
    alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
  new Paragraph({ children: [run('Proyecto y armado', { size: 34, color: '333333' })],
    alignment: AlignmentType.CENTER, spacing: { after: 100 } }),
  new Paragraph({ children: [run('Temporada 1  ·  12 episodios  ·  noviembre 2026 – junio 2027', { size: 20, color: MUT })],
    alignment: AlignmentType.CENTER, spacing: { after: 1600 } }),
);
kids.push(table([2900, 6700], [
  [{ t: 'Documento', fill: LIGHT, bold: true }, 'Proyecto y armado del podcast'],
  [{ t: 'Contenido', fill: LIGHT, bold: true }, 'Cronograma · Producto · Episodios · Audiencias · Set'],
  [{ t: 'Versión', fill: LIGHT, bold: true }, '2.0 — 17/09/2026'],
  [{ t: 'Área', fill: LIGHT, bold: true }, 'Friedman Hayek Center — UCEMA'],
  [{ t: 'Responsable de logística', fill: LIGHT, bold: true }, 'Matías Biscayart'],
  [{ t: 'Documentos relacionados', fill: LIGHT, bold: true }, '2. Presupuesto  ·  3. Flujo de producción, amenazas y oportunidades'],
], { header: false }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 1 — CRONOGRAMA */
kids.push(h1('1. Cronograma'));
kids.push(p([run('Cadencia: ', { bold: true }), run('una publicación cada 20 días. '),
  run('La grabación va entre 9 y 13 días antes de cada publicación, siempre martes, miércoles o jueves.')],
  { after: 140 }));
kids.push(table([1500, 8100], [
  [{ t: 'G', fill: ORANGE, bold: true, align: AlignmentType.CENTER }, 'Día de grabación'],
  [{ t: 'P', fill: BLUE, bold: true, align: AlignmentType.CENTER }, 'Día de publicación'],
  [{ t: 'Evento', fill: GREEN, bold: true, align: AlignmentType.CENTER }, 'Actividad del FHC ya agendada'],
], { header: false }));
kids.push(spacer(120));
MESES.forEach(m => mesTabla(m).forEach(x => kids.push(x)));

kids.push(spacer(160));
kids.push(h3('Reglas aplicadas'));
[ 'Los 20 días se cuentan sobre la fecha de publicación, no sobre la de grabación.',
  'Si la publicación cae sábado o domingo, se corre al lunes siguiente.',
  'Las grabaciones de los episodios que se publican en enero se adelantan a una jornada doble el 17/12/2026: el podcast publica durante el receso sin que nadie vaya a la oficina en enero.',
  'E02 se publica el 25/11, un día antes de las Jornadas Adam Smith. Funciona como antesala y no hay grabación esa semana.',
  'E08 se corre al 30/03 por Semana Santa (Pascua 2027 cae el 28/03).',
  'Pendiente: validar feriados y fines de semana largos 2027 contra el calendario oficial. La grilla deja margen para correr E06, E08 y E11 sin romper la cadencia.',
].forEach(t => kids.push(L.bullet(t)));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 2 — EL PRODUCTO */
kids.push(h1('2. El producto'));
kids.push(h2('2.1 Formato'));
kids.push(table([2900, 6700], [
  ['Atributo', 'Definición'],
  ['Formato', 'Entrevista uno a uno, en profundidad'],
  ['Duración publicada', '45 a 60 minutos'],
  ['Material grabado', '75 a 90 minutos por sesión'],
  ['Cadencia', 'Un episodio cada 20 días'],
  ['Soporte', 'Video como principal; el audio se deriva del mismo master'],
  ['Idioma', 'Español'],
  ['Set', 'Fijo. El mismo set en los 12 episodios'],
  ['Conducción', 'Un conductor estable durante toda la temporada'],
], { zebra: true }));

kids.push(h2('2.2 Estructura del episodio'));
kids.push(table([900, 1500, 3000, 4200], [
  ['#', 'Minuto', 'Bloque', 'Contenido'],
  ['1', '0:00 – 0:45', 'Cold open', 'El mejor fragmento de la conversación, extraído en edición'],
  ['2', '0:45 – 2:00', 'Presentación', 'Cortina, placa del FHC, presentación del invitado'],
  ['3', '2:00 – 15:00', 'La persona', 'Cómo llegó hasta acá. Trayectoria, no currículum'],
  ['4', '15:00 – 40:00', 'La idea', 'El núcleo temático del episodio'],
  ['5', '40:00 – 52:00', 'La objeción', 'El contraargumento más fuerte a su posición, sin suavizar. Bloque obligatorio'],
  ['6', '52:00 – 58:00', 'Cierre', 'Tres preguntas fijas que se repiten en los 12 episodios'],
  ['7', '58:00 – 60:00', 'Llamado a la acción', 'Suscripción a la newsletter y próxima actividad del Center'],
], { numCols: [0, 1], zebra: true }));

kids.push(h2('2.3 Entregables por episodio'));
kids.push(table([2700, 1000, 3200, 2700], [
  ['Entregable', 'Cant.', 'Destino', 'Responsable'],
  ['Video completo', '1', 'YouTube, formato "Expositor. Título"', 'Matías'],
  ['Audio', '1', 'Spotify · Apple Podcasts · YouTube Music', 'Matías'],
  ['Clips verticales', '5 a 7', 'Instagram Reels · TikTok · Shorts', 'Paz'],
  ['Placa de portada', '1', 'Canva, plantilla FHC', 'Paz'],
  ['Carrusel de citas', '1', 'Instagram · LinkedIn', 'Paz'],
  ['Envío de newsletter', '1', 'Perfit, segmentado por interés', 'Martina'],
  ['Transcripción', '1', 'Web del FHC (SEO) y accesibilidad', 'Martina'],
  ['Ficha del invitado', '1', 'Base Maestra, con contacto e interés', 'Matías'],
], { numCols: [1], zebra: true }));

kids.push(h2('2.4 Total de la temporada'));
kids.push(table([1900, 1900, 1900, 1900, 2000], [
  ['Videos', 'Audios', 'Clips', 'Newsletters', 'Transcripciones'],
  [{ t: '12', size: 24, bold: true, align: AlignmentType.CENTER },
   { t: '12', size: 24, bold: true, align: AlignmentType.CENTER },
   { t: '~72', size: 24, bold: true, align: AlignmentType.CENTER },
   { t: '12', size: 24, bold: true, align: AlignmentType.CENTER },
   { t: '12', size: 24, bold: true, align: AlignmentType.CENTER }],
]));
kids.push(note('108 piezas de contenido publicadas en la temporada.'));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 3 — EPISODIOS */
kids.push(h1('3. Episodios'));
kids.push(h2('3.1 Grilla de la Temporada 1'));
const GRILLA = [
  ['E01', 'Jue 22/10/26', 'Jue 05/11/26', 'Por qué la economía no es lo que te contaron',
   'Economista jefe de consultora o think tank, con oficio en medios. Alguien que explica bien, no necesariamente el más citado', 'Estudiantes'],
  ['E02', 'Jue 12/11/26', 'Mié 25/11/26', 'Emprender donde todo cambia',
   'Fundador/a de PyME o scale-up, 5 a 15 años de trayectoria, que haya atravesado al menos una crisis', 'Emprendedores · Profesionales'],
  ['E03', 'Mié 02/12/26', 'Mar 15/12/26', 'La ley como límite al poder',
   'Constitucionalista, juez o profesor de Derecho Público. Que hable claro, no en latín', 'Estudiantes de Derecho'],
  ['E04', 'Jue 17/12/26 (AM)', 'Lun 04/01/27', 'De dónde venimos: historia de las ideas de la libertad',
   'Historiador/a de las ideas o investigador con libro publicado', 'Comunidad de ideas'],
  ['E05', 'Jue 17/12/26 (PM)', 'Lun 25/01/27', 'Qué hacer con lo que ganás: ahorro e inversión',
   'Portfolio manager, analista de research o fundador de fintech de inversión', 'Profesionales jóvenes'],
  ['E06', 'Mié 03/02/27', 'Lun 15/02/27', 'Decir lo que no conviene: libertad de expresión y prensa',
   'Periodista, editor o director de medio. Preferentemente alguien que haya pagado un costo por publicar algo', 'Comunidad de ideas · Prensa'],
  ['E07', 'Mié 24/02/27', 'Vie 05/03/27', 'Poder sin permiso: tecnología, cripto y descentralización',
   'Founder o CTO del ecosistema cripto o fintech regional', 'Estudiantes · Tecnología'],
  ['E08', 'Mié 17/03/27', 'Mar 30/03/27', 'Reformar el Estado desde adentro',
   'Ex funcionario técnico o cuadro de gestión pública, nacional o provincial', 'Profesionales · Institucional'],
  ['E09', 'Jue 01/04/27', 'Mié 14/04/27', 'Aprender de otra manera: educación, competencia y elección',
   'Director/a de colegio o universidad con modelo alternativo, o fundador de edtech', 'Estudiantes · Docentes'],
  ['E10', 'Mié 21/04/27', 'Mar 04/05/27', 'La objeción: las críticas más serias al liberalismo',
   'Filósofo político o académico que NO se identifique como liberal. Episodio deliberadamente incómodo', 'Comunidad de ideas'],
  ['E11', 'Mié 12/05/27', 'Lun 24/05/27', 'El país que exporta: agro, comercio internacional y apertura',
   'Empresario agroexportador o especialista en comercio exterior', 'Emprendedores · Profesionales'],
  ['E12', 'Mié 02/06/27', 'Lun 14/06/27', 'Los que vienen: la generación que recién empieza',
   'Joven de menos de 30: emprendedor, líder estudiantil o alumni del FHC', 'Estudiantes'],
];
kids.push(table([600, 1300, 1300, 2150, 2750, 1500],
  [['Ep.', 'Grabación', 'Publicación', 'Tema', 'Perfil target del invitado', 'Audiencia primaria'], ...GRILLA],
  { numCols: [0, 1, 2], zebra: true, size: 15 }));
kids.push(note('Los nombres los pone el equipo. La columna de perfil define el tipo de invitado a buscar, no la persona.'));

kids.push(h2('3.2 Audiencias'));
kids.push(table([2400, 2600, 2300, 2300], [
  ['Audiencia', 'Perfil', 'Dónde consume', 'Qué busca'],
  ['A1 · Estudiantes universitarios (18 a 28)',
   'Grado y posgrado en Economía, Derecho, Negocios y Ciencia Política, de universidades públicas y privadas de todo el país',
   'YouTube y Spotify, en el celular, en viajes y tiempos muertos',
   'Entender cómo se aplica lo que estudian y ver a alguien que hizo el camino que ellos empiezan'],
  ['A2 · Profesionales jóvenes (25 a 40)',
   'Sector privado, consultoría, finanzas y tecnología. CABA, AMBA e interior',
   'Audio a 1.5x, manejando o entrenando. LinkedIn',
   'Conversación de nivel, sin explicaciones básicas'],
  ['A3 · Emprendedores y PyMEs (30 a 50)',
   'Dueños de negocios y fundadores, con o sin formación económica formal',
   'YouTube y podcast en audio. Grupos de WhatsApp sectoriales',
   'Casos concretos de gente que construyó algo en condiciones difíciles'],
  ['A4 · Comunidad de ideas en español (20 a 45)',
   'Argentina, Chile, Perú, Colombia, México, Uruguay y España',
   'YouTube por algoritmo. X. Otros podcasts del ecosistema',
   'Material original en español, no traducido'],
  ['A5 · Alumni y comunidad UCEMA',
   'Egresados y asistentes históricos a las actividades del Center. Ya están en la Base Maestra',
   'Perfit. Spotify',
   'Continuidad con lo que ya conocen del FHC'],
  ['A6 · Institucional',
   'Donantes, sponsors, prensa, fundaciones y think tanks afines, docentes',
   'Envío directo y reporte trimestral',
   'Consistencia y producción cuidada como señal de que el FHC es un socio serio'],
], { zebra: true, size: 15 }));
kids.push(note('A1 a A4 son las audiencias de crecimiento: están mayormente fuera de la universidad y fuera de la base actual. A5 y A6 son las audiencias de sostén.'));

kids.push(h2('3.3 Criterios para elegir a los invitados'));
kids.push(h3('Balance de la grilla'));
kids.push(table([3000, 6600], [
  ['Criterio', 'Regla'],
  ['Rubro', 'Máximo 3 economistas en los 12 episodios. El valor del formato está en la diversidad de oficios'],
  ['Género', 'Mínimo 4 de 12 invitadas mujeres'],
  ['Edad', 'Al menos 3 invitados de menos de 40 años'],
  ['Origen', 'Al menos 2 del interior o del exterior. Se pueden grabar en remoto'],
  ['Postura', 'Al menos 1 invitado que no comparta la posición del Center, planteado en serio'],
  ['Vínculo previo', 'Al menos 6 de 12 con relación previa con UCEMA o el FHC: sube la tasa de aceptación y baja el costo de conseguirlos'],
  ['Origen institucional', 'Máximo 6 de 12 provenientes del círculo UCEMA. El resto, de fuera'],
], { zebra: true }));
kids.push(h3('Qué hace a un buen invitado'));
kids.push(table([3000, 6600], [
  ['Criterio', 'Qué mirar'],
  ['Conversa', 'Hay gente brillante que en cámara no funciona y perfiles medios que son excelentes entrevistados. Ver antes un video suyo hablando, no leer su CV'],
  ['Tiene una historia', 'Algo que le pasó, no solo algo que piensa. El bloque 3 del episodio necesita material'],
  ['Banca la objeción', 'El bloque 5 es obligatorio. Alguien que se incomoda con una repregunta no sirve para este formato'],
  ['Convoca o aporta', 'O trae audiencia propia, o trae un tema que nadie más puede contar. Si no cumple ninguna de las dos, no entra'],
  ['Disponibilidad real', 'Confirmación por escrito con fecha y hora. Una intención verbal no reserva la fecha'],
], { zebra: true }));
kids.push(h3('Filtros de descarte'));
[ 'Chequeo reputacional previo obligatorio antes de confirmar. Ante duda, se consulta con coordinación.',
  'No se invita a nadie que condicione los temas o pida ver las preguntas exactas por adelantado.',
  'No se invita a nadie en campaña electoral activa durante la ventana de publicación del episodio.',
].forEach(t => kids.push(L.bullet(t)));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 4 — EL SET */
kids.push(h1('4. El set'));
kids.push(p('El set tiene que cumplir dos funciones: que la grabación se vea y se escuche bien, y que el invitado esté cómodo. Una persona incómoda da respuestas cortas y cuidadas.', { after: 160 }));

const IMGS = [
  ['assets/set-plano-general.png', 482, 271,
   'Referencia 1 — El set montado en la sala: butacas enfrentadas, fondo con biblioteca y panel de color, luz principal difusa y las tres cámaras en posición.'],
  ['assets/set-planta.png', 476, 442,
   'Referencia 2 — Plano en planta con la ubicación de cada elemento: butacas, cámaras, luces, micrófonos, mesa técnica y área de espera.'],
];
IMGS.forEach(([f, w, h, cap]) => {
  const abs = __dirname + '/' + f;
  if (fs.existsSync(abs)) {
    kids.push(new Paragraph({
      children: [new ImageRun({ data: fs.readFileSync(abs), type: 'png',
        transformation: { width: w, height: h } })],
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 } }));
    kids.push(new Paragraph({ children: [run(cap, { size: 15, italics: true, color: MUT })],
      alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
  }
});
kids.push(note('Render 3D del set propuesto, modelado sobre las medidas y los elementos de la sala de la oficina: paredes blancas, piso gris, ventanal con marco de aluminio, biblioteca blanca y sofá gris ya existentes. El sofá se reubica como área de espera.'));

kids.push(h2('4.1 El espacio'));
kids.push(table([3000, 6600], [
  ['Requisito', 'Detalle'],
  ['Superficie', '20 a 35 m². Más grande suena hueco, más chica no entra el equipo'],
  ['Ruido', 'Lejos de pasillos de circulación y ascensores. El aire acondicionado tiene que poder apagarse durante la toma: los splits arruinan el audio'],
  ['Luz natural', 'Ventanas tapables con cortinado. La luz natural cambia durante la grabación y descalza los planos entre cámaras'],
  ['Electricidad', 'Mínimo 4 tomas de corriente accesibles'],
  ['Asignación', 'Idealmente permanente. Armar y desarmar el set cuesta unas 3 horas por episodio, es decir 36 horas en la temporada. Con el espacio fijo baja a 30 minutos de puesta a punto'],
], { zebra: true }));

const SET = [
  ['4.2 Mobiliario y ambientación', [
    ['Butacas individuales', '3', 'Dos en uso y una de repuesto. Individuales y no un sofá de dos cuerpos: el sillón compartido obliga a girar el cuerpo y se ve mal. Respaldo medio, sin apoyacabezas alto'],
    ['Mesa ratona baja', '1', 'Para vasos, agua y notas. Baja, para que no corte el plano'],
    ['Biblioteca o estantería de fondo', '1', 'El fondo con profundidad es lo que separa un set de una oficina. Libros del Center, objetos, color'],
    ['Plantas', '2 a 3', 'Rompen la geometría del fondo'],
    ['Mesa auxiliar técnica', '1', 'Consola, notebook y monitor, fuera de plano'],
    ['Perchero', '1', 'Detalle chico, se agradece mucho'],
    ['Banner o placa con identidad FHC', '1', 'Fondo secundario para fotos y para el plano de apertura'],
    ['Sofá existente', '1', 'Se reubica como área de espera del invitado. No hace falta comprarlo'],
  ]],
  ['4.3 Acústica', [
    ['Paneles acústicos', '12', 'Sobre paredes laterales y detrás de cámara. La inversión más barata con más impacto en la calidad percibida'],
    ['Alfombra', '1', 'No es decoración: absorbe el rebote del piso, que es la primera causa de eco en una sala con piso duro'],
    ['Cortinado pesado', '1 juego', 'Tapa ventanas y suma absorción'],
  ]],
  ['4.4 Video', [
    ['Cámara mirrorless con lente', '3', 'Cam A: plano general. Cam B: primer plano del invitado. Cam C: primer plano del conductor'],
    ['Trípodes', '3', 'Uno por cámara, con altura fija y repetible'],
    ['Tarjetas de memoria de alta velocidad', '6', 'Dos por cámara. Nunca se graba sobre la tarjeta del episodio anterior sin haber respaldado'],
    ['Alimentación continua (dummy battery)', '3', '90 minutos de grabación agotan una batería'],
    ['Monitor de referencia', '1', 'Control de encuadre y foco durante la toma'],
    ['Claqueta', '1', 'Sincronizar tres cámaras sin una marca clara cuesta horas de edición'],
  ]],
  ['4.5 Audio', [
    ['Micrófonos dinámicos de podcast', '4', 'Dos en uso, dos de respaldo y para episodios de tres personas. Dinámicos y no condenser: rechazan mucho mejor el ruido de sala'],
    ['Brazos articulados', '4', 'Acercan el micrófono a 15 cm de la boca sin ocupar la mesa'],
    ['Interfaz o consola de podcast', '1', 'Graba cada micrófono en un canal separado, que es lo que permite corregir niveles dispares en edición'],
    ['Auriculares cerrados', '4', 'Para el operador y para los participantes'],
    ['Cables XLR', '6', 'Cuatro en uso y dos de repuesto'],
    ['Filtros anti-pop', '4', 'Eliminan el golpe de las consonantes explosivas, que después no se saca'],
    ['Grabador de respaldo', '1', 'Graba en paralelo. Cuesta poco y evita perder una entrevista entera'],
  ]],
  ['4.6 Iluminación', [
    ['Panel LED bicolor con softbox', '2', 'Luz principal difusa para cada participante'],
    ['Panel LED chico', '1', 'Luz de recorte desde atrás: separa al sujeto del fondo y evita la imagen plana'],
    ['Luz de fondo RGB o lámpara de ambiente', '1 a 2', 'El elemento más barato que más produce la imagen'],
    ['Trípodes de luz', '3', 'Altura fija y repetible entre episodios'],
    ['Difusores y banderas', '1 juego', 'Para que la luz no encandile al invitado'],
  ]],
  ['4.7 Posproducción', [
    ['Notebook o PC de edición', '1', '16 GB de RAM como mínimo para trabajar video multicámara sin sufrir'],
    ['Disco SSD externo 2 TB', '1', 'Material bruto y archivo de temporada. Cada episodio genera entre 80 y 120 GB'],
    ['Lector de tarjetas', '1', 'Descargar por cable desde la cámara triplica el tiempo de respaldo'],
    ['Monitor secundario', '1', 'Línea de tiempo y previsualización en pantallas separadas'],
    ['Software de edición', '1', 'DaVinci Resolve en su versión gratuita alcanza, o Premiere si hay licencia institucional'],
  ]],
  ['4.8 Publicación', [
    ['Hosting de podcast', '1', 'Distribuye a Spotify, Apple y el resto, y da las métricas de audio'],
    ['Transcripción automática', '1', 'Subtítulos y texto publicable en la web para posicionamiento'],
    ['Música y cortinas con licencia', '1', 'Música sin licencia genera reclamos de copyright que afectan al canal entero, no solo al episodio'],
    ['Nombre y dominio', '1', 'Marca, dominio y usuarios de redes reservados antes del primer episodio'],
  ]],
];
SET.forEach(([titulo, filas]) => {
  kids.push(h2(titulo));
  kids.push(table([3000, 800, 5800],
    [['Elemento', 'Cant.', 'Función'], ...filas], { numCols: [1], zebra: true }));
});

kids.push(h2('4.9 Lo que no está en ninguna lista de equipos'));
[ 'Agua sin gas y café listos antes de que llegue el invitado, no durante.',
  'Diez minutos de charla previa sin cámaras prendidas. Es donde se relaja el invitado y donde aparecen los mejores temas.',
  'Cartel de "Grabando" en la puerta.',
  'Toallitas de papel mate para el brillo en la frente bajo las luces.',
  'Celulares en silencio y fuera de la mesa, incluido el del invitado.',
  'Un regalo institucional al cierre. Cierra la visita en buenos términos y abre la puerta para la próxima.',
].forEach(t => kids.push(L.bullet(t)));

/* ─────────────────────────── DOCUMENTO ─────────────────────────── */
const doc = new Document({
  creator: 'Friedman Hayek Center — UCEMA',
  title: 'Podcast FHC — Proyecto y armado',
  styles: { default: { document: { run: { font: 'Calibri', size: 18 } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({
      children: [run('Podcast FHC — Proyecto y armado    ·    ', { size: 14, color: MUT }),
                 new TextRun({ children: [PageNumber.CURRENT], size: 14, color: MUT, font: 'Calibri' })],
      alignment: AlignmentType.RIGHT })] }) },
    children: kids,
  }],
});
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(__dirname + '/1-Podcast-FHC-Proyecto.docx', b);
  console.log('OK 1-Podcast-FHC-Proyecto.docx', (b.length / 1024).toFixed(0) + ' KB');
});
