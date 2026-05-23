require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(toEmail, username, token) {
  const link = `${process.env.FRONTEND_URL}/verify/${token}`;

  if (!process.env.RESEND_API_KEY) {
    console.log(`[DEV] Verification link for ${toEmail}: ${link}`);
    return;
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to: toEmail,
    subject: 'Подтвердите email — SimpleGames',
    html: `
      <div style="font-family:monospace;background:#07071a;color:#e8e8ff;padding:32px;max-width:480px;margin:0 auto">
        <h1 style="color:#00d4ff;font-size:18px;margin-bottom:8px">SIMPLEGAMES</h1>
        <p style="color:#7070aa;margin-bottom:24px">Подтверждение аккаунта</p>
        <p>Привет, <strong>${username}</strong>!</p>
        <p style="margin:16px 0">Нажми кнопку ниже чтобы подтвердить email и войти в аккаунт:</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#00d4ff;color:#000;font-weight:bold;text-decoration:none;font-family:monospace;margin:8px 0">
          ПОДТВЕРДИТЬ EMAIL
        </a>
        <p style="color:#7070aa;font-size:12px;margin-top:24px">
          Ссылка действует 24 часа.<br>
          Если вы не регистрировались — просто проигнорируйте письмо.
        </p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail };
