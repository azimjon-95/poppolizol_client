import * as XLSX from 'xlsx';
import { PhoneNumberFormat } from '../../../hook/NumberFormat';
import { capitalizeFirstLetter } from '../../../hook/CapitalizeFirstLitter';

// Export to Excel function
const exportToExcel = (filteredAndSortedData, startDate, endDate) => {
    if (!filteredAndSortedData.length) return;

    const excelData = filteredAndSortedData.map(item => ({
        'Navbati': item.order_number,
        'Bemor ismi': `${item.patientId.firstname} ${item.patientId.lastname}`,
        'Telefon': PhoneNumberFormat(item.patientId.phone),
        "To'lov turi": capitalizeFirstLetter(item.paymentType),
        "To'lov summasi": `${item.payment_amount.toLocaleString()} so'm`,
        'Sana': (() => {
            const d = new Date(item.createdAt);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${day}.${month}.${year} ${hours}:${minutes}`;
        })(),
        'Shifokor ismi': `${item.doctorId.firstName} ${item.doctorId.lastName}`,
        'Mutaxassislik': capitalizeFirstLetter(item.doctorId.specialization),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws['!cols'] = [
        { wch: 10 }, // Navbati
        { wch: 25 }, // Bemor ismi
        { wch: 15 }, // Telefon
        { wch: 15 }, // To'lov turi
        { wch: 18 }, // To'lov summasi
        { wch: 20 }, // Sana
        { wch: 25 }, // Shifokor ismi
        { wch: 15 }, // Mutaxassislik
    ];

    const headerStyle = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4472C4' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } },
        },
    };

    const headers = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1'];
    headers.forEach(cell => {
        if (ws[cell]) ws[cell].s = headerStyle;
    });

    const dataStyle = {
        alignment: { horizontal: 'left', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: 'CCCCCC' } },
            bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
            left: { style: 'thin', color: { rgb: 'CCCCCC' } },
            right: { style: 'thin', color: { rgb: 'CCCCCC' } },
        },
    };

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (ws[cellAddress]) ws[cellAddress].s = dataStyle;
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Bemorlar ro'yxati");
    const startDateFormatted = startDate.replace(/\./g, '');
    const endDateFormatted = endDate.replace(/\./g, '');
    const fileName = `Bemorlar_royxati_${startDateFormatted}_${endDateFormatted}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

export default exportToExcel;