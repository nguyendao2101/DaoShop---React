import logo from '../logo.svg'
import { ROUTES } from '../routes/index.js'
import { authUtils } from '../utils/auth.js'
import '../App.scss'

function Home() {
    const isLoggedIn = authUtils.isAuthenticated()
    const userData = authUtils.getUserData()

    const handleLogout = () => {
        authUtils.logout()
    }

    return (
        <div className='App fade-in'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt="logo" />
                <h1>Nguyen Dao Shop</h1>
                <p>Chào mừng đến với cửa hàng của chúng tôi</p>

                {isLoggedIn ? (
                    <div>
                        <p>Xin chào, {userData?.userName || 'User'}!</p>
                        <button
                            onClick={handleLogout}
                            className='App-link'
                            style={{
                                background: 'none',
                                border: '2px solid #61dafb',
                                margin: '10px'
                            }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    <div>
                        <a className='App-link' href={ROUTES.AUTH}>
                            Đăng Nhập
                        </a>
                    </div>
                )}
            </header>
        </div>
    )
}

export default Home