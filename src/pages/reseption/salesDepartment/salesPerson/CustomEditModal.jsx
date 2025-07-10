import React from 'react';
import './customModal.css'; // Importing the previously created styles
import { Trash2, Edit } from 'react-feather'; // Keep existing icons
import { Select } from 'antd'; // Keep Ant Design Select
const { Option } = Select;

const CustomModal = ({
    isOpen,
    onClose,
    title,
    editSaleData,
    setEditSaleData,
    modalState,
    processUpdateSale,
    formatNumber,
    parseNumber,
    NumberFormat,
}) => {
    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay">
            <div className="custom-modal">
                <div className="custom-modal-header">
                    <h3 className="custom-modal-title">{title}</h3>
                    <button className="custom-modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="custom-modal-body">
                    <div className="invoice-edit-form">
                        {/* Customer Information */}
                        <div className="invoice-edit-section">
                            <h4>Mijoz ma'lumotlari:</h4>
                            <input
                                className="invoice-form-input"
                                type="text"
                                placeholder="Mijoz ismi"
                                value={editSaleData.customer?.name || ''}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({
                                        ...prev,
                                        customer: { ...prev.customer, name: e.target.value },
                                    }))
                                }
                            />
                            <input
                                className="invoice-form-input"
                                type="text"
                                placeholder="Mijoz kompaniyasi"
                                value={editSaleData.customer?.company || ''}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({
                                        ...prev,
                                        customer: { ...prev.customer, company: e.target.value },
                                    }))
                                }
                            />
                            <input
                                className="invoice-form-input"
                                type="tel"
                                placeholder="Telefon raqami"
                                value={editSaleData.customer?.phone || ''}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({
                                        ...prev,
                                        customer: { ...prev.customer, phone: e.target.value },
                                    }))
                                }
                            />
                            <input
                                className="invoice-form-input"
                                type="text"
                                placeholder="Manzil"
                                value={editSaleData.customer?.address || ''}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({
                                        ...prev,
                                        customer: { ...prev.customer, address: e.target.value },
                                    }))
                                }
                            />
                        </div>

                        {/* Sale Information */}
                        <div className="invoice-edit-section">
                            <h4>Sotuv ma'lumotlari:</h4>
                            <input
                                className="invoice-form-input"
                                type="text"
                                placeholder="Transport"
                                value={editSaleData.transport || ''}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({ ...prev, transport: e.target.value }))
                                }
                            />
                            <input
                                className="invoice-form-input"
                                type="text"
                                placeholder="Sotuvchi"
                                value={editSaleData.salesperson}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({ ...prev, salesperson: e.target.value }))
                                }
                            />
                            <input
                                className="invoice-form-input"
                                type="date"
                                value={
                                    editSaleData.date
                                        ? new Date(editSaleData.date).toISOString().split('T')[0]
                                        : ''
                                }
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({ ...prev, date: e.target.value }))
                                }
                            />
                            <input
                                className="invoice-form-input"
                                type="time"
                                value={editSaleData.time || ''}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({ ...prev, time: e.target.value }))
                                }
                            />
                        </div>

                        {/* Payment Information */}
                        <div className="invoice-edit-section">
                            <h4>To'lov ma'lumotlari:</h4>
                            <input
                                className="invoice-form-input"
                                type="text"
                                placeholder="Jami summa"
                                value={formatNumber(editSaleData.payment?.totalAmount || 0)}
                                onChange={(e) => {
                                    const rawValue = parseNumber(e.target.value);
                                    if (!isNaN(rawValue)) {
                                        setEditSaleData((prev) => ({
                                            ...prev,
                                            payment: {
                                                ...prev.payment,
                                                totalAmount: rawValue,
                                                debt: rawValue - (prev.payment?.paidAmount || 0),
                                            },
                                        }));
                                    }
                                }}
                            />
                            <input
                                className="invoice-form-input"
                                type="text"
                                placeholder="To'langan summa"
                                value={formatNumber(editSaleData.payment?.paidAmount || 0)}
                                onChange={(e) => {
                                    const rawValue = parseNumber(e.target.value);
                                    if (!isNaN(rawValue)) {
                                        const totalAmount = editSaleData.payment?.totalAmount || 0;
                                        const newDebt = totalAmount - rawValue;
                                        setEditSaleData((prev) => ({
                                            ...prev,
                                            payment: {
                                                ...prev.payment,
                                                paidAmount: rawValue,
                                                debt: Math.max(0, newDebt),
                                                status: newDebt <= 0 ? 'paid' : 'partial',
                                            },
                                        }));
                                    }
                                }}
                            />
                            <Select
                                className="invoice-form-select"
                                value={editSaleData.payment?.paymentType || 'naqt'}
                                onChange={(value) =>
                                    setEditSaleData((prev) => ({
                                        ...prev,
                                        payment: { ...prev.payment, paymentType: value },
                                    }))
                                }
                                style={{ width: '100%' }}
                            >
                                <Option value="naqt">Naqt pul</Option>
                                <Option value="bank">Bank o'tkazmasi</Option>
                            </Select>
                        </div>

                        {/* Items Section */}
                        <div className="invoice-edit-section">
                            <h4>Mahsulotlar:</h4>
                            <div className="invoice-items-edit">
                                {editSaleData.items?.map((item, index) => (
                                    <div key={index} className="invoice-item-edit">
                                        <div className="invoice-item-edit-row">
                                            <input
                                                className="invoice-form-input"
                                                type="text"
                                                placeholder="Mahsulot nomi"
                                                value={item.productName || ''}
                                                onChange={(e) => {
                                                    const newItems = [...(editSaleData.items || [])];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        productName: e.target.value,
                                                    };
                                                    setEditSaleData((prev) => ({ ...prev, items: newItems }));
                                                }}
                                            />
                                            <input
                                                className="invoice-form-input"
                                                type="text"
                                                placeholder="Kategoriya"
                                                value={item.category || ''}
                                                onChange={(e) => {
                                                    const newItems = [...(editSaleData.items || [])];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        category: e.target.value,
                                                    };
                                                    setEditSaleData((prev) => ({ ...prev, items: newItems }));
                                                }}
                                            />
                                        </div>
                                        <div className="invoice-item-edit-row">
                                            <input
                                                className="invoice-form-input"
                                                type="number"
                                                placeholder="Miqdor"
                                                value={item.quantity || ''}
                                                onChange={(e) => {
                                                    const newItems = [...(editSaleData.items || [])];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        quantity: parseFloat(e.target.value) || 0,
                                                    };
                                                    setEditSaleData((prev) => ({ ...prev, items: newItems }));
                                                }}
                                            />
                                            <input
                                                className="invoice-form-input"
                                                type="text"
                                                placeholder="Narx"
                                                value={formatNumber(item.discountedPrice || 0)}
                                                onChange={(e) => {
                                                    const rawValue = parseNumber(e.target.value);
                                                    if (!isNaN(rawValue)) {
                                                        const newItems = [...(editSaleData.items || [])];
                                                        newItems[index] = {
                                                            ...newItems[index],
                                                            discountedPrice: rawValue,
                                                        };
                                                        setEditSaleData((prev) => ({ ...prev, items: newItems }));
                                                    }
                                                }}
                                            />
                                            <input
                                                className="invoice-form-input"
                                                type="number"
                                                placeholder="QQS %"
                                                value={item.ndsRate || ''}
                                                onChange={(e) => {
                                                    const newItems = [...(editSaleData.items || [])];
                                                    const ndsRate = parseFloat(e.target.value) || 0;
                                                    const ndsAmount =
                                                        (item.discountedPrice || 0) *
                                                        (item.quantity || 0) *
                                                        ndsRate /
                                                        100;
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        ndsRate: ndsRate,
                                                        ndsAmount: ndsAmount,
                                                    };
                                                    setEditSaleData((prev) => ({ ...prev, items: newItems }));
                                                }}
                                            />
                                        </div>
                                        <div className="invoice-item-edit-row">
                                            <input
                                                className="invoice-form-input"
                                                type="text"
                                                placeholder="O'lchov birligi"
                                                value={item.size || ''}
                                                onChange={(e) => {
                                                    const newItems = [...(editSaleData.items || [])];
                                                    newItems[index] = {
                                                        ...newItems[index],
                                                        size: e.target.value,
                                                    };
                                                    setEditSaleData((prev) => ({ ...prev, items: newItems }));
                                                }}
                                            />
                                            <button
                                                className="invoice-btn invoice-btn-danger"
                                                onClick={() => {
                                                    const newItems =
                                                        editSaleData.items?.filter((_, i) => i !== index) || [];
                                                    setEditSaleData((prev) => ({ ...prev, items: newItems }));
                                                }}
                                            >
                                                <Trash2 size={16} />
                                                O'chirish
                                            </button>
                                        </div>
                                        <div className="invoice-item-total">
                                            Jami: {NumberFormat((item.quantity || 0) * (item.discountedPrice || 0))}{' '}
                                            so'm
                                        </div>
                                    </div>
                                )) || <p>Mahsulotlar mavjud emas</p>}
                            </div>
                        </div>

                        {/* Notes Section */}
                        <div className="invoice-edit-section">
                            <h4>Qo'shimcha ma'lumotlar:</h4>
                            <textarea
                                className="invoice-form-input"
                                placeholder="Izoh yoki qo'shimcha ma'lumotlar"
                                value={editSaleData.notes || ''}
                                onChange={(e) =>
                                    setEditSaleData((prev) => ({ ...prev, notes: e.target.value }))
                                }
                                rows="3"
                            />
                        </div>

                        <div className="invoice-edit-buttons">
                            <button
                                className="invoice-btn invoice-btn-success"
                                onClick={() => processUpdateSale(modalState.activeSaleId)}
                                disabled={!editSaleData.customer?.name && !editSaleData.customer?.company}
                            >
                                <Edit size={16} />
                                Saqlash
                            </button>
                            <button
                                className="invoice-btn invoice-btn-secondary"
                                onClick={onClose}
                            >
                                Bekor qilish
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomModal;