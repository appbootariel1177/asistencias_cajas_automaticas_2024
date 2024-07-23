document.addEventListener('DOMContentLoaded', function () {
    const sheetId = '1hlBL-lgwdM07aTls8tUyaIMw2eQRFGqayEe1ir5ZQxQ'; // ID de la hoja de cálculo de Google
    const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`; // URL base para la API de visualización de Google Sheets
    const sheetName = 'Hoja 1'; // Nombre de la hoja dentro del archivo de Google Sheets
    const query = encodeURIComponent('Select *'); // Consulta para seleccionar todos los datos
    const url = `${base}&sheet=${sheetName}&tq=${query}`; // URL completa para obtener los datos de la hoja de cálculo

    // Obtiene referencias a los elementos del DOM que se manipularán
    const dataTable = document.getElementById('dataTable'); // Tabla en el DOM donde se mostrarán los datos
    const tableHeaders = document.getElementById('tableHeaders'); // Encabezados de la tabla en el DOM
    const tableBody = document.getElementById('tableBody'); // Cuerpo de la tabla en el DOM
    const searchInput = document.getElementById('searchInput'); // Campo de entrada para búsqueda en el DOM
    const downloadPdf = document.getElementById('downloadPdf'); // Botón para descargar en PDF en el DOM

    // Fetch de datos de Google Sheets
    fetch(url)
        .then(res => res.text())
        .then(rep => {
            // Convierte la respuesta de texto a JSON y extrae los datos relevantes
            const data = JSON.parse(rep.substring(47).slice(0, -2)); // Elimina partes innecesarias de la respuesta y la convierte en objeto JSON
            const rows = data.table.rows.map(row => row.c.map(cell => (cell ? cell.v : ''))); // Obtiene las filas de datos

            // Usa la primera fila como encabezados de la tabla
            const headers = rows.shift(); // Extrae y remueve la primera fila para usarla como encabezados

            // Determina qué columnas tienen datos
            const columnsWithData = headers.map((header, index) => rows.some(row => row[index] !== ''));

            // Crea los encabezados de la tabla solo para las columnas con datos
            headers.forEach((header, index) => {
                if (columnsWithData[index]) {
                    const th = document.createElement('th'); // Crea un elemento <th> para el encabezado
                    th.innerText = header; // Establece el texto del encabezado
                    tableHeaders.appendChild(th); // Añade el encabezado a la tabla
                }
            });

            // Crea las filas de la tabla y agrega las celdas correspondientes
            rows.forEach(row => {
                const tr = document.createElement('tr'); // Crea un elemento <tr> para la fila
                row.forEach((cell, index) => {
                    if (columnsWithData[index] && cell !== '') { // Solo agrega celdas que pertenecen a columnas con datos
                        const td = document.createElement('td'); // Crea un elemento <td> para la celda
                        td.innerText = cell; // Establece el texto de la celda
                        tr.appendChild(td); // Añade la celda a la fila
                    }
                });
                if (tr.childElementCount > 0) {
                    tableBody.appendChild(tr); // Añade la fila al cuerpo de la tabla
                }
            });

            // Funcionalidad de filtrado de filas de la tabla según el texto ingresado en el campo de búsqueda
            searchInput.addEventListener('keyup', function () {
                const filter = searchInput.value.toLowerCase(); // Convierte el texto de búsqueda a minúsculas
                const trs = tableBody.getElementsByTagName('tr'); // Obtiene todas las filas del cuerpo de la tabla
                for (let i = 0; i < trs.length; i++) {
                    const tds = trs[i].getElementsByTagName('td'); // Obtiene todas las celdas de la fila
                    let showRow = false; // Inicializa la variable para determinar si mostrar la fila
                    for (let j = 0; j < tds.length; j++) {
                        if (tds[j].innerText.toLowerCase().indexOf(filter) > -1) {
                            showRow = true; // Si alguna celda contiene el texto de búsqueda, mostrar la fila
                            break;
                        }
                    }
                    // Muestra u oculta la fila según el filtro
                    trs[i].style.display = showRow ? '' : 'none'; // Si showRow es true, muestra la fila; si es false, ocúltala
                }
            });

            // Funcionalidad de descarga en PDF
            downloadPdf.addEventListener('click', function () {
                const printWindow = window.open('', '', 'height=500, width=800'); // Abre una nueva ventana para la impresión
                printWindow.document.write('<html><head><title>Zona D tools - Asistencias Cajas automáticas m-II 2024</title>'); // Añade el título al documento
                printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }</style>'); // Añade estilos CSS al documento
                printWindow.document.write('</head><body>'); // Inicia el cuerpo del documento
                printWindow.document.write('<h3>Asistencias Cajas automáticas m-II 2024</h3>'); // Añade el encabezado al documento
                printWindow.document.write(dataTable.outerHTML); // Añade la tabla completa al documento
                printWindow.document.write('</body></html>'); // Cierra el cuerpo del documento
                printWindow.document.close(); // Cierra el documento
                printWindow.print(); // Abre el diálogo de impresión
            });
        })
        .catch(err => console.error('Error fetching data:', err)); // Muestra cualquier error que ocurra durante la obtención de datos
});
