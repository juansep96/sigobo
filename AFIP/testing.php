<?php

include "./Afip.php";

$afip = new Afip(array('CUIT' => XXXXXXXXX ,
'production' => TRUE));

/**
 * Numero del punto de venta
 **/
$punto_de_venta = 3;

/**
 * Tipo de comprobante
 **/
$tipo_de_comprobante = 6; // 6 = Factura B

/**
 * Número de la ultima Factura B
 **/

 $ultima_factura_B = $afip->ElectronicBilling->GetLastVoucher($punto_de_venta,$tipo_de_comprobante);

/**
 * Mostramos por pantalla el número de la ultima Factura B
 **/

var_dump($ultima_factura_B);
?>
