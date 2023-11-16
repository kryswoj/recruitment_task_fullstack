import React from 'react';

const SearchInput = ({ value, onChange, placeholder }) => {
    return (
        <div className="row justify-content-center">
            <div className="col-md-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
            </div>
        </div>
    );
};

export default SearchInput;
