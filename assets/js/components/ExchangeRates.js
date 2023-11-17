import React, {useState, useEffect, useMemo, useCallback} from 'react';
import axios from 'axios';
import CurrencyExchangeModal from "./utils/CurrencyExchangeModal";
import {useHistory} from "react-router-dom";
import CurrencyTable from "./utils/CurrencyTable";
import DatePicker from "./utils/filters/DatePicker";
import SearchInput from "./utils/filters/SearchInput";

const ExchangeRates = () => {
    const [selectedRates, setSelectedRates] = useState([]);
    const [currentRates, setCurrentRates] = useState([]);
    const [date, setDate] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('date') || new Date().toISOString().split('T')[0];
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');
    const [selectedRate, setSelectedRate] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const history = useHistory();

    const currentDate = new Date().toISOString().split('T')[0];

    const filteredRates = useMemo(() => {
        return selectedRates
            .filter(rate => !rate.error)
            .filter(rate => rate.code.toLowerCase().includes(filter.toLowerCase()));
    }, [selectedRates, filter]);

    const fetchData = async (queryDate, isCurrentDate = false) => {
        if (isCurrentDate && currentRates.length > 0) {
            return currentRates;
        }

        try {
            const response = await axios.get(`http://telemedi-zadanie.localhost/api/exchange-rates?date=${queryDate}`);

            return Object.values(response.data);
        } catch (error) {
            setError("Error fetching data");
            return [];
        }
    };

    useEffect(() => {
        const loadRates = async () => {
            setLoading(true);

            const selectedDateRates = await fetchData(date);
            setSelectedRates(selectedDateRates);

            const currentDateRates = await fetchData(currentDate, true);
            setCurrentRates(currentDateRates);

            setLoading(false);
        };

        loadRates();
    }, [date]);



    const handleRowClick = useCallback((rate) => {
        setSelectedRate(rate);
        setShowModal(true);
    }, []);

    const handleDateChange = (e) => {
        setDate(e.target.value);
        history.push(`?date=${e.target.value}`);
    };

    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="container mt-4">
            <div className="mb-4">
                <h2 className="mb-4 text-center">Kursy Walut</h2>
                <DatePicker
                    value={date}
                    onChange={handleDateChange}
                    minDate="2023-01-01"
                />
                <SearchInput
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Wyszukaj po kodzie waluty (np. USD)"
                />
                <p className="my-4 text-center text-muted">Po kliknięciu na wiersz, mamy możliwość przeliczenia waluty z kursem dnia dzisiejszego</p>
            </div>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center spinner-container">
                    <div className="spinner-overlay">
                        <div className="spinner"></div>
                    </div>
                </div>
            ) : (
                <CurrencyTable
                    filteredRates={filteredRates}
                    currentRates={currentRates}
                    currentDate={currentDate}
                    date={date}
                    onRowClick={handleRowClick}
                />
            )}
            <CurrencyExchangeModal
                rate={selectedRate}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
};

export default ExchangeRates;
