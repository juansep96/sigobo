<?php

require_once "../PDO.php";

$datos = json_decode($_POST['datos2'],true);

$ActualizarVenta = $conexion->prepare("UPDATE ventas SET totalVenta_venta=:1,totalSinIVA_venta=:1,pagoTransferencia_venta=:2,pagoEfectivo_venta=:3,pagoCheque_venta=:4,pagoCC_venta=:5 WHERE id_venta=:6");
$ActualizarVenta -> bindParam(':1',$datos['total']);
$ActualizarVenta -> bindParam(':2',$datos['transferencia']);
$ActualizarVenta -> bindParam(':3',$datos['efectivo']);
$ActualizarVenta -> bindParam(':4',$datos['cheque']);
$ActualizarVenta -> bindParam(':5',$datos['cc']);
$ActualizarVenta -> bindParam(':6',$datos['idVenta']);
$ActualizarVenta -> execute();

?>