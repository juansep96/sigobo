function showCart(type){
    let document = type+'.html';
    $.get(document, function(data){
        $("#contenedor").html(data);
    });
}

function reset(){
    let html = `<h2 class="text-center m-5">ELIJA EL TIPO DE COMPROBANTE A EMITIR</h2>
    <div class="row m-5">
      <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <div class="selector" onclick="showCart('facturadorA');">
          <h1>A</h1>
          <h4>Responsable Inscipto o Monotributista</h4>
          <p>Este comprobante discrimina IVA y estará validado por AFIP de forma automática.</p>
        </div>
      </div>
      <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
        <div class="selector" onclick="showCart('facturadorB');">
          <h1>B</h1>
          <h4>Consumidor Final</h4>
          <p>Este comprobante <strong>NO</strong> discrimina IVA y será opcional la validación a través de AFIP.</p>
        </div>
      </div>
    </div>`;
    $("#contenedor").html(html);
}