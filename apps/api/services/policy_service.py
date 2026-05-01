from apps.api.db.models import DecisionStatus, Mandate, PurchaseRequest


def evaluate_request(request: PurchaseRequest, mandate: Mandate) -> tuple[DecisionStatus, str]:
    """
    Evaluate a purchase request against a mandate.

    Returns a tuple of (DecisionStatus, reason_code).

    Rules:
    1. If merchant not in allowed_merchants -> denied
    2. Else if amount > max_per_transaction -> denied
    3. Else if amount > approval_threshold -> needs_review
    4. Else -> approved
    """
    if request.merchant not in mandate.allowed_merchants:
        return DecisionStatus.denied, "merchant_not_allowed"

    if request.amount > mandate.max_per_transaction:
        return DecisionStatus.denied, "amount_exceeds_max_per_transaction"

    if request.amount > mandate.approval_threshold:
        return DecisionStatus.needs_review, "amount_exceeds_approval_threshold"

    return DecisionStatus.approved, "approved"
