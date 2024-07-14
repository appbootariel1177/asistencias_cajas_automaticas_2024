const sheetId = '1QYYRt7uN6RJbAuyp7ZFAuOKg1ANG5QqVJdpDk0AFKdw';
const base = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?`;
const sheetName = 'Evaluaciones  Cajas automaticas m-II 2024';
const query = encodeURIComponent('Select *');
const url = `${base}&sheet=${sheetName}&tq=${query}`;

fetch(url)
    .then(res => res.text())
    .then(rep => {
        const data = JSON.parse(rep.substr(47).slice(0, -2));
        const table = document.getElementById('data-table');
        const thead = table.querySelector('thead tr');
        const tbody = table.querySelector('tbody');

        // Añadir encabezados
        data.table.cols.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col.label;
            thead.appendChild(th);
        });

        // Añadir datos
        data.table.rows.forEach(row => {
            const tr = document.createElement('tr');
            row.c.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell ? cell.v : '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // Añadir funcionalidad de filtros
        document.getElementById('nameFilter').addEventListener('input', filterTable);
        document.getElementById('companyFilter').addEventListener('input', filterTable);
    })
    .catch(err => console.error('Error al obtener los datos:', err));

function filterTable() {
    const nameFilter = document.getElementById('nameFilter').value.trim().toLowerCase();
    const companyFilter = document.getElementById('companyFilter').value.trim().toLowerCase();
    const rows = document.querySelectorAll('#data-table tbody tr');

    rows.forEach(row => {
        const nameCell = row.cells[0].textContent.trim().toLowerCase(); // Ajusta el índice según tu hoja
        const companyCell = row.cells[1].textContent.trim().toLowerCase(); // Ajusta el índice según tu hoja

        if (nameCell.includes(nameFilter) && companyCell.includes(companyFilter)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

document.getElementById('share-btn').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const table = document.getElementById('data-table');
    const rows = document.querySelectorAll('#data-table tbody tr');
    const filteredRows = Array.from(rows).filter(row => row.style.display !== 'none');

    const body = filteredRows.map(row => {
        return Array.from(row.cells).map(cell => cell.textContent);
    });

    doc.autoTable({
        head: [Array.from(table.querySelector('thead tr').cells).map(cell => cell.textContent)],
        body: body,
        styles: {
            cellPadding: 3,
            fontSize: 10,
            halign: 'left',
            valign: 'middle',
            overflow: 'linebreak',
            tableWidth: 'wrap'
        }
    });

    doc.save('datos_filtrados.pdf');
});