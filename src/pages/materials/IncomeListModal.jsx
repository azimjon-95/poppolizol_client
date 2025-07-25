import React, { useState, useMemo } from 'react';
import { Card, Typography, Divider, Input, Tag, Table, Collapse, Modal, Button, Select, Form } from 'antd';
import { useSelector } from "react-redux";
import {
    LuPackagePlus, LuBuilding2, LuPhone, LuCalendar, LuDollarSign, LuCreditCard, LuTruck,
    LuUsers, LuFileText, LuChevronRight, LuChevronDown, LuPackage, LuWeight, LuBanknote, LuFilter, LuWallet
} from 'react-icons/lu';
import { MdAccountBalance } from "react-icons/md";
import { InputNumber } from 'antd';
import { useGetIncomesQuery, usePayDebtIncomeMutation } from "../../context/materialApi";
import { useGetBalanceQuery } from "../../context/expenseApi";
import { numberFormat } from '../../utils/numberFormat';
import { PhoneNumberFormat } from '../../hook/NumberFormat';
import './style/incom.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const IncomeListModal = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const date = new Date();
        return `${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    });
    const role = localStorage.getItem("role")
    const [selectedFirm, setSelectedFirm] = useState('all'); // New state for firm filter
    const [payDebtIncome, { isLoading: isPayDebtLoading }] = usePayDebtIncomeMutation();
    const [paymentModal, setPaymentModal] = useState({ visible: false, incomeData: null });
    const [debtPaymentsModal, setDebtPaymentsModal] = useState({ visible: false, debtPayments: [], incomeData: null });
    const { data: balanceData, refetch: balanceRefetch, isLoading: balanceIsLoading } = useGetBalanceQuery();
    const [debtFilter, setDebtFilter] = useState('all'); // 'all', 'debt', 'paid'
    const [form] = Form.useForm();
    const { data: incomesData, isLoading: incomesIsLoading, refetch } = useGetIncomesQuery(selectedMonth, {
        skip: !selectedMonth,
    });

    const incomesDataList = incomesData?.innerData || [];
    const searchTextValue = useSelector((s) => s.search.searchQuery);

    // Compute unique firm names
    const uniqueFirms = useMemo(() => {
        const firms = incomesDataList
            .map((income) => income.firm?.name || "Noma'lum firma")
            .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
        return ['all', ...firms.sort()]; // Add 'all' option and sort firms
    }, [incomesDataList]);

    // Optimized filtering with firm filter included
    const filteredIncomes = useMemo(() => {
        return incomesDataList.filter((income) => {
            const firmName = income.firm?.name?.toLowerCase() || "noma'lum firma";
            const materialNames = income.materials?.map((m) => m.name?.toLowerCase()).join(" ") || "";
            const searchLower = searchTextValue.toLowerCase();
            const matchesSearch = firmName.includes(searchLower) || materialNames.includes(searchLower);

            let matchesDebtFilter = true;
            if (debtFilter === 'debt') {
                matchesDebtFilter = income.debt?.remainingAmount > 0;
            } else if (debtFilter === 'paid') {
                matchesDebtFilter = income.debt?.remainingAmount === 0;
            }

            const matchesFirmFilter = selectedFirm === 'all' || firmName === selectedFirm.toLowerCase();

            return matchesSearch && matchesDebtFilter && matchesFirmFilter;
        });
    }, [incomesDataList, searchTextValue, debtFilter, selectedFirm]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (/^[0-1]?\d?(\.\d{0,4})?$/.test(value)) {
            setSelectedMonth(value);
        }
    };

    const handleBlur = () => {
        if (selectedMonth && !/^(0[1-9]|1[0-2])\.\d{4}$/.test(selectedMonth)) {
            setSelectedMonth('');
        }
    };

    const handlePaymentClick = (income) => {
        setPaymentModal({
            visible: true,
            incomeData: {
                ...income,
                totalAmount: income.debt?.initialAmount || income.totalWithVat || 0,
                paidAmount: (income.debt?.initialAmount || 0) - (income.debt?.remainingAmount || 0),
                debtAmount: income.debt?.remainingAmount || 0
            }
        });

        form.setFieldsValue({
            paymentAmount: income.debt?.remainingAmount || 0,
            paymentMethod: 'naqt'
        });
    };

    const handleDebtPaymentsClick = (income) => {
        setDebtPaymentsModal({
            visible: true,
            debtPayments: income.debt?.debtPayments || [],
            incomeData: {
                firmName: income.firm?.name || "Noma'lum firma",
                createdAt: income.createdAt
            }
        });
    };

    const handlePaymentSubmit = async (values) => {
        try {
            const paymentData = {
                incomeId: paymentModal.incomeData._id,
                debtPayment: {
                    amount: values.paymentAmount,
                    paymentMethod: values.paymentMethod,
                    note: values.note || ''
                }
            };
            await payDebtIncome(paymentData).unwrap();
            toast.success('To\'lov muvaffaqiyatli amalga oshirildi!');
            setPaymentModal({ visible: false, incomeData: null });
            balanceRefetch();
            form.resetFields();
            refetch();
        } catch (error) {
            toast.error('To\'lov amalga oshirilmadi. Qayta urinib ko\'ring.');
        }
    };

    const handlePaymentCancel = () => {
        setPaymentModal({ visible: false, incomeData: null });
        form.resetFields();
    };

    const handleDebtPaymentsCancel = () => {
        setDebtPaymentsModal({
            visible: false,
            debtPayments: [],
            incomeData: null
        });
    };

    // Calculate totals for header cards
    const { totalIncomes, totalAmount, totalPaid, totalDebt, vatAmount } = useMemo(() => {
        return filteredIncomes.reduce(
            (acc, income) => {
                const debtAmount = income.debt?.remainingAmount || 0;
                const total = income.debt?.initialAmount || income.totalWithVat || 0;
                const paid = total - debtAmount;
                return {
                    totalIncomes: acc.totalIncomes + 1,
                    totalAmount: acc.totalAmount + total,
                    totalPaid: acc.totalPaid + paid,
                    totalDebt: acc.totalDebt + debtAmount,
                    vatAmount: acc.vatAmount + (income.vatAmount || 0)
                };
            },
            { totalIncomes: 0, totalAmount: 0, totalPaid: 0, totalDebt: 0, vatAmount: 0 }
        );
    }, [filteredIncomes]);

    const materialColumns = [
        {
            title: <span className="nns-table-header"><LuPackage className="nns-icon" /> Material</span>,
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="nns-material-name">
                    <LuPackagePlus className="nns-material-icon" />
                    <Text strong>{text}</Text>
                    <Tag className="nns-category-tag">{record.category}</Tag>
                </div>
            )
        },
        {
            title: <span className="nns-table-header"><LuWeight className="nns-icon" /> Miqdor</span>,
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity, record) => (
                <Tag className="nns-quantity-tag">
                    {numberFormat(quantity)} {record.unit}
                </Tag>
            )
        },
        {
            title: <span className="nns-table-header"><LuDollarSign className="nns-icon" /> Narx</span>,
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => (
                <Tag className={`nns-price-tag nns-price-${record.currency}`}>
                    {numberFormat(Math.floor(price))} {record.currency === 'sum' ? "so'm" : '$'}
                </Tag>
            )
        },
        {
            title: <span className="nns-table-header"><LuBanknote className="nns-icon" /> Jami</span>,
            key: 'total',
            render: (_, record) => (
                <Tag className="nns-total-tag">
                    {numberFormat(record.price * record.quantity)} {record.currency === 'sum' ? "so'm" : '$'}
                </Tag>
            )
        },
        {
            title: <span className="nns-table-header"><LuTruck className="nns-icon" /> Transport</span>,
            dataIndex: 'transportCostPerUnit',
            key: 'transport',
            render: (cost) => (
                <Tag className="nns-transport-tag">
                    {numberFormat(cost)} so'm
                </Tag>
            )
        },
        {
            title: <span className="nns-table-header"><LuUsers className="nns-icon" /> Ishchi</span>,
            dataIndex: 'workerCostPerUnit',
            key: 'worker',
            render: (cost) => (
                <Tag className="nns-worker-tag">
                    {numberFormat(cost)} so'm
                </Tag>
            )
        }
    ];

    const workerColumns = [
        {
            title: <span className="nns-table-header"><LuUsers className="nns-icon" /> Ishchi</span>,
            dataIndex: ['workerId', 'firstName'],
            key: 'worker',
            render: (firstName, record) => (
                <div className="nns-worker-info">
                    <Text strong>{firstName} {record.workerId?.lastName}</Text>
                    <Text className="nns-worker-position">{record.workerId?.position}</Text>
                </div>
            )
        },
        {
            title: <span className="nns-table-header"><LuDollarSign className="nns-icon" /> To'lov</span>,
            dataIndex: 'payment',
            key: 'payment',
            render: (payment) => (
                <Tag className="nns-payment-tag">
                    {numberFormat(payment)} so'm
                </Tag>
            )
        }
    ];

    const debtPaymentColumns = [
        {
            title: <span className="nns-table-header"><LuCalendar className="nns-icon" /> Sana</span>,
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: (date) => new Date(date).toLocaleDateString('uz-UZ')
        },
        {
            title: <span className="nns-table-header"><LuDollarSign className="nns-icon" /> Miqdor</span>,
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <Tag className="nns-payment-tag">{numberFormat(amount)} so'm</Tag>
            )
        },
        {
            title: <span className="nns-table-header"><LuCreditCard className="nns-icon" /> To'lov turi</span>,
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            render: (method) => (
                <Tag className={`nns-payment-type-tag nns-payment-${method}`}>
                    {method === 'naqt' ? 'Naqt' : 'Bank'}
                </Tag>
            )
        },
        {
            title: <span className="nns-table-header"><LuFileText className="nns-icon" /> Izoh</span>,
            dataIndex: 'note',
            key: 'note',
            render: (note) => note || '-'
        }
    ];

    return (
        <div className="nns-warehouse-modal nns-income-list-modal">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="nns-modal-header">
                <Title level={3} className="nns-modal-title">
                    <LuFileText className="nns-title-icon" />
                    Kirimlar ro'yxati
                </Title>
                <div className="nns-filter-group">
                    <Input
                        className="nns-month-input"
                        value={selectedMonth}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder="MM.YYYY"
                        maxLength={7}
                        prefix={<LuCalendar className="nns-input-icon" />}
                    />
                    <Select
                        className="nns-firm-filter"
                        value={selectedFirm}
                        onChange={setSelectedFirm}
                        placeholder="Firma filter"
                        style={{ width: 200 }}
                    >
                        {uniqueFirms.map((firm) => (
                            <Option key={firm} value={firm}>
                                <LuBuilding2 className="nns-filter-icon" />
                                {firm === 'all' ? 'Hammasi' : firm}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        className="nns-debt-filter"
                        value={debtFilter}
                        onChange={setDebtFilter}
                        placeholder="Qarz filter"
                        style={{ width: 150 }}
                    >
                        <Option value="all"><LuFilter className="nns-filter-icon" /> Hammasi</Option>
                        <Option value="debt"><LuBanknote className="nns-filter-icon" /> Qarzli</Option>
                        <Option value="paid"><LuCreditCard className="nns-filter-icon" /> To'langan</Option>
                    </Select>
                </div>
            </div>

            <div className="nns-header-cards">
                <Card className="nns-stat-card nns-stat-card-incomes">
                    <div className="nns-stat-content">
                        <div className="nns-stat-icon"><MdAccountBalance /></div>
                        <div className="nns-stat-info">
                            <Text className="nns-stat-number-bal">Naqt: {numberFormat(balanceData?.innerData?.naqt)}</Text>
                            <Text className="nns-stat-number-bal">Bank: {numberFormat(balanceData?.innerData?.bank)}</Text>
                            <Text className="nns-stat-label">Balans</Text>
                        </div>
                    </div>
                </Card>
                <Card className="nns-stat-card nns-stat-card-incomes">
                    <div className="nns-stat-content">
                        <div className="nns-stat-icon"><LuFileText /></div>
                        <div className="nns-stat-info">
                            <Text className="nns-stat-number">{totalIncomes}</Text>
                            <Text className="nns-stat-label">Jami kirimlar</Text>
                        </div>
                    </div>
                </Card>
                <Card className="nns-stat-card nns-stat-card-amount">
                    <div className="nns-stat-content">
                        <div className="nns-stat-icon"><LuDollarSign /></div>
                        <div className="nns-stat-info">
                            <Text className="nns-stat-number">{numberFormat(totalAmount)}</Text>
                            <Text className="nns-stat-label">Umumiy summa</Text>
                        </div>
                    </div>
                </Card>
                <Card className="nns-stat-card nns-stat-card-paid">
                    <div className="nns-stat-content">
                        <div className="nns-stat-icon"><LuCreditCard /></div>
                        <div className="nns-stat-info">
                            <Text className="nns-stat-number">{numberFormat(totalPaid)}</Text>
                            <Text className="nns-stat-label">To'langan</Text>
                        </div>
                    </div>
                </Card>
                <Card className="nns-stat-card nns-stat-card-debt">
                    <div className="nns-stat-content">
                        <div className="nns-stat-icon"><LuBanknote /></div>
                        <div className="nns-stat-info">
                            <Text className="nns-stat-number">{numberFormat(totalDebt)}</Text>
                            <Text className="nns-stat-label">Qarzlar</Text>
                        </div>
                    </div>
                </Card>
                <Card className="nns-stat-card nns-stat-card-vat">
                    <div className="nns-stat-content">
                        <div className="nns-stat-icon"><LuBanknote /></div>
                        <div className="nns-stat-info">
                            <Text className="nns-stat-number">{numberFormat(Math.floor(vatAmount))}</Text>
                            <Text className="nns-stat-label">Jami QQS</Text>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="nns-income-container">
                {incomesIsLoading ? (
                    <div className="nns-loading-container">
                        <div className="nns-loading-spinner"></div>
                        <Text>Kirimlar yuklanmoqda...</Text>
                    </div>
                ) : filteredIncomes.length === 0 ? (
                    <div className="nns-empty-state">
                        <div className="nns-empty-icon">📋</div>
                        <Title level={4} className="nns-empty-title">
                            {searchTextValue || selectedFirm !== 'all' ? 'Qidiruv natijalari topilmadi' : "Hozircha kirimlar yo'q"}
                        </Title>
                        <Text className="nns-empty-text">
                            {searchTextValue || selectedFirm !== 'all' ? "Boshqa kalit so'z yoki firma bilan qidiring" : "Yangi material kelganda bu yerda ko'rinadi"}
                        </Text>
                    </div>
                ) : (
                    <Collapse
                        className="nns-income-collapse"
                        expandIcon={({ isActive }) => isActive ? <LuChevronDown /> : <LuChevronRight />}
                        size="small"
                    >
                        {filteredIncomes.map((income) => {
                            const totalAmount = income.debt?.initialAmount || income.totalWithVat || 0;
                            const debtAmount = income.debt?.remainingAmount || 0;
                            const paidAmount = totalAmount - debtAmount;

                            return (
                                <Panel
                                    key={income._id}
                                    header={
                                        <div className="nns-income-header">
                                            <div className="nns-firm-info">
                                                <LuBuilding2 className="nns-firm-icon" />
                                                <div className="nns-firm-details">
                                                    <Text strong className="nns-firm-name">
                                                        {income.firm?.name || "Noma'lum firma"}
                                                    </Text>
                                                    <Text className="nns-firm-phone">
                                                        <LuPhone className="nns-phone-icon" />
                                                        {PhoneNumberFormat(income.firm?.phone) || "Telefon yo'q"}
                                                    </Text>
                                                </div>
                                            </div>
                                            <div className="nns-income-summary">
                                                <Tag className="nns-date-tag">
                                                    <LuCalendar className="nns-tag-icon" />
                                                    {new Date(income.createdAt).toLocaleDateString('uz-UZ')}
                                                </Tag>
                                                <Tag className="nns-amount-tag">
                                                    <LuDollarSign className="nns-tag-icon" />
                                                    {numberFormat(totalAmount)} so'm
                                                </Tag>
                                                {/* <Tag className={`nns-payment-type-tag nns-payment-${income.paymentType}`}>
                                                    <LuCreditCard className="nns-tag-icon" />
                                                    {income.paymentType}
                                                </Tag> */}
                                                {debtAmount > 0 && (
                                                    <Tag className="nns-debt-tag">
                                                        <LuBanknote className="nns-tag-icon" />
                                                        Qarz: {numberFormat(debtAmount)} so'm
                                                    </Tag>
                                                )}
                                                {income.debt?.debtPayments?.length > 0 && (
                                                    <Button
                                                        type="default"
                                                        size="small"
                                                        icon={<LuBanknote />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDebtPaymentsClick(income);
                                                        }}
                                                        className="nns-debt-payments-button"
                                                    >
                                                        Tulov tarixi
                                                    </Button>
                                                )}
                                                {
                                                    role !== "direktor" && <>

                                                        {debtAmount > 0 && (
                                                            <Button
                                                                type="primary"
                                                                size="small"
                                                                icon={<LuWallet />}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePaymentClick(income);
                                                                }}
                                                                className="nns-pay-button"
                                                            >
                                                                To'lov
                                                            </Button>
                                                        )}
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    }
                                    className="nns-income-panel"
                                >
                                    <div className="nns-income-details">
                                        <div className="nns-financial-summary">
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">QQSsiz summa:</Text>
                                                <Text strong className="nns-summary-value">
                                                    {numberFormat(Math.floor(income.totalWithoutVat))} so'm
                                                </Text>
                                            </div>
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">QQS ({income.vatPercentage}%):</Text>
                                                <Text strong className="nns-summary-value">
                                                    {numberFormat(Math.floor(income.vatAmount))} so'm
                                                </Text>
                                            </div>
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">QQSli summa:</Text>
                                                <Text strong className="nns-summary-value nns-total-amount">
                                                    {numberFormat(totalAmount)} so'm
                                                </Text>
                                            </div>
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">To'langan:</Text>
                                                <Text strong className="nns-summary-value nns-paid-amount">
                                                    {numberFormat(paidAmount)} so'm
                                                </Text>
                                            </div>
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">Qarz:</Text>
                                                <Text strong className={`nns-summary-value ${debtAmount > 0 ? 'nns-debt-amount' : 'nns-no-debt'}`}>
                                                    {numberFormat(debtAmount)} so'm
                                                </Text>
                                            </div>
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">Qarz holati:</Text>
                                                <Text strong className="nns-summary-value">
                                                    {income.debt?.status === 'partially_paid' ? 'Qisman to\'langan' :
                                                        income.debt?.status === 'fully_paid' ? 'To\'liq to\'langan' : 'To\'lanmagan'}
                                                </Text>
                                            </div>
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">Transport xarajati:</Text>
                                                <Text strong className="nns-summary-value">
                                                    {numberFormat(Math.floor(income.totalTransportCost))} so'm
                                                </Text>
                                            </div>
                                            <div className="nns-summary-item">
                                                <Text className="nns-summary-label">Ishchi xarajati:</Text>
                                                <Text strong className="nns-summary-value">
                                                    {numberFormat(income.totalWorkerCost)} so'm
                                                </Text>
                                            </div>
                                        </div>

                                        <Divider className="nns-section-divider" />

                                        <div className="nns-materials-section">
                                            <Title level={5} className="nns-section-title">
                                                <LuPackage className="nns-section-icon" />
                                                Materiallar
                                            </Title>
                                            <Table
                                                dataSource={income.materials}
                                                columns={materialColumns}
                                                pagination={false}
                                                size="small"
                                                className="nns-materials-table"
                                                rowKey="_id"
                                            />
                                        </div>

                                        {income.workerPayments && income.workerPayments.length > 0 && (
                                            <>
                                                <Divider className="nns-section-divider" />
                                                <div className="nns-workers-section">
                                                    <Title level={5} className="nns-section-title">
                                                        <LuUsers className="nns-section-icon" />
                                                        Ishchi to'lovlari
                                                    </Title>
                                                    <Table
                                                        dataSource={income.workerPayments}
                                                        columns={workerColumns}
                                                        pagination={false}
                                                        size="small"
                                                        className="nns-workers-table"
                                                        rowKey="_id"
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </Panel>
                            );
                        })}
                    </Collapse>
                )}
            </div>

            <Modal
                title={
                    <div className="nns-payment-modal-title">
                        <LuWallet className="nns-modal-icon" />
                        To'lov qilish
                    </div>
                }
                open={paymentModal.visible}
                onCancel={handlePaymentCancel}
                footer={null}
                width={500}
                className="nns-payment-modal"
            >
                {paymentModal.incomeData && (
                    <div className="nns-payment-modal-content">
                        <div className="nns-payment-info">
                            <div className="nns-firm-payment-info">
                                <Text strong>{paymentModal.incomeData.firm?.name}</Text>
                                <Text className="nns-payment-date">
                                    {new Date(paymentModal.incomeData.createdAt).toLocaleDateString('uz-UZ')}
                                </Text>
                            </div>
                            <div className="nns-payment-summary">
                                <div className="nns-payment-summary-item">
                                    <Text>Umumiy summa:</Text>
                                    <Text strong>{numberFormat(paymentModal.incomeData.totalAmount)} so'm</Text>
                                </div>
                                <div className="nns-payment-summary-item">
                                    <Text>To'langan:</Text>
                                    <Text strong className="nns-paid-text">
                                        {numberFormat(paymentModal.incomeData.paidAmount)} so'm
                                    </Text>
                                </div>
                                <div className="nns-payment-summary-item">
                                    <Text>Qarz:</Text>
                                    <Text strong className="nns-debt-text">
                                        {numberFormat(paymentModal.incomeData.debtAmount)} so'm
                                    </Text>
                                </div>
                                <div className="nns-payment-summary-item">
                                    <Text>Qarz holati:</Text>
                                    <Text strong>
                                        {paymentModal.incomeData.debt?.status === 'partially_paid' ? 'Qisman to\'langan' :
                                            paymentModal.incomeData.debt?.status === 'fully_paid' ? 'To\'liq to\'langan' : 'To\'lanmagan'}
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <Divider />
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handlePaymentSubmit}
                            className="nns-payment-form"
                        >
                            <Form.Item
                                label="To'lov miqdori"
                                name="paymentAmount"
                                rules={[
                                    { required: true, message: "To'lov miqdorini kiriting" },
                                    {
                                        type: 'number',
                                        min: 0.01,
                                        max: paymentModal.incomeData.debtAmount,
                                        message: `To'lov miqdori 0.01 dan ${paymentModal.incomeData.debtAmount} gacha bo'lishi kerak`,
                                    },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0.01}
                                    max={paymentModal.incomeData.debtAmount}
                                    placeholder="To'lov miqdorini kiriting"
                                    formatter={(value) => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                                    parser={(value) => value?.replace(/\./g, '')}
                                    addonBefore={<LuDollarSign />}
                                    addonAfter="so'm"
                                />
                            </Form.Item>
                            <Form.Item
                                label="To'lov turi"
                                name="paymentMethod"
                                rules={[{ required: true, message: "To'lov turini tanlang" }]}
                            >
                                <Select placeholder="To'lov turini tanlang">
                                    <Option value="naqt"><LuBanknote className="nns-option-icon" /> Naqt</Option>
                                    <Option value="bank"><LuCreditCard className="nns-option-icon" /> Bank</Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Izoh (ixtiyoriy)" name="note">
                                <Input.TextArea placeholder="To'lov haqida qo'shimcha ma'lumot" rows={3} />
                            </Form.Item>
                            <div className="nns-payment-form-buttons">
                                <Button onClick={handlePaymentCancel} className="nns-cancel-btn">Bekor qilish</Button>
                                <Button disabled={isPayDebtLoading} loading={isPayDebtLoading} type="primary" htmlType="submit" className="nns-pay-btn">
                                    <LuWallet className="nns-btn-icon" /> To'lov qilish
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Modal>

            <Modal
                title={
                    <div className="nns-debt-payments-modal-title">
                        <LuBanknote className="nns-modal-icon" />
                        Qarz to'lovlari
                    </div>
                }
                open={debtPaymentsModal.visible}
                onCancel={handleDebtPaymentsCancel}
                footer={null}
                width={600}
                className="nns-debt-payments-modal"
            >
                {debtPaymentsModal.incomeData && (
                    <div className="nns-debt-payments-modal-content">
                        <div className="nns-debt-payments-info">
                            <Text strong>{debtPaymentsModal.incomeData.firmName}</Text>
                            <Text className="nns-payment-date">
                                {new Date(debtPaymentsModal.incomeData.createdAt).toLocaleDateString('uz-UZ')}
                            </Text>
                        </div>
                        <Divider />
                        {debtPaymentsModal.debtPayments.length > 0 ? (
                            <Table
                                dataSource={debtPaymentsModal.debtPayments}
                                columns={debtPaymentColumns}
                                pagination={false}
                                size="small"
                                className="nns-debt-payments-table"
                                rowKey="_id"
                            />
                        ) : (
                            <div className="nns-empty-state">
                                <Text>Hozircha qarz to'lovlari yo'q</Text>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default IncomeListModal;