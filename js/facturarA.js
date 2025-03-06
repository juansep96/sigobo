var urlBase = "./api/nuevaVenta/";
var urlImpresion = urlBase+"ImprimirVentaA";
var urlFacturador = "./AFIP/facturarA";
var arrayProductos;
var total;
var idCliente;

$(document).ready(function() {
    $("#buscadorProducto").on('keyup', function (e) {
    e.preventDefault();
    var keycode = e.keyCode || e.which;
      if (keycode == 13) {
          BuscarProductos();
      }
    });
    arrayProductos=[{}];
    ActualizarTabla(arrayProductos);
    CargarClientes();
});


function CargarClientes(){
    $.post("./api/clientes/ObtenerClientesSelect")
    .then((res)=>{
        res=JSON.parse(res);
        res.forEach((e)=>{
        var opcion = "<option value='"+e.id_cliente+"'>"+e.razon_cliente.toUpperCase()+" - CUIT: "+e.cuit_cliente+" - "+e.nombre_tresponsable+"</option>";
        $('#clientes').append(opcion);
        })
    })
}

function ActivarCarrito(){
    $(".carrito").prop('hidden',false);
    idCliente = $("#clientes").val();
    arrayProductos=[{}];
    ActualizarTabla(arrayProductos);
}

function CargarComprobantesDisponibles(tContribuyente){
  $("#tipoComprobante").empty();
  $.post(urlBase+"ObtenerComprobantes",{tContribuyente})
  .then((data)=>{
    data=JSON.parse(data);
    data.forEach((e)=>{
      var opcion = "<option value='"+e.codigo_tComprobante+"'>"+e.nombre_tComprobante.toUpperCase()+"</option>";
      $('#tipoComprobante').append(opcion);
    })
    $("#tipoComprobante").val(0);
  })
}


function updateInput(cant,id){
  id="#"+id;
  $(id).val(cant);
  ActualizarCarrito(arrayProductos);
}

function updateInput2(unidad,id){
  selector="#"+id;
  $(selector).val(unidad);
  ActualizarCarrito(arrayProductos);
}

function ActualizarCarrito(carrito){
  for(var i=0;i<carrito.length;i++){
    id = carrito[i].id;
    selector = "#cant_"+id;
    carrito[i].cantidad = $(selector).val();
    selector2 = "#unidad_"+id;
    carrito[i].unidad = $(selector2).val();
  }
  ActualizarTabla(carrito);
}



function ActualizarTabla(array){
  $("#totalizador").val("");
  $(".filaTabla").remove();
  total=0;
  totalizador_sinIVA=0;
  iva_10=0;
  iva_21=0;
  iva_27=0;
  base_10=0;
  base_21=0;
  base_27=0;
  for(var i = 1;i<array.length;i++){
    precio = parseFloat(array[i].precio);
    subtotal = precio * array[i].cantidad;
    totalizador_sinIVA=totalizador_sinIVA+parseFloat(subtotal);
    subtotal = subtotal.toFixed(2);
    precio = precio.toFixed(2);
    subtotalCIVA = (parseFloat(array[i].precio) + ( (parseFloat(array[i].precio) * array[i].iva) / 100 ))*array[i].cantidad;
    total=total+subtotalCIVA;
    if(array[i].iva==10.5){
      iva_10 = iva_10 + (((parseFloat(array[i].precio) * array[i].iva) / 100 )) * array[i].cantidad;
      base_10 = base_10 + (precio * array[i].cantidad);
    }
    if(array[i].iva==21){
      iva_21 = iva_21 + (((parseFloat(array[i].precio) * array[i].iva) / 100 )) * array[i].cantidad;
      base_21 = base_21 + (precio * array[i].cantidad);
    }
    if(array[i].iva==27){
      iva_27 = iva_27 + (((parseFloat(array[i].precio) * array[i].iva) / 100 )) * array[i].cantidad;
      base_27 = base_27 + (precio * array[i].cantidad);
    }
    subtotalCIVA = subtotalCIVA.toFixed(2);
    var htmlTags = '<tr class="filaTabla">' +
                    '<td>' + array[i].codigo + '</td>'+
                    '<td>' + array[i].nombre + '</td>'+
                    '<td> $' + array[i].precio + '</td>'+
                    '<td><input type="number" step="0.01" onchange="updateInput(this.value,this.id);" min="1" class="form-control inputCantidad text-center" style="width:80px !important" id="cant_'+array[i].id+'" value="'+array[i].cantidad+'"></td>'+
                    '<td> $' + subtotal + '</td>'+
                    '<td>' + array[i].iva + '% </td>'+
                    '<td> $' + subtotalCIVA + '</td>'+
                    '<td class="text-center"><div class="eliminar"><a href="javascript:;" onclick="EliminarItem('+i+');" class="text-danger" data-bs-toggle="tooltip" data-bs-placement="bottom" title="" data-bs-original-title="Delete" aria-label="Delete"><i class="bi bi-trash-fill"></i></a> </div></td>'+
                    '</tr>';
    $('#tabla-venta tbody').append(htmlTags);
    selector = "#unidad_"+array[i].id;
    $(selector).val(array[i].unidad);

  }
  total=parseFloat(total);
  total = total.toFixed(2);
  totalizador_sinIVA=parseFloat(totalizador_sinIVA);
  totalizador_sinIVA = totalizador_sinIVA.toFixed(2);
  $("#totalizador").val(total);
  $("#totalizador_sinIVA").val(totalizador_sinIVA);

  iva_21=parseFloat(iva_21);
  iva_21 = iva_21.toFixed(2);
  $("#iva_21").val(iva_21);

  iva_10=parseFloat(iva_10);
  iva_10 = iva_10.toFixed(2);
  $("#iva_10").val(iva_10);

  iva_27=parseFloat(iva_27);
  iva_27 = iva_27.toFixed(2);
  $("#iva_27").val(iva_27);

  base_21=parseFloat(base_21);
  base_21 = base_21.toFixed(2);
  $("#base_21").val(base_21);

  base_10=parseFloat(base_10);
  base_10 = base_10.toFixed(2);
  $("#base_10").val(base_10);

  base_27=parseFloat(base_27);
  base_27 = base_27.toFixed(2);
  $("#base_27").val(base_27);

}

function BuscarProductos(){
  query = $("#buscadorProducto").val();
  idComprobante = $("#tipoComprobante").val();
  $("#errorBusqueda h3").remove();
  $("#buscadorProducto").val("");
  $.post(urlBase+"ObtenerProductos",{query,idCliente})
  .then((rta)=>{
          rta = JSON.parse(rta);
          if(rta.length==1){
            if(rta[0].stock_2_producto>0){
                if(rta[0].iva_producto==10){
                    rta[0].iva_producto=10.5;
                  }
                  if(rta[0].iva_producto==10.5){
                    var iva = 105;
                  }else{
                    var iva = rta[0].iva_producto;
                  }
                  rta[0].valorVenta_producto = parseFloat(rta[0].valorVenta_producto / parseFloat('1.'+iva)).toFixed(2);
                  producto = {
                    id: rta[0].id_producto,
                    codigo : rta[0].codigo_producto,
                    nombre : rta[0].nombre_producto,
                    precio : rta[0].valorVenta_producto,
                    cantidad : 1,
                    iva : rta[0].iva_producto,
                    descuento : 0,
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
            }else{
                Lobibox.notify('error', {
                    pauseDelayOnHover: true,
                    continueDelayOnInactiveTab: false,
                    position: 'top right',
                    icon: 'bx bx-error-circle',
                    msg: 'El producto no tiene stock, no puedes venderlo.',
                  });
            }
              
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
    if(array[i].stock_2_producto>0){
        var htmlTags = '<tr class="filaElegirProducto" onclick="CargarProductoArray('+array[i].id_producto+');">' +
        '<td>' + array[i].codigo_producto + '</td>'+
        '<td>' + array[i].nombre_producto + '</td>'+
        '<td> $ ' + precio + '</td>'+
        '</tr>';
    }else{
        var htmlTags = '<tr class="filaElegirProducto withoutStock">' +
                    '<td>' + array[i].codigo_producto + '</td>'+
                    '<td>' + array[i].nombre_producto + ' <b> --- SIN STOCK </b> </td>'+
                    '<td> $ ' + precio + '</td>'+
                    '</tr>';
    }
    $('#tabla-elegirproducto tbody').append(htmlTags);
    $("#modalElegirproducto").modal('show');
  }
}

function CerrarElegirProducto(){
  $("#modalElegirproducto").modal('hide');
}

function CargarProductoArray(idProducto){
  CerrarElegirProducto();
  $.post(urlBase+"ObtenerProducto",{idProducto,idCliente})
  .then((rta)=>{
          rta = JSON.parse(rta);
          if(rta.length==1){
            if(rta[0].iva_producto==10){
              rta[0].iva_producto=10.5;
            }
            if(rta[0].iva_producto==10.5){
              var iva = 105;
            }else{
              var iva = rta[0].iva_producto;
            }
            rta[0].valorVenta_producto = parseFloat(rta[0].valorVenta_producto / parseFloat('1.'+iva)).toFixed(2);
            producto = {
              id: rta[0].id_producto,
                codigo : rta[0].codigo_producto,
                nombre : rta[0].nombre_producto,
                precio : rta[0].valorVenta_producto,
                cantidad : 1,
                iva : parseInt(rta[0].iva_producto),
                descuento : 0,
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
      cantidad: 1,
      iva : 21,
      descuento : 0,
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
    $("#ajustes")[0].reset();
    $("#modalAjuste").modal('hide');
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
  cero="0.00";
  $("#efectivo").val(cero);
  $("#posnet").val(cero);
  $("#transferencia").val(cero);
  if(arrayProductos.length>1){
    total = $("#totalizador").val();
    $("#efectivo").val(total);
    $("#modalMetodo").modal('show');
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


function InsertarVenta(){
  efectivo = $("#efectivo").val();
  transferencia = $("#transferencia").val();
  posnet = $("#posnet").val();
  total = $("#totalizador").val();
  iva_10 = $("#iva_10").val();
  iva_21 = $("#iva_21").val();
  iva_27 = $("#iva_27").val();
  base_10 = $("#base_10").val();
  base_21 = $("#base_21").val();
  base_27 = $("#base_27").val();
  iva = parseFloat(iva_10) + parseFloat(iva_21)  + parseFloat(iva_27) ;
  totalizador_sinIVA = $("#totalizador_sinIVA").val();
  tipoComprobante = 1; //Factura A
  idCliente = $("#clientes").val();
  if(efectivo && posnet && transferencia && tipoComprobante){
    arrayProductos.shift();
    var datos = {
      productos : arrayProductos,
      total,
      efectivo,
      posnet,
      transferencia,
      tipoComprobante,
      idCliente,
      iva,
      total_sin_iva : totalizador_sinIVA,
    }
    var arrayFacturacion = {
      codigoComprobante : tipoComprobante,
      total : total,
      iva_10,
      iva_21,
      iva_27,
      base_10,
      base_21,
      base_27,
      total_sin_iva : totalizador_sinIVA,
    }
    datos = JSON.stringify(datos);
    arrayFacturacion = JSON.stringify(arrayFacturacion);
    $.post(urlFacturador,{arrayFacturacion,idCliente})
      .then((res)=>{
        res = JSON.parse(res);
        if(res.success){ // Se facturó
          idFactura = res.idFactura;
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

function NuevoDescuentoPorcentual(){
  $("#modalDescuentoPorcentual").modal('show');
}

function CerrarNuevoDescuentoPorcentual(){
  $("#modalDescuentoPorcentual").modal('hide');
}

function CargarAjustePorcentual(){
  porcentaje = $("#porcentaje_descuento").val();
  console.log(porcentaje);
  totalizador = $("#totalizador").val();
  if(porcentaje){
    porcentaje = parseFloat(porcentaje);
    totalizador = parseFloat(totalizador);
    if(porcentaje==100){
      descuento = totalizador;
    }else{
      descuento = (totalizador*porcentaje)/100;
    }
    producto = {
      id: 0,
      codigo : "999999",
      nombre : "Descuento",
      precio : descuento*-1,
      cantidad: 1,
      unidad : "unidad",
      iva : 0
    }
    arrayProductos.push(producto);
    ActualizarTabla(arrayProductos);
    CerrarNuevoDescuentoPorcentual();
  }else{
    Lobibox.notify('error', {
      pauseDelayOnHover: true,
      continueDelayOnInactiveTab: false,
      position: 'top right',
      icon: 'bx bx-message-error',
      msg: 'Ingrese un importe válido.',
    });
  }
}
