document.addEventListener('DOMContentLoaded', function () {
    const sheetId = '1hlBL-lgwdM07aTls8tUyaIMw2eQRFGqayEe1ir5ZQxQ';
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

            // Asegurar que el primer elemento de 'rows' es el encabezado
            const headersRow = rows.shift(); // Remover la primera fila y almacenarla como encabezados

            // Agregar encabezados de columna fijos
            headersRow.forEach((header) => {
                const th = document.createElement('th');
                th.innerText = header;
                tableHeaders.appendChild(th);
            });

            // Agregar filas a la tabla
            rows.forEach(row => {
                const tr = document.createElement('tr');
                row.forEach((cell, index) => {
                    const td = document.createElement('td');
                    td.innerText = cell;
                    tr.appendChild(td);
                });
                tableBody.appendChild(tr);
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

            // Funcionalidad de descarga en PDF
            downloadPdf.addEventListener('click', function () {
                const printWindow = window.open('', '', 'height=600,width=800');
                printWindow.document.write('<html><head><title>Gestion de datos zona D</title>');
                printWindow.document.write('<link rel="stylesheet" href="styles.css">');
                printWindow.document.write('</head><body>');
                printWindow.document.write('<h1>Tools zonaD</h1>');
                printWindow.document.write(dataTable.outerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });
        })
        .catch(err => console.error('Error fetching data from Google Sheets:', err));
});
