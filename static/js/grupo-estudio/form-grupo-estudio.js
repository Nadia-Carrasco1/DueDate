document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-crear-grupo') || document.getElementById('form-editar-grupo');
  const inputMeta = document.getElementById('id_metaCantHoras');
  const fechaInicio = document.getElementById('id_plazoInicioEstudio');
  const fechaFin = document.getElementById('id_plazoFinEstudio');
  const fechaCreacionInput = document.getElementById('fecha-creacion-grupo');

  if (!form || !inputMeta || !fechaInicio || !fechaFin) return;

  const pad = n => String(n).padStart(2, '0');
  const toDatetimeLocal = date =>
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

  const esCrear = form.id === 'form-crear-grupo';

  if (esCrear) {
    // ⚡ Default: ahora + 6 min
    const ahora = new Date();
    const defaultInicio = new Date(ahora.getTime() + 6 * 60 * 1000);
    const defaultFin = new Date(defaultInicio.getTime() + 60 * 60 * 1000);

    fechaInicio.min = toDatetimeLocal(defaultInicio);
    if (!fechaInicio.value) fechaInicio.value = toDatetimeLocal(defaultInicio);

    fechaFin.min = toDatetimeLocal(defaultFin);
    if (!fechaFin.value) fechaFin.value = toDatetimeLocal(defaultFin);

    // ⚡ Meta por defecto = 1 hora
    if (!inputMeta.value) inputMeta.value = 1;
  } else {
    if (fechaCreacionInput) {
      const fechaCreacion = new Date(fechaCreacionInput.value);
      const fechaMinima = new Date(fechaCreacion.getTime() + 6 * 60 * 1000);
      fechaInicio.min = toDatetimeLocal(fechaMinima);
    }
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

    // ⚡ recalcular "ahora" en el momento del submit
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
});