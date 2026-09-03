import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NgoCard from "./NgoCard";
import {
  getDistrictDetails,
  getDistrictMatches,
} from "../api";

function DistrictPanel({ district, onClose }) {
  const [districtDetails, setDistrictDetails] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!district) return;

    async function loadDistrictData() {
      setLoading(true);
      setError("");
      setDistrictDetails(null);
      setMatches([]);

      try {
        const [details, ngoMatches] = await Promise.all([
          getDistrictDetails(district.id),
          getDistrictMatches(district.id),
        ]);

        setDistrictDetails(details);
        setMatches(ngoMatches);
      } catch (err) {
        console.error(err);
        setError("Unable to load district data.");
      } finally {
        setLoading(false);
      }
    }

    loadDistrictData();
  }, [district]);

  if (!district) return null;

  return (
    <motion.aside
      className="district-panel"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        className="panel-close"
        onClick={onClose}
        aria-label="Close district panel"
      >
        ×
      </button>

      <div className="panel-header">
        <div>
          <span className="panel-kicker">
            DISTRICT PROFILE
          </span>

          <h2>{district.name}</h2>

          <p>
            Tamil Nadu · Opportunity analysis
          </p>
        </div>
      </div>

      {loading && (
        <div className="panel-loading">
          <div className="loading-line"></div>
          <strong>LOADING ANALYSIS</strong>
        </div>
      )}

      {error && (
        <div className="panel-error">
          {error}
        </div>
      )}

      {!loading && !error && districtDetails && (
        <>
          <div className="district-metrics">
            <div>
              <span>NEED INDEX</span>
              <strong>{districtDetails.need_index}</strong>
              <small>/ 100</small>
            </div>

            <div>
              <span>CSR SPEND</span>
              <strong>
                ₹
                {Number(
                  districtDetails.csr_spend
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>GAP SCORE</span>
              <strong>
                {(districtDetails.gap_score * 100).toFixed(0)}%
              </strong>
            </div>
          </div>

          <section className="panel-section">
            <div className="section-label">
              01 / TOP NEEDS
            </div>

            <div className="need-list">
              {districtDetails.top_needs?.map(
                (need, index) => (
                  <div
                    className="need-row"
                    key={need}
                  >
                    <span>
                      0{index + 1}
                    </span>

                    <strong>{need}</strong>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="panel-section ngo-section">
            <div className="ngo-section-header">
              <div>
                <div className="section-label">
                  02 / NGO MATCHING
                </div>

                <h3>
                  Recommended partners
                </h3>
              </div>

              <span className="match-count">
                {matches.length} FOUND
              </span>
            </div>

            <div className="ngo-list">
              {matches.map((ngo, index) => (
                <NgoCard
                  key={`${ngo.ngo_name}-${index}`}
                  ngo={ngo}
                  rank={index + 1}
                />
              ))}
            </div>

            {!matches.length && (
              <div className="empty-matches">
                No matching organisations found
                for this district.
              </div>
            )}
          </section>
        </>
      )}
    </motion.aside>
  );
}

export default DistrictPanel;