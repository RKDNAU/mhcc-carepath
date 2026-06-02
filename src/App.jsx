import { useState, useEffect } from 'react'
import carePathIcon from '/img/CarePath.png'
import { DataProvider } from './context/DataContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import HowItWorks from './components/HowItWorks'
import AboutMHCC from './components/AboutMHCC'
import ServicesGrid from './components/ServicesGrid'
import CallToAction from './components/CallToAction'
import Footer from './components/Footer'
import IntakeForm from './components/IntakeForm'
import ServicesDirectory from './components/ServicesDirectory'
import PrivacyPolicy from './components/PrivacyPolicy'
import ProviderLogin from './components/ProviderLogin'
import ProviderLayout from './components/ProviderLayout'
import AboutCarePathPage from './components/AboutCarePathPage'
import AboutMHCCPage from './components/AboutMHCCPage'
import PartnerOrganisationsPage from './components/PartnerOrganisationsPage'
import NewsUpdatesPage from './components/NewsUpdatesPage'

export default function App() {
  const [showForm, setShowForm] = useState(false)
  const [showDirectory, setShowDirectory] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showProviderLogin, setShowProviderLogin] = useState(false)
  const [providerUser, setProviderUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(null)

  useEffect(() => {
    let link = document.querySelector("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = 'image/png'
    link.href = carePathIcon
  }, [])

  if (providerUser) {
    return (
      <DataProvider>
        <ProviderLayout
          user={providerUser}
          onLogout={() => setProviderUser(null)}
        />
      </DataProvider>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar
        onSeekSupport={() => setShowForm(true)}
        onBrowse={() => setShowDirectory(true)}
        onProviderLogin={() => setShowProviderLogin(true)}
        onNavigate={page => setCurrentPage(page)}
      />
      <main>
        <Hero
          onSeekSupport={() => setShowForm(true)}
          onBrowse={() => setShowDirectory(true)}
        />
        <HowItWorks />
        <AboutMHCC />
        <ServicesGrid />
        <CallToAction onSeekSupport={() => setShowForm(true)} />
      </main>
      <Footer onPrivacyClick={() => setShowPrivacy(true)} />

      {showForm && (
        <IntakeForm
          onClose={() => setShowForm(false)}
          onPrivacy={() => setShowPrivacy(true)}
        />
      )}
      {showDirectory && <ServicesDirectory onClose={() => setShowDirectory(false)} />}
      {showPrivacy && <PrivacyPolicy onClose={() => setShowPrivacy(false)} />}
      {showProviderLogin && (
        <ProviderLogin
          onLogin={user => { setProviderUser(user); setShowProviderLogin(false) }}
          onClose={() => setShowProviderLogin(false)}
        />
      )}

      {/* About pages */}
      {currentPage === 'about-carepath' && <AboutCarePathPage onClose={() => setCurrentPage(null)} />}
      {currentPage === 'about-mhcc'     && <AboutMHCCPage     onClose={() => setCurrentPage(null)} />}
      {currentPage === 'partners'        && <PartnerOrganisationsPage onClose={() => setCurrentPage(null)} />}
      {currentPage === 'news'            && <NewsUpdatesPage   onClose={() => setCurrentPage(null)} />}
    </div>
  )
}
