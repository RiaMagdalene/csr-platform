from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
from matching import find_matches

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


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