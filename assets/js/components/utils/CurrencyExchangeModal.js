import React, {useMemo, useState} from 'react';

const CurrencyExchangeModal = ({rate, isOpen, onClose}) => {
    const [selectedOperation, setSelectedOperation] = useState('sell');
    const [amount, setAmount] = useState('');

    if (!isOpen || !rate) return null;

    const calculateResult = () => {
        if (!amount) return '';
        const rateValue = getRateValue()
        return (parseFloat(amount) * rateValue).toFixed(2);
    };

    const isPurchaseAvailable = rate && rate.rates.purchase !== null;
    const isSellingAvailable = rate && rate.rates.selling !== null;

    const renderOperationOptions = () => {
        const options = [];
        if (isPurchaseAvailable) options.push(<option key="buy" value="buy">Kupno</option>);
        if (isSellingAvailable) options.push(<option key="sell" value="sell">Sprzedaż</option>);
        return options;
    };

    const getRateValue = () => {
        return selectedOperation === 'buy' ? rate.rates.purchase : rate.rates.selling;
    };

    const handleClose = () => {
        setSelectedOperation('sell')
        setAmount('');
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
                                value={getRateValue()}
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label>Wynik w PLN:</label>
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
