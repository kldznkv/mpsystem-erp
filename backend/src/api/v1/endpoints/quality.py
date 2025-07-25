from fastapi import APIRouter

router = APIRouter()

@router.get("/batches/pending")
async def get_pending_quality_batches():
    """Get batches pending quality control"""
    return {"message": "Quality control batches endpoint - coming soon"}