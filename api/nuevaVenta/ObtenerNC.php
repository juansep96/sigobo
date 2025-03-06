<?php

require_once "../PDO.php";

$dato=$_POST['idNC'];

$ObtenerNC = $conexion->prepare("SELECT * from nc WHERE id_nc=:1 AND estado_nc='GENERADA' ");
$ObtenerNC->bindParam(':1',$dato);
$ObtenerNC->execute();

$result = $ObtenerNC->fetchAll(\PDO::FETCH_ASSOC);

print_r (json_encode($result));


?>
