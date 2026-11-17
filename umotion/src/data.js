// Ejemplos de automatizaciones (copiados de la web actual de Umotion)
export const SECTORS = {
  hosteleria: {
    who: 'Bares, restaurantes y cafeterías',
    headline: 'Menos teléfono en plena hora punta.',
    tasks: [
      ['Entra una reserva por WhatsApp o por la web', 'Se apunta en tu agenda y el cliente recibe la confirmación'],
      ['Se acerca la hora de la reserva', 'El cliente recibe un recordatorio y puede avisar si no viene'],
      ['Cierras la caja', 'Te llega al móvil el resumen del día'],
      ['Llegan las facturas de proveedores', 'Se ordenan solas en una hoja para tu gestoría'],
    ],
  },
  comercio: {
    who: 'Tiendas y comercio de barrio',
    headline: 'Encargos y existencias bajo control.',
    tasks: [
      ['Un cliente encarga por WhatsApp', 'El encargo queda anotado con su número y su estado'],
      ['Un producto baja del mínimo', 'Recibes un aviso para reponerlo'],
      ['El encargo está listo', 'El cliente recibe un aviso para pasar a recogerlo'],
      ['Empieza la semana', 'Tienes en tu correo lo que más se vendió la anterior'],
    ],
  },
  profesionales: {
    who: 'Autónomos, despachos, clínicas y oficios',
    headline: 'Más tiempo para tu trabajo, menos para la gestión.',
    tasks: [
      ['Alguien pide cita', 'Se agenda en tu calendario con confirmación y recordatorio'],
      ['Entra un correo de un cliente', 'Se clasifica y la IA te deja preparado un borrador de respuesta'],
      ['Un cliente te envía documentos', 'Se guardan en su carpeta con el nombre correcto'],
      ['Vence una factura sin cobrar', 'Sale un recordatorio amable al cliente'],
    ],
  },
  pymes: {
    who: 'Empresas con equipo',
    headline: 'Que el equipo no pierda horas copiando datos.',
    tasks: [
      ['Entra un contacto por la web', 'Se registra en tu gestión de clientes y se asigna a alguien'],
      ['Se aprueba un presupuesto', 'Se crea el proyecto y se avisa a quien corresponde'],
      ['Empieza el día', 'Llega un informe con las cifras que importan'],
      ['Un dato cambia en un programa', 'Se actualiza en los demás sin teclearlo otra vez'],
    ],
  },
};
