$(function() {
	"use strict";

    $('.datepicker').pickadate({
			monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
			monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
			weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'],
			weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
			showMonthsShort: false,
			showWeekdaysFull: undefined,
			yearRange: "-100:-18",
			// Buttons
			today: 'Hoy',
			clear: 'Limpiar',
			close: 'Cerrar',

			// Accessibility labels
			labelMonthNext: 'Siguiente Mes',
			labelMonthPrev: 'Mes Anterior',
			labelMonthSelect: 'Seleccione un mes',
			labelYearSelect: 'Seleccione un año',
      selectMonths: true,
      selectYears: true
    });

});
