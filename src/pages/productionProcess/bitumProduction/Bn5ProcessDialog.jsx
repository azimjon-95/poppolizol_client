import React, { useState } from 'react';
import { toast } from 'react-toastify';


const Bn5ProcessDialog = ({ currentBn5Process, setShowBn5ProcessDialog }) => {
    const [packagingType, setPackagingType] = useState('bag'); // bag, smallCup, largeCup
    const [unitType, setUnitType] = useState('dona'); // dona, gram, kilo

    const packagingConfig = {
        bag: { label: 'Qop', weight: 39, ropePerUnit: 1.5, kraftPerUnit: unitType !== 'dona' ? 0.25 : 0 },
        smallCup: { label: 'Stakan kichik', weight: 0.5, ropePerUnit: 1.5, kraftPerUnit: 0 },
        largeCup: { label: 'Stakan katta', weight: 1, ropePerUnit: 1.5, kraftPerUnit: 0 },
    };

    const [currentBn3Production, setCurrentBn3Production] = useState({
        id: null,
        date: new Date().toISOString().split('T')[0],
        bn5Amount: currentBn5Process.bn5Amount,
        melAmount: currentBn5Process.melAmount,
        gasAmount: '200',
        temperature: '250',
        electricEnergy: '14.5',
        electricity: '200',
        price: '',
        extra: '27.914.700', // 1%
    });

    // melAmount = 5000
    // bn5Amount = 1800

    const confirmBn5Processing = () => {
        const { melAmount, bn5Amount } = currentBn5Process;

        console.log(melAmount + bn5Amount);



        toast.success('Mahsulot muvaffaqiyatli qadoqlandi!');
        setShowBn5ProcessDialog(false);
    };
    return (
        <div className="bitum-dialog-overlay">
            <div className="bitum-dialog-box">
                <h3>Mahsulotni Qadoqlash</h3>
                <p>
                    Umumiy aralashma:{' '}
                    <strong>{(parseFloat(currentBn5Process.bn5Amount) + parseFloat(currentBn5Process.melAmount)).toLocaleString()} kg</strong>
                </p>
                <div className="bitum-packaging-buttons">
                    {Object.keys(packagingConfig).map((type) => (
                        <button
                            key={type}
                            className={`bitum-action-button ${packagingType === type ? 'active' : ''}`}
                            onClick={() => {
                                setPackagingType(type);
                                setUnitType(type === 'bag' ? 'dona' : 'kilo'); // Set unitType based on packaging
                            }}
                        >
                            {packagingConfig[type].label}
                        </button>
                    ))}
                </div>
                <div className="bitum-input">
                    <div className="bitum-input-groupBox">
                        <div className="bitum-input-group">
                            <label>BN-5 miqdori (kg)</label>
                            <input
                                type="number"
                                placeholder="0"
                            />
                        </div>
                        <div className="bitum-input-group">
                            <label>{packagingConfig[packagingType].label} soni ({packagingType === 'bag' ? 'dona' : 'kg'})</label>
                            <input
                                type="number"
                                placeholder="0"
                            />
                        </div>
                    </div>
                    <button>Ok</button>
                </div>
                <div className="bitum-packaging-details">

                </div>
                <div className="bitum-dialog-actions">
                    <button className="bitum-cancel-button" onClick={() => setShowBn5ProcessDialog(false)}>
                        Bekor qilish
                    </button>
                    <button className="bitum-confirm-button bitum-bn5-confirm" onClick={confirmBn5Processing}>
                        Tasdiqlash
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Bn5ProcessDialog
