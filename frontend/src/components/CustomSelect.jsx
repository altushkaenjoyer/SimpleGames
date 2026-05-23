import { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="cselect" ref={ref}>
      <button
        type="button"
        className="cselect-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <span>{selected?.label}</span>
        <span className={`cselect-arrow${open ? ' open' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="cselect-dropdown">
          {options.map(o => (
            <div
              key={o.value}
              className={`cselect-option${o.value === value ? ' active' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.value === value && <span className="cselect-check">▶</span>}
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
