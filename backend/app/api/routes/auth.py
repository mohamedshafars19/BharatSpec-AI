import hashlib
import logging
from fastapi import APIRouter, HTTPException, status, Header
from typing import Optional
from app.models.schemas import UserLogin, UserSignup, UserResponse, AuthToken
from app.database import db

router = APIRouter()
logger = logging.getLogger(__name__)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

@router.post("/auth/login", response_model=AuthToken)
def login(request: UserLogin):
    email = request.email.strip().lower()
    user = db.get_user_by_email(email)

    # For MVP convenience: if user doesn't exist, create demo session or validate
    if not user:
        if email in ("procurement@gov.in", "admin@gov.in") or "@" in email:
            # Auto-register convenient user
            name = email.split("@")[0].replace(".", " ").title()
            user = db.create_user(
                name=name or "Procurement Officer",
                organization="Directorate of Municipal Infrastructure",
                email=email,
                password_hash=hash_password(request.password)
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please verify your credentials."
            )

    token = f"token_{user['id']}_{hashlib.md5(email.encode()).hexdigest()[:8]}"
    return AuthToken(
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            organization=user["organization"],
            email=user["email"],
            created_at=str(user.get("created_at", ""))
        )
    )

@router.post("/auth/signup", response_model=AuthToken)
def signup(request: UserSignup):
    email = request.email.strip().lower()
    existing = db.get_user_by_email(email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = db.create_user(
        name=request.name.strip(),
        organization=request.organization.strip() or "Procurement Department",
        email=email,
        password_hash=hash_password(request.password)
    )

    token = f"token_{user['id']}_{hashlib.md5(email.encode()).hexdigest()[:8]}"
    return AuthToken(
        token=token,
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            organization=user["organization"],
            email=user["email"],
            created_at=str(user["created_at"])
        )
    )

@router.get("/auth/me", response_model=UserResponse)
def get_current_user(authorization: Optional[str] = Header(None)):
    # Default to first seeded user if unauthenticated or token provided
    user = db.get_user_by_email("procurement@gov.in")
    if not user:
        user = db.create_user(
            name="Mohamed Shafar",
            organization="Directorate of Municipal Infrastructure",
            email="procurement@gov.in",
            password_hash="seeded"
        )
    return UserResponse(
        id=user["id"],
        name=user["name"],
        organization=user["organization"],
        email=user["email"],
        created_at=str(user.get("created_at", ""))
    )
