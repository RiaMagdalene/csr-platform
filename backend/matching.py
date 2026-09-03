def calculate_geo_score(distance_km):
    """
    Calculate geography score based on distance.
    Same district = 1.0
    300 km or more = 0.0
    """
    return max(0, 1 - (distance_km / 300))


def calculate_sector_score(ngo_sectors, required_sectors):
    """
    Score based on how many required sectors
    the NGO supports.
    """
    matches = set(ngo_sectors) & set(required_sectors)

    if not required_sectors:
        return 0

    return len(matches) / len(required_sectors)


def calculate_capacity_score(ngo_capacity, required_capacity):
    """
    Compare NGO capacity with project requirement.
    """
    tiers = {
        "Small": 1,
        "Medium": 2,
        "Large": 3
    }

    ngo_level = tiers[ngo_capacity]
    required_level = tiers[required_capacity]

    difference = required_level - ngo_level

    if difference <= 0:
        return 1.0
    elif difference == 1:
        return 0.75
    elif difference == 2:
        return 0.5
    else:
        return 0.25


def calculate_match_score(geo, sector, capacity):
    """
    Final NGO match score.

    40% Geography
    35% Sector
    25% Capacity
    """
    return (
        0.40 * geo +
        0.35 * sector +
        0.25 * capacity
    )

import math


def calculate_distance(lat1, lng1, lat2, lng2):
    """
    Calculate distance between two coordinates in kilometres.
    """
    earth_radius = 6371

    lat1 = math.radians(lat1)
    lng1 = math.radians(lng1)
    lat2 = math.radians(lat2)
    lng2 = math.radians(lng2)

    dlat = lat2 - lat1
    dlng = lng2 - lng1

    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(dlng / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return earth_radius * c

def find_matches(district, ngos, districts):
    """
    Find and rank NGOs for a district.
    """

    # Decide required capacity from need index
    if district["need_index"] < 50:
        required_capacity = "Small"
    elif district["need_index"] < 75:
        required_capacity = "Medium"
    else:
        required_capacity = "Large"

    matches = []

    for ngo in ngos:

        # Find the district where this NGO is located
        ngo_district = next(
            (d for d in districts if d["id"] == ngo["district_id"]),
            None
        )

        if ngo_district is None:
            continue

        # Same district
        if ngo["district_id"] == district["id"]:
            geo_score = 1.0
        else:
            distance = calculate_distance(
                district["lat"],
                district["lng"],
                ngo_district["lat"],
                ngo_district["lng"]
            )

            geo_score = calculate_geo_score(distance)

        # Sector score
        sector_score = calculate_sector_score(
            ngo["sectors"],
            district["top_needs"]
        )

        # Skip NGOs that don't match any required sector
        if sector_score == 0:
            continue

        # Capacity score
        capacity_score = calculate_capacity_score(
            ngo["capacity_tier"],
            required_capacity
        )

        # Final score
        match_score = calculate_match_score(
            geo_score,
            sector_score,
            capacity_score
        )

        matches.append({
            "ngo_name": ngo["ngo_name"],
            "match_score": round(match_score, 2),
            "breakdown": {
                "geo": round(geo_score, 2),
                "sector": round(sector_score, 2),
                "capacity": round(capacity_score, 2)
            },
            "sectors": ngo["sectors"],
            "capacity_tier": ngo["capacity_tier"],
            "website": ngo["website"]
        })

    # Highest match first
    matches.sort(
        key=lambda x: x["match_score"],
        reverse=True
    )

    # Return maximum 5
    return matches[:5]