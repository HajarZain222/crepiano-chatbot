import logo from '../assets/logo.png'

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