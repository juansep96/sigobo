let urlBase="./api/login/";

$(document).ready(function() {
    $("#password").keypress(function(e) {
       if(e.which == 13) {
         login();
       }
     });
});

function login(){
	let user = $("#username").val();
	let pass = $("#password").val();
	$.post(urlBase+"login",{user,pass})
	.then((data)=>{
		if(data=="OK"){
			Lobibox.notify('success', {
				pauseDelayOnHover: true,
				continueDelayOnInactiveTab: false,
				position: 'top right',
				icon: 'bx bx-check-circle',
				msg: 'Inicio de sesión correcto',
			});
			setInterval(function(){window.location.href = "./inicio.html";},1500);
		}else{
			Lobibox.notify('error', {
				pauseDelayOnHover: true,
				continueDelayOnInactiveTab: false,
				position: 'top right',
				icon: 'bx bx-message-error',
				msg: 'Credenciales inválidas.',
			});
		}
	});
}
