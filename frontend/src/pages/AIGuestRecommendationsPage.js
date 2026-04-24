import React from 'react';
import AIFeaturePage from '../components/AIFeaturePage';
import { aiFeatures } from '../config/aiFeatures';

const AIGuestRecommendationsPage = () => <AIFeaturePage config={aiFeatures.guestRecommendations} />;
export default AIGuestRecommendationsPage;
