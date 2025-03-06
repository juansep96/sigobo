<?php

require_once "../PDO.php";

date_default_timezone_set("America/Argentina/Buenos_Aires");
setlocale(LC_ALL,"es_ES");
$cuando = date("Y-m-d H:i:s");


$datos = json_decode($_POST['datos'],true);
$productos = $datos['productos'];

if(isset($_POST['idFactura'])){
    $idFactura=$_POST['idFactura'];
}else{  
    $idFactura=-1;
}

if(isset($_POST['facturacion'])){
    $datosFacturacion = json_decode($_POST['facturacion'],true);
}else{  
    $datosFacturacion = [
        "nro" => "0",
        "cae" => "0",
        "vto" => "0000-00-00",
        "pdv" => "0",
    ];
}


$idCliente = -1;

if(isset($datos['idCliente'])){
  $idCliente = $datos['idCliente'];
}
if(isset($datos['total_sin_iva'])){
  $total_sin_iva = floatval($datos['total_sin_iva']);
}else{
  $total_sin_iva = floatval($datos['total']);
}

if(isset($datos['tipo'])){
    switch ($datos['tipo']) {
        case 'PRESENCIAL':
            $estadoAdicional = "-";
        break;
        case 'RETIRO':
            $estadoAdicional = "ARMADO";
        break;
        case 'ENVIOS':
            $estadoAdicional = "ARMADO";
        break;
    }
}

$InsertarEncabezado = $conexion -> prepare("INSERT INTO ventas (fechaHora_venta,totalVenta_venta,pagoTransferencia_venta,pagoEfectivo_venta,pagoCheque_venta,pagoCC_venta,idCliente_venta,totalSinIVA_venta,idSucursal_venta,idUsuario_venta,tipoVenta_venta) values (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10,:11)");
$InsertarEncabezado -> bindParam(':1',$cuando);
$InsertarEncabezado -> bindParam(':2',$datos['total']);
$InsertarEncabezado -> bindParam(':3',$datos['transferencia']);
$InsertarEncabezado -> bindParam(':4',$datos['efectivo']);
$InsertarEncabezado -> bindParam(':5',$datos['cheque']);
$InsertarEncabezado -> bindParam(':6',$datos['cc']);
$InsertarEncabezado -> bindParam(':7',$idCliente);
$InsertarEncabezado -> bindParam(':8',$total_sin_iva);
$InsertarEncabezado -> bindParam(':9',$_SESSION['idSucursal']);
$InsertarEncabezado -> bindParam(':10',$_SESSION['idUser']);
$InsertarEncabezado -> bindParam(':11',$datos['tipo']);

if($InsertarEncabezado->execute()){
    $idVenta = $conexion->lastInsertId();
  foreach($datos['productos'] as $producto){
    $cantidad = $producto['cantidad'];
    $idProducto = $producto['idProducto'];
    $codigo = $producto['codigo'];
    if($codigo=="999999"){
      $cero=0;
      $InsertarProducto = $conexion -> prepare("INSERT INTO productos (nombre_producto,codigo_producto,iva_producto,valorCompra_producto,valorVenta_producto,stock_1_producto,estado_producto) VALUES (:1,:2,:3,:4,:5,:6,:7)");
      $InsertarProducto -> bindParam(':1',$producto['nombre']);
      $InsertarProducto -> bindParam(':2',$producto['codigo']);
      $InsertarProducto -> bindParam(':3',$cero);
      $InsertarProducto -> bindParam(':4',$cero);
      $InsertarProducto -> bindParam(':5',$producto['precio']);
      $InsertarProducto -> bindParam(':6',$cero);//Lote
      $InsertarProducto -> bindParam(':7',$cero); //Inserto el producto como eliminado para que no aparezca en el listado,
      if(!$InsertarProducto -> execute()){
        echo "\nPDO::errorInfo():\n";
        print_r($InsertarProducto->errorInfo());
    }
      $idProducto = $conexion -> lastInsertId();
    
      $InsertarDetalle = $conexion -> prepare("INSERT INTO ventaDetalle (idVenta_ventaDetalle,precioVenta_ventaDetalle,idProducto_ventaDetalle,cantidad_ventaDetalle,lote_ventaDetalle) VALUES (:1,:2,:3,:4,:5)");
      $InsertarDetalle -> bindParam(':1',$idVenta);
      $InsertarDetalle -> bindParam(':2',$producto['precio']);
      $InsertarDetalle -> bindParam(':3',$idProducto);
      $InsertarDetalle -> bindParam(':4',$producto['cantidad']);
      $InsertarDetalle -> bindParam(':5',$producto['lote']);
      $InsertarDetalle -> execute();

    }else{
        if($codigo=='NC'){ // Tenemos que anular la NC -- Este codigo esta en desuso ya que este sistema no integra NC
            $nc = $producto['nombre'];
            $nc = explode('-',$nc);
            $nc = $nc[1];
            $AnularNC = $conexion -> query("UPDATE nc SET estado_nc = 'UTILIZADA' WHERE id_nc=$nc");

            //Ahora insertamos la NC como producto para que no joda

            $cero=0;
            $InsertarProducto = $conexion -> prepare("INSERT INTO productos (nombre_producto,codigo_producto,iva_producto,valorCompra_producto,valorVenta_producto,stock_1_producto,estado_producto) VALUES (:1,:2,:3,:4,:5,:6,:7)");
            $InsertarProducto -> bindParam(':1',$producto['nombre']);
            $InsertarProducto -> bindParam(':2',$producto['codigo']);
            $InsertarProducto -> bindParam(':3',$cero);
            $InsertarProducto -> bindParam(':4',$cero);
            $InsertarProducto -> bindParam(':5',$producto['precio']);
            $InsertarProducto -> bindParam(':6',$cero);//stock
            $InsertarProducto -> bindParam(':7',$cero); //Inserto el producto como eliminado para que no aparezca en el listado,
            if(!$InsertarProducto -> execute()){
                echo "\nPDO::errorInfo():\n";
                print_r($InsertarProducto->errorInfo());
            }
            $idProducto = $conexion -> lastInsertId();

            $InsertarDetalle = $conexion -> prepare("INSERT INTO ventaDetalle (idVenta_ventaDetalle,precioVenta_ventaDetalle,idProducto_ventaDetalle,cantidad_ventaDetalle,lote_ventaDetalle) VALUES (:1,:2,:3,:4,:5)");
            $InsertarDetalle -> bindParam(':1',$idVenta);
            $InsertarDetalle -> bindParam(':2',$producto['precio']);
            $InsertarDetalle -> bindParam(':3',$idProducto);
            $InsertarDetalle -> bindParam(':4',$producto['cantidad']);
            $InsertarDetalle -> bindParam(':5',$producto['lote']);
            $InsertarDetalle -> execute();
            
        }else{
            $InsertarDetalle = $conexion -> prepare("INSERT INTO ventaDetalle (idVenta_ventaDetalle,precioVenta_ventaDetalle,idProducto_ventaDetalle,cantidad_ventaDetalle,lote_ventaDetalle) VALUES (:1,:2,:3,:4,:5)");
            $InsertarDetalle -> bindParam(':1',$idVenta);
            $InsertarDetalle -> bindParam(':2',$producto['precio']);
            $InsertarDetalle -> bindParam(':3',$idProducto);
            $InsertarDetalle -> bindParam(':4',$producto['cantidad']);
            $InsertarDetalle -> bindParam(':5',$producto['lote']);
            if(!$InsertarDetalle -> execute()){
              echo "\nPDO::errorInfo():\n";
              print_r($InsertarDetalle->errorInfo());
              }
        }
     
    }
    /* El aumento de stock solo se lleva a cabo cuando el presupuesto pasa a ser una venta.
    $stock_a_descontar = 'stock_1_producto';
    $DescontarStock = $conexion -> query ("UPDATE productos SET $stock_a_descontar=$stock_a_descontar-'$cantidad' WHERE id_producto='$idProducto'");
    */
  }

  


  echo $idVenta;
}else{
  echo "\nPDO::errorInfo():\n";
    print_r($InsertarEncabezado->errorInfo());
}


?>