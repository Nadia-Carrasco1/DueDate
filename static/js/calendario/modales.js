import { abrirModalEditarEvento } from './edicionEvento.js';

export function initModales(calendar) {
  const formEliminar = document.getElementById('formEliminarEvento');
  const modalConfirmar = document.getElementById('modalConfirmarEliminar');

  if (formEliminar) {
    formEliminar.addEventListener('submit', function (e) {
      e.preventDefault();
      modalConfirmar.classList.remove('hidden');
    });
  }

  const btnCancelar = document.getElementById('cancelarEliminarBtn');
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      modalConfirmar.classList.add('hidden');
    });
  }

  const btnConfirmarEliminar = document.getElementById('confirmarEliminarBtn');
  if (btnConfirmarEliminar) {
    btnConfirmarEliminar.addEventListener('click', () => {
      formEliminar.submit();
    });
  }

  document.querySelectorAll('.cerrar-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.fixed').classList.add('hidden');
    });
  });

  document.querySelectorAll('.mensaje-django').forEach(msg => {
    setTimeout(() => {
      msg.classList.add('opacity-0');
      setTimeout(() => {
        msg.remove(); 
      }, 500); 
    }, 4000); 
  });


  document.addEventListener('calendar:eventClick', function(e) {
    const evento = e.detail;
    const modal = document.getElementById('modalVerEvento');
    const opciones = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false };
    const esRecurrente = evento._def.recurringDef != null;

    document.getElementById('eventoRepeticion').textContent = esRecurrente ? 'Este evento se repite cada año' : '—';
    document.getElementById('eventoTitulo').textContent = evento.title;
    document.getElementById('eventoInicio').textContent = evento.start.toLocaleString('es-AR', opciones);
    document.getElementById('eventoFin').textContent = evento.end ? evento.end.toLocaleString('es-AR', opciones) : evento.start.toLocaleString('es-AR', opciones);
    document.getElementById('eventoDescripcion').textContent = evento.extendedProps.descripcion || '—';
    document.getElementById('eventoRecordatorio').textContent = evento.extendedProps.recordatorio_fecha_hora ? 'activado - ' : 'no activado';
    document.getElementById('eventoRecordatorioFecha').textContent = evento.extendedProps.recordatorio_fecha_hora
      ? new Date(evento.extendedProps.recordatorio_fecha_hora).toLocaleString('es-AR', opciones)
      : '';
    document.getElementById('eventoIdEliminar').value = evento.id;

    const btnEditar = document.getElementById('abrirEditarModalBtn');
    btnEditar.onclick = () => abrirModalEditarEvento(evento, calendar);

    modal.classList.remove('hidden');
  });
}
