import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Package, Truck, CreditCard, User, Calendar, Clock, CheckCircle2, XCircle,
    Receipt, Banknote, Plus, RotateCcw, Edit, Trash2, RefreshCw, MoreHorizontal
} from 'lucide-react';
import { NumberFormat } from '../../../hook/NumberFormat';
import {
    useGetFilteredSalesQuery,
    usePayDebtMutation,
    useUpdateCartSaleMutation,
    useDeleteCartSaleMutation,
    useReturnProductsMutation
} from '../../../context/cartSaleApi';
import { setFilteredSalesLength } from '../../../context/actions/lengthSlice';
import { useDispatch } from 'react-redux';
import { Button, Input, Popover, Select } from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomModal from './salesPerson/CustomEditModal';
import './style/style.css';

const { Option } = Select;

const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="invoice-modal-backdrop">
            <div className="invoice-modal-content">
                <div className="invoice-modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="invoice-modal-close">×</button>
                </div>
                <div className="invoice-modal-body">{children}</div>
                {footer && <div className="invoice-modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

const SalesInvoiceDashboard = () => {
    const dispatch = useDispatch();
    const [payDebt] = usePayDebtMutation();
    const [updateCartSale] = useUpdateCartSaleMutation();
    const [deleteCartSale] = useDeleteCartSaleMutation();
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentType, setPaymentType] = useState('naqt');
    const [paymentDescription, setPaymentDescription] = useState('');
    const [returnReason, setReturnReason] = useState('');
    const [modalState, setModalState] = useState({
        isPaymentModalOpen: false,
        isItemsModalOpen: false,
        isReturnModalOpen: false,
        isEditModalOpen: false,
        isDeleteModalOpen: false,
        activeSaleId: null,
    });
    const [returnProducts] = useReturnProductsMutation();
    const [returnItems, setReturnItems] = useState([]);
    const [refundAmount, setRefundAmount] = useState('');
    const [editSaleData, setEditSaleData] = useState({});
    const [selectedSalesperson, setSelectedSalesperson] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const date = new Date();
        return `${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    });

    const { data: filteredSales, refetch, isLoading, isError } = useGetFilteredSalesQuery(selectedMonth, {
        skip: !selectedMonth,
    });

    const [salesData, setSalesData] = useState([]);

    useEffect(() => {
        if (filteredSales?.innerData) {
            const timer = setTimeout(() => {
                setSalesData(filteredSales.innerData);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [filteredSales]);

    useEffect(() => {
        if (selectedMonth) {
            refetch();
        }
    }, [selectedMonth, refetch]);

    const salespeople = useMemo(() => {
        const uniqueSalespeople = [...new Set(salesData?.map(sale => sale.salesperson))];
        return ['all', ...uniqueSalespeople];
    }, [salesData]);

    const currentSale = useMemo(() => {
        return salesData.find(s => s._id === modalState.activeSaleId) || null;
    }, [salesData, modalState.activeSaleId]);

    const processPayment = useCallback(async (saleId) => {
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            toast.error("Iltimos, to'g'ri to'lov miqdorini kiriting");
            return;
        }

        const sale = salesData.find(s => s._id === saleId);
        if (!sale) {
            toast.error("Sotuv topilmadi!");
            return;
        }
        if (amount > sale.payment?.debt) {
            toast.error("To'lov miqdori qarzdan oshib ketdi!");
            return;
        }

        const paymentData = {
            amount,
            paymentType,
            description: paymentDescription || "Qarz to‘lovi mijoz tomonidan qaytarildi",
        };
        try {
            await payDebt({ id: saleId, body: paymentData }).unwrap();
            setSalesData(prev =>
                prev.map(sale => {
                    if (sale._id === saleId) {
                        const newPaidAmount = sale.payment.paidAmount + amount;
                        const newDebt = sale.payment.totalAmount - newPaidAmount;
                        const newStatus = newDebt <= 0 ? 'paid' : 'partial';
                        return {
                            ...sale,
                            payment: {
                                ...sale.payment,
                                paidAmount: newPaidAmount,
                                debt: Math.max(0, newDebt),
                                status: newStatus,
                                paymentHistory: [
                                    ...sale.payment.paymentHistory,
                                    {
                                        amount,
                                        date: new Date().toISOString(),
                                        description: paymentData.description,
                                        paidBy: sale.salesperson,
                                        paymentType,
                                    },
                                ],
                            },
                        };
                    }
                    return sale;
                })
            );
            toast.success("To'lov muvaffaqiyatli amalga oshirildi!");
        } catch (error) {
            toast.error("To'lov amalga oshirishda xatolik yuz berdi.");
        }

        setPaymentAmount('');
        setPaymentDescription('');
        setModalState(prev => ({ ...prev, isPaymentModalOpen: false, activeSaleId: null }));
    }, [paymentAmount, paymentDescription, paymentType, payDebt, salesData]);


    const processUpdateSale = async (saleId) => {
        try {
            await updateCartSale({ id: saleId, body: editSaleData }).unwrap();
            toast.success("Sotuv muvaffaqiyatli yangilandi!");
            refetch();
            closeModal();
        } catch (error) {
            toast.error("Sotuvni yangilashda xatolik yuz berdi.");
            console.error(error);
        }
    };


    const processDeleteSale = useCallback((saleId) => {
        setModalState(prev => ({ ...prev, isDeleteModalOpen: true, activeSaleId: saleId }));
    }, []);

    const confirmDeleteSale = useCallback(async (saleId) => {
        try {
            await deleteCartSale(saleId).unwrap();
            setSalesData(prev => prev.filter(sale => sale._id !== saleId));
            toast.success("Sotuv muvaffaqiyatli o‘chirildi!");
            closeModal();
        } catch (error) {
            toast.error("Sotuvni o‘chirishda xatolik yuz berdi.");
        }
    }, [deleteCartSale]);

    const processReturn = useCallback(async () => {
        const refund = parseFloat(refundAmount);
        const totalRefund = calculateTotalRefund();

        if (!refund || refund <= 0) {
            toast.error("Iltimos, to'g'ri qaytarish summasini kiriting");
            return;
        }
        if (!returnReason) {
            toast.error("Iltimos, qaytarish sababini kiriting");
            return;
        }
        if (refund > totalRefund) {
            toast.error("Qaytariladigan summa tan29langan mahsulotlar summasidan oshib ketdi!");
            return;
        }

        const returnData = {
            items: returnItems
                .filter(item => item.selected && item.returnQuantity > 0)
                .map(item => ({
                    productId: item._id,
                    productName: item.productName,
                    category: item.category,
                    quantity: item.returnQuantity,
                    discountedPrice: item.discountedPrice,
                    warehouseId: item.warehouseId,
                })),
            totalRefund: refund,
            reason: returnReason,
            paymentType: paymentType,
        };

        try {
            const updatedSale = await returnProducts({ id: modalState.activeSaleId, body: returnData }).unwrap();
            setSalesData(prev =>
                prev.map(sale => (sale._id === modalState.activeSaleId ? updatedSale : sale))
            );
            toast.success("Qaytarish muvaffaqiyatli amalga oshirildi!");
            closeModal();
        } catch (error) {
            toast.error("Qaytarishda xatolik yuz berdi.");
        }
    }, [refundAmount, returnReason, paymentType, returnItems, modalState.activeSaleId, payDebt]);

    const openPaymentModal = useCallback((saleId) => {
        const sale = salesData.find(s => s._id === saleId);
        if (!sale) {
            toast.error("Sotuv topilmadi!");
            return;
        }
        setModalState(prev => ({ ...prev, isPaymentModalOpen: true, activeSaleId: saleId }));
    }, [salesData]);

    const openItemsModal = useCallback((saleId) => {
        const sale = salesData.find(s => s._id === saleId);
        if (!sale) {
            toast.error("Sotuv topilmadi!");
            return;
        }
        setModalState(prev => ({ ...prev, isItemsModalOpen: true, activeSaleId: saleId }));
    }, [salesData]);

    const openEditModal = useCallback((saleId) => {
        const sale = salesData.find(s => s._id === saleId);
        if (!sale) {
            toast.error("Sotuv topilmadi!");
            return;
        }
        setEditSaleData(sale);
        setModalState(prev => ({ ...prev, isEditModalOpen: true, activeSaleId: saleId }));
    }, [salesData]);

    const openReturnModal = useCallback((saleId) => {
        const sale = salesData.find(s => s._id === saleId);
        if (!sale) {
            toast.error("Sotuv topilmadi!");
            return;
        }
        setReturnItems(sale.items.map(item => ({
            ...item,
            returnQuantity: 0,
            selected: false,
        })));
        setRefundAmount('');
        setReturnReason('');
        setModalState(prev => ({ ...prev, isReturnModalOpen: true, activeSaleId: saleId }));
    }, [salesData]);

    const closeModal = useCallback(() => {
        setModalState({
            isPaymentModalOpen: false,
            isItemsModalOpen: false,
            isReturnModalOpen: false,
            isEditModalOpen: false,
            isDeleteModalOpen: false,
            activeSaleId: null,
        });
        setPaymentAmount('');
        setPaymentDescription('');
        setReturnItems([]);
        setRefundAmount('');
        setReturnReason('');
        setEditSaleData({});
    }, []);

    const handleReturnItemChange = useCallback((index, field, value) => {
        setReturnItems(prev => prev.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'selected' && !value) {
                    updatedItem.returnQuantity = 0;
                }
                return updatedItem;
            }
            return item;
        }));
    }, []);

    const calculateTotalRefund = useCallback(() => {
        return returnItems.reduce((total, item) => {
            if (item.selected && item.returnQuantity > 0) {
                return total + (item.returnQuantity * item.discountedPrice);
            }
            return total;
        }, 0);
    }, [returnItems]);

    const getTotalSales = useCallback(() => salesData.reduce((total, sale) => total + sale.payment?.totalAmount, 0), [salesData]);
    const getTotalDebt = useCallback(() => salesData.reduce((total, sale) => total + sale.payment?.debt, 0), [salesData]);

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

    const formatNumber = (value) => {
        if (!value && value !== 0) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const parseNumber = (value) => {
        if (!value) return 0;
        return parseInt(value.replace(/\./g, ''), 10);
    };

    const renderPopoverContent = (saleId) => (
        <div style={{ display: 'flex', alignItems: 'start', flexDirection: 'column', gap: '8px' }} className="renderPopover">
            <Button
                type="text"
                icon={<Edit size={16} />}
                onClick={() => openEditModal(saleId)}
            >
                Tahrirlash
            </Button>
            <Button
                type="text"
                icon={<Trash2 size={16} />}
                onClick={() => processDeleteSale(saleId)}
            >
                O‘chirish
            </Button>
            <Button
                type="text"
                icon={<RotateCcw size={16} />}
                onClick={() => openReturnModal(saleId)}
            >
                Vazvirat
            </Button>
        </div>
    );

    useEffect(() => {
        if (salesData) {
            dispatch(setFilteredSalesLength(salesData?.length));
        }
    }, [salesData]);

    return (
        <div className="invoice-dashboard">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="invoice-header">
                <div className="invoice-header-logo">
                    <h1 className="invoice-header-title">
                        <Receipt />
                        Savdo Hisob-fakturalari
                    </h1>
                    <div className="invoice-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="invoice-filter-group">
                            <Select
                                id="salesperson-filter"
                                style={{ width: 200 }}
                                value={selectedSalesperson}
                                onChange={setSelectedSalesperson}
                            >
                                {salespeople.map((person, index) => (
                                    <Option key={index} value={person}>
                                        {person === 'all' ? 'Barchasi' : person}
                                    </Option>
                                ))}
                            </Select>
                        </div>
                        <div className="invoice-filter-group">
                            <Input
                                id="month-filter"
                                style={{ width: 75 }}
                                value={selectedMonth}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="MM.YYYY"
                                maxLength={7}
                            />
                        </div>
                    </div>
                </div>
                <div className="invoice-stats-grid">
                    <div className="invoice-stat-card">
                        <div className="invoice-stat-value">{salesData.length}</div>
                        <div className="invoice-stat-label">Jami Savdolar</div>
                    </div>
                    <div className="invoice-stat-card">
                        <div className="invoice-stat-value">{NumberFormat(getTotalSales())}</div>
                        <div className="invoice-stat-label">Jami Summa</div>
                    </div>
                    <div className="invoice-stat-card">
                        <div className="invoice-stat-value">{NumberFormat(getTotalDebt())}</div>
                        <div className="invoice-stat-label">Jami Qarz</div>
                    </div>
                    <div className="invoice-stat-card">
                        <div className="invoice-stat-value">{salesData.filter(s => s.payment?.status === 'paid').length}</div>
                        <div className="invoice-stat-label">To'langan</div>
                    </div>
                </div>
            </div>

            <div className="invoice-table-container">
                {
                    salesData.length === 0 ? (
                        <div className="sdash-loading-wrapper">
                            <RefreshCw className="sdash-loading-icon animate-spin" />
                            <p>Ma'lumotlar yuklanmoqda...</p>
                        </div>
                    ) : (
                        <>
                            <table className="invoice-table">
                                <thead>
                                    <tr>
                                        <th>Sana/Vaqt</th>
                                        <th>Sotuvchi</th>
                                        <th>Mijoz</th>
                                        <th>Transport</th>
                                        <th>Mahsulotlar</th>
                                        <th>Jami Summa</th>
                                        <th>To'lov</th>
                                        <th>To'lov holat</th>
                                        <th>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.map((sale, inx) => (
                                        <tr key={inx}>
                                            <td>
                                                <div className="invoice-card">
                                                    <div className="invoice-card-header">
                                                        <Calendar size={16} />
                                                        {new Date(sale.date).toLocaleDateString('uz-UZ')}
                                                    </div>
                                                    <div className="invoice-card-content">
                                                        <Clock size={16} className="invoice-icon" />
                                                        {sale.time}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="invoice-card">
                                                    <div className="invoice-card-header">
                                                        <User size={16} />
                                                        {sale?.salesperson}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="invoice-card">
                                                    <div className="invoice-card-header">
                                                        <User size={16} />
                                                        {sale?.customer?.name}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="invoice-card">
                                                    <div className="invoice-card-header">
                                                        <Truck size={16} />
                                                        {sale?.transport || 'Belgilanmagan'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ background: "dodgerblue", cursor: "pointer" }} className="invoice-card">
                                                    <div className="invoice-card-header invoice-items-preview" onClick={() => openItemsModal(sale._id)}>
                                                        <Package size={16} />
                                                        Mahsulotlar ({sale?.items?.length})
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="invoice-card">
                                                    <div className="invoice-card-header invoice-amount-display">
                                                        {NumberFormat(sale?.payment?.totalAmount)} so'm
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="invoice-card">
                                                    <div className="invoice-card-pay">
                                                        <div className="">
                                                            <div className="invoice-card-content">
                                                                <div className="invoice-amount-display">
                                                                    To'langan: {NumberFormat(sale?.payment?.paidAmount)} so'm
                                                                </div>
                                                            </div>
                                                            <div className="invoice-card-content">
                                                                <div className="invoice-debt-display">
                                                                    Qarz: {NumberFormat(sale?.payment?.debt)} so'm
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {sale.payment?.debt > 0 && (
                                                            <button
                                                                className="invoice-btn invoice-btn-primary"
                                                                onClick={() => openPaymentModal(sale._id)}
                                                            >
                                                                <Plus size={16} />
                                                                To'lash
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`invoice-badge ${sale.payment?.status}`}>
                                                    {sale.payment?.status === 'paid' ? (
                                                        <>
                                                            <CheckCircle2 size={16} />
                                                            To'langan
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle size={16} />
                                                            Qisman
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td>
                                                <Popover
                                                    content={renderPopoverContent(sale._id)}
                                                    title="Amallar"
                                                    trigger="click"
                                                    placement="left"
                                                >
                                                    <Button className='Popoverinrowbtn' type="text" icon={<MoreHorizontal size={19} />} />
                                                </Popover>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )
                }
            </div>

            <Modal
                isOpen={modalState.isItemsModalOpen}
                onClose={closeModal}
                title="Mahsulotlar ro'yxati"
            >
                <div className="invoice-items-grid">
                    {currentSale?.items?.map((item, index) => (
                        <div key={index} className="invoice-item-card">
                            <div className="invoice-item-header">
                                {item.productName} ({item.category})
                            </div>
                            <div className="invoice-item-details">
                                <div>Miqdor: {item.quantity.toLocaleString()} {item.size || 'dona'}</div>
                                <div>Narx: {NumberFormat(item.discountedPrice)}</div>
                                <div>QQS: {item.ndsRate}%</div>
                                <div>QQS summa: {NumberFormat(item.ndsAmount)}</div>
                            </div>
                            <div className="invoice-item-total">
                                Jami: {NumberFormat(item?.quantity * item?.discountedPrice)}
                            </div>
                        </div>
                    )) || <p>Mahsulotlar topilmadi</p>}
                </div>
            </Modal>

            <Modal
                isOpen={modalState.isPaymentModalOpen}
                onClose={closeModal}
                title="To'lov amalga oshirish"
            >
                {currentSale ? (
                    <div className="invoice-payment-form">
                        <input
                            className="invoice-form-input"
                            type="text"
                            placeholder="To'lov miqdor"
                            value={formatNumber(paymentAmount)}
                            onChange={(e) => {
                                const rawValue = parseNumber(e.target.value);
                                if (!isNaN(rawValue)) {
                                    setPaymentAmount(rawValue);
                                }
                            }}
                            min="0"
                            max={currentSale.payment?.debt || 0}
                        />
                        <Select
                            className="invoice-form-select"
                            value={paymentType}
                            onChange={setPaymentType}
                            style={{ width: '100%' }}
                        >
                            <Option value="naqt">Naqt pul</Option>
                            <Option value="bank">Bank o'tkazmasi</Option>
                        </Select>
                        <input
                            className="invoice-form-input"
                            type="text"
                            placeholder="Izoh (ixtiyoriy)"
                            value={paymentDescription}
                            onChange={(e) => setPaymentDescription(e.target.value)}
                        />
                        <button
                            className="invoice-btn invoice-btn-success"
                            onClick={() => processPayment(modalState.activeSaleId)}
                            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || !currentSale}
                        >
                            <Banknote size={16} />
                            To'lovni amalga oshirish
                        </button>
                    </div>
                ) : (
                    <p>Sotuv topilmadi. Iltimos, qayta urinib ko'ring.</p>
                )}
            </Modal>

            <Modal
                isOpen={modalState.isReturnModalOpen}
                onClose={closeModal}
                title="Mahsulotni qaytarish"
            >
                <div className="invoice-return-form">
                    <h4>Tanlangan mahsulotlar:</h4>
                    {returnItems.map((item, index) => (
                        <div key={index} className="invoice-return-item">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={item.selected}
                                    onChange={(e) => handleReturnItemChange(index, 'selected', e.target.checked)}
                                />
                                {item.productName} ({item.category})
                            </label>
                            {item.selected && (
                                <input
                                    type="number"
                                    min="1"
                                    max={item.quantity}
                                    value={item.returnQuantity || ''}
                                    placeholder={`Soni: ${item.quantity}`}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleReturnItemChange(index, 'returnQuantity', value === '' ? '' : Math.min(parseInt(value) || 1, item.quantity));
                                    }}
                                />
                            )}
                            <div>Jami: {NumberFormat((item.returnQuantity || 0) * item.discountedPrice)}</div>
                        </div>
                    ))}
                    <input
                        className="invoice-form-input"
                        type="text"
                        placeholder="Qaytarish sababi"
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                    />
                    <Select
                        className="invoice-form-select"
                        value={paymentType}
                        onChange={setPaymentType}
                        style={{ width: '100%' }}
                    >
                        <Option value="naqt">Naqt pul</Option>
                        <Option value="bank">Bank o'tkazmasi</Option>
                    </Select>
                    <input
                        className="invoice-form-input"
                        type="number"
                        value={refundAmount}
                        onChange={(e) => {
                            const value = e.target.value;
                            setRefundAmount(value === '' ? '' : Math.max(parseFloat(value) || 0, 0));
                        }}
                        min="0"
                        placeholder={`Qaytariladigan summa ${NumberFormat(refundAmount || calculateTotalRefund())}`}
                    />
                    <div>Jami qaytarish summasi: {NumberFormat(refundAmount || calculateTotalRefund())}</div>
                    <button
                        className="invoice-btn invoice-btn-success"
                        onClick={() => processReturn()}
                        disabled={!refundAmount || parseFloat(refundAmount) <= 0 || !returnReason || (refundAmount === '' && calculateTotalRefund() === 0)}
                    >
                        <RotateCcw size={16} />
                        Qaytarishni tasdiqlash
                    </button>
                </div>
            </Modal>

            <CustomModal
                isOpen={modalState.isEditModalOpen}
                onClose={closeModal}
                title="Sotuvni tahrirlash"
                editSaleData={editSaleData}
                setEditSaleData={setEditSaleData}
                modalState={modalState}
                processUpdateSale={processUpdateSale}
                formatNumber={formatNumber}
                parseNumber={parseNumber}
                NumberFormat={NumberFormat}
            />

            <Modal
                isOpen={modalState.isDeleteModalOpen}
                onClose={closeModal}
                title="Sotuvni o‘chirish"
                footer={
                    <div className="invoice-modal-footer-buttons">
                        <button
                            className="invoice-btn invoice-btn-danger"
                            onClick={() => confirmDeleteSale(modalState.activeSaleId)}
                        >
                            <Trash2 size={16} />
                            O‘chirish
                        </button>
                        <button
                            className="invoice-btn invoice-btn-secondary"
                            onClick={closeModal}
                        >
                            Bekor qilish
                        </button>
                    </div>
                }
            >
                <p>Sotuvni o‘chirishni tasdiqlaysizmi? Bu amalni bekor qilib bo‘lmaydi!</p>
            </Modal>
        </div>
    );
};

export default SalesInvoiceDashboard;


