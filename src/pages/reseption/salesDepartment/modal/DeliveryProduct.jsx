import React, { useCallback } from 'react';
import { useDeliverProductMutation } from '../../../../context/cartSaleApi';
import { Truck as DeliveryIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import './style.css';


const DeliveryProduct = ({
    deliveryItems,
    handleDeliveryItemChange,
    Modal,
    closeModal,
    modalState
}) => {
    const [deliverProduct] = useDeliverProductMutation();
    const role = localStorage.getItem("role");


    const processDelivery = useCallback(async () => {
        const validItems = deliveryItems
            .filter(item => item.selected && item.deliveryQuantity > 0)
            .map(item => ({
                productId: item._id,
                quantity: item.deliveryQuantity,
            }));

        if (validItems.length === 0) {
            toast.error("Iltimos, yuborish uchun mahsulot va miqdor tanlang");
            return;
        }


        try {
            const updatedSale = await deliverProduct({ saleId: modalState.activeSaleId, items: validItems }).unwrap();

            toast.success(updatedSale.message || "Mahsulotlar muvaffaqiyatli yuborildi!");
            closeModal();
        } catch (error) {
            toast.error("Mahsulotlarni yuborishda xatolik yuz berdi!");
        }
    }, [deliveryItems, modalState.activeSaleId, deliverProduct]);

    return (
        <Modal
            isOpen={modalState.isDeliveryModalOpen}
            onClose={closeModal}
            title="Mahsulot yuborish"
        >
            <div className="invoice-delivery-form">
                <h4>Tanlangan mahsulotlar:</h4>
                {deliveryItems.map((item, index) => {
                    const remaining = (item.quantity || 0) - (item.deliveredQuantity || 0);
                    return (
                        <div key={index} className="invoice-delivery-item">
                            <label>
                                {
                                    role !== "director" && (
                                        <input
                                            type="checkbox"
                                            checked={item.selected || false}
                                            onChange={(e) => handleDeliveryItemChange(index, 'selected', e.target.checked)}
                                        />
                                    )
                                }
                                {item.productName || 'Noma\'lum'} ({item.category || 'Noma\'lum'})
                            </label>
                            <div>
                                Buyurtma qilingan: {(item.quantity || 0).toLocaleString()} {item.size || 'dona'}
                            </div>
                            <div>
                                Yuborilgan: {(item.deliveredQuantity || 0).toLocaleString()} {item.size || 'dona'}
                            </div>
                            <div>
                                Qoldiq: {remaining.toLocaleString()} {item.size || 'dona'}
                            </div>
                            {item.selected && (
                                <input
                                    type="number"
                                    min="1"
                                    max={remaining}
                                    value={item.deliveryQuantity || ''}
                                    placeholder={`Yuborish miqdori: ${remaining}`}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= remaining)) {
                                            handleDeliveryItemChange(index, 'deliveryQuantity', value === '' ? '' : parseInt(value));
                                        }
                                    }}
                                />
                            )}
                        </div>
                    );
                })}
                {
                    role !== "director" && (
                        <button
                            className="invoice-btn invoice-btn-success"
                            onClick={() => processDelivery()}
                            disabled={!deliveryItems.some(item => item.selected && item.deliveryQuantity > 0)}
                        >
                            <DeliveryIcon size={16} />
                            Yuborishni tasdiqlash
                        </button>
                    )
                }
            </div>
        </Modal>
    )
}

export default DeliveryProduct
