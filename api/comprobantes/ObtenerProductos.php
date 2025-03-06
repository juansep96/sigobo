<?php

require_once "../PDO.php";

$dato=$_POST['query'];
$dato=strtolower($dato);
$dato='%'.$dato.'%';

$ObtenerProductos = $conexion->prepare("SELECT * from productos left join lotes on idProducto_lote = id_producto WHERE ( (lower(nombre_producto) LIKE :dato) OR (lower(codigo_producto) LIKE :dato)) AND estado_producto=1 GROUP BY id_producto ORDER BY vencimiento_lote,nombre_producto ASC ");
$ObtenerProductos->bindParam(':dato',$dato);
$ObtenerProductos->execute();

$result = $ObtenerProductos->fetchAll(\PDO::FETCH_ASSOC);


print_r (json_encode($result));


?>
