import React, { useEffect, useState } from 'react';
import { MapContainer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AfricaMap.css';

// Fix Leaflet's default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface TargetAchievementData {
  status: "met" | "close" | "moderate" | "far";
  percentBelow: number;
}

interface AfricaMapProps {
  data: { [country: string]: TargetAchievementData };
  title: string;
}

const AfricaMap: React.FC<AfricaMapProps> = ({ data, title }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Name mapping: GeoJSON name -> Our data name
  const nameMapping: { [key: string]: string } = {
    // GeoJSON names -> Our data names
    'Tanzania': 'United Republic of Tanzania',
    'United Republic of Tanzania': 'United Republic of Tanzania',
    'Congo': 'Congo',
    'Republic of Congo': 'Congo',
    'Dem. Rep. Congo': 'Democratic Republic of the Congo',
    'Democratic Republic of Congo': 'Democratic Republic of the Congo',
    'Democratic Republic of the Congo': 'Democratic Republic of the Congo',
    'Ivory Coast': 'Côte d\'Ivoire',
    'Côte d\'Ivoire': 'Côte d\'Ivoire',
    'Cote d\'Ivoire': 'Côte d\'Ivoire',
    'Swaziland': 'Eswatini',
    'eSwatini': 'Eswatini',
    'Eswatini': 'Eswatini',
    'Cape Verde': 'Cabo Verde',
    'Cabo Verde': 'Cabo Verde',
    'São Tomé and Príncipe': 'Sao Tome and Principe',
    'Sao Tome and Principe': 'Sao Tome and Principe',
    'São Tomé and Principe': 'Sao Tome and Principe',
    'Sao Tome & Principe': 'Sao Tome and Principe',
    'Seychelles': 'Seychelles',
    'Mauritius': 'Mauritius',
    'Comoros': 'Comoros',
    'Guinea-Bissau': 'Guinea-Bissau',
    'Guinea Bissau': 'Guinea-Bissau',
    // Additional variations
    'Republic of the Congo': 'Congo',
    'Central African Rep.': 'Central African Republic',
    'Eq. Guinea': 'Equatorial Guinea',
    'S. Sudan': 'South Sudan',
    'South Sudan': 'South Sudan',
    'W. Sahara': 'Western Sahara',
    'The Gambia': 'Gambia',
    'Gambia': 'Gambia'
  };

  const getTargetStatus = (geoCountryName: string): TargetAchievementData | null => {
    // Special case: Western Sahara uses Morocco's data
    if (geoCountryName.toLowerCase().includes('sahara') ||
        geoCountryName.toLowerCase().includes('w. sahara')) {
      return data['Morocco'] || null;
    }

    // Direct match (case-insensitive)
    const directMatch = Object.keys(data).find(key => key.toLowerCase() === geoCountryName.toLowerCase());
    if (directMatch) return data[directMatch];

    // Try forward mapping (GeoJSON -> Our data)
    if (nameMapping[geoCountryName] && data[nameMapping[geoCountryName]]) {
      return data[nameMapping[geoCountryName]];
    }

    // Try reverse mapping (Our data -> GeoJSON)
    const reverseMatch = Object.entries(nameMapping).find(([_, value]) =>
      value.toLowerCase() === geoCountryName.toLowerCase()
    );
    if (reverseMatch && data[reverseMatch[0]]) {
      return data[reverseMatch[0]];
    }

    return null;
  };

  useEffect(() => {
    // Use a more comprehensive GeoJSON source that includes all African countries
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch GeoJSON');
        return response.json();
      })
      .then(worldData => {
        // Exact list of 54 African countries we have data for
        const africanCountriesExact = [
          'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi',
          'Cabo Verde', 'Cameroon', 'Central African Republic', 'Chad', 'Comoros',
          'Congo', 'Côte d\'Ivoire', 'Democratic Republic of the Congo', 'Djibouti',
          'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia',
          'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Kenya',
          'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali',
          'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
          'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Principe', 'Senegal',
          'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan',
          'Sudan', 'Togo', 'Tunisia', 'Uganda', 'United Republic of Tanzania',
          'Zambia', 'Zimbabwe'
        ];

        // Additional territories to include (to fill gaps on map)
        const additionalTerritories = ['Western Sahara', 'W. Sahara'];

        const africanFeatures = worldData.features.filter((feature: any) => {
          const geoName = feature.properties.ADMIN || feature.properties.name || feature.properties.NAME;
          // Must match our data to be included
          const hasData = getTargetStatus(geoName) !== null;
          // Or must be in our exact list of countries
          const isInList = africanCountriesExact.some(country =>
            country.toLowerCase() === geoName.toLowerCase() ||
            nameMapping[geoName]?.toLowerCase() === country.toLowerCase()
          );
          // Or must be in additional territories list
          const isAdditionalTerritory = additionalTerritories.some(territory =>
            geoName.toLowerCase().includes(territory.toLowerCase()) ||
            territory.toLowerCase().includes(geoName.toLowerCase())
          );
          return hasData || isInList || isAdditionalTerritory;
        });


        setGeoData({
          type: 'FeatureCollection',
          features: africanFeatures
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading GeoJSON:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [data]);

  const getColor = (status: string): string => {
    switch (status) {
      case 'met': return '#059669';      // Green - Meeting target
      case 'close': return '#fbbf24';    // Yellow - 0-20% below
      case 'moderate': return '#f97316'; // Orange - 20-50% below
      case 'far': return '#dc2626';      // Red - >50% below
      default: return '#cccccc';         // Grey - No data
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'met': return 'Meeting Target';
      case 'close': return 'Close to Target';
      case 'moderate': return 'Moderate Gap';
      case 'far': return 'Far from Target';
      default: return 'No data';
    }
  };

  // Calculate status counts from actual data
  const calculateStatusCounts = () => {
    const counts = {
      met: 0,
      close: 0,
      moderate: 0,
      far: 0
    };

    Object.values(data).forEach((countryData) => {
      if (countryData.status in counts) {
        counts[countryData.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = calculateStatusCounts();

  const style = (feature: any) => {
    const countryName = feature.properties.ADMIN || feature.properties.name || feature.properties.NAME;
    const targetData = getTargetStatus(countryName);
    const fillColor = targetData ? getColor(targetData.status) : '#cccccc';

    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 1,
      color: fillColor, // Stroke matches fill to cover gaps
      fillOpacity: 1.0,
      stroke: true,
      fill: true,
      interactive: true
    } as L.PathOptions;
  };

  const onEachFeature = (feature: any, layer: any) => {
    const countryName = feature.properties.ADMIN || feature.properties.name || feature.properties.NAME;
    const targetData = getTargetStatus(countryName);

    // Check if this is Western Sahara - display as Morocco
    const isWesternSahara = countryName.toLowerCase().includes('sahara') ||
                            countryName.toLowerCase().includes('w. sahara');

    if (targetData) {
      const statusLabel = getStatusLabel(targetData.status);
      const gapText = targetData.percentBelow > 0
        ? `<br/>${targetData.percentBelow.toFixed(1)}% below threshold`
        : '<br/>Threshold met!';

      // For Western Sahara, show Morocco's name in the popup
      const displayName = isWesternSahara ? 'Morocco' : countryName;

      layer.bindPopup(
        `<strong>${displayName}</strong><br/>${statusLabel}${gapText}`
      );
    } else {
      layer.bindPopup(`<strong>${countryName}</strong><br/>No data`);
    }
  };

  if (loading) {
    return <div className="map-loading">Loading map data...</div>;
  }

  if (error) {
    return <div className="map-error">Error loading map: {error}</div>;
  }

  if (!geoData || geoData.features.length === 0) {
    return <div className="map-error">No map data available</div>;
  }

  return (
    <div className="africa-map-container">
      <h3>{title}</h3>
      <MapContainer
        center={[0, 20]}
        zoom={3}
        style={{ height: '500px', width: '100%', backgroundColor: '#f8fafc' }}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        {/* Tile layer removed to eliminate white background showing through gaps */}
        <GeoJSON
          data={geoData}
          style={style}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      <div className="map-legend">
        <h4>Target Achievement Status</h4>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#059669'}}></span>
          Meeting Target ({statusCounts.met} {statusCounts.met === 1 ? 'country' : 'countries'})
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#fbbf24'}}></span>
          Close: 0-20% gap ({statusCounts.close} {statusCounts.close === 1 ? 'country' : 'countries'})
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#f97316'}}></span>
          Moderate: 20-50% gap ({statusCounts.moderate} {statusCounts.moderate === 1 ? 'country' : 'countries'})
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#dc2626'}}></span>
          Far: &gt;50% gap ({statusCounts.far} {statusCounts.far === 1 ? 'country' : 'countries'})
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{backgroundColor: '#cccccc'}}></span>
          No data
        </div>
      </div>
    </div>
  );
};

export default AfricaMap;
