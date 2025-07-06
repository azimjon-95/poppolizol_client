import React, { useState } from 'react';
import { Package, FileText, User, ShoppingCart, Check, AlertCircle, Phone, Building, Calendar, Factory } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalespersonManagement from './salesPerson/SalespersonManagement';
import CartTab from './CartTab';
import { products } from './mock';
import { useGetFinishedProductsQuery } from '../../../context/productionApi';
import './style.css';

const SacodSalesModule = () => {
    const [cart, setCart] = useState([]);
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    //useGetFinishedProductsQuery
    const { data: finishedProducts } = useGetFinishedProductsQuery();
    console.log(finishedProducts);

    const [paymentInfo, setPaymentInfo] = useState({
        totalAmount: 0,
        paidAmount: 0,
        discount: 0,
        paymentStatus: 'partial'
    });
    const [salesperson] = useState("Azimjon Mamutaliyev");
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
        discounts: {}
    });

    // Cart Functions
    const addToCart = (product, quantity = 1) => {
        // Ensure product and finishedProducts exist
        if (!product || !finishedProducts) {
            toast.error('Mahsulot topilmadi yoki ma\'lumotlar yuklanmadi!', {
                position: 'top-right',
                autoClose: 3000,
            });
            return;
        }

        setCart((prevCart) => {
            // Check if the product already exists in the cart
            const existingItemIndex = prevCart.findIndex((item) => item._id === product._id);

            if (existingItemIndex !== -1) {
                // Update quantity of existing item
                return prevCart.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            // Add new product to cart
            return [
                ...prevCart,
                {
                    ...product,
                    quantity,
                    discountedPrice: product.pricePerUnit || product.pricePerKg || 0,
                },
            ];
        });

        toast.success(
            <div className="flex-items-center">Mahsulot savatga qo'shildi!</div>,
            {
                position: 'top-right',
                autoClose: 3000,
            }
        );
    };




    const calculateItemTotal = (item) => {
        if (item.type === 'coal_paper') {
            return (item.discountedPrice || item.pricePerUnit) * item.quantity;
        } else {
            return (item.discountedPrice || item.pricePerKg) * item.weightPerBag * item.quantity;
        }
    };

    const calculateItemWeight = (item) => {
        if (item.type === 'betum') {
            return item.weightPerBag * item.quantity;
        }
        return 0;
    };

    const calculatePoddonCount = (quantity) => {
        return Math.floor(quantity / 25);
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const discountAmount = (subtotal * paymentInfo.discount) / 100;
        return subtotal - discountAmount;
    };

    const handleContractDiscountChange = (productId, value) => {
        const product = finishedProducts.find(p => p.id === productId);
        const maxPrice = product.type === 'coal_paper' ? product.pricePerUnit : product.pricePerKg;
        const discountedPrice = Math.min(Number(value), maxPrice);
        setContractInfo({
            ...contractInfo,
            discounts: {
                ...contractInfo.discounts,
                [productId]: discountedPrice
            }
        });
    };

    const completeContract = () => {
        if (!contractInfo.customerName || cart?.length === 0) {
            toast.error('Iltimos, barcha majburiy maydonlarni to\'ldiring!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (contractInfo.paymentAmount > calculateTotal()) {
            toast.error('To\'lov summasi yakuniy summadan oshib ketdi!', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const updatedCart = cart?.map(item => ({
            ...item,
            discountedPrice: contractInfo.discounts[item.id]
        }));

        const total = calculateTotal();
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
                taxId: contractInfo.customerTaxId
            },
            items: updatedCart?.map(item => ({
                ...item,
                pricePerUnit: item.type === 'coal_paper' ? (item.discountedPrice || item.pricePerUnit) : undefined,
                pricePerKg: item.type === 'betum' ? (item.discountedPrice || item.pricePerKg) : undefined
            })),
            payment: {
                totalAmount: total,
                paidAmount: contractInfo.paymentAmount,
                debt: debt,
                status: debt <= 0 ? 'paid' : 'partial',
                paymentDescription: contractInfo.paymentDescription
            },
            salesperson,
            totalWeight: updatedCart.reduce((sum, item) => sum + calculateItemWeight(item), 0),
            totalPoddons: updatedCart.reduce((sum, item) => item.type === 'coal_paper' ? sum + calculatePoddonCount(item.quantity) : sum, 0),
            isContract: true
        };

        setSales([newSale, ...sales]);
        setCart([]);
        setPaymentInfo({
            totalAmount: 0,
            paidAmount: 0,
            discount: 0,
            paymentStatus: 'partial'
        });
        setIsContractModalOpen(false);
        toast.success('Shartnoma muvaffaqiyatli tuzildi va sotuv yakunlandi!', {
            position: "top-right",
            autoClose: 3000,
        });
        setActiveTab('sales');
    };

    const getProductIcon = (type) => {
        return type === 'betum' ? <Factory className="sacod-icon-sm" /> : <FileText className="sacod-icon-sm" />;
    };

    const getPaymentStatusBadge = (status, debt) => {
        if (status === 'paid' || debt <= 0) {
            return <span className="sacod-badge sacod-badge-success"><Check className="sacod-icon-xs" /> To'liq to'langan</span>;
        }
        return <span className="sacod-badge sacod-badge-warning"><AlertCircle className="sacod-icon-xs" /> Qarzli</span>;
    };


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

            <div className="sacod-navigation">
                <div className="sacod-filter-controls">
                    <button
                        className={`sacod-nav-btn ${activeTab === 'products' ? 'sacod-nav-btn-active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <Package className="sacod-icon-sm" />
                        Mahsulotlar
                    </button>
                    <button
                        className={`sacod-nav-btn ${activeTab === 'cart' ? 'sacod-nav-btn-active' : ''}`}
                        onClick={() => setActiveTab('cart')}
                    >
                        <ShoppingCart className="sacod-icon-sm" />
                        Savat<p style={{ fontSize: "17px" }}>({cart?.length})</p>
                    </button>
                    <button
                        className={`sacod-nav-btn ${activeTab === 'sales' ? 'sacod-nav-btn-active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <FileText className="sacod-icon-sm" />
                        Shartnomalar<p style={{ fontSize: "17px" }}>({sales?.length})</p>
                    </button>
                    <button
                        className={`sacod-nav-btn ${activeTab === 'salespeople' ? 'sacod-nav-btn-active' : ''}`}
                        onClick={() => setActiveTab('salespeople')}
                    >
                        <User className="sacod-icon-sm" />
                        Sotuvchilar
                    </button>
                </div>
            </div>

            {activeTab === 'products' && (
                <div className="sacod-products-grid">
                    {finishedProducts?.map((product, inx) => (
                        <div key={inx} className="sacod-product-card">
                            <div className="sacod-product-header">
                                <div className="sacod-product-icon">
                                    {getProductIcon(product.type)}
                                </div>
                                <div className="sacod-product-stock">
                                    <Package className="sacod-icon-xs" />

                                    {product.quantity.toLocaleString()} {product.size === 'dona' ? 'dona' : 'kg'}
                                </div>
                            </div>

                            <div className="sacod-product-subTitle">
                                <h3 className="sacod-product-name">{product.productName}</h3>
                                <p className="sacod-product-description">{product.description}</p>
                                <p className="sacod-product-category">
                                    Kategoriya: <strong>{product.category}</strong>
                                </p>
                            </div>

                            <div className="sacod-product-details">
                                {product.type === 'dona' ? (
                                    <>
                                        <div className="sacod-product-price">
                                            {product.sellingPrice?.toLocaleString()} so'm/dona
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="sacod-product-price">
                                            {product.sellingPrice?.toLocaleString()} so'm/kg
                                        </div>
                                    </>
                                )}

                                <div className="sacod-product-cost">
                                    Tannarxi: <br /> <strong>{product.productionCost.toLocaleString()} so'm</strong>
                                </div>
                            </div>

                            <button
                                onClick={() => addToCart(product, product.type === 'coal_paper' ? 1 : 1)}
                                className="sacod-add-to-cart-btn"
                            >
                                <ShoppingCart className="sacod-icon-xs" />
                                Savatga qo'shish
                            </button>
                        </div>
                    ))}
                </div>
            )}


            {activeTab === 'cart' && (
                <CartTab
                    setActiveTab={setActiveTab}
                    cart={cart}
                    setCart={setCart}
                />
            )}

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
                                    onChange={(e) => setContractInfo({ ...contractInfo, customerType: e.target.value })}
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
                                    onChange={(e) => setContractInfo({ ...contractInfo, customerName: e.target.value })}
                                    className="sacod-form-input"
                                />
                                <input
                                    type="tel"
                                    placeholder="Telefon raqami"
                                    value={contractInfo.customerPhone}
                                    onChange={(e) => setContractInfo({ ...contractInfo, customerPhone: e.target.value })}
                                    className="sacod-form-input"
                                />
                            </div>
                            {contractInfo.customerType === 'company' && (
                                <div className="sacod-form-row">
                                    <input
                                        type="text"
                                        placeholder="Kompaniya manzili"
                                        value={contractInfo.customerCompanyAddress}
                                        onChange={(e) => setContractInfo({ ...contractInfo, customerCompanyAddress: e.target.value })}
                                        className="sacod-form-input"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Soliq raqami (INN)"
                                        value={contractInfo.customerTaxId}
                                        onChange={(e) => setContractInfo({ ...contractInfo, customerTaxId: e.target.value })}
                                        className="sacod-form-input"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="sacod-form-section">
                            <h3>Mahsulotlar va Chegirmalar</h3>
                            {cart?.map(item => (
                                <div key={item.id} className="sacod-cart-item">
                                    <div className="sacod-cart-item-info">
                                        <h4>{item.name}</h4>
                                        <p>Miqdori: {item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}</p>
                                        {item.type === 'coal_paper' && (
                                            <p>Poddon: {calculatePoddonCount(item.quantity)}</p>
                                        )}
                                        <p>Asl narx: {(item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg)?.toLocaleString()} so'm / {item.type === 'coal_paper' ? 'dona' : 'kg'}</p>
                                        <input
                                            style={{ width: "150px" }}
                                            type="text"
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
                                    value={contractInfo.paymentAmount}
                                    onChange={(e) => setContractInfo({ ...contractInfo, paymentAmount: Number(e.target.value) })}
                                    className="sacod-form-input"
                                    min="0"
                                />
                            </div>
                            <div className="sacod-form-row">
                                <textarea
                                    placeholder="To'lov tavsifi"
                                    value={contractInfo.paymentDescription}
                                    onChange={(e) => setContractInfo({ ...contractInfo, paymentDescription: e.target.value })}
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
                                disabled={!contractInfo.customerName || cart?.length === 0}
                            >
                                Shartnomani tasdiqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="sacod-content-section">
                    {sales?.length === 0 ? (
                        <div className="sacod-empty-state">
                            <FileText className="sacod-empty-icon" />
                            <p>Hali hech qanday sotuv amalga oshirilmagan</p>
                        </div>
                    ) : (
                        <div className="sacod-sales-list">
                            {sales?.map(sale => (
                                <div key={sale.id} className="sacod-sale-card">
                                    <div className="sacod-sale-header">
                                        <div className="sacod-sale-date">
                                            <Calendar className="sacod-icon-sm" />
                                            {sale.date} - {sale.time}
                                        </div>
                                        <div className="sacod-sale-status">
                                            {getPaymentStatusBadge(sale.payment.status, sale.payment.debt)}
                                            {sale.isContract && (
                                                <span className="sacod-badge sacod-badge-info">Shartnoma</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sacod-sale-customer">
                                        <div className="sacod-customer-icon">
                                            {sale.customer.type === 'company' ? <Building className="sacod-icon-sm" /> : <User className="sacod-icon-sm" />}
                                        </div>
                                        <div className="sacod-customer-details">
                                            <h4>{sale.customer.name}</h4>
                                            {sale.customer.phone && (
                                                <p className="sacod-customer-phone">
                                                    <Phone className="sacod-icon-xs" />
                                                    {sale.customer.phone}
                                                </p>
                                            )}
                                            {sale.customer.type === 'company' && sale.customer.companyAddress && (
                                                <p className="sacod-customer-address">{sale.customer.companyAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sacod-sale-items">
                                        <h5>Sotilgan mahsulotlar:</h5>
                                        {sale.items?.map((item, index) => (
                                            <div key={index} className="sacod-sale-item">
                                                <span>
                                                    {item.name} × {item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}
                                                    {item.type === 'coal_paper' && item.quantity >= 25 && (
                                                        <span> ({calculatePoddonCount(item.quantity)} poddon)</span>
                                                    )}
                                                </span>
                                                <span>{calculateItemTotal(item)?.toLocaleString()} so'm</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="sacod-sale-summary">
                                        <div className="sacod-sale-info">
                                            <div className="sacod-sale-stat">
                                                <span>Jami og'irlik:</span>
                                                <span>{sale.totalWeight} kg</span>
                                            </div>
                                            <div className="sacod-sale-stat">
                                                <span>Jami poddonlar:</span>
                                                <span>{sale.totalPoddons}</span>
                                            </div>
                                            <div className="sacod-sale-stat">
                                                <span>Jami summa:</span>
                                                <span>{sale.payment.totalAmount?.toLocaleString()} so'm</span>
                                            </div>
                                            <div className="sacod-sale-stat">
                                                <span>To'langan:</span>
                                                <span>{sale.payment.paidAmount?.toLocaleString()} so'm</span>
                                            </div>
                                            {sale.payment.debt > 0 && (
                                                <div className="sacod-sale-stat sacod-debt-stat">
                                                    <span>Qarz:</span>
                                                    <span>{sale.payment.debt?.toLocaleString()} so'm</span>
                                                </div>
                                            )}
                                            {sale.payment.paymentDescription && (
                                                <div className="sacod-sale-stat">
                                                    <span>To'lov tavsifi:</span>
                                                    <span>{sale.payment.paymentDescription}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="sacod-salesperson">
                                            <User className="sacod-icon-xs" />
                                            Sotuvchi: {sale.salesperson}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'salespeople' && (
                <SalespersonManagement sales={sales} />
            )}
        </div>
    );
};

export default SacodSalesModule;
