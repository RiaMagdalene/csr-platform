import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import { getDistricts } from "../api";
import "leaflet/dist/leaflet.css";

function MapResizeFix() {
  const map = useMap();

  useEffect(() => {
    const resizeMap = () => {
      map.invalidateSize();
    };

    const timer = setTimeout(resizeMap, 150);

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(map.getContainer());

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

function getGapColor(score) {
  if (score >= 0.7) return "#e53935";
  if (score >= 0.45) return "#f4c430";
  return "#43a047";
}

function MapView({ onDistrictSelect }) {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDistricts() {
      try {
        setLoading(true);
        setError("");

        const data = await getDistricts();
        setDistricts(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load district data.");
      } finally {
        setLoading(false);
      }
    }

    loadDistricts();
  }, []);

  const sortedDistricts = useMemo(() => {
    return [...districts].sort(
      (a, b) => (b.gap_score || 0) - (a.gap_score || 0)
    );
  }, [districts]);

  if (loading) {
    return (
      <div className="map-loading">
        <div className="loading-line"></div>
        <strong>LOADING DISTRICT DATA</strong>
        <span>Fetching the Tamil Nadu pilot dataset...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-error">
        <strong>MAP DATA UNAVAILABLE</strong>
        <span>{error}</span>

        <button onClick={() => window.location.reload()}>
          RETRY →
        </button>
      </div>
    );
  }

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[11.1271, 78.6569]}
        zoom={7}
        minZoom={6}
        maxZoom={12}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <MapResizeFix />

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {districts.map((district) => {
          const gap = district.gap_score || 0;

          return (
            <CircleMarker
              key={district.id}
              center={[district.lat, district.lng]}
              radius={9 + gap * 10}
              pathOptions={{
                color: "#111111",
                fillColor: getGapColor(gap),
                fillOpacity: 0.8,
                weight: 2,
              }}
              eventHandlers={{
                click: () => onDistrictSelect?.(district),
              }}
            >
              {/* HOVER PANEL */}
              <Tooltip
                direction="top"
                offset={[0, -8]}
                opacity={1}
                permanent={false}
                className="district-hover-tooltip"
              >
                <div className="hover-panel">
                  <div className="hover-panel-kicker">
                    DISTRICT SIGNAL
                  </div>

                  <div className="hover-panel-name">
                    {district.name}
                  </div>

                  <div className="hover-panel-stats">
                    <div>
                      <span>NEED</span>
                      <strong>
                        {Number(district.need_index || 0).toFixed(0)}
                      </strong>
                    </div>

                    <div>
                      <span>GAP</span>
                      <strong>
                        {(gap * 100).toFixed(0)}%
                      </strong>
                    </div>

                    <div>
                      <span>CSR</span>
                      <strong>
                        ₹
                        {Number(
                          district.csr_spend || 0
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>
              </Tooltip>

              {/* CLICK PANEL */}
              <Popup>
                <div className="map-popup">
                  <div className="popup-kicker">
                    DISTRICT SIGNAL
                  </div>

                  <h3>{district.name}</h3>

                  <div className="popup-grid">
                    <div>
                      <span>NEED INDEX</span>
                      <strong>{district.need_index}</strong>
                    </div>

                    <div>
                      <span>GAP SCORE</span>
                      <strong>
                        {(district.gap_score * 100).toFixed(0)}%
                      </strong>
                    </div>

                    <div>
                      <span>CSR SPEND</span>
                      <strong>
                        ₹
                        {Number(
                          district.csr_spend
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="map-overlay">
        <div className="map-overlay-title">
          OPPORTUNITY GAP
        </div>

        <div className="map-overlay-item">
          <span className="legend-dot high"></span>
          <span>HIGH</span>
          <strong>≥ 70%</strong>
        </div>

        <div className="map-overlay-item">
          <span className="legend-dot medium"></span>
          <span>MEDIUM</span>
          <strong>45–69%</strong>
        </div>

        <div className="map-overlay-item">
          <span className="legend-dot low"></span>
          <span>LOW</span>
          <strong>&lt; 45%</strong>
        </div>
      </div>

      <div className="map-count">
        <strong>{districts.length}</strong>
        <span>DISTRICTS MAPPED</span>
      </div>

      <div className="map-ranking">
        <div className="ranking-header">
          <span>TOP OPPORTUNITIES</span>
          <span>GAP</span>
        </div>

        {sortedDistricts.slice(0, 5).map((district, index) => (
          <button
            key={district.id}
            className="ranking-row"
            onClick={() => onDistrictSelect?.(district)}
          >
            <span className="ranking-number">
              0{index + 1}
            </span>

            <span className="ranking-name">
              {district.name}
            </span>

            <strong>
              {(district.gap_score * 100).toFixed(0)}%
            </strong>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MapView;