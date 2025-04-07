import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import email_host, email_port, email_user, email_password, app_url


class EmailService:
    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str):
        message = MIMEMultipart()
        message['From'] = email_user
        message['To'] = to_email
        message['Subject'] = subject
        
        message.attach(MIMEText(html_content, 'html'))
        
        try:
            server = smtplib.SMTP(email_host, email_port)
            server.starttls()
            server.login(email_user, email_password)
            text = message.as_string()
            server.sendmail(email_user, to_email, text)
            server.quit()
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    @staticmethod
    async def send_password_reset_email(to_email: str, reset_token: str, user_name: str):
        reset_link = f"{app_url}/reset-password?token={reset_token}"
        
        subject = "Сброс пароля ZernoHub"
        
        html_content = f"""
        <html>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Сброс пароля</h2>
                <p>Здравствуйте, {user_name}!</p>
                <p>Мы получили запрос на сброс пароля для вашей учетной записи ZernoHub.</p>
                <p>Для сброса пароля, пожалуйста, перейдите по следующей ссылке:</p>
                <p><a href="{reset_link}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Сбросить пароль</a></p>
                <p>Если вы не запрашивали сброс пароля, проигнорируйте это сообщение.</p>
                <p>Ссылка действительна в течение 1 часа.</p>
                <p>С уважением,<br>Команда ZernoHub</p>
            </div>
        </body>
        </html>
        """
        
        return await EmailService.send_email(to_email, subject, html_content)