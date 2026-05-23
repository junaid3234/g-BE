from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_auth
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", response_model=UserResponse)
async def create_or_sync_user(body: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.clerk_id == body.clerk_id))
    existing = result.scalar_one_or_none()
    if existing:
        existing.email = body.email
        existing.full_name = body.full_name or existing.full_name
        existing.role = body.role or existing.role
        await db.flush()
        return existing

    user = User(
        clerk_id=body.clerk_id,
        email=body.email,
        full_name=body.full_name,
        role=body.role,
    )
    db.add(user)
    await db.flush()
    return user


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.clerk_id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found — sync via POST /users")
    return user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
