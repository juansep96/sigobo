var urlBase="./api/transacciones/";
var urlImpresionA = "./api/nuevaVenta/ImprimirVentaA";
var urlImpresionB = "./api/nuevaVenta/ImprimirVentaB";

$(document).ready(function() {

  var fecha = moment().format("YYYY-MM-DD");
  $("#desde").val(fecha);
  $("#hasta").val(fecha);

  $.extend(true, $.fn.dataTable.defaults, {
    "language": {
      "decimal": ",",
      "thousands": ".",
      "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
      "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
      "infoPostFix": "",
      "infoFiltered": "(filtrado de un total de _MAX_ registros)",
      "loadingRecords": "Cargando...",
      "lengthMenu": "Mostrar _MENU_ registros",
      "paginate": {
        "first": "Primero",
        "last": "Último",
        "next": "Siguiente",
        "previous": "Anterior"
      },
      "processing": "Procesando...",
      "search": "Buscar:",
      "searchPlaceholder": "",
      "zeroRecords": "No se encontraron resultados",
      "emptyTable": "Ningún dato disponible en esta tabla",
      "aria": {
        "sortAscending": ": Activar para ordenar la columna de manera ascendente",
        "sortDescending": ": Activar para ordenar la columna de manera descendente"
      },
      //only works for built-in buttons, not for custom buttons
      "buttons": {
        "create": "Nuevo",
        "edit": "Cambiar",
        "remove": "Borrar",
        "copy": "Copiar",
        "csv": "CSV",
        "excel": "Excel",
        "pdf": "PDF",
        "print": "Imprimir",
        "colvis": "Visibilidad columnas",
        "collection": "Colección",
        "upload": "Seleccione fichero...."
      },
      "select": {
        "rows": {
          _: '%d filas seleccionadas',
          0: 'clic fila para seleccionar',
          1: 'una fila seleccionada'
        }
      }
    }
  });
});

function CargarFacturas(){
    fecha = $("#desde").val();
    fechaHasta=$("#hasta").val();
    $("#facturas").DataTable().destroy();
    $('#facturas').DataTable({
      'responsive': true,
      'processing': true,
      'serverSide': true,
      'serverMethod': 'post',
      'searching' : false,
      dom: 'Blfrtip',
        buttons: [
            'excel', 'pdf', 'print'
        ],
      'ajax': {
        'url': urlBase+"ObtenerFacturas?fecha="+fecha+"&fechaHasta="+fechaHasta,
      },
      'columns': [{
          data: 'fecha_factura'
        },
        {
          data: 'name_user'
        },
        {
          data: 'tipo_factura'
        },
        {
          data: 'numero_factura'
        },
        {
          data: 'cae_factura'
        },
        {
          data: 'vto_factura'
        },
        {
          data: 'monto_factura'
        },
        {
          data: 'acciones_factura', className: "mostrarColumna"
        }
      ]
    });
}

function ImprimirVentaA(idVenta){
    window.open(urlImpresionA+'?idVenta='+idVenta, '_blank');
}
function ImprimirVentaB(idVenta){
  window.open(urlImpresionB+'?idVenta='+idVenta, '_blank');
}