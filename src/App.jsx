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
import PrivacyPolicy from './components/PrivacyPolicy'
import ProviderLogin from './components/ProviderLogin'
import ProviderLayout from './components/ProviderLayout'
import AboutCarePathPage from './components/AboutCarePathPage'
import AboutMHCCPage from './components/AboutMHCCPage'
import PartnerOrganisationsPage from './components/PartnerOrganisationsPage'
import NewsUpdatesPage from './components/NewsUpdatesPage'
import ServiceOverviewPage from './components/ServiceOverviewPage'
import { DEMO_PROVIDER } from './data/demoProvider'
import { preloadAvatars } from './utils/avatarPreload'

export default function App() {
  const [showForm, setShowForm] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showProviderLogin, setShowProviderLogin] = useState(false)
  const [providerUser, setProviderUser] = useState(null)
  const [currentPage, setCurrentPage] = useState(null)
  const [initialSupportTypes, setInitialSupportTypes] = useState([])

  useEffect(() => {
    let link = document.querySelector("link[rel='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.type = 'image/png'
    link.href = carePathIcon

    preloadAvatars([
      'Inga Matthews',
      DEMO_PROVIDER.admin.name,
      ...DEMO_PROVIDER.members.map(member => member.name),
    ])
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

  const openIntakeForm = (supportTypes = []) => {
    setInitialSupportTypes(supportTypes)
    setCurrentPage(null)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Navbar
        onSeekSupport={() => openIntakeForm()}
        onProviderLogin={() => setShowProviderLogin(true)}
        onNavigate={page => setCurrentPage(page)}
      />
      <main>
        <Hero
          onSeekSupport={() => openIntakeForm()}
        />
        <HowItWorks />
        <AboutMHCC />
        <ServicesGrid onOpenService={slug => setCurrentPage(`service:${slug}`)} />
        <CallToAction onSeekSupport={() => openIntakeForm()} />
      </main>
      <Footer onPrivacyClick={() => setShowPrivacy(true)} />

      {showForm && (
        <IntakeForm
          onClose={() => setShowForm(false)}
          onPrivacy={() => setShowPrivacy(true)}
          initialSupportTypes={initialSupportTypes}
        />
      )}
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
      {currentPage?.startsWith('service:') && (
        <ServiceOverviewPage
          slug={currentPage.replace('service:', '')}
          onClose={() => setCurrentPage(null)}
          onNavigate={slug => setCurrentPage(`service:${slug}`)}
          onSeekSupport={openIntakeForm}
        />
      )}
    </div>
  )
}
