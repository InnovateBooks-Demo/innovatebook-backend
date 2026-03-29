import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str):
    """
    Sends a real email using Gmail SMTP.
    """
    # Replace these with real credentials or set in .env
    sender_email = os.environ.get("GMAIL_USER", "your_email@gmail.com")
    app_password = os.environ.get("GMAIL_APP_PASSWORD", "your_app_password_without_spaces")

    if not sender_email or "your_email" in sender_email or "your_app_password" in app_password:
        raise ValueError("Please configure your Gmail ID and App Password in services/email_service.py or .env file.")

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
