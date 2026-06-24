import React from 'react';

export default function RewardsBanner({ onLearnMore }) {
  return (
    <div className="rewards-banner">
      <div className="rewards-banner-bg-overlay"></div>
      <div className="rewards-banner-content">
        <h4 className="rewards-title">Referral Rewards</h4>
        <p className="rewards-desc">
          Earn $1,000 commission for every successful referral.
        </p>
        <button className="rewards-action-btn" onClick={onLearnMore}>
          Learn More
        </button>
      </div>
    </div>
  );
}
