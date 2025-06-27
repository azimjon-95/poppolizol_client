import React, { useState, useEffect } from 'react';
import {
    User,
    Building2,
    Briefcase,
    Phone,
    MapPin,
    CreditCard,
    DollarSign,
    Shield,
    Key,
    UserCheck,
    Calendar,
    X,
    Save,
    UserPlus,
    Edit3,
} from 'lucide-react';
import './form.css';
import { toast } from 'react-toastify';

const EmployeeModal = ({
    departments,
    paymentTypes,
    roles,
    showAddModal,
    setShowAddModal,
    editingEmployee,
    setEditingEmployee,
    handleAddEmployee,
    handleUpdateEmployee,
}) => {
    const [newEmployee, setNewEmployee] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        department: 'ishlab_chiqarish',
        position: '',
        experience: '',
        passportSeries: '',
        phone: '',
        address: '',
        paymentType: 'oylik',
        salary: '',
        isOfficeWorker: false,
        login: '',
        password: '',
        role: '',
    });

    useEffect(() => {
        if (editingEmployee) {
            setNewEmployee(editingEmployee);
        } else {
            setNewEmployee({
                firstName: '',
                middleName: '',
                lastName: '',
                department: 'ishlab_chiqarish',
                position: '',
                experience: '',
                passportSeries: '',
                phone: '',
                address: '',
                paymentType: 'oylik',
                salary: '',
                isOfficeWorker: false,
                login: '',
                password: '',
                role: '',
            });
        }
    }, [editingEmployee]);

    const handleInputChange = (field, value) => {
        setNewEmployee((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (
            !newEmployee.firstName ||
            !newEmployee.lastName ||
            !newEmployee.position ||
            !newEmployee.passportSeries ||
            !newEmployee.phone ||
            !newEmployee.address
        ) {
            toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring!");
            return;
        }

        if (editingEmployee) {
            handleUpdateEmployee(newEmployee);
        } else {
            handleAddEmployee(newEmployee);
        }
    };

    const handleClose = () => {
        setShowAddModal(false);
        setEditingEmployee(null);
    };

    return (
        <div className="modal-app-container">
            {(showAddModal || editingEmployee) && (
                <div className="modal-overlay-backdrop">
                    <div className="employee-form-modal">
                        <div className="modal-header-section">
                            <div className="modal-title-group">
                                {editingEmployee ? (
                                    <Edit3 className="modal-icon" />
                                ) : (
                                    <UserPlus className="modal-icon" />
                                )}
                                <h3 className="modal-title">
                                    {editingEmployee ? "Ishchi ma'lumotlarini tahrirlash" : "Yangi ishchi qo'shish"}
                                </h3>
                            </div>
                            <button onClick={handleClose} className="modal-close-btn">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="form-fields-container">
                            <div className="form-section">
                                <div className="section-header">
                                    <User className="section-icon" />
                                    <h4 className="section-title">Shaxsiy ma'lumotlar</h4>
                                </div>
                                <div className="form-row-layout">
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <User className="label-icon" />
                                            Ism
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="form-input-field"
                                            placeholder="Ishchining ismi"
                                        />
                                    </div>
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <User className="label-icon" />
                                            Otasi ismi
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.middleName}
                                            onChange={(e) => handleInputChange('middleName', e.target.value)}
                                            className="form-input-field"
                                            placeholder="Ishchining otasi ismi"
                                        />
                                    </div>
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <User className="label-icon" />
                                            Familya
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="form-input-field"
                                            placeholder="Ishchining familyasi"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <Briefcase className="section-icon" />
                                    <h4 className="section-title">Ish ma'lumotlari</h4>
                                </div>
                                <div className="form-row-layout">
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <Building2 className="label-icon" />
                                            Bo'lim
                                        </label>
                                        <select
                                            value={newEmployee.department}
                                            onChange={(e) => handleInputChange('department', e.target.value)}
                                            className="form-select-field"
                                        >
                                            {Object.entries(departments).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <Briefcase className="label-icon" />
                                            Lavozim
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.position}
                                            onChange={(e) => handleInputChange('position', e.target.value)}
                                            className="form-input-field"
                                            placeholder="Ishchining lavozimi"
                                        />
                                    </div>
                                </div>
                                <div className="form-row-layout">
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <Calendar className="label-icon" />
                                            Ish staji
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.experience}
                                            onChange={(e) => handleInputChange('experience', e.target.value)}
                                            className="form-input-field"
                                            placeholder="Masalan: 5 yil"
                                        />
                                    </div>
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <CreditCard className="label-icon" />
                                            Pasport seriyasi
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.passportSeries}
                                            onChange={(e) => handleInputChange('passportSeries', e.target.value)}
                                            className="form-input-field"
                                            placeholder="AA1234567"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <Phone className="section-icon" />
                                    <h4 className="section-title">Aloqa ma'lumotlari</h4>
                                </div>
                                <div className="form-row-layout">
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <Phone className="label-icon" />
                                            Telefon raqami
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="form-input-field"
                                            placeholder="+998901234567"
                                        />
                                    </div>
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <MapPin className="label-icon" />
                                            Manzil
                                        </label>
                                        <input
                                            type="text"
                                            value={newEmployee.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            className="form-input-field"
                                            placeholder="Toshkent, Chilanzar 45A"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="section-header">
                                    <DollarSign className="section-icon" />
                                    <h4 className="section-title">Maosh ma'lumotlari</h4>
                                </div>
                                <div className="form-row-layout">
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <DollarSign className="label-icon" />
                                            Maosh turi
                                        </label>
                                        <select
                                            value={newEmployee.paymentType}
                                            onChange={(e) => handleInputChange('paymentType', e.target.value)}
                                            className="form-select-field"
                                        >
                                            {Object.entries(paymentTypes).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <DollarSign className="label-icon" />
                                            Maosh miqdori (so'm)
                                        </label>
                                        <input
                                            type="number"
                                            value={newEmployee.salary}
                                            onChange={(e) => handleInputChange('salary', e.target.value)}
                                            className="form-input-field"
                                            placeholder="Maosh miqdori"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="office-worker-section">
                                <label className="checkbox-label-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={newEmployee.isOfficeWorker}
                                        onChange={(e) => {
                                            const isOffice = e.target.checked;
                                            handleInputChange('isOfficeWorker', isOffice);
                                            if (!isOffice) {
                                                handleInputChange('login', '');
                                                handleInputChange('password', '');
                                                handleInputChange('role', '');
                                            }
                                        }}
                                        className="office-worker-checkbox"
                                    />
                                    <div className="checkbox-content">
                                        <Shield className="checkbox-icon" />
                                        <span className="checkbox-text">Ofis xodimi (login va parol talab qilinadi)</span>
                                    </div>
                                </label>
                            </div>

                            {newEmployee.isOfficeWorker && (
                                <div className="credentials-section">
                                    <div className="section-header">
                                        <Shield className="section-icon" />
                                        <h4 className="section-title">Kirish ma'lumotlari</h4>
                                    </div>
                                    <div className="form-row-layout">
                                        <div className="input-field-group">
                                            <label className="field-label">
                                                <Key className="label-icon" />
                                                Login
                                            </label>
                                            <input
                                                type="text"
                                                value={newEmployee.login}
                                                onChange={(e) => handleInputChange('login', e.target.value)}
                                                className="form-input-field"
                                                placeholder="Foydalanuvchi nomi"
                                            />
                                        </div>
                                        <div className="input-field-group">
                                            <label className="field-label">
                                                <Key className="label-icon" />
                                                Parol
                                            </label>
                                            <input
                                                type="password"
                                                value={newEmployee.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                className="form-input-field"
                                                placeholder="Parol"
                                            />
                                        </div>
                                    </div>
                                    <div className="input-field-group">
                                        <label className="field-label">
                                            <UserCheck className="label-icon" />
                                            Rol
                                        </label>
                                        <select
                                            value={newEmployee.role}
                                            onChange={(e) => handleInputChange('role', e.target.value)}
                                            className="form-select-field"
                                        >
                                            <option value="">Rolni tanlang</option>
                                            {Object.entries(roles).map(([key, value]) => (
                                                <option key={key} value={key}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions-section">
                            <button onClick={handleClose} className="cancel-action-btn">
                                <X className="btn-icon" />
                                Bekor qilish
                            </button>
                            <button onClick={handleSubmit} className="save-action-btn">
                                <Save className="btn-icon" />
                                {editingEmployee ? 'Yangilash' : "Qo'shish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeModal;