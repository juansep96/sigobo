<?php

require_once '../PDO.php';

date_default_timezone_set('America/Argentina/Buenos_Aires');

$idVenta = $_GET['idVenta'];


$ObtenerVenta=$conexion->prepare("SELECT * from ventas LEFT JOIN facturas ON id_factura=idFactura_venta  WHERE id_venta=:1");
$ObtenerVenta->bindParam(':1',$idVenta);
$ObtenerVenta -> execute();

foreach ($ObtenerVenta as $Venta) {
  $nroVenta = $Venta['id_venta'];
  $fecha = $Venta['fechaHora_venta'];
  $efectivo = $Venta['pagoEfectivo_venta'];
  $transferencia = $Venta['pagoTransferencia_venta'];
  $posnet = $Venta['pagoPosnet_venta'];
  $mp = $Venta['pagoMP_venta'];
  $cdni = $Venta['pagoCDNI_venta'];
  $servicred = $Venta['pagoServicred_venta'];
  $total = $Venta['totalVenta_venta'];
  $idFactura=$Venta['idFactura_venta'];
  $tipo = $Venta['tipoVenta_venta'];
  $idCliente = $Venta['idCliente_venta'];
  if($idFactura!="-1"){
	$numeroFactura = str_pad($Venta['PDV_factura'],5,"0", STR_PAD_LEFT)."-".str_pad($Venta['numero_factura'],8,"0", STR_PAD_LEFT);
	$cae=$Venta['CAE_factura'];
	$vto=$Venta['fechaVencimiento_factura'];
  }
}

$ObtenerCliente = $conexion -> prepare("SELECT * from clientes WHERE id_cliente=:1");
$ObtenerCliente -> bindParam(':1',$idCliente);
$ObtenerCliente -> execute();

foreach($ObtenerCliente as $Cliente){
    $cliente = $Cliente['apellido_cliente'].' '.$Cliente['nombre_cliente'];
    if($Cliente['direccion_cliente']){
        $direccion = strtoupper($Cliente['direccion']);
    }else{
        $direccion = 'DIRECCION NO INFORMADA';
    }
    $telefono = $Cliente['telefono_cliente'];
}

$ObtenerDetalle=$conexion->prepare("SELECT * from ventaDetalle LEFT JOIN productos ON id_producto = idProducto_ventaDetalle WHERE idVenta_ventaDetalle=:1 ");
$ObtenerDetalle->bindParam(':1',$idVenta);
$ObtenerDetalle->execute();


?>

<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<title>Imprimir Venta - BSG Laboratorios</title>
	<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
	<link href='https://fonts.googleapis.com/css?family=Roboto' rel='stylesheet' type='text/css'>
	 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="class.css">
</head>
<body onload="window.print();">
	<?php if($idFactura=="-1"){ ?>
				<div class="wrap">
					<center>
							<img style="width:35%" src="../../assets/images/logo.png"></br></br>
							<p style="font-size:1.2em;">Juan Molina 599</p>
							<p style="font-size:1.2em;">www.bsglaboratorios.com.ar</p>
					</br>

					Nº Vta: <?php echo "0000".$nroVenta;?> Fecha: <?php echo date('d/m/Y',strtotime($fecha));?> Hora: <?php echo date('H:i:s',strtotime($fecha));;?></br>

					</center>


					</br>
					 DESCRIPCION   ---------     CANT      ---------   $ UNIT. ------ % DTO
					================================================
					<?php foreach ($ObtenerDetalle as $producto) { ?>
								</br><?php $nombrea=strtoupper(substr($producto['nombre_producto'],0,15));?> <?php echo $nombrea;?> ------  <?php echo "     "?> <?php echo $producto['cantidad_ventaDetalle'];?> ----- <?php echo  '$ '.number_format($producto['precioVenta_ventaDetalle'],2,',','.');?> ------ <?php echo $producto['dto_ventaDetalle']."%";?>
					<?php } ?>
				</br></br>
				<center>
                <?php if(floatval($efectivo)>0){ ?>
                        Pago en Efectivo: <?php echo ' $ '.$efectivo;?> <br>
                    <?php } ?> 
                    <?php if(floatval($transferencia)>0){ ?>
                        Pago con Transferencia: <?php echo ' $ '.$transferencia;?><br>
                    <?php } ?>
                    <?php if(floatval($mp)>0){ ?>
                        Pago con MercadoPago: <?php echo ' $ '.$mp;?><br>
                    <?php } ?> 
                    <?php if(floatval($posnet)>0){ ?>
                        Pago con Posnet: <?php echo ' $ '.$posnet;?><br>
                    <?php } ?> 
                    <?php if(floatval($cdni)>0){ ?>
                        Pago con Cuenta DNI: <?php echo ' $ '.$cdni;?><br>
                    <?php } ?> 
                    <?php if(floatval($servicred)>0){ ?>
                        Pago con Servicred: <?php echo ' $ '.$servicred;?><br>
                    <?php } ?> 

					</br>
					<strong style="font-size:1.8em;">--- TOTAL: --- <?php echo ' $ '.$total;?> </strong></br>
                    </br>
					MUCHAS GRACIAS POR ELEGIR BSG LABORATORIOS. CONSERVE EL TICKET.
					</br>
                    TENES 10 DIAS PARA CAMBIOS. RECORDÁ QUE LAS PRENDAS TIENEN QUE TENER LAS ETIQUETAS.
                    </br></br></br>
                    <?php if($tipo == 'ENVIOS'){ ?>
                        <strong>------------ DATOS DE ENVIO --------</strong><br>
                        CLIENTE : <?php echo strtoupper($cliente);?> <br>
                        DIRECCION : <?php echo strtoupper($direccion);?><br>
                        TELEFONO : <?php echo strtoupper($telefono);?><br>
                    <?php } ?>

                    <?php if(floatval($efectivo) > 1){ ?>
                        <h3>A COBRAR EN DESTINO</h3>
                    <?php }else{ ?>
                        <h3>PEDIDO PAGADO</h3>
<br><br>
                    <?php } ?>
             </center>
				</div>

	<?php } else { ?>
		<div class="wrap">
					<center>
						<img style="width:35%" src="../../assets/images/logo.png"></br></br>
							<p>Dom: Juan Molina 599</p>
							<p>Bahía Blanca, Buenos Aires </p>
							<p>DUNEL FLORENCIA</p>
							<p>C.U.I.T. 23-38813131-4</p>
							<p>IVA RESPONSABLE INSCRIPTO</p>
					</br>
					------------------------------------------------</br>
					FACTURA B Cod. 006 </br>
					------------------------------------------------
					</center>
					</br></br>
					Nº FACTURA: <?php echo $numeroFactura;?> </br> FECHA: <?php echo date('d/m/Y',strtotime($fecha));?> HORA: <?php echo date('H:i:s',strtotime($fecha));;?></br>
					</br></br></br>
					RECEPTOR: CONSUMIDOR FINAL
					</br></br></br></br>
					 DESCRIPCION   ---------     CANT      ---------   $ UNIT. ------ % DTO</br></br>
					===============================================
					<?php foreach ($ObtenerDetalle as $producto) { ?>
								</br><?php $nombrea=substr($producto['nombre_producto'],0,15);?> <?php echo $nombrea;?> ------  <?php echo "     "?> <?php echo $producto['cantidad_ventaDetalle'];?> ----- <?php echo  '$ '.number_format($producto['precioVenta_ventaDetalle'],2,',','.');?> ------ <?php echo $producto['dto_ventaDetalle']."%";?>
					<?php } ?>
				</br></br>
				<center>
                    <?php if(floatval($efectivo)>0){ ?>
                        Pago en Efectivo: <?php echo ' $ '.$efectivo;?> <br>
                    <?php } ?> 
                    <?php if(floatval($transferencia)>0){ ?>
                        Pago con Transferencia: <?php echo ' $ '.$transferencia;?><br>
                    <?php } ?>
                    <?php if(floatval($mp)>0){ ?>
                        Pago con MercadoPago: <?php echo ' $ '.$mp;?><br>
                    <?php } ?> 
                    <?php if(floatval($posnet)>0){ ?>
                        Pago con Posnet: <?php echo ' $ '.$posnet;?><br>
                    <?php } ?> 
                    <?php if(floatval($cdni)>0){ ?>
                        Pago con Cuenta DNI: <?php echo ' $ '.$cdni;?><br>
                    <?php } ?> 
                    <?php if(floatval($servicred)>0){ ?>
                        Pago con Servicred: <?php echo ' $ '.$servicred;?><br>
                    <?php } ?> 
					</br>
					<strong style="font-size:1.8em;">--- TOTAL: --- <?php echo ' $ '.$total;?> </strong></br>
					</br>
					MUCHAS GRACIAS POR ELEGIR BSG LABORATORIOS. CONSERVE EL TICKET.
					</br>
                    TENES 10 DIAS PARA CAMBIOS. RECORDÁ QUE LAS PRENDAS TIENEN QUE TENER LAS ETIQUETAS.
                    </br></br></br>
					<img style="width:50%" src="../../assets/images/afip.png"></br></br></br>
					CAE: <?php echo $cae;?> --- Vto. <?php echo $vto;?>
                    </br></br></br>

                    <?php if($tipo == 'ENVIOS'){ ?>
                        <strong>------------ DATOS DE ENVIO --------</strong><br>
                        CLIENTE : <?php echo strtoupper($cliente);?> <br>
                        DIRECCION : <?php echo strtoupper($direccion);?><br>
                        TELEFONO : <?php echo strtoupper($telefono);?><br>
                    <?php } ?>

                    <?php if(floatval($efectivo) > 1){ ?>
                        <h3>A COBRAR EN DESTINO</h3>
                    <?php }else{ ?>
                        <h3>PEDIDO PAGADO</h3>
                    <?php } ?>
             </center>
				</div>
	<?php } ?>
</body>

</html>