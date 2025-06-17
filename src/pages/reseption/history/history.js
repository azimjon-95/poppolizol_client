export const tableStyles = `
        @media print {
            .no-print {
                display: none;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                border: 1px solid #ddd;
                padding: 2px;
            }
            th {
                background-color: #f2f2f2;
            }
        }
        .ant-table-tbody > tr > td {
            padding: 8px !important;
            font-size: 12px !important;
        }
        .ant-table-thead > tr > th {
            padding: 8px !important;
            font-size: 13px !important;
        }
        .ant-table-row {
            height: 40px !important;
        }
        .date-filter-container {
            border-radius: 8px;
            margin-bottom: 16px;
               display: flex;
                   justify-content: space-between;
    align-items: center;

        }
        .export-button {
            background: #52c41a;
            border-color: #52c41a;
        }
        .export-button:hover {
            background: #fff !important;
            border-color: #73d13d !important;
            color: #73d13d !important;
        }

         .doctor-select {
            width: 300px;

        }
        .date-input {
            width: 120px;
        }
        .error-message {
            color: #ff4d4f;
            font-size: 12px;
            margin-top: 4px;
        }
    `;