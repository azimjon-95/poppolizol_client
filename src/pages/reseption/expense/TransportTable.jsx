import React, { useState } from 'react';
import { useGetTransportsQuery, useMakePaymentMutation } from '../../../context/expenseApi';
import { NumberFormat } from '../../../hook/NumberFormat';
import { FaCar, FaMoneyBillWave, FaTasks, FaCheck, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style/TransportTable.css';

const TransportTable = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('naqt'); // Default payment method: naqt

    // Fetch transports using RTK Query
    const { data: transports = [], isLoading, error } = useGetTransportsQuery();

    // Mutation for making a payment
    const [makePayment] = useMakePaymentMutation();

    const handlePayment = async () => {
        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            toast.error("Iltimos, to'g'ri miqdorni kiriting");
            return;
        }

        try {
            const result = await makePayment({ _id: selectedId, amount: paymentAmount, paymentMethod }).unwrap();
            if (result.state) {
                setIsModalOpen(false);
                toast.success(result.message); // Server message
                // Row removal is handled automatically via invalidatesTags refetching transports
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('To\'lovni amalga oshirishda xato:', error);
            toast.error(error?.data?.message || 'To\'lov amalga oshmadi');
        }
    };

    const openPaymentModal = (id) => {
        setSelectedId(id);
        setPaymentAmount('');
        setPaymentMethod('naqt'); // Reset to default payment method
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="exch_loading"><FaCar className="exch_loading-icon" /> Yuklanmoqda...</div>;
    if (error) {
        toast.error(error?.data?.message || 'Transportlarni yuklash amalga oshmadi');
        return <div className="exch_error"><FaTimes className="exch_error-icon" /> Xato: {error?.data?.message || 'Transportlarni yuklash amalga oshmadi'}</div>;
    }

    return (
        <div className="exch_transport-container">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
            <h1>Transportlar Ro'yxati</h1>
            <table className="exch_transport-table">
                <thead>
                    <tr>
                        <th><span><FaCar className="exch_header-icon" /> Transport</span></th>
                        <th><span><FaMoneyBillWave className="exch_header-icon" /> Balans</span></th>
                        <th><span><FaTasks className="exch_header-icon" /> Harakat</span></th>
                    </tr>
                </thead>
                <tbody>
                    {transports.map((transport) => (
                        <tr key={transport._id}>
                            <td>{transport.transport}</td>
                            <td>{NumberFormat(transport.balance)} so'm</td>
                            <td>
                                <button
                                    className="exch_pay-button"
                                    onClick={() => openPaymentModal(transport._id)}
                                >
                                    <FaMoneyBillWave className="exch_button-icon" /> To'lash
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isModalOpen && (
                <div className="exch_modal-overlay">
                    <div className="exch_modal">
                        <h2><FaMoneyBillWave className="exch_modal-icon" /> To'lov Miqdorini Kiriting</h2>

                        <input
                            className="invoice-form-input"
                            type="text"
                            placeholder="To'lov miqdor"
                            value={paymentAmount ? Number(paymentAmount).toLocaleString('uz-UZ') : ''}
                            onChange={(e) => {
                                // Remove non-numeric characters (e.g., dots, commas)
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                // Only update if the value is empty or a valid non-negative number
                                if (value === '' || (parseFloat(value) >= 0 && !isNaN(value))) {
                                    setPaymentAmount(value);
                                }
                            }}
                            onBlur={() => {
                                // Optional: Ensure the value is formatted when the input loses focus
                                if (paymentAmount) {
                                    setPaymentAmount(parseFloat(paymentAmount).toString());
                                }
                            }}
                            min="0"
                        />
                        <div className="exch_payment-method-buttons">
                            <button
                                className={`exch_method-button ${paymentMethod === 'naqt' ? 'exch_method-button-active' : ''}`}
                                onClick={() => setPaymentMethod('naqt')}
                            >
                                Naqt
                            </button>
                            <button
                                className={`exch_method-button ${paymentMethod === 'bank' ? 'exch_method-button-active' : ''}`}
                                onClick={() => setPaymentMethod('bank')}
                            >
                                Bank
                            </button>
                        </div>
                        <div className="exch_modal-buttons">
                            <button className="exch_submit-button" onClick={handlePayment}>
                                <FaCheck className="exch_button-icon" /> Yuborish
                            </button>
                            <button
                                className="exch_cancel-button"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <FaTimes className="exch_button-icon" /> Bekor qilish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportTable;