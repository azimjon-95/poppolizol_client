import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllStoriesQuery } from '../../../context/storyApi';
import { Table, Spin, Input, Button, Space } from 'antd';
import { DownloadOutlined, CalendarOutlined } from '@ant-design/icons';
import Select from 'react-select';
import { PhoneNumberFormat } from '../../../hook/NumberFormat';
import { capitalizeFirstLetter } from '../../../hook/CapitalizeFirstLitter';
import exportToExcel from './exportToExcel';
import { tableStyles } from './history';
import moment from 'moment';

const History = () => {
    const [startDate, setStartDate] = useState(moment().startOf('day').format('DD.MM.YYYY'));
    const [endDate, setEndDate] = useState(moment().endOf('day').format('DD.MM.YYYY'));
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [dateError, setDateError] = useState('');

    // Validate date string as DD.MM.YYYY
    const isValidDate = (dateStr) => {
        if (!dateStr || !dateStr.match(/^\d{2}\.\d{2}\.\d{4}$/)) return false;
        const [day, month, year] = dateStr.split('.').map(Number);
        const date = moment(`${year}-${month}-${day}`, 'YYYY-MM-DD');
        return date.isValid() && day >= 1 && day <= 31 && month >= 1 && month <= 12;
    };
    // Convert DD.MM.YYYY to YYYY-MM-DD for API
    const formatToApiDate = (dateStr) => {
        if (!dateStr || !isValidDate(dateStr)) return undefined;
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
    };

    // Fetch stories with startDay and endDay
    const { data: allStories, isLoading: isLoadingAllStories } = useGetAllStoriesQuery(
        startDate && endDate && isValidDate(startDate) && isValidDate(endDate)
            ? {
                startDay: formatToApiDate(startDate),
                endDay: formatToApiDate(endDate),
            }
            : {},
        { skip: !startDate || !endDate || !isValidDate(startDate) || !isValidDate(endDate) }
    );

    const { searchQuery } = useSelector((state) => state.search);



    // Handle date input change
    const handleDateChange = (value, setter, isStart) => {
        if (!value) {
            setter('');
            setDateError('');
            return;
        }

        let cleanedValue = value.replace(/[^0-9.]/g, '');
        if (cleanedValue.length > 10) cleanedValue = cleanedValue.slice(0, 10);

        let formatted = '';
        const digits = cleanedValue.replace(/\./g, '');
        if (digits.length >= 2) formatted += digits.slice(0, 2);
        else formatted += digits;
        if (digits.length > 2) formatted += '.' + digits.slice(2, 4);
        if (digits.length > 4) formatted += '.' + digits.slice(4, 8);
        formatted = formatted.slice(0, 10);

        setter(formatted);

        if (formatted.length === 10) {
            if (!isValidDate(formatted)) {
                setDateError('Noto‘g‘ri sana formati. Iltimos, DD.MM.YYYY formatida kiriting');
                return;
            }

            const start = isStart ? formatted : startDate;
            const end = isStart ? endDate : formatted;
            if (start.length === 10 && end.length === 10 && isValidDate(start) && isValidDate(end)) {
                const startMoment = moment(start, 'DD.MM.YYYY');
                const endMoment = moment(end, 'DD.MM.YYYY');
                if (startMoment.isAfter(endMoment)) {
                    setDateError("Boshlanish sanasi tugash sanasidan keyin bo'lmasligi kerak");
                } else {
                    setDateError('');
                }
            }
        } else {
            setDateError('');
        }
    };

    // Get unique doctors
    const uniqueDoctors = useMemo(() => {
        if (!allStories?.innerData) return [];

        const doctorSet = new Set();
        const doctors = allStories.innerData
            .filter((item) => item.doctorId)
            .map((item) => ({
                value: `${item.doctorId.firstName}_${item.doctorId.lastName}_${item.doctorId.specialization}`,
                label: `${item.doctorId.firstName} ${item.doctorId.lastName} (${capitalizeFirstLetter(item.doctorId.specialization)})`,
                firstName: item.doctorId.firstName,
                lastName: item.doctorId.lastName,
                specialization: item.doctorId.specialization,
            }))
            .filter((doctor) => {
                const key = `${doctor.firstName}_${doctor.lastName}_${doctor.specialization}`;
                if (doctorSet.has(key)) return false;
                doctorSet.add(key);
                return true;
            })
            .sort((a, b) => a.label.localeCompare(b.label));

        return doctors;
    }, [allStories?.innerData]);

    // Table columns configuration
    const columns = useMemo(
        () => [
            {
                title: 'Navbati',
                dataIndex: 'order_number',
                key: 'order_number',
                align: 'center',
                width: 100,
            },
            {
                title: 'Bemor ismi',
                key: 'patient_name',
                render: (_, record) => `${record.patientId.firstname} ${record.patientId.lastname}`,
                width: 150,
            },
            {
                title: 'Telefon',
                dataIndex: ['patientId', 'phone'],
                key: 'phone',
                render: (phone) => PhoneNumberFormat(phone),
                width: 130,
            },
            {
                title: "To'lov turi",
                dataIndex: 'paymentType',
                key: 'paymentType',
                render: (paymentType) => capitalizeFirstLetter(paymentType),
                width: 120,
            },
            {
                title: "To'lov summasi",
                dataIndex: 'payment_amount',
                key: 'payment_amount',
                render: (amount) => `${amount.toLocaleString()} so'm`,
                width: 120,
            },
            {
                title: 'Sana',
                dataIndex: 'createdAt',
                key: 'createdAt',
                render: (date) => {
                    const d = new Date(date);
                    const day = String(d.getDate()).padStart(2, '0');
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const year = d.getFullYear();
                    const hours = String(d.getHours()).padStart(2, '0');
                    const minutes = String(d.getMinutes()).padStart(2, '0');
                    return `${day}.${month}.${year} ${hours}:${minutes}`;
                },
                width: 150,
            },
            {
                title: 'Shifokor ismi',
                key: 'doctor_name',
                render: (_, record) => `${record.doctorId.firstName} ${record.doctorId.lastName}`,
                width: 150,
            },
            {
                title: 'Mutaxassislik',
                dataIndex: ['doctorId', 'specialization'],
                key: 'specialization',
                render: (specialization) => capitalizeFirstLetter(specialization),
                width: 120,
            },
        ],
        []
    );

    // Filter data by search query and selected doctor (client-side)
    const filteredAndSortedData = useMemo(() => {
        if (!allStories?.innerData) return [];

        return allStories.innerData
            .filter((item) => {
                if (!item.doctorId || !item.patientId) return false;

                const matchesDoctor =
                    !selectedDoctor ||
                    (item.doctorId.firstName === selectedDoctor.firstName &&
                        item.doctorId.lastName === selectedDoctor.lastName &&
                        item.doctorId.specialization === selectedDoctor.specialization);

                if (!searchQuery.trim() && !selectedDoctor) return true;

                const query = searchQuery.toLowerCase().trim();
                const patientName = `${item.patientId.firstname} ${item.patientId.lastname}`.toLowerCase();
                const doctorName = `${item.doctorId.firstName} ${item.doctorId.lastName}`.toLowerCase();
                const phone = (item.patientId.phone || '').toLowerCase();
                const paymentType = (item.paymentType || '').toLowerCase();
                const orderNumber = (item.order_number || '').toString();
                const paymentAmount = (item.payment_amount || '').toString();
                const specialization = (item.doctorId.specialization || '').toLowerCase();

                return (
                    matchesDoctor &&
                    (!searchQuery.trim() ||
                        patientName.includes(query) ||
                        doctorName.includes(query) ||
                        phone.includes(query) ||
                        paymentType.includes(query) ||
                        orderNumber.includes(query) ||
                        paymentAmount.includes(query) ||
                        specialization.includes(query))
                );
            })
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }, [allStories?.innerData, searchQuery, selectedDoctor]);

    return (
        <div style={{ backgroundColor: 'transparent' }} className="registration-container">
            <style>{tableStyles}</style>

            <div className="date-filter-container">
                <Space>
                    <Input
                        className="date-input no-print"
                        value={startDate}
                        onChange={(e) => handleDateChange(e.target.value, setStartDate, true)}
                        placeholder="DD.MM.YYYY"
                        maxLength={10}
                    />
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    <Input
                        className="date-input no-print"
                        value={endDate}
                        onChange={(e) => handleDateChange(e.target.value, setEndDate, false)}
                        placeholder="DD.MM.YYYY"
                        maxLength={10}
                    />
                </Space>

                <Select
                    className="doctor-select no-print"
                    options={uniqueDoctors}
                    value={selectedDoctor}
                    onChange={setSelectedDoctor}
                    placeholder="Shifokor tanlash"
                    isClearable
                    isDisabled={isLoadingAllStories || !uniqueDoctors.length}
                />

                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={() => exportToExcel(filteredAndSortedData, startDate, endDate)}
                    disabled={!filteredAndSortedData.length || dateError}
                    className="export-button no-print"
                >
                    Excel yuklash ({filteredAndSortedData.length} ta)
                </Button>
            </div>

            {dateError && (
                <div style={{ color: 'red', marginBottom: 16 }}>{dateError}</div>
            )}

            {isLoadingAllStories ? (
                <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />
            ) : (
                <Table
                    columns={columns}
                    dataSource={filteredAndSortedData}
                    rowKey="_id"
                    bordered
                    pagination={false}
                    size="small"
                    style={{ background: '#fff' }}
                    locale={{
                        emptyText:
                            searchQuery || selectedDoctor || dateError
                                ? `"${searchQuery || selectedDoctor?.label || dateError || ''}" bo'yicha hech narsa topilmadi`
                                : "Tanlangan sanalar oralig'ida ma'lumot topilmadi",
                    }}
                />
            )}
        </div>
    );
};

export default History;