import { getCookie } from './utils.js';

export function initCalendar() {
  const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
    initialView: 'dayGridMonth',
    timeZone: 'local',
    locale: 'es',
    editable: true,
    eventResizableFromStart: true,
    events: '/eventos_json/',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,downloadBtn'
    },
    customButtons: {
      downloadBtn: {
        text: '📥',
        click: () => {
          const dropdown = document.getElementById('dropdown-export');
          dropdown.classList.toggle('hidden');
        }
      }
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día'
    },
    dateClick: function(info) {
      const modal = document.getElementById('modalCrearEvento');
      const fiInput = document.querySelector('input[name="fecha_inicio"]');
      const ffInput = document.querySelector('input[name="fecha_fin"]');
      const recInput = document.querySelector('input[name="recordatorio_fecha_hora"]');
      const formatoLocal = fecha => fecha.toISOString().slice(0, 16);

      // Fecha inicio a mediodía, fin 1 hora después
      const fechaInicio = new Date(info.dateStr + "T12:00");
      const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

      fiInput.value = formatoLocal(fechaInicio);
      ffInput.value = formatoLocal(fechaFin);

      // **Establecer límites para que no se puedan seleccionar horas inválidas**
      ffInput.min = fiInput.value;        // La fecha fin no puede ser menor que inicio
      recInput && (recInput.max = fiInput.value);  // El recordatorio no puede ser posterior a inicio

      // Actualizar límites dinámicamente si cambia fecha inicio
      fiInput.addEventListener('change', () => {
        if (ffInput.value < fiInput.value) {
          ffInput.value = fiInput.value;
        }
        ffInput.min = fiInput.value;

        if (recInput && recInput.value > fiInput.value) {
          recInput.value = fiInput.value;
        }
        if (recInput) recInput.max = fiInput.value;
      });

      modal.classList.remove('hidden');
    },

    eventClick: function(info) {
      document.dispatchEvent(new CustomEvent('calendar:eventClick', { detail: info.event }));
    },
    eventDrop: function(info) {
      actualizarFechaEvento(info.event);
    },
    eventResize: function(info) {
      actualizarFechaEvento(info.event);
    },
    eventDidMount: function(info) {
      if (info.event.extendedProps.descripcion) {
        tippy(info.el, {
          content: info.event.extendedProps.descripcion,
          placement: 'top',
          theme: 'light'
        });
      }
    }
  });

  calendar.render();

  const downloadBtn = document.querySelector('.fc-downloadBtn-button');
  const dropdown = document.getElementById('dropdown-export');

  if (downloadBtn && dropdown) {
    downloadBtn.addEventListener('click', () => {
      dropdown.classList.toggle('hidden');
      const rect = downloadBtn.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
  
      dropdown.style.left = (rect.left + scrollLeft) + 'px';
      dropdown.style.top = (rect.bottom + scrollTop) + 'px';
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target) && !downloadBtn.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  function actualizarFechaEvento(event) {
    fetch(`/actualizar-fecha/${event.id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({
        fecha_inicio: event.start.toISOString(),
        fecha_fin: event.end ? event.end.toISOString() : null
      })
    }).then(() => calendar.refetchEvents());
  }
  

  return calendar;
}
