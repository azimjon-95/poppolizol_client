import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { ShoppingCart, Minus, Plus, FileText, Factory } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { useGetFactoriesQuery } from '../../../context/clinicApi';
import { use } from '../../../context/cartSaleApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';

const getWidthByLength = (length) => {
    if (length <= 4) return 50;
    if (length <= 5) return 60;
    return 70;
};

const CartTab = ({ cart = [], setCart, setActiveTab, onUpdateCart, onRemoveFromCart, onCompleteSale }) => {
    const contentRef = useRef();
    const navigate = useNavigate();
    const { data: factories = [] } = useGetFactoriesQuery();
    const initialNdsRate = factories?.innerData?.[0]?.nds || 12;
    const [ndsRate, setNdsRate] = useState(initialNdsRate);
    const [discountReason, setDiscountReason] = useState(
        "Mijoz talabiga ko‘ra, uni yo‘qotmaslik uchun chegirma berildi"
    );

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
    });

    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        type: 'individual',
        phone: '',
        companyName: '',
        companyAddress: '',
        taxId: '',
    });

    const [isContractModalOpen, setIsContractModalOpen] = useState(false);
    const [contractInfo, setContractInfo] = useState({
        customerType: 'individual',
        customerName: '',
        customerPhone: '',
        customerCompanyName: '',
        customerCompanyAddress: '',
        customerTaxId: '',
        customerCompany: '',
        transport: '',
        paymentAmount: 0,
        paymentDescription: '',
        discounts: {},
    });

    // Manage customer and transport inputs as a list
    const [formInputs, setFormInputs] = useState([
        { key: 'customerCompany', value: '', label: 'Xaridor', placeholder: 'yozing...', ariaLabel: 'Buyer name' },
        { key: 'transport', value: '', label: 'Avtotransport', placeholder: 'yozing...', ariaLabel: 'Transport details' },
    ]);

    // Check if all required inputs are filled
    const isFormValid = useMemo(() =>
        formInputs.every(input => input.value.trim() !== ''),
        [formInputs]
    );

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

    // Handle input changes for customerCompany and transport
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
        const debt = total - (paymentInfo.paidAmount || 0);
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
    }, [cart, paymentInfo, contractInfo.discounts, ndsRate, calculateItemNds]);

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
            customerPhone: customerInfo.phone,
            customerCompanyName: customerInfo.companyName,
            customerCompanyAddress: customerInfo.companyAddress,
            customerTaxId: customerInfo.taxId,
            customerCompany: formInputs.find(input => input.key === 'customerCompany').value,
            transport: formInputs.find(input => input.key === 'transport').value,
            paymentAmount: 0,
            paymentDescription: '',
            discounts: cart.reduce(
                (acc, item) => ({
                    ...acc,
                    [item._id]: contractInfo.discounts[item._id] ?? item.sellingPrice ?? 0,
                }),
                {}
            ),
        });
        setIsContractModalOpen(true);
    }, [customerInfo, cart, contractInfo.discounts, formInputs]);

    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    const completeContract = useCallback(async () => {
        const total = summaryData.total;
        if (contractInfo.paymentAmount > total) {
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
        }));

        const debt = total - (contractInfo.paymentAmount || 0);
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
                company: contractInfo.customerCompany,
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
                paidAmount: contractInfo.paymentAmount || 0,
                debt,
                status: debt <= 0 ? 'paid' : 'partial',
                paymentDescription: contractInfo.paymentDescription,
                discountReason: (summaryData.itemDiscountAmount > 0 || paymentInfo.discount > 0) ? discountReason : '',
            },
            salesperson: localStorage.getItem("admin_fullname"),
            salerId: localStorage.getItem("workerId"),
            isContract: true,
        };

        try {
            console.log(newSale);
            onCompleteSale?.(newSale);
            reactToPrintFn();
            toast.success('Shartnoma muvaffaqiyatli tuzildi va sotuv yakunlandi!', {
                position: 'top-right',
                autoClose: 3000,
            });
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
            setDiscountReason("Mijoz talabiga ko‘ra, uni yo‘qotmaslik uchun chegirma berildi");
            setIsContractModalOpen(false);
            setCart([]);
            setActiveTab('sales');
        } catch (error) {
            toast.error('Sotuvni saqlashda xatolik yuz berdi!', {
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
        discountReason
    ]);

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
                                const ndsAmount = basePrice * (ndsRate / 100);
                                const priceWithNds = basePrice + ndsAmount;
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
                                                        style={{ width: '60px' }}
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
                                    <span>Jami dona:</span>
                                    <span>{formatNumber(summaryData.totalDona)} dona</span>
                                </div>
                                <div className="sacod-summary-row">
                                    <span>Jami kg:</span>
                                    <span>{formatNumber(summaryData.totalKg)} kg</span>
                                </div>
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
                                            style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
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
                                    <span>{formatNumber(paymentInfo.paidAmount)} so'm</span>
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
                                        style={{ width: '100px', textAlign: 'right' }}
                                        aria-label="NDS rate"
                                        placeholder="NDS foizini kiriting"
                                    />
                                </div>
                                {formInputs.map(input => (
                                    <div key={input.key} className="sacod-summary-row">
                                        <span>{input.label}:</span>
                                        <input
                                            type="text"
                                            value={input.value}
                                            onChange={(e) => handleInputChange(input.key, e.target.value)}
                                            className="sacod-price-input"
                                            style={{ width: '200px', marginLeft: '10px' }}
                                            aria-label={input.ariaLabel}
                                            placeholder={input.placeholder}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={openContractModal}
                                    className="sacod-complete-sale-btn"
                                    disabled={!isFormValid || cart?.length === 0}
                                    aria-label="Open contract modal"
                                >
                                    <FileText className="sacod-icon-sm" />
                                    Shartnoma tuzish
                                </button>
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
                                <strong>Xaridor:</strong> {contractInfo.customerCompany}
                            </p>
                            <p>
                                <strong>Avtotransport:</strong> {contractInfo.transport}
                            </p>
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