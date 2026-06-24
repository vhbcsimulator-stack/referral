import React, { useState } from 'react';

const chartData = {
  '30days': [
    { day: 'Mon', height: '45%', referrals: 15 },
    { day: 'Tue', height: '65%', referrals: 22 },
    { day: 'Wed', height: '85%', referrals: 28 },
    { day: 'Thu', height: '55%', referrals: 18 },
    { day: 'Fri', height: '75%', referrals: 25 },
    { day: 'Sat', height: '90%', referrals: 30 },
    { day: 'Sun', height: '70%', referrals: 23 },
  ],
  '90days': [
    { day: 'Mon', height: '60%', referrals: 45 },
    { day: 'Tue', height: '80%', referrals: 58 },
    { day: 'Wed', height: '50%', referrals: 38 },
    { day: 'Thu', height: '95%', referrals: 72 },
    { day: 'Fri', height: '65%', referrals: 48 },
    { day: 'Sat', height: '85%', referrals: 64 },
    { day: 'Sun', height: '75%', referrals: 56 },
  ]
};

export default function PipelineChart({ appointments = [] }) {
  const [timePeriod, setTimePeriod] = useState('30days');

  // Filter appointments based on timePeriod (last 30 days or last 90 days)
  const now = new Date();
  const filterDays = timePeriod === '30days' ? 30 : 90;
  const cutoffDate = new Date(now.getTime() - filterDays * 24 * 60 * 60 * 1000);

  const filteredAppts = appointments.filter(appt => {
    if (!appt.date) return false;
    const apptDate = new Date(appt.date);
    return apptDate >= cutoffDate;
  });

  // Count by day of the week: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
  const counts = [0, 0, 0, 0, 0, 0, 0];
  filteredAppts.forEach(appt => {
    if (appt.date) {
      const parts = appt.date.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getDay();
        counts[d]++;
      }
    }
  });

  // Map to Mon-Sun order for chart layout
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekIndices = [1, 2, 3, 4, 5, 6, 0];

  const maxCount = Math.max(...counts, 1);

  const activeData = weekDays.map((day, idx) => {
    const dayIndex = weekIndices[idx];
    const count = counts[dayIndex] || 0;
    const pct = Math.round((count / maxCount) * 100);
    return {
      day,
      height: count > 0 ? `${Math.max(pct, 10)}%` : '0%',
      referrals: count
    };
  });

  return (
    <div className="pipeline-chart-card card-base">
      <div className="chart-header">
        <h4 className="chart-title">Referral Pipeline</h4>
        <select
          className="chart-select"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}
        >
          <option value="30days">Last 30 Days</option>
          <option value="90days">Last 90 Days</option>
        </select>
      </div>

      <div className="chart-container">
        <div className="chart-grid-lines">
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
        </div>

        <div className="chart-bars">
          {activeData.map((item, idx) => (
            <div key={idx} className="chart-bar-col">
              <div className="chart-bar-wrapper">
                <div
                  className="chart-bar"
                  style={{ height: item.height }}
                >
                  <span className="chart-bar-tooltip">{item.referrals} referrals</span>
                </div>
              </div>
              <span className="chart-day-label">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
