<?php

require_once "../PDO.php";

$fechaIni = $_POST['desde'];
$fechaFin = $_POST['hasta'];

$ObtenerTotales = $conexion -> prepare("SELECT tCompro_ingCompro,total_ingCompro from ingresoComprobantes WHERE estado_ingCompro = 1 AND fecha_ingCompro BETWEEN :1 AND :2 ");
$ObtenerTotales -> bindParam(':1',$fechaIni);
$ObtenerTotales -> bindParam(':2',$fechaFin);
$ObtenerTotales -> execute();

$result = $ObtenerTotales->fetchAll(\PDO::FETCH_ASSOC);
print_r (json_encode($result));


?>