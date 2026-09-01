"""Render and send (or, in dev, save) the monthly expense report."""
import smtplib
import ssl
from datetime import date, datetime, timezone
from email.message import EmailMessage
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from sqlmodel import Session

from app.config import settings
from app.config_options import category_label, payment_mode_label
from app.formatting import format_inr
from app.models import User
from app.schemas import DateRange, ReportEmailResponse
from app.services import analytics

_TEMPLATE_DIR = Path(__file__).resolve().parent.parent / "templates"
_OUTBOX = Path(__file__).resolve().parent.parent.parent / "outbox"

_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATE_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)
_env.globals.update(
    inr=format_inr,
    cat_label=lambda v: category_label(v),
    pay_label=lambda v: payment_mode_label(v),
)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_USER and settings.SMTP_APP_PASSWORD)


def render_report_html(user: User, start: date, end: date, session: Session) -> str:
    summary, txns = analytics.summarize(session, user.id, start, end)
    template = _env.get_template("report.html.j2")
    return template.render(
        user=user,
        range=DateRange(start=start, end=end),
        summary=summary,
        transactions=txns,
        generated_at=datetime.now(timezone.utc),
    )


def _send_via_smtp(to_addr: str, subject: str, html: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM or settings.SMTP_USER
    msg["To"] = to_addr
    msg.set_content("Your Kharcha Tracker expense report is attached as HTML.")
    msg.add_alternative(html, subtype="html")

    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
        server.login(settings.SMTP_USER, settings.SMTP_APP_PASSWORD)
        server.send_message(msg)


def send_report(user: User, start: date, end: date, session: Session) -> ReportEmailResponse:
    html = render_report_html(user, start, end, session)
    subject = f"Kharcha Tracker report · {start:%d %b} – {end:%d %b %Y}"
    rng = DateRange(start=start, end=end)

    if settings.DEV_AUTH or not _smtp_configured():
        _OUTBOX.mkdir(exist_ok=True)
        stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S")
        path = _OUTBOX / f"report-{user.id}-{stamp}.html"
        path.write_text(html, encoding="utf-8")
        return ReportEmailResponse(
            status="saved",
            to=user.email,
            range=rng,
            dev=True,
            detail=f"Dev mode - report written to {path.relative_to(_OUTBOX.parent)}",
        )

    _send_via_smtp(user.email, subject, html)
    return ReportEmailResponse(status="sent", to=user.email, range=rng, dev=False)
