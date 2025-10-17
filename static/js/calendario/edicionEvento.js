import { getCookie } from './utils.js';

export function abrirModalEditarEvento(evento, calendar) {
  fetch(`/obtener-formulario-edicion/${evento.id}/`)
    .then(response => response.text())
    .then(html => {
      const wrapper = document.querySelector('#modalEditarEvento .form-wrapper');
      wrapper.innerHTML = html;
      const form = wrapper.querySelector('form');
      const originalData = new FormData(form);
      form.dataset.original = JSON.stringify(Object.fromEntries(originalData));

      const fiInput = form.querySelector('input[name="fecha_inicio"]');
      const ffInput = form.querySelector('input[name="fecha_fin"]');
      const recInput = form.querySelector('input[name="recordatorio_fecha_hora"]');

      if (fiInput && ffInput) {
        ffInput.min = fiInput.value;

        if (ffInput.value < fiInput.value) {
          ffInput.value = fiInput.value;
        }

        fiInput.addEventListener('change', () => {
          ffInput.min = fiInput.value;
          if (ffInput.value < fiInput.value) {
            ffInput.value = fiInput.value;
          }

          if (recInput) {
            recInput.max = fiInput.value;
            if (recInput.value > fiInput.value) {
              recInput.value = fiInput.value;
            }
          }
        });
      }

      if (recInput && fiInput) {
        recInput.max = fiInput.value;

        recInput.addEventListener('change', () => {
          if (recInput.value > fiInput.value) {
            recInput.value = fiInput.value;
          }
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const csrftoken = getCookie('csrftoken');
        const formData = new FormData(form);
        const mensajeError = document.getElementById('mensajeErrorEditar');
        const mensajeSinCambios = document.getElementById('mensajeSinCambios');

        mensajeError.textContent = '';
        mensajeError.classList.add('hidden');
        mensajeSinCambios.textContent = '';
        mensajeSinCambios.classList.add('hidden');

        fetch(`/editar_evento/`, {
          method: 'POST',
          headers: { 'X-CSRFToken': csrftoken },
          body: formData
        })
        .then(resp => resp.json())
        .then(data => {
          if (data.status === 'ok') {
            document.getElementById('modalEditarEvento').classList.add('hidden');
            calendar.refetchEvents();
          } else {
            if (data.message === 'sin_cambios') {
              mensajeSinCambios.textContent = 'No se realizaron cambios en el evento.';
              mensajeSinCambios.classList.remove('hidden');
            } else {
              let msg = data.message;
              try {
                const parsed = JSON.parse(msg);
                msg = Object.values(parsed).map(val => val[0].message).join('\n');
              } catch (e) {}
              mensajeError.textContent = msg || 'Ocurrió un error al guardar.';
              mensajeError.classList.remove('hidden');
            }
          }
        })
        .catch(() => {
          mensajeError.textContent = 'Error de red. Intente nuevamente.';
          mensajeError.classList.remove('hidden');
        });
      });

      document.getElementById('modalVerEvento').classList.add('hidden');
      document.getElementById('modalEditarEvento').classList.remove('hidden');
    });
}
