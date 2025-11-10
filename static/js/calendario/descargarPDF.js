export function initExportacion(calendar) {
  const downloadBtn = document.querySelector('.fc-downloadBtn-button');
  const dropdown = document.getElementById('dropdown-export');
  const selectorSemana = document.getElementById('selector-semana');
  const btnDescargarSemana = document.getElementById('btnDescargarSemana');

  if (selectorSemana && btnDescargarSemana) {
    selectorSemana.addEventListener('change', () => {
      if (selectorSemana.value) {
        btnDescargarSemana.disabled = false;
        btnDescargarSemana.classList.remove('bg-gray-500', 'cursor-not-allowed', 'border', 'border-gray-400');
        btnDescargarSemana.classList.add('bg-indigo-700', 'hover:bg-indigo-600', 'cursor-pointer');
      } else {
        btnDescargarSemana.disabled = true;
        btnDescargarSemana.classList.remove('bg-indigo-700', 'hover:bg-indigo-600', 'cursor-pointer');
        btnDescargarSemana.classList.add('bg-gray-500', 'cursor-not-allowed', 'border', 'border-gray-400');
      }
    });

    selectorSemana.dispatchEvent(new Event('change'));
  }

  downloadBtn.addEventListener('click', function () {
    dropdown.classList.toggle('hidden');

    cargarSemanasDelMes(calendar);

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

  if (btnDescargarSemana && selectorSemana) {
    btnDescargarSemana.addEventListener('click', () => {
      const selectedOption = selectorSemana.options[selectorSemana.selectedIndex];
      if (!selectedOption || !selectedOption.dataset.start) return;

      const start = new Date(selectedOption.dataset.start);
      const end = new Date(selectedOption.dataset.end);
      const label = selectedOption.textContent;

      exportEvents(calendar, {
        customRange: true,
        start,
        end,
        label
      });
    });
  }
}


function cargarSemanasDelMes(calendar) {
  const selector = document.getElementById('selector-semana');
  if (!selector) return;

  selector.innerHTML = '<option disabled selected value="">Seleccionar semana</option>';

  const startOfMonth = new Date(calendar.view.currentStart);
  const year = startOfMonth.getFullYear();
  const month = startOfMonth.getMonth();

  const primerDiaMes = new Date(year, month, 1);
  const diaSemana = primerDiaMes.getDay(); 
  const offset = -diaSemana;

  for (let i = 0; i < 6; i++) {
    const inicioSemana = new Date(primerDiaMes);
    inicioSemana.setDate(primerDiaMes.getDate() + offset + i * 7);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    const texto = `Semana del ${inicioSemana.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })} al ${finSemana.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}`;

    const option = document.createElement('option');
    option.value = `${inicioSemana.toISOString().split('T')[0]}_${finSemana.toISOString().split('T')[0]}`;
    option.dataset.start = inicioSemana.toISOString();
    option.dataset.end = finSemana.toISOString();
    option.textContent = texto;

    selector.appendChild(option);
  }

  selector.value = '';
  selector.dispatchEvent(new Event('change'));
}

export async function exportEvents(calendar, range = 'week') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const calendarApi = calendar;

  let start, end, label;

  if (typeof range === 'string') {
    if (range === 'week') {
      const hoy = new Date();
      const diaSemana = hoy.getDay();

      start = new Date(hoy);
      start.setDate(hoy.getDate() - diaSemana);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);

      label = 'Semana actual';
    } else if (range === 'month') {
      start = calendarApi.view.currentStart;
      end = new Date(calendarApi.view.currentEnd.getTime() - 1);
      label = 'Mes actual';
    }
  } else if (range.customRange) {
    start = range.start;
    end = range.end;
    label = range.label || 'Rango personalizado';
  } else {
    start = calendarApi.view.activeStart;
    end = calendarApi.view.activeEnd;
    label = 'Vista actual';
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
    mensaje.innerText = `No hay eventos en ${label.toLowerCase()} para exportar.`;
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

  let y = 20;
  doc.setFontSize(16);
  doc.text(`Due Date: Eventos - ${label}`, 10, y);
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

  doc.save(`${label.replace(/\s+/g, '_').toLowerCase()}_eventos.pdf`);
}
