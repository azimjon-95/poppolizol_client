import React, { useState, useCallback } from 'react';
import { ShoppingCart, Minus, Plus, FileText, Factory, Check, AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const CartTab = ({ cart: data, onUpdateCart, onRemoveFromCart, onCompleteSale }) => {
    const [cart, setCart] = useState(data);
    const [paymentInfo, setPaymentInfo] = useState({
        totalAmount: 0,
        paidAmount: 0,
        discount: 0,
        paymentStatus: 'partial',
    });
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        type: 'individual',
        phone: '',
        companyName: '',
        companyAddress: '',
        taxId: '',
    });
    const [salesperson] = useState('Azimjon Mamutaliyev');
    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [contractInfo, setContractInfo] = useState({
        customerType: 'individual',
        customerName: '',
        customerPhone: '',
        customerCompanyName: '',
        customerCompanyAddress: '',
        customerTaxId: '',
        paymentAmount: 0,
        paymentDescription: '',
        discounts: {},
    });


    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            setCart(cart.filter(item => item.id !== productId));
        } else {
            setCart(cart.map(item =>
                item.id === productId
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    // Optimized remove handler
    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId));
    };

    const calculateItemTotal = useCallback((item) => {
        if (item.type === 'coal_paper') {
            return (item.discountedPrice || item.pricePerUnit) * item.quantity;
        } else {
            return (item.discountedPrice || item.pricePerKg) * item.weightPerBag * item.quantity;
        }
    }, []);

    const calculateItemWeight = useCallback((item) => {
        if (item.type === 'betum') {
            return item.weightPerBag * item.quantity;
        }
        return 0;
    }, []);

    const calculatePoddonCount = useCallback((quantity) => {
        return Math.floor(quantity / 25);
    }, []);

    const calculateTotal = useCallback(() => {
        const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const discountAmount = (subtotal * paymentInfo.discount) / 100;
        return subtotal - discountAmount;
    }, [cart, paymentInfo.discount, calculateItemTotal]);


    const getProductIcon = useCallback((type) => {
        return type === 'betum' ? <Factory className="sacod-icon-sm" /> : <FileText className="sacod-icon-sm" />;
    }, []);

    const openContractModal = useCallback(() => {
        setContractInfo({
            customerType: customerInfo.type,
            customerName: customerInfo.name,
            customerPhone: customerInfo.phone,
            customerCompanyName: customerInfo.companyName,
            customerCompanyAddress: customerInfo.companyAddress,
            customerTaxId: customerInfo.taxId,
            paymentAmount: 0,
            paymentDescription: '',
            discounts: cart.reduce(
                (acc, item) => ({
                    ...acc,
                    [item.id]: item.discountedPrice || (item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg),
                }),
                {}
            ),
        });
        setIsContractModalOpen(true);
    }, [customerInfo, cart]);

    const handleContractDiscountChange = useCallback((productId, value) => {
        const product = cart.find((item) => item.id === productId);
        if (!product) return;

        const maxPrice = product.type === 'coal_paper' ? product.pricePerUnit : product.pricePerKg;
        const discountedPrice = Math.min(Number(value) || 0, maxPrice);

        setContractInfo(prev => ({
            ...prev,
            discounts: {
                ...prev.discounts,
                [productId]: discountedPrice,
            },
        }));
    }, [cart]);

    const completeContract = useCallback(async () => {
        // Validation
        if (!contractInfo.customerName || cart.length === 0) {
            toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        const total = calculateTotal();
        if (contractInfo.paymentAmount > total) {
            toast.error("To'lov summasi yakuniy summadan oshib ketdi!", {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        const updatedCart = cart.map((item) => ({
            ...item,
            discountedPrice: contractInfo.discounts[item.id],
        }));

        const debt = total - contractInfo.paymentAmount;
        const newSale = {
            id: Date.now(),
            date: new Date().toLocaleDateString('uz-UZ'),
            time: new Date().toLocaleTimeString('uz-UZ'),
            customer: {
                name: contractInfo.customerName,
                type: contractInfo.customerType,
                phone: contractInfo.customerPhone,
                companyName: contractInfo.customerCompanyName,
                companyAddress: contractInfo.customerCompanyAddress,
                taxId: contractInfo.customerTaxId,
            },
            items: updatedCart.map((item) => ({
                ...item,
                pricePerUnit: item.type === 'coal_paper' ? (item.discountedPrice || item.pricePerUnit) : undefined,
                pricePerKg: item.type === 'betum' ? (item.discountedPrice || item.pricePerKg) : undefined,
            })),
            payment: {
                totalAmount: total,
                paidAmount: contractInfo.paymentAmount,
                debt: debt,
                status: debt <= 0 ? 'paid' : 'partial',
                paymentDescription: contractInfo.paymentDescription,
            },
            salesperson,
            salespersonId: salesperson.id,
            totalWeight: updatedCart.reduce((sum, item) => sum + calculateItemWeight(item), 0),
            totalPoddons: updatedCart.reduce((sum, item) => (item.type === 'coal_paper' ? sum + calculatePoddonCount(item.quantity) : sum), 0),
            isContract: true,
        };

        // Send data to server
        try {
            console.log(newSale);

            // Uncomment when backend is ready
            // const response = await fetch('/api/sales', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(newSale),
            // });

            // if (!response.ok) {
            //     throw new Error('Failed to save sale');
            // }

            toast.success('Shartnoma muvaffaqiyatli tuzildi va sotuv yakunlandi!', {
                position: 'top-right',
                autoClose: 3000,
            });

            // Reset state
            setCustomerInfo({
                name: '',
                type: 'individual',
                phone: '',
                companyName: '',
                companyAddress: '',
                taxId: '',
            });
            setPaymentInfo({
                totalAmount: 0,
                paidAmount: 0,
                discount: 0,
                paymentStatus: 'partial',
            });
            setIsContractModalOpen(false);

            // Notify parent component to clear cart and update sales
            onCompleteSale(newSale);
        } catch (error) {
            toast.error('Sotuvni saqlashda xatolik yuz berdi!', {
                position: 'top-right',
                autoClose: 3000,
            });
            console.error('Error saving sale:', error);
        }
    }, [contractInfo, cart, calculateTotal, calculateItemWeight, calculatePoddonCount, salesperson, onCompleteSale]);

    // Memoized calculations for summary
    const summaryData = React.useMemo(() => {
        const totalWeight = cart.reduce((sum, item) => sum + calculateItemWeight(item), 0);
        const totalPoddons = cart.reduce(
            (sum, item) => (item.type === 'coal_paper' ? sum + calculatePoddonCount(item.quantity) : sum),
            0
        );
        const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const discountAmount = (subtotal * paymentInfo.discount) / 100;
        const total = subtotal - discountAmount;
        const debt = total - paymentInfo.paidAmount;

        return {
            totalWeight,
            totalPoddons,
            subtotal,
            discountAmount,
            total,
            debt,
        };
    }, [cart, paymentInfo, calculateItemWeight, calculatePoddonCount, calculateItemTotal]);

    return (
        <div className="sacod-sales-container">
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
            />
            <div className="sacod-content-section">
                {cart.length === 0 ? (
                    <div className="sacod-empty-state">
                        <ShoppingCart className="sacod-empty-icon" />
                        <p>Savat bo'sh</p>
                    </div>
                ) : (
                    <>
                        <div className="sacod-cart-items">
                            {cart.map((item, inx) => (
                                <div key={`${item.id}-${inx}`} className="sacod-cart-item">
                                    <div className="sacod-cart-item-info">
                                        <div className="sacod-cart-item-icon">{getProductIcon(item.type)}</div>
                                        <div>
                                            <h4 className="sacod-cart-item-name">{item.name}</h4>
                                            {item.type === 'coal_paper' ? (
                                                <>
                                                    <p className="sacod-cart-item-price">
                                                        {(item.discountedPrice || item.pricePerUnit).toLocaleString()} so'm / dona
                                                    </p>
                                                    <p className="sacod-cart-item-poddon">Poddon: {calculatePoddonCount(item.quantity)}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="sacod-cart-item-price">
                                                        {(item.discountedPrice || item.pricePerKg).toLocaleString()} so'm / kg
                                                    </p>
                                                    <p className="sacod-cart-item-weight">{item.weightPerBag} kg / qop</p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Optimized Cart Item Controls */}
                                    <div className="sacod-cart-item-controls">
                                        <div className="sacod-quantity-box">
                                            <div className="sacod-quantity-controls">
                                                <button
                                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                                    className="sacod-quantity-btn"
                                                >
                                                    <Minus className="sacod mock-icon-xs" />
                                                </button>
                                                <span className="sacod-quantity">{item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}</span>
                                                <button
                                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                                    className="sacod-quantity-btn"
                                                >
                                                    <Plus className="sacod-icon-xs" />
                                                </button>
                                            </div>
                                            <div className="sacod-quantity-controls">
                                                <button
                                                    onClick={() => updateCartQuantity(item.id, item.quantity - 25)}
                                                    className="sacod-quantity-btn"
                                                >
                                                    <Minus className="sacod-icon-xs" />
                                                </button>
                                                <span className="sacod-quantity">Poddon: {calculatePoddonCount(item.quantity)}</span>
                                                <button
                                                    onClick={() => updateCartQuantity(item.id, item.quantity + 25)}
                                                    className="sacod-quantity-btn"
                                                >
                                                    <Plus className="sacod-icon-xs" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item total price */}
                                        <div className="sacod-cart-item-total">
                                            {calculateItemTotal(item).toLocaleString()} so'm
                                        </div>

                                        {/* Remove button */}
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="sacod-remove-btn"
                                            title="Mahsulotni o'chirish"
                                            aria-label={`${item.name} ni savatchadan o'chirish`}
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="sacod-cart-info">
                            <div className="sacod-order-summary">
                                <div className="sacod-summary-row">
                                    <span>Jami og'irlik:</span>
                                    <span>{summaryData.totalWeight} kg</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>Jami poddonlar:</span>
                                    <span>{summaryData.totalPoddons}</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>Jami summa:</span>
                                    <span>{summaryData.subtotal.toLocaleString()} so'm</span>
                                </div>
                                {paymentInfo.discount > 0 && (
                                    <div className="sacod-summary-row sacod-discount">
                                        <span>Chegirma ({paymentInfo.discount}%):</span>
                                        <span>-{summaryData.discountAmount.toLocaleString()} so'm</span>
                                    </div>
                                )}
                                <div className="sacod-summary-row sacod-total">
                                    <span>Yakuniy summa:</span>
                                    <span>{summaryData.total.toLocaleString()} so'm</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>To'langan:</span>
                                    <span>{paymentInfo.paidAmount.toLocaleString()} so'm</span>
                                </div>
                                <div
                                    className={`sacod-summary-row ${summaryData.debt > 0 ? 'sacod-debt' : 'sacod-paid'}`}
                                >
                                    <span>Qarz:</span>
                                    <span>{summaryData.debt.toLocaleString()} so'm</span>
                                </div>
                            </div>

                            <button
                                onClick={openContractModal}
                                className="sacod-complete-sale-btn"
                                disabled={cart.length === 0}
                            >
                                <FileText className="sacod-icon-sm" />
                                Shartnoma tuzish
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Contract Modal */}
            {isContractModalOpen && (
                <div className="sacod-modal">
                    <div className="sacod-modal-content">
                        <h2 className="sacod-modal-title">
                            <FileText className="sacod-icon-sm" />
                            Shartnoma Tuzish
                        </h2>

                        <div className="sacod-form-section">
                            <h3>Mijoz Ma'lumotlari</h3>
                            <div className="sacod-form-row">
                                <select
                                    value={contractInfo.customerType}
                                    onChange={(e) => setContractInfo(prev => ({ ...prev, customerType: e.target.value }))}
                                    className="sacod-form-select"
                                >
                                    <option value="individual">Jismoniy shaxs</option>
                                    <option value="company">Yuridik shaxs</option>
                                </select>
                            </div>
                            <div className="sacod-form-row">
                                <input
                                    type="text"
                                    placeholder={contractInfo.customerType === 'company' ? "Kompaniya nomi *" : "Mijoz ismi *"}
                                    value={contractInfo.customerName}
                                    onChange={(e) => setContractInfo(prev => ({ ...prev, customerName: e.target.value }))}
                                    className="sacod-form-input"
                                    required
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefon raqami"
                                    value={contractInfo.customerPhone}
                                    onChange={(e) => setContractInfo(prev => ({ ...prev, customerPhone: e.target.value }))}
                                    className="sacod-form-input"
                                />
                            </div>
                            {contractInfo.customerType === 'company' && (
                                <div className="sacod-form-row">
                                    <input
                                        type="text"
                                        placeholder="Kompaniya manzili"
                                        value={contractInfo.customerCompanyAddress}
                                        onChange={(e) =>
                                            setContractInfo(prev => ({ ...prev, customerCompanyAddress: e.target.value }))
                                        }
                                        className="sacod-form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Soliq raqami (INN)"
                                        value={contractInfo.customerTaxId}
                                        onChange={(e) => setContractInfo(prev => ({ ...prev, customerTaxId: e.target.value }))}
                                        className="sacod-form-input"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="sacod-form-section">
                            <h3>Mahsulotlar va Chegirmalar</h3>
                            {cart.map((item) => (
                                <div key={item.id} className="sacod-cart-item">
                                    <div className="sacod-cart-item-info">
                                        <h4>{item.name}</h4>
                                        <p>
                                            Miqdori: {item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}
                                        </p>
                                        {item.type === 'coal_paper' && <p>Poddon: {calculatePoddonCount(item.quantity)}</p>}
                                        <p>
                                            Asl narx:{' '}
                                            {(item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg).toLocaleString()}{' '}
                                            so'm / {item.type === 'coal_paper' ? 'dona' : 'kg'}
                                        </p>
                                        <input
                                            style={{ width: '150px' }}
                                            type="number"
                                            placeholder="Chegirmali narx"
                                            value={contractInfo.discounts[item.id] || ''}
                                            onChange={(e) => handleContractDiscountChange(item.id, e.target.value)}
                                            className="sacod-form-input"
                                            min="0"
                                            max={item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="sacod-form-section">
                            <h3>To'lov Ma'lumotlari</h3>
                            <div className="sacod-form-row">
                                <input
                                    type="number"
                                    placeholder="To'lov summasi"
                                    value={contractInfo.paymentAmount || ''}
                                    onChange={(e) =>
                                        setContractInfo(prev => ({ ...prev, paymentAmount: Number(e.target.value) || 0 }))
                                    }
                                    className="sacod-form-input"
                                    min="0"
                                    max={summaryData.total}
                                />
                            </div>
                            <div className="sacod-form-row">
                                <textarea
                                    placeholder="To'lov tavsifi"
                                    value={contractInfo.paymentDescription}
                                    onChange={(e) =>
                                        setContractInfo(prev => ({ ...prev, paymentDescription: e.target.value }))
                                    }
                                    className="sacod-form-input"
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="sacod-modal-actions">
                            <button
                                onClick={() => setIsContractModalOpen(false)}
                                className="sacod-modal-btn sacod-modal-btn-cancel"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={completeContract}
                                className="sacod-modal-btn sacod-modal-btn-confirm"
                                disabled={!contractInfo.customerName || cart.length === 0}
                            >
                                Shartnomani tasdiqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartTab;