const fs = require('fs');
const L = require('./lib.js');
const d = L.d;
const { Document, Packer, Paragraph, AlignmentType, PageBreak, Footer, PageNumber, TextRun } = d;
const { p, h1, h2, h3, note, spacer, table, run, NAVY, ACC, LIGHT, GREY, GREEN, WARN, ORANGE, BLUE, MUT } = L;

const RED = 'F8CBAD', YEL = 'FFF2CC', GRN = 'E2EFDA';
const kids = [];

/* Portada */
kids.push(
  new Paragraph({ children: [], spacing: { after: 1400 } }),
  new Paragraph({ children: [run('FLUJO DE PRODUCCIÓN', { size: 46, bold: true, color: NAVY })],
    alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
  new Paragraph({ children: [run('AMENAZAS Y OPORTUNIDADES', { size: 46, bold: true, color: NAVY })],
    alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
  new Paragraph({ children: [run('PODCAST — FRIEDMAN HAYEK CENTER', { size: 24, bold: true, color: ACC })],
    alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
  new Paragraph({ children: [run('Temporada 1  ·  12 episodios  ·  noviembre 2026 – junio 2027', { size: 20, color: MUT })],
    alignment: AlignmentType.CENTER, spacing: { after: 1200 } }));
kids.push(table([2900, 6700], [
  [{ t: 'Contenido', fill: LIGHT, bold: true }, 'Flujo de producción por episodio · Día de grabación · Roles · Amenazas · Oportunidades'],
  [{ t: 'Ciclo', fill: LIGHT, bold: true }, '20 días por episodio, de D-20 a D+7'],
  [{ t: 'Documentos relacionados', fill: LIGHT, bold: true }, '1. Proyecto y armado  ·  2. Presupuesto'],
], { header: false }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 1 — FLUJO */
kids.push(h1('1. Flujo de producción por episodio'));
kids.push(p([run('D0 = día de publicación. ', { bold: true }),
  run('Cada episodio se gestiona como un proyecto de 20 días en Asana, con el prefijo habitual ("matias:" / "mati:") para que las tareas aparezcan en el widget de tareas del día.')], { after: 160 }));

const FASES = [
  ['PREPARACIÓN', ORANGE, [
    ['D-20', 'Confirmar invitado y fecha por escrito', 'Frank', 'Una intención verbal no reserva la fecha'],
    ['D-18', 'Cargar la actividad en el alta por Formulario', 'Matías', 'El flujo la distribuye a la hoja de cada uno. Avisar a mano por el grupo: el sistema todavía no notifica'],
    ['D-16', 'Solicitar la sala con el PDF del proyecto', 'Matías', 'A armadodeaulas@. Los eventos con misma fecha y hora van en un solo PDF'],
    ['D-14', 'Enviar la lista de seguridad', 'Matías', 'A seguridad@, formato APELLIDO NOMBRE, expositor en negrita arriba, sin DNIs repetidos, con fecha, hora, sede y sala'],
    ['D-12', 'Investigación previa y guion de preguntas', 'Frank', 'Incluye el contraargumento del bloque 5, que es obligatorio'],
    ['D-10', 'Enviar instrucciones al invitado', 'Frank', 'Horario, cómo llegar, duración, código de vestimenta y temas generales. Nunca las preguntas exactas'],
    ['D-9', 'Confirmar catering y traslado', 'Matías', 'Y reconfirmar la asistencia del invitado'],
  ]],
  ['GRABACIÓN', BLUE, [
    ['D-8', 'GRABACIÓN', 'Matías + operador', 'Llegar 90 minutos antes. Prueba de audio con auriculares, prueba de luz y encuadre en las 3 cámaras'],
    ['D-8', 'Respaldo del material', 'Matías', 'A SSD y a la nube, antes de desarmar el set. Nunca se desarma sin respaldo hecho'],
  ]],
  ['POSPRODUCCIÓN', LIGHT, [
    ['D-7', 'Enviar material al editor', 'Matías', 'Con notas de los momentos destacados y del fragmento elegido para el cold open'],
    ['D-4', 'Recibir el corte y devolver correcciones', 'Frank', 'Una sola ronda de correcciones. Más rondas rompen la cadencia'],
    ['D-3', 'Portada en Canva', 'Paz', 'Con la plantilla del FHC'],
    ['D-2', 'Versión final aprobada y clips cortados', 'Paz', '5 a 7 clips verticales'],
  ]],
  ['PUBLICACIÓN', GRN, [
    ['D-1', 'Subida programada', 'Matías', 'YouTube con formato "Expositor. Título", descripción estándar, portada de Canva, público. Y subida al hosting de audio'],
    ['D-1', 'Newsletter armada en Perfit', 'Martina', 'Segmentada por interés. Filtrar los 165 contactos no enviables'],
    ['D0', 'PUBLICACIÓN', 'Todos', 'La newsletter sale 2 horas después del video. Primer clip el mismo día'],
    ['D+1 a D+7', 'Clips escalonados y carga del invitado', 'Paz / Matías', 'Contacto del invitado a la Base Maestra con su interés asignado'],
    ['D+7', 'Métricas cargadas', 'Matías', 'A la planilla de seguimiento de la temporada'],
  ]],
];
FASES.forEach(([fase, color, filas]) => {
  kids.push(table([9600], [[{ t: fase, fill: color, bold: true, size: 18, align: AlignmentType.CENTER }]], { header: false }));
  kids.push(table([1100, 3000, 1700, 3800],
    [['Momento', 'Tarea', 'Responsable', 'Detalle'], ...filas.map(r => [
      { t: r[0], align: AlignmentType.CENTER, bold: true }, { t: r[1], bold: r[1] === r[1].toUpperCase() },
      { t: r[2], align: AlignmentType.CENTER }, r[3]])],
    { zebra: true }));
  kids.push(spacer(140));
});

kids.push(h2('1.1 Integración con los sistemas que ya andan'));
kids.push(table([3100, 6500], [
  ['Sistema', 'Cómo lo usa el podcast'],
  ['Alta de actividad\nForms → Power Automate → Office Script → Excel', 'Cada episodio se carga como actividad y las tareas aparecen solas en la hoja de cada uno. Limitación conocida: no avisa a nadie cuando carga algo, así que hay que avisar a mano'],
  ['Reserva de sala automática', 'Cuando se guarde el flujo de Power Automate pendiente, la solicitud del podcast se dispara sola'],
  ['Avisos diarios', 'Recordatorio de las fechas de grabación y publicación'],
  ['Base Maestra Unificada', 'Invitados y altas nuevas entran acá. Los cuatro intereses que faltan crear — Liberalismo, Historia, Derecho y Filosofía — son exactamente los ejes temáticos de la grilla'],
  ['Canal de YouTube', 'Mismo canal, misma nomenclatura, playlist propia de la temporada'],
  ['Perfit', 'Un envío por episodio, segmentado por interés. Filtrar los 165 contactos no enviables'],
  ['Asana', 'Tareas con el prefijo habitual para que aparezcan en el widget de tareas del día'],
], { zebra: true }));
kids.push(table([9600], [[{ t: 'Dependencia crítica: la segmentación de los envíos del podcast no funciona hasta que estén creados los cuatro intereses nuevos en la Base Maestra y filtrados los 165 contactos no enviables. Tiene que estar listo antes del 05/11/2026.', fill: WARN, bold: true, size: 18 }]], { header: false }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 2 — DÍA DE GRABACIÓN */
kids.push(h1('2. Checklist del día de grabación'));
const CHK = [
  ['T-90 min', 'Montaje', [
    'Encender y ubicar las 3 cámaras. Verificar tarjetas vacías y alimentación continua conectada.',
    'Montar micrófonos y brazos. Conectar consola y grabador de respaldo.',
    'Encender luces y fijar altura de trípodes según las marcas del set.',
    'Apagar el aire acondicionado y cerrar ventanas.',
    'Colocar el cartel de "Grabando" en la puerta.',
  ]],
  ['T-45 min', 'Pruebas', [
    'Prueba de audio con auriculares puestos, hablando a volumen real. No alcanza con mirar los niveles.',
    'Prueba de encuadre y foco en las 3 cámaras. Verificar que la claqueta entre en los tres planos.',
    'Verificar balance de blancos igual en las 3 cámaras.',
    'Grabar 30 segundos de prueba y reproducirlos.',
  ]],
  ['T-20 min', 'Recepción', [
    'Agua sin gas y café servidos y listos.',
    'Recibir al invitado y acompañarlo al área de espera.',
    'Diez minutos de charla sin cámaras prendidas.',
    'Explicar la estructura del episodio, incluido el bloque de la objeción.',
    'Celulares en silencio y fuera de la mesa, incluido el del invitado.',
  ]],
  ['T-0', 'Grabación', [
    'Claqueta.',
    'Grabar de corrido. Si hay un error, se repite la frase y se sigue: se arregla en edición.',
    'Anotar el minuto de los momentos destacados mientras se graba.',
  ]],
  ['T+0', 'Cierre', [
    'Entregar el regalo institucional y sacar la foto con el invitado.',
    'RESPALDAR EL MATERIAL a SSD y nube antes de desarmar nada.',
    'Verificar que el respaldo abre y se reproduce.',
    'Recién entonces desarmar.',
  ]],
];
CHK.forEach(([t, titulo, items]) => {
  kids.push(table([1500, 8100], [[
    { t: t, fill: ACC, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER },
    { t: titulo, fill: ACC, bold: true, color: 'FFFFFF' }]], { header: false }));
  items.forEach(i => kids.push(L.bullet(i)));
  kids.push(spacer(120));
});

/* 3 — ROLES */
kids.push(h1('3. Roles'));
kids.push(table([2600, 2000, 5000], [
  ['Función', 'Responsable', 'Alcance'],
  ['Dirección editorial', 'Frank', 'Aprueba temas e invitados. Decide en caso de duda editorial'],
  ['Conducción', 'A definir', 'Decisión pendiente. Ver nota abajo'],
  ['Producción y logística', 'Matías', 'Sala, seguridad, catering, equipos, grabación, respaldo y publicación'],
  ['Diseño y difusión', 'Paz', 'Portadas, clips, carruseles y redes'],
  ['Web y base de datos', 'Martina', 'Transcripciones, formularios, envíos y WhatsApp'],
  ['Edición', 'Freelance', 'Video largo y clips'],
], { zebra: true }));
kids.push(h3('Decisión pendiente: quién conduce'));
kids.push(table([2600, 4400, 2600], [
  ['Opción', 'Qué implica', 'Costo adicional'],
  ['1. Conductor fijo interno (recomendada)', 'Mejor para construir identidad. Requiere alguien del equipo con disponibilidad garantizada y cómodo en cámara', { t: 'Ninguno', align: AlignmentType.CENTER }],
  ['2. Conductor fijo externo', 'Suma oficio y probablemente audiencia propia', { t: 'USD 150 a 300 por episodio', align: AlignmentType.CENTER }],
  ['3. Conducción rotativa', 'Flexible, pero la audiencia se ata a una voz: rotar dispersa lo que se construye', { t: 'Ninguno', align: AlignmentType.CENTER }],
], { zebra: true }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

/* 4 — AMENAZAS */
kids.push(h1('4. Amenazas'));
const AM = [
  ['La cadencia se cae por falta de tiempo interno', 'Alta', 'Alto',
   'Edición freelance. Jornadas dobles antes de los recesos. Un episodio de reserva grabado y editado desde el inicio de la temporada'],
  ['Un invitado cancela sobre la fecha', 'Alta', 'Medio',
   'Tener siempre dos invitados confirmados por adelantado. El colchón de 9 a 13 días entre grabación y publicación permite reprogramar sin perder la fecha'],
  ['Bajo alcance en los primeros episodios', 'Alta', 'Bajo',
   'Es lo esperable: ningún podcast arranca con audiencia. La métrica de los primeros tres episodios es la consistencia, no las reproducciones. Acordar esto con el financiador antes de empezar'],
  ['Audio arruinado y se pierde la entrevista', 'Baja', 'Muy alto',
   'Grabador de respaldo en paralelo. Prueba de audio con auriculares antes de cada toma. Respaldo del material antes de desarmar el set'],
  ['El financiamiento se aprueba parcialmente', 'Media', 'Medio',
   'Arrancar con el escenario Austero y escalar. El proyecto es viable con USD 3.300 de equipamiento'],
  ['El set se pide para otra cosa y hay que desarmarlo', 'Media', 'Medio',
   'Gestionar la asignación permanente de la sala desde el inicio. Documentar el armado con fotos para poder rehacerlo rápido'],
  ['Reclamo de derechos por música en YouTube', 'Baja', 'Alto',
   'Solo biblioteca con licencia comercial. Está presupuestado. Un reclamo afecta al canal entero, no solo al episodio'],
  ['Un invitado genera un problema reputacional', 'Baja', 'Alto',
   'Chequeo previo obligatorio antes de confirmar. Ante duda, consulta con coordinación'],
  ['La grilla queda desbalanceada', 'Media', 'Medio',
   'Los criterios de balance se revisan al cerrar cada tanda de tres invitados, no al final de la temporada'],
  ['El conductor no se define a tiempo', 'Media', 'Alto',
   'Es la decisión que bloquea el resto. Fecha límite: antes de la aprobación del presupuesto, porque cambia el costo por episodio'],
];
const chip = v => ({ t: v, align: AlignmentType.CENTER, bold: true,
  fill: ({ 'Muy alto': RED, 'Alto': RED, 'Media': YEL, 'Medio': YEL, 'Alta': RED, 'Baja': GRN, 'Bajo': GRN })[v] });
kids.push(table([3000, 1100, 1100, 4400],
  [['Amenaza', 'Prob.', 'Impacto', 'Mitigación'],
   ...AM.map(r => [r[0], chip(r[1]), chip(r[2]), r[3]])], { zebra: true }));

/* 5 — OPORTUNIDADES */
kids.push(h1('5. Oportunidades'));
const OP = [
  ['Grabar a los expositores que ya vienen', 'Alta',
   'Los expositores del Ayn Rand Center (29/10) y de las Jornadas Adam Smith (26/11) ya están en la oficina. Grabar el mismo día elimina el costo y la fricción de traerlos. Reservar el set esas fechas'],
  ['El equipamiento sirve para todo lo demás', 'Alta',
   'Cámaras, micrófonos y luces quedan disponibles para grabar seminarios, transmitir eventos en vivo y producir clips de las Jornadas. El costo se reparte entre varias actividades del Center'],
  ['Alimentar la Base Maestra con público nuevo', 'Alta',
   'Los eventos presenciales convocan a quien ya está cerca. El podcast llega a quien no conoce al FHC y lo devuelve a la base vía formulario de suscripción'],
  ['Los cuatro intereses nuevos ya estaban planificados', 'Alta',
   'Liberalismo, Historia, Derecho y Filosofía son a la vez los ejes de la grilla y los intereses pendientes de crear en la Base Maestra. El podcast le da uso inmediato a un trabajo que ya había que hacer'],
  ['Catálogo que no caduca', 'Media',
   'Los episodios no comentan la actualidad, así que siguen siendo vistos meses después. A diferencia de un evento, el valor se acumula'],
  ['Carta de presentación institucional', 'Media',
   'Un podcast que publica en fecha durante ocho meses dice más de una organización que cualquier informe. Sirve para conseguir invitados mejores, sponsors y prensa'],
  ['Red de invitados', 'Media',
   'Doce invitados de rubros distintos son doce vínculos nuevos para el Center, que sirven para futuras actividades más allá del podcast'],
  ['Ampliar el alcance más allá de Argentina', 'Media',
   'La comunidad hispanohablante de ideas de la libertad en Chile, Perú, Colombia, México y España consume en YouTube por algoritmo. El costo marginal de alcanzarla es cero'],
  ['Semillero de contenido derivado', 'Baja',
   'Cada episodio da material para clips, citas, newsletters y notas. Una grabación de 90 minutos alimenta nueve piezas'],
];
const chipOp = v => ({ t: v, align: AlignmentType.CENTER, bold: true,
  fill: ({ 'Alta': GRN, 'Media': YEL, 'Baja': GREY })[v] });
kids.push(table([3000, 1100, 5500],
  [['Oportunidad', 'Potencial', 'Cómo se captura'],
   ...OP.map(r => [r[0], chipOp(r[1]), r[2]])], { zebra: true }));

kids.push(h2('5.1 Las tres que conviene mover ya'));
kids.push(table([700, 3200, 5700], [
  ['#', 'Acción', 'Cuándo'],
  [{ t: '1', align: AlignmentType.CENTER, bold: true }, 'Reservar el set para el 29/10 y el 26/11',
   'Antes de fin de septiembre. Son dos episodios que se graban sin costo de traslado ni gestión de invitado'],
  [{ t: '2', align: AlignmentType.CENTER, bold: true }, 'Crear los cuatro intereses en la Base Maestra',
   'Antes del 05/11. Sin esto, la segmentación de los envíos del podcast no funciona'],
  [{ t: '3', align: AlignmentType.CENTER, bold: true }, 'Definir quién conduce',
   'Antes de presentar el presupuesto: cambia el costo por episodio'],
], { zebra: true }));

const doc = new Document({
  creator: 'Friedman Hayek Center — UCEMA',
  title: 'Podcast FHC — Flujo de producción, amenazas y oportunidades',
  styles: { default: { document: { run: { font: 'Calibri', size: 18 } } } },
  sections: [{
    properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
    footers: { default: new Footer({ children: [new Paragraph({
      children: [run('Podcast FHC — Flujo de producción, amenazas y oportunidades    ·    ', { size: 14, color: MUT }),
                 new TextRun({ children: [PageNumber.CURRENT], size: 14, color: MUT, font: 'Calibri' })],
      alignment: AlignmentType.RIGHT })] }) },
    children: kids,
  }],
});
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(__dirname + '/3-Podcast-FHC-Flujo-amenazas-oportunidades.docx', b);
  console.log('OK 3-Podcast-FHC-Flujo-amenazas-oportunidades.docx', (b.length / 1024).toFixed(0) + ' KB');
});
