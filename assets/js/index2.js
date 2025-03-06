var urlBase="./api/estadisticas/";

$(document).ready(function() {
    $.post("./api/ObtenerRol")
    .then((role)=>{
        if(role=="Administrador"){
            let desde = moment().format("YYYY-MM")+'-01';
            let hasta = moment().format("YYYY-MM-DD");
            $("#desde").val(desde);
            $("#hasta").val(hasta);
            Inicializador();
            ObtenerPatrimonio();
        };
    })
});

function Inicializador(){
   CalcularVentaPromedio();
   CalcularMontoBlanco();
   CalcularMontoNegro();
   CalcularMedioDePago();
   CalcularTotalCompras();
   CalcularTotalVentas();
   CalcularComprasBlanco();
   CalcularComprasNegro();
}

function CalcularVentaPromedio () {
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerVentaPromedio',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            array = [response.monto_promedio_menos_2,response.monto_promedio_menos_1,response.monto_promedio];
            $("#venta_promedio").html('$ '+response.monto_promedio);
            if(response.crecimiento>0){
                $("#crecimiento_mes_anterior").html('+'+response.crecimiento+'%'+'<i class="bi bi-arrow-up"></i>');
            }else{
                $("#crecimiento_mes_anterior").html('-'+response.crecimiento+'%'+'<i class="bi bi-arrow-down"></i>');
            }
            var options = {
                series: [{
                    name: "Venta Promedio",
                    data: array
                }],
                chart: {
                    type: "line",
                    //width: 100%,
                    height: 40,
                    toolbar: {
                        show: !1
                    },
                    zoom: {
                        enabled: !1
                    },
                    dropShadow: {
                        enabled: 0,
                        top: 3,
                        left: 14,
                        blur: 4,
                        opacity: .12,
                        color: "#e72e7a"
                    },
                    sparkline: {
                        enabled: !0
                    }
                },
                markers: {
                    size: 0,
                    colors: ["#e72e7a"],
                    strokeColors: "#fff",
                    strokeWidth: 2,
                    hover: {
                        size: 7
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "35%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2.5,
                    curve: "smooth"
                },
                tooltip: {
                    theme: "dark",
                    fixed: {
                        enabled: !1
                    },
                    x: {
                        show: !1
                    },
                    y: {
                        title: {
                            formatter: function(e) {
                                return ""
                            }
                        }
                    },
                    marker: {
                        show: !1
                    }
                },
                colors: ["#fff"],
                xaxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                fill: {
                    opacity: 1
                },
              };
            if ( document.querySelector("#chart1").hasChildNodes() ) {
                document.querySelector("#chart1").innerHTML = '';
            }
            var chart = new ApexCharts(document.querySelector("#chart1"), options);
            chart.render();
        }
    })
}

function CalcularMontoBlanco () {
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerMontoBlanco',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            array = [response.monto_blanco_menos_2,response.monto_blanco_menos_1,response.monto_blanco];
            $("#monto_blanco").html('$ '+response.monto_blanco);
            $("#monto_blanco_2").html('$ '+response.monto_blanco);
            if(response.crecimiento>0){
                $("#crecimiento_mes_anterior_blanco").html('+'+response.crecimiento+'%'+'<i class="bi bi-arrow-up"></i>');
                $("#crecimiento_mes_anterior_blanco_2").html('+'+response.crecimiento+'%'+'<i class="bi bi-arrow-up"></i>');
            }else{
                $("#crecimiento_mes_anterior_blanco").html('-'+response.crecimiento+'%'+'<i class="bi bi-arrow-down"></i>');
                $("#crecimiento_mes_anterior_blanco_2").html('-'+response.crecimiento+'%'+'<i class="bi bi-arrow-down"></i>');
            }
            var options = {
                series: [{
                    name: "Ventas Facturadas",
                    data: array
                }],
                chart: {
                    type: "line",
                    //width: 100%,
                    height: 40,
                    toolbar: {
                        show: !1
                    },
                    zoom: {
                        enabled: !1
                    },
                    dropShadow: {
                        enabled: 0,
                        top: 3,
                        left: 14,
                        blur: 4,
                        opacity: .12,
                        color: "#e72e7a"
                    },
                    sparkline: {
                        enabled: !0
                    }
                },
                markers: {
                    size: 0,
                    colors: ["#e72e7a"],
                    strokeColors: "#fff",
                    strokeWidth: 2,
                    hover: {
                        size: 7
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "35%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2.5,
                    curve: "smooth"
                },
                tooltip: {
                    theme: "dark",
                    fixed: {
                        enabled: !1
                    },
                    x: {
                        show: !1
                    },
                    y: {
                        title: {
                            formatter: function(e) {
                                return ""
                            }
                        }
                    },
                    marker: {
                        show: !1
                    }
                },
                colors: ["#fff"],
                xaxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                fill: {
                    opacity: 1
                },
              };
            if ( document.querySelector("#chart2").hasChildNodes() ) {
                document.querySelector("#chart2").innerHTML = '';
            }
            var chart = new ApexCharts(document.querySelector("#chart2"), options);
            chart.render();

        }
    })
}

function CalcularMontoNegro () {
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerMontoNegro',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            array = [response.monto_negro_menos_2,response.monto_negro_menos_1,response.monto_negro];
            $("#monto_negro").html('$ '+response.monto_negro);
            $("#monto_negro_2").html('$ '+response.monto_negro);
            if(response.crecimiento>0){
                $("#crecimiento_mes_anterior_negro").html('+'+response.crecimiento+'%'+'<i class="bi bi-arrow-up"></i>');
                $("#crecimiento_mes_anterior_negro_2").html('+'+response.crecimiento+'%'+'<i class="bi bi-arrow-up"></i>');

            }else{
                $("#crecimiento_mes_anterior_negro").html('-'+response.crecimiento+'%'+'<i class="bi bi-arrow-down"></i>');
                $("#crecimiento_mes_anterior_negro_2").html('-'+response.crecimiento+'%'+'<i class="bi bi-arrow-down"></i>');

            }
            var options = {
                series: [{
                    name: "Ventas Facturadas",
                    data: array
                }],
                chart: {
                    type: "line",
                    //width: 100%,
                    height: 40,
                    toolbar: {
                        show: !1
                    },
                    zoom: {
                        enabled: !1
                    },
                    dropShadow: {
                        enabled: 0,
                        top: 3,
                        left: 14,
                        blur: 4,
                        opacity: .12,
                        color: "#e72e7a"
                    },
                    sparkline: {
                        enabled: !0
                    }
                },
                markers: {
                    size: 0,
                    colors: ["#e72e7a"],
                    strokeColors: "#fff",
                    strokeWidth: 2,
                    hover: {
                        size: 7
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "35%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2.5,
                    curve: "smooth"
                },
                tooltip: {
                    theme: "dark",
                    fixed: {
                        enabled: !1
                    },
                    x: {
                        show: !1
                    },
                    y: {
                        title: {
                            formatter: function(e) {
                                return ""
                            }
                        }
                    },
                    marker: {
                        show: !1
                    }
                },
                colors: ["#fff"],
                xaxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                fill: {
                    opacity: 1
                },
              };
            if ( document.querySelector("#chart3").hasChildNodes() ) {
                document.querySelector("#chart3").innerHTML = '';
            }
            var chart = new ApexCharts(document.querySelector("#chart3"), options);
            chart.render();

        }
    })
}

function CalcularMedioDePago () {
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerMedioDePago',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            array = [response.efectivo,response.transferencia,response.posnet];
            total = parseFloat(response.efectivo) + parseFloat(response.transferencia) + parseFloat(response.posnet);
            efectivo = (response.efectivo / total) * 100;
            transferencia = (response.transferencia / total) * 100;
            posnet = (response.posnet / total) * 100;
            $("#efectivo").html(parseFloat(efectivo).toFixed(2) + '%');
            $("#transferencia").html(parseFloat(transferencia).toFixed(2) + '%');
            $("#posnet").html(parseFloat(posnet).toFixed(2) + '%');

            new Chart(document.getElementById("chart4"), {
                type: 'doughnut',
                data: {
                    labels: ["Efectivo", "Transferencia", "Posnet"],
                    datasets: [{
                        label: "Montos",
                        backgroundColor: ["#12bf24", "#3461ff", "#ff6632"],
                        data: array
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    cutoutPercentage: 77,
                    legend: {
                      position: 'bottom',
                      display: false,
                      labels: {
                        boxWidth:8
                      }
                    },
                    tooltips: {
                      displayColors:false,
                    }
                }
            });
        }
    })
}

function CalcularTotalCompras () {
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerCompras',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            array = [response.compras_menos_2,response.compras_menos_1,response.compras];
            $("#total_compras").html('$ '+response.compras);
            if(response.crecimiento>0){
                $("#crecimiento_mes_anterior_compras").html('+'+response.crecimiento+'%'+'<i class="bi bi-arrow-up"></i>');
            }else{
                $("#crecimiento_mes_anterior_compras").html('-'+response.crecimiento+'%'+'<i class="bi bi-arrow-down"></i>');
            }
            var options = {
                series: [{
                    name: "Total Compras",
                    data: array
                }],
                chart: {
                    type: "line",
                    //width: 100%,
                    height: 40,
                    toolbar: {
                        show: !1
                    },
                    zoom: {
                        enabled: !1
                    },
                    dropShadow: {
                        enabled: 0,
                        top: 3,
                        left: 14,
                        blur: 4,
                        opacity: .12,
                        color: "#e72e7a"
                    },
                    sparkline: {
                        enabled: !0
                    }
                },
                markers: {
                    size: 0,
                    colors: ["#e72e7a"],
                    strokeColors: "#fff",
                    strokeWidth: 2,
                    hover: {
                        size: 7
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "35%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2.5,
                    curve: "smooth"
                },
                tooltip: {
                    theme: "dark",
                    fixed: {
                        enabled: !1
                    },
                    x: {
                        show: !1
                    },
                    y: {
                        title: {
                            formatter: function(e) {
                                return ""
                            }
                        }
                    },
                    marker: {
                        show: !1
                    }
                },
                colors: ["#fff"],
                xaxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                fill: {
                    opacity: 1
                },
              };
            if ( document.querySelector("#chart5").hasChildNodes() ) {
                document.querySelector("#chart5").innerHTML = '';
            }
            var chart = new ApexCharts(document.querySelector("#chart5"), options);
            chart.render();
        }
    })
}

function CalcularTotalVentas () {
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerVentas',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            array = [response.ventas_menos_2,response.ventas_menos_1,response.ventas];
            $("#total_ventas").html('$ '+response.ventas);
            if(response.crecimiento>0){
                $("#crecimiento_mes_anterior_ventas").html('+'+response.crecimiento+'%'+'<i class="bi bi-arrow-up"></i>');
            }else{
                $("#crecimiento_mes_anterior_ventas").html('-'+response.crecimiento+'%'+'<i class="bi bi-arrow-down"></i>');
            }
            var options = {
                series: [{
                    name: "Total ventas",
                    data: array
                }],
                chart: {
                    type: "line",
                    //width: 100%,
                    height: 40,
                    toolbar: {
                        show: !1
                    },
                    zoom: {
                        enabled: !1
                    },
                    dropShadow: {
                        enabled: 0,
                        top: 3,
                        left: 14,
                        blur: 4,
                        opacity: .12,
                        color: "#e72e7a"
                    },
                    sparkline: {
                        enabled: !0
                    }
                },
                markers: {
                    size: 0,
                    colors: ["#e72e7a"],
                    strokeColors: "#fff",
                    strokeWidth: 2,
                    hover: {
                        size: 7
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: !1,
                        columnWidth: "35%",
                        endingShape: "rounded"
                    }
                },
                dataLabels: {
                    enabled: !1
                },
                stroke: {
                    show: !0,
                    width: 2.5,
                    curve: "smooth"
                },
                tooltip: {
                    theme: "dark",
                    fixed: {
                        enabled: !1
                    },
                    x: {
                        show: !1
                    },
                    y: {
                        title: {
                            formatter: function(e) {
                                return ""
                            }
                        }
                    },
                    marker: {
                        show: !1
                    }
                },
                colors: ["#fff"],
                xaxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                },
                fill: {
                    opacity: 1
                },
              };
            if ( document.querySelector("#chart6").hasChildNodes() ) {
                document.querySelector("#chart6").innerHTML = '';
            }
            var chart = new ApexCharts(document.querySelector("#chart6"), options);
            chart.render();
        }
    })
}

function CalcularComprasBlanco(){
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerComprasBlanco',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            $("#monto_compras_blanco").html('$ '+response.blanco);
        }
    })
}

function CalcularComprasNegro(){
    let desde = $("#desde").val();
    let hasta = $("#hasta").val();
    $.post(urlBase+'ObtenerComprasNegro',{desde,hasta})
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            $("#monto_compras_negro").html('$ '+response.negro);
        }
    })
}

function ObtenerPatrimonio(){
    $("#patrimonio").html('');
    $.post(urlBase+'ObtenerPatrimonio')
    .then((response)=>{
        if(response){
            response=JSON.parse(response);
            let totalDeposito = 0;
            let totalBBPS = 0;
            let totalGeneral = 0;
            response.forEach((e)=>{
                let total = parseFloat(e.bbps) + parseFloat(e.deposito);
                totalDeposito = parseFloat(totalDeposito) + parseFloat(e.deposito);
                totalBBPS = parseFloat(totalBBPS) + parseFloat(e.bbps);
                totalGeneral = totalGeneral + total;
                e.nombre_proveedor ? e.nombre_proveedor = e.nombre_proveedor.toUpperCase() : e.nombre_proveedor = 'SIN PROVEEDOR';
                html = '<tr><td>'+e.nombre_proveedor+'</td><td> $'+parseFloat(e.deposito).toFixed(2)+'</td><td> $'+parseFloat(e.bbps).toFixed(2)+'</td><td> $'+parseFloat(total).toFixed(2)+'</td></tr>';
                $("#patrimonio").append(html);
            })
            html = '<tr><td><strong>TOTALES</strong></td><td><strong> $'+parseFloat(totalDeposito).toFixed(2)+'</strong></td><td><strong> $'+parseFloat(totalBBPS).toFixed(2)+'</strong></td><td><strong> $'+parseFloat(totalGeneral).toFixed(2)+'</strong></td></tr>';
            $("#patrimonio").append(html);
        }
    })
}
