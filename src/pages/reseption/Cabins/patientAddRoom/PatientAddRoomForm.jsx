import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPotsentsQuery, useUpdatePotsentsMutation } from '../../../../context/clientApi';
import { useAddPatientToRoomMutation } from '../../../../context/roomApi';
import { useGetWorkersQuery } from '../../../../context/doctorApi';
import { User, Phone, MapPin, ChevronLeft, Check, Home, Edit2 } from "lucide-react";
import { useSelector } from 'react-redux';
import { Input, Spin, Select, Modal } from "antd";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./style.css";

const { Option } = Select;

const PatientAddRoomForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading: isFetchingPatients, isError, error } = useGetPotsentsQuery();
    const { data: doctors, isLoading: loading, error: getError } = useGetWorkersQuery();
    const [updatePatient] = useUpdatePotsentsMutation();
    const { searchQuery } = useSelector(state => state.search);
    const [addPatientToRoom, { isLoading }] = useAddPatientToRoomMutation();

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [days, setDays] = useState("");
    const [editIdNumber, setEditIdNumber] = useState("");
    const [isEditingId, setIsEditingId] = useState(null);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const patients = data?.innerData || [];
    const filteredDoctors = doctors?.innerData?.filter(doctor => doctor.role === "doctor") || [];

    useEffect(() => {
        if (isError) {
            toast.error(`Ma'lumotlarni olishda xatolik: ${error?.message || "Noma'lum xatolik"}`, {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    }, [isError, error]);

    const filteredPatients = patients.filter(patient =>
        patient.idNumber?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePatientSelect = (patient) => {
        if (selectedPatient?._id === patient._id) {
            setSelectedPatient(null);
            setSelectedRoom(null);
            setDays("");
            setIsEditingId(null);
            setSelectedDoctor(null);
            setIsModalVisible(false);
        } else {
            setSelectedPatient(patient);
            setSelectedRoom(null);
            setDays("");
            setIsEditingId(null);
            setSelectedDoctor(null);
            setIsModalVisible(true);
        }
    };

    const handleEditIdNumber = (patient) => {
        setIsEditingId(patient._id);
        setEditIdNumber(patient.idNumber || "");
    };

    const handleSaveIdNumber = async (patientId) => {
        if (!editIdNumber.trim()) {
            toast.warning("ID Raqam bo'sh bo'lmasligi kerak!", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        try {
            await updatePatient({ id: patientId, idNumber: editIdNumber }).unwrap();
            toast.success("ID Raqam muvaffaqiyatli yangilandi!", {
                position: "top-center",
                autoClose: 3000,
            });
            setIsEditingId(null);
            setEditIdNumber("");
        } catch (error) {
            console.error("Error updating ID Number:", error);
            toast.error(error.data.message || "ID Raqamni yangilashda xatolik yuz berdi!", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };

    const handleSubmit = async (patient, days) => {
        if (!patient || !id || !days || !selectedDoctor) {
            toast.warning("Iltimos, barcha maydonlarni to'ldiring, shu jumladan shifokor!", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        const res = patients.find(p => p._id === patient._id);
        if (!res.idNumber) {
            toast.warning("Bemorni joylashtirish uchun ID Raqam talab qilinadi!", {
                position: "top-center",
                autoClose: 3000,
            });
            return;
        }

        const assignmentData = {
            patientId: res._id,
            treatingDays: parseInt(days),
            doctorId: selectedDoctor
        };

        try {
            await addPatientToRoom({ id, ...assignmentData }).unwrap();
            toast.success("Bemor xonaga muvaffaqiyatli joylashtirildi!", {
                position: "top-center",
                autoClose: 3000,
            });
            navigate(`/room/${id}`);
            setSelectedPatient(null);
            setSelectedRoom(null);
            setDays("");
            setSelectedDoctor(null);
            setIsModalVisible(false);
        } catch (error) {
            console.error("Error assigning patient to room:", error);
            toast.error(error.data.message || "Xonaga joylashtirishda xatolik yuz berdi!", {
                position: "top-center",
                autoClose: 3000,
            });
        }
    };

    const handleDoctorSearch = (input, option) => {
        const searchText = input.toLowerCase();
        const doctorText = option.children.toLowerCase();
        return doctorText.includes(searchText);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedPatient(null);
        setDays("");
        setSelectedDoctor(null);
    };

    return (
        <div className="PatientAddRoomForm-container">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="PatientAddRoomForm-card">
                <div className="PatientAddRoomForm-header">
                    <button
                        onClick={() => navigate(-1)}
                        className="PatientAddRoomForm-backButton"
                        aria-label="Orqaga qaytish"
                    >
                        <ChevronLeft className="PatientAddRoomForm-iconSmall" />
                    </button>
                    <h1 className="PatientAddRoomForm-title">Bemorni Xonaga Joylashtirish</h1>
                </div>
                {isFetchingPatients || loading ? (
                    <div className="PatientAddRoomForm-loading">
                        <Spin tip="Ma'lumotlar yuklanmoqda..." size="large" />
                    </div>
                ) : (
                    <div className="PatientAddRoomForm-tableWrapper">
                        <table className="PatientAddRoomForm-table">
                            <thead className="PatientAddRoomForm-tableHeader">
                                <tr>
                                    <th className="PatientAddRoomForm-tableHeaderCell">F.I.Sh</th>
                                    <th className="PatientAddRoomForm-tableHeaderCell">ID Raqam</th>
                                    <th className="PatientAddRoomForm-tableHeaderCell">Telefon</th>
                                    <th className="PatientAddRoomForm-tableHeaderCell">Manzil</th>
                                    <th className="PatientAddRoomForm-tableHeaderCell">Tanlov</th>
                                </tr>
                            </thead>
                            <tbody className="PatientAddRoomForm-tableBody">
                                {filteredPatients.map((patient) => (
                                    <tr
                                        key={patient._id}
                                        className={`PatientAddRoomForm-tableRow ${selectedPatient?._id === patient._id ? 'PatientAddRoomForm-tableRowSelected' : ''}`}
                                    >
                                        <td className="PatientAddRoomForm-tableCell">
                                            <div className="PatientAddRoomForm-cellContent">
                                                <User className="PatientAddRoomForm-icon" />
                                                <span className="PatientAddRoomForm-cellText">
                                                    {patient.firstname} {patient.lastname}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="PatientAddRoomForm-tableCell">
                                            {isEditingId === patient._id ? (
                                                <div className="PatientAddRoomForm-editIdContainer">
                                                    <Input
                                                        value={editIdNumber}
                                                        onChange={(e) => setEditIdNumber(e.target.value)}
                                                        placeholder="ID Raqamni kiriting"
                                                        className="PatientAddRoomForm-idInput"
                                                    />
                                                    <button
                                                        onClick={() => handleSaveIdNumber(patient._id)}
                                                        className="PatientAddRoomForm-saveIdButton"
                                                    >
                                                        <Check className="PatientAddRoomForm-iconSmall" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="PatientAddRoomForm-cellContent">
                                                    <span>{patient.idNumber || "ID Raqam kiritilmagan"}</span>
                                                    {!patient.idNumber && (
                                                        <button
                                                            onClick={() => handleEditIdNumber(patient)}
                                                            className="PatientAddRoomForm-editIdButton"
                                                            aria-label="Edit ID Number"
                                                        >
                                                            <Edit2 className="PatientAddRoomForm-iconSmall" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="PatientAddRoomForm-tableCell">
                                            <div className="PatientAddRoomForm-cellContent">
                                                <Phone className="PatientAddRoomForm-iconSmall" />
                                                {patient.phone}
                                            </div>
                                        </td>
                                        <td className="PatientAddRoomForm-tableCell">
                                            <div className="PatientAddRoomForm-cellContent">
                                                <MapPin className="PatientAddRoomForm-iconSmall" />
                                                {patient.address}
                                            </div>
                                        </td>
                                        <td className="PatientAddRoomForm-tableCell">
                                            <div className="patientAddRoomForm-actions">
                                                <button
                                                    onClick={() => handlePatientSelect(patient)}
                                                    className={`PatientAddRoomForm-selectButton ${selectedPatient?._id === patient._id ? 'PatientAddRoomForm-selectButtonActive' : ''}`}
                                                    aria-label={`Select patient ${patient.firstname} ${patient.lastname}`}
                                                >
                                                    <Home className="PatientAddRoomForm-iconSmall" />
                                                    {selectedPatient?._id === patient._id && (
                                                        <Check className="PatientAddRoomForm-iconSmall PatientAddRoomForm-checkIcon" />
                                                    )}
                                                </button>
                                                {selectedPatient?._id === patient._id && (
                                                    <Modal
                                                        title="Bemor ma'lumotlari"
                                                        visible={isModalVisible}
                                                        onOk={() => handleSubmit(patient, days)}
                                                        onCancel={handleCancel}
                                                        okButtonProps={{
                                                            disabled: !days || isLoading || !patient.idNumber || !selectedDoctor,
                                                            className: "PatientAddRoomForm-submitButton"
                                                        }}
                                                        cancelButtonProps={{
                                                            className: "PatientAddRoomForm-cancelButton"
                                                        }}
                                                        okText="Joylashtirish"
                                                        cancelText="Bekor qilish"
                                                    >
                                                        <div className="PatientAddRoomForm-modalContent">
                                                            <div className="PatientAddRoomForm-modalField">
                                                                <label>Kunlar soni</label>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={days}
                                                                    onChange={(e) => setDays(e.target.value)}
                                                                    placeholder="Kunlar soni"
                                                                    className="PatientAddRoomForm-numberInput"
                                                                />
                                                            </div>
                                                            <div className="PatientAddRoomForm-modalField">
                                                                <label>Shifokor</label>
                                                                <Select
                                                                    placeholder="Shifokor tanlang"
                                                                    value={selectedDoctor}
                                                                    onChange={setSelectedDoctor}
                                                                    className="PatientAddRoomForm-doctorSelect"
                                                                    style={{ width: "100%" }}
                                                                    showSearch
                                                                    filterOption={handleDoctorSearch}
                                                                >
                                                                    {filteredDoctors.map(doctor => (
                                                                        <Option key={doctor._id} value={doctor._id}>
                                                                            {`${doctor.firstName} ${doctor.lastName} (${doctor.specialization})`}
                                                                        </Option>
                                                                    ))}
                                                                </Select>
                                                            </div>
                                                        </div>
                                                    </Modal>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!isFetchingPatients && filteredPatients.length === 0 && (
                    <div className="PatientAddRoomForm-emptyState">
                        Hech qanday bemor topilmadi
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientAddRoomForm;
