import React, { useState } from 'react';
import { Package, Calendar, Zap, Flame, Building2, DollarSign, Hash, Factory, Eye, X } from 'lucide-react';
import {
    useGetProductionHistoryQuery
} from "../../../context/productionApi";
import './style.css';

const ProductionHistoryTable = () => {
    const [selectedMaterials, setSelectedMaterials] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openMaterialsModal = (materials) => {
        setSelectedMaterials(materials);
        setIsModalOpen(true);
    };

    const closeMaterialsModal = () => {
        setIsModalOpen(false);
        setSelectedMaterials(null);
    };
    const {
        data: productionHistory,
        isLoading: historyLoading,
        error: historyError,
    } = useGetProductionHistoryQuery();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Oy 0 dan boshlanadi
        const year = date.getFullYear();
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');

        return `${day}.${month}.${year} ${hour}:${minute}`;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
    };

    const calculateMaterialsCost = (materials) => {
        return materials.reduce((total, material) =>
            total + (material.quantityUsed * material.unitPrice), 0
        );
    };

    if (historyError) {
        toast.error(
            historyError.data?.message ||
            "Ishlab chiqarish tarixini olishda xatolik yuz berdi",
            { toastId: "history-error" }
        );
    }
    return (
        <>
            <div className="history-list">
                {historyLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Ma'lumotlar yuklanmoqda...</p>
                    </div>
                ) : productionHistory?.length > 0 ? (
                    <div className="ruberoid-table-wrapper">
                        <div className="ruberoid-table-container">
                            <table className="ruberoid-production-table">
                                <thead className="ruberoid-table-header">
                                    <tr>
                                        <th className="ruberoid-th ruberoid-th-product">
                                            <Package className="ruberoid-header-icon" />
                                            Mahsulot
                                        </th>
                                        <th className="ruberoid-th ruberoid-th-quantity">
                                            <Hash className="ruberoid-header-icon" />
                                            Miqdor
                                        </th>
                                        <th className="ruberoid-th ruberoid-th-date">
                                            <Calendar className="ruberoid-header-icon" />
                                            Sana
                                        </th>
                                        <th className="ruberoid-th ruberoid-th-utilities">
                                            <Zap className="ruberoid-header-icon" />
                                            Kommunal
                                        </th>
                                        <th className="ruberoid-th ruberoid-th-cost">
                                            <DollarSign className="ruberoid-header-icon" />
                                            Xarajat
                                        </th>
                                        <th className="ruberoid-th ruberoid-th-materials">
                                            Xom ashyo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="ruberoid-table-body">
                                    {productionHistory.map((production, index) => (
                                        <tr key={production._id} className="ruberoid-table-row">
                                            <td className="ruberoid-td ruberoid-product-cell">
                                                <div className="ruberoid-product-info">
                                                    <div className="ruberoid-product-badge">
                                                        <Package className="ruberoid-product-icon" />
                                                        <span className="ruberoid-product-name">{production.productName}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="ruberoid-td ruberoid-quantity-cell">
                                                <div className="ruberoid-quantity-badge">
                                                    {production.quantityProduced} dona
                                                </div>
                                            </td>

                                            <td >
                                                <div className="ruberoid-dateinfo">
                                                    <div className="ruberoid-date-main"></div>
                                                    <div className="ruberoid-date-created">Yaratilgan: {formatDate(production.createdAt)}</div>
                                                </div>
                                            </td>

                                            <td className="ruberoid-td ruberoid-utilities-cell">
                                                <div className="ruberoid-utilities-grid">
                                                    <div className="ruberoid-utility-item ruberoid-electricity">
                                                        <Zap className="ruberoid-utility-icon" />
                                                        <span>{production.electricity} kWt</span>
                                                    </div>
                                                    <div className="ruberoid-utility-item ruberoid-gas">
                                                        <Flame className="ruberoid-utility-icon" />
                                                        <span>{production.gasAmount} m³</span>
                                                    </div>
                                                </div>
                                            </td>


                                            <td className="ruberoid-td ruberoid-cost-cell">
                                                <div className="ruberoid-cost-info">
                                                    <div className="ruberoid-total-cost">{formatCurrency(production.totalCost)}</div>
                                                    <div className="ruberoid-materials-cost">
                                                        Xom ashyo: {formatCurrency(calculateMaterialsCost(production.materialsUsed))}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="ruberoid-td ruberoid-materials-cell">
                                                <button
                                                    className="ruberoid-materials-btn"
                                                    onClick={() => openMaterialsModal(production.materialsUsed)}
                                                >
                                                    <Eye className="ruberoid-materials-btn-icon" />
                                                    Xom ashyolarni ko'rish ({production.materialsUsed.length})
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <History size={64} />
                        </div>
                        <div className="empty-content">
                            <h3 className="empty-title">
                                Hozircha ishlab chiqarish tarixi yo'q
                            </h3>
                            <p className="empty-description">
                                Birinchi ruberoid partiyasini ishlab chiqaring va bu yerda
                                ko'ring
                            </p>
                        </div>
                    </div>
                )}
            </div>



            {/* Materials Modal */}
            {isModalOpen && selectedMaterials && (
                <div className="ruberoid-modal-overlay" onClick={closeMaterialsModal}>
                    <div className="ruberoid-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="ruberoid-modal-header">
                            <h2 className="ruberoid-modal-title">
                                <Package className="ruberoid-modal-title-icon" />
                                Ishlatilgan xom ashyolar
                            </h2>
                            <button
                                className="ruberoid-modal-close-btn"
                                onClick={closeMaterialsModal}
                            >
                                <X className="ruberoid-modal-close-icon" />
                            </button>
                        </div>

                        <div className="ruberoid-modal-content">
                            <div className="ruberoid-modal-stats">
                                <div className="ruberoid-modal-stat">
                                    <span className="ruberoid-modal-stat-label">Jami materiallar:</span>
                                    <span className="ruberoid-modal-stat-value">{selectedMaterials.length} ta</span>
                                </div>
                                <div className="ruberoid-modal-stat">
                                    <span className="ruberoid-modal-stat-label">Umumiy qiymat:</span>
                                    <span className="ruberoid-modal-stat-value">
                                        {formatCurrency(calculateMaterialsCost(selectedMaterials))}
                                    </span>
                                </div>
                            </div>

                            <div className="ruberoid-modal-materials-grid">
                                {selectedMaterials.map((material, index) => (
                                    <div key={material._id} className="ruberoid-modal-material-card">
                                        <div className="ruberoid-modal-material-header">
                                            <div className="ruberoid-modal-material-number">
                                                #{index + 1}
                                            </div>
                                            <h3 className="ruberoid-modal-material-name">
                                                {material.materialName}
                                            </h3>
                                        </div>

                                        <div className="ruberoid-modal-material-details">
                                            <div className="ruberoid-modal-material-row">
                                                <span className="ruberoid-modal-material-label">Miqdor:</span>
                                                <span className="ruberoid-modal-material-value ruberoid-quantity-highlight">
                                                    {material.quantityUsed}
                                                </span>
                                            </div>

                                            <div className="ruberoid-modal-material-row">
                                                <span className="ruberoid-modal-material-label">Birlik narxi:</span>
                                                <span className="ruberoid-modal-material-value">
                                                    {formatCurrency(material.unitPrice)}
                                                </span>
                                            </div>

                                            <div className="ruberoid-modal-material-divider"></div>

                                            <div className="ruberoid-modal-material-row ruberoid-modal-material-total">
                                                <span className="ruberoid-modal-material-label">Jami:</span>
                                                <span className="ruberoid-modal-material-value ruberoid-total-highlight">
                                                    {formatCurrency(material.quantityUsed * material.unitPrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductionHistoryTable;