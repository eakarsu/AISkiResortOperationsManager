import React from 'react';
import FeaturePage from '../components/FeaturePage';
import { features } from '../config/features';

const WeatherStationsPage = () => <FeaturePage config={features.weatherStations} />;
export default WeatherStationsPage;
