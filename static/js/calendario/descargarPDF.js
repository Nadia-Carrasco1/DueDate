export function initExportacion(calendar) {
  const downloadBtn = document.querySelector('.fc-downloadBtn-button');
  const dropdown = document.getElementById('dropdown-export');

  downloadBtn.addEventListener('click', function () {
    dropdown.classList.toggle('hidden');

    const rect = downloadBtn.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

    dropdown.style.top = (rect.bottom + scrollTop + 4) + 'px'; 
    dropdown.style.left = (rect.left + scrollLeft - 115) + 'px';
  });

  document.addEventListener('click', function (event) {
    if (!dropdown.contains(event.target) && !downloadBtn.contains(event.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

export async function exportEvents(calendar, range = 'week') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const calendarApi = calendar;
  let start, end;

  if (range === 'week') {
    const hoy = new Date();
    const diaSemana = hoy.getDay();

    start = new Date(hoy);
    start.setDate(hoy.getDate() - diaSemana);
    start.setHours(0, 0, 0, 0);

    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }else if (range === 'month') {
    start = calendarApi.view.currentStart; 
    end = calendarApi.view.currentEnd;
    end = new Date(end.getTime() - 1);
  } else {
    start = calendarApi.view.activeStart;
    end = calendarApi.view.activeEnd;
  }

  const eventosFiltrados = calendarApi.getEvents().filter(event => {
    const startDate = new Date(event.start);
    return startDate >= start && startDate <= end;
  });

  const mensajeDiv = document.getElementById('mensaje-pdf');
  if (mensajeDiv) mensajeDiv.remove();

  if (eventosFiltrados.length === 0) {
    const contenedor = document.querySelector('#calendar').parentElement;
    const mensaje = document.createElement('div');
    mensaje.id = 'mensaje-pdf';
    mensaje.className = 'text-red-600 font-semibold mb-4 text-center';
    mensaje.innerText = `No hay eventos ${range === 'week' ? 'en la semana' : range === 'month' ? 'en este mes' : 'en este período'} para exportar.`;
    contenedor.prepend(mensaje);
      setTimeout(() => {
        mensaje.remove();
      }, 3000);
    return;
  }

  const eventosPorDia = {};
  eventosFiltrados.forEach(event => {
    const fecha = new Date(event.start);
    fecha.setHours(0, 0, 0, 0);
    const clave =
      fecha.getFullYear() + '-' +
      String(fecha.getMonth() + 1).padStart(2, '0') + '-' +
      String(fecha.getDate()).padStart(2, '0');

    if (!eventosPorDia[clave]) eventosPorDia[clave] = [];
    eventosPorDia[clave].push(event);
  });

  const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: false };

  const rangeTitles = {
    week: 'de la Semana',
    month: 'del Mes'
  };

  const titulo = rangeTitles[range] || 'de la Vista';

  let y = 20;
  doc.setFontSize(16);
  doc.text(`Due Date: Eventos ${titulo}`, 10, y);
  y += 4;

  const fechasOrdenadas = Object.keys(eventosPorDia).sort();

  fechasOrdenadas.forEach(fechaStr => {
    const fechaObj = new Date(fechaStr + 'T00:00:00');

    if (fechaObj >= start && fechaObj <= end) {
      const fechaFormateada = fechaObj.toLocaleDateString('es-AR', opcionesFecha);
      const nombreDia = fechaObj.toLocaleDateString('es-AR', { weekday: 'long' });

      doc.setFontSize(14);
      doc.setTextColor(92, 38, 151);
      y += 8;
      doc.text(`${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} - ${fechaFormateada}`, 10, y);
      y += 2;

      eventosPorDia[fechaStr].forEach(evt => {
        const horaInicio = new Date(evt.start).toLocaleTimeString('es-AR', opcionesHora);
        const horaFin = evt.end ? new Date(evt.end).toLocaleTimeString('es-AR', opcionesHora) : horaInicio;

        const linea = `${horaInicio} - ${horaFin}  |  ${evt.title}`;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        y += 6;

        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.text(linea, 14, y);
      });
    }
  });

  doc.save(`${range}_eventos.pdf`);
}
