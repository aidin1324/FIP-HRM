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
        style = """ 
                    body {
                        font-family: 'Trebuchet MS', Arial, sans-serif;
                        background-color: #f8f4e5;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 20px auto;
                        background-color: #fff;
                        border-radius: 15px;
                        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                        overflow: hidden;
                        position: relative;
                    }
                    .header {
                        background-color: #ff6b6b;
                        color: white;
                        padding: 25px 30px;
                        text-align: center;
                        position: relative;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 700;
                    }
                    .content {
                        padding: 25px 30px;
                        color: #444;
                    }
                    .button {
                        display: block;
                        background-color: #4ecdc4;
                        color: white;
                        padding: 15px 25px;
                        text-decoration: none;
                        border-radius: 50px;
                        font-weight: bold;
                        text-align: center;
                        margin: 25px auto;
                        max-width: 250px;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        font-size: 16px;
                    }
                    .button:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 6px 8px rgba(0,0,0,0.15);
                        background-color: #3dbdb5;
                    }
                    .chef-hat {
                        width: 60px;
                        height: 60px;
                        margin: 0 auto 15px;
                    }
                    .timer {
                        background-color: #ffe66d;
                        border-radius: 12px;
                        padding: 10px 15px;
                        margin: 20px 0;
                        font-weight: bold;
                        text-align: center;
                        color: #333;
                        position: relative;
                    }
                    .timer:before {
                        content: "⏱️";
                        margin-right: 8px;
                        font-size: 18px;
                    }
                    .achievement {
                        background-color: #f4f1eb;
                        border-radius: 12px;
                        padding: 15px;
                        margin-top: 20px;
                        border-left: 5px solid #4ecdc4;
                    }
                    .achievement h3 {
                        margin-top: 0;
                        color: #333;
                    }
                    .footer {
                        padding: 20px;
                        text-align: center;
                        background-color: #f8f4e5;
                        color: #666;                       
                        font-size: 14px;
                    }
                    .stars {
                        font-size: 24px;
                        color: #ffe66d;
                        margin-bottom: 10px;
                    }
        """
        html_content = f"""
            <html>
            <head>
                <style>
                    {style}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="chef-hat">
                            <svg viewBox="0 0 512 512" fill="white">
                                <path d="M416 32a95.17 95.17 0 0 0-57.73 19.74C334.93 20.5 298 0 256 0s-78.93 20.5-102.27 51.74A95.56 95.56 0 0 0 0 128c0 41.74 64 224 64 224v128a32 32 0 0 0 32 32h320a32 32 0 0 0 32-32V352s64-182.26 64-224a96 96 0 0 0-96-96zM96 464v-80h320v80zm333.25-128H82.75C63.38 287.9 32 175.47 32 128a64 64 0 0 1 64-64c18.09 0 34.59 7.71 46.59 19.86l16.2 16.22 11.31-19.63C187.78 47.77 220.19 32 256 32s68.23 15.77 85.91 48.45l11.31 19.63 16.2-16.22A63.85 63.85 0 0 1 416 64a64 64 0 0 1 64 64c0 47.47-31.38 159.9-50.75 208z"/>
                            </svg>
                        </div>
                        <h1>Обновление пароля в ZernoHub!</h1>
                    </div>
                    <div class="content">
                        <p>Приветствуем, {user_name}! 👋</p>
                        
                        <p>Похоже, вам нужен новый ключ от нашей кулинарной системы. Мы получили запрос на сброс пароля для вашей учетной записи в ZernoHub.</p>
                        
                        <div class="timer">
                            Ваша миссия действительна 1 час!
                        </div>
                        
                        <p>Чтобы получить новый доступ к системе, нажмите на кнопку:</p>
                        
                        <a href="{reset_link}" class="button">🔑 Получить новый пароль</a>
                        
                        <div class="achievement">
                            <div class="stars">⭐⭐⭐</div>
                            <h3>Достижение: "Мастер безопасности"</h3>
                            <p>Регулярное обновление пароля повышает безопасность вашего аккаунта и всей системы!</p>
                        </div>
                        
                        <p style="margin-top: 25px;">Если вы не запрашивали сброс пароля, просто проигнорируйте это сообщение. Возможно, кто-то случайно указал вашу электронную почту.</p>
                    </div>
                    <div class="footer">
                        <p>С уважением и кулинарным вдохновением,<br>Команда ZernoHub</p>
                    </div>
                </div>
            </body>
            </html>
        """

        
        return await EmailService.send_email(to_email, subject, html_content)