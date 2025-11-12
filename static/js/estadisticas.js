    let chart;
    let chartExito;

    function cargarDatosEstudio(periodo = "semana-actual") {
        const fechaHoy = new Date();

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
                text = fechaHoy.getFullYear()
        }

        fetch(`/estadisticas/datos/?periodo=${periodo}`)
            .then(res => res.json())
            .then(data => {
                const ctx = document.getElementById('grafico-estudio').getContext('2d');

                if (chart) {
                    chart.destroy();
                }

                chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [{
                            label: 'Tiempo de estudio',
                            data: data.data,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.4)',
                                'rgba(255, 159, 64, 0.4)',
                                'rgba(255, 205, 86, 0.4)',
                                'rgba(75, 192, 192, 0.4)',
                                'rgba(54, 162, 235, 0.4)',
                                'rgba(153, 102, 255, 0.4)',
                                'rgba(201, 203, 207, 0.4)'
                                ],
                            borderColor: [
                                'rgb(255, 99, 132)',
                                'rgb(255, 159, 64)',
                                'rgb(255, 205, 86)',
                                'rgb(75, 192, 192)',
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
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Minutos'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: text
                                }
                            }
                        }
                    }
                });
            });
    }

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
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(255, 99, 132, 0.6)'
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
                                position: 'bottom'
                            }
                        }
                    }
                });
                document.getElementById("cant-sesiones").textContent =
                `Éxito de sesiones de estudio (${data.exito_sesiones}/${data.total_sesiones})`;
            });
    }

    cargarDatosEstudio("semana-actual");
    cargarDatosExito("semana-actual");

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
    
    /*document.getElementById("elegir-fechas").addEventListener("click", () => {
    });*/