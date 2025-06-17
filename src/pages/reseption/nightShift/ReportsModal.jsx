import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import {
    useGetNursesQuery,
    useGetShiftReportsQuery,
} from '../../../context/nursesApi';
import { useUpdateWorkerMutation } from '../../../context/doctorApi';
import './nightShift.css';

const ReportsModal = ({ showReportsModal, setShowReportsModal, formatDateToUzbek }) => {
    const {
        data: nurses = [],
        error: nursesError,
    } = useGetNursesQuery();
    const getShiftStatusColor = (shift) => {
        if (shift.attended === true) return 'shiftmodal-status-green';
        if (shift.attended === false) return 'shiftmodal-status-red';
        return 'shiftmodal-status-purple';
    };

    const formatDate = useCallback((date) => {
        const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        return utcDate.toISOString().split('T')[0];
    }, []);

    const [reportFilters, setReportFilters] = useState({
        dateFrom: formatDate(new Date()),
        dateTo: formatDate(new Date()),
        nurseId: '',
    });

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setReportFilters((prev) => ({ ...prev, [name]: value }));
    }, []);

    const {
        data: reports = { shifts: [], summary: { totalShifts: 0, totalCost: 0 } },
        isLoading: reportsLoading,
        error: reportsError,
        refetch: refetchReports,
    } = useGetShiftReportsQuery(reportFilters, { skip: !showReportsModal });

    // Ensure nursesError is handled
    useEffect(() => {
        if (nursesError) {
            console.error('Failed to load nurses:', nursesError);
        }
    }, [nursesError]);

    return (
        <div className="modal-overlay">
            <div className="reports-modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">Hisobotlar</h2>
                    <button onClick={() => setShowReportsModal(false)} className="modal-close-button">
                        <X className="icon-medium" />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="report-filters">
                        <div className="form-group">
                            <label className="form-label">Boshlanish Sanasi</label>
                            <input
                                type="date"
                                name="dateFrom"
                                value={reportFilters.dateFrom}
                                onChange={handleFilterChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Tugash Sanasi</label>
                            <input
                                type="date"
                                name="dateTo"
                                value={reportFilters.dateTo}
                                onChange={handleFilterChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Hamshira</label>
                            <select
                                name="nurseId"
                                value={reportFilters.nurseId}
                                onChange={handleFilterChange}
                                className="form-select"
                            >
                                <option value="">Barchasi</option>
                                {nurses.map((nurse) => (
                                    <option key={nurse._id} value={nurse._id}>
                                        {nurse.firstName} {nurse.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button onClick={refetchReports} className="filter-button">
                            Filtrlash
                        </button>
                    </div>
                    {reportsLoading ? (
                        <div>Loading reports...</div>
                    ) : reportsError ? (
                        <div className="error-message">
                            Xato yuz berdi. <button onClick={refetchReports}>Qayta urinish</button>
                        </div>
                    ) : reports.shifts.length > 0 ? (
                        <div className="reports-table">
                            <div className="reports-table-header">
                                <span>Sana</span>
                                <span>Hamshira</span>
                                <span>Holati</span>
                                <span>Narxi</span>
                            </div>
                            {reports.shifts.map((shift, inx) => (
                                <div key={inx} className="reports-table-row">
                                    <span>{formatDateToUzbek(new Date(shift.date))}</span>
                                    <span>{shift.nurseName}</span>
                                    <span >
                                        <div className={`shiftmodal-status ${getShiftStatusColor(shift)}`}></div>
                                        {shift.attended === true ? 'Keldi' : shift.attended === false ? 'Kelmadi' : 'Rejalashtirilgan'}
                                    </span>
                                    <span>{shift.price.toLocaleString()} UZS</span>
                                </div>
                            ))}
                            <div className="reports-summary">
                                <p>Jami Smenalar: {reports.summary.totalShifts}</p>
                                <p>Jami Xarajat: {reports.summary.totalCost.toLocaleString()} UZS</p>
                            </div>
                        </div>
                    ) : (
                        <p className="no-shifts-text">Hisobotlar mavjud emas</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsModal;



