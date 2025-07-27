import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import { useDeliverProductMutation } from '../../../../context/cartSaleApi';
import { Truck as DeliveryIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { QRCodeCanvas } from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import { NumberFormat } from '../../../../hook/NumberFormat';
import './style.css';

const DeliveryProduct = ({
    deliveryItems,
    handleDeliveryItemChange,
    Modal,
    closeModal,
    modalState,
}) => {
    const [deliverProduct] = useDeliverProductMutation();
    const role = localStorage.getItem('role');
    const contentRef = useRef();
    const [printData, setPrintData] = useState(null);

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

    // PrintData o‘zgarsa va DOM tayyor bo‘lsa, avtomatik chop qilish
    useEffect(() => {
        if (printData) {
            const timeout = setTimeout(() => {
                reactToPrintFn();
                setPrintData(null); // Keyingi holatga tayyorlash
            }, 300); // DOM tayyor bo‘lishi uchun kutish

            return () => clearTimeout(timeout);
        }
    }, [printData]);

    const validItems = useMemo(() =>
        deliveryItems
            .filter(item => item.selected && item.deliveryQuantity > 0)
            .map(item => ({
                productId: item._id,
                quantity: item.deliveryQuantity,
                productName: item.productName,
                size: item.size,
                pricePerUnit: item.pricePerUnit,
                discountedPrice: item.discountedPrice,
            })),
        [deliveryItems]
    );

    const processDelivery = useCallback(async () => {
        if (validItems.length === 0) {
            toast.error("Iltimos, yuborish uchun mahsulot va miqdor tanlang");
            return;
        }
        try {
            const updatedSale = await deliverProduct({
                saleId: modalState.activeSaleId,
                items: validItems,
            }).unwrap();
            setPrintData({
                saleId: modalState.activeSaleId,
                items: validItems,
                createdAt: new Date()
            });
            toast.success(updatedSale.message || "Mahsulotlar yuborildi!");
            closeModal();
        } catch {
            toast.error("Mahsulotlarni yuborishda xatolik yuz berdi!");
        }
    }, [validItems, modalState.activeSaleId, deliverProduct, closeModal]);

    const calculateItemTotal = (item) => {
        const price = item.discountedPrice ?? item.pricePerUnit ?? 0;
        return price * item.quantity;
    };

    const totalAmount = (printData?.items || []).reduce((sum, item) => sum + calculateItemTotal(item), 0);

    return (
        <>
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
                            <div key={item._id || index} className="invoice-delivery-item">
                                <label>
                                    {role !== 'direktor' && (<>
                                        {
                                            remaining > 0 &&
                                            <input
                                                type="checkbox"
                                                checked={item.selected || false}
                                                onChange={(e) =>
                                                    handleDeliveryItemChange(index, 'selected', e.target.checked)
                                                }
                                            />
                                        }</>)

                                    }
                                    {item.productName || 'Noma\'lum'} ({item.category || 'Noma\'lum'})
                                </label>
                                <div>Buyurtma qilingan: {(item.quantity || 0).toLocaleString()} {item.size || 'dona'}</div>
                                <div>Yuborilgan: {(item.deliveredQuantity || 0).toLocaleString()} {item.size || 'dona'}</div>
                                <div>Qoldiq: {remaining.toLocaleString()} {item.size || 'dona'}</div>
                                {item.selected && (

                                    <input
                                        type="number"
                                        min="1"
                                        max={remaining}
                                        value={item.deliveryQuantity || ''}
                                        placeholder={`Yuborish miqdori: ${remaining}`}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= remaining)) {
                                                handleDeliveryItemChange(index, 'deliveryQuantity', val === '' ? '' : parseInt(val));
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                    {role !== 'direktor' && (
                        <button
                            className="invoice-btn invoice-btn-success"
                            onClick={processDelivery}
                            disabled={!validItems.length}
                        >
                            <DeliveryIcon size={16} /> Yuborishni tasdiqlash
                        </button>
                    )}
                </div>
            </Modal>

            {printData && (
                <div ref={contentRef} className="card-doc-wrapper">
                    <h2 className="card-doc-title">
                        YUK XATLAMASI №{printData.saleId?.slice(-4)}
                    </h2>
                    <p className="card-doc-date">
                        {new Date(printData.createdAt).toLocaleDateString('uz-UZ')} yil
                    </p>
                    <div className="card-doc-info">
                        <p><strong>Yuboruvchi:</strong> "SELEN BUNYODKOR" MCHJ</p>
                        <p><strong>Manzil:</strong> Namangan viloyati, Pop tumani, Gilkor MFY, Istiqbol</p>
                        <p><strong>Mijoz:</strong> {modalState?.customerName || 'Noma\'lum'}</p>
                        <p><strong>Avtotransport:</strong> {modalState?.transport || 'Belgilanmagan'}</p>
                    </div>
                    <table className="card-doc-table">
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
                            {printData.items.map((item, index) => {
                                const price = item.discountedPrice ?? item.pricePerUnit ?? 0;
                                return (
                                    <tr key={item.productId + '-' + index}>
                                        <td>{index + 1}</td>
                                        <td>{item.productName}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.size}</td>
                                        <td>{NumberFormat(price)}</td>
                                        <td>{NumberFormat(calculateItemTotal(item))}</td>
                                    </tr>
                                );
                            })}
                            <tr className="card-doc-total">
                                <td colSpan="5">Jami:</td>
                                <td>{NumberFormat(totalAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="card-doc-contact">
                        Biz bilan ishlaganingizdan minnatdormiz! Taklif va shikoyatlar uchun QR kodni skanerlang yoki quyidagi
                        raqamlarga qo‘ng‘iroq qiling: +998 94 184 10 00, +998 33 184 10 00
                    </p>
                    <div className="card-doc-sign">
                        <div><strong>Berdi:</strong> _____________________</div>
                        <div className="card-doc-qr">
                            <QRCodeCanvas value={window.location.origin + '/feedback'} size={100} />
                        </div>
                        <div><strong>Oldim:</strong> _____________________</div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DeliveryProduct;
