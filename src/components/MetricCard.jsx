import React from 'react';

export default function MetricCard({ title, value, trend, isPositive, icon, isHighlighted }) {
  return (
    <div className={`metric-card ${isHighlighted ? 'highlighted' : ''}`}>
      <div className="metric-header">
        <div className="metric-icon-wrapper">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        {trend && (
          <span className={`metric-trend ${isPositive ? 'trend-up' : 'trend-neutral'}`}>
            {isPositive && <span className="material-symbols-outlined text-trend">trending_up</span>}
            {trend}
          </span>
        )}
      </div>
      <div className="metric-body">
        <p className="metric-title">{title}</p>
        <h3 className="metric-value">{value}</h3>
      </div>
    </div>
  );
}
