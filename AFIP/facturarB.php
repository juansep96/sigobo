<?php


include './Afip.php';

require_once './../api/PDO.php';

$afip = new Afip(array('CUIT' => XXXXXXXXX ,
'production' => TRUE));

if(isset($_POST['idVenta'])){
	$ObtenerVenta = $conexion -> prepare("SELECT * FROM ventas where id_venta=:1");
	$ObtenerVenta -> bindParam(':1',$_POST['idVenta']);
	$ObtenerVenta -> execute();
	foreach($ObtenerVenta as $Venta){
		$_POST['total'] = $Venta['totalVenta_venta'];
	}
}

$total_con_iva = number_format(floatval($_POST['total']),2,'.','');
$total_sin_iva = number_format(($total_con_iva / 1.21),2,'.','');
$total_iva = number_format(($total_con_iva - $total_sin_iva),2,'.','');


/**
 * Numero del punto de venta
 **/
$punto_de_venta = 3;

/**
 * Tipo de factura
 **/
$tipo_de_factura = 6; // 6 = Factura B

/**
 * Número de la ultima Factura B
 **/
$last_voucher = $afip->ElectronicBilling->GetLastVoucher($punto_de_venta, $tipo_de_factura);

/**
 * Concepto de la factura
 *
 * Opciones:
 *
 * 1 = Productos 
 * 2 = Servicios 
 * 3 = Productos y Servicios
 **/
$concepto = 1;

/**
 * Tipo de documento del comprador
 *
 * Opciones:
 *
 * 80 = CUIT 
 * 86 = CUIL 
 * 96 = DNI
 * 99 = Consumidor Final 
 **/
$tipo_de_documento = 99;

/**
 * Numero de documento del comprador (0 para consumidor final)
 **/
$numero_de_documento = 0;

/**
 * Numero de factura
 **/
$numero_de_factura = $last_voucher+1;

/**
 * Fecha de la factura en formato aaaa-mm-dd (hasta 10 dias antes y 10 dias despues)
 **/
$fecha = date('Y-m-d');

/**
 * Importe sujeto al IVA (sin icluir IVA)
 **/
$importe_gravado = $total_sin_iva;

/**
 * Importe exento al IVA
 **/
$importe_exento_iva = 0;

/**
 * Importe de IVA
 **/
$importe_iva = $total_iva;

/**
 * Los siguientes campos solo son obligatorios para los conceptos 2 y 3
 **/
if ($concepto === 2 || $concepto === 3) {
	/**
	 * Fecha de inicio de servicio en formato aaaammdd
	 **/
	$fecha_servicio_desde = intval(date('Ymd'));

	/**
	 * Fecha de fin de servicio en formato aaaammdd
	 **/
	$fecha_servicio_hasta = intval(date('Ymd'));

	/**
	 * Fecha de vencimiento del pago en formato aaaammdd
	 **/
	$fecha_vencimiento_pago = intval(date('Ymd'));
}
else {
	$fecha_servicio_desde = null;
	$fecha_servicio_hasta = null;
	$fecha_vencimiento_pago = null;
}

$data = array(
	'CantReg' 	=> 1, // Cantidad de facturas a registrar
	'PtoVta' 	=> $punto_de_venta,
	'CbteTipo' 	=> $tipo_de_factura, 
	'Concepto' 	=> $concepto,
	'DocTipo' 	=> $tipo_de_documento,
	'DocNro' 	=> $numero_de_documento,
	'CbteDesde' => $numero_de_factura,
	'CbteHasta' => $numero_de_factura,
	'CbteFch' 	=> intval(str_replace('-', '', $fecha)),
	'FchServDesde'  => $fecha_servicio_desde,
	'FchServHasta'  => $fecha_servicio_hasta,
	'FchVtoPago'    => $fecha_vencimiento_pago,
	'ImpTotal' 	=> $importe_gravado + $importe_iva + $importe_exento_iva,
	'ImpTotConc'=> 0, // Importe neto no gravado
	'ImpNeto' 	=> $importe_gravado,
	'ImpOpEx' 	=> $importe_exento_iva,
	'ImpIVA' 	=> $importe_iva,
	'ImpTrib' 	=> 0, //Importe total de tributos
	'MonId' 	=> 'PES', //Tipo de moneda usada en la factura ('PES' = pesos argentinos) 
	'MonCotiz' 	=> 1, // Cotización de la moneda usada (1 para pesos argentinos)  
	'Iva' 		=> array(// Alícuotas asociadas al factura
		array(
			'Id' 		=> 5, // Id del tipo de IVA (5 = 21%)
			'BaseImp' 	=> $importe_gravado,
			'Importe' 	=> $importe_iva 
		)
	), 
);

/** 
 * Creamos la Factura 
 **/
$res = $afip->ElectronicBilling->CreateVoucher($data);
$cae=$res['CAE'];
$vencimiento=$res['CAEFchVto'];

if(isset($cae) && $cae!=''){ //Se facturó
	$InsertarComprobante = $conexion ->prepare ("INSERT INTO facturas (importe_factura,fecha_factura,CAE_factura,fechaVencimiento_factura,PDV_factura,numero_factura,tipo_factura) VALUES (:1,:2,:3,:4,:5,:6,:7)");
	$InsertarComprobante -> bindParam(':1',$total_con_iva);
	$InsertarComprobante -> bindParam(':2',$fecha);
	$InsertarComprobante -> bindParam(':3',$cae);
	$InsertarComprobante -> bindParam(':4',$vencimiento);
	$InsertarComprobante -> bindParam(':5',$punto_de_venta);
	$InsertarComprobante -> bindParam(':6',$numero_de_factura);
	$InsertarComprobante -> bindParam(':7',$tipo_de_factura);
	$InsertarComprobante -> execute();
	$idFactura = $conexion->lastInsertId();
	if(isset($_POST['idVenta'])){ //Actualizamos la venta tambien
		$ActualizarVenta = $conexion -> prepare("UPDATE ventas SET idFactura_venta=:1 WHERE id_venta=:2");
		$ActualizarVenta -> bindParam(':1',$idFactura);
		$ActualizarVenta -> bindParam(':2',$_POST['idVenta']);
		$ActualizarVenta -> execute();
		$res = [
			'success' => true,
			'idFactura'=> $idFactura,
			'idVenta' => $_POST['idVenta'],			
		];
	}else{
		$res = [
			'success' => true,
			'idFactura'=> $idFactura,
		];
	}
	
}else{ //Error al facturar
	$res = [
		'success' => false,
	];
}

echo json_encode($res);


?>
