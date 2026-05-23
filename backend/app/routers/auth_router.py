from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import create_access_token, get_current_user_id

router = APIRouter(prefix="/auth", tags=["auth"])


class TokenRequest(BaseModel):
    clerk_id: str
    email: str


@router.post("/token")
async def issue_token(body: TokenRequest):
    token = create_access_token(subject=body.clerk_id, extra={"email": body.email})
    return {"access_token": token, "token_type": "bearer", "expires_in": 3600}


@router.get("/verify")
async def verify_token(user_id: str | None = Depends(get_current_user_id)):
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    return {"valid": True, "user_id": user_id}
