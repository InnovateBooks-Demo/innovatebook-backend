import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_email(to_email: str, subject: str, html_body: str):
    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")


    print("SMTP_HOST:", os.getenv("SMTP_HOST"))
    print("SMTP_PORT:", os.getenv("SMTP_PORT"))
    print("SMTP_USER:", os.getenv("SMTP_USER"))
    print("SMTP_PASS exists:", bool(os.getenv("SMTP_PASS")))


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
    invite_link = f"http://localhost:3000/accept-invite?token={invite_token}"

    subject = "You're Invited to Join"

    html = f"""
        <h2>You're Invited!</h2>
        <p>You have been invited to join <b>{org_name}</b>.</p>
        <p>Click below to accept:</p>
        <a href="{invite_link}" 
           style="background:#3A4E63;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
           Accept Invitation
        </a>
        <p>This link expires in 7 days.</p>
    """

    # print("Invite email:", to_email)

    send_email(to_email, subject, html)
