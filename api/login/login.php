<?php

require_once('../PDO.php');

$user = $_POST['user'];
$password = $_POST['pass'];

$IniciarSesion = $conexion->prepare("SELECT * from users left join roles ON id_role = idRole_user left join sucursales ON id_sucursal=idSucursal_user WHERE username_user=:1 AND password_user=:2 AND active_user=1");
$IniciarSesion -> bindParam(':1',$user);
$IniciarSesion -> bindParam(':2',$password);
$IniciarSesion -> execute();

if($IniciarSesion->RowCount()>0){
    foreach ($IniciarSesion as $Account){
        $_SESSION['nombreUsuario']=$Account['name_user'];
        $_SESSION['idUser']=$Account['id_user'];
        $_SESSION['idRol']=$Account['idRole_user'];
        $_SESSION['nombreRol']=$Account['name_role'];
        $_SESSION['nombreSucursal']=$Account['nombre_sucursal'];
        $_SESSION['idSucursal'] = $Account['id_sucursal'];
    }
    echo "OK";
}else{
    echo "NO";
}

?>
