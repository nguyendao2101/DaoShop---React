import logo from '../logo.svg'
import { ROUTES } from '../routes/index.js'
import '../App.scss'  // Đổi từ .css thành .scss

function Home() {
    return (
        <div className='App fade-in'>
            <header className='App-header'>
                <img src={logo} className='App-logo' alt="logo" />
                <h1>Nguyen Dao Shop</h1>
                <p>Chào mừng đến với cửa hàng của chúng tôi</p>
                <div>
                    <a className='App-link' href={ROUTES.AUTH}>
                        Đăng Nhập
                    </a>
                </div>
            </header>
        </div>
    )
}

export default Home