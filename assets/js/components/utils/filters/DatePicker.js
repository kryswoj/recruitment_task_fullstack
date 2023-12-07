import React from 'react';

const DatePicker = ({ value, onChange, minDate }) => {
    return (
        <div className="row justify-content-center mb-3">
            <div className="col-md-4 d-flex align-items-center">
                <input
                    type="date"
                    className="form-control"
                    value={value}
                    onChange={onChange}
                    min={minDate}
                    max={new Date().toISOString().split('T')[0]}
                />
            </div>
        </div>
    );
};

export default DatePicker;
