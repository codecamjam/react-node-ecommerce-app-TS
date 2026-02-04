import { useState } from 'react';

const Radiobox = ({ prices, handleFilters }) => {
  const [, setValue] = useState(0);

  const handleChange = (e) => {
    handleFilters(e.target.value);
    setValue(e.target.value);
  };

  return prices.map((p, i) => (
    <div key={i}>
      <input
        onChange={handleChange}
        value={`${p.id}`}
        type="radio"
        name={p}
        className="form-check-input"
      />
      <label htmlFor="" className="form-check-label">
        {p.name}
      </label>
    </div>
  ));
};

export default Radiobox;
