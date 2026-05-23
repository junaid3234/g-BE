"""JWT and Clerk token verification."""

from datetime import datetime, timedelta, timezone
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings

security = HTTPBearer(auto_error=False)


def create_access_token(subject: str, extra: dict[str, Any] | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": subject, "exp": expire, **(extra or {})}
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


async def verify_clerk_token(token: str) -> dict[str, Any]:
    if not settings.clerk_secret_key:
        # Dev mode: decode without Clerk verification
        try:
            return jwt.get_unverified_claims(token)
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://api.clerk.com/v1/sessions/verify",
            headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
            params={"token": token},
            timeout=10.0,
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Clerk verification failed")
        return resp.json()


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str | None:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload.get("sub")
    except JWTError:
        pass
    try:
        claims = await verify_clerk_token(token)
        return claims.get("sub") or claims.get("user_id")
    except HTTPException:
        return None


async def require_auth(user_id: str | None = Depends(get_current_user_id)) -> str:
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user_id
