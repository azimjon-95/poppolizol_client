import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import {
    useCreateCategoryMutation,
    useGetAllCategoriesQuery,
    useDeleteCategoryMutation,
    useUpdateCategoryMutation
} from '../../../context/categoryApi';
import './styles/ProductManagement.css';

const CatigoryManagement = () => {
    // Consolidated form state
    const [formData, setFormData] = useState({
        category: '',
        productName: '',
        productionCost: '',
        loadingCost: ''
    });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [editId, setEditId] = useState(null);
    const [availableProducts, setAvailableProducts] = useState([]);

    // Product lists
    const productLists = {
        Polizol: [
            'Polizol 0.5 mm', 'Polizol 1 mm', 'Polizol 1.5 mm',
            'Polizol 2 mm', 'Polizol 2.5 mm', 'Polizol 3 mm', 'Polizol 4 mm'
        ],
        Folygoizol: [
            'Folygoizol 1 mm', 'Folygoizol 2 mm', 'Folygoizol 2.5 mm',
            'Folygoizol 3 mm', 'Folygoizol 4 mm'
        ],
        Ruberoid: [
            'Ruberoid RKP-250 9m (Yupqa)', 'Ruberoid RKP-250 10m (Yupqa)',
            'Ruberoid RKP-250 15m (Yupqa)', 'Ruberoid RKP-300 9m (O\'rta)',
            'Ruberoid RKP-300 15m (O\'rta)', 'Ruberoid RKP-350 10m (Qalin)',
            'Ruberoid RKP-350 15m (Qalin)'
        ]
    };

    // API hooks
    const { data: products = [], isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
    const [createProduct, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateProduct] = useUpdateCategoryMutation();
    const [deleteProduct] = useDeleteCategoryMutation();

    // Update available products when category changes
    useEffect(() => {
        setAvailableProducts(productLists[formData.category] || []);
        setFormData(prev => ({ ...prev, productName: '' }));
    }, [formData.category]);

    // Show notification
    const showNotification = useCallback((message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }, []);

    // Handle form input changes
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }, []);

    // Clear form
    const clearForm = useCallback(() => {
        setFormData({
            category: '',
            productName: '',
            productionCost: '',
            loadingCost: ''
        });
        setEditId(null);
    }, []);

    // Validate form
    const validateForm = useCallback(() => {
        const { category, productName, productionCost, loadingCost } = formData;
        if (!category || !productName || !productionCost || !loadingCost) {
            showNotification("Barcha maydonlarni to'ldiring!", 'error');
            return false;
        }
        if (isNaN(parseFloat(productionCost)) || isNaN(parseFloat(loadingCost))) {
            showNotification("Narxlar raqam bo'lishi kerak!", 'error');
            return false;
        }
        return true;
    }, [formData, showNotification]);

    // Handle product submission (create or update)
    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;

        const productData = {
            name: formData.productName,
            category: formData.category,
            productionCost: parseFloat(formData.productionCost),
            loadingCost: parseFloat(formData.loadingCost),
            createdAt: editId ? undefined : new Date().toLocaleDateString('uz-UZ')
        };

        try {
            if (editId) {
                await updateProduct({ id: editId, ...productData }).unwrap();
                showNotification('Mahsulot muvaffaqiyatli yangilandi!', 'success');
            } else {
                await createProduct(productData).unwrap();
                showNotification('Mahsulot muvaffaqiyatli qo\'shildi!', 'success');
            }
            clearForm();
        } catch (error) {
            showNotification(`Mahsulot ${editId ? 'yangilashda' : 'qo\'shishda'} xatolik yuz berdi!`, 'error');
        }
    }, [formData, editId, createProduct, updateProduct, showNotification, clearForm, validateForm]);

    // Handle edit product
    const handleEditProduct = useCallback((product) => {
        setFormData({
            category: product.category,
            productName: product.name,
            productionCost: product.productionCost.toString(),
            loadingCost: product.loadingCost.toString()
        });
        setEditId(product._id);
    }, []);

    // Handle delete product
    const handleDeleteProduct = useCallback(async (id) => {
        if (!window.confirm("Bu mahsulotni o'chirishni xohlaysizmi?")) return;

        try {
            await deleteProduct(id).unwrap();
            showNotification("Mahsulot o'chirildi!", 'success');
        } catch (error) {
            showNotification("Mahsulot o'chirishda xatolik yuz berdi!", 'error');
        }
    }, [deleteProduct, showNotification]);

    // Handle Enter key press
    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') handleSubmit();
    }, [handleSubmit]);

    // createdAt "YYYY.MM.DD HH:MM"
    const createdAt = useCallback((createdAt) => {
        const date = new Date(createdAt);
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${year}.${month}.${day} ${hours}:${minutes}`;
    }, []);

    return (
        <div className="hyu-container">
            <div className="hyu-main-wrapper">
                {/* Form Section */}
                <div className="hyu-form-section">
                    <h2 className="hyu-form-title">
                        {editId ? 'Mahsulotni Yangilash' : 'Yangi Mahsulot Qo\'shish'}
                    </h2>
                    <div className="hyu-form">
                        <div className="hyu-form-group">
                            <label className="hyu-label">Kategoriya</label>
                            <select
                                name="category"
                                className="hyu-select"
                                value={formData.category}
                                onChange={handleInputChange}
                                disabled={isCategoriesLoading}
                            >
                                <option value="">Kategoriyani tanlang</option>
                                {Object.keys(productLists).map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="hyu-form-group">
                            <label className="hyu-label">Mahsulot Nomi</label>
                            <select
                                name="productName"
                                className="hyu-select"
                                value={formData.productName}
                                onChange={handleInputChange}
                                disabled={!formData.category || !availableProducts.length}
                            >
                                <option value="">Mahsulot nomini tanlang</option>
                                {availableProducts.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="hyu-form-group">
                            <label className="hyu-label">Ishlab Chiqarish Narxi (UZS)</label>
                            <input
                                type="number"
                                name="productionCost"
                                className="hyu-input"
                                placeholder="Masalan: 50000"
                                value={formData.productionCost}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="hyu-form-group">
                            <label className="hyu-label">Yuklash Narxi (UZS)</label>
                            <input
                                type="number"
                                name="loadingCost"
                                className="hyu-input"
                                placeholder="Masalan: 5000"
                                value={formData.loadingCost}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                            />
                        </div>

                        <div className="hyu-form-actions">
                            <button
                                type="button"
                                className="hyu-submit-btn"
                                onClick={handleSubmit}
                                disabled={isCreating}
                            >
                                {editId ? 'Yangilash' : 'Qo\'shish'}
                            </button>
                            {editId && (
                                <button
                                    type="button"
                                    className="hyu-cancel-btn"
                                    onClick={clearForm}
                                >
                                    Bekor qilish
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="hyu-table-section">
                    <h2 className="hyu-table-title">Mahsulotlar Jadvali</h2>
                    <div className="hyu-table-wrapper">
                        {products.length === 0 ? (
                            <div className="hyu-empty-state">
                                <p>Hozircha mahsulotlar yo'q</p>
                            </div>
                        ) : (
                            <table className="hyu-table">
                                <thead>
                                    <tr>
                                        <th>Nomi</th>
                                        <th>Kategoriya</th>
                                        <th>Ishlab Chiqarish</th>
                                        <th>Yuklash</th>
                                        <th>Sana</th>
                                        <th>Amallar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products?.innerData?.map((product) => (
                                        <tr key={product._id}>
                                            <td className="hyu-product-name">{product.name}</td>
                                            <td>
                                                <span className={`hyu-category-badge ${product.category.toLowerCase()}`}>
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="hyu-price">
                                                {product.productionCost.toLocaleString()} UZS
                                            </td>
                                            <td className="hyu-price">
                                                {product.loadingCost.toLocaleString()} UZS
                                            </td>
                                            <td className="hyu-date">{createdAt(product.createdAt)}</td>
                                            <td>
                                                <button
                                                    className="hyu-edit-btn"
                                                    onClick={() => handleEditProduct(product)}
                                                >
                                                    <FaEdit />

                                                </button>
                                                <button
                                                    className="hyu-delete-btn"
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {notification.message && (
                <div className={`hyu-notification ${notification.type} show`}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default CatigoryManagement;