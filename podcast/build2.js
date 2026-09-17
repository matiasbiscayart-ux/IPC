const fs = require('fs');
const L = require('./lib.js');
const d = L.d;
const { Document, Packer, Paragraph, AlignmentType, PageBreak, Footer, PageNumber, TextRun } = d;
const { p, h1, h2, h3, note, spacer, table, run, W, NAVY, ACC, LIGHT, GREY, GREEN, WARN, MUT } = L;

const usd = n => 'USD ' + n.toLocaleString('es-AR');
const num = n => n.toLocaleString('es-AR');
const CW = [2780, 640, 1000, 1050, 4130];        // Ítem | Cant | Unit | Total | Por qué

/* ── datos: [item, cant, unitario, por que] ── */
const RUBROS = [
  ['Video', [
    ['Cámara mirrorless con lente', 3, 700, 'Tres ángulos fijos permiten cortar entre planos sin saltos y salvar el episodio si una cámara falla.'],
    ['Trípode de cámara', 3, 90, 'Fija la altura y el encuadre una vez y los repite en los 12 episodios, que es lo que da identidad visual.'],
    ['Tarjeta de memoria de alta velocidad', 6, 30, 'Dos por cámara, para no grabar nunca encima del material del episodio anterior sin haber respaldado.'],
    ['Alimentación continua (dummy battery)', 3, 35, 'Una batería no aguanta 90 minutos de grabación; esto elimina el corte a mitad de entrevista.'],
    ['Cables HDMI, soportes y accesorios', 1, 100, 'Es lo que hace que el resto del equipo se conecte entre sí y es lo que siempre se subestima.'],
    ['Claqueta de sincronización', 1, 20, 'Sincronizar tres cámaras sin una marca visible y audible cuesta horas de edición por episodio.'],
  ]],
  ['Audio', [
    ['Micrófono dinámico de podcast', 4, 130, 'Dinámico y no condenser porque rechaza el ruido de sala: es la diferencia entre sonar a estudio o a oficina.'],
    ['Brazo articulado para micrófono', 4, 100, 'Acerca el micrófono a 15 cm de la boca sin ocupar la mesa ni obligar al invitado a inclinarse.'],
    ['Interfaz o consola de podcast multicanal', 1, 600, 'Graba cada micrófono en un canal separado, que es lo único que permite corregir niveles dispares en edición.'],
    ['Auriculares cerrados de monitoreo', 4, 60, 'Sin monitoreo en vivo, un problema de audio se descubre en la edición, cuando ya no tiene arreglo.'],
    ['Cable XLR', 6, 15, 'Cuatro en uso y dos de repuesto: el cable es la falla más frecuente y la más barata de prevenir.'],
    ['Filtro anti-pop', 4, 10, 'Elimina el golpe de las consonantes explosivas, que después no se puede sacar.'],
    ['Grabador de respaldo', 1, 70, 'Graba en paralelo por si falla la consola. Cuesta lo mismo que un catering y evita perder una entrevista entera.'],
  ]],
  ['Iluminación', [
    ['Panel LED bicolor con softbox', 2, 200, 'Luz principal difusa para cada participante: sin esto la cámara sube la sensibilidad y aparece ruido de imagen.'],
    ['Panel LED de recorte', 1, 120, 'Separa a la persona del fondo; es lo que evita que la imagen se vea plana.'],
    ['Luz de fondo RGB o lámpara de ambiente', 2, 55, 'El elemento más barato que más produce la imagen: da color y profundidad al fondo.'],
    ['Trípode de luz', 3, 30, 'Permite fijar la altura una vez y repetirla en los 12 episodios.'],
    ['Difusores y banderas', 1, 30, 'Evitan que la luz encandile al invitado, que es la causa más común de que alguien se sienta incómodo en cámara.'],
  ]],
  ['Mobiliario y ambientación', [
    ['Butaca individual para entrevista', 3, 300, 'Dos en uso y una de repuesto. Individuales porque el sillón compartido obliga a girar el cuerpo y se ve mal.'],
    ['Mesa ratona baja', 1, 200, 'Sostiene vasos y notas sin cortar el plano, que es lo que pasa con una mesa de altura normal.'],
    ['Biblioteca o estantería de fondo', 1, 280, 'El fondo con profundidad es lo que separa visualmente un set de una oficina cualquiera.'],
    ['Ambientación: libros, objetos y plantas', 1, 150, 'Rompen la geometría del fondo y dan el detalle que hace que el plano no se vea vacío.'],
    ['Mesa auxiliar técnica y perchero', 1, 120, 'Saca la consola, la notebook y los abrigos del plano, que es la diferencia entre un set y un depósito.'],
    ['Banner o placa con identidad FHC', 1, 100, 'Fondo secundario para fotos y para el plano de apertura, y marca institucional en cada episodio.'],
  ]],
  ['Acústica', [
    ['Paneles acústicos, pack de 12 con instalación', 1, 250, 'La inversión más barata con más impacto en la calidad percibida: el audio es lo que decide si alguien se queda.'],
    ['Alfombra', 1, 150, 'No es decoración: absorbe el rebote del piso duro, que es la primera causa de eco en la sala.'],
    ['Cortinado pesado', 1, 100, 'Tapa las ventanas, estabiliza la luz durante la grabación y suma absorción.'],
  ]],
  ['Posproducción', [
    ['Notebook o workstation de edición', 1, 1000, 'Video multicámara de tres ángulos no se edita en una notebook de oficina sin que cada exportación tarde horas.'],
    ['Disco SSD externo 2 TB', 1, 150, 'Cada episodio genera entre 80 y 120 GB de material bruto; el archivo de la temporada no entra en la notebook.'],
    ['Lector de tarjetas y accesorios', 1, 45, 'Descargar por cable desde la cámara triplica el tiempo de respaldo el día de la grabación.'],
    ['Monitor secundario', 1, 100, 'Editar con línea de tiempo y previsualización en una sola pantalla duplica el tiempo de trabajo.'],
    ['Software de edición (DaVinci Resolve)', 1, 0, 'La versión gratuita cubre todo lo que necesita este formato: no hace falta licencia paga.'],
  ]],
];

const OPEX = [
  ['Edición y posproducción (freelance)', 150, 'Es lo que garantiza la cadencia: 120 horas de edición en la temporada no entran en el tiempo del equipo.'],
  ['Transcripción y subtítulos', 15, 'Los subtítulos suben la retención en redes y el texto publicado en la web trae búsquedas orgánicas.'],
  ['Catering para invitado y equipo', 25, 'Un invitado cómodo da mejores respuestas; es el gasto con mejor relación costo-resultado de la lista.'],
  ['Traslado del invitado', 25, 'Elimina la excusa más común para cancelar sobre la fecha y la llegada tarde y apurado.'],
  ['Regalo institucional para el invitado', 30, 'Cierra la visita en buenos términos y deja abierta la puerta para volver a convocarlo.'],
  ['Hosting de podcast (prorrateado)', 13, 'Distribuye a Spotify, Apple y el resto desde un solo lugar y entrega las métricas de audio.'],
];
const UNICOS = [
  ['Registro de marca, dominio y usuarios de redes', 150, 'Reservar el nombre antes del episodio 1 cuesta una fracción de lo que cuesta recuperarlo después.'],
  ['Licencia de música y biblioteca sonora', 120, 'Música sin licencia genera reclamos de copyright que afectan al canal entero, no solo al episodio.'],
];
const PAUTA = ['Pauta paga en redes (6 de 12 episodios)', 100, 'Se pauta recién desde el episodio 4 y solo sobre lo que ya funcionó orgánicamente.'];

const kids = [];

/* Portada */
kids.push(
  new Paragraph({ children: [], spacing: { after: 1400 } }),
  new Paragraph({ children: [run('PRESUPUESTO', { size: 56, bold: true, color: NAVY })],
    alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
  new Paragraph({ children: [run('PODCAST — FRIEDMAN HAYEK CENTER', { size: 26, bold: true, color: ACC })],
    alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
  new Paragraph({ children: [run('Temporada 1  ·  12 episodios  ·  noviembre 2026 – junio 2027', { size: 20, color: MUT })],
    alignment: AlignmentType.CENTER, spacing: { after: 700 } }));

const capexTot = RUBROS.reduce((a, [, f]) => a + f.reduce((s, r) => s + r[1] * r[2], 0), 0);
const opexEp = OPEX.reduce((a, r) => a + r[1], 0);
const opexTot = opexEp * 12;
const unicosTot = UNICOS.reduce((a, r) => a + r[1], 0);
const subtotal = capexTot + opexTot + unicosTot;
const conting = Math.round(subtotal * 0.10);
const sinPauta = subtotal + conting;
const pautaTot = Math.round(PAUTA[1] * 6 * 1.10);
const total = sinPauta + pautaTot;

kids.push(table([4800, 4800], [
  [{ t: 'MONTO TOTAL A SOLICITAR', align: AlignmentType.CENTER },
   { t: 'COSTO POR EPISODIO DESDE LA TEMPORADA 2', align: AlignmentType.CENTER }],
  [{ t: usd(total), size: 40, bold: true, align: AlignmentType.CENTER, fill: GREEN },
   { t: usd(opexEp), size: 40, bold: true, align: AlignmentType.CENTER, fill: GREEN }],
]));
kids.push(spacer(300));
kids.push(table([2900, 6700], [
  [{ t: 'Moneda', fill: LIGHT, bold: true }, 'Dólares estadounidenses. Los equipos se cotizan en esa moneda y así el presupuesto no se desactualiza entre la presentación y la aprobación'],
  [{ t: 'Tipo de cambio', fill: LIGHT, bold: true }, 'A completar al momento de presentar, con su fecha de corte'],
  [{ t: 'Estado de los valores', fill: LIGHT, bold: true }, 'Estimaciones de referencia para dimensionar el proyecto. No son cotizaciones en firme: antes de la aprobación final se piden tres cotizaciones por rubro'],
  [{ t: 'Escenario presupuestado', fill: LIGHT, bold: true }, 'Recomendado (ver capítulo 5)'],
], { header: false }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 1 — CAPEX */
kids.push(h1('1. Equipamiento y set'));
kids.push(p([run('Inversión de única vez. ', { bold: true }),
  run('Queda como activo de UCEMA y sirve además para grabar seminarios, transmitir eventos y producir material de las Jornadas.')], { after: 150 }));

let capexResumen = [];
RUBROS.forEach(([nombre, filas]) => {
  const sub = filas.reduce((s, r) => s + r[1] * r[2], 0);
  capexResumen.push([nombre, sub]);
  kids.push(h2(`1.${capexResumen.length} ${nombre}`));
  kids.push(table(CW, [
    ['Ítem', 'Cant', 'Unit. (USD)', 'Total (USD)', 'Por qué'],
    ...filas.map(([it, q, u, w]) => [it, { t: q, align: AlignmentType.CENTER },
      { t: num(u), align: AlignmentType.CENTER }, { t: num(q * u), align: AlignmentType.CENTER, bold: true }, w]),
    [{ t: `Subtotal ${nombre.toLowerCase()}`, bold: true }, '', '',
     { t: num(sub), align: AlignmentType.CENTER, bold: true }, ''],
  ], { zebra: true, totalRows: [filas.length + 1] }));
});

kids.push(h2('1.7 Resumen de equipamiento y set'));
kids.push(table([5400, 2100, 2100], [
  ['Rubro', 'Monto', '% del equipamiento'],
  ...capexResumen.map(([n, v]) => [n, { t: usd(v), align: AlignmentType.CENTER },
    { t: (v / capexTot * 100).toFixed(0) + '%', align: AlignmentType.CENTER }]),
  [{ t: 'TOTAL EQUIPAMIENTO Y SET', bold: true }, { t: usd(capexTot), align: AlignmentType.CENTER, bold: true },
   { t: '100%', align: AlignmentType.CENTER, bold: true }],
], { zebra: true, totalRows: [capexResumen.length + 1] }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 2 — OPEX */
kids.push(h1('2. Operación'));
kids.push(h2('2.1 Costo recurrente por episodio'));
kids.push(table([2780, 1100, 1250, 4470], [
  ['Concepto', 'Por ep. (USD)', 'Temporada (USD)', 'Por qué'],
  ...OPEX.map(([c, v, w]) => [c, { t: num(v), align: AlignmentType.CENTER },
    { t: num(v * 12), align: AlignmentType.CENTER }, w]),
  [{ t: 'TOTAL OPERACIÓN', bold: true }, { t: num(opexEp), align: AlignmentType.CENTER, bold: true },
   { t: num(opexTot), align: AlignmentType.CENTER, bold: true }, ''],
], { zebra: true, totalRows: [OPEX.length + 1] }));

kids.push(h2('2.2 Costos únicos de publicación'));
kids.push(table([2780, 1250, 5570], [
  ['Concepto', 'Total (USD)', 'Por qué'],
  ...UNICOS.map(([c, v, w]) => [c, { t: num(v), align: AlignmentType.CENTER, bold: true }, w]),
  [{ t: 'Subtotal', bold: true }, { t: num(unicosTot), align: AlignmentType.CENTER, bold: true }, ''],
], { zebra: true, totalRows: [UNICOS.length + 1] }));

kids.push(h2('2.3 Pauta paga (opcional, incluida en el total)'));
kids.push(table([2780, 900, 1100, 1100, 3720], [
  ['Concepto', 'Episodios', 'Unit. (USD)', 'Total (USD)', 'Por qué'],
  [PAUTA[0], { t: '6', align: AlignmentType.CENTER }, { t: num(PAUTA[1]), align: AlignmentType.CENTER },
   { t: num(PAUTA[1] * 6), align: AlignmentType.CENTER, bold: true }, PAUTA[2]],
]));
kids.push(note('No se pauta en los tres primeros episodios: pautar desde el episodio 1 es comprar alcance sobre una hipótesis no probada.'));

kids.push(h2('2.4 Sobre la edición, que es el 58% de la operación'));
kids.push(table([2400, 3600, 3600], [
  ['', 'Freelance (recomendado)', 'Interno'],
  ['Costo monetario', usd(150) + ' por episodio — ' + usd(1800) + ' en la temporada', usd(0)],
  ['Costo en horas', '2 h de coordinación por episodio', '8 a 12 h por episodio — unas 120 h en la temporada'],
  ['Riesgo', 'Depende de la disponibilidad de un tercero', 'Compite con las tareas operativas del equipo'],
  ['Efecto sobre la cadencia', 'La sostiene', 'El primer episodio que se atrase rompe la racha'],
], { zebra: true }));
kids.push(note('Alternativa intermedia: freelance para el video largo y clips en casa con plantillas de Canva. Baja la operación a unos USD 110 por episodio.'));

/* 3 — TOTAL */
kids.push(h1('3. Total de la Temporada 1'));
kids.push(table([5400, 2100, 2100], [
  ['Concepto', 'Monto', '% del total'],
  ['Equipamiento y set (activo de UCEMA)', { t: usd(capexTot), align: AlignmentType.CENTER }, { t: (capexTot / total * 100).toFixed(0) + '%', align: AlignmentType.CENTER }],
  ['Operación — 12 episodios', { t: usd(opexTot), align: AlignmentType.CENTER }, { t: (opexTot / total * 100).toFixed(0) + '%', align: AlignmentType.CENTER }],
  ['Costos únicos de publicación', { t: usd(unicosTot), align: AlignmentType.CENTER }, { t: (unicosTot / total * 100).toFixed(0) + '%', align: AlignmentType.CENTER }],
  [{ t: 'Subtotal', bold: true }, { t: usd(subtotal), align: AlignmentType.CENTER, bold: true }, ''],
  ['Contingencia (10%)', { t: usd(conting), align: AlignmentType.CENTER }, { t: (conting / total * 100).toFixed(0) + '%', align: AlignmentType.CENTER }],
  [{ t: 'Total sin pauta', bold: true }, { t: usd(sinPauta), align: AlignmentType.CENTER, bold: true }, ''],
  ['Pauta paga en 6 episodios (con contingencia)', { t: usd(pautaTot), align: AlignmentType.CENTER }, { t: (pautaTot / total * 100).toFixed(0) + '%', align: AlignmentType.CENTER }],
  [{ t: 'TOTAL A SOLICITAR', bold: true, fill: GREEN }, { t: usd(total), align: AlignmentType.CENTER, bold: true, fill: GREEN, size: 20 }, { t: '100%', align: AlignmentType.CENTER, bold: true, fill: GREEN }],
], { totalRows: [4, 6] }));

kids.push(h2('3.1 Indicadores'));
kids.push(table([5400, 2100, 2100], [
  ['Indicador', 'Valor', 'Nota'],
  ['Costo total por episodio en la Temporada 1', { t: usd(Math.round(total / 12)), align: AlignmentType.CENTER }, 'Incluye el equipamiento'],
  ['Costo por episodio desde la Temporada 2', { t: usd(opexEp), align: AlignmentType.CENTER }, 'El equipamiento no se vuelve a pagar'],
  ['Costo por pieza publicada', { t: usd(Math.round(total / 108)), align: AlignmentType.CENTER }, '108 piezas en la temporada'],
  ['Costo por contacto nuevo en la base', { t: usd(Math.round(total / 600)), align: AlignmentType.CENTER }, 'Sobre una meta de 600 altas'],
], { zebra: true }));
kids.push(note('El indicador relevante para quien financia es el segundo: el grueso de lo que se pide ahora es infraestructura que no se vuelve a pagar.'));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 4 — HORAS */
kids.push(h1('4. Horas internas'));
kids.push(p('No implica desembolso, pero es el recurso más escaso del proyecto.', { after: 140 }));
const HORAS = [
  ['Coordinación editorial e invitados', 'Frank', 4, 'Selección de temas, invitación, investigación previa, guion y revisión del corte'],
  ['Diseño, clips y difusión', 'Paz', 6, 'Portada, 5 a 7 clips verticales, carrusel de citas y publicación en redes'],
  ['Logística, grabación y publicación', 'Matías', 7, 'Sala, seguridad, catering, armado del set, grabación, respaldo, subida y métricas'],
  ['Web, formularios y envíos', 'Martina', 3, 'Transcripción, publicación en la web, envío en Perfit y carga en la Base Maestra'],
];
const hTot = HORAS.reduce((a, r) => a + r[2], 0);
kids.push(table([2900, 1100, 1100, 1100, 3400], [
  ['Rol', 'Persona', 'h / ep.', 'h / temp.', 'Detalle'],
  ...HORAS.map(([r, pe, h, det]) => [r, { t: pe, align: AlignmentType.CENTER },
    { t: h, align: AlignmentType.CENTER }, { t: h * 12, align: AlignmentType.CENTER }, det]),
  [{ t: 'TOTAL', bold: true }, '', { t: hTot, align: AlignmentType.CENTER, bold: true },
   { t: hTot * 12, align: AlignmentType.CENTER, bold: true }, ''],
], { zebra: true, totalRows: [HORAS.length + 1] }));
kids.push(note(`${hTot * 12} horas en ocho meses equivalen a unas 7 horas semanales repartidas entre cuatro personas. Es sostenible solo si el proyecto entra en Asana con la misma disciplina que el resto de las actividades.`));

/* 5 — ESCENARIOS */
kids.push(h1('5. Escenarios de equipamiento'));
kids.push(table([3000, 2200, 2200, 2200], [
  ['Rubro', 'Austero', 'Recomendado', 'Premium'],
  ['Video', { t: usd(1150), align: AlignmentType.CENTER }, { t: usd(2775), align: AlignmentType.CENTER }, { t: usd(5400), align: AlignmentType.CENTER }],
  ['Audio', { t: usd(890), align: AlignmentType.CENTER }, { t: usd(1960), align: AlignmentType.CENTER }, { t: usd(3150), align: AlignmentType.CENTER }],
  ['Iluminación', { t: usd(380), align: AlignmentType.CENTER }, { t: usd(750), align: AlignmentType.CENTER }, { t: usd(1450), align: AlignmentType.CENTER }],
  ['Mobiliario y ambientación', { t: usd(290), align: AlignmentType.CENTER }, { t: usd(1750), align: AlignmentType.CENTER }, { t: usd(3150), align: AlignmentType.CENTER }],
  ['Acústica', { t: usd(410), align: AlignmentType.CENTER }, { t: usd(500), align: AlignmentType.CENTER }, { t: usd(950), align: AlignmentType.CENTER }],
  ['Posproducción', { t: usd(180), align: AlignmentType.CENTER }, { t: usd(1295), align: AlignmentType.CENTER }, { t: usd(2300), align: AlignmentType.CENTER }],
  [{ t: 'TOTAL EQUIPAMIENTO', bold: true }, { t: usd(3300), align: AlignmentType.CENTER, bold: true },
   { t: usd(9030), align: AlignmentType.CENTER, bold: true, fill: GREEN }, { t: usd(16400), align: AlignmentType.CENTER, bold: true }],
], { zebra: true, totalRows: [7] }));
kids.push(table([2400, 7200], [
  ['Escenario', 'Qué implica'],
  ['Austero', 'Dos cámaras, micrófonos de gama de entrada, dos luces, mobiliario reutilizado y edición en equipos existentes. Funciona: la conversación es la misma. Se nota en la terminación visual y obliga a editar con menos margen. Es la opción si el financiamiento se aprueba parcialmente'],
  ['Recomendado', 'Tres cámaras, audio profesional con respaldo, esquema de luz completo, set propio con tratamiento acústico y equipo de edición dedicado. Es el punto donde el costo marginal de mejorar deja de compensar'],
  ['Premium', 'Ópticas fijas luminosas, switcher para corte en vivo, teleprompter y set a medida. Se justifica solo si el equipo va a compartirse con transmisiones en vivo y producción audiovisual regular del Center'],
], { zebra: true }));
kids.push(note('La diferencia entre Austero y Recomendado (USD 5.730) se nota en cada episodio durante toda la vida del proyecto. La diferencia entre Recomendado y Premium (USD 7.370) la percibe un director de fotografía, no la audiencia.'));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 6 — FINANCIAMIENTO */
kids.push(h1('6. Financiamiento'));
kids.push(h2('6.1 Esquema propuesto'));
kids.push(table([3600, 1800, 1300, 2900], [
  ['Fuente', 'Monto', '%', 'Cubre'],
  ['Sponsor principal de temporada', { t: usd(9000), align: AlignmentType.CENTER }, { t: '63%', align: AlignmentType.CENTER }, 'El equipamiento completo'],
  ['Sponsor de apoyo 1', { t: usd(2000), align: AlignmentType.CENTER }, { t: '14%', align: AlignmentType.CENTER }, 'Operación'],
  ['Sponsor de apoyo 2', { t: usd(2000), align: AlignmentType.CENTER }, { t: '14%', align: AlignmentType.CENTER }, 'Operación y pauta'],
  ['Aporte del FHC', { t: usd(1300), align: AlignmentType.CENTER }, { t: '9%', align: AlignmentType.CENTER }, 'Contingencia y gastos institucionales'],
  [{ t: 'TOTAL', bold: true }, { t: usd(14300), align: AlignmentType.CENTER, bold: true }, { t: '100%', align: AlignmentType.CENTER, bold: true }, ''],
], { zebra: true, totalRows: [5] }));

kids.push(h2('6.2 Contraprestaciones'));
kids.push(table([2600, 7000], [
  ['Nivel', 'Qué recibe'],
  [{ t: `Sponsor principal — ${usd(9000)}`, bold: true },
   'Mención en la apertura y el cierre de los 12 episodios. Logo en la placa de portada, en el set y en todas las piezas de difusión. Mención en los 12 envíos de newsletter. Un invitado propuesto por el sponsor, sujeto a criterio editorial del FHC. Reporte trimestral de métricas'],
  [{ t: `Sponsor de apoyo — ${usd(2000)}`, bold: true },
   'Mención en el cierre de 6 episodios. Logo en las piezas de esos episodios. Mención en 6 envíos de newsletter. Reporte de cierre de temporada'],
], { zebra: true }));

kids.push(h2('6.3 Independencia editorial'));
kids.push(table([9600], [[{ t: 'Ningún sponsor tiene injerencia sobre el contenido de los episodios, la selección de invitados ni la edición. El episodio propuesto por el sponsor principal queda sujeto a los mismos criterios editoriales que el resto y el FHC se reserva el derecho de rechazar la propuesta.', fill: WARN, bold: true, size: 18 }]], { header: false }));
kids.push(note('La cláusula tiene que estar escrita en el acuerdo, no sobreentendida: un podcast del que se sospecha que el sponsor elige los temas pierde exactamente aquello por lo que un sponsor querría estar ahí.'));

/* 7 — PENDIENTES */
kids.push(h1('7. Qué falta cerrar antes de aprobar'));
kids.push(table([700, 8900], [
  ['#', 'Pendiente'],
  ...[ 'Definir quién conduce. Si tiene que ser externo, se suman entre USD 150 y 300 por episodio que hoy no están presupuestados.',
       'Pedir tres cotizaciones por rubro de equipamiento. Los valores de este documento son de referencia.',
       'Fijar el tipo de cambio de la conversión a pesos y la fecha de corte de esa cotización.',
       'Verificar qué equipamiento audiovisual ya tiene UCEMA y es reutilizable. Baja el total de forma directa.',
       'Confirmar la sala y si queda asignada de forma permanente.',
       'Confirmar si hay licencia institucional de Adobe. Si la hay, se ahorra el costo de software.',
       'Definir el nombre del podcast y verificar disponibilidad de dominio y redes.',
       'Cerrar el esquema de sponsors y la redacción de la cláusula de independencia editorial.',
       'Revisar de qué partida del libro de contabilidad 2026 sale el aporte del FHC.',
     ].map((t, i) => [{ t: i + 1, align: AlignmentType.CENTER, bold: true }, t]),
], { zebra: true }));

kids.push(h1('8. Supuestos'));
kids.push(p('Si alguno de estos supuestos no se cumple, las cifras cambian.', { after: 140 }));
[ 'Los invitados no cobran cachet: se los invita como parte de la actividad académica del Center y se los compensa con un regalo institucional.',
  'La sala es sin costo por ser espacio propio.',
  'El equipo interno absorbe las 240 horas sin contratación adicional.',
  'No hay equipamiento audiovisual previo reutilizable. Si lo hay, el equipamiento baja proporcionalmente.',
  'Los precios de equipamiento son de referencia internacional. Los valores en plaza local pueden diferir de forma significativa según disponibilidad e impuestos de importación.',
  'La temporada es de 12 episodios. Cada episodio adicional suma ' + usd(opexEp) + ', sin equipamiento adicional.',
].forEach(t => kids.push(L.bullet(t)));

const doc = new Document({
  creator: 'Friedman Hayek Center — UCEMA',
  title: 'Podcast FHC — Presupuesto',
  styles: { default: { document: { run: { font: 'Calibri', size: 18 } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({
      children: [run('Podcast FHC — Presupuesto    ·    ', { size: 14, color: MUT }),
                 new TextRun({ children: [PageNumber.CURRENT], size: 14, color: MUT, font: 'Calibri' })],
      alignment: AlignmentType.RIGHT })] }) },
    children: kids,
  }],
});
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(__dirname + '/2-Podcast-FHC-Presupuesto.docx', b);
  console.log('OK 2-Podcast-FHC-Presupuesto.docx', (b.length / 1024).toFixed(0) + ' KB');
  console.log('CAPEX', capexTot, '| OPEX/ep', opexEp, '| OPEX12', opexTot, '| unicos', unicosTot,
              '| subtotal', subtotal, '| conting', conting, '| sinPauta', sinPauta, '| pauta', pautaTot, '| TOTAL', total);
});
