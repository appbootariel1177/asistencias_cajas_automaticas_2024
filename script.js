document.addEventListener('DOMContentLoaded', function () {
    const sheetId = '1QYYRt7uN6RJbAuyp7ZFAuOKg1ANG5QqVJdpDk0AFKdw';
    const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
    const sheetName = 'Hoja 1';
    const query = encodeURIComponent('Select *');
    const url = `${base}&sheet=${sheetName}&tq=${query}`;
    const dataTable = document.getElementById('dataTable');
    const tableHeaders = document.getElementById('tableHeaders');
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const downloadPdf = document.getElementById('downloadPdf');

    fetch(url)
        .then(res => res.text())
        .then(rep => {
            const data = JSON.parse(rep.substring(47).slice(0, -2));
            const headers = data.table.cols.map(col => col.label);
            const rows = data.table.rows.map(row => row.c.map(cell => (cell ? cell.v : '')));

            // Determinar qué columnas tienen datos
            const columnsWithData = headers.map((header, index) => rows.some(row => row[index] !== ''));

            // Agregar solo encabezados de columnas que tienen datos
            headers.forEach((header, index) => {
                if (columnsWithData[index]) {
                    const th = document.createElement('th');
                    th.innerText = header;
                    tableHeaders.appendChild(th);
                }
            });

            // Agregar filas a la tabla
            rows.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach((cell, index) => {
                    if (columnsWithData[index] && cell !== '') {
                        const td = document.createElement('td');
                        td.innerText = cell;
                        tr.appendChild(td);
                    }
                });
                if (tr.childElementCount > 0) {
                    tableBody.appendChild(tr);
                }
            });

            // Funcionalidad de filtrado
            searchInput.addEventListener('keyup', function () {
                const filter = searchInput.value.toLowerCase();
                const trs = tableBody.getElementsByTagName('tr');
                for (let i = 0; i < trs.length; i++) {
                    const tds = trs[i].getElementsByTagName('td');
                    let showRow = false;
                    for (let j = 0; j < tds.length; j++) {
                        if (tds[j].innerText.toLowerCase().indexOf(filter) > -1) {
                            showRow = true;
                            break;
                        }
                    }
                    trs[i].style.display = showRow ? '' : 'none';
                }
            });

            // Funcionalidad de descarga en PDF usando jsPDF y autoTable
            downloadPdf.addEventListener('click', function () {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                doc.text('Datos desde Google Sheets', 10, 10);

                // Cálculo del alto máximo permitido para ajustar todo en una sola página
                const pageHeight = doc.internal.pageSize.height;
                const yOffset = 20;
                const maxTableHeight = pageHeight - yOffset - 10; // Descontar márgenes

                // Configuración de autoTable para asegurar que todo el contenido se ajuste en una sola página
                doc.autoTable({
                    head: [headers.filter((header, index) => columnsWithData[index])],
                    body: rows.map(row => row.filter((cell, index) => columnsWithData[index] && cell !== '')),
                    startY: yOffset,
                    theme: 'striped',
                    styles: {
                        cellPadding: 2,
                        fontSize: 10,
                        overflow: 'linebreak' // Ajustar contenido dentro de las celdas
                    },
                    headStyles: {
                        fillColor: [255, 140, 0]
                    },
                    bodyStyles: {
                        fillColor: [51, 51, 51],
                        textColor: [255, 255, 255]
                    },
                    alternateRowStyles: {
                        fillColor: [68, 68, 68]
                    },
                    tableWidth: 'auto', // Ajustar automáticamente el ancho de la tabla
                    showHead: 'everyPage', // Mostrar encabezados en cada página
                    margin: { top: 10, bottom: 10 }, // Márgenes del contenido
                    pageBreak: 'avoid' // Evitar saltos de página
                });

                doc.save('datos_google_sheets.pdf');
            });
        })
        .catch(err => console.error('Error fetching data from Google Sheets:', err));
});