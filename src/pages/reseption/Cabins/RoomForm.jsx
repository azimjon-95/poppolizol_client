import React, { useState, useEffect } from "react";
import {
    Button,
    Radio,
    Input,
    Form,
    Row,
    Select,
} from "antd";

import { CloseOutlined } from "@ant-design/icons";
import { useCreateRoomMutation, useUpdateRoomMutation } from "../../../context/roomApi";
import { useGetWorkersQuery, useUpdateRoomIdMutation } from "../../../context/doctorApi";
import { capitalizeFirstLetter } from "../../../hook/CapitalizeFirstLitter";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { Option } = Select;

const roomTypes = [
    "davolanish",
    "vrach_kabineti",
    "mehmonxona",
    "assosiy_zal",
    "sport_zal",
    "kutubxona",
    "massaj_xonasi",
    "uxlash_xonasi",
    "kuzatuv_xonasi",
    "izolyator",
    "operatsiya_xonasi",
    "intensiv_terapiya",
    "rentgen_xonasi",
    "laboratoriya",
    "qabul_xonasi",
    "resepshn",
    "muolaja_xonasi",
    "sterilizatsiya_xonasi",
    "tibbiy_qadoqlash_xonasi",
    "konsultatsiya_xonasi",
    "psixolog_xonasi",
    "administratsiya",
    "personal_xonasi",
    "arxiv",
    "omborxona",
    "emlash_xonasi",
    "fizioterapiya_xonasi",
    "ultratovush_xonasi",
    "EKG_xonasi",
    "dializ_xonasi",
    "quvvatlash_xonasi",
    "ginekologiya_xonasi",
    "lola_xonasi",
    "karantin_xonasi",
    "karavot_almashish_xonasi",
    "kiyinish_xonasi",
    "xodimlar_ovqatlanish_xonasi",
    "mehmonlar_kutish_xonasi",
    "ta'mirlash_xonasi",
    "texnik_xona",
    "dush_xonasi",
    "tualet_xonasi",
    "yuvinish_xonasi",
    "kislorod_xonasi",
    "boshqa",
];

const RoomForm = ({ visible, onClose, mode = "create", roomData = null }) => {
    const [form] = Form.useForm();
    const [error, setError] = useState("");
    const [roomType, setRoomType] = useState(roomData?.roomType || "davolanish");
    const [updateRoomId, { isLoading: isUpdatingRoomId }] = useUpdateRoomIdMutation();
    const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
    const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
    const { data, isLoading } = useGetWorkersQuery();

    const nurses = data?.innerData?.filter((worker) => worker.role === "nurse") || [];
    const cleaners = data?.innerData?.filter((worker) => worker.role === "cleaner") || [];
    const doctor = data?.innerData?.filter((worker) => worker.role === "doctor") || [];

    useEffect(() => {
        if (mode === "update" && roomData) {
            // Pre-fill form with room data
            form.setFieldsValue({
                roomType: roomData.roomType || "davolanish",
                name: roomData.name || "",
                roomNumber: roomData.roomNumber || "",
                pricePerDay: roomData.pricePerDay || "",
                usersNumber: roomData.usersNumber || "",
                floor: roomData.floor || "",
                category: roomData.category || "econom",
                nurse: roomData.nurse?._id || undefined,
                cleaner: roomData.cleaner?._id || undefined,
                doctorId: roomData.doctorId?._id || undefined,
            });

            setRoomType(roomData.roomType || "davolanish");
        } else {
            form.resetFields();
            setRoomType("davolanish");
        }
    }, [mode, roomData, form]);

    const onFinish = async (values) => {
        if (
            values.roomNumber <= 0 ||
            values.pricePerDay <= 0 ||
            values.usersNumber <= 0 ||
            values.floor <= 0
        ) {
            return toast.warning("Iltimos, to'g'ri son kiritng", {
                position: "top-right",
                autoClose: 3000,
            });
        }

        if (values.usersNumber >= 6) {
            return toast.warning("Bir xonaga 6 tadan ko'p odam bo‘lmaydi.", {
                position: "top-right",
                autoClose: 3000,
            });
        }

        const roomPayload = {
            roomNumber: +values.roomNumber || 0,
            pricePerDay: +values.pricePerDay || 0,
            usersNumber: +values.usersNumber || 0,
            floor: +values.floor,
            category: values.category,
            roomType: roomType,
            name: values.name || "",
            nurse: values.nurse || undefined,
            cleaner: values.cleaner || undefined,
            doctorId: values.doctor || undefined,
        };

        try {
            if (mode === "update") {
                // Update room
                await updateRoom({ id: roomData._id, ...roomPayload }).unwrap();
                toast.success("Xona muvaffaqiyatli yangilandi", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                // Create room
                await createRoom(roomPayload).unwrap();
                toast.success("Xona muvaffaqiyatli qo'shildi", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
            console.log({ adminId: values.doctor, roomId: roomData._id });
            await updateRoomId({ adminId: values.doctor, roomId: roomData._id }).unwrap();
            form.resetFields();
            setRoomType("davolanish");
            onClose();
        } catch (error) {
            toast.error(error.data?.message || `Xona ${mode === "update" ? "yangilashda" : "qo'shishda"} xatolik yuz berdi`, {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        const maxLength = 5;
        if (inputValue > maxLength) {
            setError(`Xona sig'imi ${maxLength} dan ko'proq bo'lishi mumkin emas!`);
        } else {
            setError("");
        }
    };

    if (!visible) return null;

    return (
        <div className="modalroom-content">
            <ToastContainer />
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                className="FormApply"
            >
                <h4 style={{ textAlign: "center", lineHeight: "10px" }}>
                    {mode === "update" ? "Xona Tahrirlash" : "Xona Qo'shish"}
                </h4>

                <Form.Item
                    label="Xona turi"
                    name="roomType"
                    initialValue={roomType}
                >
                    <Select
                        showSearch
                        placeholder="Xona turini tanlang"
                        defaultValue={roomType}
                        onChange={(value) => setRoomType(value)}
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {roomTypes.map((type) => (
                            <Option key={type} value={type}>
                                {capitalizeFirstLetter(type.replace(/_/g, " "))}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                {roomType !== "davolanish" && (
                    <Form.Item
                        label="Xona nomi"
                        name="name"
                        rules={[
                            { required: true, message: "Iltimos, xona nomini kiriting!" },
                        ]}
                    >
                        <Input placeholder="Xona nomi" />
                    </Form.Item>
                )}

                <Form.Item
                    label="Xonaning raqami"
                    name="roomNumber"
                    rules={[
                        {
                            required: roomType === "davolanish" || roomType === "vrach_kabineti",
                            message: "Iltimos, xona raqamini kiriting!",
                        },
                    ]}
                >
                    <Input type="number" placeholder="Xona raqami" />
                </Form.Item>

                {roomType === "davolanish" && (
                    <Form.Item
                        label="Bir kunlik narxi"
                        name="pricePerDay"
                        rules={[
                            { required: true, message: "Iltimos, kunlik to‘lovi kiriting!" },
                        ]}
                    >
                        <Input type="number" placeholder="1 kunlik to'lovi" />
                    </Form.Item>
                )}

                {roomType === "davolanish" && (
                    <Form.Item
                        label="Xona sig'imi"
                        name="usersNumber"
                        validateStatus={error ? "error" : ""}
                        help={error}
                        rules={[
                            { required: true, message: "Iltimos, xona sig‘imini kiriting!" },
                        ]}
                    >
                        <Input
                            type="number"
                            placeholder="Ex: 4ta"
                            onChange={handleInputChange}
                        />
                    </Form.Item>
                )}

                <Form.Item
                    label="Qavat"
                    name="floor"
                    rules={[{ required: true, message: "Iltimos, qavatni kiriting!" }]}
                >
                    <Input type="number" placeholder="Ex: 1-qavat" />
                </Form.Item>

                {roomType === "davolanish" && (
                    <Form.Item
                        label="Xona Kategoriyasi"
                        name="category"
                        rules={[{ required: true, message: "Iltimos, kategoriya tanlang!" }]}
                    >
                        <Radio.Group>
                            <Radio value="econom">Oddiy</Radio>
                            <Radio value="luxury">Lyuks</Radio>
                            <Radio value="pollux">Pol lyuks</Radio>
                        </Radio.Group>
                    </Form.Item>
                )}
                {roomType !== "davolanish" && (

                    <Form.Item label="Doktor" name="doctor">
                        <Select
                            showSearch
                            placeholder="Doktorni tanlang"
                            allowClear
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            loading={isLoading}
                        >
                            {doctor.map((nurse) => (
                                <Option key={nurse._id} value={nurse._id}>
                                    {`${capitalizeFirstLetter(nurse.firstName)} ${capitalizeFirstLetter(nurse.lastName)}: ${capitalizeFirstLetter(nurse.specialization)}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
                <Form.Item label="Hamshira" name="nurse">
                    <Select
                        showSearch
                        placeholder="Hamshirani tanlang"
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        loading={isLoading}
                    >
                        {nurses.map((nurse) => (
                            <Option key={nurse._id} value={nurse._id}>
                                {`${capitalizeFirstLetter(nurse.firstName)} ${capitalizeFirstLetter(nurse.lastName)}`}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item label="Farrosh" name="cleaner">
                    <Select
                        showSearch
                        placeholder="Farroshni tanlang"
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                        }
                        loading={isLoading}
                    >
                        {cleaners.map((cleaner) => (
                            <Option key={cleaner._id} value={cleaner._id}>
                                {`${capitalizeFirstLetter(cleaner.firstName)} ${capitalizeFirstLetter(cleaner.lastName)}`}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Row style={{ display: "flex", gap: "5px" }}>
                    <Button
                        style={{ width: "88%" }}
                        loading={isCreating || isUpdating}
                        type="primary"
                        htmlType="submit"
                    >
                        {mode === "update" ? "Yangilash" : "Saqlash"}
                    </Button>
                    <Button
                        style={{
                            width: "10%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                        onClick={onClose}
                    >
                        <CloseOutlined />
                    </Button>
                </Row>
            </Form>
        </div>
    );
};

export default RoomForm;