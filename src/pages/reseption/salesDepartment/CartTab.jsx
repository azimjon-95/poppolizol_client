import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, FileText, Factory } from 'lucide-react';
import { Select } from 'antd';
import {
    useCreateCartSaleMutation,
    useGetCompanysQuery,
    useGetTransportQuery
} from '../../../context/cartSaleApi';
import { useGetSalesEmployeesQuery } from '../../../context/planSalesApi';
import { useGetFactoriesQuery } from '../../../context/clinicApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style/cart.css';

const { Option } = Select;

// Utility functions
const formatNumber = (num) => (num || num === 0 ? num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '');
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
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const { data: salesEmployees = { innerData: [] } } = useGetSalesEmployeesQuery();
    const { data: factories = { innerData: [] } } = useGetFactoriesQuery();
    const { data: customers = { innerData: [] } } = useGetCompanysQuery();
    const [createCartSale, { isLoading: isCreatingCartSale }] = useCreateCartSaleMutation();
    const { data: transport = { innerData: [] } } = useGetTransportQuery();

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
    const [middlemanPayment, setMiddlemanPayment] = useState(0);
    const [transportCost, setTransportCost] = useState(0);
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [isTransportDropdownOpen, setIsTransportDropdownOpen] = useState(false);

    // Customer information state
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        type: 'individual',
        companyAddress: '',
        transport: '',
        transportCost: 0,
    });

    // Memoized formatted values
    const formattedPhone = useMemo(() => formatPhone(rawPhone), [rawPhone]);
    const formattedAmount = useMemo(() => formatNumber(rawPaidAmount), [rawPaidAmount]);
    const formattedMiddlemanPayment = useMemo(() => formatNumber(middlemanPayment), [middlemanPayment]);
    const formattedTransportCost = useMemo(() => formatNumber(transportCost), [transportCost]);
    const customerTypeOptions = [
        { value: 'internal', label: 'Ichki Bozor' },
        { value: 'export', label: 'Eksport' },
        { value: 'exchange', label: 'Birja' },
    ];

    // Handle outside clicks to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                inputRef.current &&
                !inputRef.current.contains(event.target)
            ) {
                setIsTransportDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Check if workerId matches any sales employee
    useEffect(() => {
        const workerId = localStorage.getItem("workerId");
        if (salesEmployees?.innerData && workerId) {
            const matchedEmployee = salesEmployees.innerData.find(
                (employee) => employee._id === workerId
            );
            setSelectedEmployee(matchedEmployee || null);
            setIsEmployeeValid(!!matchedEmployee);
        } else {
            setSelectedEmployee(null);
            setIsEmployeeValid(false);
        }
    }, [salesEmployees]);

    // Handle employee selection
    const handleEmployeeSelect = useCallback(
        (value) => {
            const selected = salesEmployees.innerData.find((employee) => employee._id === value);
            if (selected) {
                setSelectedEmployee(selected);
                setIsEmployeeValid(true);
            }
        },
        [salesEmployees]
    );

    // Handle customer selection
    const handleCustomerSelect = useCallback(
        (value) => {
            if (value === 'new') {
                setIsNewCustomer(true);
                setSelectedCustomer(null);
                setCustomerInfo({
                    name: '',
                    type: 'individual',
                    companyAddress: '',
                    transport: '',
                    transportCost: 0,
                });
                setRawPhone('');
                setMiddlemanPayment(0);
                setTransportCost(0);
            } else {
                const selected = customers.innerData.find((customer) => customer._id === value);
                if (selected) {
                    setIsNewCustomer(false);
                    setSelectedCustomer(selected);
                    setCustomerInfo({
                        name: selected.name,
                        type: selected.type,
                        phone: selected.phone || '',
                        companyName: selected.companyName || '',
                        companyAddress: selected.companyAddress || '',
                        transport: '',
                        transportCost: 0,
                    });
                    setRawPhone(selected.phone?.replace(/\D/g, '') || '');
                    setMiddlemanPayment(0);
                    setTransportCost(0);
                }
            }
        },
        [customers]
    );

    // Handle customer info change
    const handleCustomerInfoChange = useCallback((key, value) => {
        setCustomerInfo((prev) => ({ ...prev, [key]: value }));
    }, []);

    // Handle transport selection
    const handleTransportSelect = useCallback((transport) => {
        setCustomerInfo((prev) => ({ ...prev, transport }));
        setIsTransportDropdownOpen(false);
    }, []);


    const [paymentInfo, setPaymentInfo] = useState({
        paidAmount: 0,
        discount: 0,
        paymentStatus: 'partial',
        paymentType: 'naqt',
        customerType: 'internal',
    });

    const [contractInfo, setContractInfo] = useState({
        customerType: 'individual',
        customerName: '',
        customerPhone: '',
        transport: '',
        transportCost: 0,
        paymentAmount: 0,
        paymentDescription: '',
        discounts: {},
        paymentType: 'naqt',
        middlemanPayment: 0,
    });

    const isFormValid = useMemo(() => {
        if (isNewCustomer) {
            return (
                customerInfo.name.trim() &&
                customerInfo.transport.trim() &&
                formattedPhone.trim()
            );
        }
        return selectedCustomer && customerInfo.transport.trim();
    }, [customerInfo, formattedPhone, selectedCustomer, isNewCustomer]);

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

    const handleContractPriceChange = useCallback((productId, value) => {
        const cleanedValue = value.replace(/[^0-9]/g, '');
        const newPrice = Math.max(Number(cleanedValue) || 0, 0);
        setContractInfo((prev) => ({
            ...prev,
            discounts: { ...prev.discounts, [productId]: newPrice },
        }));
    }, []);

    const handleDiscountReasonChange = useCallback((e) => {
        setDiscountReason(e.target.value);
    }, []);

    const handleMiddlemanPaymentChange = useCallback((e) => {
        const raw = e.target.value.replace(/\D/g, '');
        const numberValue = Number(raw) || 0;
        setMiddlemanPayment(numberValue);
        setContractInfo((prev) => ({ ...prev, middlemanPayment: numberValue }));
    }, []);

    const handleTransportCostChange = useCallback((e) => {
        const raw = e.target.value.replace(/\D/g, '');
        const numberValue = Number(raw) || 0;
        setTransportCost(numberValue);
        setCustomerInfo((prev) => ({ ...prev, transportCost: numberValue }));
        setContractInfo((prev) => ({ ...prev, transportCost: numberValue }));
    }, []);

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
            return (price * ndsRate) / (100 + ndsRate) * item.quantity;
        },
        [contractInfo.discounts, ndsRate]
    );

    const summaryData = useMemo(() => {
        const subtotal = cart.reduce(
            (sum, item) => sum + (contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0) * item.quantity,
            0
        );
        const totalNdsAmount = cart.reduce((sum, item) => sum + calculateItemNds(item), 0);
        const originalTotal = cart.reduce((sum, item) => sum + (item.sellingPrice ?? 0) * item.quantity, 0);
        const itemDiscountAmount = originalTotal - subtotal;
        const percentageDiscountAmount = (subtotal * (paymentInfo.discount || 0)) / 100;
        const totalAmount = subtotal - percentageDiscountAmount; // Total without NDS and transportCost
        const totalWithNdsAndTransport = totalAmount + totalNdsAmount + transportCost; // Total for display
        const debt = totalAmount - (rawPaidAmount || 0); // Debt without NDS and transportCost
        const totalDona = cart.reduce((sum, item) => (item.size === 'dona' ? sum + item.quantity : sum), 0);
        const totalKg = cart.reduce((sum, item) => (item.size === 'kg' ? sum + item.quantity : sum), 0);

        return {
            subtotal,
            totalNdsAmount: Math.round(totalNdsAmount * 100) / 100,
            itemDiscountAmount,
            percentageDiscountAmount,
            totalAmount, // Total without NDS and transportCost for server
            totalWithNdsAndTransport, // Total with NDS and transportCost for display
            debt,
            totalDona,
            totalKg,
        };
    }, [cart, paymentInfo, contractInfo.discounts, ndsRate, calculateItemNds, rawPaidAmount, transportCost]);

    const getProductIcon = useCallback(
        (category) =>
            category === 'Qop awl' ? (
                <FileText className="card-icon-sm" />
            ) : (
                <Factory className="card-icon-sm" />
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
            transport: customerInfo.transport,
            transportCost: transportCost,
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
            middlemanPayment,
        });
        setIsContractModalOpen(true);
        setIsTransportDropdownOpen(false);
    }, [customerInfo, cart, contractInfo.discounts, rawPaidAmount, paymentInfo, middlemanPayment, transportCost]);

    const completeContract = useCallback(async () => {
        if (!isEmployeeValid || !selectedEmployee) {
            toast.error('Sotuvchi tanlanmagan!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        if (!isNewCustomer && !selectedCustomer) {
            toast.error('Mijoz tanlang yoki yangi mijoz ma\'lumotlarini kiriting!', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (isNewCustomer && !customerInfo.name.trim()) {
            toast.error('Mijoz ismi kiritilishi shart!', { position: 'top-right', autoClose: 3000 });
            return;
        }

        if (!customerInfo.transport.trim()) {
            toast.error('Avtotransport ma\'lumotlari kiritilishi shart!', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        const total = summaryData.totalAmount; // Use totalAmount without NDS and transportCost
        if (rawPaidAmount > total) {
            toast.error("To'lov summasi yakuniy summadan oshib ketdi!", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        if (middlemanPayment > total) {
            toast.error("Urtakash Bonusi yakuniy summadan oshib ketdi!", {
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

        const debt = summaryData.debt; // Debt without NDS and transportCost
        const newSale = {
            customer: {
                name: customerInfo.name,
                type: customerInfo.type,
                phone: formattedPhone,
                companyName: customerInfo.companyName,
                companyAddress: customerInfo.companyAddress,
            },
            customerType: paymentInfo.customerType,
            transport: customerInfo.transport,
            transportCost: transportCost, // Send transportCost separately
            items: updatedCart.map((item) => ({
                ...item,
                pricePerUnit: contractInfo.discounts[item._id] ?? item.sellingPrice,
                ndsRate,
                ndsAmount: calculateItemNds(item) / item.quantity,
            })),
            payment: {
                totalAmount: summaryData.totalAmount, // Total without NDS and transportCost
                paidAmount: rawPaidAmount || 0,
                debt,
                ndsTotal: summaryData.totalNdsAmount, // NDS amount included separately
                status: debt <= 0 ? 'paid' : 'partial',
                paymentDescription: contractInfo.paymentDescription,
                discountReason: summaryData.itemDiscountAmount > 0 || paymentInfo.discount > 0 ? discountReason : '',
                paymentType: contractInfo.paymentType,
                middlemanPayment,
                transportCost, // Include transportCost separately
                paymentHistory: rawPaidAmount > 0
                    ? [{
                        amount: rawPaidAmount,
                        date: new Date(),
                        description: contractInfo.paymentDescription || 'Initial payment',
                        paidBy: selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}` : '',
                        paymentType: contractInfo.paymentType,
                    }]
                    : [],
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
            setCustomerInfo({ name: '', type: 'individual', companyAddress: '', transport: '', transportCost: 0 });
            setPaymentInfo({
                paidAmount: 0,
                discount: 0,
                paymentStatus: 'partial',
                paymentType: 'naqt',
                customerType: 'internal',
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
            setMiddlemanPayment(0);
            setTransportCost(0);
            localStorage.removeItem("workerId");
            localStorage.removeItem("admin_fullname");
        } catch (error) {
            toast.error(error.data?.message || 'Sotuvni saqlashda xatolik yuz berdi!', {
                position: 'top-right',
                autoClose: 3000,
            });
        }
    }, [
        contractInfo,
        cart,
        summaryData,
        ndsRate,
        calculateItemNds,
        onCompleteSale,
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
        createCartSale,
        middlemanPayment,
        transportCost,
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

    const toggleTransportDropdown = useCallback(() => {
        setIsTransportDropdownOpen((prev) => !prev);
    }, []);

    return (
        <div className="card-sales-container">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover />

            <div className="card-content-section">
                {cart?.length === 0 ? (
                    <div className="card-empty-state">
                        <ShoppingCart className="card-empty-icon" />
                        <p>Savat bo'sh</p>
                        <button onClick={() => navigate('/feedback')} className="card-qr-demo-btn">
                            Fikr Bildirish Sahifasini Ko'rish
                        </button>
                    </div>
                ) : (
                    <div className="card-cart-content">
                        <div className="card-cart-items">
                            {cart.map((item, index) => {
                                const basePrice = contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0;
                                const value = formatNumber(basePrice);
                                const inputWidth = getWidthByLength(value.replace(/\D/g, '').length);

                                return (
                                    <div key={`${item._id}-${index}`} className="card-cart-item">
                                        <div className="card-cart-item-info">
                                            <div className="card-cart-item-icon">{getProductIcon(item.category)}</div>
                                            <div>
                                                <h4 className="card-cart-item-name">{item.productName}</h4>
                                                <div className="card-cart-item-price">
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => handleContractPriceChange(item._id, e.target.value)}
                                                        className="card-price-input"
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
                                        <div className="card-cart-item-controls">
                                            <div className="card-quantity-box">
                                                <div className="card-quantity-controls">
                                                    <button
                                                        onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                                                        className="card-quantity-btn"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="card-icon-xs" />
                                                    </button>
                                                    <input
                                                        type="text"
                                                        value={item.quantity}
                                                        onChange={(e) => handleQuantityInput(item._id, e.target.value)}
                                                        className="card-quantity-input"
                                                        style={{ width: '60px', border: '1px solid #d9d9d9' }}
                                                        aria-label={`Quantity for ${item.productName}`}
                                                        placeholder="0"
                                                    />
                                                    <span className="card-quantity-unit">{item.size}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                                                        className="card-quantity-btn"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="card-icon-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="card-cart-item-total">{formatNumber(calculateItemTotal(item))} so'm</div>
                                            <button
                                                onClick={() => updateCartQuantity(item._id, 0)}
                                                className="card-remove-btn"
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
                        <div className="card-cart-info">
                            <div className="card-order-summary">
                                <div className="card-summary-row card-total">
                                    <span>Jami summa:</span>
                                    <span>{formatNumber(summaryData.subtotal)} so'm</span>
                                </div>
                                <div className="card-summary-row">
                                    <span>Jami NDS ({ndsRate}%):</span>
                                    <span>{formatNumber(Math.floor(summaryData.totalNdsAmount))} so'm</span>
                                </div>
                                {summaryData.itemDiscountAmount > 0 && (
                                    <div className="card-summary-row card-discount">
                                        <span>Mahsulot chegirmasi:</span>
                                        <span>-{formatNumber(summaryData.itemDiscountAmount)} so'm</span>
                                    </div>
                                )}
                                {paymentInfo.discount > 0 && (
                                    <div className="card-summary-row card-discount">
                                        <span>Chegirma ({paymentInfo.discount}%):</span>
                                        <span>-{formatNumber(summaryData.percentageDiscountAmount)} so'm</span>
                                    </div>
                                )}
                                {(summaryData.itemDiscountAmount > 0 || paymentInfo.discount > 0) && (
                                    <div className="card-summary-row-textarea">
                                        <span>Chegirma sababi:</span>
                                        <textarea
                                            value={discountReason}
                                            onChange={handleDiscountReasonChange}
                                            className="card-textarea"
                                            style={{ borderRadius: '8px', padding: '5px', width: '100%', minHeight: '60px', resize: 'vertical', border: '1px solid #d9d9d9' }}
                                            aria-label="Discount reason"
                                            placeholder="Chegirma sababini kiriting..."
                                        />
                                    </div>
                                )}
                                <div className="card-summary-row">
                                    <span>Mijoz turi:</span>
                                    <Select
                                        value={paymentInfo.customerType}
                                        onChange={(value) => setPaymentInfo((prev) => ({ ...prev, customerType: value }))}
                                        className="card-price-Select"
                                        style={{ width: '200px' }}
                                        aria-label="Customer type"
                                        placeholder="Tanlang..."
                                    >
                                        {customerTypeOptions.map((option) => (
                                            <Option key={option.value} value={option.value}>
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="card-summary-row">
                                    <span>Broker xizmati:</span>
                                    <span>
                                        <input
                                            type="text"
                                            value={formattedMiddlemanPayment}
                                            onChange={handleMiddlemanPaymentChange}
                                            className="card-price-input"
                                            style={{ width: '170px', textAlign: 'right', border: '1px solid #d9d9d9' }}
                                            aria-label="Middleman payment"
                                            placeholder="0"
                                        />
                                        so'm
                                    </span>
                                </div>

                                <div className={`card-summary-row ${summaryData.debt > 0 ? 'card-debt' : 'card-paid'}`}>
                                    <span>Qarz:</span>
                                    <span>{formatNumber(summaryData.debt)} so'm</span>
                                </div>
                                <div className="card-summary-row">
                                    <span>NDS Foizi (%):</span>
                                    <input
                                        type="text"
                                        value={ndsRate}
                                        onChange={handleNdsChange}
                                        className="card-price-input"
                                        style={{ width: '200px', textAlign: 'right', border: '1px solid #d9d9d9' }}
                                        aria-label="NDS rate"
                                        placeholder="NDS foizini kiriting"
                                    />
                                </div>
                                <div className="card-summary-row">
                                    <span>Mijoz tanlang:</span>
                                    <Select
                                        value={selectedCustomer?._id || (isNewCustomer ? 'new' : undefined)}
                                        onChange={handleCustomerSelect}
                                        className="card-price-Select"
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
                                        <div className="card-summary-row">
                                            <span>Mijoz turi:</span>
                                            <Select
                                                value={customerInfo.type}
                                                onChange={(value) => handleCustomerInfoChange('type', value)}
                                                className="card-price-Select"
                                                style={{ width: '200px', marginLeft: '10px' }}
                                                aria-label="Customer type"
                                            >
                                                <Option value="individual">Jismoniy shaxs</Option>
                                                <Option value="company">Yuridik shaxs</Option>
                                            </Select>
                                        </div>
                                        <div className="card-summary-row">
                                            <span>{customerInfo.type === 'company' ? 'Kompaniya nomi' : 'Mijoz ismi'}:</span>
                                            <input
                                                type="text"
                                                value={customerInfo.name}
                                                onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                                                className="card-price-input"
                                                style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                                aria-label="Customer name"
                                                placeholder={customerInfo.type === 'company' ? 'Nomini kiriting..' : 'Ismni kiriting...'}
                                            />
                                        </div>
                                        <div className="card-summary-row">
                                            <span>Telefon:</span>
                                            <input
                                                type="text"
                                                value={formattedPhone}
                                                onChange={handlePhoneChange}
                                                className="card-price-input"
                                                style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                                aria-label="Customer phone"
                                                placeholder="90 123 45 67"
                                            />
                                        </div>
                                        <div className="card-summary-row">
                                            <span>{customerInfo.type === 'company' ? 'Kompaniya manzili' : 'Mijoz manzili'}:</span>
                                            <input
                                                type="text"
                                                value={customerInfo.companyAddress}
                                                onChange={(e) => handleCustomerInfoChange('companyAddress', e.target.value)}
                                                className="card-price-input"
                                                style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                                aria-label="Company address"
                                                placeholder="Manzilni kiriting..."
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="card-summary-row relative">
                                    <span>Avtotransport:</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={customerInfo.transport}
                                        onChange={(e) => handleCustomerInfoChange('transport', e.target.value)}
                                        onClick={toggleTransportDropdown}
                                        className="card-price-input"
                                        style={{ width: '200px', marginLeft: '10px', border: '1px solid #d9d9d9' }}
                                        aria-label="Transport details"
                                        placeholder="50ZZ500Z Fura..."
                                    />
                                    {isTransportDropdownOpen && (
                                        <div ref={dropdownRef} className="isTransportDropdownOpen">
                                            {transport.innerData.map((item, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleTransportSelect(item.transport)}
                                                    className="card-transport-option"
                                                >
                                                    {item.transport}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="card-summary-row">
                                    <span>Transport harajati:</span>
                                    <span>
                                        <input
                                            type="text"
                                            value={formattedTransportCost}
                                            onChange={handleTransportCostChange}
                                            className="card-price-input"
                                            style={{ width: '170px', textAlign: 'right', border: '1px solid #d9d9d9' }}
                                            aria-label="Transport cost"
                                            placeholder="0"
                                        />
                                        so'm
                                    </span>
                                </div>
                                {!isEmployeeValid && (
                                    <div className="card-summary-row">
                                        <span>Sotuvchi tanlang:</span>
                                        <Select
                                            id="employeeSelect"
                                            onChange={handleEmployeeSelect}
                                            value={selectedEmployee?._id || undefined}
                                            className="card-price-Select"
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
                                        className="card-complete-sale-btn"
                                        disabled={!isFormValid || cart?.length === 0}
                                        aria-label="Open contract modal"
                                    >
                                        <FileText className="card-icon-sm" />
                                        Shartnoma tuzish
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isContractModalOpen && (
                <div className="card-modal">
                    <div className="card-print-section">
                        <button
                            onClick={completeContract}
                            className="card-modal-btn card-modal-btn-confirm"
                            aria-label="Confirm contract"
                            disabled={isCreatingCartSale}
                        >
                            Shartnomani tasdiqlash
                        </button>
                        <button
                            onClick={() => setIsContractModalOpen(false)}
                            className="card-modal-btn card-modal-btn-cancel"
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

