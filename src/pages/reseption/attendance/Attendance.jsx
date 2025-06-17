
import React, { useState } from 'react';
import { Calendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import * as XLSX from 'xlsx';
import { FiDownload, FiFileText } from 'react-icons/fi'; // Import icons from react-icons
import { useGetDailyReportQuery } from '../../../context/attendanceApi';
import './AttendanceDashboard.css';
import { Spin } from 'antd';

// Uzbek locale configuration for react-calendar
const uzbekLocale = {
    months: [
        'Yanvar',
        'Fevral',
        'Mart',
        'Aprel',
        'May',
        'Iyun',
        'Iyul',
        'Avgust',
        'Sentabr',
        'Oktabr',
        'Noyabr',
        'Dekabr',
    ],
    weekdaysShort: ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'],
};


const AttendanceDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const formattedDate = selectedDate.toISOString().split('T')[0];

    const { data: attendanceData, isLoading, error } = useGetDailyReportQuery(formattedDate, {
        pollingInterval: 30000 // 30 seconds polling for real-time updates
    });

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };
    // Function to export table to Excel
    const exportToExcel = () => {
        const exportData = attendanceData?.innerData.map((record) => ({
            'Xodim': record.employee_id?.name || 'Mavjud emas',
            'Kirish vaqti': record.check_in_time
                ? new Date(record.check_in_time).toLocaleTimeString('uz-UZ')
                : '-',
            'Chiqish vaqti': record.check_out_time
                ? new Date(record.check_out_time).toLocaleTimeString('uz-UZ')
                : '-',
            'Holati': record.status === 'present' ? 'Mavjud' : record.status === 'absent' ? "Yo'q" : record.status,
            'Kechikish (daqiqa)': record.late_minutes,
            "Qo'shimcha ish (daqiqa)": record.overtime_minutes,
            'Jami ish vaqti (soat)': (record.total_work_minutes / 60).toFixed(1),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const colWidths = [
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
        ];
        ws['!cols'] = colWidths;
        ws['!autofilter'] = { ref: 'A1:G1' };

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `Davomat_${formattedDate}`);
        XLSX.writeFile(wb, `Davomat_${formattedDate}.xlsx`);
    };

    return (
        <div className="attendance-container">
            <div className="table-section">
                <div className="table-sectionnav">
                    <h2 className="section-title">Kunlik davomat - {formattedDate}</h2>
                    <button onClick={exportToExcel} className="export-button">
                        <FiFileText /> {/* Excel icon */}
                        Eksel ({attendanceData?.innerData?.length} )
                    </button>
                </div>
                {isLoading && <div className="loadingatt"><Spin /></div>}
                {error && <div className="error">Xato: {error.message}</div>}

                {attendanceData && attendanceData?.innerData?.length > 0 ? (
                    <div className="table-wrapper">
                        <table className="attendance-table">
                            <thead>
                                <tr>
                                    <th>Xodim</th>
                                    <th>Kirish vaqti</th>
                                    <th>Chiqish vaqti</th>
                                    <th>Holati</th>
                                    <th>Kechikish (daqiqa)</th>
                                    <th>Qo'shimcha ish (daqiqa)</th>
                                    <th>Jami ish vaqti (soat)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceData?.innerData?.map((record) => (
                                    <tr key={record._id}>
                                        <td>{record.employee_id?.name || 'Mavjud emas'}</td>
                                        <td>
                                            {record.check_in_time
                                                ? new Date(record.check_in_time).toLocaleTimeString('uz-UZ')
                                                : '-'}
                                        </td>
                                        <td>
                                            {record.check_out_time
                                                ? new Date(record.check_out_time).toLocaleTimeString('uz-UZ')
                                                : '-'}
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${record.status}`}>
                                                {record.status === 'present'
                                                    ? 'Mavjud'
                                                    : record.status === 'absent'
                                                        ? "Yo'q"
                                                        : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>{record.late_minutes}</td>
                                        <td>{record.overtime_minutes}</td>
                                        <td>{(record.total_work_minutes / 60).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div>{formattedDate} uchun davomat ma'lumotlari mavjud emas</div>
                )}
            </div>
            <div className="calendar-section">

                <h2 className="section-title">Sana tanlash</h2>
                <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    className="custom-calendar"
                    locale="uz"
                    formatMonth={(locale, date) => uzbekLocale.months[date.getMonth()]}
                    formatShortWeekday={(locale, date) => uzbekLocale.weekdaysShort[date.getDay()]}
                    nextLabel={uzbekLocale.nextLabel}
                    prevLabel={uzbekLocale.prevLabel}
                    next2Label={uzbekLocale.next2Label}
                    prev2Label={uzbekLocale.prev2Label}
                />
            </div>

        </div>
    );
};

export default AttendanceDashboard;
