import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Package, TrendingUp, ShoppingCart } from 'lucide-react';
import { useGetFilteredMaterialsQuery } from '../../../context/materialApi';
import { useCreateBn5ProductionMutation } from '../../../context/productionApi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import Bn5ProcessDialog from './Bn5ProcessDialog';

const BitumProductionSystem = () => {
  const [showBn3Dialog, setShowBn3Dialog] = useState(false);
  const [showBn5ProcessDialog, setShowBn5ProcessDialog] = useState(false);
  const [calculatedBn5, setCalculatedBn5] = useState(0);
  const [actualBn5Result, setActualBn5Result] = useState('');
  const [createBn5Production] = useCreateBn5ProductionMutation();

  const [currentBn3Production, setCurrentBn3Production] = useState({
    id: null,
    date: new Date().toISOString().split('T')[0],
    bn3Amount: '15000',
    wasteAmount: '500',
    gasAmount: '800',
    temperature: '250',
    electricEnergy: '14.5',
    boilingHours: '19',
    notes: '',
    electricity: '500',
    price: '',
    extra: '713545',
  });

  const [currentBn5Process, setCurrentBn5Process] = useState({
    id: null,
    date: new Date().toISOString().split('T')[0],
    bn5Amount: '5000',
    melAmount: '1800',
    units: '',
    bitumPerUnit: '',
    notes: '',
  });

  const [inventory, setInventory] = useState({
    bn3Stock: 50000,
    bn5Stock: 0,
    melStock: 10000,
    gasStock: 20000,
    exportBagStock: 1000,
    kraftPaperStock: 5000,
    ropeStock: 2000,
    smallCupStock: 0,
    largeCupStock: 0,
    readyProductStorage: { bags: 0, smallCups: 0, largeCups: 0 },
  });

  const { data: material, refetch } = useGetFilteredMaterialsQuery();


  const electricityPrice = 1000;
  const gasPrice = 1800;
  const recipe = {
    bn5Percentage: 75,
    melPercentage: 25,
  };
  const workers = [{ fullName: 'Akmal Qurbonov', salary: 750000 }];

  const materialObj = useMemo(
    () =>
      material?.reduce((acc, item) => {
        acc[item.category.replace(/-/g, '').toLowerCase()] = item;
        return acc;
      }, {}) || {},
    [material]
  );

  const totalWorkersSalary = useMemo(
    () => workers.reduce((sum, worker) => sum + worker.salary, 0),
    []
  );

  useEffect(() => {
    const { bn3Amount, wasteAmount, gasAmount, electricity, extra } = currentBn3Production;
    const bn3 = parseFloat(bn3Amount) || 0;
    const waste = parseFloat(wasteAmount) || 0;
    const gas = parseFloat(gasAmount) || 0;
    const electricityUsed = parseFloat(electricity) || 0;
    const extraCost = parseFloat(extra) || 0;
    const bn3Price = materialObj?.bn3?.price || 0;

    const totalBn3Cost = bn3 * bn3Price;
    const totalGasCost = gas * gasPrice;
    const totalElectricityCost = electricityUsed * electricityPrice;
    const mainCosts = totalBn3Cost + totalGasCost + totalElectricityCost + totalWorkersSalary;
    const totalCost = mainCosts + extraCost;
    const finalBn5 = bn3 - waste;
    const unitCostBn5 = finalBn5 > 0 ? Math.ceil(totalCost / finalBn5).toString() : '0';

    setCurrentBn3Production((prev) => ({
      ...prev,
      price: unitCostBn5,
    }));
  }, [
    currentBn3Production.bn3Amount,
    currentBn3Production.wasteAmount,
    currentBn3Production.gasAmount,
    currentBn3Production.electricity,
    currentBn3Production.extra,
    materialObj.bn3?.price,
  ]);

  const validateBn3Production = () => {
    const { bn3Amount, gasAmount, boilingHours } = currentBn3Production;
    const bn3 = parseFloat(bn3Amount) || 0;
    const gas = parseFloat(gasAmount) || 0;
    const hours = parseFloat(boilingHours) || 0;

    if (!gas || hours !== 19) {
      toast.error('Gaz miqdorini kiriting va 19 soat qaynaganligini tasdiqlang!');
      return false;
    }
    if (inventory.bn3Stock < bn3) {
      toast.error("Omborida yetarli BN-3 yo'q!");
      return false;
    }
    return true;
  };

  const handleBn3Production = () => {
    if (!validateBn3Production()) return;
    const { bn3Amount, wasteAmount } = currentBn3Production;
    const bn3 = parseFloat(bn3Amount) || 0;
    const waste = parseFloat(wasteAmount) || 0;
    const finalBn5 = bn3 - waste;

    setCalculatedBn5(finalBn5);
    setShowBn3Dialog(true);
  };

  const confirmBn3Production = async () => {
    try {
      const {
        bn3Amount,
        wasteAmount,
        gasAmount,
        temperature,
        electricEnergy,
        boilingHours,
        notes,
        electricity,
        extra,
        date,
        price,
      } = currentBn3Production;

      const res = await createBn5Production({
        bn3Amount,
        wasteAmount,
        gasAmount,
        temperature,
        electricEnergy,
        boilingHours,
        notes,
        electricity,
        extra,
        date,
        price,
      });
      if (res) {
        toast.success(`BN-5 ishlab chiqarildi! Omborga ${res?.data?.finalBn5} kg qo'shildi`);
        refetch();
      }

      setActualBn5Result('');
      setShowBn3Dialog(false);
    } catch (error) {
      toast.error(error.message || 'Xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.');
    }
  };

  const validateBn5Processing = () => {
    const { bn5Amount, melAmount } = currentBn5Process;
    const bn5 = parseFloat(bn5Amount) || 0;
    const mel = parseFloat(melAmount) || 0;

    if (materialObj?.bn5?.quantity < bn5) {
      toast.error("Omborida yetarli BN-5 yo'q!");
      return false;
    }
    if (materialObj?.mel?.quantity < mel) {
      toast.error("Omborida yetarli mel yo'q!");
      return false;
    }

    const totalMix = bn5 + mel;
    const bn5Percent = (bn5 / totalMix) * 100;
    const melPercent = (mel / totalMix) * 100;

    const expectedBn5Percent = (5000 / (5000 + 1800)) * 100; // 73.5%
    const expectedMelPercent = (1800 / (5000 + 1800)) * 100; // 26.5%

    const tolerance = 0.2; // sal kam bo‘lsa ham ogohlantiradi

    if (
      Math.abs(bn5Percent - expectedBn5Percent) > tolerance ||
      Math.abs(melPercent - expectedMelPercent) > tolerance
    ) {
      toast.error(
        `Nisbat noto'g'ri! BN-5: ${bn5Percent.toFixed(1)}%, Mel: ${melPercent.toFixed(1)}% (Kerak: BN-5: ${expectedBn5Percent.toFixed(1)}%, Mel: ${expectedMelPercent.toFixed(1)}%)`
      );
      return false;
    }

    setShowBn5ProcessDialog(true);
    return true;
  };


  const renderBn3InputFields = () => [
    { label: 'BN-3 miqdori (kg)', key: 'bn3Amount', placeholderahl: '15000' },
    { label: 'Chiqindi (kg)', key: 'wasteAmount', placeholder: '500' },
    {
      label: (
        <span>
          Elektr energiyasi (kWh) <span className="price-info">({electricityPrice} so‘m/kWh)</span>
        </span>
      ),
      key: 'electricity',
      placeholder: '1200',
    },
    {
      label: (
        <span>
          Gaz (m³) <span className="price-info">({gasPrice} so‘m/m³)</span>
        </span>
      ),
      key: 'gasAmount',
      placeholder: '4500',
    },
    { label: 'Boshqa xarajatlar', key: 'extra', placeholder: '5.850' },
    { label: 'Qaynash vaqti (soat)', key: 'boilingHours', placeholder: '19' },
    { label: 'BN-5 (1kg narx)', key: 'price', placeholder: '10.000', readOnly: true },
  ].map(({ label, key, placeholder, readOnly }) => (
    <div className="bitum-input-group" key={key}>
      <label>{label}</label>
      <input
        type="number"
        value={currentBn3Production[key]}
        onChange={(e) => !readOnly && setCurrentBn3Production({ ...currentBn3Production, [key]: e.target.value })}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  ));

  const renderBn5InputFields = () => [
    { label: 'BN-5 miqdori (kg)', key: 'bn5Amount', placeholder: '5000' },
    { label: 'Mel miqdori (kg)', key: 'melAmount', placeholder: '1800' },
  ].map(({ label, key, placeholder }) => (
    <div className="bitum-input-group" key={key}>
      <label>{label}</label>
      <input
        type="number"
        value={currentBn5Process[key]}
        onChange={(e) => setCurrentBn5Process({ ...currentBn5Process, [key]: e.target.value })}
        placeholder={placeholder}
      />
    </div>
  ));

  return (
    <div className="bitum-system-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="bitum-inventory-grid">
        <div className="bitum-inventory-card">
          <h4>BN-3 Ombori</h4>
          <p className="bn3-inventory">{(materialObj?.bn3?.quantity || 0).toLocaleString()} kg</p>
        </div>
        <div className="bitum-inventory-card">
          <h4>BN-5 Ombori</h4>
          <p className="bn5-inventory">{(materialObj?.bn5?.quantity || 0).toLocaleString()} kg</p>
        </div>
        <div className="bitum-inventory-card">
          <h4>Mel Ombori</h4>
          <p className="mel-inventory">{(materialObj?.mel?.quantity || 0).toLocaleString()} kg</p>
        </div>
        <div className="bitum-inventory-card">
          <h4>Tayyor Mahsulot</h4>
          <p className="ready-product-inventory">
            Qop: {inventory.readyProductStorage.bags} dona<br />
            Stakan kichik: {inventory.readyProductStorage.smallCups} dona<br />
            Stakan katta: {inventory.readyProductStorage.largeCups} dona
          </p>
        </div>
      </div>

      <div className="bitum-production-sections">
        <div className="bitum-production-panel">
          <div className="bitum-panel-header">
            <Calculator size={24} color="#667eea" />
            <h2>1-BOSQICH: BN-3 → BN-5</h2>
          </div>
          <div className="bitum-input-grid">{renderBn3InputFields()}</div>
          <button className="bitum-action-button bitum-bn3-action" onClick={handleBn3Production}>
            <TrendingUp size={20} /> BN-5 Ishlab Chiqarish
          </button>
        </div>

        <div className="bitum-production-panel">
          <div className="bitum-panel-header">
            <Package size={24} color="#059669" />
            <h2>2-BOSQICH: BN-5 + Mel</h2>
          </div>
          <div className="bitum-input-flex">{renderBn5InputFields()}</div>
          <button className="bitum-action-button bitum-bn5-action" onClick={validateBn5Processing}>
            <ShoppingCart size={20} /> Qadoqlashga Tayyorlash
          </button>
        </div>
      </div>

      {showBn3Dialog && (
        <div className="bitum-dialog-overlay">
          <div className="bitum-dialog-box">
            <h3>BN-5 Ishlab Chiqarish Natijasi</h3>
            <p>
              Hisoblangan BN-5 miqdori: <strong>{calculatedBn5.toLocaleString()} kg</strong>
            </p>
            <div className="bitum-dialog-input">
              <label>Haqiqiy BN-5 miqdori (kg)</label>
              <input
                type="number"
                value={actualBn5Result}
                onChange={(e) => setActualBn5Result(e.target.value)}
                placeholder={calculatedBn5.toLocaleString()}
              />
            </div>
            <div className="bitum-dialog-actions">
              <button className="bitum-cancel-button" onClick={() => setShowBn3Dialog(false)}>
                Bekor qilish
              </button>
              <button className="bitum-confirm-button bitum-bn3-confirm" onClick={confirmBn3Production}>
                Tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {
        showBn5ProcessDialog && (
          <Bn5ProcessDialog setShowBn5ProcessDialog={setShowBn5ProcessDialog} currentBn5Process={currentBn5Process} />
        )
      }
    </div>
  );
};

export default BitumProductionSystem;





