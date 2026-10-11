import Sidebar from './Sidebar'
import Navbar from './Navbar'
import Header from './Header'

function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__body">
        <Header />
        <main className="layout__content">
          {children}
        </main>
      </div>
      <Navbar />
    </div>
  )
}

export default Layout
