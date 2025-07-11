import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ShoppingCart, Minus, Plus, FileText, Factory } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { Select } from 'antd';
import {
    useCreateCartSaleMutation,
    useGetCompanysQuery,
} from '../../../context/cartSaleApi';
import { useGetSalesEmployeesQuery } from '../../../context/planSalesApi';
import { useGetFactoriesQuery } from '../../../context/clinicApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const { Option } = Select;

// Utility function to format numbers with commas (e.g., 1,000,000)
const formatNumber = (num) => {
    if (!num && num !== 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Utility function to format phone numbers (e.g., 90 123 45 67)
const formatPhone = (raw) => {
    const cleaned = raw.replace(/\D/g, '').slice(0, 9);
    return cleaned.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
};

const getWidthByLength = (length) => {
    if (length <= 4) return 50;
    if (length <= 5) return 60;
    return 70;
};

const CartTab = ({ cart = [], setCart, setActiveTab, onUpdateCart, onRemoveFromCart, onCompleteSale }) => {
    const contentRef = useRef();
    const navigate = useNavigate();
    const { data: salesEmployees = { innerData: [] } } = useGetSalesEmployeesQuery();
    const { data: factories = { innerData: [] } } = useGetFactoriesQuery();
    const { data: customers = { innerData: [] } } = useGetCompanysQuery();
    console.log(customers);
    const [createCartSale, { isLoading: isCreatingCartSale }] = useCreateCartSaleMutation();
    const initialNdsRate = factories?.innerData?.[0]?.nds || 12;
    const [ndsRate, setNdsRate] = useState(initialNdsRate);
    const [discountReason, setDiscountReason] = useState(
        "Mijoz talabiga ko‘ra, uni yo‘qotmaslik uchun chegirma berildi"
    );
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isEmployeeValid, setIsEmployeeValid] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [rawPhone, setRawPhone] = useState('');
    const [rawPaidAmount, setRawPaidAmount] = useState(0);

    // Customer information state
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        type: 'individual',
        companyAddress: '',
    });

    // Memoized formatted values
    const formattedPhone = useMemo(() => formatPhone(rawPhone), [rawPhone]);
    const formattedAmount = useMemo(() => formatNumber(rawPaidAmount), [rawPaidAmount]);

    // Check if workerId matches any sales employee
    useEffect(() => {
        const workerId = localStorage.getItem("workerId");
        if (salesEmployees?.innerData && workerId) {
            const matchedEmployee = salesEmployees.innerData.find(
                (employee) => employee._id === workerId
            );
            if (matchedEmployee) {
                setIsEmployeeValid(true);
                setSelectedEmployee(matchedEmployee);
            } else {
                setIsEmployeeValid(false);
                setSelectedEmployee(null);
            }
        } else {
            setIsEmployeeValid(false);
            setSelectedEmployee(null);
        }
    }, [salesEmployees]);

    // Handle employee selection
    const handleEmployeeSelect = useCallback((value) => {
        const selected = salesEmployees.innerData.find(
            (employee) => employee._id === value
        );
        if (selected) {
            setSelectedEmployee(selected);
            setIsEmployeeValid(true);
        }
    }, [salesEmployees]);

    // Handle customer selection
    const handleCustomerSelect = useCallback((value) => {
        if (value === 'new') {
            setIsNewCustomer(true);
            setSelectedCustomer(null);
            setCustomerInfo({
                name: '',
                type: 'individual',
                companyAddress: '',
            });
            setRawPhone('');
        } else {
            const selected = customers.innerData.find(
                (customer) => customer._id === value
            );
            if (selected) {
                setIsNewCustomer(false);
                setSelectedCustomer(selected);
                setCustomerInfo({
                    name: selected.name,
                    type: selected.type,
                    phone: selected.phone || '',
                    companyName: selected.companyName || '',
                    companyAddress: selected.companyAddress || '',
                });
                setRawPhone(selected.phone?.replace(/\D/g, '') || '');
            }
        }
    }, [customers]);

    // Handle customer info change
    const handleCustomerInfoChange = useCallback((key, value) => {
        setCustomerInfo((prev) => ({ ...prev, [key]: value }));
    }, []);

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
            }`,
        onPrintError: () => {
            toast.error('Chop etishda xatolik yuz berdi. Iltimos, qayta urining.', {
                position: 'top-right',
                autoClose: 3000,
            });
        },
    });

    const [paymentInfo, setPaymentInfo] = useState({
        totalAmount: 0,
        paidAmount: 0,
        discount: 0,
        paymentStatus: 'partial',
        paymentType: 'naqt',
    });

    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [contractInfo, setContractInfo] = useState({
        customerType: 'individual',
        customerName: '',
        customerPhone: '',
        transport: '',
        paymentAmount: 0,
        paymentDescription: '',
        discounts: {},
        paymentType: 'naqt',
    });

    const [formInputs, setFormInputs] = useState([
        { key: 'transport', value: '', label: 'Avtotransport', placeholder: 'yozing...', ariaLabel: 'Transport details' },
    ]);

    const isFormValid = useMemo(() => {
        if (isNewCustomer) {
            return customerInfo.name.trim() !== '' && formInputs.every(input => input.value.trim() !== '');
        }
        return selectedCustomer && formInputs.every(input => input.value.trim() !== '');
    }, [customerInfo, formInputs, selectedCustomer, isNewCustomer]);

    const handleNdsChange = useCallback((e) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setNdsRate(Math.max(Number(value) || 0, 0));
    }, []);

    const updateCartQuantity = useCallback(
        (productId, newQuantity) => {
            const quantity = Math.max(Number(newQuantity) || 0, 0);
            if (quantity <= 0) {
                setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
                onRemoveFromCart?.(productId);
            } else {
                setCart((prevCart) =>
                    prevCart.map((item) =>
                        item._id === productId ? { ...item, quantity } : item
                    )
                );
                onUpdateCart?.(productId, quantity);
            }
        },
        [setCart, onUpdateCart, onRemoveFromCart]
    );

    const handleQuantityInput = useCallback(
        (productId, value) => {
            const cleanedValue = value.replace(/[^0-9]/g, '');
            updateCartQuantity(productId, cleanedValue);
        },
        [updateCartQuantity]
    );

    const handleContractPriceChange = useCallback(
        (productId, value) => {
            const cleanedValue = value.replace(/[^0-9]/g, '');
            const newPrice = Math.max(Number(cleanedValue) || 0, 0);
            setContractInfo((prev) => ({
                ...prev,
                discounts: { ...prev.discounts, [productId]: newPrice },
            }));
        },
        []
    );

    const handleDiscountReasonChange = useCallback((e) => {
        setDiscountReason(e.target.value);
    }, []);

    const handleInputChange = useCallback((key, value) => {
        setFormInputs(prev =>
            prev.map(input =>
                input.key === key ? { ...input, value } : input
            )
        );
    }, []);

    const calculateItemTotalNds = useCallback(
        (item) => {
            const price = contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0;
            const ndsAmount = price * (ndsRate / 100);
            return (price + ndsAmount) * item.quantity;
        },
        [contractInfo.discounts, ndsRate]
    );

    const calculateItemTotal = useCallback(
        (item) => {
            const price = contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0;
            return price * item.quantity;
        },
        [contractInfo.discounts]
    );

    const calculateItemNds = useCallback(
        (item) => {
            const price = contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0;
            return price * (ndsRate / 100) * item.quantity;
        },
        [contractInfo.discounts, ndsRate]
    );

    const summaryData = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + (contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0) * item.quantity, 0);
        const totalNdsAmount = cart.reduce((sum, item) => sum + calculateItemNds(item), 0);
        const originalTotal = cart.reduce((sum, item) => sum + (item.sellingPrice ?? 0) * item.quantity, 0);
        const itemDiscountAmount = originalTotal - subtotal;
        const percentageDiscountAmount = (subtotal * (paymentInfo.discount || 0)) / 100;
        const total = subtotal + totalNdsAmount - percentageDiscountAmount;
        const debt = total - (rawPaidAmount || 0);
        const totalDona = cart.reduce((sum, item) => (item.size === 'dona' ? sum + item.quantity : sum), 0);
        const totalKg = cart.reduce((sum, item) => (item.size === 'kg' ? sum + item.quantity : sum), 0);

        return {
            subtotal,
            totalNdsAmount,
            itemDiscountAmount,
            percentageDiscountAmount,
            total,
            debt,
            totalDona,
            totalKg,
        };
    }, [cart, paymentInfo, contractInfo.discounts, ndsRate, calculateItemNds, rawPaidAmount]);

    const getProductIcon = useCallback(
        (category) =>
            category === 'Qop' ? (
                <FileText className="sacod-icon-sm" />
            ) : (
                <Factory className="sacod-icon-sm" />
            ),
        []
    );

    const openContractModal = useCallback(() => {
        setContractInfo({
            customerType: customerInfo.type,
            customerName: customerInfo.name,
            customerPhone: formattedPhone,
            customerCompanyName: customerInfo.companyName,
            customerCompanyAddress: customerInfo.companyAddress,
            transport: formInputs.find(input => input.key === 'transport').value,
            paymentAmount: rawPaidAmount,
            paymentDescription: paymentInfo.paymentDescription || '',
            discounts: cart.reduce(
                (acc, item) => ({
                    ...acc,
                    [item._id]: contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0,
                }),
                {}
            ),
            paymentType: paymentInfo.paymentType,
        });
        setIsContractModalOpen(true);
    }, [customerInfo, cart, contractInfo.discounts, formInputs, rawPaidAmount, paymentInfo]);

    const completeContract = useCallback(async () => {
        if (!isEmployeeValid || !selectedEmployee) {
            toast.error("Iltimos, sotuvchi tanlang!", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (!isNewCustomer && !selectedCustomer) {
            toast.error("Iltimos, mijoz tanlang yoki yangi mijoz ma'lumotlarini kiriting!", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (isNewCustomer && !customerInfo.name.trim()) {
            toast.error("Mijoz ismi kiritilishi shart!", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        const total = summaryData.total;
        if (rawPaidAmount > total) {
            toast.error("To'lov summasi yakuniy summadan oshib ketdi!", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        const updatedCart = cart.map((item) => ({
            ...item,
            discountedPrice: contractInfo.discounts[item._id] ?? item.sellingPrice,
            ndsRate,
            ndsAmount: calculateItemNds(item) / item.quantity,
            productionDate: item.productionDate || new Date(),
        }));

        const debt = total - (rawPaidAmount || 0);
        const newSale = {
            customer: {
                name: customerInfo.name,
                type: customerInfo.type,
                phone: formattedPhone,
                companyName: customerInfo.companyName,
                companyAddress: customerInfo.companyAddress,
            },
            transport: contractInfo.transport,
            items: updatedCart.map((item) => ({
                ...item,
                pricePerUnit: contractInfo.discounts[item._id] ?? item.sellingPrice,
                ndsRate,
                ndsAmount: calculateItemNds(item) / item.quantity,
            })),
            payment: {
                totalAmount: total,
                paidAmount: rawPaidAmount || 0,
                debt,
                ndsTotal: summaryData.totalNdsAmount,
                status: debt <= 0 ? 'paid' : 'partial',
                paymentDescription: contractInfo.paymentDescription,
                discountReason: (summaryData.itemDiscountAmount > 0 || paymentInfo.discount > 0) ? discountReason : '',
                paymentType: contractInfo.paymentType,
                paymentHistory: rawPaidAmount > 0 ? [{
                    amount: rawPaidAmount,
                    date: new Date(),
                    description: contractInfo.paymentDescription || 'Initial payment',
                    paidBy: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : '',
                    paymentType: contractInfo.paymentType,
                }] : [],
            },
            salesperson: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : '',
            salerId: selectedEmployee?._id || '',
            isContract: true,
        };

        try {
            await createCartSale(newSale).unwrap();
            onCompleteSale?.(newSale);
            reactToPrintFn();
            toast.success('Shartnoma muvaffaqiyatli tuzildi va sotuv yakunlandi!', {
                position: 'top-right',
                autoClose: 3000,
            });
            setCustomerInfo({
                name: '',
                type: 'individual',
                companyAddress: '',
            });
            setPaymentInfo({
                totalAmount: 0,
                paidAmount: 0,
                discount: 0,
                paymentStatus: 'partial',
                paymentType: 'naqt',
            });
            setDiscountReason("Mijoz talabiga ko‘ra, uni yo‘qotmaslik uchun chegirma berildi");
            setIsContractModalOpen(false);
            setCart([]);
            setActiveTab('sales');
            setSelectedEmployee(null);
            setIsEmployeeValid(false);
            setSelectedCustomer(null);
            setIsNewCustomer(false);
            setRawPhone('');
            setRawPaidAmount(0);
            localStorage.removeItem("workerId");
            localStorage.removeItem("admin_fullname");
        } catch (error) {
            toast.error(error.data?.message || 'Sotuvni saqlashda xatolik yuz berdi!', {
                position: 'top-right',
                autoClose: 3000,
            });
            console.error('Error saving sale:', error);
        }
    }, [
        contractInfo,
        cart,
        summaryData.total,
        ndsRate,
        calculateItemNds,
        onCompleteSale,
        reactToPrintFn,
        setCart,
        setActiveTab,
        discountReason,
        isEmployeeValid,
        selectedEmployee,
        customerInfo,
        selectedCustomer,
        isNewCustomer,
        rawPaidAmount,
        formattedPhone,
    ]);

    const handlePhoneChange = useCallback((e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
        setRawPhone(raw);
        setCustomerInfo((prev) => ({ ...prev, phone: formatPhone(raw) }));
    }, []);

    const handleAmountChange = useCallback((e) => {
        const raw = e.target.value.replace(/\D/g, '');
        const numberValue = Number(raw) || 0;
        setRawPaidAmount(numberValue);
        setPaymentInfo((prev) => ({ ...prev, paidAmount: numberValue }));
    }, []);

    return (
        <div className="sacod-sales-container">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />

            <div className="sacod-content-section">
                {cart?.length === 0 ? (
                    <div className="sacod-empty-state">
                        <ShoppingCart className="sacod-empty-icon" />
                        <p>Savat bo'sh</p>
                        <button onClick={() => navigate('/feedback')} className="qr-demo-btn">
                            Fikr Bildirish Sahifasini Ko'rish
                        </button>
                    </div>
                ) : (
                    <div className="sacod-cart-content">
                        <div className="sacod-cart-items">
                            {cart.map((item, index) => {
                                const basePrice = contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0;
                                const value = formatNumber(basePrice);
                                const inputWidth = getWidthByLength(value.replace(/\D/g, '').length);

                                return (
                                    <div key={`${item._id}-${index}`} className="sacod-cart-item">
                                        <div className="sacod-cart-item-info">
                                            <div className="sacod-cart-item-icon">{getProductIcon(item.category)}</div>
                                            <div>
                                                <h4 className="sacod-cart-item-name">{item.productName}</h4>
                                                <div className="sacod-cart-item-price">
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => handleContractPriceChange(item._id, e.target.value)}
                                                        className="sacod-price-input"
                                                        style={{
                                                            width: `${inputWidth}px`,
                                                            textAlign: 'right',
                                                            transition: 'width 0.3s ease',
                                                            border: '1px solid #d9d9d9',
                                                        }}
                                                        aria-label={`Price for ${item.productName}`}
                                                    />
                                                    <span> so'm / {item.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="sacod-cart-item-controls">
                                            <div className="sacod-quantity-box">
                                                <div className="sacod-quantity-controls">
                                                    <button
                                                        onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                                                        className="sacod-quantity-btn"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="sacod-icon-xs" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityInput(item._id, e.target.value)}
                                                        className="sacod-quantity-input"
                                                        style={{ width: '60px', border: '1px solid #d9d9d9' }}
                                                        aria-label={`Quantity for ${item.productName}`}
                                                        placeholder="0"
                                                    />
                                                    <span className="sacod-quantity-unit">{item.size}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                                        className="sacod-quantity-btn"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="sacod-icon-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="sacod-cart-item-total">{formatNumber(calculateItemTotal(item))} so'm</div>
                                            <button
                                                onClick={() => updateCartQuantity(item._id, 0)}
                                                className="sacod-remove-btn"
                                                title="Mahsulotni o'chirish"
                                                aria-label={`Remove ${item.productName} from cart`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="sacod-cart-info">
                            <div className="sacod-order-summary">
                                <div className="sacod-summary-row">
                                    <span>Jami summa (NDSsiz):</span>
                                    <span>{formatNumber(summaryData.subtotal)} so'm</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>Jami NDS ({ndsRate}%):</span>
                                    <span>{formatNumber(summaryData.totalNdsAmount)} so'm</span>
                                </div>
                                {summaryData.itemDiscountAmount > 0 && (
                                    <div className="sacod-summary-row sacod-discount">
                                        <span>Mahsulot chegirmasi:</span>
                                        <span>-{formatNumber(summaryData.itemDiscountAmount)} so'm</span>
                                    </div>
                                )}
                                {paymentInfo.discount > 0 && (
                                    <div className="sacod-summary-row sacod-discount">
                                        <span>Chegirma ({paymentInfo.discount}%):</span>
                                        <span>-{formatNumber(summaryData.percentageDiscountAmount)} so'm</span>
                                    </div>
                                )}
                                {(summaryData.itemDiscountAmount > 0 || paymentInfo.discount > 0) && (
                                    <div className="sacod-summary-row-textarea">
                                        <span>Chegirma sababi:</span>
                                        <textarea
                                            value={discountReason}
                                            onChange={handleDiscountReasonChange}
                                            className="sacod-textarea"
                                            style={{ width: '100%', minHeight: '60px', resize: 'vertical', border: '1px solid #d9d9d9' }}
                                            aria-label="Discount reason"
                                            placeholder="Chegirma sababini kiriting..."
                                        />
                                    </div>
                                )}
                                <div className="sacod-summary-row sacod-total">
                                    <span>Yakuniy summa (NDS bilan):</span>
                                    <span>{formatNumber(summaryData.total)} so'm</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>To'langan:</span>
                                    <span>
                                        <input
                                            type="text"
                                            value={formattedAmount}
                                            onChange={handleAmountChange}
                                            className="sacod-price-input"
                                            style={{ width: '170px', textAlign: 'right', border: '1px solid #d9d9d9' }}
                                            aria-label="Paid amount"
                                            placeholder="0"
                                        />
                                        so'm</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>To'lov turi:</span>
                                    <Select
                                        value={paymentInfo.paymentType}
                                        onChange={(value) => setPaymentInfo((prev) => ({ ...prev, paymentType: value }))}
                                        className="sacod-price-Select"
                                        aria-label="Payment type"
                                    >
                                        <Option value="naqt">Naqt</Option>
                                        <Option value="bank">Bank</Option>
                                    </Select>
                                </div>
                                <div className={`sacod-summary-row ${summaryData.debt > 0 ? 'sacod-debt' : 'sacod-paid'}`}>
                                    <span>Qarz:</span>
                                    <span>{formatNumber(summaryData.debt)} so'm</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>NDS Foizi (%):</span>
                                    <input
                                        type="text"
                                        value={ndsRate}
                                        onChange={handleNdsChange}
                                        className="sacod-price-input"
                                        style={{ width: '200px', textAlign: 'right', border: '1px solid #d9d9d9' }}
                                        aria-label="NDS rate"
                                        placeholder="NDS foizini kiriting"
                                    />
                                </div>
                                <div className="sacod-summary-row">
                                    <span>Mijoz tanlang:</span>
                                    <Select
                                        value={selectedCustomer?._id || (isNewCustomer ? 'new' : undefined)}
                                        onChange={handleCustomerSelect}
                                        className="sacod-price-Select"
                                        style={{ width: '200px', margin: '10px 0' }}
                                        placeholder="Tanlang..."
                                        aria-label="Select customer"
                                    >
                                        {customers.innerData.map((customer) => (
                                            <Option key={customer._id} value={customer._id}>
                                                {customer.name}
                                            </Option>
                                        ))}
                                        <Option value="new">Yangi mijoz</Option>
                                    </Select>
                                </div>
                                {isNewCustomer && (
                                    <>
                                        <div className="sacod-summary-row">
                                            <span>Mijoz turi:</span>
                                            <Select
                                                value={customerInfo.type}
                                                onChange={(value) => handleCustomerInfoChange('type', value)}
                                                className="sacod-price-Select"
                                                style={{ width: '200px', marginLeft: '10px' }}
                                                aria-label="Customer type"
                                            >
                                                <Option value="individual">Jismoniy shaxs</Option>
                                                <Option value="company">Yuridik shaxs</Option>
                                            </Select>
                                        </div>
                                        <div className="sacod-summary-row">
                                            <span>{customerInfo.type === 'company' ? "Kompaniya nomi" : "Mijoz ismi"}:</span>
                                            <input
                                                type="text"
                                                value={customerInfo.name}
                                                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                                                className="sacod-price-input"
                                                style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                                aria-label="Customer name"
                                                placeholder={customerInfo.type === 'company' ? "Nomini kiriting.." : "Ismni kiriting..."}
                                            />
                                        </div>
                                        <div className="sacod-summary-row">
                                            <span>Telefon:</span>
                                            <input
                                                type="text"
                                                value={formattedPhone}
                                                onChange={handlePhoneChange}
                                                className="sacod-price-input"
                                                style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                                aria-label="Customer phone"
                                                placeholder="90 123 45 67"
                                            />
                                        </div>
                                        <div className="sacod-summary-row">
                                            <span>{customerInfo.type === 'company' ? "Kompaniya manzili:" : "Mijoz manzili:"}</span>
                                            <input
                                                type="text"
                                                value={customerInfo.companyAddress}
                                                onChange={(e) => handleCustomerInfoChange('companyAddress', e.target.value)}
                                                className="sacod-price-input"
                                                style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                                aria-label="Company address"
                                                placeholder="Manzilni kiriting..."
                                            />
                                        </div>
                                    </>
                                )}
                                {formInputs.map(input => (
                                    <div key={input.key} className="sacod-summary-row">
                                        <span>{input.label}:</span>
                                        <input
                                            type="text"
                                            value={input.value}
                                            onChange={(e) => handleInputChange(input.key, e.target.value)}
                                            className="sacod-price-input"
                                            style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                            aria-label={input.ariaLabel}
                                            placeholder={input.placeholder}
                                        />
                                    </div>
                                ))}
                                {!isEmployeeValid && salesEmployees?.innerData?.length > 0 && (
                                    <div className="sacod-summary-row">
                                        <span>Sotuvchi tanlang:</span>
                                        <Select
                                            id="employeeSelect"
                                            onChange={handleEmployeeSelect}
                                            value={selectedEmployee?._id || undefined}
                                            className="sacod-price-Select"
                                            style={{ width: '200px', margin: '10px 0' }}
                                            placeholder="Tanlang..."
                                            aria-label="Select salesperson"
                                        >
                                            {salesEmployees.innerData.map((employee) => (
                                                <Option key={employee._id} value={employee._id}>
                                                    {employee.firstName} {employee.lastName}
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                )}
                                {isEmployeeValid && (
                                    <button
                                        onClick={openContractModal}
                                        className="sacod-complete-sale-btn"
                                        disabled={!isFormValid || cart?.length === 0}
                                        aria-label="Open contract modal"
                                    >
                                        <FileText className="sacod-icon-sm" />
                                        Shartnoma tuzish
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isContractModalOpen && (
                <div className="sacod-modal">
                    <div ref={contentRef} className="doc-wrapper">
                        <h2 className="doc-title">YUK XATLAMASI №565</h2>
                        <p className="doc-date">1 Iyul 2025 yil</p>
                        <div className="doc-info">
                            <p>
                                <strong>Yuboruvchi:</strong> "SELEN BUNYODKOR" MCHJ
                            </p>
                            <p>
                                <strong>Manzil:</strong> Namangan viloyati, Pop tumani, Gilkor MFY, Istiqbol
                            </p>
                            <p>
                                <strong>Mijoz:</strong> {contractInfo.customerName}
                            </p>
                            <p>
                                <strong>Avtotransport:</strong> {contractInfo.transport}
                            </p>
                            {contractInfo.customerPhone && (
                                <p>
                                    <strong>Telefon:</strong> {contractInfo.customerPhone}
                                </p>
                            )}
                            {contractInfo.customerType === 'company' && (
                                <>
                                    <p>
                                        <strong>Kompaniya manzili:</strong> {contractInfo.customerCompanyAddress}
                                    </p>
                                </>
                            )}
                        </div>
                        <table className="doc-table">
                            <thead>
                                <tr>
                                    <th>№</th>
                                    <th>Mahsulot nomi</th>
                                    <th>Miqdori</th>
                                    <th>O‘lchov</th>
                                    <th>Narxi</th>
                                    <th>Qiymat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.map((item, index) => {
                                    const basePrice = contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0;
                                    const ndsAmount = basePrice * (ndsRate / 100);
                                    const priceWithNds = basePrice + ndsAmount;
                                    return (
                                        <tr key={`${item._id}-${index}`}>
                                            <td>{index + 1}</td>
                                            <td>{item.productName}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.size}</td>
                                            <td>{formatNumber(basePrice)}</td>
                                            <td>{formatNumber(calculateItemTotalNds(item))}</td>
                                        </tr>
                                    );
                                })}
                                <tr className="doc-total">
                                    <td colSpan="5">Jami:</td>
                                    <td>{formatNumber(summaryData.total)}</td>
                                </tr>
                            </tbody>
                        </table>
                        {(summaryData.itemDiscountAmount > 0 || paymentInfo.discount > 0) && (
                            <div className="doc-discount-reason">
                                <p><strong>Chegirma sababi:</strong></p>
                                <p>{discountReason}</p>
                            </div>
                        )}
                        <p className="doc-contact">
                            Biz bilan ishlaganingizdan minnatdormiz! Taklif va shikoyatlar uchun QR kodni skanerlang yoki quyidagi
                            raqamlarga qo'ng'iroq qiling: +998 94 184 10 00, +998 33 184 10 00
                        </p>
                        <div className="doc-sign">
                            <div>
                                <strong>Berdi:</strong> _____________________
                            </div>
                            <div className="doc-qr">
                                <QRCodeCanvas value={window.location.origin + '/feedback'} size={100} />
                            </div>
                            <div>
                                <strong>Oldim:</strong> _____________________
                            </div>
                        </div>
                    </div>
                    <div className="print-section">
                        <button
                            onClick={completeContract}
                            className="sacod-modal-btn sacod-modal-btn-confirm"
                            aria-label="Confirm contract"
                            disabled={isCreatingCartSale}
                        >
                            Shartnomani tasdiqlash
                        </button>
                        <button
                            onClick={() => setIsContractModalOpen(false)}
                            className="sacod-modal-btn sacod-modal-btn-cancel"
                            aria-label="Cancel contract"
                        >
                            Bekor qilish
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartTab;
