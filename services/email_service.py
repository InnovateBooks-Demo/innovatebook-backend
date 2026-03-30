import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
from config import settings

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str):
    """
    Sends a real email using SMTP.
    """
    sender_email = settings.SMTP_USER
    app_password = settings.SMTP_PASS

    if not sender_email or not app_password:
        raise ValueError("SMTP_USER and SMTP_PASS must be configured in environment variables.")

    msg = MIMEMultipart()
    msg['From'] = f"InnovateBook <{sender_email}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'html'))

    try:
        # Connect to Gmail SMTP
        server = smtplib.SMTP('smtp.gmail.com', 587)
        # IMPORTANT: Secure connection
        server.starttls()
        
        # Login with App Password (NOT normal password)
        server.login(sender_email, app_password)
        
        # Send actual message
        server.send_message(msg)
        
        # Close connection
        server.quit()
        return True
    except Exception as e:
        logger.error(f"SMTP sending failed: {e}")
        raise e
