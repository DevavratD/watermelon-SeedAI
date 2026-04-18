"""
app/schemas/verify.py
─────────────────────
Pydantic schemas for POST /api/v1/verify-transaction.
"""
from typing import Optional
from pydantic import BaseModel


class VerifyRequest(BaseModel):
    transaction_id: str
    otp: str


class VerifyResponse(BaseModel):
    status: str            # "success" | "failure"
    verified: bool = False # True only on correct OTP
    message: str
    transaction_id: str
