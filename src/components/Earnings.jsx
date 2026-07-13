import React from 'react';

export default function Earnings({ earningsValue, pendingValue, transactions }) {
  return (
    <div className="centered-column-container animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="welcome-title">Earnings</h2>
        <p className="welcome-desc" style={{ marginTop: '4px' }}>
          Track your referral rewards and payouts.
        </p>
      </div>

      {/* Bento Grid Layout for Top Stats */}
      <div className="earnings-bento-grid">
        {/* Total Earnings */}
        <div className="card-base earnings-prominent-card">
          <div className="earnings-decor-blob"></div>
          <div className="earnings-prominent-content">
            <div className="earnings-card-label">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <span>Total Earnings</span>
            </div>
            <h3 className="earnings-large-val">
              ${earningsValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <span className="earnings-large-val-cents">.00</span>
            </h3>
            <p className="earnings-info-footer">
              <span className="material-symbols-outlined">info</span>
              <span>Coordinate with finance for withdrawal.</span>
            </p>
          </div>
        </div>

        {/* Pending Earnings */}
        <div className="card-base earnings-pending-card">
          <div>
            <div className="earnings-card-label">
              <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)' }}>pending</span>
              <span>Pending</span>
            </div>
            <p className="welcome-title" style={{ fontSize: '32px' }}>
              ${pendingValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <p className="earnings-pending-desc">
            Expected release upon client signing CTS and 50% of client payment.
          </p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <div className="transactions-header-row">
          <h3 className="transactions-title">Recent Transactions</h3>
          <button className="transactions-view-btn">View All</button>
        </div>

        {/* Transaction List */}
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className={`transaction-card ${tx.status === 'Pending' ? 'pending-tx' : ''}`}
            >
              <div className="transaction-item-left">
                <div className="transaction-icon-box">
                  <span className="material-symbols-outlined">
                    {tx.type === 'Villa' ? 'real_estate_agent' : tx.type === 'Condo' ? 'apartment' : 'hourglass_top'}
                  </span>
                </div>
                <div className="transaction-client-info">
                  <p className="transaction-client-title">Client: {tx.clientName}</p>
                  <p className="transaction-client-sub">{tx.details}</p>
                </div>
              </div>
              <div className="transaction-item-right">
                <p className="transaction-amount">
                  {tx.status === 'Pending' ? '' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="transaction-date">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
