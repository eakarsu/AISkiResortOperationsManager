import React from 'react';
import LiftUtilizationTimeline from '../components/LiftUtilizationTimeline';
import SlopeConditionsHeatmap from '../components/SlopeConditionsHeatmap';
import GroomingReportPDF from '../components/GroomingReportPDF';
import OperationalRulesEditor from '../components/OperationalRulesEditor';

const CustomViewsPage = () => {
  return (
    <div style={{ padding: 24, background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: 26 }}>Resort Views</h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
          Custom operational dashboards: lift utilization, slope conditions, grooming reports, and rules management
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        <LiftUtilizationTimeline />
        <SlopeConditionsHeatmap />
        <GroomingReportPDF />
        <OperationalRulesEditor />
      </div>
    </div>
  );
};

export default CustomViewsPage;
