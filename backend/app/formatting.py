"""₹ INR formatting with Indian digit grouping (12,34,567.89)."""
import re
from decimal import Decimal

_HEAD_GROUP = re.compile(r"(\d)(?=(\d\d)+$)")


def format_inr(value) -> str:
    d = Decimal(str(value)).quantize(Decimal("0.01"))
    sign = "-" if d < 0 else ""
    d = abs(d)
    int_part, frac = f"{d:.2f}".split(".")
    if len(int_part) > 3:
        head, tail = int_part[:-3], int_part[-3:]
        head = _HEAD_GROUP.sub(r"\1,", head)
        int_part = f"{head},{tail}"
    return f"{sign}₹{int_part}.{frac}"
