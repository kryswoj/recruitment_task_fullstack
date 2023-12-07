import React, {useState, useEffect} from 'react';

const CurrencyExchangeModal = ({rate, rates, isOpen, onClose}) => {
    const [selectedOperation, setSelectedOperation] = useState('sell');
    const [amount, setAmount] = useState('');
    const [targetRateCode, setTargetRateCode] = useState('PLN');
    const [multiplier, setMultiplier] = useState(1)

    const [mergedRates, setMergedRates] = useState([]);

    useEffect(() => {
        if (rate) {
            mergeRates();
        }
    }, [rate]);

    useEffect(() => {
        if (!rate || !rates) return;

        if (targetRateCode === 'PLN') {
            setMultiplier(getRateValue(rate))
            return;
        }

        const sourceRateValue = getRateValue(rate);
        const targetRate = rates.find(r => r.code === targetRateCode);
        const targetRateValue = getRateValue(targetRate);

        if (!sourceRateValue || !targetRateValue) {
            setMultiplier('Nie prowadzimy wybranej akcji dla danej pary walutowej')
            return;
        }

        const newMultiplier = sourceRateValue / targetRateValue;
        setMultiplier(newMultiplier.toFixed(6));
    }, [targetRateCode, selectedOperation, rate, rates]);

    if (!isOpen || !rate) return null;

    const mergeRates = () => {
        const PLNRate = {'code': 'PLN', 'currency': 'polski złoty', 'rates': {}}
        PLNRate['rates']['purchase'] = rate.rates.purchase
        PLNRate['rates']['selling'] = rate.rates.selling

        let newRates = [...rates]
        newRates.push(PLNRate)

        setMergedRates(newRates)
    }


    const calculateResult = () => {
        if (!amount) return '';

        return (parseFloat(amount) * multiplier).toFixed(2);
    };

    const renderCurrencyOptions = () => {
        return mergedRates.map(rate => (
            <option key={rate.code} value={rate.code}>{rate.currency}</option>
        ));
    };

    const isPurchaseAvailable = rate && rate.rates.purchase !== null;
    const isSellingAvailable = rate && rate.rates.selling !== null;

    const renderOperationOptions = () => {
        const options = [];
        if (isPurchaseAvailable) options.push(<option key="buy" value="buy">Kupno</option>);
        if (isSellingAvailable) options.push(<option key="sell" value="sell">Sprzedaż</option>);
        return options;
    };

    const getRateValue = (rate) => {
        return selectedOperation === 'buy' ? rate.rates.purchase : rate.rates.selling;
    };

    const handleClose = () => {
        setSelectedOperation('sell')
        setAmount('');
        setTargetRateCode('PLN')
        onClose();
    };

    return (
        <div
            className="modal show"
            tabIndex="-1"
            role="dialog"
        >
            <div
                className="modal-dialog"
                role="document"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Waluta: {rate.currency}</h5>
                        <button
                            type="button"
                            className="close"
                            onClick={handleClose}
                        >
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Operacja:</label>
                            <select
                                className="form-control"
                                value={selectedOperation}
                                onChange={(e) => setSelectedOperation(e.target.value)}
                                disabled={!isPurchaseAvailable && !isSellingAvailable}
                            >
                                {renderOperationOptions()}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Wybrana waluta</label>
                            <select
                                className="form-control"
                                value={targetRateCode}
                                onChange={(e) => setTargetRateCode(e.target.value)}
                            >
                                {renderCurrencyOptions()}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Kwota:</label>
                            <input
                                type="number"
                                className="form-control"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Mnożnik (kurs):</label>
                            <input
                                type="text"
                                className="form-control"
                                value={multiplier}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Wynik</label>
                            <input
                                type="text"
                                className="form-control"
                                value={calculateResult()}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                        >Zamknij
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrencyExchangeModal;
