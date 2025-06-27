import { useState } from 'react'
import { ROUTES } from '../routes/index.js'

function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', { email, password, type: isLogin ? 'login' : 'register' })
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '300px' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <button
                        type="submit"
                        style={{ padding: '0.5rem', borderRadius: '4px', backgroundColor: '#61dafb', border: 'none', cursor: 'pointer' }}
                    >
                        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                    </button>
                </form>

                <div style={{ marginTop: '1rem' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="App-link"
                        style={{ background: 'none', border: 'none', color: '#61dafb', cursor: 'pointer' }}
                    >
                        {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <a className="App-link" href={ROUTES.HOME}>
                        ← Về trang chủ
                    </a>
                </div>
            </header>
        </div>
    )
}

export default Auth