import React from 'react';

export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div className="mb-3.5">
      {label && <label htmlFor={htmlFor} className="field-label">{label}</label>}
      {children}
      {hint && <div className="field-hint">{hint}</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

export const Input = React.forwardRef((props, ref) => <input ref={ref} className="field-input" {...props} />);
export const Select = React.forwardRef((props, ref) => <select ref={ref} className="field-input" {...props} />);
export const Textarea = React.forwardRef((props, ref) => <textarea ref={ref} className="field-input min-h-[84px] resize-y" {...props} />);
