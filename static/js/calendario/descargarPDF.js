export function initExportacion(calendar) {
  const selectorSemana = document.getElementById('selector-semana');
  const btnDescargarSemana = document.getElementById('btnDescargarSemana');
  
  cargarSemanasDelMes(calendar);

  if (selectorSemana && btnDescargarSemana) {
    selectorSemana.addEventListener('change', () => {
      if (selectorSemana.value) {
        btnDescargarSemana.disabled = false;
        btnDescargarSemana.classList.remove('bg-neutral-700', 'cursor-not-allowed', 'border', 'border-neutral-600', 'opacity-60');
        btnDescargarSemana.classList.add('bg-indigo-700/50', 'hover:bg-indigo-700/80', 'cursor-pointer');
      } else {
        btnDescargarSemana.disabled = true;
        btnDescargarSemana.classList.remove('bg-indigo-700/50', 'hover:bg-indigo-700/80', 'cursor-pointer');
        btnDescargarSemana.classList.add('bg-neutral-700', 'cursor-not-allowed', 'border', 'border-neutral-600', 'opacity-60');
      }
    });

    selectorSemana.dispatchEvent(new Event('change'));

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

export function cargarSemanasDelMes(calendar) {
  const selector = document.getElementById('selector-semana');
  if (!selector) return;

  selector.innerHTML = '<option disabled selected value="">Seleccionar semana</option>';

  try {
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

  } catch (error) {
    console.error("Error al cargar las semanas del mes:", error);
  }

  selector.value = '';
  selector.dispatchEvent(new Event('change'));
}

export async function exportEvents(calendar, range = 'week') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
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

      label = "Semana actual";
    } 
    else if (range === 'month') {
      start = calendarApi.view.currentStart;
      end = new Date(calendarApi.view.currentEnd.getTime() - 1);
      label = "Mes actual";
    }
  } 
  else if (range.customRange) {
    start = range.start;
    end = range.end;
    label = range.label || "Rango personalizado";
  }

  const eventosFiltrados = calendarApi
    .getEvents()
    .filter(event => new Date(event.start) >= start && new Date(event.start) <= end);

  if (eventosFiltrados.length === 0) {
    mostrarMensajeExportacion("No hay eventos en el período seleccionado.", "error");
    return;
  }


  const eventosPorDia = {};

  eventosFiltrados.forEach(event => {
    const fecha = new Date(event.start);
    fecha.setHours(0,0,0,0);

    const clave = fecha.toISOString().split("T")[0];

    if (!eventosPorDia[clave]) eventosPorDia[clave] = [];
    eventosPorDia[clave].push(event);
  });

  const opcionesFecha = { day: "2-digit", month: "2-digit", year: "numeric" };
  const opcionesHora = { hour: "2-digit", minute: "2-digit", hour12: false };

  doc.setFillColor(70, 60, 140);
  doc.rect(0, 0, 210, 25, "F");

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(`Due Date – ${label}`, 10, 16);

  doc.setDrawColor(140, 120, 200);
  doc.setLineWidth(1);
  doc.line(10, 28, 200, 28);

  let y = 40;

  const fechasOrdenadas = Object.keys(eventosPorDia).sort();

  fechasOrdenadas.forEach((fechaStr, index) => {
    const fechaObj = new Date(fechaStr + "T00:00:00");

    if (fechaObj >= start && fechaObj <= end) {
      const fecha = fechaObj.toLocaleDateString("es-AR", opcionesFecha);
      const dia = fechaObj.toLocaleDateString("es-AR", { weekday: "long" });
      const tituloDia = `${dia.charAt(0).toUpperCase() + dia.slice(1)} – ${fecha}`;

      doc.setFillColor(240, 240, 255);
      doc.roundedRect(10, y - 5, 190, 12, 2, 2, "F");
      
      doc.setFontSize(13);
      doc.setTextColor(50, 40, 120);
      doc.text(tituloDia, 14, y + 3);

      y += 10;

      eventosPorDia[fechaStr].forEach(evt => {
        const inicio = new Date(evt.start).toLocaleTimeString("es-AR", opcionesHora);
        const fin = evt.end ? new Date(evt.end).toLocaleTimeString("es-AR", opcionesHora) : inicio;

        const line = `${inicio} - ${fin}  |  ${evt.title}`;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        y += 6;
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.text(line, 16, y);
      });

      y += 8;
    }

    if (y > 270 && index < fechasOrdenadas.length - 1) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save(`${label.replace(/\s+/g, '_').toLowerCase()}_eventos.pdf`);
  mostrarMensajeExportacion("PDF descargado correctamente.", "success");

}

function mostrarMensajeExportacion(texto, tipo = "error") {
    const contenedor = document.getElementById("mensaje-exportacion");
    const mensaje = document.getElementById("texto-mensaje-exportacion");

    if (!contenedor || !mensaje) return;

    mensaje.textContent = texto;

    mensaje.className =
        "px-4 py-2 rounded shadow text-white " +
        (tipo === "success"
            ? "bg-green-600"
            : "bg-red-600");

    contenedor.classList.remove("hidden", "opacity-0");
    contenedor.classList.add("opacity-100");

    setTimeout(() => {
        contenedor.classList.add("opacity-0");
        setTimeout(() => contenedor.classList.add("hidden"), 300);
    }, 3000);
}
