<?php

require_once('../PDO.php');

$idLote = $_POST['idLote'];

$ObtenerLotes = $conexion -> prepare("SELECT * FROM lotes WHERE id_lote=:1");
$ObtenerLotes -> bindParam(':1',$idLote);
$ObtenerLotes -> execute();

$result = $ObtenerLotes->fetchAll(\PDO::FETCH_ASSOC);
print_r (json_encode($result));

?>
