<?php

require_once "../PDO.php";

$datos = json_decode($_POST['datos'],true);

$ActualizarItem = $conexion->prepare("UPDATE ventaDetalle SET lote_ventaDetalle=:1,precioVenta_ventaDetalle=:2,cantidad_ventaDetalle=:3 WHERE id_ventaDetalle=:4");
$ActualizarItem -> bindParam(':1',$datos['lote']);
$ActualizarItem -> bindParam(':2',$datos['precio']);
$ActualizarItem -> bindParam(':3',$datos['cantidad']);
$ActualizarItem -> bindParam(':4',$datos['id']);
$ActualizarItem -> execute();

?>