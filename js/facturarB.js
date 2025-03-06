var urlBase = "./api/nuevaVenta/";
//var urlImpresion = urlBase+"ImprimirVentaB";
var urlImpresion = urlBase+"ImprimirRemito";
var urlFacturador = "./AFIP/facturarB";

var guardado = localStorage.getItem('arrayVentas');
var guardado=JSON.parse(guardado);
var arrayProductos;
var total;

$(document).ready(function() {

    ActivarBotonGuardar();

    $(document).ready(function () {
        $('#clientes').selectize({
            sortField: 'text'
        });
    });

    CargarClientes();

    $("#buscadorProducto").on('keyup', function (e) {
    e.preventDefault();
    var keycode = e.keyCode || e.which;
      if (keycode == 13) {
          BuscarProductos();
      }
    });


    if(!guardado){
      arrayProductos=[{}];
      $("#totalizador").val("0.00");
    }else{
      arrayProductos = guardado;
      ActualizarTabla(arrayProductos);
    }


});


function ActivarCarrito(){
  $(".carrito").prop('hidden',false);
  idCliente = $("#clientes").val();
  arrayProductos=[{}];
  ActualizarTabla(arrayProductos);
}

function CargarClientes(){
  $.post("./api/clientes/ObtenerClientesSelect")
  .then((res)=>{
      res=JSON.parse(res);
      res.forEach((e)=>{
        let text = e.nombre_cliente.toUpperCase()+" - CUIT: "+e.cuit_cliente;
        var $select = $(document.getElementById('clientes')).selectize( {sortField: 'text'});
        var selectize = $select[0].selectize;
        selectize.addOption({value: e.id_cliente, text:text});
        selectize.refreshOptions();
      })
  })
}

function sleep(ms) {
    return new Promise(val => setTimeout(val, ms));
  }

function updateInput(cant,id){
  id="#"+id;
  let isCantidad = id.split('_');
  let idArray;
  isCantidad = isCantidad[0];
  if(isCantidad == '#cant'){
    let max = $(id).attr('max');
    if(cant <= max ){
      $(id).val(cant);
      ActualizarCarrito(arrayProductos);
    }else{
      Lobibox.notify('error', {
        pauseDelayOnHover: true,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        icon: 'bx bx-message-error',
        msg: 'La cantidad a vender supera el stock del Lote. Escoja otro lote.',
      });
      $(id).val(1);
      ActualizarCarrito(arrayProductos);
    }
  }else{
    if(isCantidad == "#lote"){ // Cambiamos pero tenemos que setear el nuevo maximo en el input de la cantidad
      $.post("./api/comprobantes/ObtenerLote",{idLote:cant})
      .then(async (data)=> {
        data = JSON.parse(data);
        idArray = arrayProductos.findIndex(function(obj){return obj.id == id.split('_')[1]})
        console.log(idArray);
        arrayProductos[idArray].max = data[0].stock_lote;
        $(id).val(cant);
        ActualizarCarrito(arrayProductos);
      });
    }else{
        if(isCantidad == "#precio"){ 
            $(id).val(cant);
            ActualizarCarrito(arrayProductos);
          }
          
    }
    
  }  
}

function updateInput2(desc,id){
  id="#"+id;
  $(id).val(desc);
  ActualizarCarrito(arrayProductos);
}

function ActualizarCarrito(carrito){
  for(var i=0;i<carrito.length;i++){
    id = carrito[i].id;
    selector = "#cant_"+id;
    carrito[i].cantidad = $(selector).val();
    selectorLote = "#lote_"+id;
    carrito[i].lote = $(selectorLote).val();
    selectorPrecio = "#precio_"+id;
    carrito[i].precio = $(selectorPrecio).val();
    
  }
  ActualizarTabla(carrito);
}

const ActualizarTabla = async (array) => {
  $("#totalizador").val("");
  $(".filaTabla").remove();
  total=0;
  for(var i = 1;i<array.length;i++){
    idProducto = array[i].idProducto;
    precio = parseFloat(array[i].precio);
    subtotal = precio * array[i].cantidad;
    descuento = array[i].descuento;
    if(descuento>0 && descuento<99){
      descuento = "0."+descuento;
      subtotal = subtotal-(subtotal*descuento);
    }else{
      if(descuento==100){
        descuento = 1;
        subtotal = subtotal-(subtotal*descuento);
      }
    }
    total=total+parseFloat(subtotal);
    subtotal = subtotal.toFixed(2);
    precio = precio.toFixed(2);
    var htmlTags = '<tr class="filaTabla">' +
                    '<td class="text-center">' + array[i].codigo + '</td>'+
                    '<td class="text-center">' + array[i].nombre + '</td>'+
                    '<td class="text-center"><input type="number" onchange="updateInput(this.value,this.id);" class="form-control inputCantidad text-center" style="width:120px" id="precio_'+array[i].id+'" value="'+array[i].precio+'"></td>'+
                    '<td class="text-center"><select onchange="updateInput(this.value,this.id);" style="text-align-last: center;width:250px" id="lote_'+array[i].id+'" class="form-control"></select> </td>'+
                    '<td class="text-center"><input type="number" onchange="updateInput(this.value,this.id);" min="1"  max="'+array[i].max+'" style="width:80px" class="form-control inputCantidad text-center" id="cant_'+array[i].id+'" value="'+array[i].cantidad+'"></td>'+
                    '<td class="text-center"> $' + subtotal + '</td>'+
                    '<td class="text-center"><div class="eliminar"><a href="javascript:;" onclick="EliminarItem('+i+');" class="text-danger" data-bs-toggle="tooltip" data-bs-placement="bottom" title="" data-bs-original-title="Delete" aria-label="Delete"><i class="bi bi-trash-fill"></i></a> </div></td>'+
                    '</tr>';
      $('#tabla-venta tbody').append(htmlTags);
      await CompletarDatos(array[i].lote,array[i].vencimiento,idProducto,array[i].id);
  }
  total=parseFloat(total);
  total = total.toFixed(2);
  $("#totalizador").val(total);
  localStorage.setItem('arrayVentas', JSON.stringify(array));
}

const CompletarDatos = async (lote,vencimiento,idProducto,indexArray) => {
  $.post("./api/productos/ObtenerLotes",{idProducto})
    .then((data)=> {
      if(data){
        data = JSON.parse(data);
        lote_mas_viejo = data[0];
        data.forEach((e)=> {
            console.log(e);
            !e.detalle_lote ? e.detalle_lote = '' : e.detalle_lote = e.detalle_lote;
          opcion = '<option value="'+e.id_lote+'">'+e.detalle_lote+' - Vto. '+moment(e.vencimiento_lote).format('DD/MM/YYYY')+' - '+e.stock_lote+' Un.</option>';
          $("#lote_"+indexArray).append(opcion);
        })
        $("#lote_"+indexArray).val(lote);
      }
    }) 
}

function BuscarProductos(){
  query = $("#buscadorProducto").val();
  $("#errorBusqueda h3").remove();
  $("#buscadorProducto").val("");
  $.post(urlBase+"ObtenerProductos",{query})
  .then((rta)=>{
          rta = JSON.parse(rta);
          if(rta.length==1){
            producto = {
              id: arrayProductos.length+5,
              codigo : rta[0].codigo_producto,
              nombre : rta[0].nombre_producto,
              precio : rta[0].valorVenta_producto,
              idProducto : rta[0].id_producto,
              cantidad : 1,
              descuento : 0,
              lote:rta[0].id_lote,
              max : rta[0].stock_lote,
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
    precio = parseFloat(array[i].valorVenta_producto);
    precio = precio.toFixed(2);
    var htmlTags = '<tr class="filaElegirProducto" onclick="CargarProductoArray('+array[i].id_producto+');">' +
        '<td>' + array[i].codigo_producto + '</td>'+
        '<td>' + array[i].nombre_producto + '</td>'+
        '<td> $ ' + precio + '</td>'+
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
  $.post(urlBase+"ObtenerProducto",{idProducto})
  .then((rta)=>{
          rta = JSON.parse(rta);
          if(rta.length==1){
            producto = {
              id: arrayProductos.length+5,
              codigo : rta[0].codigo_producto,
              nombre : rta[0].nombre_producto,
              precio : rta[0].valorVenta_producto,
              idProducto : rta[0].id_producto,
              cantidad : 1,
              descuento : 0,
              lote:rta[0].id_lote,
              max : rta[0].stock_lote,
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
        msg: 'Item Eliminado!',
      });
    ActualizarTabla(arrayProductos);
}



function NuevoAjuste(){
  $("#modalAjuste").modal('show');
}

function CargarAjuste(){
  detalle = $("#detalle_item").val();
  precio = $("#importe_item").val();
  if(precio.length>0){
    precio = precio.replace(",",".");
  }
  if(detalle && !isNaN(precio) && precio){
    detalle = detalle.toUpperCase();
    producto = {
        id: 0,
        codigo : "999999",
        nombre : detalle,
        precio : precio,
        idProducto : rta[0].id_producto,
        cantidad : 1,
        descuento : 0,
        lote:0,
        max :0
    }
    arrayProductos.push(producto);
    ActualizarTabla(arrayProductos);
    Lobibox.notify('success', {
        pauseDelayOnHover: true,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        icon: 'bx bx-check-circle',
        msg: 'Ajuste agregado!',
      });
    $("#detalle_item").val('');
    $("#importe_item").val('');
    CerrarCargarAjuste();
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

function DescartarVenta(){
    Lobibox.confirm({
        msg: "Seguro  que desea descartar esta venta?",
        callback: function ($this, type, ev) {
          if(type=="yes"){
            arrayProductos=[{}];
            ActualizarTabla(arrayProductos);
            Lobibox.notify('success', {
                pauseDelayOnHover: true,
                continueDelayOnInactiveTab: false,
                position: 'top right',
                icon: 'bx bx-check-circle',
                msg: 'Venta descartada!',
              });
          }else{
            Lobibox.notify('warning', {
              pauseDelayOnHover: true,
              continueDelayOnInactiveTab: false,
              position: 'top right',
              icon: 'bx bx-message-error',
              msg: 'Acción cancelada.',
            });
          }
      }
      });
}

function CerrarCargarAjuste(){
  $("#modalAjuste").modal('hide');
}

function CerrarMetodoPago(){
  $("#modalMetodo").modal('hide');
}

function GuardarVenta(){
  cero='0.00';
  $("#efectivo").val(cero);
  $("#transferencia").val(cero);
  $("#cheque").val(cero);
  $("#pagaCon").val(cero);
  $("#cc").val(cero);
  CalcularVuelto();
  if(arrayProductos.length>1){
    total = $("#totalizador").val();
    $("#cc").val(total);
    $("#facturar").val("NO");
    $("#botonGuardar").prop('hidden',true);
    $("#modalMetodo").modal('show');
    ActivarBotonGuardar();
  }else{
    Lobibox.notify('error', {
        pauseDelayOnHover: true,
        continueDelayOnInactiveTab: false,
        position: 'top right',
        icon: 'bx bx-message-error',
        msg: 'No hay productos en la venta.',
      });
  }
}


function CalcularVuelto(){
  efectivo = $("#efectivo").val();
  pagaCon = $("#pagaCon").val();
  if(efectivo>0){
    vuelto = pagaCon-efectivo;
    vuelto = "$ "+vuelto;
    $("#vuelto").val(vuelto);
  }

}

function InsertarVenta(){
  idCliente = $("#clientes").val();
  efectivo = $("#efectivo").val();
  total = $("#totalizador").val();
  cheque = $("#cheque").val();
  transferencia = $("#transferencia").val();
  cc = $("#cc").val();
  facturar = "NO";
  tipo = "PRESUPUESTO";
  if(total && efectivo && cheque && transferencia && cc){
    arrayProductos.shift();
    var datos = {
      productos : arrayProductos,
      efectivo,
      transferencia,
      cheque,
      total,
      cc,
      idCliente,
      tipo
    }
    datos = JSON.stringify(datos);
    $("#modalGuardando").modal('show');
    if(facturar=="NO"){
      $.post(urlBase+"InsertarVenta",{datos})
      .then((idVenta)=>{
        $("#modalGuardando").modal('hide');
        window.open(urlImpresion+'?idVenta='+idVenta, '_blank');
        CerrarMetodoPago();
        arrayProductos=[{}];
        ActualizarTabla(arrayProductos);
        $("#modalGuardando").modal('hide');
      })
    }else{
      $.post(urlFacturador,{total})
      .then((response)=>{
        response = JSON.parse(response);
        if(response.success){ // Se facturó
          idFactura = response.idFactura;
          $.post(urlBase+"InsertarVenta",{datos,idFactura})
          .then((idVenta)=>{
            $("#modalGuardando").modal('hide');
            window.open(urlImpresion+'?idVenta='+idVenta, '_blank');
            CerrarMetodoPago();
            arrayProductos=[{}];
            ActualizarTabla(arrayProductos);
            $("#modalGuardando").modal('hide');
            reset();
          })
        }else{ //Error al facturar, no mandamos a imprimir pero insertamos y damos un cartel modal.
          $.post(urlBase+"InsertarVenta",{datos})
          .then(()=>{
            $("#modalGuardando").modal('hide');
            CerrarMetodoPago();
            arrayProductos=[{}];
            ActualizarTabla(arrayProductos);
            $("#modalGuardando").modal('hide');
            $("#modalErrorFacturarAFIP").modal('show');
            $("#modalGuardando").modal('hide');
            reset();
          })
        }        
      })
    }
    
  }else{
    Lobibox.notify('error', {
      pauseDelayOnHover: true,
      continueDelayOnInactiveTab: false,
      position: 'top right',
      icon: 'bx bx-message-error',
      msg: 'Complete todos los campos.',
    });
  }
}

function CerrarElegirMetodo(){
  $("#modalMetodo").modal('hide');
}

function ActivarBotonGuardar(){
  $("#botonGuardar").prop('hidden',false);
}

const AsociarNC = () => {
    $("#modalNC").modal('show');
}

const BuscarNC = async () => {
    let nc = $("#nc").val();
    if(nc){
        $(".filaDetalle").remove();
        $("#modalCargando").modal('show');
        setTimeout(async ()=> {
            $('#close').click(); //Esto simula un click sobre el botón close de la modal, por lo que no se debe preocupar por qué clases agregar o qué clases sacar.
            $('.modal-backdrop').remove();//eliminamos el backdrop del modal
        },2000);
        $.post(urlBase+"ObtenerNC",{idNC:nc})
        .then(async (data)=> {
            data = JSON.parse(data);
            if(data && data.length>0){
                data=data[0];
                $("#modalCargando").modal('hide');
                let precio = parseFloat(data.montoTotal_nc) * -1;
                precio = parseFloat(precio).toFixed(2);
                producto = {
                    id: 0,
                    codigo : "NC",
                    nombre : 'NOTA DE CREDITO - '+nc,
                    precio : precio,
                    cantidad : 1,
                    descuento : 0,
                    tiene_variantes:0
                  }
                  arrayProductos.push(producto);
                  ActualizarTabla(arrayProductos);
                  $("#modalNC").modal('hide');
                  Lobibox.notify('success', {
                      pauseDelayOnHover: true,
                      continueDelayOnInactiveTab: false,
                      position: 'top right',
                      icon: 'bx bx-check-circle',
                      msg: 'Ajuste agregado!',
                    });
            }else{
                Lobibox.notify('error', {
                    pauseDelayOnHover: true,
                    continueDelayOnInactiveTab: false,
                    position: 'top right',
                    icon: 'bx bx-message-error',
                    msg: 'No se encuentra la Nota de Credito o ya fue utilizada.',
                  });
            }            
        })
    }else{
        Lobibox.notify('error', {
            pauseDelayOnHover: true,
            continueDelayOnInactiveTab: false,
            position: 'top right',
            icon: 'bx bx-message-error',
            msg: 'Ingrese un Codigo de Nota de Credito.',
          });
    }
}