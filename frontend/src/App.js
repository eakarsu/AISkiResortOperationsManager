import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import LiftTicketsPage from './pages/LiftTicketsPage';
import SeasonPassesPage from './pages/SeasonPassesPage';
import LiftsPage from './pages/LiftsPage';
import TrailsPage from './pages/TrailsPage';
import SnowmakingPage from './pages/SnowmakingPage';
import PatrolIncidentsPage from './pages/PatrolIncidentsPage';
import RentalInventoryPage from './pages/RentalInventoryPage';
import LessonsPage from './pages/LessonsPage';
import InstructorsPage from './pages/InstructorsPage';
import SnowReportsPage from './pages/SnowReportsPage';
import ParkingPage from './pages/ParkingPage';
import FoodBeveragePage from './pages/FoodBeveragePage';
import RetailPage from './pages/RetailPage';
import ChildcarePage from './pages/ChildcarePage';
import LostFoundPage from './pages/LostFoundPage';
import GuestServicesPage from './pages/GuestServicesPage';
import EventsPage from './pages/EventsPage';
import AccommodationsPage from './pages/AccommodationsPage';
import ShuttlesPage from './pages/ShuttlesPage';
import EquipmentMaintenancePage from './pages/EquipmentMaintenancePage';
import RfidAccessPage from './pages/RfidAccessPage';
import WeatherStationsPage from './pages/WeatherStationsPage';
import AvalancheControlPage from './pages/AvalancheControlPage';
import StaffingPage from './pages/StaffingPage';
import TerrainParkPage from './pages/TerrainParkPage';
import AIDynamicPricingPage from './pages/AIDynamicPricingPage';
import AISnowConditionsPage from './pages/AISnowConditionsPage';
import AIGroomingOptimizationPage from './pages/AIGroomingOptimizationPage';
import AIGuestRecommendationsPage from './pages/AIGuestRecommendationsPage';
import AIMarketingContentPage from './pages/AIMarketingContentPage';
import AIStaffingPredictionPage from './pages/AIStaffingPredictionPage';
import AIOccupancyForecastPage from './pages/AIOccupancyForecastPage';
import AIAvalancheRiskAssessmentPage from './pages/AIAvalancheRiskAssessmentPage';
import AIEquipmentMaintenanceSchedulingPage from './pages/AIEquipmentMaintenanceSchedulingPage';
import AIInstructorSchedulingPage from './pages/AIInstructorSchedulingPage';
import AIChurnPredictionPage from './pages/AIChurnPredictionPage';
import AIRevenueOptimizationPage from './pages/AIRevenueOptimizationPage';
import CustomViewsPage from './pages/CustomViewsPage';

// === Batch 07 Gaps & Frontend Mounts ===
import CfRevenuePerAvailableSeatdayRevpasdayOpti from './pages/CfRevenuePerAvailableSeatdayRevpasdayOpti';
import CfSnowConditionsForecasting from './pages/CfSnowConditionsForecasting';
import CfDemandbasedStaffing from './pages/CfDemandbasedStaffing';
import CfGuestExperiencePersonalization from './pages/CfGuestExperiencePersonalization';
import CfMaintenancePredictiveScheduling from './pages/CfMaintenancePredictiveScheduling';
import CfDynamicDiningRecommendations from './pages/CfDynamicDiningRecommendations';
import GapNoOccupancyforecastForResortBusyness from './pages/GapNoOccupancyforecastForResortBusyness';
import GapNoRevenueoptimizationBundlePricing from './pages/GapNoRevenueoptimizationBundlePricing';
import GapNoAvalancheriskassessmentMl from './pages/GapNoAvalancheriskassessmentMl';
import GapNoEquipmentmaintenanceschedulingAi from './pages/GapNoEquipmentmaintenanceschedulingAi';
import GapNoInstructorschedulingDemandMatching from './pages/GapNoInstructorschedulingDemandMatching';
import GapNoChurnpredictionReturningGuestLikelihoo from './pages/GapNoChurnpredictionReturningGuestLikelihoo';
import GapNoRealtimeLiftLineWaitEstimation from './pages/GapNoRealtimeLiftLineWaitEstimation';
import GapNoPublicOnlineLessonBookingWidget from './pages/GapNoPublicOnlineLessonBookingWidget';
import GapNoFoodOrderingPosIntegration from './pages/GapNoFoodOrderingPosIntegration';
import GapLimitedWeatherApiIntegrationStationsAre from './pages/GapLimitedWeatherApiIntegrationStationsAre';
import GapNoLiftTicketPosIntegration from './pages/GapNoLiftTicketPosIntegration';
import GapNoGuestMobileAppCompanion from './pages/GapNoGuestMobileAppCompanion';
import GapNoNotificationssmsForGuests from './pages/GapNoNotificationssmsForGuests';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// === End Batch 07 ===


const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/insights/timeline" element={<TimelineView />} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/lift-tickets" element={<PrivateRoute><Layout><LiftTicketsPage /></Layout></PrivateRoute>} />
        <Route path="/season-passes" element={<PrivateRoute><Layout><SeasonPassesPage /></Layout></PrivateRoute>} />
        <Route path="/lifts" element={<PrivateRoute><Layout><LiftsPage /></Layout></PrivateRoute>} />
        <Route path="/trails" element={<PrivateRoute><Layout><TrailsPage /></Layout></PrivateRoute>} />
        <Route path="/snowmaking" element={<PrivateRoute><Layout><SnowmakingPage /></Layout></PrivateRoute>} />
        <Route path="/patrol-incidents" element={<PrivateRoute><Layout><PatrolIncidentsPage /></Layout></PrivateRoute>} />
        <Route path="/rental-inventory" element={<PrivateRoute><Layout><RentalInventoryPage /></Layout></PrivateRoute>} />
        <Route path="/lessons" element={<PrivateRoute><Layout><LessonsPage /></Layout></PrivateRoute>} />
        <Route path="/instructors" element={<PrivateRoute><Layout><InstructorsPage /></Layout></PrivateRoute>} />
        <Route path="/snow-reports" element={<PrivateRoute><Layout><SnowReportsPage /></Layout></PrivateRoute>} />
        <Route path="/parking" element={<PrivateRoute><Layout><ParkingPage /></Layout></PrivateRoute>} />
        <Route path="/food-beverage" element={<PrivateRoute><Layout><FoodBeveragePage /></Layout></PrivateRoute>} />
        <Route path="/retail" element={<PrivateRoute><Layout><RetailPage /></Layout></PrivateRoute>} />
        <Route path="/childcare" element={<PrivateRoute><Layout><ChildcarePage /></Layout></PrivateRoute>} />
        <Route path="/lost-found" element={<PrivateRoute><Layout><LostFoundPage /></Layout></PrivateRoute>} />
        <Route path="/guest-services" element={<PrivateRoute><Layout><GuestServicesPage /></Layout></PrivateRoute>} />
        <Route path="/events" element={<PrivateRoute><Layout><EventsPage /></Layout></PrivateRoute>} />
        <Route path="/accommodations" element={<PrivateRoute><Layout><AccommodationsPage /></Layout></PrivateRoute>} />
        <Route path="/shuttles" element={<PrivateRoute><Layout><ShuttlesPage /></Layout></PrivateRoute>} />
        <Route path="/equipment-maintenance" element={<PrivateRoute><Layout><EquipmentMaintenancePage /></Layout></PrivateRoute>} />
        <Route path="/rfid-access" element={<PrivateRoute><Layout><RfidAccessPage /></Layout></PrivateRoute>} />
        <Route path="/weather-stations" element={<PrivateRoute><Layout><WeatherStationsPage /></Layout></PrivateRoute>} />
        <Route path="/avalanche-control" element={<PrivateRoute><Layout><AvalancheControlPage /></Layout></PrivateRoute>} />
        <Route path="/staffing" element={<PrivateRoute><Layout><StaffingPage /></Layout></PrivateRoute>} />
        <Route path="/terrain-park" element={<PrivateRoute><Layout><TerrainParkPage /></Layout></PrivateRoute>} />
        <Route path="/ai/dynamic-pricing" element={<PrivateRoute><Layout><AIDynamicPricingPage /></Layout></PrivateRoute>} />
        <Route path="/ai/snow-conditions" element={<PrivateRoute><Layout><AISnowConditionsPage /></Layout></PrivateRoute>} />
        <Route path="/ai/grooming-optimization" element={<PrivateRoute><Layout><AIGroomingOptimizationPage /></Layout></PrivateRoute>} />
        <Route path="/ai/guest-recommendations" element={<PrivateRoute><Layout><AIGuestRecommendationsPage /></Layout></PrivateRoute>} />
        <Route path="/ai/marketing-content" element={<PrivateRoute><Layout><AIMarketingContentPage /></Layout></PrivateRoute>} />
        <Route path="/ai/staffing-prediction" element={<PrivateRoute><Layout><AIStaffingPredictionPage /></Layout></PrivateRoute>} />
        <Route path="/ai/occupancy-forecast" element={<PrivateRoute><Layout><AIOccupancyForecastPage /></Layout></PrivateRoute>} />
        <Route path="/ai/avalanche-risk" element={<PrivateRoute><Layout><AIAvalancheRiskAssessmentPage /></Layout></PrivateRoute>} />
        <Route path="/ai/equipment-maintenance-scheduling" element={<PrivateRoute><Layout><AIEquipmentMaintenanceSchedulingPage /></Layout></PrivateRoute>} />
        <Route path="/ai/instructor-scheduling" element={<PrivateRoute><Layout><AIInstructorSchedulingPage /></Layout></PrivateRoute>} />
        <Route path="/ai/churn-prediction" element={<PrivateRoute><Layout><AIChurnPredictionPage /></Layout></PrivateRoute>} />
        <Route path="/ai/revenue-optimization" element={<PrivateRoute><Layout><AIRevenueOptimizationPage /></Layout></PrivateRoute>} />
        <Route path="/custom-views" element={<PrivateRoute><Layout><CustomViewsPage /></Layout></PrivateRoute>} />
          {/* === Batch 07 Gaps & Frontend Mounts === */}
          <Route path='/cf-revenue-per-available-seatday-revpasday-opti' element={<CfRevenuePerAvailableSeatdayRevpasdayOpti />} />
          <Route path='/cf-snow-conditions-forecasting' element={<CfSnowConditionsForecasting />} />
          <Route path='/cf-demandbased-staffing' element={<CfDemandbasedStaffing />} />
          <Route path='/cf-guest-experience-personalization' element={<CfGuestExperiencePersonalization />} />
          <Route path='/cf-maintenance-predictive-scheduling' element={<CfMaintenancePredictiveScheduling />} />
          <Route path='/cf-dynamic-dining-recommendations' element={<CfDynamicDiningRecommendations />} />
          <Route path='/gap-no-occupancyforecast-for-resort-busyness' element={<GapNoOccupancyforecastForResortBusyness />} />
          <Route path='/gap-no-revenueoptimization-bundle-pricing' element={<GapNoRevenueoptimizationBundlePricing />} />
          <Route path='/gap-no-avalancheriskassessment-ml' element={<GapNoAvalancheriskassessmentMl />} />
          <Route path='/gap-no-equipmentmaintenancescheduling-ai' element={<GapNoEquipmentmaintenanceschedulingAi />} />
          <Route path='/gap-no-instructorscheduling-demand-matching' element={<GapNoInstructorschedulingDemandMatching />} />
          <Route path='/gap-no-churnprediction-returning-guest-likelihoo' element={<GapNoChurnpredictionReturningGuestLikelihoo />} />
          <Route path='/gap-no-realtime-lift-line-wait-estimation' element={<GapNoRealtimeLiftLineWaitEstimation />} />
          <Route path='/gap-no-public-online-lesson-booking-widget' element={<GapNoPublicOnlineLessonBookingWidget />} />
          <Route path='/gap-no-food-ordering-pos-integration' element={<GapNoFoodOrderingPosIntegration />} />
          <Route path='/gap-limited-weather-api-integration-stations-are' element={<GapLimitedWeatherApiIntegrationStationsAre />} />
          <Route path='/gap-no-lift-ticket-pos-integration' element={<GapNoLiftTicketPosIntegration />} />
          <Route path='/gap-no-guest-mobile-app-companion' element={<GapNoGuestMobileAppCompanion />} />
          <Route path='/gap-no-notificationssms-for-guests' element={<GapNoNotificationssmsForGuests />} />
          {/* === End Batch 07 === */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
