import React, { useRef, useState } from 'react';
import { useGetAllTodaysQuery } from '../../../context/todaysApi';
import { Table, Spin, Button, Typography } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useReactToPrint } from "react-to-print";
import { PhoneNumberFormat } from '../../../hook/NumberFormat';
import { capitalizeFirstLetter } from '../../../hook/CapitalizeFirstLitter';
// import ModelCheck from '../../../components/check/modelCheck/ModelCheck';

const { Title } = Typography;

const NewRegistrations = () => {
    const { data: allStories, isLoading: isLoadingAllStories } = useGetAllTodaysQuery();
    const contentRef = useRef(null);
    const [data, setData] = useState(null);

    const reactToPrintFn = useReactToPrint({
        contentRef,
        pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body { margin: 0; }
        * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
      }
    `
    });

    const handleRowPrint = (record) => {

        // Validate record
        if (!record || !record.patientId || !record.doctorId) {
            console.error('Invalid record:', record);
            return;
        }

        const story = {
            response: {
                doctor: {
                    specialization: record.doctorId?.specialization || 'N/A',
                    firstName: record.doctorId?.firstName || 'N/A',
                    lastName: record.doctorId?.lastName || 'N/A',
                    phone: record.doctorId?.phone || 'N/A'
                },
                patient: {
                    firstname: record.patientId?.firstname || 'N/A',
                    lastname: record.patientId?.lastname || 'N/A',
                    phone: record.patientId?.phone || 'N/A',
                    idNumber: record.patientId?.idNumber || 'N/A',
                    address: record.patientId?.address || 'N/A',
                    paymentType: record.paymentType || 'N/A',
                    order_number: record.order_number || 0
                },
                created: record.createdAt || new Date().toISOString(),
                order_number: record.order_number || 0
            },
            services: record.services?.map(service => ({
                name: service.name,
                price: service.price
            })) || []
        };


        setData(story);
        setTimeout(() => {
            reactToPrintFn();
        }, 300);
    };

    // Table columns configuration (unchanged from your latest version)
    const columns = [
        {
            title: 'Navbati',
            dataIndex: 'order_number',
            key: 'order_number',
            align: 'center',
            width: 80,
        },
        {
            title: 'Bemor ismi',
            key: 'patient_name',
            render: (_, record) => `${record.patientId.firstname} ${record.patientId.lastname}`,
            width: 150,
        },
        {
            title: 'Qabul',
            dataIndex: ['doctorId', 'specialization'],
            key: 'specialization',
            render: (phone) => capitalizeFirstLetter(phone),
            width: 120,
        },
        {
            title: 'Xizmatlar',
            key: 'services',
            render: (_, record) => {
                const serviceNames = record?.services?.map(service => service.name).join(', ') || 'Xizmatlar yoʻq';

                return serviceNames;
            },
            width: 200,
        },
        {
            title: 'To\'lov summasi',
            dataIndex: 'payment_amount',
            key: 'payment_amount',
            render: (amount) => `${amount.toLocaleString()} soʻm`,
            width: 120,
        },
        {
            title: 'To\'lov turi',
            dataIndex: 'paymentType',
            key: 'paymentType',
            render: (paymentType) => capitalizeFirstLetter(paymentType),
            width: 100,
        },
        {
            title: 'Soat',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => {
                const d = new Date(date);
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            },
            width: 80,
        },
        {
            title: 'Chop etish',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Button
                    icon={<PrinterOutlined />}
                    onClick={() => handleRowPrint(record)}
                    size="small"
                    className="no-print"
                />
            ),
            width: 80,
        },
    ];

    // Table styles and other components remain unchanged
    const tableStyles = `
        @media print {
            .no-print { display: none; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 6px; }
            th { background-color: #f2f2f2; }
        }
        .ant-table-tbody > tr > td { padding: 8px !important; font-size: 12px !important; }
        .ant-table-thead > tr > th { padding: 8px !important; font-size: 12px !important; }
        .ant-table-row { height: auto !important; }
        .ant-table-cell { vertical-align: middle !important; }
    `;

    const sortedData = allStories?.innerData
        ? [...allStories.innerData].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : [];

    return (
        <div className="registration-container">
            <style>{tableStyles}</style>
            <Title level={4} className="registration-title">
                Qabulni kutyotgan bemorlar
            </Title>
            {isLoadingAllStories ? (
                <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
            ) : (
                <Table
                    columns={columns}
                    dataSource={sortedData}
                    rowKey="_id"
                    bordered
                    pagination={false}
                    size="small"
                    style={{ background: '#fff' }}
                />
            )}
        </div>
    );
};

export default NewRegistrations;