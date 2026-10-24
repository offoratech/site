import PageTransition from '../components/layout/PageTransition.jsx'
import ContactInfo from '../components/contact/ContactInfo.jsx'
import ContactForm from '../components/contact/ContactForm.jsx'

export default function Contact() {
  return (
    <PageTransition>
      <section className="container-offora grid gap-16 pt-44 pb-32 sm:pt-56 sm:pb-48 lg:grid-cols-2 lg:gap-4">
        <ContactInfo />
        <ContactForm />
      </section>
    </PageTransition>
  )
}
