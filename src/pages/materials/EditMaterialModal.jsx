import React, { useState } from "react";
import { Modal, Form, Typography, Divider, Input, Select, Button, Row, Col } from 'antd';
import { LuPackagePlus } from 'react-icons/lu';
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from 'react-toastify';
import { useGetFactoriesQuery } from "../../context/clinicApi";
import { useGetFirmsQuery, useCreateIncomeMutation } from "../../context/materialApi";

const { Option } = Select;
const { Title, Text } = Typography;

const numberFormat = (value) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
};

const FormattedInput = ({ value, onChange, max, min, ...props }) => {
    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9.]/g, '');
        const parsedValue = parseFloat(rawValue) || 0;
        if ((max !== undefined && parsedValue > max) || (min !== undefined && parsedValue < min)) {
            return;
        }
        onChange(parsedValue);
    };
    return <Input value={value} onChange={handleChange} {...props} />;
};

const EditMaterialModal = ({ setIsIncomeModalOpen, isIncomeModalOpen }) => {
    const [createIncome, { isLoading: createIncomeLoading }] = useCreateIncomeMutation();
    const { data: factories } = useGetFactoriesQuery();
    const [incomeForm] = Form.useForm();
    const { data: firms, isLoading: firmsLoading } = useGetFirmsQuery();

    const firmsData = firms?.innerData || [];
    const [paidAmount, setPaidAmount] = useState(0);
    const [paymentType, setPaymentType] = useState("naqt");
    const [vatPercentage, setVatPercentage] = useState(12);
    const [selectedMaterials, setSelectedMaterials] = useState([]);

    const handleAddMaterialToIncome = () => {
        const newMaterial = {
            id: Date.now(),
            name: "",
            quantity: 0,
            price: 0,
            currency: "sum",
            category: "Boshqalar",
            unit: "kilo",
        };
        setSelectedMaterials([...selectedMaterials, newMaterial]);
    };

    const handleRemoveMaterialFromIncome = (id) => {
        setSelectedMaterials(selectedMaterials.filter((m) => m.id !== id));
    };

    const handleMaterialChange = (id, field, value) => {
        console.log(`Material ${id} ${field}:`, value);
        setSelectedMaterials(
            selectedMaterials.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    const handleIncomeSubmit = async () => {
        try {
            const values = await incomeForm.validateFields();

            if (selectedMaterials.length === 0) {
                toast.error("Hech bo'lmaganda bitta material qo'shing");
                return;
            }

            for (const material of selectedMaterials) {
                if (
                    !material.name ||
                    !material.quantity ||
                    !material.price ||
                    !material.unit ||
                    !material.category
                ) {
                    toast.error("Barcha materiallar to'liq to'ldirilishi kerak");
                    return;
                }
            }

            const selectedFirm = firmsData.find((firm) => firm._id === values.firmId);
            if (!selectedFirm) {
                toast.error("Firma topilmadi");
                return;
            }

            const baseTotal = selectedMaterials.reduce(
                (sum, material) => sum + Number(material.quantity) * Number(material.price),
                0
            );

            const vatAmount = paymentType === "bank"
                ? (baseTotal * Number(vatPercentage)) / (100 + Number(vatPercentage))
                : 0;

            const totalWithoutVat = baseTotal - vatAmount;

            const incomeData = {
                firm: {
                    name: selectedFirm.name,
                    phone: selectedFirm.phone,
                    address: selectedFirm.address,
                },
                materials: selectedMaterials.map((material) => ({
                    name: material.name,
                    quantity: Number(material.quantity),
                    price: Number(material.price),
                    currency: "sum",
                    unit: material.unit,
                    category: material.category,
                })),
                price: Number(paidAmount) || 0,
                paymentType: paymentType,
                vatPercentage: paymentType === "bank" ? Number(vatPercentage) : 0,
                totalWithVat: Number(baseTotal),
                totalWithoutVat: Number(totalWithoutVat),
                vatAmount: Number(vatAmount),
            };

            console.log("Income Data:", incomeData);
            await createIncome(incomeData).unwrap();
            toast.success("Kirim muvaffaqiyatli qo'shildi");
            setIsIncomeModalOpen(false);
            setSelectedMaterials([]);
            setPaidAmount(0);
            setPaymentType("naqt");
            setVatPercentage(12);
            incomeForm.resetFields();
        } catch (error) {
            toast.error(error?.data?.message || "Kirim qo'shishda xatolik yuz berdi");
        }
    };

    return (
        <Modal
            title={<span style={{ color: "#fff" }}>Yangi Material Keldi</span>}
            open={isIncomeModalOpen}
            onCancel={() => {
                setIsIncomeModalOpen(false);
                setSelectedMaterials([]);
                setPaidAmount(0);
                setPaymentType("naqt");
                setVatPercentage(12);
                incomeForm.resetFields();
            }}
            footer={null}
            className="warehouse-modal"
            width={800}
        >
            <Form
                form={incomeForm}
                layout="vertical"
                onFinish={handleIncomeSubmit}
                className="warehouse-add-form"
            >
                <Form.Item
                    label="Firmani tanlang"
                    name="firmId"
                    rules={[{ required: true, message: "Firmani tanlash shart" }]}
                    className="warehouse-form-item"
                >
                    <Select
                        placeholder="Firmani tanlang"
                        className="warehouse-select"
                        loading={firmsLoading}
                    >
                        {firmsData?.map((firm) => (
                            <Option key={firm._id} value={firm._id}>
                                {firm.name} | {firm.phone}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Divider className="warehouse-divider">Materiallar</Divider>

                {selectedMaterials.map((material) => {
                    const materialTotalPrice = Number(material.quantity) * Number(material.price);
                    const materialVatAmount = paymentType === "bank"
                        ? (materialTotalPrice * Number(vatPercentage)) / (100 + Number(vatPercentage))
                        : 0;
                    const materialTotalWithoutVat = materialTotalPrice - materialVatAmount;
                    const materialQuantity = Number(material.quantity);
                    const materialPricePerKgWithoutVat = materialQuantity > 0 ? materialTotalWithoutVat / materialQuantity : 0;
                    const materialVatPerKg = materialQuantity > 0 ? materialVatAmount / materialQuantity : 0;

                    return (
                        <div key={material.id} style={{ marginBottom: 16 }}>
                            <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
                                <Col xs={24} sm={12} md={8}>
                                    <Input
                                        placeholder="Material nomini kiriting"
                                        value={material.name}
                                        onChange={(e) => handleMaterialChange(material.id, "name", e.target.value)}
                                        className="warehouse-input"
                                        prefix={<LuPackagePlus />}
                                    />
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name={`quantity_${material.id}`}
                                        initialValue={material.quantity}
                                        rules={[{ required: true, message: "Miqdor kiritish shart" }]}
                                    >
                                        <FormattedInput
                                            placeholder="Miqdor"
                                            value={material.quantity}
                                            onChange={(value) => handleMaterialChange(material.id, "quantity", value)}
                                            className="warehouse-input"
                                            min={0}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Form.Item
                                        name={`price_${material.id}`}
                                        initialValue={material.price}
                                        rules={[{ required: true, message: "Narx kiritish shart" }]}
                                    >
                                        <FormattedInput
                                            placeholder="Narx"
                                            value={material.price}
                                            onChange={(value) => handleMaterialChange(material.id, "price", value)}
                                            className="warehouse-input"
                                            min={0}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} md={8}>
                                    <Select
                                        placeholder="Birlikni tanlang"
                                        value={material.unit}
                                        onChange={(value) => handleMaterialChange(material.id, "unit", value)}
                                        className="warehouse-selectoption"
                                    >
                                        <Option value="kilo">Kilogram (kg)</Option>
                                        <Option value="dona">Dona</Option>
                                        <Option value="metr">Metr (m)</Option>
                                    </Select>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Select
                                        placeholder="Kategoriyani tanlang"
                                        value={material.category}
                                        onChange={(value) => handleMaterialChange(material.id, "category", value)}
                                        className="warehouse-selectoption"
                                    >
                                        <Option value="BN-3">BN-3</Option>
                                        <Option value="BN-5">BN-5</Option>
                                        <Option value="Mel">Mel</Option>
                                        <Option value="ip">Ip</Option>
                                        <Option value="kraf">Kraf qog'oz</Option>
                                        <Option value="qop">Qop</Option>
                                        <Option value="Others">Boshqalar</Option>
                                    </Select>
                                </Col>
                                <Col xs={24} sm={12} md={8}>
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveMaterialFromIncome(material.id)}
                                        className="warehouse-delete-btn"
                                        style={{ width: "100%", height: "38px" }}
                                    />
                                </Col>
                            </Row>
                            <div style={{ margin: "16px 0px", padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                                {paymentType === "bank" && vatPercentage > 0 ? (
                                    <>
                                        <Text strong style={{ color: '#52c41a' }}>
                                            <strong>Umumiy NDSsiz summa:</strong> <strong>{numberFormat(Math.round(materialTotalWithoutVat))}</strong> so'm
                                        </Text><br />
                                        <Text strong style={{ color: '#fa541c' }}>
                                            Umumiy NDS miqdori ({vatPercentage}%): <strong>{numberFormat(Math.round(materialVatAmount))}</strong> so'm
                                        </Text><br />
                                        <Text strong style={{ color: '#1890ff' }}>
                                            Jami summa: {numberFormat(materialTotalPrice)} so'm
                                        </Text><br />
                                        {materialQuantity > 0 && (
                                            <>
                                                <Text style={{ color: '#722ed1' }}>
                                                    <strong>1 kg NDSsiz narx:</strong> <strong>{numberFormat(materialPricePerKgWithoutVat.toFixed(2))}</strong> so'm
                                                </Text><br />
                                                <Text style={{ color: '#eb2f96' }}>
                                                    <strong>1 kg uchun NDS miqdori:</strong> <strong>{numberFormat(materialVatPerKg.toFixed(2))}</strong> so'm
                                                </Text><br />
                                                <Text style={{ color: '#13c2c2' }}>
                                                    <strong>Jami miqdor:</strong> {numberFormat(materialQuantity)} kg
                                                </Text>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <Text strong style={{ color: '#1890ff' }}>
                                        Jami summa: {numberFormat(materialTotalPrice)} so'm
                                    </Text>
                                )}
                            </div>
                        </div>
                    );
                })}
                <Button
                    type="dashed"
                    onClick={handleAddMaterialToIncome}
                    block
                    icon={<PlusOutlined />}
                    className="warehouse-add-material-btn"
                    style={{ marginBottom: 24 }}
                >
                    Material Qo'shish
                </Button>

                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={paymentType === "bank" ? 14 : 12}>
                        <Form.Item
                            label="To'langan summa"
                            name="paidAmount"
                            rules={[{ required: true, message: "To'langan summa kiritish shart" }]}
                            className="warehouse-form-item"
                        >
                            <FormattedInput
                                placeholder="To'langan summani kiriting"
                                value={paidAmount}
                                onChange={(value) => {
                                    console.log("Paid Amount:", value);
                                    setPaidAmount(value);
                                }}
                                max={selectedMaterials.reduce(
                                    (sum, material) => sum + Number(material.quantity) * Number(material.price),
                                    0
                                )}
                                min={0}
                                className="warehouse-input"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={paymentType === "bank" ? 5 : 12}>
                        <Form.Item
                            label="To'lov turi"
                            name="paymentType"
                            initialValue="naqt"
                            className="warehouse-form-item"
                        >
                            <Select
                                className="warehouse-select"
                                onChange={(value) => setPaymentType(value)}
                            >
                                <Option value="naqt">Naqt</Option>
                                <Option value="bank">Bank</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    {paymentType === "bank" && (
                        <Col xs={24} sm={12} md={5}>
                            <Form.Item
                                label="NDS (%)"
                                name="vatPercentage"
                                initialValue={factories?.innerData?.[0]?.nds || 12}
                                rules={[{ required: true, message: "NDS foiz kiritish shart" }]}
                                className="warehouse-form-item"
                            >
                                <FormattedInput
                                    placeholder="NDS foiz"
                                    value={vatPercentage}
                                    onChange={(value) => {
                                        console.log("VAT Percentage:", value);
                                        setVatPercentage(value);
                                    }}
                                    max={100}
                                    min={0}
                                    className="warehouse-input"
                                />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <Button
                    type="primary"
                    style={{ width: "100%", margin: "15px 0" }}
                    htmlType="submit"
                    loading={createIncomeLoading}
                    icon={<PlusOutlined />}
                    size="large"
                    className="warehouse-submit-btn"
                >
                    Saqlash
                </Button>
            </Form>
        </Modal>
    );
};

export default EditMaterialModal;
