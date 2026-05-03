from dataclasses import dataclass


@dataclass
class AuthorizationResult:
    approved: bool
    decision: str
    reason: str
    request_id: str
