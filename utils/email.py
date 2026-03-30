import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

def send_email(to_email: str, subject: str, html_body: str):
    smtp_host = settings.SMTP_HOST
    smtp_port = settings.SMTP_PORT
    smtp_user = settings.SMTP_USER
    smtp_pass = settings.SMTP_PASS

    if not all([smtp_host, smtp_port, smtp_user, smtp_pass]):
        raise RuntimeError("SMTP configuration is incomplete in environment variables")


    msg = MIMEMultipart()
    msg["From"] = smtp_user
    msg["To"] = to_email
    msg["Subject"] = subject

    msg.attach(MIMEText(html_body, "html"))

    server = smtplib.SMTP(smtp_host, smtp_port)
    server.starttls()
    server.login(smtp_user, smtp_pass)
    server.send_message(msg)
    server.quit()
    # print(os.getenv("SMTP_HOST"))
    # print(os.getenv("SMTP_PORT"))
    # print(os.getenv("SMTP_USER"))
    # print(os.getenv("SMTP_PASS"))



def send_invite_email(to_email: str, invite_token: str, org_name: str):
    frontend_url = settings.FRONTEND_URL
    invite_link = f"{frontend_url}/accept-invite?token={invite_token}"

    subject = "You're Invited to Join"

    html = f"""
        <h2>You're Invited!</h2>
        <p>You have been invited to join <b>{org_name}</b>.</p>
        <p>Click below to accept:</p>
        <a href="{invite_link}" 
           style="background:#033F99;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
           Accept Invitation
        </a>
        <p>This link expires in 7 days.</p>
    """

    # print("Invite email:", to_email)

    send_email(to_email, subject, html)


def build_contract_email(payload, portal_link: str, sender: dict):
    subject = "Secure Contract Document – Action Required"
    
    sender_name = sender.get("name", "Your Representative")
    org_name = sender.get("org_name", "InnovateBook")
    client_name = payload.name

    body = f"""
    <p>Hello {client_name},</p>
    <p>You have received a contract from {sender_name} ({org_name}).</p>
    <p>Please review and complete your onboarding using the secure link below:</p>
    <p>👉 <a href="{portal_link}">{portal_link}</a></p>
    <br/>
    <p>This link will expire in 7 days.</p>
    <p><strong>For security reasons:</strong></p>
    <ul>
        <li>Do not share this link</li>
        <li>This link is unique to your organization</li>
    </ul>
    <p>If you have any questions, please contact your representative.</p>
    <br/>
    <p>Best regards,<br/>
    {sender_name}<br/>
    {org_name}</p>
    """
    
    return subject, body
