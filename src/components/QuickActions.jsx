import React from 'react';

export default function QuickActions({ onNewReferralClick }) {
  return (
    <div className="quick-actions-card card-base">
      <h4 className="quick-actions-title">Quick Actions</h4>
      <div className="quick-actions-buttons">
        <button className="quick-action-btn primary" onClick={onNewReferralClick}>
          <span className="btn-content">
            <span className="material-symbols-outlined">person_add</span>
            <span>New Referral</span>
          </span>
          <span className="material-symbols-outlined chevron">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
