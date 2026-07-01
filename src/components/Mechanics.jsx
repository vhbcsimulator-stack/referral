import React from 'react';

export default function Mechanics() {
  const steps = [
    {
      step: '1',
      title: '1. Refer',
      icon: 'person_add',
      desc: 'Submit client details through the portal. Our system instantly logs your lead and alerts the sales team.',
      isHighlighted: false
    },
    {
      step: '2',
      title: '2. Track',
      icon: 'track_changes',
      desc: 'Monitor progress in real-time on your dashboard. See when a lead moves from initial contact to contract signed.',
      isHighlighted: false
    },
    {
      step: '3',
      title: '3. Earn',
      icon: 'account_balance_wallet',
      desc: 'Receive your commission once the transaction closes. Finance department will coordinate with you for the payout.',
      isHighlighted: true
    }
  ];

  return (
    <div className="mechanics-container animate-fade-in">
      {/* Page Header */}
      <header>
        <h2 className="mechanics-header-title">Program Mechanics</h2>
        <p className="mechanics-header-desc">
          Understand how the VHBC Referral program operates, the structure of your potential earnings, and the guidelines that govern our partnership.
        </p>
      </header>

      {/* How it Works Bento Grid */}
      <section>
        <h3 className="mechanics-section-title">How it Works</h3>
        <div className="mechanics-steps-grid">
          {steps.map((item) => (
            <div
              key={item.step}
              className={`mechanics-step-card ${item.isHighlighted ? 'highlighted-step' : ''}`}
            >
              <div className="mechanics-icon-circle">
                <span className="material-symbols-outlined fill" style={{ fontSize: '28px' }}>
                  {item.icon}
                </span>
              </div>
              <h4 className="mechanics-step-title">{item.title}</h4>
              <p className="mechanics-step-desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
