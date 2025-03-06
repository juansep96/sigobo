<?php

require_once('../PDO.php');


$ObtenerVendedoras = $conexion -> query("SELECT * FROM users WHERE active_user=1 ORDER BY name_user ASC ");

$result = $ObtenerVendedoras->fetchAll(\PDO::FETCH_ASSOC);
print_r (json_encode($result));

?>
