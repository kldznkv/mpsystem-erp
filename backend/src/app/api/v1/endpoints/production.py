from fastapi import APIRouter

router = APIRouter()

@router.get("/lines")
async def get_production_lines():
    """Get production line status"""
    return {"message": "Production lines endpoint - coming soon"}