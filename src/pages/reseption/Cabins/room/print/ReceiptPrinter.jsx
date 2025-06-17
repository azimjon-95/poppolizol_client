// components/ReceiptPrint.js
import React, { forwardRef } from 'react';
import moment from 'moment';
import { useGetClinicsQuery } from '../../../../../context/clinicApi'
import './ReceiptPrinter.css';

const ReceiptPrint = forwardRef(({ data, room }, ref) => {

  const patient = data.currentPatient || {};
  const doctor = patient.doctorId || {};

  const doctorName = `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'N/A';
  const daysTreated = patient.paidDays?.length || 0;
  const isTreatmentOngoing = patient.active ? 'Ha' : 'Yo\'q';

  const { data: clinics } = useGetClinicsQuery();
  const clinicData = clinics?.innerData || [];

  const totalPaid = patient.paidDays?.reduce((sum, day) => sum + (day.isPaid ? (day.price || 0) : 0), 0) || 0;

  const remainingDebt = patient.paidDays?.reduce((sum, day) => {
    if (!day.isPaid) {
      return sum + (patient.payForRoom - (day.price || 0));
    }
    return sum;
  }, 0) || 0;

  const formatNumber = (num) => Number(num).toLocaleString('uz-UZ');

  return (
    <div ref={ref} className="receipt-container">
      <div className="receipt-header">
        <h3>TO'LOV KVITANSIYASI</h3>
        <p>{clinicData?.clinicName}</p>
      </div>

      <div className="receipt-info">
        <p><strong>Bemor:</strong> {patient.clientFullname}</p>
        <p><strong>Xona:</strong> {room.roomNumber}</p>
        <p><strong>Sana:</strong> {moment().format('DD.MM.YYYY HH:mm')}</p>
      </div>

      <div className="receipt-payment">
        <h4>To'lov Ma'lumotlari:</h4>
        <ul>
          <li><span>To'lov turi:</span><span>
            {data.paymentType === 'naqt' ? 'Naqd pul' :
              data.paymentType === 'karta' ? 'Plastik karta' :
                'Bank o\'tkazmasi'}
          </span></li>
          <li><span>Nazoratdagi doktor:</span><span>{doctorName}</span></li>
          <li><span>Davolanish kunlari:</span><span>{daysTreated} kun</span></li>
          <li><span>Davom etayotgan davolanish:</span><span>{isTreatmentOngoing}</span></li>
          <li><span>Jami to'langan summa:</span><span>{formatNumber(totalPaid)} so'm</span></li>
          <li><span>Qoldiq qarz:</span><span>{formatNumber(remainingDebt)} so'm</span></li>
          {/* <li><span>Joriy to'lov miqdori:</span><span>{formatNumber(data.amount)} so'm</span></li> */}
        </ul>
      </div>
      <div className="receipt-paymentbox">
        <span>Joriy to'lov miqdori:</span>
        <span>{formatNumber(data.amount)} so'm</span>
      </div>
      <div className="receipt-footer">
        <p>Rahmat! Tezroq sog'ayib keting!</p>
      </div>
    </div>
  );
});

export default ReceiptPrint;
