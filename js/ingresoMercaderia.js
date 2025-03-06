var urlBase="./api/comprobantes/";

var guardado = localStorage.getItem('arrayIngreso');
var guardado=JSON.parse(guardado);

var arrayProductos;

$(document).ready(function() {

  var fecha = moment().format("YYYY-MM-DD");
  $("#fechaComprobantes").val(fecha);
  $("#fechaHastaComprobantes").val(fecha);
  $("#fecha").val(fecha);

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

  $("#buscadorProducto").on('keyup', function (e) {
  e.preventDefault();
  var keycode = e.keyCode || e.which;
    if (keycode == 13) {
        BuscarProductos();
    }
  });


  if(!guardado){
    arrayProductos=[];
  }else{
    arrayProductos = guardado;
    ActualizarTabla(arrayProductos);
  }

  $.post("./api/proveedores/ObtenerProveedoresSelect")
  .then((data)=>{
    data=JSON.parse(data);
    var opcion = "<option disabled selected value='0'>Seleccione uno</option>";
    $("#proveedor").append(opcion);
    data.forEach((e)=>{
        var opcion = "<option value='"+e.id_proveedor+"'>"+e.nombre_proveedor.toUpperCase()+"</option>";
      $("#proveedor").append(opcion);
    })
  });

});

function CargarComprobantes(){
  fechaDesde = $("#fechaComprobantes").val();
  fechaHasta = $("#fechaHastaComprobantes").val();
  $("#comprobantes").DataTable().destroy();
  $('#comprobantes').DataTable({
    responsive: false,
    'processing': true,
    'serverSide': true,
    'serverMethod': 'post',
    dom: 'Blfrtip',
    buttons: [
        'excel', 'pdf', 'print'
    ],
    'ajax': {
      'url': urlBase+"ObtenerComprobantes?desde="+fechaDesde+"&hasta="+fechaHasta,
    },
    'columns': [{
        data: 'tipo_comprobante'
      },
      {
        data: 'nro_comprobante'
      },      
      {
        data: 'nombre_proveedor'
      },
      {
        data: 'fecha_comprobante'
      },
      {
        data: 'total_comprobante'
      },
      {
        data: 'nombre_usuario'
      },
      {
        data: 'acciones_comprobante' , className: "mostrarColumna"
      },

    ]
  });
  ObtenerTotales(fechaDesde,fechaHasta);
}

function ObtenerTotales(desde,hasta){
    blanco = 0.00;
    negro = 0.00;
    $.post(urlBase+"ObtenerTotales",{desde,hasta})
    .then((data)=>{
        if(data){
            data=JSON.parse(data);
            data.forEach((e)=>{
                e.tCompro_ingCompro == 'REMITO' ? negro = negro + parseFloat(e.total_ingCompro) : blanco = blanco + parseFloat(e.total_ingCompro);
            })
        }
        blanco = parseFloat(blanco).toFixed(2);
        negro = parseFloat(negro).toFixed(2);
        $("#blanco").val(blanco);
        $("#negro").val(negro);
    })
}

function AbrirComprobante(idComprobante){
  $(".filaDetalle").remove();
  $.post(urlBase+"ObtenerComprobante",{idComprobante})
  .then((res)=>{
    res=JSON.parse(res);
    console.log(res);
    res.forEach((e)=>{
        !e.detalle_lote ? e.detale_lote = "SIN DETALLE" : "";
      var htmlTags = '<tr class="filaDetalle">' +
                      '<td class="text-center">' + e.codigo_producto + '</td>'+
                      '<td class="text-center">' + e.nombre_producto.toUpperCase()+ '</td>'+
                      '<td class="text-center">' + e.detalle_lote.toUpperCase() + '</td>'+
                      '<td class="text-center">' + e.stock_1_ingDetalle + '</td>'+
                      '</tr>';
      $('#tabla-items tbody').append(htmlTags);
    })
  })
  $("#modalVerComprobante").modal('show');
}

function CerrarVerComprobante(){
  $("#modalVerComprobante").modal('hide');
}

function NuevoIngreso(){
  $("#modalNuevoIngreso").modal('show');
}

function CerrarNuevoIngreso(){
  $("#modalNuevoIngreso").modal('hide');
}

function BuscarProductos(){
  query = $("#buscadorProducto").val();
  $("#errorBusqueda h3").remove();
  $("#buscadorProducto").val("");
  $.post("./api/comprobantes/ObtenerProductos",{query})
  .then((rta)=>{
          rta = JSON.parse(rta);
          if(rta.length==1){
              producto = {
                id: rta[0].id_producto,
                codigo : rta[0].codigo_producto,
                nombre : rta[0].nombre_producto.toUpperCase(),
                cantidad : 0,
                lote:-1,
                vencimiento:moment().format('YYYY-MM-DD'),
                detalle:""
              }
              arrayProductos.push(producto);
              ActualizarTabla(arrayProductos);
              Lobibox.notify('success', {
                pauseDelayOnHover: true,
                continueDelayOnInactiveTab: false,
                position: 'top right',
                icon: 'bx bx-check-circle',
                msg: 'Agregado!',
              });
          }else if(rta.length==0){
            Lobibox.notify('error', {
                pauseDelayOnHover: true,
                continueDelayOnInactiveTab: false,
                position: 'top right',
                icon: 'bx bx-message-error',
                msg: 'No se encontraron productos.',
              });
          }else if(rta.length>1){
            SeleccionarProducto(rta);
          }
  });
}

function SeleccionarProducto(array){
  $(".filaElegirProducto").remove();
  for (var i = 0;i<array.length;i++){
    var htmlTags = '<tr class="filaElegirProducto" onclick="CargarProductoArray('+array[i].id_producto+');">' +
                    '<td>' + array[i].codigo_producto + '</td>'+
                    '<td>' + array[i].nombre_producto.toUpperCase() + '</td>'+
                    '<td>' + parseFloat(array[i].valorCompra_producto).toFixed(2) + '</td>'+
                    '<td>' + parseFloat(array[i].valorVenta_producto).toFixed(2) + '</td>'+
                    '</tr>';
    $('#tabla-elegirproducto tbody').append(htmlTags);
    $("#modalElegirproducto").modal('show');
  }
}

function CerrarElegirProducto(){
  $("#modalElegirproducto").modal('hide');
}

function CargarProductoArray(idProducto){
  CerrarElegirProducto();
  $.post("./api/comprobantes/ObtenerProducto",{idProducto})
  .then((rta)=>{
          rta = JSON.parse(rta);
          if(rta.length==1){
            producto = {
              id: rta[0].id_producto,
              codigo : rta[0].codigo_producto,
              nombre : rta[0].nombre_producto.toUpperCase(),
              cantidad : 0,
              lote:-1,
              vencimiento:moment().format('YYYY-MM-DD'),
              detalle : ""
            }
              arrayProductos.push(producto);
              ActualizarTabla(arrayProductos);
              Lobibox.notify('success', {
                pauseDelayOnHover: true,
                continueDelayOnInactiveTab: false,
                position: 'top right',
                icon: 'bx bx-check-circle',
                msg: 'Agregado!',
              });
          }
  });
}

function EliminarItem(datos){
    arrayProductos.splice(datos, 1);
    Lobibox.notify('success', {
        pauseDelayOnHover: true,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        icon: 'bx bx-check-circle',
        msg: 'Eliminado!',
      });
    ActualizarTabla(arrayProductos);
}


function updateInput(cant,id){
  id="#"+id;
  $(id).val(cant);
  ActualizarCarrito(arrayProductos);
}

function ObtenerVencimiento(id){
  id=id.split('_');
  id=id[id.length-1];
  $.post(urlBase+"ObtenerLote",{idLote:id})
  .then((data)=> {
    data = JSON.parse(data);
    data.forEach((e)=> {
      let vencimiento = e.vencimiento_lote;
      $("#vencimiento_"+id).val(vencimiento);
      let detalle = e.detalle_lote;
      !detalle ? detalle = "SIN DETALLE" : detalle = "";
      $("#detalle_"+id).val(detalle);
    })
    ActualizarCarrito(arrayProductos);
  })
  
}

function ActualizarCarrito(carrito){
  for(var i=0;i<carrito.length;i++){
    id = carrito[i].id;
    selector = "#stock_1_"+id;
    carrito[i].cantidad = $(selector).val();
    selectorLote = "#lote_"+id;
    carrito[i].lote = $(selectorLote).val();
    selectorVencimiento = "#vencimiento_"+id;
    carrito[i].vencimiento = $(selectorVencimiento).val();
    selectorDetalle = "#detalle_"+id;
    carrito[i].detalle = $(selectorDetalle).val();
  }
  ActualizarTabla(carrito);
}


const ActualizarTabla = async (array) => {
  $(".filaTabla").remove();
  for(var i = 0;i<array.length;i++){
    idProducto = array[i].id;
    var htmlTags = '<tr class="filaTabla text-center">' +
                    '<td>' + array[i].codigo + '</td>'+
                    '<td>' + array[i].nombre.toUpperCase() + '</td>'+
                    '<td class="text-center"><select onchange="updateInput(this.value,this.id);ObtenerVencimiento(this.id);" style="text-align-last: center" id="lote_'+array[i].id+'" class="form-control"></select> </td>'+
                    '<td class="text-center"><input type="text" onchange="updateInput(this.value,this.id)" min="1" class="form-control text-center" style="width:60% !important; margin-left:30% !important;" id="detalle_'+array[i].id+'" value="'+array[i].detalle+'"></td>'+
                    '<td class="text-center"><input type="date" onchange="updateInput(this.value,this.id)" min="1" class="form-control text-center" style="width:60% !important; margin-left:30% !important;" id="vencimiento_'+array[i].id+'" value="'+array[i].vencimiento+'"></td>'+
                    '<td class="text-center"><input type="number" onchange="updateInput(this.value,this.id);" min="1" class="form-control text-center" style="width:40% !important; margin-left:30% !important;" id="stock_1_'+array[i].id+'" value="'+array[i].cantidad+'"></td>'+
                    '<td class="text-center"><div class="eliminar"><a href="javascript:;" onclick="EliminarItem('+i+');" class="text-danger" data-bs-toggle="tooltip" data-bs-placement="bottom" title="" data-bs-original-title="Delete" aria-label="Delete"><i class="bi bi-trash-fill"></i></a> </div></td>'+
                    '</tr>';
    $('#tabla-nuevo-pedido tbody').append(htmlTags);
    await CompletarDatos(array[i].lote,array[i].vencimiento,idProducto);
  }
  localStorage.setItem('arrayIngreso', JSON.stringify(array));
}

const CompletarDatos = async (lote,vencimiento,idProducto) => {
  //Validamos fechas
  if(lote == '-1'){
    document.getElementById('detalle_'+idProducto).removeAttribute('readonly');
    document.getElementById('vencimiento_'+idProducto).removeAttribute('readonly');
    $("#vencimiento_"+idProducto).val(moment().format('YYYY-MM-DD'));
    $("#detalle"+idProducto).val("");
  }else{
    document.getElementById('vencimiento_'+idProducto).setAttribute('readonly', true);
    document.getElementById('detalle_'+idProducto).setAttribute('readonly', true);
  }
  //Aca es donde obtenemos los lotes
  $.post("./api/productos/ObtenerLotes",{idProducto})
    .then((data)=> {
      if(data){
        data = JSON.parse(data);
        lote_mas_viejo = data[0];
        data.forEach((e)=> {
            !e.detalle_lote ? e.detalle_lote = "Sin detalle" : "";
            opcion = '<option value="'+e.id_lote+'">'+e.detalle_lote.toUpperCase()+'</option>';
            $("#lote_"+idProducto).append(opcion);
        })
        opcion = '<option value="-1">NUEVO</option>';
        $("#lote_"+idProducto).append(opcion);
        $("#lote_"+idProducto).val(lote);
        $("#vencimiento_"+idProducto).val(vencimiento);
      }
    })
 
}
function GuardarComprobante(){
  fecha = $("#fecha").val();
  nro = $("#nroComprobante").val();
  tCompro = $("#tCompro").val();
  proveedor = $("#proveedor").val();
  if(fecha && nro && arrayProductos.length>0 && tCompro && proveedor){
    CerrarNuevoIngreso();
    Lobibox.confirm({
        msg: "Seguro  que desea cargar este comprobante? Esta accion es irreversible.",
        callback: function ($this, type, ev) {
          if(type=="yes"){
            $("#modalMetodo").modal('show');
          }else{
            Lobibox.notify('warning', {
              pauseDelayOnHover: true,
              continueDelayOnInactiveTab: false,
              position: 'top right',
              icon: 'bx bx-message-error',
              msg: 'Acción cancelada.',
            });
            NuevoIngreso();
          }
      }
      });
  }else{
    Lobibox.notify('error', {
        pauseDelayOnHover: true,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        icon: 'bx bx-message-error',
        msg: 'Faltan campos por completar.',
      });
  }
}


function InsertarComprobante(){
  fecha = $("#fecha").val();
  nro = $("#nroComprobante").val();
  tCompro = $("#tCompro").val();
  proveedor = $("#proveedor").val();
  cc = $("#cc").val();
  efectivo = $("#efectivo").val();
  transferencia = $("#transferencia").val();
  cheque = $("#cheque").val();
  total = parseFloat(cc) + parseFloat(efectivo) + parseFloat(transferencia) + parseFloat(cheque);
  total = total.toFixed(2);
  var datos = {
    fecha,nro,tCompro,productos:arrayProductos,cc,efectivo,transferencia,cheque,total,proveedor
  }
  datos = JSON.stringify(datos);
  $.post(urlBase+"InsertarComprobante",{datos})
  .then(()=>{
    Lobibox.notify('success', {
        pauseDelayOnHover: true,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        icon: 'bx bx-check-circle',
        msg: 'Comprobante Cargado!',
      });
    $('#comprobantes').DataTable().ajax.reload();
    arrayProductos=[];
    localStorage.setItem('arrayIngreso', JSON.stringify(arrayProductos));
    $(".filaTabla").remove();
    $("#fecha").val('');
    $("#nroComprobante").val('');
    $("#tCompro").val('');
    $("#cc").val('0.00');
    $("#efectivo").val('0.00');
    $("#transferencia").val('0.00');
    $("#cheque").val('0.00');
    CerrarElegirMetodo();
  })
}

function CerrarElegirMetodo(){
  $("#modalMetodo").modal('hide');
}

