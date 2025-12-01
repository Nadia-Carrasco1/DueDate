var chartEstudio; 
var chartExito;
var chartTareas;

// Gráfico barras

function cargarDatosEstudio(periodo = "semana-actual") {
    const fechaHoy = new Date();
    let text;
    
    switch(periodo) {
        case "semana-actual":
            text = "Semana actual";
            break;
        case "mes":
            let mes = fechaHoy.toLocaleString('default', { month: 'long' });
            mes = mes.charAt(0).toUpperCase() + mes.slice(1);
            text = mes + " - " + fechaHoy.getFullYear();
            break;
        case "anio":
            text = fechaHoy.getFullYear();
            break;
    }
    
    fetch(`/estadisticas/datos/?periodo=${periodo}`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('grafico-estudio').getContext('2d');
            
            if (chartEstudio) { 
                chartEstudio.destroy();
            }
            
            chartEstudio = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Tiempo de estudio',
                        data: data.data,
                        backgroundColor: [
                            'rgba(248, 148, 243, 0.4)',
                            'rgba(255, 159, 64, 0.4)',
                            'rgba(255, 205, 86, 0.4)',
                            'rgba(159, 255, 188, 0.4)',
                            'rgba(54, 162, 235, 0.4)',
                            'rgba(153, 102, 255, 0.4)',
                            'rgba(201, 203, 207, 0.4)'
                        ],
                        borderColor: [
                            'rgb(248, 148, 243)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(159, 255, 188)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const index = context.dataIndex;
                                    return data.tiempos_formateados[index];
                                }
                            }
                        },
                        legend: {
                            labels: {
                                color: '#bbbbbbff' 
                            } 
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                color: '#bbbbbbff' 
                            },
                            grid: {
                                color: '#222222ff'
                            },
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Minutos',
                                color: '#bbbbbbff'
                            }
                        },
                        x: {
                            ticks: {
                                color: '#bbbbbbff' 
                            },
                            grid: {
                                color: '#222222ff'
                            },
                            title: {
                                display: true,
                                text: text,
                                color: '#bbbbbbff'
                            }
                        }
                    }
                }
            });
        });
}

// Gráfico dona

function cargarDatosExito(periodo = "semana-actual") {
    fetch(`/estadisticas/exito/?periodo=${periodo}`)
        .then(res => res.json())
        .then(data => {
            const ctx = document.getElementById('grafico-estudio-exito').getContext('2d');
            
            if (chartExito) {
                chartExito.destroy();
            }
            
            chartExito = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Porcentaje de éxito',
                        data: data.data,
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.4)',
                            'rgba(255, 99, 132, 0.4)'
                        ],
                        borderColor: [
                            'rgb(75, 192, 192)',
                            'rgb(255, 99, 132)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const index = context.dataIndex;
                                    return `${data.labels[index]}: ${data.porcentajes[index]}`;
                                }
                            }
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#bbbbbbff' 
                            } 
                        }
                    }
                }
            });
            document.getElementById("cant-sesiones").textContent =
            `Éxito de sesiones de estudio (${data.exito_sesiones}/${data.total_sesiones})`;
        });
}

// Gráfico de Barra 

function cargarCantTareasCompletadas(datos) {
    const ctx = document.getElementById('grafico-tareas').getContext('2d');
    
    if (chartTareas) {
        chartTareas.destroy();
    }

    const totalTareas = datos.total_tareas;
    const tareasCompletadas = datos.tareas_completadas; 
    const tareasPendientes = totalTareas - tareasCompletadas;
    
    if (totalTareas === 0) {
        console.warn("No hay tareas para dibujar el gráfico.");
        return;
    }
    
    const porcentaje = totalTareas > 0 ? (tareasCompletadas / totalTareas * 100).toFixed(1) : 0;

    chartTareas = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [''], 
            datasets: [
                {
                    label: 'Tareas pendientes',
                    data: [tareasPendientes], 
                    backgroundColor: [
                        'rgba(145, 146, 150, 0.4)'
                    ],
                    borderColor: [
                        'rgb(145, 146, 150)',
                    ],
                    borderWidth: 1,
                    stack: 'Stack 1' 
                },
                {
                    label: 'Tareas completadas',
                    data: [tareasCompletadas], 
                    backgroundColor: [
                        'rgba(153, 102, 255, 0.4)',
                    ],
                    borderColor: [
                        'rgb(153, 102, 255)',
                    ],
                    borderWidth: 1,
                    stack: 'Stack 1' 
                }
            ]
        },
        options: {
             indexAxis: 'y', 
             responsive: true, 
             maintainAspectRatio: false, 
             plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                             return `Completadas ${tareasCompletadas}/${totalTareas} (${porcentaje}%)`;
                        }
                    }
                },
                legend: {
                    labels: {
                        color: '#bbbbbbff' 
                    },
                    display: false
                },
                title: {
                    display: true,
                    text: `Progreso ${tareasCompletadas}/${totalTareas}`,
                    color: '#bbbbbbff',
                    font: {
                        size: 16
                    }
                }
            },
            scales: {
                x: {
                    min: 0,
                    max: totalTareas,
                    display: false,
                    stacked: true, 
                    grid: {
                        display: false
                    }
                },
                y: {
                    stacked: true, 
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#bbbbbbff'
                    }
                }
            }
        }
    });
};

function cargarDatosTareas(pkLista) {
    const url = `/estadisticas/tareas/${pkLista}`; 
    fetch(url)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status}`);
            }
            return res.json();
        })
        .then(datos => {
            cargarCantTareasCompletadas(datos); 
        })
        .catch(error => {
            console.error('Error al cargar datos de tareas:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosEstudio("semana-actual");
    cargarDatosExito("semana-actual");

    const ID_LISTA_TAREAS = window.LISTA_PK;
    console.log("Se ejecuta DOMContentLoaded. PK:", ID_LISTA_TAREAS);

    if (ID_LISTA_TAREAS && ID_LISTA_TAREAS !== null) {
        cargarDatosTareas(ID_LISTA_TAREAS);
    } else {
        console.warn("La PK de la lista de tareas (window.LISTA_PK) no está disponible. El gráfico de tareas no se cargó.");
    }

    document.getElementById("semana-actual").addEventListener("click", () => {
        cargarDatosEstudio("semana-actual");
        cargarDatosExito("semana-actual");
    });
    
    document.getElementById("mes").addEventListener("click", () => {
        cargarDatosEstudio("mes");
        cargarDatosExito("mes");
    });
    
    document.getElementById("anio").addEventListener("click", () => {
        cargarDatosEstudio("anio");
        cargarDatosExito("anio");
    });
});