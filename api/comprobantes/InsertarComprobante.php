<?php

require_once "../PDO.php";

$datos = json_decode($_POST['datos'],true);

$cuando = date("Y-m-d H:i:s");

$cero = 0;

$InsertarEncabezado = $conexion -> prepare("INSERT INTO ingresoComprobantes (fecha_ingCompro,nro_ingCompro,tCompro_ingCompro,idUsuario_ingCompro,total_ingCompro,efectivo_ingCompro,cc_ingCompro,transferencia_ingCompro,cheque_ingCompro,idProveedor_ingCompro) values (:1,:2,:3,:4,:5,:6,:7,:8,:9,:10)");
$InsertarEncabezado -> bindParam(':1',$datos['fecha']);
$InsertarEncabezado -> bindParam(':2',$datos['nro']);
$InsertarEncabezado -> bindParam(':3',$datos['tCompro']);
$InsertarEncabezado -> bindParam(':4',$_SESSION['idUser']);
$InsertarEncabezado -> bindParam(':5',$datos['total']);
$InsertarEncabezado -> bindParam(':6',$datos['efectivo']);
$InsertarEncabezado -> bindParam(':7',$datos['cc']);
$InsertarEncabezado -> bindParam(':8',$datos['transferencia']);
$InsertarEncabezado -> bindParam(':9',$datos['cheque']);
$InsertarEncabezado -> bindParam(':10',$datos['proveedor']);
if($InsertarEncabezado->execute()){
    $idComprobante = $conexion->lastInsertId();
   foreach($datos['productos'] as $producto){
    $cantidad = $producto['cantidad'];
    $idProducto = $producto['id'];
    //Hay que preguntar si es un lote nuevo o es un lote viejo para controlar stocks.
    if($producto['lote'] == '-1'){ // Es lote nuevo, lo generamos.
      $InsertarLote = $conexion -> prepare ("INSERT INTO lotes (idProducto_lote,idSucursal_lote,vencimiento_lote,stock_lote,detalle_lote) VALUES (:1,:2,:3,:4,:5)");
      $InsertarLote -> bindParam(':1',$idProducto);
      $InsertarLote -> bindParam(':2',$_SESSION['idSucursal']);
      $InsertarLote -> bindParam(':3',$producto['vencimiento']);
      $InsertarLote -> bindParam(':4',$cantidad);
      $InsertarLote -> bindParam(':5',$producto['detalle']);
      $InsertarLote -> execute();
      $idLote = $conexion->lastInsertId();
    }else{ // Es lote viejo, solo subimos el stock de dicho lote
      $idLote = $producto['lote'];
      $AumentarStockLote = $conexion -> query("UPDATE lotes SET stock_lote = stock_lote + '$cantidad' WHERE id_lote = '$idLote'");
    }
    $InsertarDetalle = $conexion -> prepare("INSERT INTO ingresoDetalle (idComprobante_ingDetalle,idProducto_ingDetalle,stock_1_ingDetalle,idLote_ingDetalle) VALUES (:1,:2,:3,:4)");
    $InsertarDetalle -> bindParam(':1',$idComprobante);
    $InsertarDetalle -> bindParam(':2',$producto['id']);
    $InsertarDetalle -> bindParam(':3',$cantidad);
    $InsertarDetalle -> bindParam(':4',$idLote);
    $InsertarDetalle -> execute();
  }
  echo $idComprobante;
}else{
  echo "\nPDO::errorInfo():\n";
    print_r($InsertarEncabezado->errorInfo());
}


?>
