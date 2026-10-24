// Copy and data for the Offora Tech home page.
// Client logos are re-exported from the project's existing data source
// (src/data/clients.js) rather than duplicated here, so this page and
// TrustedBy/Testimonials elsewhere on the site can never drift apart.
import { clients } from '../data/clients.js'

export { clients }

export const contactEmail = 'ceo@offoratech.com'

export const testimonials = [
  {
    quote: 'Offora handled the build and the marketing together, so we never had to explain the same thing twice to two different teams.',
    org: 'Beetzo',
    role: 'Founder & CEO',
  },
  {
    quote: 'They actually took the time to understand how our business runs before touching anything. That showed in the final result.',
    org: 'Aasife Biriyani',
    role: 'Managing Director',
  },
  {
    quote: 'Straightforward to work with, no hand-offs, no lost context. Questions got answered by someone who actually knew the project.',
    org: 'Global Mission Hospital',
    role: 'Executive Director',
  },
  {
    quote: 'Fast turnaround and the site still looks and works the way we wanted six months later, not just on launch day.',
    org: 'Hidude',
    role: 'Founder & CEO',
  },
  {
    quote: 'One team for the website and the outreach meant fewer meetings and things actually got done on time.',
    org: 'St. Michael College of Engineering and Technology',
    role: 'Principal',
  },
]
