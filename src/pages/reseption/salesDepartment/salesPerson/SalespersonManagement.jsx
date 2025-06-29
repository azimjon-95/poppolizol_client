import React, { useState, useEffect } from 'react';
import { User, TrendingUp, TrendingDown, AlertCircle, Check, Calendar, Phone, MapPin, Users, Activity, Filter, RefreshCw, Eye, X, Package, ShoppingCart } from 'lucide-react';
// import './style.css';

// Reusable PerformanceCell component
const PerformanceCell = ({ actual, plan, unit = '', performanceClass, percentage }) => (
    <td className="spdb-data-cell">
        <div className="spdb-performance-cell">
            <div className="spdb-performance-numbers">
                <span className="spdb-actual-value">
                    {unit === 'M' ? (actual / 1000000).toFixed(1) + unit : actual.toLocaleString()}
                </span>
                <span className="spdb-plan-value">
                    / {unit === 'M' ? (plan / 1000000).toFixed(1) + unit : plan.toLocaleString() + (unit === 'kg' ? ' kg' : '')}
                </span>
            </div>
            <div className={`spdb-performance-bar ${performanceClass}`}>
                <div
                    className="spdb-progress-fill"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
            </div>
            <div className="spdb-percentage-label">{percentage}%</div>
        </div>
    </td>
);

const SalespersonDashboard = () => {
    const [salespeople, setSalespeople] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [showSaleDetailModal, setShowSaleDetailModal] = useState(false);
    const [selectedSaleDetail, setSelectedSaleDetail] = useState(null);


    // Serverdan ma'lumot olish simulyatsiyasi
    useEffect(() => {
        const fetchSalespeopleData = async () => {
            setLoading(true);
            try {
                const mockApiData = {
                    salespeople: [
                        {
                            id: 1,
                            name: "Azimjon Mamutaliyev",
                            phone: "+998901234567",
                            email: "azimjon@company.com",
                            region: "Toshkent shahri",
                            status: "active",
                            joinDate: "2024-01-15",
                            monthlyPlan: {
                                totalAmount: 10000000
                            },
                            currentMonthSales: {
                                totalAmount: 8500000,
                                salesCount: 2,
                                clientsCount: 8
                            },
                            previousMonthSales: {
                                totalAmount: 9500000
                            },
                            recentActivity: [
                                {
                                    id: 1,
                                    date: "2024-12-15",
                                    client: "Alfa Group",
                                    amount: 250000,
                                    status: "completed",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 50, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 25, unit: "kg", price: 4000 }
                                    ]
                                },
                                {
                                    id: 2,
                                    date: "2024-12-14",
                                    client: "Beta LLC",
                                    amount: 180000,
                                    status: "pending",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 30, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 22.5, unit: "kg", price: 4000 }
                                    ]
                                },
                                {
                                    id: 3,
                                    date: "2024-12-13",
                                    client: "Gamma Co",
                                    amount: 320000,
                                    status: "completed",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 80, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 40, unit: "kg", price: 4000 }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: "Dilshod Rahimov",
                            phone: "+998901234568",
                            email: "dilshod@company.com",
                            region: "Samarqand viloyati",
                            status: "active",
                            joinDate: "2024-02-20",
                            monthlyPlan: {
                                totalAmount: 8000000
                            },
                            currentMonthSales: {
                                totalAmount: 9200000,
                                salesCount: 15,
                                clientsCount: 11
                            },
                            previousMonthSales: {
                                totalAmount: 7800000
                            },
                            recentActivity: [
                                {
                                    id: 4,
                                    date: "2024-12-15",
                                    client: "Delta Industries",
                                    amount: 400000,
                                    status: "completed",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 100, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 25, unit: "kg", price: 4000 }
                                    ]
                                },
                                {
                                    id: 5,
                                    date: "2024-12-14",
                                    client: "Epsilon Corp",
                                    amount: 150000,
                                    status: "completed",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 35, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 15, unit: "kg", price: 4000 }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: "Malika Yusupova",
                            phone: "+998901234569",
                            email: "malika@company.com",
                            region: "Andijon viloyati",
                            status: "inactive",
                            joinDate: "2024-03-10",
                            monthlyPlan: {
                                totalAmount: 12000000
                            },
                            currentMonthSales: {
                                totalAmount: 4800000,
                                salesCount: 6,
                                clientsCount: 4
                            },
                            previousMonthSales: {
                                totalAmount: 11500000
                            },
                            recentActivity: [
                                {
                                    id: 6,
                                    date: "2024-12-10",
                                    client: "Zeta LLC",
                                    amount: 120000,
                                    status: "pending",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 25, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 11.25, unit: "kg", price: 4000 }
                                    ]
                                },
                                {
                                    id: 7,
                                    date: "2024-12-08",
                                    client: "Eta Group",
                                    amount: 200000,
                                    status: "completed",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 45, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 20, unit: "kg", price: 4000 }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 4,
                            name: "Bobur Karimov",
                            phone: "+998901234570",
                            email: "bobur@company.com",
                            region: "Farg'ona viloyati",
                            status: "active",
                            joinDate: "2024-04-05",
                            monthlyPlan: {
                                totalAmount: 9000000
                            },
                            currentMonthSales: {
                                totalAmount: 10800000,
                                salesCount: 18,
                                clientsCount: 13
                            },
                            previousMonthSales: {
                                totalAmount: 8700000
                            },
                            recentActivity: [
                                {
                                    id: 8,
                                    date: "2024-12-15",
                                    client: "Theta Systems",
                                    amount: 380000,
                                    status: "completed",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 95, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 22.5, unit: "kg", price: 4000 }
                                    ]
                                },
                                {
                                    id: 9,
                                    date: "2024-12-14",
                                    client: "Iota Partners",
                                    amount: 290000,
                                    status: "completed",
                                    products: [
                                        { name: "Ko'mir qog'ozi", quantity: 70, unit: "dona", price: 3000 },
                                        { name: "Betum", quantity: 20, unit: "kg", price: 4000 }
                                    ]
                                }
                            ]
                        }
                    ]
                };

                setSalespeople(mockApiData.salespeople);
                setLoading(false);

            } catch (error) {
                console.error("Ma'lumot olishda xatolik:", error);
                setLoading(false);
            }
        };

        fetchSalespeopleData();
    }, []);

    // Filtrlash funksiyasi
    const filteredSalespeople = salespeople.filter((salesperson) => {
        const matchesStatus = filterStatus === 'all' || salesperson.status === filterStatus;
        const matchesSearch =
            salesperson.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            salesperson.region.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Foiz hisoblaish
    const calculatePercentage = (actual, plan) => {
        return plan > 0 ? ((actual / plan) * 100).toFixed(1) : 0;
    };

    // Trend hisoblaish
    const calculateTrend = (current, previous) => {
        if (previous === 0) return 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    };

    // Holat belgisi
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return (
                    <span className="spdb-status-badge spdb-status-active">
                        <Activity className="spdb-icon-xs" /> Faol
                    </span>
                );
            case 'inactive':
                return (
                    <span className="spdb-status-badge spdb-status-inactive">
                        <AlertCircle className="spdb-icon-xs" /> Nofaol
                    </span>
                );
            default:
                return <span className="spdb-status-badge spdb-status-unknown">Noma'lum</span>;
        }
    };

    // Performance rang
    const getPerformanceClass = (percentage) => {
        if (percentage >= 100) return 'spdb-performance-excellent';
        if (percentage >= 80) return 'spdb-performance-good';
        if (percentage >= 60) return 'spdb-performance-average';
        return 'spdb-performance-poor';
    };

    // Trend rang
    const getTrendClass = (trend) => {
        if (trend > 0) return 'spdb-trend-positive';
        if (trend < 0) return 'spdb-trend-negative';
        return 'spdb-trend-neutral';
    };

    // Activity modal ochish
    const openActivityModal = (activities) => {
        setSelectedActivities(activities);
        setShowActivityModal(true);
    };

    // Sale detail modal ochish
    const openSaleDetailModal = (activity) => {
        setSelectedSaleDetail(activity);
        setShowSaleDetailModal(true);
    };

    // Modal yopish
    const closeModals = () => {
        setShowActivityModal(false);
        setShowSaleDetailModal(false);
        setSelectedActivities([]);
        setSelectedSaleDetail(null);
    };

    // Sotuv holati
    const getSaleStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="sale-status-completed">
                        <Check className="spdb-icon-xs" /> Tugallangan
                    </span>
                );
            case 'pending':
                return (
                    <span className="sale-status-pending">
                        <AlertCircle className="spdb-icon-xs" /> Kutilmoqda
                    </span>
                );
            default:
                return <span className="sale-status-unknown">Noma'lum</span>;
        }
    };

    if (loading) {
        return (
            <div className="spdb-loading-container">
                <RefreshCw className="spdb-loading-icon" />
                <p>Ma'lumotlar yuklanmoqda...</p>
            </div>
        );
    }

    return (
        <div className="spdb-dashboard-container">
            {/* Header */}
            <div className="spdb-dashboard-header">
                <div className="">
                    <h1 class sewing="spdb-dashboard-title">
                        <Users className="spdb-icon-lg" />
                        Sotuvchilar Boshqaruv Paneli
                    </h1>
                    <div className="spdb-filter-group">
                        <Filter className="spdb-filter-icon" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="spdb-filter-select"
                        >
                            <option value="all">Barcha holatlar</option>
                            <option value="active">Faol</option>
                            <option value="inactive">Nofaol</option>
                        </select>
                    </div>
                </div>
                <div className="spdb-dashboard-stats">
                    <div className="spdb-stat-card">
                        <div className="spdb-stat-value">{salespeople.length}</div>
                        <div className="spdb-stat-label">Jami sotuvchilar</div>
                    </div>
                    <div className="spdb-stat-card">
                        <div className="spdb-stat-value">{salespeople.filter((s) => s.status === 'active').length}</div>
                        <div className="spdb-stat-label">Faol sotuvchilar</div>
                    </div>
                    <div className="spdb-stat-card">
                        <div className="spdb-stat-value">
                            {salespeople
                                .reduce((sum, s) => sum + s.currentMonthSales.totalAmount, 0)
                                .toLocaleString()}
                        </div>
                        <div className="spdb-stat-label">Jami sotuv (so'm)</div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="spdb-table-container">
                <table className="spdb-main-table">
                    <thead className="spdb-table-header">
                        <tr>
                            <th className="spdb-header-cell">Sotuvchi</th>
                            <th className="spdb-header-cell">Holat</th>
                            <th className="spdb-header-cell">Plan</th>
                            <th className="spdb-header-cell">Trend</th>
                            <th className="spdb-header-cell">Mijozlar</th>
                            <th className="spdb-header-cell">So'nggi faollik</th>
                        </tr>
                    </thead>
                    <tbody className="spdb-table-body">
                        {filteredSalespeople.map((salesperson) => {
                            const amountPercentage = calculatePercentage(
                                salesperson.currentMonthSales.totalAmount,
                                salesperson.monthlyPlan.totalAmount
                            );
                            const trend = calculateTrend(
                                salesperson.currentMonthSales.totalAmount,
                                salesperson.previousMonthSales.totalAmount
                            );

                            return (
                                <tr key={salesperson.id} className="spdb-table-row">
                                    <td className="spdb-data-cell">
                                        <div className="spdb-salesperson-info">
                                            <div className="spdb-salesperson-avatar">
                                                <User className="spdb-avatar-icon" />
                                            </div>
                                            <div className="spdb-salesperson-details">
                                                <div className="spdb-salesperson-name">{salesperson.name}</div>
                                                <div className="spdb-salesperson-meta">
                                                    <Phone className="spdb-icon-xs" />
                                                    {salesperson.phone}
                                                </div>
                                                <div className="spdb-salesperson-meta">
                                                    <MapPin className="spdb-icon-xs" />
                                                    {salesperson.region}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="spdb-data-cell">{getStatusBadge(salesperson.status)}</td>

                                    <PerformanceCell
                                        actual={salesperson.currentMonthSales.totalAmount}
                                        plan={salesperson.monthlyPlan.totalAmount}
                                        unit="M"
                                        performanceClass={getPerformanceClass(amountPercentage)}
                                        percentage={amountPercentage}
                                    />
                                    <td className="spdb-data-cell">
                                        <div className={`spdb-trend-indicator ${getTrendClass(trend)}`}>
                                            {trend > 0 ? (
                                                <TrendingUp className="spdb-trend-icon" />
                                            ) : trend < 0 ? (
                                                <TrendingDown className="spdb-trend-icon" />
                                            ) : (
                                                <div className="spdb-trend-neutral-icon"></div>
                                            )}
                                            <span className="spdb-trend-value">{Math.abs(trend)}%</span>
                                        </div>
                                    </td>
                                    <td className="spdb-data-cell">
                                        <div className="spdb-clients-info">
                                            <div className="spdb-clients-count">
                                                <Users className="spdb-icon-sm" />
                                                {salesperson.currentMonthSales.clientsCount}
                                            </div>
                                            <div className="spdb-sales-count">
                                                {salesperson.currentMonthSales.salesCount} sotuv
                                            </div>
                                        </div>
                                    </td>
                                    <td className="spdb-data-cell">
                                        <button
                                            className="spdb-view-all-btn"
                                            onClick={() => openActivityModal(salesperson.recentActivity)}
                                        >
                                            <Eye className="spdb-icon-xs" />
                                            Barchasini ko'rish
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Activity Modal */}
            {showActivityModal && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <Activity className="spdb-icon-md" />
                                So'nggi faollik
                            </h3>
                            <button className="modal-close-btn" onClick={closeModals}>
                                <X className="spdb-icon-sm" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="activity-list">
                                {selectedActivities.map((activity, index) => (
                                    <div key={index} className="activity-card">
                                        <div className="activity-card-header">
                                            <div className="activity-date-status">
                                                <div className="activity-date-full">
                                                    <Calendar className="spdb-icon-sm" />
                                                    {activity.date}
                                                </div>
                                                {getSaleStatusBadge(activity.status)}
                                            </div>
                                            <button
                                                className="activity-detail-btn"
                                                onClick={() => openSaleDetailModal(activity)}
                                            >
                                                <ShoppingCart className="spdb-icon-xs" />
                                                Mahsulotlar
                                            </button>
                                        </div>
                                        <div className="activity-card-body">
                                            <div className="activity-client">
                                                <strong>Mijoz:</strong> {activity.client}
                                            </div>
                                            <div className="activity-amount">
                                                <strong>Summa:</strong> {activity.amount.toLocaleString()} so'm
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sale Detail Modal */}
            {showSaleDetailModal && selectedSaleDetail && (
                <div className="modal-overlay" onClick={closeModals}>
                    <div className="modal-content sale-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                <Package className="spdb-icon-md" />
                                Sotuv tafsilotlari
                            </h3>
                            <button className="modal-close-btn" onClick={closeModals}>
                                <X className="spdb-icon-sm" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="sale-info-section">
                                <div className="sale-info-header">
                                    <div className="sale-basic-info">
                                        <div className="sale-info-item">
                                            <strong>Mijoz:</strong> {selectedSaleDetail.client}
                                        </div>
                                        <div className="sale-info-item">
                                            <strong>Sana:</strong> {selectedSaleDetail.date}
                                        </div>
                                        <div className="sale-info-item">
                                            <strong>Holat:</strong> {getSaleStatusBadge(selectedSaleDetail.status)}
                                        </div>
                                    </div>
                                    <div className="sale-total-amount">
                                        <div className="total-label">Jami summa:</div>
                                        <div className="total-value">{selectedSaleDetail.amount.toLocaleString()} so'm</div>
                                    </div>
                                </div>
                            </div>

                            <div className="products-section">
                                <h4 className="products-title">
                                    <Package className="spdb-icon-sm" />
                                    Sotilgan mahsulotlar
                                </h4>
                                <div className="products-table">
                                    <div className="products-table-header">
                                        <div className="product-col-name">Mahsulot nomi</div>
                                        <div className="product-col-qty">Miqdor</div>
                                        <div className="product-col-price">Narx</div>
                                        <div className="product-col-total">Jami</div>
                                    </div>
                                    <div className="products-table-body">
                                        {selectedSaleDetail.products.map((product, index) => (
                                            <div key={index} className="product-row">
                                                <div className="product-col-name">
                                                    <div className="product-name">{product.name}</div>
                                                </div>
                                                <div className="product-col-qty">
                                                    {product.quantity} {product.unit}
                                                </div>
                                                <div className="product-col-price">
                                                    {product.price.toLocaleString()} so'm
                                                </div>
                                                <div className="product-col-total">
                                                    {(product.quantity * product.price).toLocaleString()} so'm
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalespersonDashboard;






// Mock API data - serverdan kelishi kerak
// const mockApiData = {
//     salespeople: [
//         {
//             id: 1,
//             name: "Azimjon Mamutaliyev",
//             phone: "+998901234567",
//             email: "azimjon@company.com",
//             region: "Toshkent shahri",
//             status: "active",
//             joinDate: "2024-01-15",
//             monthlyPlan: {
//                 coalPaper: 1000,
//                 betum: 5000,
//                 totalAmount: 10000000
//             },
//             currentMonthSales: {
//                 coalPaper: 850,
//                 betum: 4200,
//                 totalAmount: 8500000,
//                 salesCount: 2,
//                 clientsCount: 8
//             },
//             previousMonthSales: {
//                 coalPaper: 950,
//                 betum: 4800,
//                 totalAmount: 9500000
//             },
//             recentActivity: [
//                 {
//                     id: 1,
//                     date: "2024-12-15",
//                     client: "Alfa Group",
//                     amount: 250000,
//                     status: "completed",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 50, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 25, unit: "kg", price: 4000 }
//                     ]
//                 },
//                 {
//                     id: 2,
//                     date: "2024-12-14",
//                     client: "Beta LLC",
//                     amount: 180000,
//                     status: "pending",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 30, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 22.5, unit: "kg", price: 4000 }
//                     ]
//                 },
//                 {
//                     id: 3,
//                     date: "2024-12-13",
//                     client: "Gamma Co",
//                     amount: 320000,
//                     status: "completed",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 80, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 40, unit: "kg", price: 4000 }
//                     ]
//                 }
//             ]
//         },
//         {
//             id: 2,
//             name: "Dilshod Rahimov",
//             phone: "+998901234568",
//             email: "dilshod@company.com",
//             region: "Samarqand viloyati",
//             status: "active",
//             joinDate: "2024-02-20",
//             monthlyPlan: {
//                 coalPaper: 800,
//                 betum: 4000,
//                 totalAmount: 8000000
//             },
//             currentMonthSales: {
//                 coalPaper: 920,
//                 betum: 4600,
//                 totalAmount: 9200000,
//                 salesCount: 15,
//                 clientsCount: 11
//             },
//             previousMonthSales: {
//                 coalPaper: 780,
//                 betum: 3900,
//                 totalAmount: 7800000
//             },
//             recentActivity: [
//                 {
//                     id: 4,
//                     date: "2024-12-15",
//                     client: "Delta Industries",
//                     amount: 400000,
//                     status: "completed",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 100, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 25, unit: "kg", price: 4000 }
//                     ]
//                 },
//                 {
//                     id: 5,
//                     date: "2024-12-14",
//                     client: "Epsilon Corp",
//                     amount: 150000,
//                     status: "completed",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 35, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 15, unit: "kg", price: 4000 }
//                     ]
//                 }
//             ]
//         },
//         {
//             id: 3,
//             name: "Malika Yusupova",
//             phone: "+998901234569",
//             email: "malika@company.com",
//             region: "Andijon viloyati",
//             status: "inactive",
//             joinDate: "2024-03-10",
//             monthlyPlan: {
//                 coalPaper: 1200,
//                 betum: 6000,
//                 totalAmount: 12000000
//             },
//             currentMonthSales: {
//                 coalPaper: 480,
//                 betum: 2400,
//                 totalAmount: 4800000,
//                 salesCount: 6,
//                 clientsCount: 4
//             },
//             previousMonthSales: {
//                 coalPaper: 1150,
//                 betum: 5750,
//                 totalAmount: 11500000
//             },
//             recentActivity: [
//                 {
//                     id: 6,
//                     date: "2024-12-10",
//                     client: "Zeta LLC",
//                     amount: 120000,
//                     status: "pending",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 25, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 11.25, unit: "kg", price: 4000 }
//                     ]
//                 },
//                 {
//                     id: 7,
//                     date: "2024-12-08",
//                     client: "Eta Group",
//                     amount: 200000,
//                     status: "completed",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 45, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 20, unit: "kg", price: 4000 }
//                     ]
//                 }
//             ]
//         },
//         {
//             id: 4,
//             name: "Bobur Karimov",
//             phone: "+998901234570",
//             email: "bobur@company.com",
//             region: "Farg'ona viloyati",
//             status: "active",
//             joinDate: "2024-04-05",
//             monthlyPlan: {
//                 coalPaper: 900,
//                 betum: 4500,
//                 totalAmount: 9000000
//             },
//             currentMonthSales: {
//                 coalPaper: 1080,
//                 betum: 5400,
//                 totalAmount: 10800000,
//                 salesCount: 18,
//                 clientsCount: 13
//             },
//             previousMonthSales: {
//                 coalPaper: 870,
//                 betum: 4350,
//                 totalAmount: 8700000
//             },
//             recentActivity: [
//                 {
//                     id: 8,
//                     date: "2024-12-15",
//                     client: "Theta Systems",
//                     amount: 380000,
//                     status: "completed",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 95, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 22.5, unit: "kg", price: 4000 }
//                     ]
//                 },
//                 {
//                     id: 9,
//                     date: "2024-12-14",
//                     client: "Iota Partners",
//                     amount: 290000,
//                     status: "completed",
//                     products: [
//                         { name: "Ko'mir qog'ozi", quantity: 70, unit: "dona", price: 3000 },
//                         { name: "Betum", quantity: 20, unit: "kg", price: 4000 }
//                     ]
//                 }
//             ]
//         }
//     ]
// };