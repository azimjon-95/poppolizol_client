import React, { useEffect, useRef, useMemo, useState, useCallback } from "react";
import { message, Button, Tooltip, Table, Spin } from "antd";
import { FaCheck, FaPlus, FaMinus } from "react-icons/fa";
import moment from "moment";
import { GiEntryDoor } from "react-icons/gi";
import { useNavigate, useParams } from "react-router-dom";
import { useReactToPrint } from 'react-to-print';
import ReceiptPrint from './print/ReceiptPrinter';
import { useGetRoomByIdQuery, useChangeTreatingDaysMutation, usePayForRoomMutation, useRemovePatientFromRoomMutation } from "../../../../context/roomApi";
import "./style.css";

// Constants
const ROOM_CATEGORIES = {
  pollux: "Polyuks",
  luxury: "Lyuks",
  free: "Oddiy",
};

// Helper Functions
const capitalizeFirstLetter = (str) => str ? `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}` : '';
const formatPhone = (phone) => phone ? `+998 ${phone.replace(/\D/g, "").match(/(\d{2})(\d{3})(\d{2})(\d{2})/)?.slice(1).join(" ") || phone}` : 'N/A';
const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
const calculateRoomPayment = (record) => record?.paidDays?.reduce((sum, day) => sum + (day?.price || 0), 0) || 0;

function Room() {
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [showExitModal, setShowExitModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [paymentType, setPaymentType] = useState("naqt");
  const [sendPrint, setSendPrint] = useState({});

  const receiptRef = useRef();

  // New state for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [modalType, setModalType] = useState('payment'); // 'payment' or 'days'

  const navigate = useNavigate();
  const { id } = useParams();
  const [changeTreatingDays, { isLoading: isChanging }] = useChangeTreatingDaysMutation();
  const [removePatientFromRoom, { isLoading: isRemoving }] = useRemovePatientFromRoomMutation();
  const [payForRoom, { isLoading: isPayForRoom }] = usePayForRoomMutation();
  const { data: roomData, refetch, isLoading: isLoadingRoom, error: roomError } = useGetRoomByIdQuery(id);

  const iconStyle = useMemo(() => ({ fontSize: "20px" }), []);
  const getCategoryLabel = useCallback((category) => ROOM_CATEGORIES[category] || category, []);


  const reactToPrintFn = useReactToPrint({
    contentRef: receiptRef,
    pageStyle: `
      @page {
        size: 80mm auto;
        margin: 0;
      }
      @media print {
        body { margin: 0; }
        * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
      }
    `
  });
  // Process room data
  const patients = useMemo(() => roomData?.innerData?.capacity?.map((item) => ({
    _id: item._id,
    clientID: item.patientId?.idNumber || 'N/A',
    clientMongooseId: item.patientId?._id,
    clientFullname: `${item.patientId?.firstname || ''} ${item.patientId?.lastname || ''}`.trim(),
    clientPhone: item.patientId?.phone,
    startDay: item.startDay,
    payForRoom: item.roomId?.pricePerDay || 0,
    paidDays: item.paidDays || [],
    clientPayForRoomPrice: calculateRoomPayment(item),
    roomNumber: item.roomId?.roomNumber,
    doctorId: item.doctorId,
    active: item.active,
    endDay: item.endDay,
  })) || [], [roomData?.innerData?.capacity]);

  const exitRoom = useCallback(async (record) => {
    try {
      if (!id || !record.clientMongooseId) throw new Error("Kerakli ma'lumotlar mavjud emas");
      await removePatientFromRoom({ id, patientId: record._id }).unwrap();
      message.success(`${record.clientFullname} xonadan muvaffaqiyatli chiqarildi!`);

      if (patients.length === 1) {
        message.info("Xonada boshqa bemorlar qolmadi. Orqaga qaytilmoqda...");
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      message.error(error?.data?.message || "Bemorni xonadan chiqarishda xatolik yuz berdi!");
    } finally {
      setShowExitModal(false);
      setSelectedPatient(null);
    }
  }, [id, patients.length, navigate, removePatientFromRoom]);

  const confirmExitRoom = useCallback((record) => {
    setSelectedPatient(record);
    setShowExitModal(true);
  }, []);

  const closeExitModal = useCallback(() => {
    setShowExitModal(false);
    setSelectedPatient(null);
  }, []);

  // Open payment modal
  const openPaymentModal = useCallback((record, type = 'payment') => {
    setCurrentPatient(record);
    setModalType(type);
    setShowPaymentModal(true);
    if (type === 'payment') {
      setPaymentAmount('');
    }
  }, []);

  // Close payment modal
  const closePaymentModal = useCallback(() => {
    setShowPaymentModal(false);
    setCurrentPatient(null);
    setPaymentAmount('');
    setPaymentType("naqt");
  }, []);

  // Handle payment
  const handlePayment = useCallback(async () => {
    if (!paymentAmount || !currentPatient) {
      message.warning("Iltimos, to'lov miqdorini kiriting.");
      return;
    }

    try {
      await payForRoom({
        roomStoryId: currentPatient._id,
        amount: +paymentAmount,
        paymentType,
      }).unwrap();
      setSendPrint({
        roomStoryId: currentPatient._id,
        amount: +paymentAmount,
        paymentType,
        currentPatient
      })
      await refetch()

      message.success("To'lov muvaffaqiyatli amalga oshirildi!");
      // Print qilish uchun biroz kutish (DOM update bo'lishi uchun)
      setTimeout(() => {
        reactToPrintFn();
      }, 200);

      closePaymentModal();
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    }
  }, [paymentAmount, currentPatient, paymentType, payForRoom, closePaymentModal]);

  const handleDayManagement = useCallback(async (action) => {
    if (!currentPatient) return;

    try {
      await changeTreatingDays({
        roomStoryId: action.id,
        days: 1,
        action: action.type // "inc" or "dec"
      }).unwrap();

      // Refetch room data to get the latest state
      await refetch();

      // Update currentPatient with the latest data from patients
      const updatedPatient = patients.find((p) => p._id === currentPatient._id);
      if (updatedPatient) {
        setCurrentPatient(updatedPatient); // Update the currentPatient state
      }

      message.success(`Kun muvaffaqiyatli ${action.type === "inc" ? "qo\'shildi" : "olib tashlandi"}!`);
      if (action.type !== "dec" && action.type !== "inc") {
        closePaymentModal();
      }
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    }
  }, [currentPatient, patients, refetch, closePaymentModal]);


  const calculateDebt = useCallback((record) => {
    if (!record?.paidDays || !record?.payForRoom) return 0;
    return record.paidDays
      .filter((day) => !day.isPaid)
      .reduce((sum, day) => sum + (record.payForRoom - (day.price || 0)), 0);
  }, []);

  const getCardClassName = useCallback((isPaid, price, isToday) => {
    const baseClass = isPaid ? "ant-card-green" : (price || 0) > 0 ? "ant-card-yellow" : "ant-card-red";
    return `${baseClass} extro-colors${isToday ? " border-green" : ""}`;
  }, []);

  const columns = useMemo(() => [
    { title: "Bemor", dataIndex: "clientFullname", render: (text) => capitalizeFirstLetter(text) || 'N/A' },
    { title: "Telefon raqami", dataIndex: "clientPhone", render: formatPhone },
    { title: "Boshlanish sanasi", dataIndex: "startDay", render: (date) => date || 'N/A' },
    { title: "Davolanish kuni", dataIndex: "paidDays", render: (days) => `${days?.length || 0} kun` },
    { title: "To'langan summalar", dataIndex: "clientPayForRoomPrice", render: (price) => `${formatNumber(price || 0)} so'm` },
    {
      title: "Doktor",
      dataIndex: "doctorId",
      render: (doctorId) => doctorId ? `${doctorId.firstName || ''} ${doctorId.lastName || ''}, ${doctorId.specialization || ''}`.trim() : "N/A",
    },
    {
      title: "Xonadan chiqish",
      align: "center",
      width: 140,
      render: (record) => {
        const hasUnpaidDays = record.paidDays?.some((day) => !day.isPaid && (day.price || 0) > 0);
        return (
          <Tooltip title={hasUnpaidDays ? `Qarz: ${formatNumber(calculateDebt(record))} so'm. Avval to'lang!` : "Bemorni xonadan chiqarish"}>
            <Button
              onClick={() => confirmExitRoom(record)}
              className={`btn ${hasUnpaidDays ? 'btn-warning' : 'btn-danger'}`}
              disabled={!record.clientMongooseId || isRemoving}
              danger={!hasUnpaidDays}
              type={hasUnpaidDays ? "default" : "primary"}
              size="small"
              block
            >
              <GiEntryDoor style={iconStyle} />
              {hasUnpaidDays ? " Qarz bor" : " Chiqarish"}
            </Button>
          </Tooltip>
        );
      },
    },
  ], [confirmExitRoom, iconStyle, isRemoving, calculateDebt]);

  const expandedRowRender = useCallback((record) => (
    <div className="my-table-container">
      <div className="my-table-box">
        {(record.paidDays || []).map((item, i) => {
          const isToday = moment(item.date, "DD.MM.YYYY").isSame(moment(), "day");

          return (
            <div key={i} className={getCardClassName(item.isPaid, item.price, isToday)} style={{ position: 'relative' }}>
              <p>{item.date}</p>
              <p>{formatNumber(item.price || 0)} so'm</p>
            </div>

          );
        })}
      </div>
      <div className="extro-inp-box">
        <Button
          type="primary"
          onClick={() => openPaymentModal(record, 'payment')}
          style={{ width: '100%' }}
        >
          To'lov qilish ({formatNumber(calculateDebt(record))} so'm)
        </Button>
      </div>
    </div>
  ), [getCardClassName, calculateDebt, openPaymentModal]);

  const handleExpand = useCallback((expanded, record) => {
    setExpandedRowKeys(expanded ? [record._id] : []);
  }, []);

  useEffect(() => {
    const handleUpdateRoomPayment = () => console.log("Room payment updated via socket");
    const socket = { on: (event, callback) => console.log(`Socket event ${event} registered`) };
    socket.on("updateRoomPayment", handleUpdateRoomPayment);
  }, []);

  const roomInfo = roomData?.innerData || {};
  const roomDetails = useMemo(() => [
    { label: "Xona raqami", value: roomInfo.roomNumber },
    { label: "Qavat", value: roomInfo.floor },
    { label: "Kategoriya", value: getCategoryLabel(roomInfo.category) },
    { label: "Bemorlar soni", value: roomInfo.usersNumber },
    { label: "Sig'imi", value: roomInfo.capacity?.length || 0 },
    { label: "Kunlik narx", value: roomInfo.pricePerDay ? `${formatNumber(roomInfo.pricePerDay)} so'm` : "N/A" },
  ], [roomInfo, getCategoryLabel]);


  if (roomError) return (
    <div className="updateRoom_wrapper">
      <div className="updateRoom_wrapperbox">
        <button onClick={() => navigate(-1)}> Orqaga</button>
        <p>Xatolik yuz berdi: {roomError.message || 'Noma\'lum xatolik'}</p>
      </div>
    </div>
  );

  return (
    <div className="updateRoom_wrapper">
      <div className="updateRoom_wrapperbox">
        <button onClick={() => navigate(-1)}> Orqaga</button>
        {roomDetails.map((item, index) => (
          <div key={index} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", gap: 4 }}>
            <strong>{item.label}:</strong>
            <span>{item.value || "N/A"}</span>
          </div>
        ))}
      </div>
      <Table
        columns={columns}
        dataSource={patients}
        pagination={false}
        size="small"
        bordered
        rowKey="_id"
        loading={isLoadingRoom}
        expandable={{ expandedRowRender, expandedRowKeys, onExpand: handleExpand }}
      />

      {/* Exit Modal */}
      {showExitModal && selectedPatient && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="custom-modal-box">
              <h3>{`${selectedPatient.clientFullname} bemorni xonadan chiqarmoqchimisiz?`}</h3>
              <p>Bu amal bemorni xonadan olib tashlaydi. Davom etishni xohlaysizmi?</p>
              <div className="modal-buttons">
                <button className="modal-button cancel" onClick={closeExitModal}>
                  Yo'q
                </button>
                <button
                  className="modal-button confirm"
                  onClick={() => exitRoom(selectedPatient)}
                  disabled={isRemoving}
                >
                  Ha
                </button>
              </div>
              {isRemoving && (
                <div className="outloading"> <Spin /></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Payment Modal */}
      {showPaymentModal && currentPatient && (
        <div className="medical-modal-overlay">
          <div className="medical-modal">
            {/* Modal Header */}
            <div className="medical-modal-header">
              <div className="modal-tab-buttons">
                <button
                  className={`tab-btn ${modalType === 'payment' ? 'active' : ''}`}
                  onClick={() => setModalType('payment')}
                >
                  <FaCheck className="tab-icon" />
                  To'lov qilish
                </button>
                <button
                  className={`tab-btn ${modalType === 'days' ? 'active' : ''}`}
                  onClick={() => setModalType('days')}
                >
                  <FaPlus className="tab-icon" />
                  Kun boshqaruvi
                </button>
              </div>
              <button className="modal-close-btn" onClick={closePaymentModal}>
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="medical-modal-body">
              {/* Patient Info Card */}
              <div className="patient-info-card">
                <div className="patient-avatar">
                  {currentPatient.clientFullname.charAt(0).toUpperCase()}
                </div>
                <div className="patient-details">
                  <h3>{currentPatient.clientFullname}</h3>
                  <p className="room-info">Xona: {currentPatient.roomNumber}</p>
                  {modalType === 'payment' ? (
                    <p className="debt-amount">
                      Qarz: <span className="debt-value">{formatNumber(calculateDebt(currentPatient))} so'm</span>
                    </p>
                  ) : currentPatient?.paidDays?.length > 0 ? (
                    <div className="debt-card">
                      {currentPatient.paidDays.map((value, inx) => {
                        const getDebtDetailsClass = () => {
                          if (value.price === roomInfo.pricePerDay) {
                            return 'debt-details debt-details-green';
                          } else if (value.price === 0) {
                            return 'debt-details debt-details-red';
                          } else if (value.price > 0) {
                            return 'debt-details debt-details-gold';
                          }
                          return 'debt-details'; // Fallback class
                        };

                        return (
                          <div key={inx} className={getDebtDetailsClass()}>
                            <span className="date-label">
                              {value.date}
                            </span>
                            <span className="price-label">
                              {formatNumber(value.price)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="empty-state">No payment records available.</p>
                  )}
                </div>
              </div>

              {/* Payment Form */}
              {modalType === 'payment' ? (
                <div className="payment-form">
                  <div className="form-group">
                    <label className="form-label">To'lov miqdori</label>
                    <div className="input-wrapper">
                      <input
                        type="text"
                        className="payment-input"
                        placeholder={`${formatNumber(calculateDebt(currentPatient))} so'm`}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                      <span className="input-currency">so'm</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">To'lov turi</label>
                    <div className="payment-type-selector">
                      <label className={`payment-option ${paymentType === 'naqt' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentType"
                          value="naqt"
                          checked={paymentType === 'naqt'}
                          onChange={(e) => setPaymentType(e.target.value)}
                        />
                        <span className="option-text">💵 Naqd pul</span>
                      </label>
                      <label className={`payment-option ${paymentType === 'karta' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="paymentType"
                          value="karta"
                          checked={paymentType === 'karta'}
                          onChange={(e) => setPaymentType(e.target.value)}
                        />
                        <span className="option-text">💳 Plastik karta</span>
                      </label>

                    </div>
                  </div>

                  <button
                    className={`payment-submit-btn ${!paymentAmount || isPayForRoom ? 'disabled' : ''}`}
                    onClick={handlePayment}
                    disabled={!paymentAmount || isPayForRoom}
                  >
                    {isPayForRoom ? (
                      <>
                        <div className="loading-spinner"></div>
                        Jarayon...
                      </>
                    ) : (
                      <>
                        <FaCheck className="btn-icon" />
                        To'lovni amalga oshirish
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="day-management">
                  <div className="day-actions">
                    <button
                      className="day-action-btn add-day"
                      onClick={() => handleDayManagement({
                        type: 'inc',
                        id: currentPatient._id,
                      })}
                    >
                      {/* //"inc" // yoki "dec" */}
                      <FaPlus className="btn-icon" />
                      <span>Kun qo'shish</span>
                      <small>Davolanish muddatini uzaytirish</small>
                    </button>
                    <button
                      className="day-action-btn remove-day"
                      onClick={() => handleDayManagement({
                        type: 'dec',
                        id: currentPatient._id,
                      })}
                    >
                      <FaMinus className="btn-icon" />
                      <span>Kun ayirish</span>
                      <small>Davolanish muddatini qisqartirish</small>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div style={{ display: 'none' }}>
        <ReceiptPrint
          ref={receiptRef}
          data={sendPrint}
          room={roomInfo}
        />
      </div>
    </div>
  );
}

export default Room;