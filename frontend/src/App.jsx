import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MapView from "./components/MapView";
import DistrictPanel from "./components/DistrictPanel";
import NgoCard from "./components/NgoCard";
import { getDistricts, getCsrMatches } from "./api";
import "./index.css";

const SECTORS = [
  "Education",
  "Healthcare",
  "Sanitation",
  "Livelihood",
  "Women & Child Development",
  "Environment",
];

const CAPACITY_OPTIONS = ["Small", "Medium", "Large"];

function App() {
  const [activePage, setActivePage] = useState("home");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const [targetDistrict, setTargetDistrict] = useState("");
  const [selectedSectors, setSelectedSectors] = useState([]);
  const [budget, setBudget] = useState("");
  const [requiredCapacity, setRequiredCapacity] =
    useState("Medium");

  const [matches, setMatches] = useState([]);
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const data = await getDistricts();
        setDistricts(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadDistricts();
  }, []);

  const highestGap = useMemo(() => {
    if (!districts.length) return null;

    return [...districts].sort(
      (a, b) =>
        (b.gap_score || 0) -
        (a.gap_score || 0)
    )[0];
  }, [districts]);

  const averageNeed = useMemo(() => {
    if (!districts.length) return 0;

    return Math.round(
      districts.reduce(
        (sum, district) =>
          sum + Number(district.need_index || 0),
        0
      ) / districts.length
    );
  }, [districts]);

  const totalCSR = useMemo(() => {
    return districts.reduce(
      (sum, district) =>
        sum + Number(district.csr_spend || 0),
      0
    );
  }, [districts]);

  function navigate(page) {
    setActivePage(page);
    setSelectedDistrict(null);

    if (page !== "matching") {
      setMatches([]);
      setHasSearched(false);
      setMatchError("");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleDistrictSelect(district) {
    setSelectedDistrict(district);
  }

  function toggleSector(sector) {
    setSelectedSectors((current) =>
      current.includes(sector)
        ? current.filter((item) => item !== sector)
        : [...current, sector]
    );
  }

  async function handleCsrMatch() {
    if (!targetDistrict) {
      setMatchError("Please select a target district.");
      return;
    }

    if (!selectedSectors.length) {
      setMatchError(
        "Please select at least one CSR focus area."
      );
      return;
    }

    if (!budget || Number(budget) <= 0) {
      setMatchError("Please enter a valid CSR budget.");
      return;
    }

    setMatching(true);
    setMatchError("");
    setHasSearched(false);

    try {
      const results = await getCsrMatches({
        target_district: targetDistrict,
        sectors: selectedSectors,
        budget: Number(budget),
        required_capacity: requiredCapacity,
      });

      setMatches(results);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      setMatchError(
        "Unable to generate CSR matches. Please try again."
      );
    } finally {
      setMatching(false);
    }
  }

  function clearMatching() {
    setTargetDistrict("");
    setSelectedSectors([]);
    setBudget("");
    setRequiredCapacity("Medium");
    setMatches([]);
    setMatchError("");
    setHasSearched(false);
  }

  return (
    <div className="app">
      {/* HEADER */}

      <header className="site-header">
        <button
          className="brand"
          onClick={() => navigate("home")}
        >
          <span className="brand-name">
            ATLAS
          </span>

          <span className="brand-sub">
            CSR INTELLIGENCE
          </span>
        </button>

        <nav>
          <button
            className={
              activePage === "home"
                ? "active"
                : ""
            }
            onClick={() => navigate("home")}
          >
            Overview
          </button>

          <button
            className={
              activePage === "map"
                ? "active"
                : ""
            }
            onClick={() => navigate("map")}
          >
            Need Map
          </button>

          <button
            className={
              activePage === "matching"
                ? "active"
                : ""
            }
            onClick={() => navigate("matching")}
          >
            NGO Matching
          </button>

          <button
            className={
              activePage === "insights"
                ? "active"
                : ""
            }
            onClick={() => navigate("insights")}
          >
            Insights
          </button>

          <button
            className={
              activePage === "methodology"
                ? "active"
                : ""
            }
            onClick={() => navigate("methodology")}
          >
            Methodology
          </button>
        </nav>

        <div className="header-status">
          <span></span>
          PILOT / TAMIL NADU
        </div>
      </header>

      <main>
        {/* HOME */}

        {activePage === "home" && (
          <motion.section
            className="home-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="home-hero">
              <div className="hero-left">
                <div className="eyebrow">
                  01 / CSR INTELLIGENCE PLATFORM
                </div>

                <h1>
                  DIRECT
                  <br />
                  CAPITAL
                  <br />
                  <em>WHERE IT MATTERS.</em>
                </h1>

                <p className="hero-description">
                  ATLAS turns district-level need,
                  CSR allocation and NGO capability
                  into an actionable intelligence layer
                  for corporate social investment.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() =>
                      navigate("map")
                    }
                  >
                    EXPLORE NEED MAP
                    <span>→</span>
                  </button>

                  <button
                    className="text-button"
                    onClick={() =>
                      navigate("methodology")
                    }
                  >
                    HOW IT WORKS
                    <span>↗</span>
                  </button>
                </div>
              </div>

              <div className="hero-right">
                <div className="hero-index">
                  <span>LIVE PILOT</span>
                  <strong>
                    {districts.length || "20"}
                  </strong>
                  <small>DISTRICTS</small>
                </div>

                <div className="hero-index dark">
                  <span>AVG NEED INDEX</span>
                  <strong>
                    {averageNeed || "—"}
                  </strong>
                  <small>0—100 SCALE</small>
                </div>
              </div>
            </div>

            <div className="data-strip">
              <div>
                <span>DISTRICTS MAPPED</span>
                <strong>
                  {districts.length || "20"}
                </strong>
              </div>

              <div>
                <span>AVERAGE NEED</span>
                <strong>
                  {averageNeed || "—"}
                </strong>
              </div>

              <div>
                <span>CSR ALLOCATION</span>
                <strong>
                  ₹
                  {totalCSR
                    ? totalCSR.toLocaleString(
                        "en-IN"
                      )
                    : "—"}
                </strong>
              </div>

              <div>
                <span>HIGHEST GAP</span>
                <strong>
                  {highestGap
                    ? `${highestGap.name} / ${(
                        highestGap.gap_score *
                        100
                      ).toFixed(0)}%`
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="home-explain">
              <div className="explain-number">
                01
              </div>

              <div>
                <div className="eyebrow">
                  FROM DATA TO DECISION
                </div>

                <h2>
                  Find the places where
                  <br />
                  <em>need meets opportunity.</em>
                </h2>
              </div>

              <p>
                ATLAS is designed to make CSR
                planning more targeted and
                explainable. Explore district
                signals, identify opportunity gaps,
                and discover NGOs whose geography,
                sector and capacity align with the
                need.
              </p>
            </div>

            <div className="home-cards">
              <article>
                <span>01</span>
                <h3>DISCOVER</h3>
                <p>
                  Map district-level development
                  signals across the Tamil Nadu pilot.
                </p>
              </article>

              <article>
                <span>02</span>
                <h3>PRIORITIZE</h3>
                <p>
                  Surface areas where high need and
                  relatively lower CSR allocation
                  create greater opportunity.
                </p>
              </article>

              <article>
                <span>03</span>
                <h3>PLAN</h3>
                <p>
                  Connect priority districts with
                  organisations capable of delivering
                  locally relevant work.
                </p>
              </article>

              <article>
                <span>04</span>
                <h3>TRACK</h3>
                <p>
                  Build toward future impact goals,
                  watchlists and portfolio-level
                  planning.
                </p>
              </article>
            </div>
          </motion.section>
        )}

        {/* MAP */}

        {activePage === "map" && (
          <motion.section
            className="map-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="map-heading">
              <div>
                <div className="eyebrow">
                  02 / NEED MAP
                </div>

                <h1>
                  WHERE IS THE
                  <br />
                  <em>OPPORTUNITY?</em>
                </h1>
              </div>

              <div className="map-heading-copy">
                <p>
                  Explore the 20-district Tamil Nadu
                  pilot. Larger markers indicate
                  higher calculated opportunity gaps.
                </p>

                <span>
                  CLICK A DISTRICT TO INSPECT
                </span>
              </div>
            </div>

            <div className="map-container">
              <MapView
                onDistrictSelect={
                  handleDistrictSelect
                }
              />
            </div>

            <div className="map-data-bar">
              <div>
                <span>MODEL</span>
                <strong>
                  NEED × ALLOCATION
                </strong>
              </div>

              <div>
                <span>GEOGRAPHY</span>
                <strong>
                  TAMIL NADU
                </strong>
              </div>

              <div>
                <span>DATA POINTS</span>
                <strong>
                  {districts.length || "20"} DISTRICTS
                </strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>
                  PILOT DATASET
                </strong>
              </div>
            </div>
          </motion.section>
        )}

        {/* MATCHING */}

        {activePage === "matching" && (
          <motion.section
            className="matching-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="matching-top">
              <div>
                <div className="eyebrow">
                  03 / NGO MATCHING
                </div>

                <h1>
                  FIND THE RIGHT
                  <br />
                  <em>IMPLEMENTER.</em>
                </h1>
              </div>

              <div className="matching-intro">
                <p>
                  Tell ATLAS what your CSR programme
                  needs. The platform ranks implementation
                  partners using four transparent
                  compatibility signals.
                </p>

                <div className="matching-factors">
                  <span>
                    <b>01</b> GEOGRAPHY
                  </span>

                  <span>
                    <b>02</b> SECTOR
                  </span>

                  <span>
                    <b>03</b> BUDGET
                  </span>

                  <span>
                    <b>04</b> CAPACITY
                  </span>
                </div>
              </div>
            </div>

            <div className="csr-form matching-form">
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
                    setTargetDistrict(
                      event.target.value
                    )
                  }
                >
                  <option value="">
                    Select district
                  </option>

                  {districts.map((district) => (
                    <option
                      key={district.id}
                      value={district.id}
                    >
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>
                  CSR FOCUS AREAS
                </label>

                <div className="sector-options">
                  {SECTORS.map((sector) => (
                    <button
                      key={sector}
                      type="button"
                      className={
                        selectedSectors.includes(
                          sector
                        )
                          ? "sector-option active"
                          : "sector-option"
                      }
                      onClick={() =>
                        toggleSector(sector)
                      }
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
                      setBudget(
                        event.target.value
                      )
                    }
                  />
                </div>

                <small>
                  &lt; ₹5L Small · ₹5L–₹20L Medium ·
                  &gt; ₹20L Large
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
                    setRequiredCapacity(
                      event.target.value
                    )
                  }
                >
                  {CAPACITY_OPTIONS.map(
                    (capacity) => (
                      <option
                        key={capacity}
                        value={capacity}
                      >
                        {capacity}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="matching-form-actions">
                <button
                  className="csr-match-button"
                  onClick={handleCsrMatch}
                  disabled={matching}
                >
                  {matching
                    ? "MATCHING..."
                    : "FIND NGO MATCHES →"}
                </button>

                {(hasSearched ||
                  targetDistrict ||
                  selectedSectors.length ||
                  budget) && (
                  <button
                    className="district-reset-button"
                    onClick={clearMatching}
                    disabled={matching}
                  >
                    CLEAR REQUIREMENTS
                  </button>
                )}
              </div>

              {matchError && (
                <div className="panel-error">
                  {matchError}
                </div>
              )}
            </div>

            <div className="matching-results">
              {matching && (
                <div className="panel-loading">
                  <div className="loading-line"></div>
                  <strong>
                    CALCULATING BEST-FIT PARTNERS
                  </strong>
                </div>
              )}

              {!matching &&
                hasSearched &&
                !matchError && (
                  <section className="panel-section ngo-section">
                    <div className="ngo-section-header">
                      <div>
                        <div className="section-label">
                          02 / CSR NGO MATCHES
                        </div>

                        <h3>
                          Best-fit implementation
                          partners
                        </h3>
                      </div>

                      <span className="match-count">
                        {matches.length} FOUND
                      </span>
                    </div>

                    <div className="match-method-note">
                      Ranked using 30% geography ·
                      30% sector · 20% budget ·
                      20% capacity.
                    </div>

                    <div className="ngo-list">
                      {matches.map(
                        (ngo, index) => (
                          <NgoCard
                            key={`${ngo.ngo_name}-${index}`}
                            ngo={ngo}
                            rank={index + 1}
                          />
                        )
                      )}
                    </div>

                    {!matches.length && (
                      <div className="empty-matches">
                        No matching organisations found.
                      </div>
                    )}
                  </section>
                )}

              {!matching && !hasSearched && (
                <div className="matching-empty">
                  <span>
                    ENTER CSR REQUIREMENTS
                  </span>

                  <strong>
                    Your NGO recommendations
                    <br />
                    will appear here.
                  </strong>

                  <p>
                    Choose a target district, select
                    your CSR focus areas, enter the
                    available budget and define the
                    required organisational capacity.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {/* INSIGHTS */}

        {activePage === "insights" && (
          <motion.section
            className="insights-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="insights-header">
              <div>
                <div className="eyebrow">
                  04 / INSIGHTS
                </div>

                <h1>
                  READ THE
                  <br />
                  <em>SIGNAL.</em>
                </h1>
              </div>

              <p>
                ATLAS converts raw district data into
                decision-oriented signals. These
                summaries show what the pilot can
                surface before deeper portfolio
                planning is introduced.
              </p>
            </div>

            <div className="insight-numbers">
              <div>
                <span>01</span>
                <strong>
                  {districts.length || 20}
                </strong>
                <p>
                  DISTRICTS IN THE PILOT
                </p>
              </div>

              <div>
                <span>02</span>
                <strong>
                  {averageNeed || "—"}
                </strong>
                <p>
                  AVERAGE NEED INDEX
                </p>
              </div>

              <div>
                <span>03</span>
                <strong>
                  {highestGap
                    ? `${(
                        highestGap.gap_score *
                        100
                      ).toFixed(0)}%`
                    : "—"}
                </strong>
                <p>
                  HIGHEST OPPORTUNITY GAP
                </p>
              </div>
            </div>

            <div className="insight-grid">
              <article>
                <div className="insight-card-number">
                  01
                </div>

                <div>
                  <h3>
                    NEED IS NOT THE
                    <br />
                    SAME AS SPEND.
                  </h3>

                  <p>
                    A district can have a high
                    development need while receiving
                    comparatively more or less CSR
                    allocation. ATLAS keeps these
                    signals separate before combining
                    them into the opportunity-gap
                    calculation.
                  </p>
                </div>
              </article>

              <article>
                <div className="insight-card-number">
                  02
                </div>

                <div>
                  <h3>
                    PROXIMITY MATTERS
                    <br />
                    TO IMPLEMENTATION.
                  </h3>

                  <p>
                    NGO matching rewards geographic
                    proximity because organisations
                    operating closer to a district can
                    be more directly aligned with local
                    implementation requirements.
                  </p>
                </div>
              </article>

              <article>
                <div className="insight-card-number">
                  03
                </div>

                <div>
                  <h3>
                    SECTOR ALIGNMENT
                    <br />
                    REDUCES GUESSWORK.
                  </h3>

                  <p>
                    Matching compares district needs
                    with NGO sectors rather than
                    treating every organisation as
                    equally relevant.
                  </p>
                </div>
              </article>

              <article>
                <div className="insight-card-number">
                  04
                </div>

                <div>
                  <h3>
                    CAPACITY IS PART
                    <br />
                    OF THE FIT.
                  </h3>

                  <p>
                    An organisation's capacity tier is
                    included so recommendations consider
                    whether the scale of implementation
                    is realistically aligned with the
                    district requirement.
                  </p>
                </div>
              </article>
            </div>

            <div className="insights-cta">
              <span>
                WANT TO SEE THE MODEL?
              </span>

              <button
                onClick={() =>
                  navigate("methodology")
                }
              >
                READ METHODOLOGY →
              </button>
            </div>
          </motion.section>
        )}

        {/* METHODOLOGY */}

        {activePage === "methodology" && (
          <motion.section
            className="methodology-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="methodology-header">
              <div>
                <div className="eyebrow">
                  05 / METHODOLOGY
                </div>

                <h1>
                  SHOW THE
                  <br />
                  <em>WORK.</em>
                </h1>
              </div>

              <p>
                ATLAS is built around transparent
                scoring. Every district signal and NGO
                recommendation can be traced back to
                understandable inputs.
              </p>
            </div>

            <div className="methodology-model">
              <div className="model-label">
                <span>
                  01
                </span>

                <strong>
                  EXPLAINABLE MODEL
                </strong>
              </div>

              <div className="model-content">
                <span className="model-kicker">
                  OPPORTUNITY GAP
                </span>

                <h2>
                  Need × allocation.
                </h2>

                <p className="model-description">
                  The gap score combines a district's
                  normalized need index with its
                  normalized CSR spend.
                </p>

                <div className="formula-box">
                  <span>
                    GAP SCORE
                  </span>

                  <strong>
                    Need
                    <sub>normalized</sub>

                    <span className="formula-symbol">
                      {" "}
                      ×{" "}
                    </span>

                    (1 − CSR Spend
                    <sub>normalized</sub>)
                  </strong>
                </div>

                <div className="method-note">
                  <span>
                    WHY NORMALIZE?
                  </span>

                  <p>
                    Need and CSR spend exist on
                    different scales. Normalization
                    converts them to comparable 0–1
                    values before they are combined.
                  </p>
                </div>
              </div>
            </div>

            <div className="methodology-steps">
              <div className="method-step">
                <span>01</span>

                <div>
                  <h3>
                    NEED INDEX
                  </h3>

                  <p>
                    District development indicators
                    are represented through a Need Index
                    on a 0–100 scale.
                  </p>
                </div>
              </div>

              <div className="method-step">
                <span>02</span>

                <div>
                  <h3>
                    CSR NORMALIZATION
                  </h3>

                  <p>
                    CSR allocation is scaled relative
                    to the minimum and maximum spend
                    observed in the pilot dataset.
                  </p>
                </div>
              </div>

              <div className="method-step">
                <span>03</span>

                <div>
                  <h3>
                    OPPORTUNITY GAP
                  </h3>

                  <p>
                    Higher need combined with
                    relatively lower CSR allocation
                    produces a higher calculated gap.
                  </p>
                </div>
              </div>

              <div className="method-step">
                <span>04</span>

                <div>
                  <h3>
                    NGO MATCHING
                  </h3>

                  <p>
                    NGO compatibility is calculated
                    from geography, sector alignment,
                    budget fit and organisational
                    capacity.
                  </p>
                </div>
              </div>
            </div>

            <div className="methodology-footer">
              <div>
                <span>
                  MATCHING MODEL
                </span>

                <strong>
                  30% / 30% / 20% / 20%
                </strong>
              </div>

              <div>
                <span>
                  GEOGRAPHY
                </span>

                <strong>
                  PROXIMITY
                </strong>
              </div>

              <div>
                <span>
                  SECTOR
                </span>

                <strong>
                  NEED ALIGNMENT
                </strong>
              </div>

              <div>
                <span>
                  BUDGET
                </span>

                <strong>
                  SCALE FIT
                </strong>
              </div>

              <div>
                <span>
                  CAPACITY
                </span>

                <strong>
                  ORGANISATIONAL FIT
                </strong>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      <footer className="site-footer">
        <div>
          <strong>ATLAS</strong>
          <span>
            CSR INTELLIGENCE PLATFORM
          </span>
        </div>

        <p>
          Tamil Nadu pilot · Need mapping ·
          Explainable NGO matching
        </p>

        <span>
          2026 / PILOT
        </span>
      </footer>

      <AnimatePresence>
        {selectedDistrict &&
          activePage === "map" && (
            <DistrictPanel
              district={selectedDistrict}
              onClose={() =>
                setSelectedDistrict(null)
              }
            />
          )}
      </AnimatePresence>
    </div>
  );
}

export default App;