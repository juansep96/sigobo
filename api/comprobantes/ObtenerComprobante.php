<?php

require_once "../PDO.php";

$idComprobante=$_POST['idComprobante'];

$ObtenerDetalle = $conexion -> prepare("SELECT * from ingresoDetalle LEFT JOIN productos ON idProducto_ingDetalle = id_producto left join lotes on id_lote = idLote_ingDetalle WHERE idComprobante_ingDetalle=:1");
$ObtenerDetalle -> bindParam(':1',$idComprobante);
$ObtenerDetalle -> execute();

$result = $ObtenerDetalle->fetchAll(\PDO::FETCH_ASSOC);
print_r (json_encode($result));

?>
