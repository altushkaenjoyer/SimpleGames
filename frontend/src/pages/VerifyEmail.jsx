import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BASE_URL } from '../api';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    fetch(`${BASE_URL}/auth/verify/${token}`)
      .then(r => r.json())
      .then(data => setStatus(data.error ? 'error' : 'success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        {status === 'loading' && <p className="verify-msg">Проверяем ссылку...</p>}
        {status === 'success' && (
          <>
            <div className="verify-icon verify-ok">✓</div>
            <h1>Email подтверждён!</h1>
            <p className="verify-sub">Теперь вы можете войти в аккаунт.</p>
            <Link to="/login" className="verify-btn">Войти</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="verify-icon verify-err">✕</div>
            <h1>Ссылка недействительна</h1>
            <p className="verify-sub">Возможно, вы уже подтвердили email или ссылка устарела.</p>
            <Link to="/login" className="verify-btn">Войти</Link>
          </>
        )}
      </div>
    </div>
  );
}
