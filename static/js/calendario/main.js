import { initModales } from './modales.js';
import { initCalendar } from './calendario.js';
import { initExportacion, exportEvents } from './descargarPDF.js';

document.addEventListener('DOMContentLoaded', () => {
  initModales();

  const calendar = initCalendar();

  initExportacion(calendar);

  window.exportEvents = function(range) {
    exportEvents(calendar, range);
  };
});
