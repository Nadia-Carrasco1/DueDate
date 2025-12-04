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

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            overlay.classList.add('hidden');
        }
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

    document.getElementById('eventoTitulo').textContent = evento.title;
    document.getElementById('eventoInicio').textContent = evento.start.toLocaleString('es-AR', opciones);
    document.getElementById('eventoFin').textContent = evento.end
        ? evento.end.toLocaleString('es-AR', opciones)
        : evento.start.toLocaleString('es-AR', opciones);

    const descripcion = evento.extendedProps.descripcion;
    document.getElementById('eventoDescripcion').textContent = descripcion || "";
    document.getElementById('filaDescripcion').style.display = descripcion ? "block" : "none";

    const recordatorioFecha = evento.extendedProps.recordatorio_fecha_hora;
    if (recordatorioFecha) {
      document.getElementById('eventoRecordatorio').textContent = "";
      document.getElementById('eventoRecordatorioFecha').textContent =
        new Date(recordatorioFecha).toLocaleString('es-AR', opciones);
      document.getElementById('filaRecordatorio').style.display = "block";
    } else {
      document.getElementById('filaRecordatorio').style.display = "none";
    }

    if (esRecurrente) {
      document.getElementById('eventoRepeticion').textContent = "cada año";
      document.getElementById('filaRepeticion').style.display = "block";
    } else {
      document.getElementById('filaRepeticion').style.display = "none";
    }

    document.getElementById('eventoIdEliminar').value = evento.id;

    const btnEditar = document.getElementById('abrirEditarModalBtn');
    btnEditar.onclick = () => abrirModalEditarEvento(evento, calendar);

    modal.classList.remove('hidden');
  });



  const btnAbrirCrear = document.querySelector('[onclick="abrirModalCrearEvento()"]');
  if (btnAbrirCrear) {
    btnAbrirCrear.addEventListener('click', abrirModalCrearEvento);
  }
}

export function abrirModalCrearEvento() {
  const modal = document.getElementById('modalCrearEvento');
  if (!modal) return;

  modal.classList.remove('hidden');

  const fechaInput = document.querySelector('#eventoForm input[name="fecha_inicio"]');
  const finInput = document.querySelector('#eventoForm input[name="fecha_fin"]');

  if (fechaInput && finInput) {
    const ahora = new Date();

    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const hora = String(ahora.getHours()).padStart(2, '0');
    const minuto = String(ahora.getMinutes()).padStart(2, '0');

    const fechaActual = `${año}-${mes}-${dia}T${hora}:${minuto}`;

    fechaInput.value = fechaActual;
    finInput.value = fechaActual;
  }

  const form = document.getElementById('eventoForm');
  form.querySelectorAll('input[type="text"], textarea').forEach(input => input.value = '');
}
