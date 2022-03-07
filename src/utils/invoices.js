const fs = require('fs');

function loadInvoices() {
    const fileBuffer = fs.readFileSync('data/invoices.json', 'utf-8');
    const invoices = JSON.parse(fileBuffer);

    return invoices;
}

function saveInvoices(invoices) {
    fs.writeFileSync('data/invoices.json', JSON.stringify(invoices, null, 4));
}

function addInvoice() {
    const invoices = loadInvoices();
}