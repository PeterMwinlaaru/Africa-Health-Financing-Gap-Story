import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api, { HealthData, Metadata } from '../../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [masterData, setMasterData] = useState<HealthData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [metadataRes, dataRes] = await Promise.all([
        api.getMetadata(),
        api.getMasterData()
      ]);
      setMetadata(metadataRes);
      setMasterData(dataRes);
      setSelectedYear(metadataRes.year_range[1]); // Latest year
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadChart = async (chartId: string, chartName: string) => {
    const chartElement = document.querySelector(`#${chartId} .recharts-wrapper`);
    if (!chartElement) {
      alert('Chart not found!');
      return;
    }

    try {
      const canvas = await html2canvas(chartElement as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `dashboard-${chartName}.png`;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error downloading chart:', err);
      alert('Failed to download chart. Please try again.');
    }
  };

  const handleDownloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${filename}.csv`;
    a.click();
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    }
  };

  const handleEmbed = async () => {
    const url = window.location.href;
    const embedCode = `<iframe src="${url}" width="100%" height="800" frameborder="0" style="border:0;" allowfullscreen></iframe>`;

    try {
      await navigator.clipboard.writeText(embedCode);
      alert('Embed code copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = embedCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Embed code copied to clipboard!');
    }
  };

  if (loading || !metadata) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner">Loading Health Financing Data...</div>
      </div>
    );
  }

  // Filter data by selected year and region
  const filteredData = masterData.filter(d =>
    d.year === selectedYear &&
    (selectedRegion === 'All' || d.Subregion === selectedRegion)
  );

  // Calculate key statistics
  const avgPublicHealthExp = filteredData.reduce((sum, d) =>
    sum + (d['Gov exp Health per capita'] || 0), 0) / filteredData.length;

  const avgUHC = filteredData.reduce((sum, d) =>
    sum + (d['Universal health coverage'] || 0), 0) / filteredData.length;

  const avgOOP = filteredData.reduce((sum, d) =>
    sum + (d['Out-of-pocket on health exp'] || 0), 0) / filteredData.length;

  const countriesMeetingAbuja = filteredData.filter(d =>
    d['Gov exp Health on budget'] >= 15).length;

  // Prepare time series data (all countries aggregated)
  const timeSeriesData = Object.values(
    masterData.reduce((acc: any, d) => {
      if (!acc[d.year]) {
        acc[d.year] = {
          year: d.year,
          count: 0,
          totalPublicExp: 0,
          totalUHC: 0,
          totalOOP: 0
        };
      }
      acc[d.year].count += 1;
      acc[d.year].totalPublicExp += d['Gov exp Health per capita'] || 0;
      acc[d.year].totalUHC += d['Universal health coverage'] || 0;
      acc[d.year].totalOOP += d['Out-of-pocket on health exp'] || 0;
      return acc;
    }, {})
  ).map((item: any) => ({
    year: item.year,
    publicHealthExp: (item.totalPublicExp / item.count).toFixed(2),
    uhcIndex: (item.totalUHC / item.count).toFixed(2),
    oopShare: (item.totalOOP / item.count).toFixed(2)
  })).sort((a, b) => a.year - b.year);

  // Prepare regional comparison data
  const regionalData = Object.entries(
    filteredData.reduce((acc: any, d) => {
      const region = d.Subregion;
      if (!acc[region]) {
        acc[region] = { region, count: 0, totalPublicExp: 0, totalUHC: 0 };
      }
      acc[region].count += 1;
      acc[region].totalPublicExp += d['Gov exp Health per capita'] || 0;
      acc[region].totalUHC += d['Universal health coverage'] || 0;
      return acc;
    }, {})
  ).map(([key, value]: [string, any]) => ({
    region: key,
    publicHealthExp: (value.totalPublicExp / value.count).toFixed(2),
    uhcIndex: (value.totalUHC / value.count).toFixed(2)
  }));

  // Prepare income category data
  const incomeData = Object.entries(
    filteredData.reduce((acc: any, d) => {
      const income = d.income;
      if (!acc[income]) {
        acc[income] = { income, count: 0 };
      }
      acc[income].count += 1;
      return acc;
    }, {})
  ).map(([key, value]: [string, any]) => ({
    name: key,
    value: value.count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Health Financing Gap Analysis Dashboard</h1>
        <p className="dashboard-subtitle">
          Comprehensive analysis of Africa's health financing landscape ({metadata.year_range[0]} - {metadata.year_range[1]})
        </p>
      </div>

      {/* Filters */}
      <div className="filters-container">
        <div className="filter-group">
          <label htmlFor="year-select">Year:</label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {Array.from(
              { length: metadata.year_range[1] - metadata.year_range[0] + 1 },
              (_, i) => metadata.year_range[0] + i
            ).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="region-select">Region:</label>
          <select
            id="region-select"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            <option value="All">All Regions</option>
            {Object.keys(metadata.subregions).map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Avg Public Health Expenditure</h3>
          <div className="stat-value">${avgPublicHealthExp.toFixed(2)}</div>
          <div className="stat-label">per capita</div>
        </div>
        <div className="stat-card">
          <h3>Avg UHC Index</h3>
          <div className="stat-value">{avgUHC.toFixed(1)}%</div>
          <div className="stat-label">Universal Health Coverage</div>
        </div>
        <div className="stat-card">
          <h3>Avg Out-of-Pocket Share</h3>
          <div className="stat-value">{avgOOP.toFixed(1)}%</div>
          <div className="stat-label">of health expenditure</div>
        </div>
        <div className="stat-card">
          <h3>Countries Meeting Abuja Target</h3>
          <div className="stat-value">{countriesMeetingAbuja}</div>
          <div className="stat-label">out of {filteredData.length} countries</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Time Series: Public Health Expenditure */}
        <div className="chart-container full-width" id="chart-public-health-exp">
          <h3>Public Health Expenditure Trends (All Countries Average)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="publicHealthExp"
                stroke="#8884d8"
                name="Public Health Exp ($/capita)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-controls" style={{ marginTop: '1rem' }}>
            <button onClick={() => handleDownloadChart('chart-public-health-exp', 'public-health-exp-trends')} className="btn-download-chart">
              📊 Download Chart (PNG)
            </button>
            <button onClick={() => handleDownloadCSV(timeSeriesData, 'public-health-exp-trends')} className="btn-download">
              📥 Download Data (CSV)
            </button>
            <button onClick={handleShare} className="btn-share">🔗 Share</button>
            <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
          </div>
        </div>

        {/* Time Series: UHC Index */}
        <div className="chart-container full-width" id="chart-uhc-index">
          <h3>Universal Health Coverage Index Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="uhcIndex"
                stroke="#82ca9d"
                name="UHC Index (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-controls" style={{ marginTop: '1rem' }}>
            <button onClick={() => handleDownloadChart('chart-uhc-index', 'uhc-index-trends')} className="btn-download-chart">
              📊 Download Chart (PNG)
            </button>
            <button onClick={() => handleDownloadCSV(timeSeriesData, 'uhc-index-trends')} className="btn-download">
              📥 Download Data (CSV)
            </button>
            <button onClick={handleShare} className="btn-share">🔗 Share</button>
            <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
          </div>
        </div>

        {/* Regional Comparison: Public Health Expenditure */}
        <div className="chart-container" id="chart-regional-public-health">
          <h3>Public Health Expenditure by Region ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="publicHealthExp" fill="#8884d8" name="$/capita" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-controls" style={{ marginTop: '1rem' }}>
            <button onClick={() => handleDownloadChart('chart-regional-public-health', 'regional-public-health-exp')} className="btn-download-chart">
              📊 Download Chart (PNG)
            </button>
            <button onClick={() => handleDownloadCSV(regionalData, 'regional-public-health-exp')} className="btn-download">
              📥 Download Data (CSV)
            </button>
            <button onClick={handleShare} className="btn-share">🔗 Share</button>
            <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
          </div>
        </div>

        {/* Regional Comparison: UHC Index */}
        <div className="chart-container" id="chart-regional-uhc">
          <h3>UHC Index by Region ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="uhcIndex" fill="#82ca9d" name="UHC Index (%)" />
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-controls" style={{ marginTop: '1rem' }}>
            <button onClick={() => handleDownloadChart('chart-regional-uhc', 'regional-uhc-index')} className="btn-download-chart">
              📊 Download Chart (PNG)
            </button>
            <button onClick={() => handleDownloadCSV(regionalData, 'regional-uhc-index')} className="btn-download">
              📥 Download Data (CSV)
            </button>
            <button onClick={handleShare} className="btn-share">🔗 Share</button>
            <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
          </div>
        </div>

        {/* Income Distribution */}
        <div className="chart-container" id="chart-income-distribution">
          <h3>Countries by Income Category ({selectedYear})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incomeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="chart-controls" style={{ marginTop: '1rem' }}>
            <button onClick={() => handleDownloadChart('chart-income-distribution', 'income-distribution')} className="btn-download-chart">
              📊 Download Chart (PNG)
            </button>
            <button onClick={() => handleDownloadCSV(incomeData, 'income-distribution')} className="btn-download">
              📥 Download Data (CSV)
            </button>
            <button onClick={handleShare} className="btn-share">🔗 Share</button>
            <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
          </div>
        </div>

        {/* OOP Trends */}
        <div className="chart-container" id="chart-oop-trends">
          <h3>Out-of-Pocket Expenditure Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="oopShare"
                stroke="#ff7300"
                name="OOP Share (%)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="chart-controls" style={{ marginTop: '1rem' }}>
            <button onClick={() => handleDownloadChart('chart-oop-trends', 'oop-trends')} className="btn-download-chart">
              📊 Download Chart (PNG)
            </button>
            <button onClick={() => handleDownloadCSV(timeSeriesData, 'oop-trends')} className="btn-download">
              📥 Download Data (CSV)
            </button>
            <button onClick={handleShare} className="btn-share">🔗 Share</button>
            <button onClick={handleEmbed} className="btn-embed">⚡ Embed</button>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Public Health Financing Gap</h4>
            <p>
              {filteredData.filter(d => d['Gov exp Health per capita More than Threshold'] === 0).length} countries
              ({((filteredData.filter(d => d['Gov exp Health per capita More than Threshold'] === 0).length / filteredData.length) * 100).toFixed(1)}%)
              are below the international health expenditure threshold in {selectedYear}.
            </p>
          </div>
          <div className="insight-card">
            <h4>Abuja Declaration Progress</h4>
            <p>
              Only {countriesMeetingAbuja} countries
              ({((countriesMeetingAbuja / filteredData.length) * 100).toFixed(1)}%)
              have met the Abuja Declaration target of allocating 15% of government budget to health.
            </p>
          </div>
          <div className="insight-card">
            <h4>Financial Protection</h4>
            <p>
              {filteredData.filter(d => d['Out-of-pocket on health exp'] > 20).length} countries
              have out-of-pocket health expenditure exceeding 20%, indicating weak financial protection for households.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
