<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


ob_start();        

require __DIR__.'/vendor/autoload.php';

use Spipu\Html2Pdf\Html2Pdf;

class PDFVoucher extends HTML2PDF {


    private $config = array();

    private $voucher = null;

    private $finished = false; //Determina si es la ultima pagina

    private $html = "";

    private $lang = array();

    const LANG_EN = 2;

    function __construct($voucher, $config) {

        parent::__construct('P', 'A4', 'es');

        $this->config = $config;

        $vconfig = array();

        //$vconfig["footer"] = false;

        //$vconfig["total_line"] = false;

        //$vconfig["header"] = false;

        //$vconfig["receiver"] = false;

        //$vconfig["footer"] = false;

        $this->config["VOUCHER_CONFIG"] = $vconfig;

        $this->voucher = $voucher;

        $this->finished = false;

        $cssfile = fopen(dirname(__FILE__) . "/remito.css", "r");

        $css = fread($cssfile, filesize(dirname(__FILE__) . "/voucher.css"));

        fclose($cssfile);

        $this->html = "<style>" . $css . "</style>";

         if (array_key_exists("idiomaComprobante",$voucher) && $voucher["idiomaComprobante"] == $this::LANG_EN) {
            include(__DIR__.'/language/en.php');
        } else {
            include(__DIR__.'/language/es.php');
        }
        $this->lang = array_merge($this->lang, $lang);

    }



    private function lang($key) {

        if (array_key_exists($key,$this->lang)) {

            return $this->lang[$key];

        } else {

            return $key;

        }

    }


     function addVoucherInformation($logo_path, $title) {

         if ($this->show_element("header")) {

             if ($title != "") {

                 $this->html .= "<div class='border-div '>";

                 $this->html .= "    <h3 class='center-text'>" . $title . "</h3>";

                 $this->html .= "</div>";

                 $this->html .= "<div class='border-div'>";

             }



             $type = $this->lang($this->voucher["TipoComprobante"]);

             $letter = $this->voucher["letra"];

             $number = $this->lang("Punto de Venta") . ": " . str_pad($this->voucher["numeroPuntoVenta"], 4, "0", STR_PAD_LEFT) . " &nbsp;&nbsp;  " . $this->lang("Comp. Nro") . ": " . str_pad($this->voucher["numeroComprobante"], 8, "0", STR_PAD_LEFT);

             $tmp = DateTime::createFromFormat('Ymd',$this->voucher["fechaComprobante"]);

             $date = $this->lang("Fecha de Emisi&oacute;n") . ": " . date_format($tmp, $this->lang('d/m/Y'));



             $this->html .= "    <div class='letter' style='margin-top:25px;'>";

             $this->html .= "        <p class='title'>$letter</p> ";

             $id_type = $this->voucher["codigoTipoComprobante"];

             if($id_type == '999999'){ // Es un remito, le cambiamos la muestra
                $id_type = '099';
             }

             $this->html .= "        <p class='type'>Cod. $id_type</p> ";

             $this->html .= "    </div>";



             $this->html .= "<table class='responsive-table table-header'>";

             $this->html .= "<tr><td style='width: 3%;'></td>";

             $this->html .= "<td style='width: 27%;'>";
            
             $this->html .= "<img class='logo' style=width:200px;margin-right:193px;' src='https://bsglaboratorios.com.ar/assets/images/logo.jpg' alt='logo'>";

             $this->html .= "</td>";

             $this->html .= "<td style='width: 43%;border-top:25px solid transparent;!important'>";

             $this->html .= "    <span class='type_voucher header_margin'>$type</span><br>";

             $this->html .= "    <span class='header_margin'>$number</span><br>";

             $this->html .= "    <span class='header_margin'>$date</span>";

             if ($this->voucher["codigoConcepto"] == 2 || $this->voucher["codigoConcepto"] == 3) {

                 $tmp = DateTime::createFromFormat('Ymd',$this->voucher["fechaDesde"]);

                 $service_from = $this->lang("Per&iacute;odo") . ": " . date_format($tmp, $this->lang('d/m/Y'));

                 $tmp = DateTime::createFromFormat('Ymd',$this->voucher["fechaHasta"]);

                 $service_to = $this->lang("al") . " " . date_format($tmp, $this->lang('d/m/Y'));

                 $tmp = DateTime::createFromFormat('Ymd',$this->voucher["fechaVtoPago"]);

                 $expiration = "- " . $this->lang("Vencimiento") . ": " . date_format($tmp, $this->lang('d/m/Y'));

                 $this->html .= "<br>";

                 $this->html .= "    <span class='header_margin'>$service_from</span>";

                 $this->html .= "    <span class='header_margin'>$service_to</span>";

                 $this->html .= "    <span class='header_margin'>$expiration</span>";

             }



             $this->html .= "</td>";

             $this->html .= "</tr>";

             $this->html .= "</table>";



             $this->html .= "<table class='responsive-table table-header' style='border-bottom:15px solid transparent;!important'>";

             $this->html .= "<tr>";

             $this->html .= "<td style='width:56%;font-weight: bolder;'>" . $this->lang("Raz&oacute;n Social") . ": " . strtoupper($this->config["TRADE_SOCIAL_REASON"]) . "</td>";

             $this->html .= "<td class='' style='width:43%;font-weight: bolder;'>" . $this->lang("CUIT") . ": " . $this->config["TRADE_CUIT"] . "</td>";

             $this->html .= "</tr>";

             $this->html .= "<tr>";

             $this->html .= "<td style='width:56%;font-weight: bolder;' >" . $this->lang("Domicilio Comercial") . ": " . $this->config["TRADE_ADDRESS"] . "</td>";

             $this->html .= "<td class='' style='width:43%;font-weight: bolder;'>" . $this->lang("II.BB.") . ": " . $this->config["TRADE_IIBB"] . "</td>";

             $this->html .= "</tr>";

             $this->html .= "<tr>";

             $this->html .= "<td style='width:56%;'>" . $this->lang("Condici&oacute;n Frente al IVA") . ": " . $this->config["TRADE_TAX_CONDITION"] . "</td>";

             $tmp = DateTime::createFromFormat('Ymd',$this->config["TRADE_INIT_ACTIVITY"]);

             $this->html .= "<td style='width:43%;'>" . $this->lang("Fecha de Inicio de Actividades") . ": " . date_format($tmp, $this->lang('d/m/Y')) . "</td>";

             $this->html .= "</tr>";

             $this->html .= "</table>";

             $this->html .= "</div>";

         }

     }





     function addReceiverInformation() {

         if ($this->show_element("receiver")) {

             $this->html .= "<div class='border-div'>";

             $this->html .= "<table class='responsive-table table-header'>";

             $this->html .= "<tr>";

             $text = $this->lang($this->voucher["TipoDocumento"]) . ": " . $this->voucher["numeroDocumento"];

             $this->html .= "<td style='width:50%;'>" . $text . "</td>";

             $text = $this->lang("Apellido y Nombre / Raz&oacute;n Social") . ": " . strtoupper($this->voucher["nombreCliente"]);

             $this->html .= "<td class='right-text' style='width:49%;'>" . $text . "</td>";

             $this->html .= "</tr>";

             $this->html .= "<tr>";

             $text = $this->lang("Condici&oacute;n Frente al IVA") . ": " . $this->lang($this->voucher["tipoResponsable"]);

             $this->html .= "<td style='width:50%;'>" . $text . "</td>";

             $text = $this->lang("Domicilio Comercial") . ": " . $this->voucher["domicilioCliente"];

             $this->html .= "<td class='right-text' style='width:49%;'>" . $text . "</td>";

             $this->html .= "</tr>";

             $this->html .= "<tr>";

             $text = $this->lang("Condici&oacute;n de Venta") . ": " . $this->lang($this->voucher["CondicionVenta"]);

             $this->html .= "<td style='width:10%;'>" . $text . "</td>";

             $this->html .= "</tr>";

             $this->html .= "</table>";

             $this->html .= "</div>";

         }

     }





     function fill() {

         $this->html .= "<table class='responsive-table table-article'>";

         switch (strtoupper($this->voucher["letra"]) ) {
            case "A":
                $this->fill_A();
                break;
            case "B":
                $this->fill_B();
                break;
            case "P":
                $this->fill_X();
                break;
            case "X":
                $this->fill_X();
            break;
        }

         $this->html .= "</table>";

         $this->finished = true;

     }





     function fill_A() {

         $this->html .= "<tr>";

         $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("C&oacute;digo") . "</th>";

         $this->html .= "<th style='width=26%;'>" . $this->lang("Producto / Servicio") . "</th>";

         $this->html .= "<th class='right-text' style='width=10%;'>" . $this->lang("Cantidad") . "</th>";

         $this->html .= "<th style='width=10%;'>" . $this->lang("U. Medida") . "</th>";

         $this->html .= "<th class='right-text' style='width=10%;'>" . $this->lang("Precio unit.") . "</th>";

         $this->html .= "<th class='right-text' style='width=6%;'>" . $this->lang("Alic. IVA") . "</th>";

         $this->html .= "<th class='right-text' style='width=10%;'>" . $this->lang("Bonif.") . "</th>";

         $this->html .= "<th class='right-text' style='width=10%;'>" . $this->lang("Subtotal c/IVA") . "</th>";

         $this->html .= "</tr>";

         foreach ($this->voucher["items"] as $item) {

            $this->html .= "<tr>";

            $this->html .= "<td class='center-text' style='width=10%;'>" . $item["scanner"] . "</td>";

            $this->html .= "<td style='width=30%;'>" . $item["detalle"] . "</td>";

            $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["cantidad"],2,'.','') . "</td>";

            $this->html .= "<td style='width=10%;'>".strtoupper($item["UnidadMedida"])."</td>";

            $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["precio"], 2,',','.') . "</td>";

            $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["Alic"], 2,',','.') . " % </td>";

            $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["impBonif"], 2,',','.') . "</td>";

            $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["calc_total"], 2,',','.') . "</td>";

            $this->html .= "</tr>";

         }

     }

     function fill_X() {
        /*
        $saldoCC = $this->voucher['saldoCC'];
        $this->html .= "<tr>";

        $this->html .= "<th colspan='3' class='center-text'>" . "Saldo Actualizado en Cuenta Corriente:" . "</th>";

        $this->html .= "<th colspan='3' class='center-text'> $ " . number_format($saldoCC, 2,',','.') . "</th>";

        $this->html .= "</tr><br>";
        */

        $this->html .= "<tr>";

        $this->html .= "<th class='center-text' style='width=15%;'>" . $this->lang("C&oacute;digo") . "</th>";

        $this->html .= "<th class='center-text' style='width=23%;'>" . $this->lang("Producto / Servicio") . "</th>";

        $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("Cantidad") . "</th>";

        $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("Lote") . "</th>";

        $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("Vto.") . "</th>";

        $this->html .= "<th class='center-text' style='width=15%;'>" . $this->lang("Precio unit.") . "</th>";

        $this->html .= "<th class='center-text' style='width=15%;'>" . $this->lang("Subtotal") . "</th>";


        $this->html .= "</tr>";

        foreach ($this->voucher["items"] as $item) {

           $this->html .= "<tr>";

           $this->html .= "<td class='center-text' style='width=15%;'>" . $item["scanner"] . "</td>";

           $this->html .= "<td class='center-text' style='width=23%;'>" . $item["detalle"] . "</td>";

           $this->html .= "<td class='center-text' style='width=10%;'>" . number_format($item["cantidad"],2,'.','') . "</td>";

           $this->html .= "<td class='center-text' style='width=10%;'>".strtoupper($item["lote"])."</td>";

           $this->html .= "<td class='center-text' style='width=10%;'>".strtoupper($item["vencimiento"])."</td>";

           $this->html .= "<td class='center-text' style='width=15%;'>" . number_format($item["precio"], 2,',','.') . "</td>";

           $this->html .= "<td class='center-text' style='width=15%;'>" . number_format($item["calc_total"], 2,',','.') . "</td>";

           $this->html .= "</tr>";

        }

    }





     function fill_B() {

         $this->html .= "<tr>";

         $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("C&oacute;digo") . "</th>";

         $this->html .= "<th style='width=30%;'>" . $this->lang("Producto / Servicio") . "</th>";

         $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("Cantidad") . "</th>";

         $this->html .= "<th style='width=10%;'>" . $this->lang("U. Medida") . "</th>";

         $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("Precio unit.") . "</th>";

         $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("IVA") . "</th>";

         $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("Imp. Bonif.") . "</th>";

         $this->html .= "<th class='center-text' style='width=10%;'>" . $this->lang("Subtotal") . "</th>";

         $this->html .= "</tr>";

         foreach ($this->voucher["items"] as $item) {

             $this->html .= "<tr>";

             $this->html .= "<td class='center-text' style='width=10%;'>" . $item["scanner"] . "</td>";

             $this->html .= "<td style='width=30%;'>" . $item["detalle"] . "</td>";

             $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["cantidad"],2,'.','') . "</td>";

             $this->html .= "<td style='width=10%;'>".strtoupper($item["UnidadMedida"])."</td>";

             $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["precio"], 2,',','.') . "</td>";

             $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["Alic"], 2,',','.') . " % </td>";

             $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["impBonif"], 2,',','.') . "</td>";

             $this->html .= "<td class='right-text' style='width=10%;'>" . number_format($item["calc_total"], 2,',','.') . "</td>";

             $this->html .= "</tr>";

         }

     }


     function total_line() {

         if ($this->show_element("total_line")) {

             $this->html .= "<div class='border-div'>";

             if (strtoupper($this->voucher["letra"]) === 'A') {

                 $this->total_line_A();

             } else {

                 $this->total_line_B();

             }

             $this->html .= "</div>";

         }

     }





     private function total_line_A() {

         $this->html .= '    <table class="responsive-table">';

         $this->html .= '        <tr>';

         $this->html .= '            <td style="width: 60%;">';

         $this->html .= $this->othertaxes();

         $this->html .= '            </td>';

         $this->html .= '            <td style="width: 40%;">';

         $this->html .= $this->ivas();

         $this->html .= '            </td>';

         $this->html .= '        </tr>';

         $this->html .= '    </table>';

     }





     private function othertaxes() {

         $str = "";

         if (count($this->voucher['Tributos']) > 0) {

             $str .= '    <table class="responsive-table table-article">';



             //Title

             $str .= '        <tr>';

             $str .= '            <th class="center-text" colspan=2 style="width=240px;">Otros Tributos</th>';

             $str .= '        </tr>';

             $str .= '        <tr>';

             $str .= '            <th class="center-text" style="width=200px;">' . $this->lang("Descripci&oacute;n") . '</th>';

             $str .= '            <th class="center-text" style="width=40px;">' . $this->lang("Importe") . '</th>';

             $str .= '        </tr>';



             foreach ($this->voucher['Tributos'] as $tax) {



                 $str .= '        <tr>';

                 $str .= '            <td class="left-text" style="width=200px;">' . $tax["Desc"] .' '. $tax["Alic"].' %</td>';

                 $str .= '            <td class="right-text" style="width=40px;">' . number_format($tax["Importe"],2,',','.') . '</td>';

                 $str .= '        </tr>';

             }



             //Footer

             $str .= '        <tr>';

             $str .= '            <td class="right-text" style="width=200px;">' . $this->lang("Importe Otros Tributos") . ': '. $this->lang($this->voucher["codigoMoneda"]) .'</td>';

             $total = number_format($this->voucher["importeOtrosTributos"], 2, ',', '.');

             $str .= '            <td class="right-text" style="width=40px;">' . $total . '</td>';

             $str .= '        </tr>';

             $str .= '    </table>';

         }

         return $str;

     }





     private function ivas() {

         $str = '    <table class="responsive-table">';



         //Detail

         $str .= '        <tr>';

         $str .= '            <td class="right-text" style="width=200px;">' . $this->lang("Importe Neto Gravado") . ': '. $this->lang($this->voucher["codigoMoneda"]) .'</td>';

         $importeGravado = number_format($this->voucher["importeGravado"], 2, ',', '.');

         $str .= '            <td class="right-text" style="width=70px;">' . $importeGravado . '</td>';

         $str .= '        </tr>';

         foreach ($this->voucher["subtotivas"] as $iva) {

           if($iva["Importe"]!='0'){



             $value = $iva["Alic"];

             $descripcion = "IVA $value%: " . $this->lang($this->voucher["codigoMoneda"]);

             $importe = number_format($iva["Importe"], 2, ',', '.');

             $str .= '        <tr>';

             $str .= '            <td class="right-text" style="width=200px;">' . $descripcion . '</td>';

             $str .= '            <td class="right-text" style="width=70px;">' . $importe . '</td>';

             $str .= '        </tr>';

             }

         }

         //Footer

         $str .= '        <tr>';

         $str .= '            <td class="right-text" style="width=200px;">' . $this->lang("Importe Otros Tributos") . ': '. $this->lang($this->voucher["codigoMoneda"]) .'</td>';

         $importeOtrosTributos = number_format($this->voucher["importeOtrosTributos"], 2, ',', '.');

         $str .= '            <td class="right-text" style="width=70px;">' . $importeOtrosTributos . '</td>';

         $str .= '        </tr>';

         $str .= '        <tr>';

         $str .= '            <td class="right-text" style="width=200px;">' . $this->lang("Importe Total") . ': '. $this->lang($this->voucher["codigoMoneda"]) .'</td>';

         $importeTotal = number_format($this->voucher["importeTotal"], 2, ',', '.');

         $str .= '            <td class="right-text" style="width=70px;">' . $importeTotal . '</td>';

         $str .= '        </tr>';

         $str .= '    </table>';



         return $str;

     }



     private function total_line_B() {

         $this->html .= '    <table class="responsive-table">';

         $this->html .= '        <tr>';

         $this->html .= '		<td class="right-text" style="width: 75%;">' . $this->lang("Subtotal") . ': '. $this->lang($this->voucher["codigoMoneda"]) .'</td>';

         $text = number_format((float) round($this->voucher["importeTotal"], 2), 2, '.', '');

         $this->html .= '		<td class="right-text" style="width: 25%;">' . $text . '</td>';

         $this->html .= '        </tr>';

         $this->html .= '        <tr>';

         $this->html .= '		<td class="right-text" style="width: 75%;">' . $this->lang("Importe Otros Tributos") . ': '. $this->lang($this->voucher["codigoMoneda"]) .'</td>';

         $text = number_format((float) round($this->voucher["importeOtrosTributos"], 2), 2, '.', '');

         $this->html .= '		<td class="right-text" style="width: 25%;">' . $text . '</td>';

         $this->html .= '        </tr>';

         $this->html .= '        <tr>';

         $this->html .= '		<td class="right-text" style="width: 75%;">' . $this->lang("Importe Total") . ': '. $this->lang($this->voucher["codigoMoneda"]) .'</td>';

         $text = number_format((float) round($this->voucher["importeTotal"], 2), 2, '.', '');

         $this->html .= '		<td class="right-text" style="width: 25%;">' . $text . '</td>';

         $this->html .= '        </tr>';

         $this->html .= '    </table>';

     }



     function extra_line() {

         $extra = $this->config["VOUCHER_OBSERVATION"];

         if ($extra != "") {

             $this->html .= "<div class='border-div'>";

             $this->html .= '    <table class="responsive-table">';

             $this->html .= "        <tr><td class='center-text'style='width: 100%;'>$extra</td></tr>";

             $this->html .= '    </table>';

             $this->html .= "</div>";

         }

     }





      function footer() {





          if ($this->show_element("footer")) {

            if($this->voucher["qr"]=='si'){

              $this->html .= '<page_footer>';

              $this->total_line();

              $this->extra_line();

              $this->html .= '    <table class="responsive-table page_footer">';

              if ($this->voucher["cae"] != 0) {

                  $text_left = "<img src='".dirname(__FILE__) . "/logoafip.png' style='width:85px' alt='logo'> ".$this->lang("Comprobante Autorizado");

                  $text_1 = $this->lang("CAE") .": ";

                  $text_2 = $this->voucher["cae"];

                  $text_3 = $this->lang("Fecha Vto. CAE") .": ";



                  $tmp = DateTime::createFromFormat('Y-m-d',$this->voucher["fechaVencimientoCAE"]);

                  $text_4 = date_format($tmp, $this->lang('d/m/Y'));



                  $quotation = number_format((float) round($this->voucher["cotizacionMoneda"], 2), 2, '.', '');

                  //$text_5 = $this->lang("Moneda") . ": " . $this->lang($this->voucher["codigoMoneda"]) . " | " . $this->lang("Cotizaci&oacute;n") . ": " . $quotation;

                  $text_5 = "Esta Administraci&oacute;n Federal no se responsabiliza por los datos ingresados en el detalle de la operaci&oacute;n";

              } else {

                  $text_left = $this->lang("Documento no v&aacute;lido como factura");

                  $text_1 = "&nbsp;";

                  $text_2 = "&nbsp;";

                  $text_3 = "&nbsp;";

                  $text_4 = "&nbsp;";

                  $text_5 = "&nbsp;";

              }

              $this->html .= '        <tr>';

              $this->html .= '		<td class="" style="width: 35%;">' . $text_left . "</td>";

              $this->html .= '		<td class="center-text" style="width: 35%;">';

              $this->html .= '                ' . $this->lang("Pag.") . ' [[page_cu]]/[[page_nb]]';

              $this->html .= '		</td>';

              $this->html .= '		<td class="right-text" style="width: 15%;">' . $text_1 . "</td>";

              $this->html .= '		<td class="left-text" style="width: 15%;">' . $text_2 . "</td>";

              $this->html .= '        </tr>';



              $this->html .= '        <tr>';

              $this->html .= '		<td class="letrachica" colspan="2" style="width: 50%;">' . $text_5 . "</td>";

              //$this->html .= '		<td class="center-text" style="width: 20%;">&nbsp;</td>';

              $this->html .= '		<td class="right-text" style="width: 15%;">' . $text_3 . "</td>";

              $this->html .= '		<td class="left-text" style="width: 15%;">' . $text_4 . "</td>";

              $this->html .= '        </tr>';



              $this->html .= '    </table>';



              if ($this->voucher["cae"] != 0) {

                $cuit = str_replace("-", "", $this->config["TRADE_CUIT"]);

                $link_url = "https://www.afip.gob.ar/fe/qr/?p=".base64_encode("

                {

                  'ver':1,'fecha':'".$this->voucher["fechaComprobante"]."',

                  'cuit':".$cuit.",

                  'ptoVta':".$this->voucher["numeroPuntoVenta"].",

                  'tipoCmp':".$this->voucher["TipoComprobante"].",

                  'nroCmp':".$this->voucher["numeroComprobante"].",

                  'importe':".$this->voucher["importeTotal"].",

                  'moneda':'PES','ctz':1,

                  'tipoDocRec':".$this->voucher["codigoTipoDocumento"].",

                  'nroDocRec':".$this->voucher["numeroDocumento"].",

                  'tipoCodAut':'E',

                  'codAut':".$this->voucher["cae"]."

                }

                ");



                $this->html .= "<img src='https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=".$link_url."&choe=UTF-8' style='width:85px' alt='QR'>";

              }

              $this->html .= '</page_footer>';

              //fin QR

            }else{



              $this->html .= '<page_footer>';

              $this->total_line();

              $this->extra_line();

              $this->html .= '    <table class="responsive-table page_footer">';

              if ($this->voucher["cae"] != 0) {

                  $text_left = "<img src='".__DIR__."/logoafip.png' style='width:85px' alt='logo'> ".$this->lang("Comprobante Autorizado");

                  $text_1 = $this->lang("CAE") .": ";

                  $text_2 = $this->voucher["cae"];

                  $text_3 = $this->lang("Fecha Vto. CAE") .": ";



                  $tmp = DateTime::createFromFormat('Y-m-d',$this->voucher["fechaVencimientoCAE"]);

                  $text_4 = date_format($tmp, $this->lang('d/m/Y'));



                  $quotation = number_format((float) round($this->voucher["cotizacionMoneda"], 2), 2, '.', '');

                  //$text_5 = $this->lang("Moneda") . ": " . $this->lang($this->voucher["codigoMoneda"]) . " | " . $this->lang("Cotizaci&oacute;n") . ": " . $quotation;

                  $text_5 = "Esta Administraci&oacute;n Federal no se responsabiliza por los datos ingresados en el detalle de la operaci&oacute;n";

              } else {

                  $text_left = $this->lang("Documento no v&aacute;lido como factura");

                  $text_1 = "&nbsp;";

                  $text_2 = "&nbsp;";

                  $text_3 = "&nbsp;";

                  $text_4 = "&nbsp;";

                  $text_5 = "&nbsp;";

              }

              $this->html .= '        <tr>';

              $this->html .= '		<td class="" style="width: 35%;">' . $text_left . "</td>";

              $this->html .= '		<td class="center-text" style="width: 35%;">';

              $this->html .= '                ' . $this->lang("Pag.") . ' [[page_cu]]/[[page_nb]]';

              $this->html .= '		</td>';

              $this->html .= '		<td class="right-text" style="width: 15%;">' . $text_1 . "</td>";

              $this->html .= '		<td class="left-text" style="width: 15%;">' . $text_2 . "</td>";

              $this->html .= '        </tr>';



              $this->html .= '        <tr>';

              $this->html .= '		<td class="letrachica" colspan="2" style="width: 50%;">' . $text_5 . "</td>";

              //$this->html .= '		<td class="center-text" style="width: 20%;">&nbsp;</td>';

              $this->html .= '		<td class="right-text" style="width: 15%;">' . $text_3 . "</td>";

              $this->html .= '		<td class="left-text" style="width: 15%;">' . $text_4 . "</td>";

              $this->html .= '        </tr>';



              $this->html .= '    </table>';



              if ($this->voucher["cae"] != 0) {

                  //BARCODE

                  $cuit = str_replace("-", "", $this->config["TRADE_CUIT"]);

                  $pos = str_pad($this->voucher["numeroPuntoVenta"], 4, "0", STR_PAD_LEFT);

                  $type = str_pad($this->voucher["codigoTipoComprobante"], 2, "0", STR_PAD_LEFT);

                  $cae = $this->voucher["cae"];

                  $fecha = str_replace("-", "", $this->voucher["fechaVencimientoCAE"]);



                  $barcode_number = $cuit . $type . $pos . $cae . $fecha;



                  $this->html .= '<barcode type="I25+" value="' . $barcode_number . '" label="label" style="width:20cm; height:7mm; font-size: 7px"></barcode>';

              }

              $this->html .= '</page_footer>';

              }

          }

      }





     private function show_element($element) {

         if (array_key_exists("VOUCHER_CONFIG", $this->config) && array_key_exists($element, $this->config["VOUCHER_CONFIG"])) {

             return false;

         } else {

             return true;

         }

     }







    function emitirPDF($logo_path) {



        //ORIGINAL

        $this->html .= "<page>";

        $this->addVoucherInformation($logo_path, $this->lang("ORIGINAL"));

        $this->addReceiverInformation();

        $this->fill();

        $this->footer();

        $this->html .= "</page>";

        $this->html .= "<page>";

        //DUPLICADO

        $this->addVoucherInformation($logo_path, $this->lang("DUPLICADO"));

        $this->addReceiverInformation();

        $this->fill();

        $this->footer();

        $this->html .= "</page>";
        $this->html .= "<page>";

         //TRIPLICADO

         $this->addVoucherInformation($logo_path, $this->lang("TRIPLICADO"));

         $this->addReceiverInformation();
 
         $this->fill();
 
         $this->footer();
 
         $this->html .= "</page>";



      //  print_r($this->voucher);

        $this->WriteHTML($this->html);

    }



    function genera_PDF($obj,$css_obj) {



        //ORIGINAL

        $this->html .= $obj;



      //  print_r($this->voucher);

        $this->WriteHTML($this->html);

    }



}

?>

