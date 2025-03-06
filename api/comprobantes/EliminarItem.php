<?php

require_once('../PDO.php');

$idItem = $_POST['idItem'];

$ObtenerIdVenta = $conexion -> prepare("SELECT * from ventaDetalle WHERE id_ventaDetalle='$idItem'");
$ObtenerIdVenta -> execute();
foreach($ObtenerIdVenta as $V){
    $idVenta = $V['idVenta_ventaDetalle'];
}

$EliminarItem = $conexion -> query("DELETE FROM ventaDetalle WHERE id_ventaDetalle = '$idItem'");

$ObtenemosTotalNuevo = $conexion -> prepare("SELECT * from ventaDetalle WHERE idVenta_ventaDetalle='$idVenta'");
$ObtenemosTotalNuevo -> execute();
$nuevoTotal = 0;
foreach($ObtenemosTotalNuevo as $sub){
    $subtotal = floatval($sub['precioVenta_ventaDetalle']) * floatval($sub['cantidad_ventaDetalle']);
    $nuevoTotal = $nuevoTotal + floatval($subtotal);
}
$nuevoTotal = number_format($nuevoTotal,2,'.','');
$ActualizamosTotal = $conexion -> prepare("UPDATE ventas SET totalVenta_venta = '$nuevoTotal' WHERE id_venta = '$idVenta'");
$ActualizamosTotal -> execute();

?>
