"""
Password hashing using Argon2id — the winner of the Password Hashing Competition.
Never store or log plaintext passwords.
"""
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

# Argon2id configuration — balanced for security and performance
_ph = PasswordHasher(
    time_cost=3,        # iterations
    memory_cost=65536,  # 64 MB
    parallelism=2,
    hash_len=32,
    salt_len=16,
)


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password with Argon2id. Returns the full encoded hash."""
    return _ph.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain-text password against an Argon2id hash.
    Returns True on match, False on mismatch or invalid hash.
    Always runs in constant time to prevent timing attacks.
    """
    try:
        return _ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def needs_rehash(hashed_password: str) -> bool:
    """Check if the hash needs to be upgraded to current parameters."""
    return _ph.check_needs_rehash(hashed_password)
