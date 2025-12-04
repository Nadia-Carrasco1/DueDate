import { getCookie } from './utils.js';
import { cargarSemanasDelMes } from './descargarPDF.js';
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
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
      day: 'Día',
      list: 'Eventos',
    },
    datesSet: function(info) {
      cargarSemanasDelMes(calendar); 
    },
    dateClick: function(info) {
      const modal = document.getElementById('modalCrearEvento');
      const fiInput = document.querySelector('input[name="fecha_inicio"]');
      const ffInput = document.querySelector('input[name="fecha_fin"]');
      const recInput = document.querySelector('input[name="recordatorio_fecha_hora"]');
      const formatoLocal = fecha => fecha.toISOString().slice(0, 16);

      const fechaInicio = new Date(info.dateStr + "T12:00");
      const fechaFin = new Date(fechaInicio.getTime() + 60 * 60 * 1000);

      fiInput.value = formatoLocal(fechaInicio);
      ffInput.value = formatoLocal(fechaFin);

      ffInput.min = fiInput.value;        
      recInput && (recInput.max = fiInput.value);  

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
      const colorEvento = info.event.backgroundColor || info.event.extendedProps.color;

      if (info.view.type === 'listWeek') {
          const originalBg = info.el.style.backgroundColor;

          info.el.addEventListener('mouseenter', () => {
              info.el.style.backgroundColor = 'rgba(79,70,229,0.5)'; // Indigo-700/80

              const hora = info.el.querySelector('.fc-list-event-time');
              const titulo = info.el.querySelector('.fc-list-event-title a');
              if (hora) hora.style.color = 'white';
              if (titulo) titulo.style.color = 'white';
          });

          info.el.addEventListener('mouseleave', () => {
              info.el.style.backgroundColor = originalBg;
              const hora = info.el.querySelector('.fc-list-event-time');
              const titulo = info.el.querySelector('.fc-list-event-title a');
              if (hora) hora.style.color = '';
              if (titulo) titulo.style.color = '';
          });
      }

      if (info.view.type === 'timeGridDay' || info.view.type === 'timeGridWeek') {
          if (colorEvento === "#FFEB3B") {
              const hora = info.el.querySelector('.fc-event-time');
              const titulo = info.el.querySelector('.fc-event-title');
              if (hora) hora.style.color = 'black';
              if (titulo) titulo.style.color = 'black';
          }
      }

      if (info.event.extendedProps.descripcion) {
          tippy(info.el, {
              content: info.event.extendedProps.descripcion,
              placement: 'top',
              theme: 'light',
              onShow(instance) {
                  const contenido = instance.popper.querySelector('.tippy-content');
                  if (contenido && colorEvento === "#FFEB3B") {
                      contenido.style.color = 'black';
                  }
              }
          });
      }
    }


  
  });

  calendar.render();

  cargarSemanasDelMes(calendar);
  mostrarMensajesDjango();
  
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
export function mostrarMensajesDjango() {
    const djangoMessages = document.getElementById('djangoMessages');

    if (djangoMessages) {

        djangoMessages.offsetHeight;  

        djangoMessages.style.opacity = '1';

        setTimeout(() => {
            djangoMessages.style.opacity = '0';
        }, 3000); 
    }
}
