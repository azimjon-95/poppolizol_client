import React from 'react';
import { Modal, Input, Card, Typography, Divider, Tag } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { LuPackagePlus } from 'react-icons/lu';
import { numberFormat } from '../../utils/numberFormat';
import { PhoneNumberFormat } from '../../hook/NumberFormat';

const { Title, Text } = Typography;

const IncomeListModal = ({
    isIncomeListModalOpen,
    setIsIncomeListModalOpen,
    incomeSearchText,
    setIncomeSearchText,
    incomesIsLoading,
    filteredIncomes,
}) => {
    return (
        <Modal
            title={<span style={{ color: '#fff' }}>📊 Kirimlar Tarixi</span>}
            open={isIncomeListModalOpen}
            onCancel={() => {
                setIsIncomeListModalOpen(false);
                setIncomeSearchText('');
            }}
            footer={null}
            className="warehouse-modal warehouse-income-list-modal"
            width={1200}
        >
            {/* Search Header */}
            <div className="warehouse-income-search-section">
                <Input
                    placeholder="Firma yoki material nomi bo'yicha qidiring..."
                    value={incomeSearchText}
                    onChange={(e) => setIncomeSearchText(e.target.value)}
                    className="warehouse-income-search-input"
                    prefix={<BarChartOutlined className="warehouse-search-icon" />}
                    size="large"
                />
            </div>
            <div className="warehouse-income-list-container">
                {/* Income List */}
                <div className="warehouse-income-list">
                    {incomesIsLoading ? (
                        <div className="warehouse-loading-container">
                            <div className="warehouse-loading-spinner"></div>
                            <Text>Kirimlar yuklanmoqda...</Text>
                        </div>
                    ) : filteredIncomes.length === 0 ? (
                        <div className="warehouse-empty-state">
                            <div className="warehouse-empty-icon">📋</div>
                            <Title level={4} className="warehouse-empty-title">
                                {incomeSearchText ? 'Qidiruv natijalari topilmadi' : "Hozircha kirimlar yo'q"}
                            </Title>
                            <Text className="warehouse-empty-text">
                                {incomeSearchText
                                    ? "Boshqa kalit so'z bilan qidiring"
                                    : "Yangi material kelganda bu yerda ko'rinadi"}
                            </Text>
                        </div>
                    ) : (
                        filteredIncomes.map((income) => (
                            <Card key={income._id} className="warehouse-income-card" hoverable>
                                <div className="warehouse-income-header">
                                    <div className="warehouse-income-firm-info">
                                        <Title level={5} className="warehouse-income-firm-name">
                                            🏢 {income.firm?.name || "Noma'lum firma"}
                                        </Title>
                                        <Text className="warehouse-income-firm-phone">
                                            📞 {PhoneNumberFormat(income.firm?.phone) || "Telefon ko'rsatilmagan"}
                                        </Text>
                                    </div>
                                    <div className="warehouse-income-date-amount">
                                        <Tag className="warehouse-income-date-tag">
                                            📅 {new Date(income.createdAt).toLocaleDateString('uz-UZ')}
                                        </Tag>
                                        <Tag className="warehouse-income-amount-tag">
                                            💰 {numberFormat(income.totalAmount)} so'm
                                        </Tag>
                                    </div>
                                </div>

                                <Divider className="warehouse-income-divider" />

                                <div className="warehouse-income-materials">
                                    <Text strong className="warehouse-income-materials-title">
                                        📦 Kelgan materiallar:
                                    </Text>
                                    <div className="warehouse-income-materials-grid">
                                        {income.materials?.map((materialItem, idx) => (
                                            <div key={idx} className="warehouse-income-material-item">
                                                <div className="warehouse-income-material-name">
                                                    <LuPackagePlus className="warehouse-income-material-icon" />
                                                    <Text strong>
                                                        {materialItem.material?.name || "Noma'lum material"}
                                                    </Text>
                                                </div>
                                                <div className="warehouse-income-material-details">
                                                    <Tag className="warehouse-income-quantity-tag">
                                                        {numberFormat(materialItem.quantity)}{' '}
                                                        {materialItem.material?.unit || 'dona'}
                                                    </Tag>
                                                    <Tag
                                                        className={`warehouse-income-price-tag warehouse-price-tag-${materialItem.currency}`}
                                                    >
                                                        {numberFormat(materialItem.price)}{' '}
                                                        {materialItem.currency === 'sum' ? "so'm" : '$'}
                                                    </Tag>
                                                    <Tag className="warehouse-income-price-tag warehouse-price-tag-total">
                                                        {numberFormat(materialItem.price * materialItem.quantity)}{' '}
                                                        {materialItem.currency === 'sum' ? "so'm" : '$'}
                                                    </Tag>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {income.paidAmount > 0 && (
                                    <div className="warehouse-income-payment">
                                        <Text className="warehouse-income-payment-text">
                                            💳 To'langan: <Text strong>{numberFormat(income.paidAmount)} so'm</Text>
                                        </Text>
                                        <Text className="warehouse-income-debt-text">
                                            📋 Qarz:{' '}
                                            <Text
                                                strong
                                                className={
                                                    income.totalAmount - income.paidAmount > 0
                                                        ? 'warehouse-debt-positive'
                                                        : 'warehouse-debt-zero'
                                                }
                                            >
                                                {numberFormat(income.totalAmount - income.paidAmount)} so'm
                                            </Text>
                                        </Text>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default IncomeListModal;