import React, { useState } from 'react';
import { Package, FileText, User, ShoppingCart, Check, AlertCircle, Phone, Building, Calendar, Factory } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalespersonManagement from './salesPerson/SalespersonManagement';
import CartTab from './CartTab';
import { products } from './mock';
import './style.css';

const SacodSalesModule = () => {
    const [cart, setCart] = useState([]);
    const [sales, setSales] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        type: 'individual',
        phone: '',
        companyName: '',
        companyAddress: '',
        taxId: ''
    });
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
        const existingItem = cart.find(item => item.id === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setCart([...cart, { ...product, quantity, discountedPrice: product.pricePerUnit || product.pricePerKg }]);
        }
        toast.success(
            <div className="flex-items-center">
                Mahsulot savatga qo'shildi!
            </div>,
            {
                position: "top-right",
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
        const product = products.find(p => p.id === productId);
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
        if (!contractInfo.customerName || cart.length === 0) {
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

        const updatedCart = cart.map(item => ({
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
            items: updatedCart.map(item => ({
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
        setCustomerInfo({
            name: '',
            type: 'individual',
            phone: '',
            companyName: '',
            companyAddress: '',
            taxId: ''
        });
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
                        Savat<p style={{ fontSize: "17px" }}>({cart.length})</p>
                    </button>
                    <button
                        className={`sacod-nav-btn ${activeTab === 'sales' ? 'sacod-nav-btn-active' : ''}`}
                        onClick={() => setActiveTab('sales')}
                    >
                        <FileText className="sacod-icon-sm" />
                        Shartnomalar<p style={{ fontSize: "17px" }}>({sales.length})</p>
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
                    {products.map((product, inx) => (
                        <div key={inx} className="sacod-product-card">
                            <div className="sacod-product-header">
                                <div className="sacod-product-icon">
                                    {getProductIcon(product.type)}
                                </div>
                                <div className="sacod-product-stock">
                                    <Package className="sacod-icon-xs" />
                                    {product.stock} {product.type === 'coal_paper' ? 'dona' : 'qop'}
                                </div>
                            </div>
                            <div className="sacod-product-subTitle">
                                <h3 className="sacod-product-name">{product.name}</h3>
                                <p className="sacod-product-description">{product.description}</p>
                            </div>
                            <div className="sacod-product-details">
                                {product.type === 'coal_paper' ? (
                                    <>
                                        <div className="sacod-product-price">
                                            {product.pricePerUnit.toLocaleString()} so'm/dona
                                        </div>
                                        <div className="sacod-product-poddon">
                                            25/{calculatePoddonCount(product.stock)}-poddon
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="sacod-product-weight">
                                            <strong>{product.weightPerBag} kg</strong> / qop
                                        </div>
                                        <div className="sacod-product-price">
                                            {product.pricePerKg.toLocaleString()} so'm / kg
                                        </div>
                                    </>
                                )}
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
                    cart={cart}
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
                            {cart.map(item => (
                                <div key={item.id} className="sacod-cart-item">
                                    <div className="sacod-cart-item-info">
                                        <h4>{item.name}</h4>
                                        <p>Miqdori: {item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}</p>
                                        {item.type === 'coal_paper' && (
                                            <p>Poddon: {calculatePoddonCount(item.quantity)}</p>
                                        )}
                                        <p>Asl narx: {(item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg).toLocaleString()} so'm / {item.type === 'coal_paper' ? 'dona' : 'kg'}</p>
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
                                disabled={!contractInfo.customerName || cart.length === 0}
                            >
                                Shartnomani tasdiqlash
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sales' && (
                <div className="sacod-content-section">
                    {sales.length === 0 ? (
                        <div className="sacod-empty-state">
                            <FileText className="sacod-empty-icon" />
                            <p>Hali hech qanday sotuv amalga oshirilmagan</p>
                        </div>
                    ) : (
                        <div className="sacod-sales-list">
                            {sales.map(sale => (
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
                                        {sale.items.map((item, index) => (
                                            <div key={index} className="sacod-sale-item">
                                                <span>
                                                    {item.name} × {item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}
                                                    {item.type === 'coal_paper' && item.quantity >= 25 && (
                                                        <span> ({calculatePoddonCount(item.quantity)} poddon)</span>
                                                    )}
                                                </span>
                                                <span>{calculateItemTotal(item).toLocaleString()} so'm</span>
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
                                                <span>{sale.payment.totalAmount.toLocaleString()} so'm</span>
                                            </div>
                                            <div className="sacod-sale-stat">
                                                <span>To'langan:</span>
                                                <span>{sale.payment.paidAmount.toLocaleString()} so'm</span>
                                            </div>
                                            {sale.payment.debt > 0 && (
                                                <div className="sacod-sale-stat sacod-debt-stat">
                                                    <span>Qarz:</span>
                                                    <span>{sale.payment.debt.toLocaleString()} so'm</span>
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










// import React, { useState } from 'react';
// import { ShoppingCart, Package, FileText, Phone, Building, Calendar, Minus, Plus, Check, AlertCircle, User, Factory } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import SalespersonManagement from './salesPerson/SalespersonManagement';
// import { products } from './mock';
// import './style.css';

// const SacodSalesModule = () => {
//     const [cart, setCart] = useState([]);
//     const [sales, setSales] = useState([]);
//     const [activeTab, setActiveTab] = useState('products');
//     const [customerInfo, setCustomerInfo] = useState({
//         name: '',
//         type: 'individual',
//         phone: '',
//         companyName: '',
//         companyAddress: '',
//         taxId: ''
//     });
//     const [paymentInfo, setPaymentInfo] = useState({
//         totalAmount: 0,
//         paidAmount: 0,
//         discount: 0,
//         paymentStatus: 'partial'
//     });
//     const [salesperson] = useState("Azimjon Mamutaliyev");
//     const [isContractModalOpen, setIsContractModalOpen] = useState(false);
//     const [contractInfo, setContractInfo] = useState({
//         customerType: 'individual',
//         customerName: '',
//         customerPhone: '',
//         customerCompanyName: '',
//         customerCompanyAddress: '',
//         customerTaxId: '',
//         paymentAmount: 0,
//         paymentDescription: '',
//         discounts: {} // { productId: discountedPrice }
//     });

//     // Cart Functions
//     const addToCart = (product, quantity = 1) => {
//         const existingItem = cart.find(item => item.id === product.id);
//         if (existingItem) {
//             setCart(cart.map(item =>
//                 item.id === product.id
//                     ? { ...item, quantity: item.quantity + quantity }
//                     : item
//             ));
//         } else {
//             setCart([...cart, { ...product, quantity, discountedPrice: product.pricePerUnit || product.pricePerKg }]);
//         }
//         // Show toast with Check icon when product is added to cart
//         toast.success(
//             <div className="flex-items-center">
//                 Mahsulot savatga qo'shildi!
//             </div>,
//             {
//                 position: "top-right",
//                 autoClose: 3000,
//             }
//         );
//     };

//     const updateCartQuantity = (productId, newQuantity) => {
//         if (newQuantity <= 0) {
//             setCart(cart.filter(item => item.id !== productId));
//         } else {
//             setCart(cart.map(item =>
//                 item.id === productId
//                     ? { ...item, quantity: newQuantity }
//                     : item
//             ));
//         }
//     };

//     const removeFromCart = (productId) => {
//         setCart(cart.filter(item => item.id !== productId));
//     };

//     // Calculate total price for an item based on type, applying discount
//     const calculateItemTotal = (item) => {
//         if (item.type === 'coal_paper') {
//             return (item.discountedPrice || item.pricePerUnit) * item.quantity;
//         } else {
//             return (item.discountedPrice || item.pricePerKg) * item.weightPerBag * item.quantity;
//         }
//     };

//     // Calculate total weight for an item
//     const calculateItemWeight = (item) => {
//         if (item.type === 'betum') {
//             return item.weightPerBag * item.quantity;
//         }
//         return 0; // Coal paper doesn't contribute to weight in kg
//     };

//     // Calculate poddon count for coal_paper
//     const calculatePoddonCount = (quantity) => {
//         return Math.floor(quantity / 25); // 1 poddon = 25 units
//     };

//     // Calculate total cart value
//     const calculateTotal = () => {
//         const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
//         const discountAmount = (subtotal * paymentInfo.discount) / 100;
//         return subtotal - discountAmount;
//     };

//     // Calculate debt
//     const calculateDebt = () => {
//         const total = calculateTotal();
//         return total - paymentInfo.paidAmount;
//     };

//     // Open contract modal with pre-filled customer info
//     const openContractModal = () => {
//         setContractInfo({
//             customerType: customerInfo.type,
//             customerName: customerInfo.name,
//             customerPhone: customerInfo.phone,
//             customerCompanyName: customerInfo.companyName,
//             customerCompanyAddress: customerInfo.companyAddress,
//             customerTaxId: customerInfo.taxId,
//             paymentAmount: 0,
//             paymentDescription: '',
//             discounts: cart.reduce((acc, item) => ({
//                 ...acc,
//                 [item.id]: item.discountedPrice || (item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg)
//             }), {})
//         });
//         setIsContractModalOpen(true);
//     };

//     // Handle contract discount change
//     const handleContractDiscountChange = (productId, value) => {
//         const product = products.find(p => p.id === productId);
//         const maxPrice = product.type === 'coal_paper' ? product.pricePerUnit : product.pricePerKg;
//         const discountedPrice = Math.min(Number(value), maxPrice);
//         setContractInfo({
//             ...contractInfo,
//             discounts: {
//                 ...contractInfo.discounts,
//                 [productId]: discountedPrice
//             }
//         });
//     };

//     // Complete contract and sale
//     const completeContract = () => {
//         if (!contractInfo.customerName || cart.length === 0) {
//             toast.error('Iltimos, barcha majburiy maydonlarni to\'ldiring!', {
//                 position: "top-right",
//                 autoClose: 3000,
//             });
//             return;
//         }

//         if (contractInfo.paymentAmount > calculateTotal()) {
//             toast.error('To\'lov summasi yakuniy summadan oshib ketdi!', {
//                 position: "top-right",
//                 autoClose: 3000,
//             });
//             return;
//         }

//         // Update cart with discounted prices
//         const updatedCart = cart.map(item => ({
//             ...item,
//             discountedPrice: contractInfo.discounts[item.id]
//         }));

//         const total = calculateTotal();
//         const debt = total - contractInfo.paymentAmount;
//         const newSale = {
//             id: Date.now(),
//             date: new Date().toLocaleDateString('uz-UZ'),
//             time: new Date().toLocaleTimeString('uz-UZ'),
//             customer: {
//                 name: contractInfo.customerName,
//                 type: contractInfo.customerType,
//                 phone: contractInfo.customerPhone,
//                 companyName: contractInfo.customerCompanyName,
//                 companyAddress: contractInfo.customerCompanyAddress,
//                 taxId: contractInfo.customerTaxId
//             },
//             items: updatedCart.map(item => ({
//                 ...item,
//                 pricePerUnit: item.type === 'coal_paper' ? (item.discountedPrice || item.pricePerUnit) : undefined,
//                 pricePerKg: item.type === 'betum' ? (item.discountedPrice || item.pricePerKg) : undefined
//             })),
//             payment: {
//                 totalAmount: total,
//                 paidAmount: contractInfo.paymentAmount,
//                 debt: debt,
//                 status: debt <= 0 ? 'paid' : 'partial',
//                 paymentDescription: contractInfo.paymentDescription
//             },
//             salesperson,
//             totalWeight: updatedCart.reduce((sum, item) => sum + calculateItemWeight(item), 0),
//             totalPoddons: updatedCart.reduce((sum, item) => item.type === 'coal_paper' ? sum + calculatePoddonCount(item.quantity) : sum, 0),
//             isContract: true
//         };

//         setSales([newSale, ...sales]);
//         setCart([]);
//         setCustomerInfo({
//             name: '',
//             type: 'individual',
//             phone: '',
//             companyName: '',
//             companyAddress: '',
//             taxId: ''
//         });
//         setPaymentInfo({
//             totalAmount: 0,
//             paidAmount: 0,
//             discount: 0,
//             paymentStatus: 'partial'
//         });
//         setIsContractModalOpen(false);
//         toast.success('Shartnoma muvaffaqiyatli tuzildi va sotuv yakunlandi!', {
//             position: "top-right",
//             autoClose: 3000,
//         });
//         setActiveTab('sales');
//     };

//     // Get product icon
//     const getProductIcon = (type) => {
//         return type === 'betum' ? <Factory className="sacod-icon-sm" /> : <FileText className="sacod-icon-sm" />;
//     };

//     // Get payment status badge
//     const getPaymentStatusBadge = (status, debt) => {
//         if (status === 'paid' || debt <= 0) {
//             return <span className="sacod-badge sacod-badge-success"><Check className="sacod-icon-xs" /> To'liq to'langan</span>;
//         }
//         return <span className="sacod-badge sacod-badge-warning"><AlertCircle className="sacod-icon-xs" /> Qarzli</span>;
//     };

//     return (
//         <div className="sacod-sales-container">
//             {/* Add ToastContainer to render toasts */}
//             <ToastContainer
//                 position="top-right"
//                 autoClose={3000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//             />

//             {/* Navigation */}
//             <div className="sacod-navigation">
//                 <div className="sacod-filter-controls">
//                     <button
//                         className={`sacod-nav-btn ${activeTab === 'products' ? 'sacod-nav-btn-active' : ''}`}
//                         onClick={() => setActiveTab('products')}
//                     >
//                         <Package className="sacod-icon-sm" />
//                         Mahsulotlar
//                     </button>
//                     <button
//                         className={`sacod-nav-btn ${activeTab === 'cart' ? 'sacod-nav-btn-active' : ''}`}
//                         onClick={() => setActiveTab('cart')}
//                     >
//                         <ShoppingCart className="sacod-icon-sm" />
//                         Savat<p style={{ fontSize: "17px" }}>({cart.length})</p>
//                     </button>
//                     <button
//                         className={`sacod-nav-btn ${activeTab === 'sales' ? 'sacod-nav-btn-active' : ''}`}
//                         onClick={() => setActiveTab('sales')}
//                     >
//                         <FileText className="sacod-icon-sm" />
//                         Shartnomalar<p style={{ fontSize: "17px" }}>({sales.length})</p>
//                     </button>
//                     <button
//                         className={`sacod-nav-btn ${activeTab === 'salespeople' ? 'sacod-nav-btn-active' : ''}`}
//                         onClick={() => setActiveTab('salespeople')}
//                     >
//                         <User className="sacod-icon-sm" />
//                         Sotuvchilar
//                     </button>
//                 </div>
//             </div>

//             {/* Products Tab */}
//             {activeTab === 'products' && (
//                 <div className="sacod-products-grid">
//                     {products.map((product, inx) => (
//                         <div key={inx} className="sacod-product-card">
//                             <div className="sacod-product-header">
//                                 <div className="sacod-product-icon">
//                                     {getProductIcon(product.type)}
//                                 </div>
//                                 <div className="sacod-product-stock">
//                                     <Package className="sacod-icon-xs" />
//                                     {product.stock} {product.type === 'coal_paper' ? 'dona' : 'qop'}
//                                 </div>
//                             </div>
//                             <div className="sacod-product-subTitle">
//                                 <h3 className="sacod-product-name">{product.name}</h3>
//                                 <p className="sacod-product-description">{product.description}</p>
//                             </div>
//                             <div className="sacod-product-details">
//                                 {product.type === 'coal_paper' ? (
//                                     <>
//                                         <div className="sacod-product-price">
//                                             {product.pricePerUnit.toLocaleString()} so'm/dona
//                                         </div>
//                                         <div className="sacod-product-poddon">
//                                             25/{calculatePoddonCount(product.stock)}-poddon
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <div className="sacod-product-weight">
//                                             <strong>{product.weightPerBag} kg</strong> / qop
//                                         </div>
//                                         <div className="sacod-product-price">
//                                             {product.pricePerKg.toLocaleString()} so'm / kg
//                                         </div>
//                                     </>
//                                 )}
//                             </div>
//                             <button
//                                 onClick={() => addToCart(product, product.type === 'coal_paper' ? 1 : 1)}
//                                 className="sacod-add-to-cart-btn"
//                             >
//                                 <ShoppingCart className="sacod-icon-xs" />
//                                 Savatga qo'shish
//                             </button>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Cart Tab */}
//             {activeTab === 'cart' && (
//                 <div className="sacod-content-section">
//                     {cart.length === 0 ? (
//                         <div className="sacod-empty-state">
//                             <ShoppingCart className="sacod-empty-icon" />
//                             <p>Savat bo'sh</p>
//                         </div>
//                     ) : (
//                         <>
//                             <div className="sacod-cart-items">
//                                 {cart.map((item, inx) => (
//                                     <div key={inx} className="sacod-cart-item">
//                                         <div className="sacod-cart-item-info">
//                                             <div className="sacod-cart-item-icon">
//                                                 {getProductIcon(item.type)}
//                                             </div>
//                                             <div>
//                                                 <h4 className="sacod-cart-item-name">{item.name}</h4>
//                                                 {item.type === 'coal_paper' ? (
//                                                     <>
//                                                         <p className="sacod-cart-item-price">
//                                                             {(item.discountedPrice || item.pricePerUnit).toLocaleString()} so'm / dona
//                                                         </p>
//                                                         <p className="sacod-cart-item-poddon">Poddon: {calculatePoddonCount(item.quantity)}</p>
//                                                     </>
//                                                 ) : (
//                                                     <>
//                                                         <p className="sacod-cart-item-price">
//                                                             {(item.discountedPrice || item.pricePerKg).toLocaleString()} so'm / kg
//                                                         </p>
//                                                         <p className="sacod-cart-item-weight">{item.weightPerBag} kg / qop</p>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </div>
//                                         <div className="sacod-cart-item-controls">
//                                             <div className="sacod-quantity-box">
//                                                 <div className="sacod-quantity-controls">
//                                                     <button
//                                                         onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
//                                                         className="sacod-quantity-btn"
//                                                     >
//                                                         <Minus className="sacod mock-icon-xs" />
//                                                     </button>
//                                                     <span className="sacod-quantity">{item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}</span>
//                                                     <button
//                                                         onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
//                                                         className="sacod-quantity-btn"
//                                                     >
//                                                         <Plus className="sacod-icon-xs" />
//                                                     </button>
//                                                 </div>
//                                                 <div className="sacod-quantity-controls">
//                                                     <button
//                                                         onClick={() => updateCartQuantity(item.id, item.quantity - 25)}
//                                                         className="sacod-quantity-btn"
//                                                     >
//                                                         <Minus className="sacod-icon-xs" />
//                                                     </button>
//                                                     <span className="sacod-quantity">Poddon: {calculatePoddonCount(item.quantity)}</span>
//                                                     <button
//                                                         onClick={() => updateCartQuantity(item.id, item.quantity + 25)}
//                                                         className="sacod-quantity-btn"
//                                                     >
//                                                         <Plus className="sacod-icon-xs" />
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                             <div className="sacod-cart-item-total">
//                                                 {calculateItemTotal(item).toLocaleString()} so'm
//                                             </div>
//                                             <button
//                                                 onClick={() => removeFromCart(item.id)}
//                                                 className="sacod-remove-btn"
//                                             >
//                                                 ×
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="sacod-cart-info">
//                                 {/* Order Summary */}
//                                 <div className="sacod-order-summary">
//                                     <div className="sacod-summary-row">
//                                         <span>Jami og'irlik:</span>
//                                         <span>{cart.reduce((sum, item) => sum + calculateItemWeight(item), 0)} kg</span>
//                                     </div>
//                                     <div className="sacod-summary-row">
//                                         <span>Jami poddonlar:</span>
//                                         <span>{cart.reduce((sum, item) => item.type === 'coal_paper' ? sum + calculatePoddonCount(item.quantity) : sum, 0)}</span>
//                                     </div>
//                                     <div className="sacod-summary-row">
//                                         <span>Jami summa:</span>
//                                         <span>{cart.reduce((sum, item) => sum + calculateItemTotal(item), 0).toLocaleString()} so'm</span>
//                                     </div>
//                                     {paymentInfo.discount > 0 && (
//                                         <div className="sacod-summary-row sacod-discount">
//                                             <span>Chegirma ({paymentInfo.discount}%):</span>
//                                             <span>-{((cart.reduce((sum, item) => sum + calculateItemTotal(item), 0) * paymentInfo.discount) / 100).toLocaleString()} so'm</span>
//                                         </div>
//                                     )}
//                                     <div className="sacod-summary-row sacod-total">
//                                         <span>Yakuniy summa:</span>
//                                         <span>{calculateTotal().toLocaleString()} so'm</span>
//                                     </div>
//                                     <div className="sacod-summary-row">
//                                         <span>To'langan:</span>
//                                         <span>{paymentInfo.paidAmount.toLocaleString()} so'm</span>
//                                     </div>
//                                     <div className={`sacod-summary-row ${calculateDebt() > 0 ? 'sacod-debt' : 'sacod-paid'}`}>
//                                         <span>Qarz:</span>
//                                         <span>{calculateDebt().toLocaleString()} so'm</span>
//                                     </div>
//                                 </div>

//                                 <button
//                                     onClick={openContractModal}
//                                     className="sacod-complete-sale-btn"
//                                     disabled={cart.length === 0}
//                                 >
//                                     <FileText className="sacod-icon-sm" />
//                                     Shartnoma tuzish
//                                 </button>
//                             </div>
//                         </>
//                     )}
//                 </div>
//             )}

//             {/* Contract Modal */}
//             {isContractModalOpen && (
//                 <div className="sacod-modal">
//                     <div className="sacod-modal-content">
//                         <h2 className="sacod-modal-title">
//                             <FileText className="sacod-icon-sm" />
//                             Shartnoma Tuzish
//                         </h2>
//                         <div className="sacod-form-section">
//                             <h3>Mijoz Ma'lumotlari</h3>
//                             <div className="sacod-form-row">
//                                 <select
//                                     value={contractInfo.customerType}
//                                     onChange={(e) => setContractInfo({ ...contractInfo, customerType: e.target.value })}
//                                     className="sacod-form-select"
//                                 >
//                                     <option value="individual">Jismoniy shaxs</option>
//                                     <option value="company">Yuridik shaxs</option>
//                                 </select>
//                             </div>
//                             <div className="sacod-form-row">
//                                 <input
//                                     type="text"
//                                     placeholder={contractInfo.customerType === 'company' ? "Kompaniya nomi *" : "Mijoz ismi *"}
//                                     value={contractInfo.customerName}
//                                     onChange={(e) => setContractInfo({ ...contractInfo, customerName: e.target.value })}
//                                     className="sacod-form-input"
//                                 />
//                                 <input
//                                     type="tel"
//                                     placeholder="Telefon raqami"
//                                     value={contractInfo.customerPhone}
//                                     onChange={(e) => setContractInfo({ ...contractInfo, customerPhone: e.target.value })}
//                                     className="sacod-form-input"
//                                 />
//                             </div>
//                             {contractInfo.customerType === 'company' && (
//                                 <div className="sacod-form-row">
//                                     <input
//                                         type="text"
//                                         placeholder="Kompaniya manzili"
//                                         value={contractInfo.customerCompanyAddress}
//                                         onChange={(e) => setContractInfo({ ...contractInfo, customerCompanyAddress: e.target.value })}
//                                         className="sacod-form-input"
//                                     />
//                                     <input
//                                         type="text"
//                                         placeholder="Soliq raqami (INN)"
//                                         value={contractInfo.customerTaxId}
//                                         onChange={(e) => setContractInfo({ ...contractInfo, customerTaxId: e.target.value })}
//                                         className="sacod-form-input"
//                                     />
//                                 </div>
//                             )}
//                         </div>

//                         <div className="sacod-form-section">
//                             <h3>Mahsulotlar va Chegirmalar</h3>
//                             {cart.map(item => (
//                                 <div key={item.id} className="sacod-cart-item">
//                                     <div className="sacod-cart-item-info">
//                                         <h4>{item.name}</h4>
//                                         <p>Miqdori: {item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}</p>
//                                         {item.type === 'coal_paper' && (
//                                             <p>Poddon: {calculatePoddonCount(item.quantity)}</p>
//                                         )}
//                                         <p>Asl narx: {(item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg).toLocaleString()} so'm / {item.type === 'coal_paper' ? 'dona' : 'kg'}</p>
//                                         <input
//                                             style={{ width: "150px" }}
//                                             type="text"
//                                             placeholder="Chegirmali narx"
//                                             value={contractInfo.discounts[item.id] || ''}
//                                             onChange={(e) => handleContractDiscountChange(item.id, e.target.value)}
//                                             className="sacod-form-input"
//                                             min="0"
//                                             max={item.type === 'coal_paper' ? item.pricePerUnit : item.pricePerKg}
//                                         />
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="sacod-form-section">
//                             <h3>To'lov Ma'lumotlari</h3>
//                             <div className="sacod-form-row">
//                                 <input
//                                     type="number"
//                                     placeholder="To'lov summasi"
//                                     value={contractInfo.paymentAmount}
//                                     onChange={(e) => setContractInfo({ ...contractInfo, paymentAmount: Number(e.target.value) })}
//                                     className="sacod-form-input"
//                                     min="0"
//                                 />
//                             </div>
//                             <div className="sacod-form-row">
//                                 <textarea
//                                     placeholder="To'lov tavsifi"
//                                     value={contractInfo.paymentDescription}
//                                     onChange={(e) => setContractInfo({ ...contractInfo, paymentDescription: e.target.value })}
//                                     className="sacod-form-input"
//                                     rows="4"
//                                 />
//                             </div>
//                         </div>

//                         <div className="sacod-modal-actions">
//                             <button
//                                 onClick={() => setIsContractModalOpen(false)}
//                                 className="sacod-modal-btn sacod-modal-btn-cancel"
//                             >
//                                 Bekor qilish
//                             </button>
//                             <button
//                                 onClick={completeContract}
//                                 className="sacod-modal-btn sacod-modal-btn-confirm"
//                                 disabled={!contractInfo.customerName || cart.length === 0}
//                             >
//                                 Shartnomani tasdiqlash
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Sales Tab */}
//             {activeTab === 'sales' && (
//                 <div className="sacod-content-section">
//                     {sales.length === 0 ? (
//                         <div className="sacod-empty-state">
//                             <FileText className="sacod-empty-icon" />
//                             <p>Hali hech qanday sotuv amalga oshirilmagan</p>
//                         </div>
//                     ) : (
//                         <div className="sacod-sales-list">
//                             {sales.map(sale => (
//                                 <div key={sale.id} className="sacod-sale-card">
//                                     <div className="sacod-sale-header">
//                                         <div className="sacod-sale-date">
//                                             <Calendar className="sacod-icon-sm" />
//                                             {sale.date} - {sale.time}
//                                         </div>
//                                         <div className="sacod-sale-status">
//                                             {getPaymentStatusBadge(sale.payment.status, sale.payment.debt)}
//                                             {sale.isContract && (
//                                                 <span className="sacod-badge sacod-badge-info">Shartnoma</span>
//                                             )}
//                                         </div>
//                                     </div>
//                                     <div className="sacod-sale-customer">
//                                         <div className="sacod-customer-icon">
//                                             {sale.customer.type === 'company' ? <Building className="sacod-icon-sm" /> : <User className="sacod-icon-sm" />}
//                                         </div>
//                                         <div className="sacod-customer-details">
//                                             <h4>{sale.customer.name}</h4>
//                                             {sale.customer.phone && (
//                                                 <p className="sacod-customer-phone">
//                                                     <Phone className="sacod-icon-xs" />
//                                                     {sale.customer.phone}
//                                                 </p>
//                                             )}
//                                             {sale.customer.type === 'company' && sale.customer.companyAddress && (
//                                                 <p className="sacod-customer-address">{sale.customer.companyAddress}</p>
//                                             )}
//                                         </div>
//                                     </div>
//                                     <div className="sacod-sale-items">
//                                         <h5>Sotilgan mahsulotlar:</h5>
//                                         {sale.items.map((item, index) => (
//                                             <div key={index} className="sacod-sale-item">
//                                                 <span>
//                                                     {item.name} × {item.quantity} {item.type === 'coal_paper' ? 'dona' : 'qop'}
//                                                     {item.type === 'coal_paper' && item.quantity >= 25 && (
//                                                         <span> ({calculatePoddonCount(item.quantity)} poddon)</span>
//                                                     )}
//                                                 </span>
//                                                 <span>{calculateItemTotal(item).toLocaleString()} so'm</span>
//                                             </div>
//                                         ))}
//                                     </div>
//                                     <div className="sacod-sale-summary">
//                                         <div className="sacod-sale-info">
//                                             <div className="sacod-sale-stat">
//                                                 <span>Jami og'irlik:</span>
//                                                 <span>{sale.totalWeight} kg</span>
//                                             </div>
//                                             <div className="sacod-sale-stat">
//                                                 <span>Jami poddonlar:</span>
//                                                 <span>{sale.totalPoddons}</span>
//                                             </div>
//                                             <div className="sacod-sale-stat">
//                                                 <span>Jami summa:</span>
//                                                 <span>{sale.payment.totalAmount.toLocaleString()} so'm</span>
//                                             </div>
//                                             <div className="sacod-sale-stat">
//                                                 <span>To'langan:</span>
//                                                 <span>{sale.payment.paidAmount.toLocaleString()} so'm</span>
//                                             </div>
//                                             {sale.payment.debt > 0 && (
//                                                 <div className="sacod-sale-stat sacod-debt-stat">
//                                                     <span>Qarz:</span>
//                                                     <span>{sale.payment.debt.toLocaleString()} so'm</span>
//                                                 </div>
//                                             )}
//                                             {sale.payment.paymentDescription && (
//                                                 <div className="sacod-sale-stat">
//                                                     <span>To'lov tavsifi:</span>
//                                                     <span>{sale.payment.paymentDescription}</span>
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="sacod-salesperson">
//                                             <User className="sacod-icon-xs" />
//                                             Sotuvchi: {sale.salesperson}
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             )}

//             {/* Salespeople Tab */}
//             {activeTab === 'salespeople' && (
//                 <SalespersonManagement sales={sales} />
//             )}
//         </div>
//     );
// };

// export default SacodSalesModule;