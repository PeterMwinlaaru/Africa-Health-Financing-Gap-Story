/**
 * API Service
 * ===========
 * Service layer for fetching data from the backend API
 */

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface HealthData {
    year: number;
    location: string;
    CountryISO3: string;
    Subregion: string;
    income: string;
    [key: string]: any;
}

export interface Metadata {
    generated_date: string;
    total_records: number;
    countries: string[];
    year_range: [number, number];
    income_categories: { [key: string]: number };
    subregions: { [key: string]: number };
    thresholds: any;
    indicators: { [key: string]: string[] };
}

export interface FilterParams {
    year?: number | number[];
    country?: string | string[];
    income?: string | string[];
    subregion?: string | string[];
}

class HealthFinancingAPI {
    // Health check
    async healthCheck() {
        const response = await api.get('/health');
        return response.data;
    }

    // Get metadata
    async getMetadata(): Promise<Metadata> {
        const response = await api.get<Metadata>('/metadata');
        return response.data;
    }

    // Get master dataset with optional filters
    async getMasterData(filters?: FilterParams): Promise<HealthData[]> {
        const response = await api.get<HealthData[]>('/data/master', { params: filters });
        return response.data;
    }

    // Get public health financing indicators
    async getPublicHealthFinancingIndicators() {
        const response = await api.get('/indicators/public-health-financing');
        return response.data;
    }

    // Get budget priority indicators
    async getBudgetPriorityIndicators() {
        const response = await api.get('/indicators/budget-priority');
        return response.data;
    }

    // Get financial protection indicators
    async getFinancialProtectionIndicators() {
        const response = await api.get('/indicators/financial-protection');
        return response.data;
    }

    // Get financing structure indicators
    async getFinancingStructureIndicators() {
        const response = await api.get('/indicators/financing-structure');
        return response.data;
    }

    // Get UHC indicators
    async getUHCIndicators() {
        const response = await api.get('/indicators/uhc');
        return response.data;
    }

    // Get health outcome indicators
    async getHealthOutcomeIndicators() {
        const response = await api.get('/indicators/health-outcomes');
        return response.data;
    }

    // Get cross-dimensional indicators
    async getCrossDimensionalIndicators() {
        const response = await api.get('/indicators/cross-dimensional');
        return response.data;
    }

    // Get fiscal space indicators
    async getFiscalSpaceIndicators() {
        const response = await api.get('/indicators/fiscal-space');
        return response.data;
    }

    // Get countries list
    async getCountries(): Promise<string[]> {
        const response = await api.get<string[]>('/countries');
        return response.data;
    }

    // Get years range
    async getYears(): Promise<[number, number]> {
        const response = await api.get<[number, number]>('/years');
        return response.data;
    }

    // Get income categories
    async getIncomeCategories(): Promise<{ [key: string]: number }> {
        const response = await api.get<{ [key: string]: number }>('/income-categories');
        return response.data;
    }

    // Get subregions
    async getSubregions(): Promise<{ [key: string]: number }> {
        const response = await api.get<{ [key: string]: number }>('/subregions');
        return response.data;
    }

    // Get country-specific data
    async getCountryData(countryName: string): Promise<HealthData[]> {
        const response = await api.get<HealthData[]>(`/country/${encodeURIComponent(countryName)}`);
        return response.data;
    }

    // Get year-specific data
    async getYearData(year: number): Promise<HealthData[]> {
        const response = await api.get<HealthData[]>(`/year/${year}`);
        return response.data;
    }

    // Generic method to fetch from any endpoint
    async fetchFromEndpoint(endpoint: string): Promise<any> {
        // Remove /api prefix if present since baseURL already includes it
        const cleanEndpoint = endpoint.startsWith('/api/') ? endpoint.substring(4) : endpoint;
        const response = await api.get(cleanEndpoint);
        return response.data;
    }
}

export default new HealthFinancingAPI();
