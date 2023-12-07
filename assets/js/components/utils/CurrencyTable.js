import React from 'react';

const CurrencyTable = ({ filteredRates, currentRates, currentDate, date, onRowClick }) => {
    return (
        <table className="table table-striped table-bordered table-hover">
            <thead className="thead-dark">
            <tr>
                <th colSpan={2}></th>
                {currentDate !== date && <th colSpan={3} className="table-date-element">Kursy na {date}</th>}
                {(currentDate !== date || currentDate === date) && <th colSpan={3} className="table-date-element">Kursy na dzisiaj</th>}
            </tr>
            <tr>
                <th>Waluta</th>
                <th>Kod</th>
                <th>NBP</th>
                <th>Kupno</th>
                <th>Sprzedaż</th>
                {currentDate !== date && <>
                    <th>NBP</th>
                    <th>Kupno</th>
                    <th>Sprzedaż</th>
                </>}
            </tr>
            </thead>
            <tbody>
            {filteredRates.length > 0 ? (
                filteredRates.map(rate => {
                    const currentRate = currentRates.find(cr => cr.code === rate.code);
                    return (
                        <tr
                            key={rate.code}
                            onClick={() => onRowClick(currentRate)}
                            className="table-row-click"
                        >
                            <td>{rate.currency}</td>
                            <td>{rate.code}</td>
                            <td>{rate.rates.nbp}</td>
                            <td>{rate.rates.purchase}</td>
                            <td>{rate.rates.selling}</td>
                            {currentDate !== date && currentRate && <>
                                <td>{currentRate.rates.nbp}</td>
                                <td>{currentRate.rates.purchase}</td>
                                <td>{currentRate.rates.selling}</td>
                            </>}
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan={currentDate !== date ? 8 : 5}>
                        Nie znaleziono danych.
                    </td>
                </tr>
            )}
            </tbody>
        </table>
    );
}

export default CurrencyTable;
