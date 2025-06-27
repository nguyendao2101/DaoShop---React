// File này có thể xóa hoặc giữ làm component khác
import logo from './logo.svg'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          App Component - Không sử dụng trong routing hiện tại
        </p>
      </header>
    </div>
  )
}

export default App