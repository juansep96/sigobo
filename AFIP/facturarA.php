<?php



include './Afip.php';

require_once './../api/PDO.php';

$afip = new Afip(array('CUIT' => XXXXXXXXX ,
'production' => TRUE));


$facturacion = json_decode($_POST['arrayFacturacion'],true);
$idCliente = $_POST['idCliente'];
$tipo_de_comprobante = $facturacion['codigoComprobante'];
$ObtenerDatosCliente = $conexion -> prepare ("SELECT * FROM clientes WHERE id_cliente=:1");
$ObtenerDatosCliente -> bindParam(':1',$idCliente);
$ObtenerDatosCliente -> execute();

foreach($ObtenerDatosCliente as $DatoCliente){
	$numero_de_documento = $DatoCliente['cuit_cliente'];
}

$punto_de_venta = 3;
$last_voucher = $afip->ElectronicBilling->GetLastVoucher($punto_de_venta, $tipo_de_comprobante); //OBTENEMOS ULTIMA FACTURA
$concepto = 1; //Productos
$tipo_de_doc = 80; // Tipo 80 : CUIT
$numero_de_factura = $last_voucher+1; // NUEVA FACTURA
$fecha = date("Y-m-d");
$importe_total = $facturacion['total']; //Monto total CON IVA
$importe_neto = $facturacion['total_sin_iva']; // Monto total SIN IVA
$base_imp_10 = floatval($facturacion['base_10']);
$base_imp_21 = floatval($facturacion['base_21']);
$base_imp_27 = floatval($facturacion['base_27']);
$iva_10 = floatval($facturacion['iva_10']);
$iva_21 = floatval($facturacion['iva_21']);
$iva_27 = floatval($facturacion['iva_27']);
$importe_iva = $iva_10+$iva_21+$iva_27; //Monto del IVA
$fecha_servicio_desde = null;
$fecha_servicio_hasta = null;
$fecha_vencimiento_pago = null;
$ivas=[];
$cbtes=[];

if($tipo_de_comprobante==2 || $tipo_de_comprobante==3){
    $cbte = Array
            (
                "Tipo" => 1,
                "PtoVta" => $punto_de_venta,
                "Nro" => "1",

            );
    array_push($cbtes,$cbte);
}

if($tipo_de_comprobante==7 || $tipo_de_comprobante==8){
    $cbte = Array
            (
                "Tipo" => 6,
                "PtoVta" => $punto_de_venta,
                "Nro" => "1",

            );
    array_push($cbtes,$cbte);
}

if($iva_10!=0){
    $iva = Array
            (
                "Id" => 4,
                "Importe" => $iva_10,
                "BaseImp" => $base_imp_10,

            );
    array_push($ivas,$iva);
}

if($iva_21!=0){
    $iva = Array
            (
                "Id" => 5,
                "Importe" => $iva_21,
                "BaseImp" => $base_imp_21,

            );
    array_push($ivas,$iva);

}if($iva_27!=0){
    $iva = Array
            (
                "Id" => 6,
                "Importe" => $iva_27,
                "BaseImp" => $base_imp_27,

            );
    array_push($ivas,$iva);
}

if($tipo_de_comprobante==7 || $tipo_de_comprobante==8 || $tipo_de_comprobante==3 || $tipo_de_comprobante==2){
    $data = array(
        'CantReg' 	=> 1, // Cantidad de facturas a registrar
        'PtoVta' 	=> $punto_de_venta,
        'CbteTipo' 	=> $tipo_de_comprobante,
        'Concepto' 	=> $concepto,
        'DocTipo' 	=> $tipo_de_doc,
        'DocNro' 	=> $numero_de_documento,
        'CbteDesde' => $numero_de_factura,
        'CbteHasta' => $numero_de_factura,
        'CbteFch' 	=> intval(str_replace('-', '', $fecha)),
        'FchServDesde'  => $fecha_servicio_desde,
        'FchServHasta'  => $fecha_servicio_hasta,
        'FchVtoPago'    => $fecha_vencimiento_pago,
        'ImpTotal' 	=> $importe_total,
        'ImpTotConc'=> 0, // Importe neto no gravado
        'ImpNeto' 	=> $importe_neto, // Importe neto
        'ImpOpEx' 	=> 0, // Importe exento al IVA
        'ImpIVA' 	=> $importe_iva, // Importe de IVA
        'ImpTrib' 	=> 0, //Importe total de tributos
        'MonId' 	=> 'PES', //Tipo de moneda usada en la factura ('PES' = pesos argentinos)
        'MonCotiz' 	=> 1, // Cotización de la moneda usada (1 para pesos argentinos)
        'CbtesAsoc' => $cbtes,
        'Iva' 		=> $ivas
    );
}else{
    $data = array(
        'CantReg' 	=> 1, // Cantidad de facturas a registrar
        'PtoVta' 	=> $punto_de_venta,
        'CbteTipo' 	=> $tipo_de_comprobante,
        'Concepto' 	=> $concepto,
        'DocTipo' 	=> $tipo_de_doc,
        'DocNro' 	=> $numero_de_documento,
        'CbteDesde' => $numero_de_factura,
        'CbteHasta' => $numero_de_factura,
        'CbteFch' 	=> intval(str_replace('-', '', $fecha)),
        'FchServDesde'  => $fecha_servicio_desde,
        'FchServHasta'  => $fecha_servicio_hasta,
        'FchVtoPago'    => $fecha_vencimiento_pago,
        'ImpTotal' 	=> $importe_total,
        'ImpTotConc'=> 0, // Importe neto no gravado
        'ImpNeto' 	=> $importe_neto, // Importe neto
        'ImpOpEx' 	=> 0, // Importe exento al IVA
        'ImpIVA' 	=> $importe_iva, // Importe de IVA
        'ImpTrib' 	=> 0, //Importe total de tributos
        'MonId' 	=> 'PES', //Tipo de moneda usada en la factura ('PES' = pesos argentinos)
        'MonCotiz' 	=> 1, // Cotización de la moneda usada (1 para pesos argentinos)
        'Iva' 		=> $ivas
    );
}

$res = $afip->ElectronicBilling->CreateVoucher($data); // Creamos factura

$cae=$res['CAE'];
$vencimiento=$res['CAEFchVto'];

if(isset($cae) && $cae!=''){ //Se facturó
	$InsertarComprobante = $conexion ->prepare ("INSERT INTO facturas (importe_factura,fecha_factura,CAE_factura,fechaVencimiento_factura,PDV_factura,numero_factura,tipo_factura) VALUES (:1,:2,:3,:4,:5,:6,:7)");
	$InsertarComprobante -> bindParam(':1',$importe_total);
	$InsertarComprobante -> bindParam(':2',$fecha);
	$InsertarComprobante -> bindParam(':3',$cae);
	$InsertarComprobante -> bindParam(':4',$vencimiento);
	$InsertarComprobante -> bindParam(':5',$punto_de_venta);
	$InsertarComprobante -> bindParam(':6',$numero_de_factura);
	$InsertarComprobante -> bindParam(':7',$tipo_de_comprobante);
	$InsertarComprobante -> execute();
	$idFactura = $conexion->lastInsertId();
	$res = [
		'success' => true,
		'idFactura'=> $idFactura
	];
}else{ //Error al facturar
	$res = [
		'success' => false,
	];
}

echo json_encode($res);


?>
