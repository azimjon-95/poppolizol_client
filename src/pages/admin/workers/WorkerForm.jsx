import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Input, Button, DatePicker } from 'antd';
import ReactSelect from 'react-select';
import moment from 'moment';
import { specializationOptions } from '../../../utils/specializationOptions';
import { NumberFormat } from '../../../hook/NumberFormat';
import './style.css';

const WorkerForm = ({ onSubmit, initialValues = {}, isSubmitting, submitError }) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
        control,
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            address: '',
            login: '',
            password: '',
            confirmPassword: '',
            role: 'reception',
            salary_type: 'fixed',
            salary_per_month: 0,
            percentage_from_admissions: 0,
            specialization: '',
            admissionPrice: 0,
            phone: '',
            birthday: null,
            ...initialValues,
        },
        mode: 'onChange',
    });

    const password = watch('password');
    const role = watch('role') || 'reception';
    const salaryType = watch('salary_type');
    const [confirmPasswordBorderClass, setConfirmPasswordBorderClass] = useState('form-input');

    useEffect(() => {
        const confirmPassword = watch('confirmPassword');
        setConfirmPasswordBorderClass(
            confirmPassword ? (password === confirmPassword ? 'border-green' : 'border-red') : 'form-input'
        );
    }, [password, watch('confirmPassword')]);

    const handleRoleSelect = (selectedRole) => {
        setValue('role', selectedRole);
        if (selectedRole !== 'doctor') {
            setValue('specialization', '');
        }
    };

    const handleSalaryTypeSelect = (selectedType) => {
        setValue('salary_type', selectedType);
        if (selectedType === 'fixed') {
            setValue('percentage_from_admissions', 0);
        } else {
            setValue('salary_per_month', 0);
        }
    };
    const showAdmissionFields = !['nurse', 'cleaner', "director"].includes(role);
    return (
        <div className="form-card">
            {submitError && <p className="error-message">Xatolik: {submitError}</p>}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group-box">
                    <div className="form-group">
                        <label>Lavozim</label>
                        <div className="role-buttons">
                            {['reception', 'director', 'doctor', 'nurse', 'cleaner'].map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => handleRoleSelect(r)}
                                    className={`role-button ${role === r ? 'active' : ''}`}
                                >
                                    {r === 'reception' ? 'Qabulxona' :
                                        r === 'director' ? 'Direktor' :
                                            r === 'doctor' ? 'Doktor' :
                                                r === 'nurse' ? 'Hamshira' :
                                                    'Farrosh'}
                                </button>
                            ))}
                        </div>
                        <input
                            type="hidden"
                            {...register('role', {
                                required: "Rol noto‘g‘ri",
                                validate: (value) =>
                                    ['reception', 'director', 'doctor', 'nurse', 'cleaner'].includes(value) ||
                                    "Rol noto‘g‘ri",
                            })}
                        />
                        {errors.role && <p className="error-message">{errors.role.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="firstName">Ism</label>
                        <input
                            {...register('firstName', {
                                required: 'Ism kiritish shart',
                                minLength: { value: 2, message: 'Ism 2-50 ta belgi oralig‘ida bo‘lishi kerak' },
                                maxLength: { value: 50, message: 'Ism 2-50 ta belgi oralig‘ida bo‘lishi kerak' },
                            })}
                            placeholder="Ismni kiriting"
                            className="form-input"
                        />
                        {errors.firstName && <p className="error-message">{errors.firstName.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Familiya</label>
                        <input
                            {...register('lastName', {
                                required: 'Familiya kiritish shart',
                                minLength: { value: 2, message: 'Familiya 2-50 ta belgi oralig‘ida bo‘lishi kerak' },
                                maxLength: { value: 50, message: 'Familiya 2-50 ta belgi oralig‘ida bo‘lishi kerak' },
                            })}
                            placeholder="Familiyani kiriting"
                            className="form-input"
                        />
                        {errors.lastName && <p className="error-message">{errors.lastName.message}</p>}
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="address">Manzil</label>
                        <input
                            {...register('address', {
                                required: 'Manzil kiritish shart',
                                minLength: { value: 2, message: 'Manzil 2-100 ta belgi oralig‘ida bo‘lishi kerak' },
                                maxLength: { value: 100, message: 'Manzil 2-100 ta belgi oralig‘ida bo‘lishi kerak' },
                            })}
                            placeholder="Manzilni kiriting"
                            className="form-input"
                        />
                        {errors.address && <p className="error-message">{errors.address.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Telefon</label>
                        <input
                            {...register('phone', {
                                required: 'Telefon raqam kiritish shart',
                                minLength: { value: 7, message: 'Telefon raqam noto‘g‘ri' },
                                maxLength: { value: 15, message: 'Telefon raqam noto‘g‘ri' },
                                pattern: {
                                    value: /^\+?\d{7,15}$/,
                                    message: 'Telefon raqam noto‘g‘ri',
                                },
                            })}
                            placeholder="Telefon raqamni kiriting"
                            className="form-input"
                        />
                        {errors.phone && <p className="error-message">{errors.phone.message}</p>}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="birthday">Tug'ilgan sana</label>
                    <Controller
                        name="birthday"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                {...field}
                                format="YYYY-MM-DD"
                                placeholder="Tug'ilgan sanani tanlang"
                                className="form-input"
                                onChange={(date) => field.onChange(date ? date.format('YYYY-MM-DD') : null)}
                                value={field.value ? moment(field.value) : null}
                            />
                        )}
                        rules={{
                            validate: (value) =>
                                !value ||
                                (moment.isMoment(value) && value.isValid() && value.format('YYYY-MM-DD')) ||
                                moment(value, 'YYYY-MM-DD', true).isValid() ||
                                'Tug‘ilgan sana noto‘g‘ri formatda (YYYY-MM-DD)',
                        }}
                    />
                    {errors.birthday && <p className="error-message">{errors.birthday.message}</p>}
                </div>
                <div className="form-group-box">
                    <div className="form-group">
                        <label htmlFor="login">Login</label>
                        <input
                            {...register('login', {
                                required: 'Login kiritish shart',
                                minLength: { value: 4, message: 'Login 4-20 ta belgidan iborat, faqat harflar va raqamlar' },
                                maxLength: { value: 20, message: 'Login 4-20 ta belgidan iborat, faqat harflar va raqamlar' },
                                pattern: {
                                    value: /^[a-zA-Z0-9]+$/,
                                    message: 'Login 4-20 ta belgidan iborat, faqat harflar va raqamlar',
                                },
                            })}
                            placeholder="Loginni kiriting"
                            className="form-input"
                        />
                        {errors.login && <p className="error-message">{errors.login.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Parol</label>
                        <Controller
                            name="password"
                            control={control}
                            rules={{
                                required: 'Parol kiritish shart',
                                minLength: { value: 6, message: 'Parol 6-50 ta belgi oralig‘ida bo‘lishi kerak' },
                                maxLength: { value: 50, message: 'Parol 6-50 ta belgi oralig‘ida bo‘lishi kerak' },
                            }}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    placeholder="Parolni kiriting"
                                    className="form-input"
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                        {errors.password && <p className="error-message">{errors.password.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Parolni tasdiqlash</label>
                        <Controller
                            name="confirmPassword"
                            control={control}
                            rules={{
                                required: 'Parolni tasdiqlash shart',
                                validate: (value) => value === password || 'Parollar mos kelmadi',
                            }}
                            render={({ field }) => (
                                <Input.Password
                                    {...field}
                                    placeholder="Parolni qayta kiriting"
                                    className={`form-input ${confirmPasswordBorderClass}`}
                                    onChange={(e) => field.onChange(e.target.value)}
                                />
                            )}
                        />
                        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword.message}</p>}
                    </div>
                </div>
                {role === 'doctor' && (
                    <div className="form-group">
                        <label htmlFor="specialization">Mutaxassislik</label>
                        <Controller
                            name="specialization"
                            control={control}
                            rules={{
                                required: role === 'doctor' ? 'Yo‘nalish noto‘g‘ri' : false,
                            }}
                            render={({ field }) => (
                                <ReactSelect
                                    {...field}
                                    options={specializationOptions}
                                    placeholder="Mutaxassislikni tanlang"
                                    isSearchable
                                    onChange={(option) => field.onChange(option ? option.value : '')}
                                    value={specializationOptions.find((option) => option.value === field.value)}
                                />
                            )}
                        />
                        {errors.specialization && <p className="error-message">{errors.specialization.message}</p>}
                    </div>
                )}
                <div className="form-group-box">
                    <div className="form-group">
                        <label htmlFor="salary_type">Oylik turi</label>
                        <Controller
                            name="salary_type"
                            control={control}
                            rules={{
                                required: 'Maosh turi noto‘g‘ri (fixed yoki percentage)',
                                validate: (value) =>
                                    ['fixed', 'percentage'].includes(value) || 'Maosh turi noto‘g‘ri (fixed yoki percentage)',
                            }}
                            render={({ field }) => (
                                <div className="role-buttons">
                                    {['fixed', 'percentage'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => {
                                                field.onChange(type);
                                                handleSalaryTypeSelect(type);
                                            }}
                                            className={`role-button ${field.value === type ? 'active' : ''}`}
                                        >
                                            {type === 'fixed' ? 'Belgilangan' : 'Foizli'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        />
                        {errors.salary_type && <p className="error-message">{errors.salary_type.message}</p>}
                    </div>
                    {salaryType === 'fixed' && (
                        <div className="form-group">
                            <label htmlFor="salary_per_month">Oylik maosh</label>
                            <input
                                {...register('salary_per_month', {
                                    validate: (value) =>
                                        (value >= 0 && !isNaN(value)) || 'Oylik maosh 0 dan katta son bo‘lishi kerak',
                                })}
                                placeholder="Oylik maoshni kiriting"
                                className="form-input"
                                type="number"
                                min="0"
                            />
                            {errors.salary_per_month && <p className="error-message">{errors.salary_per_month.message}</p>}
                        </div>
                    )}
                    {salaryType === 'percentage' && (
                        <div className="form-group">
                            <label htmlFor="percentage_from_admissions">Qabul foizi (%)</label>
                            <input
                                {...register('percentage_from_admissions', {
                                    validate: (value) =>
                                        (value >= 0 && value <= 100 && !isNaN(value)) ||
                                        'Foiz noto‘g‘ri (0 dan katta son)',
                                })}
                                placeholder="Qabul foizini kiriting (0-100)"
                                className="form-input"
                                type="number"
                                min="0"
                                max="100"
                            />
                            {errors.percentage_from_admissions && (
                                <p className="error-message">{errors.percentage_from_admissions.message}</p>
                            )}
                        </div>
                    )}
                    {showAdmissionFields && (
                        <div className="form-group">
                            <label htmlFor="admissionPrice">Qabul narxi</label>
                            <input
                                {...register('admissionPrice', {
                                    validate: (value) =>
                                        (value >= 0 && !isNaN(value)) || 'Qabul narxi noto‘g‘ri',
                                })}
                                placeholder="Qabul narxini kiriting"
                                className="form-input"
                                type="number"
                                min="0"
                            />
                            {errors.admissionPrice && <p className="error-message">{errors.admissionPrice.message}</p>}
                        </div>
                    )}
                </div>
                <button
                    type="submit"
                    className="submit-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Yuborilmoqda...' : "Ro'yxatdan o'tish"}
                </button>
            </form>
        </div>
    );
};

export default WorkerForm;