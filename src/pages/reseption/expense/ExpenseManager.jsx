import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { FaMoneyBillWave, FaList, FaPlusCircle, FaTimes } from 'react-icons/fa';
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import './ExpenseManager.css';
import { useGetExpensesQuery, useCreateExpenseMutation } from '../../../context/expenseApi';
import { chiqimOptions, kirimOptions } from '../../../utils/categories';

// Notification Component
const Notification = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onClose();
        }, 3000); // Auto-dismiss after 3 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!visible) return null;

    return (
        <div className={`notification ${type}`}>
            <span>{message}</span>
            <button className="notificationClose" onClick={() => { setVisible(false); onClose(); }}>
                <FaTimes />
            </button>
        </div>
    );
};

const ExpenseManager = () => {
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        type: 'chiqim',
        category: '',
        description: '',
        paymentType: 'naqt',
    });
    const [error, setError] = useState('');
    const [notification, setNotification] = useState(null);

    const categoryOptions = formData.type === 'kirim' ? kirimOptions : chiqimOptions;

    const [createExpense, { isLoading: isCreating }] = useCreateExpenseMutation();
    const { data: expenses, refetch, isLoading: isFetching } = useGetExpensesQuery();

    const handleInputChange = (e, field, value) => {
        if (field) {
            setFormData({ ...formData, [field]: value });
        } else {
            const { name, value } = e.target;
            setFormData({
                ...formData,
                [name]: name === 'amount' ? Number(value) : value,
            });
        }
    };

    const handleCategoryChange = (selectedOption) => {
        setFormData({ ...formData, category: selectedOption ? selectedOption.value : '' });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.amount <= 0) {
            setError('Miqdori 0 dan katta bo‘lishi kerak!');
            return;
        }
        if (!formData.type) {
            setError('Turi tanlanmagan!');
            return;
        }
        if (!formData.paymentType) {
            setError('To‘lov turi tanlanmagan!');
            return;
        }
        setError('');
        try {
            await createExpense(formData).unwrap();
            setFormData({
                name: '',
                amount: '',
                type: 'chiqim',
                category: '',
                description: '',
                paymentType: 'naqt',
            });
            refetch();
            showNotification('Xarajat muvaffaqiyatli yaratildi!', 'success');
        } catch (error) {
            setError('Xarajat yaratishda xatolik: ' + error.message);
        }
    };

    return (
        <div className="xarajatBoshqaruvKonteyner">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}
            <div className="xarajatGridTartibi">
                {/* Forma */}
                <div className="formaBlokiKonteyner">
                    <h2 className="formaSarlavhaMatni">
                        <FaPlusCircle className="ikonaElementi" /> Yangi Xarajat Qo‘shish
                    </h2>
                    <form onSubmit={handleSubmit} className="xarajatFormasi">
                        <div className="formaGuruhiflexBox">
                            <div className="formaGuruhiBlok">
                                <label className="formaYorligiMatn">Turi</label>
                                <div >
                                    <button
                                        type="button"
                                        className={`selectionButton ${formData.type === 'kirim' ? 'active' : ''}`}
                                        onClick={() => handleInputChange(null, 'type', 'kirim')}
                                    >
                                        Kirim (Daromad)
                                    </button>
                                    <button
                                        type="button"
                                        className={`selectionButton ${formData.type === 'chiqim' ? 'active' : ''}`}
                                        onClick={() => handleInputChange(null, 'type', 'chiqim')}
                                    >
                                        Chiqim (Xarajat)
                                    </button>
                                </div>
                            </div>

                            <div className="formaGuruhiBlok">
                                <label className="formaYorligiMatn">To‘lov Turi</label>
                                <div >
                                    <button
                                        type="button"
                                        className={`selectionButton ${formData.paymentType === 'naqt' ? 'active' : ''}`}
                                        onClick={() => handleInputChange(null, 'paymentType', 'naqt')}
                                    >
                                        Naqd
                                    </button>
                                    <button
                                        type="button"
                                        className={`selectionButton ${formData.paymentType === 'karta' ? 'active' : ''}`}
                                        onClick={() => handleInputChange(null, 'paymentType', 'karta')}
                                    >
                                        Karta
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="formaGuruhiBlok">
                            <label className="formaYorligiMatn">Nomi</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="formaKiritishMaydoni"
                                placeholder="Xarajat nomini kiriting"
                            />
                        </div>
                        <div className="formaGuruhiBlok">
                            <label className="formaYorligiMatn">Miqdori</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                required
                                min="1"
                                className="formaKiritishMaydoni"
                                placeholder="Miqdorni kiriting"
                            />
                            {error && <p className="xatoMatni" style={{ color: 'red' }}>{error}</p>}
                        </div>

                        <div className="formaGuruhiBlok">
                            <label className="formaYorligiMatn">Kategoriya</label>
                            <Select
                                options={categoryOptions}
                                onChange={handleCategoryChange}
                                placeholder="Kategoriyani tanlang"
                                className="formaTanlovKonteyner"
                                classNamePrefix="react-select"
                            />
                        </div>
                        <div className="formaGuruhiBlok">
                            <label className="formaYorligiMatn">Tavsif</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="formaMatnMaydoni"
                                placeholder="Tavsifni kiriting"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="formaTugmaElementi"
                        >
                            <FaMoneyBillWave className="ikonaElementi" /> {isCreating ? 'Yaratilmoqda...' : 'Xarajat Yaratish'}
                        </button>
                    </form>
                </div>

                {/* Jadval */}
                <div className="jadvalBlokiKonteyner">
                    <h2 className="jadvalSarlavhaMatni">
                        <FaList className="ikonaElementi" /> Xarajatlar Ro‘yxati
                    </h2>
                    {isFetching ? (
                        <p className="yuklashMatni">Xarajatlar yuklanmoqda...</p>
                    ) : (
                        <div className="jadvalOralganKonteyner">
                            <table className="xarajatJadvali">
                                <thead className="jadvalSarlavhaQatori">
                                    <tr>
                                        <th className="jadvalUyasigi">Turi</th>
                                        <th className="jadvalUyasigi">Nomi</th>
                                        <th className="jadvalUyasigi">Miqdori</th>
                                        <th className="jadvalUyasigi">Kategoriya</th>
                                        <th className="jadvalUyasigi">To‘lov</th>
                                        <th className="jadvalUyasigi">Sana</th>
                                    </tr>
                                </thead>
                                <tbody className="jadvalTanaQismi">
                                    {expenses && expenses?.innerData?.length > 0 ? (
                                        expenses?.innerData?.map((expense) => (
                                            <tr key={expense._id} className="jadvalQatorElementi">
                                                <td className="jadvalUyasigiMatn">
                                                    {expense.type === 'kirim' ? (
                                                        <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <AiOutlineCaretDown />
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'red', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            <AiOutlineCaretUp />
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="jadvalUyasigiMatn">{expense.name}</td>
                                                <td className="jadvalUyasigiMatn">{expense.amount}</td>
                                                <td className="jadvalUyasigiMatn">{expense.category}</td>
                                                <td className="jadvalUyasigiMatn">{expense.paymentType}</td>
                                                <td className="jadvalUyasigiMatn">{new Date(expense.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="maLumatYoqUyasigi">
                                                Xarajatlar topilmadi.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExpenseManager;