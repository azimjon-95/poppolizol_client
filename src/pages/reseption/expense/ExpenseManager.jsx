import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GiTakeMyMoney } from 'react-icons/gi';
import { BsBank } from 'react-icons/bs';
import { GrMoney } from 'react-icons/gr';
import { TrendingUp, TrendingDown, CreditCard, Banknote, Calendar, Award, Plus, Minus } from 'lucide-react';
import { useCreateExpenseMutation, useGetExpensesQuery, useDeleteExpenseMutation, useGetBalanceQuery } from '../../../context/expenseApi';
import TransportTable from './TransportTable';
import DebtComponent from './DebtComponent';
import SalesTable from './SalesTable';
import './style/style.css';
import ExpenseTrackerLoading from './loading/ExpenseTrackerLoading';

const ExpenseTracker = () => {
    const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ruberoid-active-tab') || 'Expenses');
    const [transactionType, setTransactionType] = useState('kirim');
    const [paymentMethod, setPaymentMethod] = useState('naqt');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [formattedAmount, setFormattedAmount] = useState('');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const [startDate, setStartDate] = useState(today.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(tomorrow.toISOString().split('T')[0]);

    const { data: transactions = { innerData: [] }, isLoading } = useGetExpensesQuery({ startDate, endDate });
    const { data: balance = { innerData: { naqt: 0, bank: 0 } }, refetch } = useGetBalanceQuery();
    const [createExpense] = useCreateExpenseMutation();
    // const [deleteExpense] = useDeleteExpenseMutation();

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
            // Umumiy xarajatlar
            'Ish haqi xarajatlari',
            'Bonuslar va mukofotlar',
            'Soliqlar va majburiy to‘lov',
            'Yer solig‘i',
            'Foyda solig‘i',
            'Muj solig‘i',
            'Sof foyda',

            // Kommunal xizmatlar
            'Elektr energiyasi',
            'Gaz ta’minoti',
            'Suv ta’minoti',
            'Suv / kanalizatsiya tizimi xizmatlari',

            // Operatsion xarajatlar
            'Transport xarajatlari',
            'Uskuna ta’miri',
            'Texnik xizmat',
            'Ofis xarajatlari',
            'Ofis mebellari va texnikasi',
            'Ishlab chiqarish vositalari xaridi',

            // Moliyaviy va yuridik xarajatlar
            'Moliyaviy xizmatlar (bank, auditor)',
            'Bank xizmatlari',
            'Buxgalteriya xizmati',
            'Sud va yuridik xarajatlar',

            // Marketing va sifat nazorati
            'Reklama xarajatlari',
            'Sertifikatlash / sifat nazorati',

            // IT va aloqa
            'Internet va aloqa',
            'IT xizmatlar (dasturiy ta’minot)',

            // Kadrlar va rivojlanish
            'Kadrlar o‘qitish / trening',
            'Komandirovka xarajatlari',

            // Boshqa xarajatlar
            'Chiqindilar utilizatsiyasi',
            'Litsenziya va ruxsatnomalar',
            'Oziq ovqat xarajatlari',
            'Avto KAPA xarajati',
            'Avto Qora xarajati',
            'Eksport xarajatlari',
            'USTA va Qurilish ishlari',
            'Ish/chik.xarajatlari',
            'Boshqa xarajatlar (Prochi)'
        ]
    };

    const paymentMethods = {
        naqt: 'Naqt pul',
        bank: 'Bank orqali'
    };

    useEffect(() => {
        localStorage.setItem('ruberoid-active-tab', activeTab);
    }, [activeTab]);

    const handleSubmit = async () => {
        if (!category) return toast.error('Kategoriya tanlanmagan!');
        if (!amount) return toast.error("Summa maydoni to'ldirilmagan!");
        if (parseFloat(amount) <= 0) return toast.error('Summa 0 dan katta bo\'lishi kerak!');

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
            refetch();
            setAmount('');
            setDescription('');
            setCategory('');
            setFormattedAmount('');
            toast.success(`${transactionType === 'kirim' ? 'Kirim' : 'Chiqim'} muvaffaqiyatli qo'shildi!`);
        } catch (error) {
            toast.error(error.data?.message || 'Xatolik yuz berdi!');
        }
    };


    const renderTabContent = () => {
        switch (activeTab) {
            case 'Transport':
                return <TransportTable />;
            case 'Debts':
                return <DebtComponent />;
            case 'Expenses':
            default:
                return (
                    <form className="ruberoid-transaction-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="ruberoid-type-buttons">
                            <button
                                type="button"
                                className={`ruberoid-type-btn ${transactionType === 'kirim' ? 'ruberoid-active-income' : ''}`}
                                onClick={() => { setTransactionType('kirim'); setCategory(''); }}
                            >
                                <Plus className="ruberoid-btn-icon" />
                                Kirim
                            </button>
                            <button
                                type="button"
                                className={`ruberoid-type-btn ${transactionType === 'chiqim' ? 'ruberoid-active-expense' : ''}`}
                                onClick={() => { setTransactionType('chiqim'); setCategory(''); }}
                            >
                                <Minus className="ruberoid-btn-icon" />
                                Chiqim
                            </button>
                        </div>

                        <div className="ruberoid-form-group">
                            <label className="ruberoid-form-label">To'lov turi</label>
                            <div className="ruberoid-payment-methods">
                                {Object.entries(paymentMethods).map(([key, value]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        className={`ruberoid-payment-btn ${paymentMethod === key ? 'ruberoid-active-payment' : ''}`}
                                        onClick={() => setPaymentMethod(key)}
                                    >
                                        {key === 'naqt' ? <Banknote className="ruberoid-payment-icon" /> : <CreditCard className="ruberoid-payment-icon" />}
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>

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

                        <div className="ruberoid-form-group">
                            <label className="ruberoid-form-label">Summa (so'm)</label>
                            <input
                                type="text"
                                value={formattedAmount}
                                onChange={(e) => {
                                    const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
                                    const numberValue = parseInt(raw || '0', 10);
                                    setAmount(numberValue);
                                    setFormattedAmount(numberValue.toLocaleString('uz-UZ'));
                                }}
                                className="ruberoid-form-input"
                                placeholder="Summani kiriting"
                            />
                        </div>

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
                );
        }
    };

    const role = localStorage.getItem("role")
    if (isLoading) return <ExpenseTrackerLoading />

    return (
        <>

            {activeTab === "reports"
                ?
                <SalesTable setActiveTab={setActiveTab} />
                :
                <div className="ruberoid-expense-tracker">

                    <div className={`ruberoid-main-content${role === "direktor" ? "_director" : ""}`}>
                        {role !== "direktor" &&
                            <div className="ruberoid-form-panel">
                                <div className="ruberoid-form-box">
                                    <button
                                        className={activeTab === 'Expenses' ? 'ruberoid-active-tab' : ''}
                                        onClick={() => setActiveTab('Expenses')}
                                    >
                                        Xarajatlar
                                    </button>
                                    <button
                                        className={activeTab === 'Transport' ? 'ruberoid-active-tab' : ''}
                                        onClick={() => setActiveTab('Transport')}
                                    >
                                        Transport
                                    </button>
                                    <button
                                        className={activeTab === 'Debts' ? 'ruberoid-active-tab' : ''}
                                        onClick={() => setActiveTab('Debts')}
                                    >
                                        Qarzlar
                                    </button>
                                    <button
                                        className={activeTab === 'reports' ? 'ruberoid-active-tab' : ''}
                                        onClick={() => setActiveTab('reports')}
                                    >
                                        Ishlab chiqarish hisoboti
                                    </button>
                                </div>

                                <div className="ruberoid-balance-cards">
                                    <div className="ruberoid-balance-container">
                                        <div className="ruberoid-balance-card ruberoid-income-card">
                                            <TrendingUp className="ruberoid-card-icon" />
                                            <div>
                                                <p className="ruberoid-card-label">Kirim</p>
                                                <p className="ruberoid-card-amount">
                                                    <GiTakeMyMoney /> {transactions.innerData
                                                        .filter(t => t.type === 'kirim' && t.paymentMethod === 'naqt')
                                                        .reduce((sum, t) => sum + t - amount, 0)
                                                        .toLocaleString()} so'm
                                                </p>
                                                <p className="ruberoid-card-amount">
                                                    <BsBank /> {transactions.innerData
                                                        .filter(t => t.type === 'kirim' && t.paymentMethod === 'bank')
                                                        .reduce((sum, t) => sum + t.amount, 0)
                                                        .toLocaleString()} so'm
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ruberoid-balance-card ruberoid-total-card">
                                            <GrMoney className="ruberoid-card-icon" />
                                            <div>
                                                <p className="ruberoid-card-label">Balans</p>
                                                <p className={`ruberoid-card-amount ${balance.innerData.naqt >= 0 ? 'ruberoid-positive' : 'ruberoid-negative'}`}>
                                                    <GiTakeMyMoney /> {balance.innerData.naqt.toLocaleString()} so'm
                                                </p>
                                                <p className={`ruberoid-card-amount ${balance.innerData.bank >= 0 ? 'ruberoid-positive' : 'ruberoid-negative'}`}>
                                                    <BsBank /> {balance.innerData.bank.toLocaleString()} so'm
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ruberoid-balance-card ruberoid-expense-card">
                                            <TrendingDown className="ruberoid-card-icon" />
                                            <div>
                                                <p className="ruberoid-card-label">Chiqim</p>
                                                <p className="ruberoid-card-amount">
                                                    <GiTakeMyMoney /> {transactions.innerData
                                                        .filter(t => t.type === 'chiqim' && t.paymentMethod === 'naqt')
                                                        .reduce((sum, t) => sum + t.amount, 0)
                                                        .toLocaleString()} so'm
                                                </p>
                                                <p className="ruberoid-card-amount">
                                                    <BsBank /> {transactions.innerData
                                                        .filter(t => t.type === 'chiqim' && t.paymentMethod === 'bank')
                                                        .reduce((sum, t) => sum + t.amount, 0)
                                                        .toLocaleString()} so'm
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {renderTabContent()}
                            </div>
                        }
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {transactions.innerData.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="ruberoid-no-data">
                                                    Ma'lumotlar topilmadi
                                                </td>
                                            </tr>
                                        ) : (
                                            transactions.innerData.map((transaction, index) => (
                                                <tr key={index} className="ruberoid-transaction-row">
                                                    <td>
                                                        <div className="ruberoid-type-indicator">
                                                            {transaction.category === 'Sof foyda' ? (
                                                                <Award className="ruberoid-profit-icon" />
                                                            ) : transaction.type === 'kirim' ? (
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
                                                        {transaction.amount.toLocaleString()} so'm
                                                    </td>
                                                    <td className="ruberoid-description">{transaction.description}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
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
            }
        </>
    );
};

export default ExpenseTracker;



