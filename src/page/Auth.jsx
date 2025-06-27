import { useState } from 'react'
import { ROUTES } from '../routes/index.js'
import '../App.scss'  // Đổi từ .css thành .scss

function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', { email, password, type: isLogin ? 'login' : 'register' })
    }

    return (
        <div className="App fade-in">
            <header className="App-header">
                <h1>{isLogin ? 'Đăng nhập' : 'Đăng ký'}</h1>

                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-form__input"
                        required
                    />

                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-form__input"
                        required
                        minLength="6"
                    />

                    <button type="submit" className="auth-form__submit">
                        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                    </button>
                </form>

                <div className="text-center mt-1">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="auth-form__toggle"
                    >
                        {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                </div>

                <div className="text-center mt-1">
                    <a className="App-link" href={ROUTES.HOME}>
                        ← Về trang chủ
                    </a>
                </div>
            </header>
        </div>
    )
}

export default Auth