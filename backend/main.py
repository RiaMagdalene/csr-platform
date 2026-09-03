from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json

from matching import find_matches, find_csr_matches


app = FastAPI()


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request model for CSR matching
# --------------------------------------------------

class MatchRequest(BaseModel):
    target_district: str
    sectors: list[str]
    budget: float
    required_capacity: str


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


# --------------------------------------------------
# Get all districts
# --------------------------------------------------

@app.get("/districts")
def get_districts():

    with open("data/districts.json", "r") as file:
        districts = json.load(file)

    spends = [district["csr_spend"] for district in districts]

    min_spend = min(spends)
    max_spend = max(spends)

    for district in districts:

        need_normalized = district["need_index"] / 100

        if max_spend == min_spend:
            csr_normalized = 0
        else:
            csr_normalized = (
                district["csr_spend"] - min_spend
            ) / (max_spend - min_spend)

        district["gap_score"] = (
            need_normalized * (1 - csr_normalized)
        )

    return districts


# --------------------------------------------------
# Get one district
# --------------------------------------------------

@app.get("/districts/{district_id}")
def get_district(district_id: str):

    with open("data/districts.json", "r") as file:
        districts = json.load(file)

    spends = [district["csr_spend"] for district in districts]

    min_spend = min(spends)
    max_spend = max(spends)

    for district in districts:

        if district["id"] == district_id:

            need_normalized = district["need_index"] / 100

            if max_spend == min_spend:
                csr_normalized = 0
            else:
                csr_normalized = (
                    district["csr_spend"] - min_spend
                ) / (max_spend - min_spend)

            district["gap_score"] = (
                need_normalized * (1 - csr_normalized)
            )

            return district

    raise HTTPException(
        status_code=404,
        detail="District not found"
    )


# --------------------------------------------------
# Existing district-based NGO matching
# --------------------------------------------------

@app.get("/districts/{district_id}/matches")
def get_matches(district_id: str):

    with open("data/districts.json", "r") as file:
        districts = json.load(file)

    with open("data/ngos.json", "r") as file:
        ngos = json.load(file)

    district = next(
        (d for d in districts if d["id"] == district_id),
        None
    )

    if district is None:
        raise HTTPException(
            status_code=404,
            detail="District not found"
        )

    spends = [d["csr_spend"] for d in districts]

    min_spend = min(spends)
    max_spend = max(spends)

    need_normalized = district["need_index"] / 100

    if max_spend == min_spend:
        csr_normalized = 0
    else:
        csr_normalized = (
            district["csr_spend"] - min_spend
        ) / (max_spend - min_spend)

    district["gap_score"] = (
        need_normalized * (1 - csr_normalized)
    )

    matches = find_matches(
        district,
        ngos,
        districts
    )

    return matches


# --------------------------------------------------
# New CSR company-driven NGO matching
# --------------------------------------------------

@app.post("/matches")
def get_csr_matches(request: MatchRequest):

    with open("data/districts.json", "r") as file:
        districts = json.load(file)

    with open("data/ngos.json", "r") as file:
        ngos = json.load(file)

    # Check whether target district exists
    district = next(
        (
            d for d in districts
            if d["id"] == request.target_district
        ),
        None
    )

    if district is None:
        raise HTTPException(
            status_code=404,
            detail="District not found"
        )

    # Validate required capacity
    valid_capacity_tiers = {
        "Small",
        "Medium",
        "Large"
    }

    if request.required_capacity not in valid_capacity_tiers:
        raise HTTPException(
            status_code=400,
            detail="Invalid required_capacity"
        )

    # Validate budget
    if request.budget < 0:
        raise HTTPException(
            status_code=400,
            detail="Budget cannot be negative"
        )

    # Find CSR-based NGO matches
    matches = find_csr_matches(
        target_district=request.target_district,
        required_sectors=request.sectors,
        budget=request.budget,
        required_capacity=request.required_capacity,
        ngos=ngos,
        districts=districts
    )

    return matches