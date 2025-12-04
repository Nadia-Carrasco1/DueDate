document.addEventListener('DOMContentLoaded', function () {
  const pad = n => String(n).padStart(2, '0');
  
  const toDatetimeLocal = date =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

  function abrirModal(modal) {
    if (modal) modal.classList.remove('hidden');
  }

  function cerrarModal(modal) {
    if (modal) modal.classList.add('hidden');
  }

  const btnAbrirCrear = document.getElementById('btn-abrir-crear');
  const btnCerrarCrear = document.getElementById('btn-cerrar-crear');
  const btnAbrirEditar = document.getElementById('btn-abrir-editar');
  const btnCerrarEditar = document.getElementById('btn-cerrar-editar');
  const btnAbrirParticipantes = document.getElementById('abrir-modal'); 
  const btnCerrarParticipantes = document.getElementById('btn-cerrar-participantes'); 

  const modalCrear = document.getElementById('modal-crear');
  const modalEditar = document.getElementById('modal-editar');
  const modalParticipantes = document.getElementById('modal-participantes');

  if (btnAbrirCrear) btnAbrirCrear.addEventListener('click', () => abrirModal(modalCrear));
  if (btnCerrarCrear) btnCerrarCrear.addEventListener('click', () => cerrarModal(modalCrear));
  if (btnAbrirEditar) btnAbrirEditar.addEventListener('click', () => abrirModal(modalEditar));
  if (btnCerrarEditar) btnCerrarEditar.addEventListener('click', () => cerrarModal(modalEditar));
  if (btnAbrirParticipantes) btnAbrirParticipantes.addEventListener('click', () => abrirModal(modalParticipantes)); // Abre el modal de participantes
  if (btnCerrarParticipantes) btnCerrarParticipantes.addEventListener('click', () => cerrarModal(modalParticipantes)); // Cierra el modal de participantes


  function initForm(form) {
    if (!form) return;

    const inputMeta = form.querySelector('#id_metaCantHoras');
    const fechaInicio = form.querySelector('#id_plazoInicioEstudio');
    const fechaFin = form.querySelector('#id_plazoFinEstudio');
    const fechaCreacionInput = form.querySelector('#fecha-creacion-grupo');
    const mensaje = form.querySelector('p[id$="mensaje"]') || null;

    if (!inputMeta || !fechaInicio || !fechaFin) return;

    const esCrear = form.id === 'form-crear-grupo';

    if (esCrear) {
      const ahora = new Date();
      const defaultInicio = new Date(ahora.getTime() + 6 * 60 * 1000);
      const defaultFin = new Date(defaultInicio.getTime() + 60 * 60 * 1000);

      fechaInicio.min = toDatetimeLocal(defaultInicio);
      if (!fechaInicio.value) fechaInicio.value = toDatetimeLocal(defaultInicio);

      fechaFin.min = toDatetimeLocal(defaultFin);
      if (!fechaFin.value) fechaFin.value = toDatetimeLocal(defaultFin);

      if (!inputMeta.value) inputMeta.value = 1;
    } else if (fechaCreacionInput) {
      const fechaCreacion = new Date(fechaCreacionInput.value);
      const fechaMinima = new Date(fechaCreacion.getTime() + 6 * 60 * 1000);
      fechaInicio.min = toDatetimeLocal(fechaMinima);
    }


    inputMeta.addEventListener('input', function () {
      const meta = parseFloat(inputMeta.value);
      const inicio = new Date(fechaInicio.value);
      if (!isNaN(meta) && meta > 0 && !isNaN(inicio.getTime())) {
        const nuevaFin = new Date(inicio.getTime() + meta * 60 * 60 * 1000);
        fechaFin.value = toDatetimeLocal(nuevaFin);
        fechaFin.min = toDatetimeLocal(new Date(inicio.getTime() + 60 * 60 * 1000));
      }
    });

    fechaInicio.addEventListener('change', function () {
      const inicio = new Date(fechaInicio.value);
      if (!isNaN(inicio.getTime())) {
        const minFin = new Date(inicio.getTime() + 60 * 60 * 1000);
        fechaFin.min = toDatetimeLocal(minFin);

        const meta = parseFloat(inputMeta.value);
        if (!isNaN(meta) && meta > 0) {
          const nuevaFin = new Date(inicio.getTime() + meta * 60 * 60 * 1000);
          fechaFin.value = toDatetimeLocal(nuevaFin);
        }
      }
    });

    form.addEventListener('submit', function (event) {
      let enviar = true;

      const meta = parseFloat(inputMeta.value);
      const inicio = new Date(fechaInicio.value);
      const fin = new Date(fechaFin.value);

      const ahora = new Date();
      let fechaMinimaInicio = new Date(ahora.getTime() + 5 * 60 * 1000);

      if (!esCrear && fechaCreacionInput) {
        const fechaCreacion = new Date(fechaCreacionInput.value);
        fechaMinimaInicio = new Date(fechaCreacion.getTime() + 5 * 60 * 1000);
      }

      if (isNaN(meta) || meta <= 0) {
        mostrarError(inputMeta, "La meta debe ser un número igual o mayor a 1.");
        enviar = false;
      } else {
        limpiarError(inputMeta);
      }

      if (!fechaInicio.value || isNaN(inicio.getTime()) || inicio < fechaMinimaInicio) {
        mostrarError(fechaInicio, esCrear
          ? "La fecha de inicio debe ser al menos 5 minutos posterior a la actual."
          : "La fecha de inicio debe ser al menos 5 minutos posterior a la creación del grupo.");
        enviar = false;
      } else {
        limpiarError(fechaInicio);
      }

      if (!fechaFin.value || isNaN(fin.getTime()) || fin < new Date(inicio.getTime() + 60 * 60 * 1000)) {
        mostrarError(fechaFin, "La fecha de fin debe ser al menos 1 hora posterior a la de inicio.");
        enviar = false;
      } else {
        limpiarError(fechaFin);
      }

      const horasDisponibles = (fin - inicio) / (1000 * 60 * 60);
      if (meta > horasDisponibles) {
        mostrarError(fechaFin, `El plazo entre inicio y fin no alcanza para cumplir la meta de ${meta} horas.`);
        enviar = false;
      }

      if (!enviar) event.preventDefault();
      if (mensaje && enviar) mensaje.textContent = '';
    });

    function mostrarError(input, msg) {
      limpiarError(input);
      const errorBox = document.createElement('p');
      errorBox.className = 'text-red-500 mt-1 text-sm';
      errorBox.innerText = msg;
      input.insertAdjacentElement('afterend', errorBox);
    }

    function limpiarError(input) {
      let errorBox = input.nextElementSibling;
      if (errorBox && errorBox.classList.contains('text-red-500')) {
        errorBox.remove();
      }
    }
  }

  
  initForm(document.getElementById('form-crear-grupo'));
  initForm(document.getElementById('form-editar-grupo'));
   
     
    const djangoMessages = document.getElementById('djangoMessages');
    if (djangoMessages) {
        djangoMessages.style.opacity = '0';
        djangoMessages.style.transform = 'translateX(-50%) translateY(-10px)';
        djangoMessages.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';

        djangoMessages.offsetHeight;

        djangoMessages.style.opacity = '1';
        djangoMessages.style.transform = 'translateX(-50%) translateY(0)';

        setTimeout(() => {
            djangoMessages.style.opacity = '0';
            djangoMessages.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => djangoMessages.remove(), 300);
        }, 5000);
    }


});

