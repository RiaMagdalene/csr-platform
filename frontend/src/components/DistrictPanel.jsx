import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import NgoCard from "./NgoCard";
import {
  getDistrictDetails,
  getDistrictMatches,
  getDistricts,
  getCsrMatches,
} from "../api";

const SECTORS = [
  "Education",
  "Healthcare",
  "Sanitation",
  "Livelihood",
  "Women & Child Development",
  "Environment",
];

const CAPACITY_OPTIONS = ["Small", "Medium", "Large"];

function DistrictPanel({ district, onClose }) {
  const [districtDetails, setDistrictDetails] = useState(null);
  const [matches, setMatches] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [targetDistrict, setTargetDistrict] = useState(
    district?.id || ""
  );
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [budget, setBudget] = useState("");
  const [requiredCapacity, setRequiredCapacity] =
    useState("Medium");

  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState("");
  const [matchMode, setMatchMode] = useState("district");

  useEffect(() => {
    async function loadDistricts() {
      try {
        const data = await getDistricts();
        setDistricts(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadDistricts();
  }, []);

  useEffect(() => {
    if (!district) return;

    setTargetDistrict(district.id);
    setMatchMode("district");
    setSelectedSectors([]);
    setBudget("");
    setRequiredCapacity("Medium");

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

  function toggleSector(sector) {
    setSelectedSectors((current) =>
      current.includes(sector)
        ? current.filter((item) => item !== sector)
        : [...current, sector]
    );
  }

  async function handleCsrMatch() {
    if (!targetDistrict) {
      setError("Please select a target district.");
      return;
    }

    if (!selectedSectors.length) {
      setError("Please select at least one CSR focus area.");
      return;
    }

    if (!budget || Number(budget) <= 0) {
      setError("Please enter a valid CSR budget.");
      return;
    }

    setMatching(true);
    setError("");
    setMatchMode("csr");

    try {
      const results = await getCsrMatches({
        target_district: targetDistrict,
        sectors: selectedSectors,
        budget: Number(budget),
        required_capacity: requiredCapacity,
      });

      setMatches(results);
    } catch (err) {
      console.error(err);
      setError(
        "Unable to generate CSR matches. Please try again."
      );
    } finally {
      setMatching(false);
    }
  }

  async function handleDistrictMatches() {
    if (!targetDistrict) return;

    setLoading(true);
    setError("");
    setMatchMode("district");

    try {
      const selected = districts.find(
        (item) => item.id === targetDistrict
      );

      if (selected) {
        const details = await getDistrictDetails(selected.id);
        setDistrictDetails(details);
      }

      const ngoMatches = await getDistrictMatches(
        targetDistrict
      );

      setMatches(ngoMatches);
    } catch (err) {
      console.error(err);
      setError("Unable to load district matches.");
    } finally {
      setLoading(false);
    }
  }

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
            CSR MATCHING
          </span>

          <h2>Find your NGO partner</h2>

          <p>
            Match CSR requirements with implementation
            organisations.
          </p>
        </div>
      </div>

      <section className="csr-form">
        <div className="section-label">
          01 / CSR REQUIREMENTS
        </div>

        <div className="form-field">
          <label htmlFor="target-district">
            TARGET DISTRICT
          </label>

          <select
            id="target-district"
            value={targetDistrict}
            onChange={(event) =>
              setTargetDistrict(event.target.value)
            }
          >
            <option value="">Select district</option>

            {districts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>CSR FOCUS AREAS</label>

          <div className="sector-options">
            {SECTORS.map((sector) => (
              <button
                key={sector}
                type="button"
                className={
                  selectedSectors.includes(sector)
                    ? "sector-option active"
                    : "sector-option"
                }
                onClick={() => toggleSector(sector)}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="csr-budget">
            AVAILABLE CSR BUDGET
          </label>

          <div className="budget-input">
            <span>₹</span>

            <input
              id="csr-budget"
              type="number"
              min="1"
              placeholder="10,00,000"
              value={budget}
              onChange={(event) =>
                setBudget(event.target.value)
              }
            />
          </div>

          <small>
            &lt; ₹5L Small · ₹5L–₹20L Medium · &gt; ₹20L Large
          </small>
        </div>

        <div className="form-field">
          <label htmlFor="required-capacity">
            REQUIRED NGO CAPACITY
          </label>

          <select
            id="required-capacity"
            value={requiredCapacity}
            onChange={(event) =>
              setRequiredCapacity(event.target.value)
            }
          >
            {CAPACITY_OPTIONS.map((capacity) => (
              <option key={capacity} value={capacity}>
                {capacity}
              </option>
            ))}
          </select>
        </div>

        <button
          className="csr-match-button"
          onClick={handleCsrMatch}
          disabled={matching}
        >
          {matching
            ? "MATCHING..."
            : "FIND NGO MATCHES →"}
        </button>

        {matchMode === "csr" && (
          <button
            className="district-reset-button"
            onClick={handleDistrictMatches}
            disabled={loading}
          >
            VIEW DISTRICT RECOMMENDATIONS
          </button>
        )}
      </section>

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
          {matchMode === "district" && (
            <section className="panel-section">
              <div className="section-label">
                02 / DISTRICT SIGNAL
              </div>

              <div className="district-metrics">
                <div>
                  <span>NEED INDEX</span>
                  <strong>
                    {districtDetails.need_index}
                  </strong>
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
                    {(
                      districtDetails.gap_score * 100
                    ).toFixed(0)}
                    %
                  </strong>
                </div>
              </div>

              <div className="section-label">
                TOP NEEDS
              </div>

              <div className="need-list">
                {districtDetails.top_needs?.map(
                  (need, index) => (
                    <div
                      className="need-row"
                      key={need}
                    >
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <strong>{need}</strong>
                    </div>
                  )
                )}
              </div>
            </section>
          )}

          <section className="panel-section ngo-section">
            <div className="ngo-section-header">
              <div>
                <div className="section-label">
                  {matchMode === "csr"
                    ? "02 / CSR NGO MATCHES"
                    : "03 / NGO MATCHING"}
                </div>

                <h3>
                  {matchMode === "csr"
                    ? "Best-fit implementation partners"
                    : "Recommended partners"}
                </h3>
              </div>

              <span className="match-count">
                {matches.length} FOUND
              </span>
            </div>

            {matchMode === "csr" && (
              <div className="match-method-note">
                Ranked using 30% geography · 30% sector ·
                20% budget · 20% capacity.
              </div>
            )}

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
                No matching organisations found.
              </div>
            )}
          </section>
        </>
      )}
    </motion.aside>
  );
}

export default DistrictPanel;