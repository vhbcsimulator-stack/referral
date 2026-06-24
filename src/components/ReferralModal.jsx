import React, { useState } from 'react';

export default function ReferralModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [action, setAction] = useState('Premium Portfolio');
  const [value, setValue] = useState('1500');
  const [status, setStatus] = useState('In Review');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a referral name.');
      return;
    }
    if (!email.trim()) {
      alert('Please enter a referral email.');
      return;
    }
    onSubmit({
      name,
      email,
      phone,
      action,
      value: parseFloat(value) || 0,
      status
    });
    setName('');
    setEmail('');
    setPhone('');
    setAction('Premium Portfolio');
    setValue('1500');
    setStatus('In Review');
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h4 className="modal-title">New Referral Entry</h4>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="ref-name">Referral Name *</label>
            <input
              id="ref-name"
              type="text"
              className="form-input"
              placeholder="e.g., Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ref-email">Email *</label>
            <input
              id="ref-email"
              type="email"
              className="form-input"
              placeholder="e.g., sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ref-phone">Phone Number</label>
            <input
              id="ref-phone"
              type="tel"
              className="form-input"
              placeholder="e.g., (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ref-program">Program / Interest</label>
            <select
              id="ref-program"
              className="form-input select"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="Premium Portfolio">Premium Portfolio</option>
              <option value="Elite Leisure Community">Elite Leisure Community</option>
              <option value="Executive Suite Option">Executive Suite Option</option>
              <option value="Basic Referral Scheme">Basic Referral Scheme</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ref-value">Pipeline Value ($)</label>
            <input
              id="ref-value"
              type="number"
              className="form-input"
              placeholder="e.g., 2500"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ref-status">Initial Status</label>
            <select
              id="ref-status"
              className="form-input select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="In Review">In Review</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit">
              Create Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
