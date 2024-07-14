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

            // Funcionalidad de descarga en PDF
            downloadPdf.addEventListener('click', function () {
                const printWindow = window.open('', '', 'height=600,width=800');
                printWindow.document.write('<html><head><title>Datos desde Google Sheets</title>');
                printWindow.document.write('<link rel="stylesheet" href="styles.css">');
                printWindow.document.write('</head><body>');
                printWindow.document.write('<h1 style="writing-mode: vertical-rl; transform: rotate(180deg);">ZonaD</h1>');
                printWindow.document.write(dataTable.outerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            });
        })
        .catch(err => console.error('Error fetching data from Google Sheets:', err));
});