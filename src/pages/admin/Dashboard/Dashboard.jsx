import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Users, Package, DollarSign, TrendingUp, Star, Award, ArrowDownCircle, ArrowUpCircle, CreditCard, Banknote, Building2, Calendar, ShoppingCart, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import './clinicDashboard.css';

const Dashboard = () => {
    const [selectedMonth, setSelectedMonth] = useState('2025-06');

    // Oylik statistika
    const monthlyStats = [
        {
            month: '2025-06',
            totalSales: 2800000000,
            totalProducts: 15000,
            totalOrders: 450,
            totalExpenses: 1900000000,
            profit: 900000000,
        },
        {
            month: '2025-05',
            totalSales: 2500000000,
            totalProducts: 13500,
            totalOrders: 420,
            totalExpenses: 1700000000,
            profit: 800000000,
        },
    ];

    // Sotuvchilar ma'lumotlari
    const salespeople = [
        {
            id: 1,
            name: "Abdulloh Karimov",
            monthlyTarget: 700000000,
            currentSales: 820000000,
            percentage: 117,
            rank: 1,
            orders: 95,
            avgOrderValue: 8631579
        },
        {
            id: 2,
            name: "Malika Rahimova",
            monthlyTarget: 650000000,
            currentSales: 720000000,
            percentage: 111,
            rank: 2,
            orders: 88,
            avgOrderValue: 8181818
        },
        {
            id: 3,
            name: "Jasur Toshmatov",
            monthlyTarget: 600000000,
            currentSales: 580000000,
            percentage: 97,
            rank: 3,
            orders: 75,
            avgOrderValue: 7733333
        },
        {
            id: 4,
            name: "Dilnoza Sharipova",
            monthlyTarget: 550000000,
            currentSales: 490000000,
            percentage: 89,
            rank: 4,
            orders: 68,
            avgOrderValue: 7205882
        },
    ];

    // To'lov turlari statistikasi
    const paymentStats = [
        { name: 'Naqd', value: 45, amount: 1260000000, color: '#22c55e' },
        { name: 'Karta', value: 35, amount: 980000000, color: '#3b82f6' },
        { name: 'Bank', value: 20, amount: 560000000, color: '#8b5cf6' },
    ];

    // Kunlik sotuvlar
    const dailySales = [
        { day: 1, sales: 95000000, orders: 15, products: 520 },
        { day: 2, sales: 87000000, orders: 14, products: 480 },
        { day: 3, sales: 102000000, orders: 16, products: 560 },
        { day: 4, sales: 89000000, orders: 13, products: 495 },
        { day: 5, sales: 115000000, orders: 18, products: 610 },
        { day: 6, sales: 98000000, orders: 15, products: 530 },
        { day: 7, sales: 92000000, orders: 14, products: 505 },
        { day: 8, sales: 108000000, orders: 17, products: 575 },
        { day: 9, sales: 85000000, orders: 12, products: 465 },
        { day: 10, sales: 97000000, orders: 15, products: 525 },
        { day: 11, sales: 103000000, orders: 16, products: 550 },
        { day: 12, sales: 91000000, orders: 14, products: 490 },
        { day: 13, sales: 106000000, orders: 17, products: 570 },
        { day: 14, sales: 88000000, orders: 13, products: 475 },
        { day: 15, sales: 99000000, orders: 15, products: 535 },
        { day: 16, sales: 94000000, orders: 14, products: 510 },
    ];

    // Kunlik kirim-chiqim ma'lumotlari
    const dailyIncomeExpense = [
        { day: 1, income: 95000000, expense: 65000000 },
        { day: 2, income: 87000000, expense: 60000000 },
        { day: 3, income: 102000000, expense: 70000000 },
        { day: 4, income: 89000000, expense: 62000000 },
        { day: 5, income: 115000000, expense: 80000000 },
        { day: 6, income: 98000000, expense: 67000000 },
        { day: 7, income: 92000000, expense: 64000000 },
        { day: 8, income: 108000000, expense: 75000000 },
        { day: 9, income: 85000000, expense: 59000000 },
        { day: 10, income: 97000000, expense: 66000000 },
        { day: 11, income: 103000000, expense: 71000000 },
        { day: 12, income: 91000000, expense: 63000000 },
        { day: 13, income: 106000000, expense: 73000000 },
        { day: 14, income: 88000000, expense: 61000000 },
        { day: 15, income: 99000000, expense: 68000000 },
        { day: 16, income: 94000000, expense: 65000000 },
    ];

    // Pul formatlash
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('uz-UZ', {
            style: 'currency',
            currency: 'UZS',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Foiz hisoblash
    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return 0;
        return ((current - previous) / previous * 100).toFixed(1);
    };

    const currentMonthData = monthlyStats.find(stat => stat.month === selectedMonth) || monthlyStats[0];
    const previousMonthData = monthlyStats[1];

    const salesGrowth = calculatePercentageChange(currentMonthData.totalSales, previousMonthData.totalSales);
    const productsGrowth = calculatePercentageChange(currentMonthData.totalProducts, previousMonthData.totalProducts);
    const ordersGrowth = calculatePercentageChange(currentMonthData.totalOrders, previousMonthData.totalOrders);
    const profitGrowth = calculatePercentageChange(currentMonthData.profit, previousMonthData.profit);

    return (
        <div className="dashboard-container">

            {/* Asosiy statistika kartalar */}
            <div className="stats-grid">
                <div className="stat-card sales-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Jami Sotuvlar</p>
                            <p className="stat-value">{formatCurrency(currentMonthData.totalSales)}</p>
                            <p className={`stat-change ${salesGrowth >= 0 ? 'positive' : 'negative'}`}>
                                {salesGrowth >= 0 ? '+' : ''}{salesGrowth}% o'tgan oyga nisbatan
                            </p>
                        </div>
                        <DollarSign className="stat-icon" />
                    </div>
                </div>

                <div className="stat-card products-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Mahsulotlar Soni</p>
                            <p className="stat-value">{currentMonthData.totalProducts.toLocaleString()}</p>
                            <p className={`stat-change ${productsGrowth >= 0 ? 'positive' : 'negative'}`}>
                                {productsGrowth >= 0 ? '+' : ''}{productsGrowth}% o'tgan oyga nisbatan
                            </p>
                        </div>
                        <Package className="stat-icon" />
                    </div>
                </div>

                <div className="stat-card orders-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Buyurtmalar</p>
                            <p className="stat-value">{currentMonthData.totalOrders}</p>
                            <p className={`stat-change ${ordersGrowth >= 0 ? 'positive' : 'negative'}`}>
                                {ordersGrowth >= 0 ? '+' : ''}{ordersGrowth}% o'tgan oyga nisbatan
                            </p>
                        </div>
                        <Users className="stat-icon" />
                    </div>
                </div>

                <div className="stat-card profit-card">
                    <div className="stat-content">
                        <div>
                            <p className="stat-label">Sof Foyda</p>
                            <p className="stat-value">{formatCurrency(currentMonthData.profit)}</p>
                            <p className={`stat-change ${profitGrowth >= 0 ? 'positive' : 'negative'}`}>
                                {profitGrowth >= 0 ? '+' : ''}{profitGrowth}% o'tgan oyga nisbatan
                            </p>
                        </div>
                        <TrendingUp className="stat-icon" />
                    </div>
                </div>
            </div>


            {/* Kirim-chiqim diagrammalari */}
            <div className="card">
                <h3 className="card-title">
                    <BarChart2 className="icon" />
                    Kunlik Kirim va Chiqim
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyIncomeExpense}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="day" stroke="#94a3b8" />
                        <YAxis
                            tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                            stroke="#94a3b8"
                        />
                        <Tooltip
                            formatter={(value, name) => [formatCurrency(value), name === 'income' ? 'Kirim' : 'Chiqim']}
                            labelFormatter={(label) => `${label}-kun`}
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="income"
                            stroke="#22c55e"
                            strokeWidth={3}
                            name="Kirim"
                        />
                        <Line
                            type="monotone"
                            dataKey="expense"
                            stroke="#ef4444"
                            strokeWidth={3}
                            name="Chiqim"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>


            {/* Sotuvchilar reytingi */}
            <div className="card">
                <h3 className="card-title">
                    <Award className="icon" />
                    Sotuvchilar Reytingi va Oylik Vazifalar
                </h3>
                <div className="salespeople-grid">
                    {salespeople.map((person) => (
                        <div key={person.id} className="salesperson-card">
                            <div className="salesperson-header">
                                <div className="salesperson-info">
                                    <div className={`rank-badge rank-${person.rank}`}>
                                        {person.rank === 1 ? <Star className="icon small-icon" /> : person.rank}
                                    </div>
                                    <h4 className="salesperson-name">{person.name}</h4>
                                </div>
                                <span className={`percentage ${person.percentage >= 100 ? 'positive' : 'negative'}`}>
                                    {person.percentage}%
                                </span>
                            </div>

                            <div className="progress-section">
                                <div className="progress-labels">
                                    <span>Vazifa: {formatCurrency(person.monthlyTarget)}</span>
                                    <span>Hozirgi: {formatCurrency(person.currentSales)}</span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className={`progress-fill ${person.percentage >= 100 ? 'complete' : ''}`}
                                        style={{ width: `${Math.min(person.percentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="salesperson-stats">
                                <span>Buyurtmalar: {person.orders}</span>
                                <span>O'rtacha: {formatCurrency(person.avgOrderValue)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Diagrammalar */}
            <div className="charts-grid">
                {/* Kunlik sotuvlar */}
                <div className="card">
                    <h3 className="card-title">
                        <ShoppingCart className="icon" />
                        Kunlik Sotuvlar
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailySales}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="day" stroke="#94a3b8" />
                            <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} stroke="#94a3b8" />
                            <Tooltip
                                formatter={(value, name) => [
                                    name === 'sales' ? formatCurrency(value) : value,
                                    name === 'sales' ? 'Sotuvlar' : name === 'orders' ? 'Buyurtmalar' : 'Mahsulotlar'
                                ]}
                                labelFormatter={(label) => `${label}-kun`}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#22c55e"
                                strokeWidth={3}
                                name="Sotuvlar"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* To'lov turlari */}
                <div className="card">
                    <h3 className="card-title">
                        <PieChartIcon className="icon" />
                        To'lov Turlari
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={paymentStats}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                            >
                                {paymentStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [`${value}%`, name]}
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="payment-legend">
                        {paymentStats.map((payment) => (
                            <div key={payment.name} className="payment-item">
                                <div
                                    className="color-indicator"
                                    style={{ backgroundColor: payment.color }}
                                ></div>
                                <span className="payment-name">{payment.name}</span>
                                <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sotuvchilar performance chart */}
            <div className="card">
                <h3 className="card-title">
                    <BarChart2 className="icon" />
                    Sotuvchilar Natijalari
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salespeople} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} stroke="#94a3b8" />
                        <Tooltip
                            formatter={(value, name) => [
                                name === 'monthlyTarget' || name === 'currentSales' ? formatCurrency(value) : value,
                                name === 'monthlyTarget' ? 'Oylik Vazifa' : name === 'currentSales' ? 'Hozirgi Sotuvlar' : name
                            ]}
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Bar dataKey="monthlyTarget" fill="#64748b" name="Oylik Vazifa" />
                        <Bar dataKey="currentSales" fill="#22c55e" name="Hozirgi Sotuvlar" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Jami statistika */}
            <div className="card">
                <h3 className="card-title">
                    <PieChartIcon className="icon" />
                    Jami To'lovlar Statistikasi
                </h3>
                <div className="payment-stats-grid">
                    <div className="payment-stat cash">
                        <Banknote className="stat-icon" />
                        <p className="stat-label">Naqd To'lovlar</p>
                        <p className="stat-value">{formatCurrency(paymentStats[0].amount)}</p>
                        <p className="stat-percentage">{paymentStats[0].value}% umumiy</p>
                    </div>

                    <div className="payment-stat card">
                        <CreditCard className="stat-icon" />
                        <p className="stat-label">Karta To'lovlari</p>
                        <p className="stat-value">{formatCurrency(paymentStats[1].amount)}</p>
                        <p className="stat-percentage">{paymentStats[1].value}% umumiy</p>
                    </div>

                    <div className="payment-stat bank">
                        <Building2 className="stat-icon" />
                        <p className="stat-label">Bank To'lovlari</p>
                        <p className="stat-value">{formatCurrency(paymentStats[2].amount)}</p>
                        <p className="stat-percentage">{paymentStats[2].value}% umumiy</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;