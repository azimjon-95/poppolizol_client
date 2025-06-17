import React, { useState, useRef, useEffect } from "react";
import { MdOutlineBedroomChild } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import { FaUsers } from "react-icons/fa";
import { FiUserPlus, FiEye } from "react-icons/fi";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { TbElevator } from "react-icons/tb";
import { message, Button, Select, Table, Tabs } from "antd";
import { PiLockKeyFill } from "react-icons/pi";
import { Link } from "react-router-dom";
import Door from "../../../assets/door.png";
import { NumberFormat } from "../../../hook/NumberFormat";
import "./style.css";
import {
  useGetRoomsQuery,
  useDeleteRoomMutation,
  useCloseRoomMutation,
  useUpdateRoomCleanStatusMutation
} from "../../../context/roomApi";
import RoomForm from "./RoomForm";
import CustomModal from "./custom/CustomModal";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import { capitalizeFirstLetter } from "../../../hook/CapitalizeFirstLitter";

const { Option } = Select;
const { TabPane } = Tabs;

const Cabins = () => {
  const [optenAddModal, setOptenAddModal] = useState(false);
  const [optenUpdateModal, setOptenUpdateModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [occupancyFilter, setOccupancyFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ visible: false, id: null, roomNumber: null, capacity: [] });
  const modalRef = useRef(null);
  const [activeTab, setActiveTab] = useState("1");
  const kassir = localStorage.getItem("admin") || "admin";

  const { data: rooms, isLoading, error: fetchError } = useGetRoomsQuery();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();
  const [closeRoom, { isLoading: isClosing }] = useCloseRoomMutation();
  const [updateRoomCleanStatus, { isLoading: isUpdating }] = useUpdateRoomCleanStatusMutation();

  const handleRightClick = (e) => {
    e.preventDefault();
    setOptenAddModal(true);
  };

  const handleUpdateClick = (room) => {
    setSelectedRoom(room);
    setOptenUpdateModal(true);
  };

  const handleCleanStatusToggle = async (roomId, currentStatus, index, record) => {
    console.log(currentStatus);
    try {
      // Update server
      await updateRoomCleanStatus({
        id: roomId._id,
        isCleaned: !currentStatus
      }).unwrap();

      toast.success("Xona tozalik holati muvaffaqiyatli yangilandi", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {

      toast.error("Xona tozalik holatini yangilashda xatolik yuz berdi", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && optenAddModal) {
        setOptenAddModal(false);
      }
      if (e.key === "Escape" && optenUpdateModal) {
        setOptenUpdateModal(false);
        setSelectedRoom(null);
      }
      if (e.key === "Escape" && deleteModal.visible) {
        setDeleteModal({ visible: false, id: null, roomNumber: null, capacity: [] });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [optenAddModal, optenUpdateModal, deleteModal.visible]);

  useEffect(() => {
    if ((optenAddModal || optenUpdateModal) && modalRef.current) {
      modalRef.current.focus();
    }
  }, [optenAddModal, optenUpdateModal]);

  useEffect(() => {
    if (fetchError) {
      message.error("Xonalar ro'yxatini olishda xatolik yuz berdi");
    }
  }, [fetchError]);

  const showDeleteConfirm = (id, roomNumber, capacity) => {
    if (capacity.length > 0) {
      message.warning("Xonada bemorlar bor, o'chirib bo'lmaydi!");
      return;
    }
    setDeleteModal({ visible: true, id, roomNumber, capacity });
  };

  const handleDelete = async () => {
    try {
      const response = await deleteRoom(deleteModal.id).unwrap();
      message.success("Xona muvaffaqiyatli o'chirildi");
      setDeleteModal({ visible: false, id: null, roomNumber: null, capacity: [] });
    } catch (error) {
      console.error("Delete error:", error);
      message.error("Xonani o'chirishda xatolik yuz berdi");
    }
  };

  const toggleRoomStatus = async (id, closeRoomStatus) => {
    try {
      await closeRoom(id).unwrap();
      message.success(`Xona ${closeRoomStatus ? "ochildi" : "yopildi"}`);
    } catch (error) {
      message.error("Xatolik yuz berdi");
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case "pollux":
        return "Polyuks";
      case "luxury":
        return "Lyuks";
      case "free":
        return "Oddiy";
      default:
        return category;
    }
  };

  const davolanishRooms = rooms
    ? rooms?.innerData
      ?.filter((room) => room.roomType === "davolanish")
      ?.filter((room) =>
        categoryFilter === "all" ? true : room.category === categoryFilter
      )
      ?.filter((room) =>
        occupancyFilter === "all"
          ? true
          : occupancyFilter === "available"
            ? room.capacity.length < room.usersNumber
            : room.capacity.length === room.usersNumber
      )
      ?.sort((a, b) => a.roomNumber - b.roomNumber)
    : [];

  const otherRooms = rooms
    ? rooms?.innerData
      ?.filter((room) => room.roomType !== "davolanish")
      ?.filter((room) =>
        categoryFilter === "all" ? true : room.category === categoryFilter
      )
      ?.filter((room) =>
        occupancyFilter === "all"
          ? true
          : occupancyFilter === "available"
            ? room.capacity.length < room.usersNumber
            : room.capacity.length === room.usersNumber
      )
      ?.sort((a, b) => a.roomNumber - b.roomNumber)
    : [];


  const columns = [
    {
      title: "Xona nomeri",
      dataIndex: "roomNumber",
      key: "roomNumber",
      render: (text) => (
        <div className="imgRoor">
          <img src={Door} alt="Door" />
          <div className="roomN">
            <b>{text}</b>
          </div>
        </div>
      ),
    },
    {
      title: "Qavati",
      key: "floor",
      render: (_, record) => (
        <div className="room_Box-length">
          <div>Qavat</div>
          <div>
            <TbElevator /> {record?.floor}
          </div>
        </div>
      ),
    },
    {
      title: "Xona sig'imi",
      render: (_, res) => (
        <div className="room_Box-length">
          <div className="room_Box-cont">
            {res?.beds?.map((val, inx) => {
              let bgColor = "";
              switch (val.status) {
                case "bo'sh":
                  bgColor = "green";
                  break;
                case "band":
                  bgColor = "gold";
                  break;
                case "toza emas":
                  bgColor = "red";
                  break;
                case "toza":
                  bgColor = "green";
                  break;
                default:
                  bgColor = "gray";
              }
              return (
                <div
                  key={inx}
                  style={{
                    backgroundColor: bgColor,
                    color: "#fff",
                    borderRadius: "50%",
                    fontSize: "12px",
                    width: "14px",
                    height: "14px",
                    textAlign: "center",
                    marginTop: "4px",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "7px", flexWrap: "wrap" }}>
            <MdOutlineBedroomChild /> {res?.usersNumber}
          </div>
        </div>
      ),
    },
    {
      title: "Bemorlar soni",
      dataIndex: "capacity",
      key: "capacity",
      render: (_, record) => (
        <div className="room_Box-length">
          <div>Bemorlar soni</div>
          {record.capacity.length === record.usersNumber ? (
            <p className="busyRoom">Xonada joy yo'q</p>
          ) : record.capacity.length === 0 ? (
            <div className="emptyRoom">Bo'sh xona</div>
          ) : (
            <div>
              <FaUsers /> {record.capacity.length}
            </div>
          )}
        </div>
      ),
    },
    {
      title: `1 kunlik to'lov`,
      key: "pricePerDay",
      render: (data) => (
        <div className="room_Box-length">
          <div>
            1 kunlik to'lov | <b>{getCategoryLabel(data?.category)}</b>
          </div>
          <div>
            <GiMoneyStack /> {NumberFormat(data?.pricePerDay)} so'm
          </div>
        </div>
      ),
    },
    {
      title: "Nazoratida",
      key: "floor",
      render: (_, record) => (
        <div className="room_Box-length">
          {record.nurse ? (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Hamshira:</strong> {record.nurse.firstName} {record.nurse.lastName}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Hamshira:</strong> Tanlanmagan
            </div>
          )}
          {record.cleaner ? (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Farosh:</strong> {record.cleaner.firstName} {record.cleaner.lastName}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Farosh:</strong> Tanlanmagan
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Xonaga kirish",
      key: "enterButton",
      render: (_, record) => (
        <Button
          type="primary"
          disabled={record.capacity.length === 0}
          style={{
            display: "flex",
            padding: 0,
            justifyContent: "center",
            alignItems: "center",
            fontSize: 18,
            width: 45,
          }}
        >
          <Link
            style={{ color: "#fff", marginTop: 5 }}
            to={`/room/${record._id}`}
          >
            <FiEye />
          </Link>
        </Button>
      ),
    },
    {
      title: "Bemor qo'shish",
      key: "openUpdate",
      render: (record) => {
        const isFull = record.capacity.length === record.usersNumber;
        const isLocked = record.closeRoom;
        const isDisabled = kassir === "buhgalter";

        if (isLocked) {
          return (
            <Button
              disabled={isDisabled}
              type="primary"
              danger
              style={{ padding: 0, fontSize: 18, width: 45 }}
              onClick={() => toggleRoomStatus(record._id, record.closeRoom)}
            >
              <PiLockKeyFill />
            </Button>
          );
        }

        if (isFull) {
          return (
            <Button
              disabled
              type="primary"
              style={{ padding: 0, fontSize: 18, width: 45 }}
            >
              <FiUserPlus style={{ fontSize: "22px" }} />
            </Button>
          );
        }

        return (
          <Link
            to={isDisabled ? "" : `/addpatient/${record._id}`}
            style={{ padding: 0, fontSize: 18, width: 45 }}
          >
            <Button disabled={isDisabled} type="primary">
              <FiUserPlus />
            </Button>
          </Link>
        );
      },
    },
    {
      title: "Ammalar", // New Update Column
      key: "update",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "5px" }}>
          <Button
            type="primary"
            style={{
              display: "flex",
              padding: 0,
              justifyContent: "center",
              alignItems: "center",
              fontSize: 18,
              width: 45,
              backgroundColor: "#1890ff",
            }}
            onClick={() => handleUpdateClick(record)}
            disabled={kassir === "buhgalter"}
          >
            <EditOutlined />
          </Button>

          <Button
            type="primary"
            danger
            style={{
              display: "flex",
              padding: 0,
              justifyContent: "center",
              alignItems: "center",
              fontSize: 18,
              width: 45,
            }}
            onClick={() => showDeleteConfirm(record._id, record.roomNumber, record.capacity)}
            disabled={kassir === "buhgalter"}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const column = [
    {
      title: "Nomi",
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <div>
          {
            record?.doctorId ?
              <strong>{capitalizeFirstLetter(record.doctorId.specialization)}: {record.doctorId.firstName} {record.doctorId.lastName}</strong>
              :
              record?.name
          }
        </div>
      )
    },
    {
      title: "Xona nomeri",
      dataIndex: "roomNumber",
      key: "roomNumber",
    },
    {
      title: "Xolati",
      dataIndex: "isCleaned",
      key: "isCleaned",
      render: (isCleaned, record, index) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              color: isCleaned ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {isCleaned ? "Toza" : "Tozalanmagan"}
          </span>
          <button
            style={{
              padding: "4px 8px",
              backgroundColor: isCleaned ? "red" : "green",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isUpdating ? "not-allowed" : "pointer",
              opacity: isUpdating ? 0.6 : 1,
            }}
            onClick={() => handleCleanStatusToggle(record, isCleaned, index, record)}
            disabled={isUpdating}
          >
            {isCleaned ? "Toza emas" : "Toza"}
          </button>
        </div>
      ),
    },
    {
      title: "Qavati",
      key: "floor",
      dataIndex: "floor",
    },
    {
      title: "Nazoratida",
      key: "floor",
      render: (_, record) => (
        <div className="room_Box-length">
          {record.nurse ? (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Hamshira:</strong> {record.nurse.firstName} {record.nurse.lastName}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Hamshira:</strong> Tanlanmagan
            </div>
          )}
          {record.cleaner ? (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Farosh:</strong> {record.cleaner.firstName} {record.cleaner.lastName}
            </div>
          ) : (
            <div style={{ display: "flex", gap: "5px" }}>
              <strong>Farosh:</strong> Tanlanmagan
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Ammalar", // New Update Column
      key: "update",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "5px" }}>
          <Button
            type="primary"
            style={{
              display: "flex",
              padding: 0,
              justifyContent: "center",
              alignItems: "center",
              fontSize: 18,
              width: 45,
              backgroundColor: "#1890ff",
            }}
            onClick={() => handleUpdateClick(record)}
            disabled={kassir === "buhgalter"}
          >
            <EditOutlined />
          </Button>

          <Button
            type="primary"
            danger
            style={{
              display: "flex",
              padding: 0,
              justifyContent: "center",
              alignItems: "center",
              fontSize: 18,
              width: 45,
            }}
            onClick={() => showDeleteConfirm(record._id, record.roomNumber, record.capacity)}
            disabled={kassir === "buhgalter"}
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarExtraContent={
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              gap: "16px",
            }}
          >
            {activeTab === "1" && (
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={(value) => setCategoryFilter(value)}
              >
                <Option value="all">Barcha kategoriyalar</Option>
                <Option value="free">Oddiy</Option>
                <Option value="luxury">Lyuks</Option>
                <Option value="pollux">Pol lyuks</Option>
              </Select>
            )}
            {activeTab === "1" && (
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={(value) => setOccupancyFilter(value)}
              >
                <Option value="all">Barcha xonalar</Option>
                <Option value="available">Joy borlar</Option>
                <Option value="full">Joy qolmagan</Option>
              </Select>
            )}
            <Button type="primary" onClick={handleRightClick}>
              Xona Qo'shish
            </Button>
          </div>
        }
        defaultActiveKey="1"
      >
        <TabPane tab="Davolanish Bo'limi" key="1">
          <Table
            rowKey="_id"
            pagination={false}
            loading={isLoading || isDeleting || isClosing || isUpdating}
            bordered
            size="small"
            columns={columns}
            dataSource={davolanishRooms}
          />
        </TabPane>
        <TabPane tab="Xonalar va Tozalanish Kerak Bo'lgan Zonalar" key="2">
          <Table
            rowKey="_id"
            pagination={false}
            loading={isLoading || isDeleting || isClosing || isUpdating}
            bordered
            size="small"
            columns={column}
            dataSource={otherRooms}
          />
        </TabPane>
      </Tabs>
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`modalroom ${optenAddModal ? "modalroom-open" : "modalroom-closed"}`}
      >
        <div
          className="modalroom-overlay"
          onClick={() => setOptenAddModal(false)}
        />
        <RoomForm
          visible={optenAddModal}
          onClose={() => setOptenAddModal(false)}
          mode="create"
        />
      </div>
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`modalroom ${optenUpdateModal ? "modalroom-open" : "modalroom-closed"}`}
      >
        <div
          className="modalroom-overlay"
          onClick={() => {
            setOptenUpdateModal(false);
            setSelectedRoom(null);
          }}
        />
        <RoomForm
          visible={optenUpdateModal}
          onClose={() => {
            setOptenUpdateModal(false);
            setSelectedRoom(null);
          }}
          mode="update"
          roomData={selectedRoom}
        />
      </div>
      <CustomModal
        visible={deleteModal.visible}
        title={`Xona #${deleteModal.roomNumber} ni o'chirib tashlaysizmi?`}
        content="Bu amalni qaytarib bo'lmaydi!"
        onOk={handleDelete}
        onCancel={() => setDeleteModal({ visible: false, id: null, roomNumber: null, capacity: [] })}
        okText="Ha"
        cancelText="Yo'q"
        okLoading={isDeleting}
      />
    </div>
  );
};

export default Cabins;









