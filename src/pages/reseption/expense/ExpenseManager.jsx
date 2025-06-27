import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GiTakeMyMoney } from "react-icons/gi";
import { BsBank } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { BsCurrencyDollar } from "react-icons/bs";
import { GrMoney } from "react-icons/gr";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, Calendar, Plus, Minus, Trash2 } from 'lucide-react';
import { useCreateExpenseMutation, useGetExpensesQuery, useDeleteExpenseMutation, useGetBalanceQuery } from '../../../context/expenseApi';
import { Popover } from 'antd';
import './style.css';

const ExpenseTracker = () => {
    const [transactionType, setTransactionType] = useState('kirim');
    const [paymentMethod, setPaymentMethod] = useState('naqt');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [showPopover, setShowPopover] = useState(null); // Track popover visibility and transaction ID
    const [activeTab, setActiveTab] = useState('Harajatlar'); // default holatda bo‘sh
    const navigate = useNavigate()
    const [formattedAmount, setFormattedAmount] = useState('');
    const formatDateForInput = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const [startDate, setStartDate] = useState(formatDateForInput(today));
    const [endDate, setEndDate] = useState(formatDateForInput(tomorrow));
    const { data: transactions = [], isLoading } = useGetExpensesQuery({ startDate, endDate });
    const { data: getBalance = [], refetch } = useGetBalanceQuery();
    const [createExpense] = useCreateExpenseMutation();
    const [deleteExpense] = useDeleteExpenseMutation();

    const categories = {
        kirim: [
            'Mahsulot sotuvlari',
            'Investitsiya',
            'Bank krediti',
            'Subsidiyalar',
            'Qayta sotilgan chiqindilar',
            'Ijara daromadi',
            'Qo‘shimcha xizmatlar',
            'Homiylik / Grantlar',
            'Avans / Oldindan to‘lov',
            'Valyuta tushumi',
            'Stok (zaxira) mahsulot savdosi',
            'Yordamchi korxona daromadi',
            'Muddatli to‘lovlar',
            'Eski uskuna sotilishi',
            'Loyihalardan tushum',
            'Boshqa'
        ],
        chiqim: [
            'Xomashyo xaridi',
            'Ishchilar maoshi',
            'Bonuslar va mukofotlar',
            'Elektr energiyasi',
            'Gaz ta’minoti',
            'Suv ta’minoti',
            'Transport xarajatlari',
            'Uskuna ta’miri',
            'Texnik xizmat',
            'Ishlab chiqarish sarfi',
            'Qadoqlash materiallari',
            'Kiyim-bosh va himoya vositalari',
            'Ofis xarajatlari',
            'Marketing va reklama',
            'Soliqlar va yig‘imlar',
            'Ijara haqi',
            'Xavfsizlik / Qo‘riqlash',
            'Chiqindilar utilizatsiyasi',
            'Moliyaviy xizmatlar (bank, auditor)',
            'Internet va aloqa',
            'IT xizmatlar (dasturiy ta’minot)',
            'Ishlab chiqarish vositalari xaridi',
            'Litsenziya va ruxsatnomalar',
            'Kadrlar o‘qitish / trening',
            'Komandirovka xarajatlari',
            'Ofis mebellari va texnikasi',
            'Suv / kanalizatsiya tizimi xizmatlari',
            'Sud va yuridik xarajatlar',
            'Sertifikatlash / sifat nazorati',
            'Boshqa'
        ]
    };

    const paymentMethods = {
        naqt: 'Naqt pul',
        dollar: 'Dollar',
        bank: 'Bank orqali'
    };

    const handleSubmit = async () => {
        if (!category) {
            toast.error("Kategoriya tanlanmagan!");
            return;
        }
        if (!amount) {
            toast.error("Summa maydoni to'ldirilmagan!");
            return;
        }

        if (parseFloat(amount) <= 0) {
            toast.error('Summa 0 dan katta bo\'lishi kerak!');
            return;
        }

        try {
            const newTransaction = {
                type: transactionType,
                paymentMethod,
                category,
                amount: parseFloat(amount),
                description,
                date: new Date().toISOString()
            };

            await createExpense(newTransaction).unwrap();
            refetch()
            setAmount('');
            setDescription('');
            setCategory('');
            setFormattedAmount("");
            toast.success(`${transactionType === 'kirim' ? 'Kirim' : 'Chiqim'} muvaffaqiyatli qo'shildi!`);
        } catch (error) {
            toast.error(error.data?.message || 'Xatolik yuz berdi!');
        }
    };

    const handleDelete = async (relatedId) => {
        try {
            await deleteExpense(relatedId).unwrap();
            toast.success('Ok delete');
            refetch()
            setShowPopover(null); // Close popover after deletion
        } catch (error) {
            toast.error(error.data?.message || 'O\'chirishda xatolik yuz berdi!');
            setShowPopover(null); // Close popover on error
        }
    };

    const togglePopover = (transactionId) => {
        setShowPopover(showPopover === transactionId ? null : transactionId);
    };

    const popoverContent = (transactionId) => (
        <div className="ruberoid-popover-content">
            <p className="ruberoid-popover-text">Transaksiyani o'chirishni tasdiqlaysizmi?</p>
            <div className="ruberoid-popover-buttons">
                <button
                    onClick={() => handleDelete(transactionId)}
                    className="ruberoid-popover-btn ruberoid-confirm-btn"
                >
                    Tasdiqlash
                </button>
                <button
                    onClick={() => setShowPopover(null)}
                    className="ruberoid-popover-btn ruberoid-cancel-btn"
                >
                    Bekor qilish
                </button>
            </div>
        </div>
    );

    const totalIncome = transactions?.innerData?.filter(t => t.type === 'kirim')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions?.innerData?.filter(t => t.type === 'chiqim')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;


    // ================================================
    // Refreshdan keyin ham eslab qolish
    useEffect(() => {
        const savedTab = localStorage.getItem('ruberoid-active-tab');
        if (savedTab) {
            setActiveTab(savedTab);
        }
    }, []);

    // Tanlangan tabni o'zgartirish va saqlash
    const handleClick = (tabName) => {
        setActiveTab(tabName);
        localStorage.setItem('ruberoid-active-tab', tabName);

        // Marshrutlarga yo‘naltirish
        if (tabName === 'Harajatlar') {
            navigate('/expense');
        } else if (tabName === 'Maoshlar') {
            navigate('/salary');
        } else if (tabName === 'Sotuv') {
            navigate('/sotuv');
        }
    };


    if (isLoading) return <div>Loading...</div>;
    return (
        <div className="ruberoid-expense-tracker">
            <div className="ruberoid-container">
                <div className="ruberoid-main-content">
                    {/* Form Panel */}
                    <div className="ruberoid-form-panel">
                        <div className="ruberoid-form-panelheader">
                            <button
                                className={activeTab === 'Harajatlar' ? 'active' : ''}
                                onClick={() => handleClick('Harajatlar')}
                            >
                                Harajatlar
                            </button>
                            <button
                                className={activeTab === 'Maoshlar' ? 'active' : ''}
                                onClick={() => handleClick('Maoshlar')}
                            >
                                Maoshlar
                            </button>
                            <button
                                className={activeTab === 'Sotuv' ? 'active' : ''}
                                onClick={() => handleClick('Sotuv')}
                            >
                                Sotuv
                            </button>
                        </div>

                        <div className="ruberoid-balance-cards">
                            <div className="ruberoid-balance-container">
                                {/* Income Card */}
                                <div className="ruberoid-balance-card ruberoid-income-card">
                                    <TrendingUp className="ruberoid-card-icon" />
                                    <div>
                                        <p className="ruberoid-card-label">Kirim</p>
                                        <p className="ruberoid-card-amount">
                                            <GiTakeMyMoney /> {transactions?.innerData
                                                ?.filter(t => t.type === 'kirim' && t.paymentMethod === 'naqt')
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString()} so'm
                                        </p>
                                        <p className="ruberoid-card-amount">
                                            <BsBank /> {transactions?.innerData
                                                ?.filter(t => t.type === 'kirim' && t.paymentMethod === 'bank')
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString()} so'm
                                        </p>
                                        <p className="ruberoid-card-amount">
                                            <BsCurrencyDollar /> {transactions?.innerData
                                                ?.filter(t => t.type === 'kirim' && t.paymentMethod === 'dollar')
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString()} so'm
                                        </p>
                                    </div>
                                </div>

                                {/* Balance Card */}
                                <div className="ruberoid-balance-card ruberoid-total-card">
                                    <GrMoney className="ruberoid-card-icon" />
                                    <div>
                                        <p className="ruberoid-card-label">Balans</p>
                                        <p className={`ruberoid-card-amount ${balance >= 0 ? 'ruberoid-positive' : 'ruberoid-negative'}`}>
                                            <GiTakeMyMoney /> {getBalance?.innerData?.cash?.toLocaleString()} so'm
                                        </p>
                                        <p className={`ruberoid-card-amount ${balance >= 0 ? 'ruberoid-positive' : 'ruberoid-negative'}`}>
                                            <BsBank /> {getBalance?.innerData?.bankTransfer?.toLocaleString()} so'm
                                        </p>
                                        <p className={`ruberoid-card-amount ${balance >= 0 ? 'ruberoid-positive' : 'ruberoid-negative'}`}>
                                            <BsCurrencyDollar />  {getBalance?.innerData?.dollarTransfer?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Expense Card */}
                                <div className="ruberoid-balance-card ruberoid-expense-card">
                                    <TrendingDown className="ruberoid-card-icon" />
                                    <div>
                                        <p className="ruberoid-card-label">Chiqim</p>
                                        <p className="ruberoid-card-amount">
                                            <GiTakeMyMoney /> {transactions?.innerData
                                                ?.filter(t => t.type === 'chiqim' && t.paymentMethod === 'naqt')
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString()} so'm
                                        </p>
                                        <p className="ruberoid-card-amount">
                                            <BsBank /> {transactions?.innerData
                                                ?.filter(t => t.type === 'chiqim' && t.paymentMethod === 'bank')
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString()} so'm
                                        </p>
                                        <p className="ruberoid-card-amount">
                                            <BsCurrencyDollar /> {transactions?.innerData
                                                ?.filter(t => t.type === 'chiqim' && t.paymentMethod === 'dollar')
                                                .reduce((sum, t) => sum + t.amount, 0)
                                                .toLocaleString()} so'm
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className="ruberoid-transaction-form" onSubmit={(e) => e.preventDefault()}>
                            {/* Transaction Type Buttons */}
                            <div className="ruberoid-type-buttons">
                                <button
                                    type="button"
                                    className={`ruberoid-type-btn ${transactionType === 'kirim' ? 'ruberoid-active-income' : ''}`}
                                    onClick={() => {
                                        setTransactionType('kirim');
                                        setCategory('');
                                    }}
                                >
                                    <Plus className="ruberoid-btn-icon" />
                                    Kirim
                                </button>
                                <button
                                    type="button"
                                    className={`ruberoid-type-btn ${transactionType === 'chiqim' ? 'ruberoid-active-expense' : ''}`}
                                    onClick={() => {
                                        setTransactionType('chiqim');
                                        setCategory('');
                                    }}
                                >
                                    <Minus className="ruberoid-btn-icon" />
                                    Chiqim
                                </button>
                            </div>

                            {/* Payment Method */}
                            <div className="ruberoid=form-group">
                                <label className="ruberoid-form-label">To'lov turi</label>
                                <div className="ruberoid-payment-methods">
                                    {Object.entries(paymentMethods).map(([key, value]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`ruberoid-payment-btn ${paymentMethod === key ? 'ruberoid-active-payment' : ''}`}
                                            onClick={() => setPaymentMethod(key)}
                                        >
                                            {key === 'naqt' && <Banknote className="ruberoid-payment-icon" />}
                                            {key === 'dollar' && <DollarSign className="ruberoid-payment-icon" />}
                                            {key === 'bank' && <CreditCard className="ruberoid-payment-icon" />}
                                            {value}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div className="ruberoid-form-group">
                                <label className="ruberoid-form-label">Kategoriya</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="ruberoid-form-select"
                                >
                                    <option value="">Kategoriya tanlang</option>
                                    {categories[transactionType].map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="ruberoid-form-group">
                                <label className="ruberoid-form-label">Summa (so'm)</label>
                                <input
                                    type="text"
                                    value={formattedAmount}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
                                        const numberValue = parseInt(raw || "0", 10);
                                        setAmount(numberValue);
                                        const formatted = numberValue.toLocaleString("uz-UZ");
                                        setFormattedAmount(formatted);
                                    }}
                                    className="ruberoid-form-input"
                                    placeholder="Summani kiriting"
                                />
                            </div>

                            {/* Description */}
                            <div className="ruberoid-form-group">
                                <label className="ruberoid-form-label">Tavsif</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="ruberoid-form-textarea"
                                    placeholder="Qo'shimcha ma'lumot kiriting"
                                    rows="3"
                                />
                            </div>

                            <button onClick={handleSubmit} className="ruberoid-submit-btn">
                                <Plus className="ruberoid-btn-icon" />
                                {transactionType === 'kirim' ? 'Kirim qo\'shish' : 'Chiqim qo\'shish'}
                            </button>
                        </form>
                    </div>

                    {/* Table Panel */}
                    <div className="ruberoid-table-panel">
                        <div className="ruberoid-date-filters">
                            <div className="ruberoid-date-group">
                                <label className="ruberoid-date-label">
                                    <Calendar className="ruberoid-date-icon" />
                                    Boshlanish sanasi
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="ruberoid-date-input"
                                />
                            </div>
                            <div className="ruberoid-date-group">
                                <label className="ruberoid-date-label">
                                    <Calendar className="ruberoid-date-icon" />
                                    Tugash sanasi
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="ruberoid-date-input"
                                />
                            </div>
                        </div>

                        <div className="ruberoid-table-container">
                            <table className="ruberoid-transactions-table">
                                <thead>
                                    <tr>
                                        <th>Tur</th>
                                        <th>Sana</th>
                                        <th>Kategoriya</th>
                                        <th>To'lov</th>
                                        <th>Summa</th>
                                        <th>Tavsif</th>
                                        <th>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="ruberoid-no-data">
                                                Ma'lumotlar topilmadi
                                            </td>
                                        </tr>
                                    ) : (
                                        transactions?.innerData?.map((transaction, inx) => (
                                            <tr key={inx} className="ruberoid-transaction-row">
                                                <td>
                                                    <div className="ruberoid-type-indicator">
                                                        {transaction.type === 'kirim' ? (
                                                            <TrendingUp className="ruberoid-income-icon" />
                                                        ) : (
                                                            <TrendingDown className="ruberoid-expense-icon" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {new Date(transaction.date).toLocaleString('uz-UZ', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: false,
                                                    }).replace(',', '').replace(/\//g, '.')}
                                                </td>
                                                <td>{transaction.category}</td>
                                                <td>
                                                    <span className="ruberoid-payment-badge">
                                                        {paymentMethods[transaction.paymentMethod]}
                                                    </span>
                                                </td>
                                                <td className={transaction.type === 'kirim' ? 'ruberoid-income-amount' : 'ruberoid-expense-amount'}>
                                                    {transaction.amount.toLocaleString()} {transaction.paymentMethod !== "dollar" && "so'm"}
                                                </td>
                                                <td className="ruberoid-description">{transaction.description}</td>
                                                <td className="ruberoid-delete-cell">
                                                    <Popover
                                                        content={popoverContent(transaction._id)}
                                                        title={null}
                                                        trigger="click"
                                                        visible={showPopover === transaction._id}
                                                        onVisibleChange={(visible) => setShowPopover(visible ? transaction._id : null)}
                                                        placement="topRight"
                                                    >
                                                        <button
                                                            onClick={() => togglePopover(transaction._id)}
                                                            className="ruberoid-delete-btn hover:bg-red-600 bg-red-500 text-white p-2 rounded-full transition-colors duration-200"
                                                            title="O'chirish"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </Popover>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

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
                theme="dark"
            />
        </div>
    );
};

export default ExpenseTracker;