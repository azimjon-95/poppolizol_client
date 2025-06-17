// src/components/NightShiftScheduler.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Plus,
    Settings,
    Moon,
    UserCheck,
    Activity,
    X,
} from 'lucide-react';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa6";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    useGetNursesQuery,
    useGetNightShiftsQuery,
    useCreateNightShiftMutation,
    useRemoveNurseFromShiftMutation,
    useStartShiftMutation,
    useAutoScheduleShiftsMutation,
} from '../../../context/nursesApi';
import './nightShift.css';
import ReportsModal from './ReportsModal';


const NightShiftScheduler = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showShiftDetails, setShowShiftDetails] = useState(false);
    const [selectedShiftDetails, setSelectedShiftDetails] = useState(null);
    const [selectedNurses, setSelectedNurses] = useState([]);
    const [shiftPrice, setShiftPrice] = useState(100000);
    const [showReportsModal, setShowReportsModal] = useState(false);
    const formatDate = useCallback((date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);


    const [currentUser] = useState({
        firstName: 'Admin',
        lastName: 'User',
        role: 'director',
        id: 'user_id',
    });

    const {
        data: nurses = [],
        error: nursesError,
    } = useGetNursesQuery();

    const {
        data: nightShifts = [],
        isLoading: shiftsLoading,
        error: shiftsError,
    } = useGetNightShiftsQuery({});

    const [createNightShift, { isLoading: createShiftLoading }] = useCreateNightShiftMutation();
    const [removeNurseFromShift] = useRemoveNurseFromShiftMutation();
    const [startShift] = useStartShiftMutation();
    const [autoScheduleShifts, { isLoading: autoScheduleLoading }] = useAutoScheduleShiftsMutation();

    useEffect(() => {
        if (nursesError) toast.error(nursesError.data?.message || 'Failed to load nurses');
        if (shiftsError) toast.error(shiftsError.data?.message || 'Failed to load shifts');
    }, [nursesError, shiftsError]);

    const shiftsByDate = useMemo(() => {
        return nightShifts.reduce((acc, shift) => {
            const dateKey = new Date(shift.date).toISOString().split('T')[0];
            acc[dateKey] = shift.nurses || [];
            return acc;
        }, {});
    }, [nightShifts]);

    const getDaysInMonth = useCallback((date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }
        return days;
    }, []);



    const getShiftForDate = useCallback(
        (date) => {
            const dateKey = formatDate(date);
            return shiftsByDate[dateKey] || [];
        },
        [shiftsByDate, formatDate]
    );

    const isToday = useCallback((date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }, []);

    const isPastDate = useCallback((date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    }, []);

    const monthNames = [
        'Yanvar',
        'Fevral',
        'Mart',
        'Aprel',
        'May',
        'Iyun',
        'Iyul',
        'Avgust',
        'Sentabr',
        'Oktabr',
        'Noyabr',
        'Dekabr',
    ];

    function formatDateToUzbek(date) {
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];
        return `${day}-${monthName}`;
    }
    const weekDays = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Juma', 'Shan'];

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const scheduleShift = async () => {
        if (selectedNurses.length === 0) {
            toast.warn('Iltimos, kamida bitta hamshira tanlang');
            return;
        }

        try {
            await createNightShift({
                date: formatDate(selectedDate),
                nurses: selectedNurses,
                shiftPrice,
            }).unwrap();
            toast.success('Smena muvaffaqiyatli yaratildi');
            setShowScheduleModal(false);
            setSelectedNurses([]);
        } catch (error) {
            toast.error(error.data?.message || 'Smena yaratishda xato');
        }
    };

    const removeFromShift = async (date, nurseId) => {
        const dateKey = formatDate(date);
        const shift = nightShifts.find((s) => formatDate(new Date(s.date)) === dateKey);
        if (!shift) return;

        try {
            await removeNurseFromShift({ shiftId: shift._id, nurseId }).unwrap();
            toast.success('Hamshira smenadan o\'chirildi');
        } catch (error) {
            toast.error(error.data?.message || 'Hamshirani o\'chirishda xato');
        }
    };



    const markAttendance = async (date, nurseId) => {

        const dateKey = formatDate(date);
        const shift = nightShifts.find((s) => formatDate(new Date(s.date)) === dateKey);
        if (!shift) return;

        try {
            await startShift({
                id: shift._id, nurseId: nurseId._id
            }).unwrap();
            toast.success('Hamshira kelgan deb belgilandi');
        } catch (error) {
            toast.error(error.data?.message || 'Davomat belgilashda xato');
        }
    };

    const autoScheduleMonth = async () => {
        try {
            await autoScheduleShifts({
                year: currentDate.getFullYear(),
                month: currentDate.getMonth(),
                shiftPrice,
            }).unwrap();
            toast.success('Bir oylik smena muvaffaqiyatli rejalashtirildi');
        } catch (error) {
            toast.error(error.data?.message || 'Avtomatik rejalashtirishda xato');
        }
    };

    const viewShiftDetails = (date) => {
        const shifts = getShiftForDate(date);
        setSelectedShiftDetails({ date, shifts });
        setShowShiftDetails(true);
    };

    const getShiftStatusColor = (shift) => {
        if (shift.attended === true) return 'shift-status-green';
        if (shift.attended === false) return 'shift-status-red';
        return 'shift-status-purple';
    };

    const calendarDays = useMemo(() => getDaysInMonth(currentDate), [currentDate, getDaysInMonth]);

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="content-container">
                <div className="header-card">
                    <div className="header-content">
                        <div className="header-info">
                            <div className="header-icon">
                                <Moon className="icon-large text-white" />
                            </div>
                            <div>
                                <h1 className="header-title">Tungi Smena Boshqaruvi</h1>
                                <p className="header-subtitle">Hamshiralar uchun tungi smenalar taqvimi</p>
                            </div>
                        </div>
                        <div className="header-actions">
                            <div className="sidebar-nav-items">
                                <button onClick={() => setShowReportsModal(true)} className="sidebar-nav-item">
                                    <Activity className="icon-small text-gray-600" />
                                    Hisobotlar
                                </button>
                                <button
                                    onClick={autoScheduleMonth}
                                    disabled={autoScheduleLoading}
                                    className="action-button auto-schedule-button"
                                >
                                    <Settings className="icon-small" />
                                    <span>{autoScheduleLoading ? 'Yaratilmoqda...' : 'Avtomatik Belgilash'}</span>
                                </button>
                                <button onClick={() => setShowScheduleModal(true)} className="action-button new-shift-button">
                                    <Plus className="icon-small" />
                                    <span>Yangi Smena</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="calendar-card">
                    <div className="calendar-header">
                        <button onClick={prevMonth} className="calendar-nav-button">
                            <FaAngleLeft />
                        </button>
                        <h2 className="calendar-title">
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </h2>
                        <button onClick={nextMonth} className="calendar-nav-button">
                            <FaChevronRight />
                        </button>
                    </div>
                    <div className="calendar-grid">
                        {weekDays.map((day) => (
                            <div key={day} className="calendar-weekday">
                                {day}
                            </div>
                        ))}
                        {calendarDays.map((day, index) => (
                            <div
                                key={index}
                                onClick={day ? () => setSelectedDate(day) : undefined}
                                className={`calendar-day ${day ? 'calendar-day-active' : 'calendar-day-inactive'} ${day && isToday(day) ? 'calendar-day-today' : ''
                                    } ${day && selectedDate.toDateString() === day.toDateString() ? 'calendar-day-selected' : ''}`}
                            >
                                {day ? (
                                    <div>
                                        <span>{day.getDate()}</span>
                                        {getShiftForDate(day).length > 0 && (
                                            <div className="calendar-shift-indicators">
                                                {getShiftForDate(day).map((shift, inx) => (
                                                    <span key={inx} className={`shift-indicator ${getShiftStatusColor(shift)}`}></span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="shifts-card">
                    <h2 className="shifts-title">
                        {formatDateToUzbek(selectedDate)}
                    </h2>
                    {shiftsLoading ? (
                        <div>Loading shifts...</div>
                    ) : getShiftForDate(selectedDate).length > 0 ? (
                        <div>
                            {getShiftForDate(selectedDate).map((shift, inx) => (
                                <div key={inx} className="shift-item">
                                    <div className="shift-info">
                                        <span className={`shift-status ${getShiftStatusColor(shift)}`}></span>
                                        <span>{shift.nurseName}</span>
                                    </div>
                                    <div className="shift-actions">
                                        {currentUser.role === 'director' && !isPastDate(selectedDate) && (
                                            <button
                                                onClick={() => removeFromShift(selectedDate, shift.nurseId)}
                                                className="shift-action-button remove-btn"
                                            >
                                                <X className="icon-small" />
                                            </button>
                                        )}
                                        {currentUser.role === 'director' &&
                                            isToday(selectedDate) &&
                                            shift.scheduled &&
                                            shift.attended === null && (
                                                <button
                                                    onClick={() => markAttendance(selectedDate, shift.nurseId)}
                                                    className="shift-action-button attend-btn"
                                                >
                                                    <UserCheck className="icon-small" />
                                                </button>
                                            )}
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => viewShiftDetails(selectedDate)} className="shift-details-button">
                                Batafsil
                            </button>
                        </div>
                    ) : (
                        <p className="no-shifts-text">Bu kunga smena rejalashtirilmagan</p>
                    )}
                </div>
            </div>

            {showScheduleModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">Yangi Smena Rejalashtirish</h2>
                            <button onClick={() => setShowScheduleModal(false)} className="modal-close-button">
                                <X className="icon-medium" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Sana</label>
                                <input
                                    type="date"
                                    value={formatDate(selectedDate)}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Hamshiralar</label>
                                <select
                                    multiple
                                    value={selectedNurses}
                                    onChange={(e) => setSelectedNurses(Array.from(e.target.selectedOptions, (option) => option.value))}
                                    className="form-select"
                                >
                                    {nurses.map((nurse) => (
                                        <option key={nurse._id} value={nurse._id}>
                                            {nurse.firstName} {nurse.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Smena Narxi</label>
                                <input
                                    type="number"
                                    value={shiftPrice}
                                    onChange={(e) => setShiftPrice(Number(e.target.value))}
                                    className="form-input"
                                />
                            </div>
                            <button
                                onClick={scheduleShift}
                                disabled={createShiftLoading}
                                className="modal-submit-button"
                            >
                                {createShiftLoading ? 'Yaratilmoqda...' : 'Rejalashtirish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showShiftDetails && selectedShiftDetails && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {formatDateToUzbek(selectedShiftDetails.date)}
                            </h2>
                            <button onClick={() => setShowShiftDetails(false)} className="modal-close-button">
                                <X className="icon-medium" />
                            </button>
                        </div>
                        {selectedShiftDetails.shifts.length > 0 ? (
                            <div className="modal-body">
                                {selectedShiftDetails.shifts.map((shift, inx) => (
                                    <div key={inx} className="shift-detail-item">
                                        <div className="shift-detail-info">
                                            <span className={`shift-status ${getShiftStatusColor(shift)}`}></span>
                                            <span>{shift.nurseName}</span>
                                        </div>
                                        <div className="shift-detail-status">
                                            {shift.attended === true && <span>Keldi</span>}
                                            {shift.attended === false && <span>Kelmadi</span>}
                                            {shift.attended === null && <span>Rejalashtirilgan</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-shifts-text">Smenalar mavjud emas</p>
                        )}
                    </div>
                </div>
            )}


            {showReportsModal && (
                <ReportsModal formatDateToUzbek={formatDateToUzbek} showReportsModal={showReportsModal} setShowReportsModal={setShowReportsModal} />
            )}
        </>
    );
};

export default NightShiftScheduler;


