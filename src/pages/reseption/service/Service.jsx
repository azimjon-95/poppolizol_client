
import React, { useState, useEffect, useRef, memo } from "react";
import {
    FaStethoscope,
    FaUserMd,
    FaIdBadge,
    FaNotesMedical,
    FaCoins,
    FaPlus,
    FaMinus,
    FaSave,
    FaTimes,
    FaListAlt,
    FaEdit,
    FaTrash,
    FaChevronDown,
    FaChevronUp,
    FaHospital,
    FaHeartbeat,
    FaCapsules,
} from "react-icons/fa";
import {
    MdMedicalServices,
    MdLocalHospital,
    MdHealthAndSafety,
} from "react-icons/md";
import { RiMedicineBottleFill, RiStethoscopeFill } from "react-icons/ri";
import { Select } from "antd";
import {
    useGetServicesQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
    useAddServiceItemMutation,
    useDeleteServiceItemMutation,
} from "../../../context/servicesApi";
import { useGetWorkersQuery, useUpdateServicesIdMutation } from "../../../context/doctorApi";
import { specializationOptions } from "../../../utils/specializationOptions";
import { capitalizeFirstLetter } from "../../../hook/CapitalizeFirstLitter";
import { toast, ToastContainer } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import toastify CSS
import "./Service.css";

// Memoized Service Item component
const ServiceItem = memo(
    ({ index, service, handleServiceChange, removeServiceField, showRemove }) => (
        <div className="service-item">
            <div className="service-item-title">
                <FaNotesMedical style={{ color: "#3b82f6" }} />
                Xizmat #{index + 1}
            </div>
            <div className={`service-item-grid ${showRemove ? "with-remove" : ""}`}>
                <div>
                    <label className="service-label">
                        <MdHealthAndSafety style={{ color: "#10b981" }} />
                        Xizmat Nomi
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                        className="service-input"
                        placeholder="Masalan: EKG, USI, Qon tahlili"
                    />
                </div>
                <div>
                    <label className="service-label">
                        <FaCoins style={{ color: "#f59e0b" }} />
                        Narxi (so'm)
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={service.price}
                        onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                        className="service-input"
                        placeholder="50000"
                        min="0"
                    />
                </div>
                {showRemove && (
                    <button
                        type="button"
                        onClick={() => removeServiceField(index)}
                        className="remove-button"
                        title="Xizmatni o'chirish"
                    >
                        <FaMinus />
                    </button>
                )}
            </div>
        </div>
    )
);

// New Memoized Add Service Item Form component
const AddServiceItemForm = memo(
    ({ serviceId, addServiceItem, isAddingItem }) => {
        const [newItem, setNewItem] = useState({ name: "", price: "" });

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setNewItem((prev) => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!newItem.name || !newItem.price) {
                toast.warning("Iltimos, xizmat nomi va narxini kiriting!", {
                    position: "top-right",
                    autoClose: 2000,
                });
                return;
            }

            try {
                await addServiceItem({
                    serviceId,
                    serviceItem: {
                        name: newItem.name,
                        price: parseInt(newItem.price),
                    },
                }).unwrap();
                setNewItem({ name: "", price: "" });
                toast.success("Xizmat muvaffaqiyatli qo'shildi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            } catch (error) {
                console.error("Error adding service item:", error);
                toast.error("Xizmat qo'shishda xatolik yuz berdi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            }
        };

        return (
            <form onSubmit={handleSubmit} className="add-service-item-form">
                <div className="service-item-grid">
                    <div>
                        <label className="service-label">
                            <MdHealthAndSafety style={{ color: "#10b981" }} />
                            Xizmat Nomi
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={newItem.name}
                            onChange={handleInputChange}
                            className="service-input"
                            placeholder="Masalan: EKG, USI"
                        />
                    </div>
                    <div>
                        <label className="service-label">
                            <FaCoins style={{ color: "#f59e0b" }} />
                            Narxi (so'm)
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={newItem.price}
                            onChange={handleInputChange}
                            className="service-input"
                            placeholder="50000"
                            min="0"
                        />
                    </div>
                    <button
                        type="submit"
                        className="add-service-item-button"
                        disabled={isAddingItem}
                        title="Xizmat qo'shish"
                    >
                        <FaPlus />
                        Qo'shish
                    </button>
                </div>
            </form>
        );
    }
);

function Service() {
    const [formData, setFormData] = useState({
        profession: "",
        doctorId: "",
        services: [{ name: "", price: "" }],
    });
    const [editingService, setEditingService] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const scrollContainerRef = useRef(null);
    const [updateServicesId, { isLoading: isUpdatingWorker }] = useUpdateServicesIdMutation();

    // RTK Query hooks
    const { data: services = { innerData: [] }, isLoading, error } =
        useGetServicesQuery();
    const [createService, { isLoading: isCreating }] = useCreateServiceMutation();
    const [updateService, { isLoading: isUpdating }] = useUpdateServiceMutation();
    const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();
    const [addServiceItem, { isLoading: isAddingItem }] =
        useAddServiceItemMutation();
    const [deleteServiceItem, { isLoading: isDeletingItem }] =
        useDeleteServiceItemMutation();
    const { data: workers = { innerData: [] } } = useGetWorkersQuery();

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop =
                scrollContainerRef.current.scrollHeight;
        }
    }, [services]);

    const handleChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleServiceChange = (index, name, value) => {
        setFormData((prev) => {
            const newServices = [...prev.services];
            newServices[index][name] = value;
            return { ...prev, services: newServices };
        });
    };

    const addServiceField = () => {
        setFormData((prev) => ({
            ...prev,
            services: [...prev.services, { name: "", price: "" }],
        }));
    };

    const removeServiceField = (index) => {
        setFormData((prev) => ({
            ...prev,
            services: prev.services.filter((_, i) => i !== index),
        }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.profession || !formData.doctorId) {
            toast.warning("Iltimos, mutaxassislik va shifokorni tanlang!", {
                position: "top-right",
                autoClose: 2000,
            });
            return;
        }

        if (
            formData.services.every((s) => !s.name || !s.price) ||
            formData.services.length === 0
        ) {
            toast.warning("Iltimos, kamida bitta xizmat nomi va narxini kiriting!", {
                position: "top-right",
                autoClose: 2000,
            });
            return;
        }

        const serviceData = {
            profession: formData.profession,
            doctorId: formData.doctorId,
            services: formData.services
                .filter((s) => s.name && s.price)
                .map((s, idx) => ({
                    _id: editingService
                        ? s._id || `new_${Date.now()}_${idx}`
                        : `new_${Date.now()}_${idx}`,
                    name: s.name,
                    price: parseInt(s.price),
                })),
        };

        try {
            let serviceId;
            if (editingService) {
                // Update existing service
                await updateService({
                    id: editingService._id,
                    ...serviceData,
                }).unwrap();
                serviceId = editingService._id;
                toast.success("Xizmat muvaffaqiyatli yangilandi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            } else {
                // Create new service
                await createService(serviceData).unwrap();
                serviceId = editingService._id;
                toast.success("Yangi xizmat muvaffaqiyatli qo'shildi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            }

            // Update worker with the serviceId
            const worker = workers.innerData.find((w) => w._id === formData.doctorId);
            if (worker) {


                await updateServicesId({
                    adminId: worker._id,
                    servicesId: serviceId,
                }).unwrap();
            } else {
                throw new Error("Worker not found");
            }

            // Reset form
            setFormData({
                profession: "",
                doctorId: "",
                services: [{ name: "", price: "" }],
            });
            setEditingService(null);
        } catch (error) {
            console.error("Error submitting service:", error);
            toast.error("Xizmatni saqlashda xatolik yuz berdi!", {
                position: "top-right",
                autoClose: 2000,
            });
        }
    };

    const handleEdit = async (service) => {
        setEditingService(service);
        setFormData({
            profession: service.profession,
            doctorId: service.doctorId,
            services: service.services.length
                ? service.services.map((s) => ({
                    name: s.name,
                    price: s.price.toString(),
                }))
                : [{ name: "", price: "" }],
        });
        // 4454
        const upDate = {
            ...worker,
            serviceId: ''
        }
        await updateWorker({ id: service?.doctorId._id, worker: upDate })
        toast.info("Xizmat tahrirlash uchun tanlandi!", {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const handleDelete = async (serviceId) => {
        if (window.confirm("Ushbu xizmatni o'chirishni xohlaysizmi?")) {
            try {
                await deleteService(serviceId).unwrap();
                toast.success("Xizmat muvaffaqiyatli o'chirildi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            } catch (error) {
                console.error("Error deleting service:", error);
                toast.error("Xizmatni o'chirishda xatolik yuz berdi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            }
        }
    };

    const handleDeleteServiceItem = async (serviceId, itemName) => {
        if (window.confirm("Ushbu xizmat elementini o'chirishni xohlaysizmi?")) {
            try {
                await deleteServiceItem({ serviceId, itemName }).unwrap();
                toast.success("Xizmat elementi muvaffaqiyatli o'chirildi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            } catch (error) {
                console.error("Error deleting service item:", error);
                toast.error("Xizmat elementini o'chirishda xatolik yuz berdi!", {
                    position: "top-right",
                    autoClose: 2000,
                });
            }
        }
    };

    const toggleRow = (id) => {
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const flattenedSpecializations = specializationOptions.flatMap((group) =>
        group.options.map((option) => ({
            label: option.label,
            value: option.value,
        }))
    );

    return (
        <div className="service-container">
            {/* Add ToastContainer to display notifications */}
            <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} />

            <div className="form-container">
                <div className="form-header">
                    <h2 className="form-title">
                        <MdMedicalServices style={{ color: "#3b82f6" }} />
                        {editingService ? "Xizmatni Tahrirlash" : "Yangi Xizmat Qo'shish"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="form">
                    <div className="input-grid">
                        <div>
                            <label className="label">
                                <FaUserMd style={{ color: "#3b82f6" }} />
                                Mutaxassislik
                            </label>
                            <Select
                                showSearch
                                placeholder="Mutaxassislik tanlang"
                                optionFilterProp="label"
                                onChange={(value) => handleChange("profession", value)}
                                value={formData.profession || undefined}
                                style={{ width: "100%", height: "40px" }}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                                options={flattenedSpecializations}
                                required
                            />
                        </div>
                        <div>
                            <label className="label">
                                <FaIdBadge style={{ color: "#3b82f6" }} />
                                Shifokor
                            </label>
                            <Select
                                showSearch
                                placeholder="Shifokor tanlang"
                                optionFilterProp="label"
                                onChange={(value) => handleChange("doctorId", value)}
                                value={formData.doctorId || undefined}
                                style={{ width: "100%", height: "40px" }}
                                filterOption={(input, option) =>
                                    option.label.toLowerCase().includes(input.toLowerCase())
                                }
                                options={workers.innerData
                                    .filter((i) => i.role === "doctor")
                                    .map((worker) => ({
                                        label: `${worker.firstName} ${worker.lastName}: ${capitalizeFirstLetter(worker.specialization)}`,
                                        value: worker._id,
                                    }))}
                            />
                        </div>
                    </div>

                    <div ref={scrollContainerRef} className="services-section">
                        <h3 className="services-title">
                            <RiStethoscopeFill style={{ color: "#3b82f6" }} />
                            Tibbiy Xizmatlar
                        </h3>
                        {formData.services.map((service, index) => (
                            <ServiceItem
                                key={index}
                                index={index}
                                service={service}
                                handleServiceChange={handleServiceChange}
                                removeServiceField={removeServiceField}
                                showRemove={formData.services.length > 1}
                            />
                        ))}
                        <button
                            type="button"
                            onClick={addServiceField}
                            className="add-service-button"
                        >
                            <FaPlus />
                            Xizmat Qo'shish
                        </button>
                    </div>

                    <div className="form-buttons">
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isCreating || isUpdating}
                        >
                            <FaSave />
                            {editingService ? "Yangilash" : "Saqlash"}
                        </button>
                        {editingService && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingService(null);
                                    setFormData({
                                        profession: "",
                                        doctorId: "",
                                        services: [{ name: "", price: "" }],
                                    });
                                    toast.info("Tahrirlash bekor qilindi!", {
                                        position: "top-right",
                                        autoClose: 2000,
                                    });
                                }}
                                className="cancel-button"
                            >
                                <FaTimes />
                                Bekor Qilish
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h2 className="table-title">
                        <FaListAlt style={{ color: "#3b82f6" }} />
                        Tibbiy Xizmatlar Ro'yxati
                    </h2>
                </div>

                <div className="scrollable-table">
                    {isLoading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div>
                            {toast.error("Ma'lumotlarni yuklashda xatolik yuz berdi!", {
                                position: "top-right",
                                autoClose: 2000,
                            })}
                            Error: {error.message}
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>
                                        <div>
                                            <FaUserMd style={{ color: "#3b82f6" }} />
                                            Mutaxassislik
                                        </div>
                                    </th>
                                    <th>
                                        <div>
                                            <FaIdBadge style={{ color: "#3b82f6" }} />
                                            Shifokor
                                        </div>
                                    </th>
                                    <th>
                                        <div>
                                            <MdMedicalServices style={{ color: "#3b82f6" }} />
                                            Xizmatlar
                                        </div>
                                    </th>
                                    <th>
                                        <div>
                                            <FaCapsules style={{ color: "#3b82f6" }} />
                                            Amallar
                                        </div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(services?.innerData) &&
                                    services?.innerData?.length > 0 ? (
                                    services?.innerData?.map((service, serviceIndex) => (
                                        <React.Fragment key={service._id}>
                                            <tr
                                                className={
                                                    serviceIndex % 2 === 0 ? "even-row" : "odd-row"
                                                }
                                            >
                                                <td>
                                                    <div className="table-cell-content">
                                                        <FaHospital style={{ color: "#10b981" }} />
                                                        {capitalizeFirstLetter(service.profession)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="table-cell-content">
                                                        <FaUserMd style={{ color: "#10b981" }} />
                                                        {service?.doctorId?.firstName}{" "}
                                                        {service?.doctorId?.lastName}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => toggleRow(service._id)}
                                                        className="toggle-button"
                                                    >
                                                        {expandedRows[service._id] ? (
                                                            <FaChevronUp style={{ color: "#3b82f6" }} />
                                                        ) : (
                                                            <FaChevronDown style={{ color: "#3b82f6" }} />
                                                        )}
                                                        Xizmatlar ({service.services.length})
                                                    </button>
                                                </td>
                                                <td>
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => handleEdit(service)}
                                                            className="edit-button"
                                                            title="Tahrirlash"
                                                            disabled={isDeleting}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(service._id)}
                                                            className="delete-button"
                                                            title="O'chirish"
                                                            disabled={isDeleting}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {expandedRows[service._id] && (
                                                <tr className="expanded-row">
                                                    <td colSpan="4">
                                                        <div className="expanded-table-container">
                                                            <AddServiceItemForm
                                                                serviceId={service._id}
                                                                addServiceItem={addServiceItem}
                                                                isAddingItem={isAddingItem}
                                                            />
                                                            <table className="expanded-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>
                                                                            <div>
                                                                                <RiMedicineBottleFill
                                                                                    style={{ color: "#10b981" }}
                                                                                />
                                                                                Xizmat Nomi
                                                                            </div>
                                                                        </th>
                                                                        <th>
                                                                            <div>
                                                                                <FaCoins style={{ color: "#f59e0b" }} />
                                                                                Narxi
                                                                            </div>
                                                                        </th>
                                                                        <th>
                                                                            <div>
                                                                                <FaCapsules
                                                                                    style={{ color: "#ef4444" }}
                                                                                />
                                                                                Amal
                                                                            </div>
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {Array.isArray(service.services) &&
                                                                        service.services.length > 0 ? (
                                                                        service.services.map((s, itemIndex) => (
                                                                            <tr
                                                                                key={itemIndex}
                                                                                className={
                                                                                    itemIndex % 2 === 0
                                                                                        ? "even-row"
                                                                                        : "odd-row"
                                                                                }
                                                                            >
                                                                                <td>
                                                                                    <div className="expanded-table-cell-content">
                                                                                        <MdHealthAndSafety
                                                                                            style={{ color: "#10b981" }}
                                                                                        />
                                                                                        {s.name}
                                                                                    </div>
                                                                                </td>
                                                                                <td>
                                                                                    <span className="price-tag">
                                                                                        {Number(s.price).toLocaleString()}{" "}
                                                                                        so'm
                                                                                    </span>
                                                                                </td>
                                                                                <td>
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            handleDeleteServiceItem(
                                                                                                service._id,
                                                                                                s.name
                                                                                            )
                                                                                        }
                                                                                        className="delete-service-item-button"
                                                                                        title="Xizmat elementini o'chirish"
                                                                                        disabled={isDeletingItem}
                                                                                    >
                                                                                        <FaTrash />
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td
                                                                                colSpan="3"
                                                                                className="empty-services-message"
                                                                            >
                                                                                <div className="empty-services-content">
                                                                                    <FaStethoscope
                                                                                        size={24}
                                                                                        style={{ color: "#9ca3af" }}
                                                                                    />
                                                                                    <p>Hozircha xizmatlar mavjud emas</p>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="empty-table-message">
                                            <div className="empty-table-content">
                                                <MdLocalHospital
                                                    size={32}
                                                    style={{ color: "#9ca3af" }}
                                                />
                                                <div>
                                                    <p>Hozircha tibbiy xizmatlar ro'yxati bo'sh</p>
                                                    <p>Yuqoridagi forma orqali yangi xizmat qo'shing</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="scroll-indicator">
                    <FaHeartbeat style={{ color: "#3b82f6" }} />
                    <span>Yangi ma'lumotlar qo'shilganda avtomatik pastga scroll bo'ladi</span>
                </div>
            </div>
        </div>
    );
}

export default Service;



