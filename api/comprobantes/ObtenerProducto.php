<?php

require_once "../PDO.php";

$dato=$_POST['idProducto'];

$ObtenerProducto = $conexion->prepare("SELECT * from productos left join lotes on idProducto_lote = id_producto WHERE id_producto=:1 GROUP BY id_producto ORDER BY vencimiento_lote,nombre_producto ASC");
$ObtenerProducto->bindParam(':1',$dato);
$ObtenerProducto->execute();

$result = $ObtenerProducto->fetchAll(\PDO::FETCH_ASSOC);

print_r (json_encode($result));


?>
