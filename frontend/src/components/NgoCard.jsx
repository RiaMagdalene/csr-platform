import { motion } from "framer-motion";

function NgoCard({ ngo, rank }) {
  const matchScore = Math.round((ngo.match_score || 0) * 100);

  const geoScore = Math.round((ngo.breakdown?.geo || 0) * 100);
  const sectorScore = Math.round((ngo.breakdown?.sector || 0) * 100);
  const budgetScore = Math.round((ngo.breakdown?.budget || 0) * 100);
  const capacityScore = Math.round((ngo.breakdown?.capacity || 0) * 100);

  return (
    <motion.div
      className="ngo-card"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className="ngo-card-top">
        <div className="ngo-rank">
          #{String(rank).padStart(2, "0")}
        </div>

        <div className="ngo-score">
          <strong>{matchScore}%</strong>
          <span>MATCH</span>
        </div>
      </div>

      <div className="ngo-info">
        <h3>{ngo.ngo_name}</h3>

        <p>
          {ngo.sectors?.length
            ? ngo.sectors.join(" • ")
            : "Multi-sector organisation"}
        </p>
      </div>

      <div className="ngo-capacity-row">
        <span>CAPACITY TIER</span>
        <strong>{ngo.capacity_tier}</strong>
      </div>

      <div className="ngo-breakdown">
        <div>
          <span>GEOGRAPHY</span>
          <div className="score-bar">
            <div style={{ width: `${geoScore}%` }} />
          </div>
          <strong>{geoScore}%</strong>
        </div>

        <div>
          <span>SECTOR</span>
          <div className="score-bar">
            <div style={{ width: `${sectorScore}%` }} />
          </div>
          <strong>{sectorScore}%</strong>
        </div>

        <div>
          <span>BUDGET</span>
          <div className="score-bar">
            <div style={{ width: `${budgetScore}%` }} />
          </div>
          <strong>{budgetScore}%</strong>
        </div>

        <div>
          <span>CAPACITY</span>
          <div className="score-bar">
            <div style={{ width: `${capacityScore}%` }} />
          </div>
          <strong>{capacityScore}%</strong>
        </div>
      </div>

      {ngo.website && (
        <a
          href={ngo.website}
          target="_blank"
          rel="noreferrer"
          className="ngo-link"
        >
          VISIT ORGANISATION
          <span>↗</span>
        </a>
      )}
    </motion.div>
  );
}

export default NgoCard;