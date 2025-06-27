import logo from '../logo.svg'
import { ROUTES } from '../routes/index.js'

function Home() {
    return (
        <div className='App'>
            <header className='App-header'>
                {/* <img src={logo} className='App-logo' alt="logo" /> */}
                <h1>Nguyen Dao Shop</h1>
                <p>Chao mung den voi cua hang cua chung toi</p>
                <div>
                    <a className='App-link' href={ROUTES.AUTH}>
                        Dang Nhap
                    </a>
                </div>
            </header>
        </div>
    )
}

export default Home