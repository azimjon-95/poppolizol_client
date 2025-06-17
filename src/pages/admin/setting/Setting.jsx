import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Form, Input, Checkbox, Button, TimePicker, Table, Spin, Typography, Card, Row, Col, Space, Upload, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusCircleOutlined, MedicineBoxOutlined, UploadOutlined } from '@ant-design/icons';
import { useGetClinicsQuery, useCreateClinicMutation, useUpdateClinicMutation, useDeleteClinicMutation } from '../../../context/clinicApi';
import { handleUpload } from '../../../utils/handleUpload';
import { PhoneNumberFormat } from '../../../hook/NumberFormat';
import moment from 'moment';
import './style.css';

const { Title } = Typography;

// Work days mapping
const WORK_DAYS = [
    { label: 'Dushanba', value: 'monday' },
    { label: 'Seshanba', value: 'tuesday' },
    { label: 'Chorshanba', value: 'wednesday' },
    { label: 'Payshanba', value: 'thursday' },
    { label: 'Juma', value: 'friday' },
    { label: 'Shanba', value: 'saturday' },
    { label: 'Yakshanba', value: 'sunday' },
];

// Form validation rules
const FORM_RULES = {
    clinicName: [{ required: true, message: 'Iltimos, klinika nomini kiriting' }],
    work_schedule_start_time: [{ required: true, message: 'Iltimos, boshlanish vaqtini tanlang' }],
    work_schedule_end_time: [{ required: true, message: 'Iltimos, tugash vaqtini tanlang' }],
    address: [{ required: true, message: 'Iltimos, manzilni kiriting' }],
    phone: [
        { required: true, message: 'Iltimos, telefon raqamini kiriting' },
        { pattern: /^\+?\d{10,15}$/, message: 'Noto\'g\'ri telefon raqami' },
    ],
    lunch_break_start_time: [{ required: false }],
    lunch_break_end_time: [{ required: false }],
};

const ClinicManagement = () => {
    const [form] = Form.useForm();
    const [clinicToEdit, setClinicToEdit] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [selectedDays, setSelectedDays] = useState([]);

    // RTK Query hooks
    const { data: clinics, isLoading, error } = useGetClinicsQuery();
    const [createClinic, { isLoading: isCreating }] = useCreateClinicMutation();
    const [updateClinic, { isLoading: isUpdating }] = useUpdateClinicMutation();
    const [deleteClinic] = useDeleteClinicMutation();

    // Set form values when editing
    useEffect(() => {
        if (clinicToEdit) {
            const workDays = clinicToEdit.work_schedule?.work_days || [];
            setSelectedDays(workDays);
            form.setFieldsValue({
                clinicName: clinicToEdit.clinicName,
                address: clinicToEdit.address,
                phone: clinicToEdit.phone,
                work_schedule: {
                    start_time: clinicToEdit.work_schedule?.start_time ? moment(clinicToEdit.work_schedule.start_time, 'HH:mm') : null,
                    end_time: clinicToEdit.work_schedule?.end_time ? moment(clinicToEdit.work_schedule.end_time, 'HH:mm') : null,
                    work_days: workDays,
                    lunch_break: {
                        start_time: clinicToEdit.work_schedule?.lunch_break?.start_time ? moment(clinicToEdit.work_schedule.lunch_break.start_time, 'HH:mm') : null,
                        end_time: clinicToEdit.work_schedule?.lunch_break?.end_time ? moment(clinicToEdit.work_schedule.lunch_break.end_time, 'HH:mm') : null,
                        enabled: clinicToEdit.work_schedule?.lunch_break?.enabled ?? true,
                    },
                },
            });
            setFileList(clinicToEdit.logo ? [{ uid: '-1', name: 'logotip.jpg', status: 'done', url: clinicToEdit.logo }] : []);
        } else {
            form.resetFields();
            setFileList([]);
            setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
        }
    }, [clinicToEdit, form]);

    // Handle day selection
    const handleDayToggle = useCallback((day) => {
        setSelectedDays((prev) => {
            const newDays = prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day];
            form.setFieldsValue({ work_schedule: { ...form.getFieldValue('work_schedule'), work_days: newDays } });
            return newDays;
        });
    }, [form]);

    // Handle form submission
    const handleSubmit = useCallback(
        async (values) => {
            let logoUrl = clinicToEdit?.logo || '';
            if (fileList.length > 0 && fileList[0].originFileObj) {
                try {
                    logoUrl = await handleUpload({ file: fileList[0].originFileObj, setUploading });
                } catch (error) {
                    return;
                }
            }

            const formattedValues = {
                clinicName: values.clinicName,
                address: values.address,
                phone: values.phone,
                logo: logoUrl,
                work_schedule: {
                    start_time: values.work_schedule?.start_time ? values.work_schedule.start_time.format('HH:mm') : '08:00',
                    end_time: values.work_schedule?.end_time ? values.work_schedule.end_time.format('HH:mm') : '17:00',
                    work_days: values.work_schedule?.work_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
                    lunch_break: {
                        start_time: values.work_schedule?.lunch_break?.start_time ? values.work_schedule.lunch_break.start_time.format('HH:mm') : '12:00',
                        end_time: values.work_schedule?.lunch_break?.end_time ? values.work_schedule.lunch_break.end_time.format('HH:mm') : '13:00',
                        enabled: values.work_schedule?.lunch_break?.enabled ?? true,
                    },
                },
            };

            try {
                if (clinicToEdit) {
                    await updateClinic({ id: clinicToEdit._id, ...formattedValues }).unwrap();
                    message.success('Klinika muvaffaqiyatli yangilandi');
                } else {
                    await createClinic(formattedValues).unwrap();
                    message.success('Klinika muvaffaqiyatli yaratildi');
                }
                form.resetFields();
                setFileList([]);
                setClinicToEdit(null);
                setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
            } catch (error) {
                message.error(`Klinikani saqlashda xatolik: ${error?.data?.message || error.message}`);
            }
        },
        [clinicToEdit, fileList, form, createClinic, updateClinic]
    );

    // Handle edit
    const handleEdit = useCallback((clinic) => {
        setClinicToEdit(clinic);
    }, []);

    // Handle delete with confirmation
    const handleDelete = async (id) => {
        try {
            await deleteClinic(id).unwrap();
            message.success('Klinika muvaffaqiyatli o\'chirildi');
        } catch (error) {
            message.error(`Klinikani o\'chirishda xatolik: ${error?.data?.message || error.message}`);
        }
    };

    // Handle cancel
    const handleCancel = useCallback(() => {
        form.resetFields();
        setFileList([]);
        setClinicToEdit(null);
        setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
    }, [form]);

    // Upload props
    const uploadProps = useMemo(
        () => ({
            onRemove: () => setFileList([]),
            beforeUpload: (file) => {
                const isImage = file.type.startsWith('image/');
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isImage) {
                    message.error('Faqat rasm fayllarini yuklash mumkin!');
                    return false;
                }
                if (!isLt2M) {
                    message.error('Rasm hajmi 2MB dan kichik bo\'lishi kerak!');
                    return false;
                }
                setFileList([file]);
                return false;
            },
            fileList,
            accept: 'image/*',
            maxCount: 1,
            showUploadList: { showPreviewIcon: true },
        }),
        [fileList]
    );

    // Table columns
    const columns = useMemo(
        () => [
            {
                title: 'Logotip',
                dataIndex: 'logo',
                key: 'logo',
                render: (logo) => (logo ? <img src={logo} alt="logotip" style={{ width: 50, borderRadius: 4 }} /> : 'Logotip Yo\'q'),
            },
            {
                title: 'Klinika Nomi',
                dataIndex: 'clinicName',
                key: 'clinicName',
            },
            {
                title: 'Ish Vaqti',
                dataIndex: 'work_schedule',
                key: 'work_schedule',
                render: (work_schedule) => `${work_schedule.start_time} - ${work_schedule.end_time}`,
            },
            {
                title: 'Ish Kunlari',
                dataIndex: ['work_schedule', 'work_days'],
                key: 'work_days',
                render: (work_days) => {
                    const selectedCount = work_days.length;
                    const totalCount = 7; // Total possible days (monday to sunday)
                    const unselectedCount = totalCount - selectedCount;
                    return `${selectedCount}/${unselectedCount}`;
                },
            },
            {
                title: 'Tushlik Vaqti',
                dataIndex: ['work_schedule', 'lunch_break'],
                key: 'lunch_break',
                render: (lunch_break) => (lunch_break.enabled ? `${lunch_break.start_time} - ${lunch_break.end_time}` : 'Yo\'q'),
            },
            {
                title: 'Manzil',
                dataIndex: 'address',
                key: 'address',
            },
            {
                title: 'Telefon',
                dataIndex: 'phone',
                key: 'phone',
                render: (phone) => (phone ? PhoneNumberFormat(phone) : 'Telefon Yo\'q'),
            },
            {
                title: 'Amallar',
                key: 'actions',
                render: (_, record) => (
                    <Space>
                        <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                            Tahrirlash
                        </Button>
                        <Popconfirm
                            title="Klinikani o'chirishni xohlaysizmi?"
                            onConfirm={() => handleDelete(record._id)}
                            okText="Ha"
                            cancelText="Yo'q"
                        >
                            <Button type="link" icon={<DeleteOutlined />} danger>
                                O'chirish
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        [handleEdit, handleDelete]
    );

    // Ensure dataSource is an array
    const tableData = Array.isArray(clinics?.innerData)
        ? clinics?.innerData
        : clinics?.innerData && typeof clinics?.innerData === 'object' && Object.keys(clinics?.innerData).length > 0
            ? [clinics?.innerData]
            : [];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={3} style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
                <MedicineBoxOutlined style={{ marginRight: 8 }} /> Klinika Boshqaruvi
            </Title>

            <Card
                className="clinic-card"
                title={clinicToEdit ? 'Klinikani Tahrirlash' : 'Yangi Klinika Qo\'shish'}
                style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        clinicName: '',
                        address: '',
                        phone: '',
                        work_schedule: {
                            work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
                            lunch_break: { enabled: true },
                        },
                    }}
                >
                    <Row gutter={16}>
                        <Col xs={24} md={12}>
                            <Form.Item label="Klinika Nomi" name="clinicName" rules={FORM_RULES.clinicName}>
                                <Input prefix={<MedicineBoxOutlined />} placeholder="Klinika nomini kiriting" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Manzil" name="address" rules={FORM_RULES.address}>
                                <Input placeholder="Manzilni kiriting" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Telefon" name="phone" rules={FORM_RULES.phone}>
                                <Input placeholder="Telefon raqamini kiriting" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Logotip">
                                <Upload {...uploadProps}>
                                    <Button icon={<UploadOutlined />} loading={uploading}>
                                        Logotipni Yuklash (ixtiyoriy)
                                    </Button>
                                </Upload>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Boshlanish Vaqti" name={['work_schedule', 'start_time']} rules={FORM_RULES.work_schedule_start_time}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Vaqtni tanlang" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Tugash Vaqti" name={['work_schedule', 'end_time']} rules={FORM_RULES.work_schedule_end_time}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Vaqtni tanlang" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item label="Ish Kunlari" name={['work_schedule', 'work_days']}>
                                <Space wrap>
                                    {WORK_DAYS.map((day) => (
                                        <Button
                                            key={day.value}
                                            type={selectedDays.includes(day.value) ? 'primary' : 'default'}
                                            onClick={() => handleDayToggle(day.value)}
                                        >
                                            {day.label}
                                        </Button>
                                    ))}
                                </Space>
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Tushlik Boshlanishi" name={['work_schedule', 'lunch_break', 'start_time']} rules={FORM_RULES.lunch_break_start_time}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Vaqtni tanlang" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                            <Form.Item label="Tushlik Tugashi" name={['work_schedule', 'lunch_break', 'end_time']} rules={FORM_RULES.lunch_break_end_time}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} placeholder="Vaqtni tanlang" />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name={['work_schedule', 'lunch_break', 'enabled']} valuePropName="checked">
                                <Checkbox>Tushlik Vaqti Yoqilgan</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<PlusCircleOutlined />} loading={isCreating || isUpdating || uploading}>
                                {clinicToEdit ? 'Yangilash' : 'Yaratish'}
                            </Button>
                            {clinicToEdit && <Button onClick={handleCancel}>Bekor Qilish</Button>}
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                {isLoading ? (
                    <Spin tip="Klinikalar yuklanmoqda..." />
                ) : error ? (
                    <div>Klinikalarni yuklashda xatolik: {error?.data?.message || error.message}</div>
                ) : (
                    <Table pagination={false} size="small" bordered columns={columns} dataSource={tableData} rowKey="_id" className="clinic-table" />
                )}
            </Card>
        </div>
    );
};

export default ClinicManagement;