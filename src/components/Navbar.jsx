import logo from '../assets/logo.png'
import '../styles/components.css'

function Navbar() {
  return (
    <header className="header">
        <div className="logo-placeholder">
            <img src={ logo } alt="شعار مطعم كريبيانو" />
        </div>
    </header>
  )
}

export default Navbar