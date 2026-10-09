import './page-fixtures.css';
import card from '../card/card.twig';
import '../card/card.css';
import content from '../content/content.twig';
import '../content/content.css';
import editorialTeaser from '../editorial-teaser/editorial-teaser.twig';
import '../editorial-teaser/editorial-teaser.css';
import hero from '../hero/hero.twig';
import '../hero/hero.css';
import media from '../media/media.twig';
import '../media/media.css';
import pageTitle from '../page-title/page-title.twig';
import '../page-title/page-title.css';
import personTeaser from '../person-teaser/person-teaser.twig';
import '../person-teaser/person-teaser.css';
import caseStudyTeaser from '../case-study-teaser/case-study-teaser.twig';
import '../case-study-teaser/case-study-teaser.css';
import primaryPageCta from '../primary-page-cta/primary-page-cta.twig';
import '../primary-page-cta/primary-page-cta.css';
import quote from '../quote/quote.twig';
import '../quote/quote.css';
import {
  placeholderIcon,
  placeholderImage,
  quotePortrait,
} from '../../.storybook/fixtures';

const fixtureImage = {
  ...placeholderImage,
  alt: 'Government service project image',
};

const caseStudies = [
  {
    client: 'Department of Veterans Affairs',
    title: 'Helping Veterans access care and benefits online',
    summary: 'A modern content platform for a service people depend on.',
    teaserlink: '/case-studies/va-cms-modernization/',
  },
  {
    client: 'National Science Foundation',
    title: 'A smoother path to scientific research and discovery',
    summary: 'A clearer digital experience for complex research workflows.',
    teaserlink: '/case-studies/nsf-website-redesign/',
  },
  {
    client: 'Centers for Medicare and Medicaid Services',
    title: 'Improving the online experience for Medicare beneficiaries',
    summary: 'Human-centered design for people navigating important benefits.',
    teaserlink: '/case-studies/cms-web-experience-services/',
  },
];

const homepageCaseStudies = [
  {
    client: 'U.S. Department of Veterans Affairs',
    title: 'Helping Veterans access care and benefits online',
    summary: 'A modern content platform for a service people depend on.',
    teaserlink: '/case-studies/va-cms-modernization/',
  },
  {
    client: 'U.S. Department of Education',
    title: 'Modern learning platforms for adult education practitioners',
    summary: 'A clearer digital experience for adult education practitioners.',
    teaserlink:
      '/case-studies/dept-of-education-system-lifecycle-development-management/',
  },
  {
    client: 'Centers for Medicare and Medicaid Services',
    title:
      'Improving the online experience for Medicare beneficiaries with WECMS',
    summary: 'Human-centered design for people navigating important benefits.',
    teaserlink: '/case-studies/cms-web-experience-services/',
  },
];

const people = [
  ['Alex Rivera', 'Co-Founder & Government Solutions Lead'],
  ['Jordan Lee', 'Director of Digital Services'],
  ['Taylor Morgan', 'Front End Engineer'],
  ['Casey Nguyen', 'Learning Experience Designer'],
  ['Riley Brooks', 'Product Designer'],
  ['Morgan Ellis', 'Back End Engineer'],
];

const header = `
  <header class="ca-page-fixture__header">
    <a class="ca-page-fixture__brand" href="/">CivicActions</a>
    <nav class="ca-page-fixture__nav" aria-label="Primary navigation">
      <a class="ca-page-fixture__nav-link" href="/services/">Services</a>
      <a class="ca-page-fixture__nav-link" href="/case-studies/">Case studies</a>
      <a class="ca-page-fixture__nav-link" href="/team/">Team</a>
      <a class="ca-page-fixture__nav-link" href="/contact/">Contact</a>
    </nav>
  </header>
`;

const footer = `
  <footer class="ca-page-fixture__footer">
    CivicActions builds trusted public services through open technology and design.
  </footer>
`;

const shell = (body) => `
  <div class="ca-page-fixture">
    ${header}
    <main class="ca-page-fixture__main">${body}</main>
    ${footer}
  </div>
`;

const renderCaseStudy = (item) =>
  caseStudyTeaser({
    ...item,
    image: fixtureImage,
  });

const renderPerson = ([name, role]) =>
  personTeaser({
    heading_level: 3,
    name,
    role,
    image: quotePortrait,
    teaserlink: '',
    bio: '',
  });

const todo = (label, detail) => `
  <aside class="ca-page-fixture__todo">
    <strong class="ca-page-fixture__todo-label">TODO: ${label}</strong>
    <span class="ca-page-fixture__todo-detail">${detail}</span>
  </aside>
`;

const renderServiceCard = ([title, body, link]) =>
  card({
    heading_level: 3,
    title,
    link,
    icon: placeholderIcon,
    icon_alt: 'Service category icon',
    body,
  });

const renderEditorial = ([title, description, teaserlink]) =>
  editorialTeaser({
    variant: 'press',
    layout: 'compact',
    title,
    description,
    teaserlink,
  });

const serviceBlock = ({ id, title, body, cards, cta }) => `
  <section id="${id}" class="ca-page-fixture__service-block">
    <h2 class="ca-page-fixture__section-heading">${title}</h2>
    <div class="ca-page-fixture__two-column">
      ${content({ body })}
      <div class="ca-page-fixture__card-grid">
        ${cards.map(renderCaseStudy).join('')}
      </div>
    </div>
    ${cta ? `<p><a class="ca-page-fixture__jump-link" href="/contact/">${cta}</a></p>` : ''}
  </section>
`;

const homepage = () =>
  shell(`
    <section class="ca-page-fixture__intro">
      ${hero({
        title:
          'We help government deliver trusted public services through open technology and design.',
        eyebrow: '',
        summary: '',
        variant: 'flush',
        primary_button_text: '',
        primary_button_url: '',
        secondary_button_text: '',
        secondary_button_url: '',
      })}
      ${todo('Hero media treatment', 'Legacy uses a full hero image. The current Hero SDC does not yet expose an image/media prop.')}
    </section>

    <section class="ca-page-fixture__section ca-page-fixture__section--band">
      <div class="ca-page-fixture__section-inner">
        <h2 class="ca-page-fixture__section-heading">Trusted by organizations that serve the people.</h2>
        ${todo('Client logo rail', 'The legacy page uses a responsive strip of client logos. A reusable logo-grid SDC is still needed.')}
        <ul class="ca-page-fixture__client-list">
          ${[
            'State of Georgia',
            'U.S. Veterans Affairs',
            'National Science Foundation',
            'U.S. Department of Education',
            'Centers for Medicare and Medicaid Services',
            'U.S. Department of Health & Human Services',
            'U.S. Department of Agriculture',
            'Federal Communications Commission',
            'Smithsonian',
          ]
            .map(
              (client) =>
                `<li class="ca-page-fixture__client-name">${client}</li>`,
            )
            .join('')}
        </ul>
      </div>
    </section>

    <section class="ca-page-fixture__section">
      <h2 class="ca-page-fixture__section-heading">Digital first. Data driven. Human centered.</h2>
      ${content({
        body: "<p>Bringing government services up to today's standards requires new ways of thinking and working.</p><p>We can help you improve how people, process, and technology work together at your agency for lasting digital transformation.</p>",
        narrow: true,
      })}
      <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
        ${[
          [
            'Web & CMS',
            'Accessible and secure government websites at scale.',
            '/services/#web-cms',
          ],
          [
            'IT & Service Modernization',
            'Modernization of legacy government systems and services.',
            '/services/#service-modernization',
          ],
          [
            'Product & Design',
            'Human-centered problem solving and strategy.',
            '/services/#product-design',
          ],
          [
            'Security & Compliance',
            'Modern security practices for continuous compliance and reliability.',
            '/services/#security-compliance',
          ],
          [
            'Data Services',
            'Open data sharing to drive evidence-based decisions.',
            '/services/#data-services',
          ],
          [
            'Workforce Development',
            'Modern skills for an adaptable government workforce.',
            '/services/#workforce-development',
          ],
        ]
          .map(renderServiceCard)
          .join('')}
      </div>
    </section>

    <section class="ca-page-fixture__section ca-page-fixture__section--band">
      <div class="ca-page-fixture__section-inner">
        <h2 class="ca-page-fixture__section-heading">Resilient agencies. Accessible services. Happier people.</h2>
        <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
          ${homepageCaseStudies.map(renderCaseStudy).join('')}
        </div>
      </div>
    </section>

    <section class="ca-page-fixture__section">
      <h2 class="ca-page-fixture__section-heading">Learn with us.</h2>
      ${content({
        body: '<p>Thoughts and takeaways from our work in the field.</p>',
        narrow: true,
      })}
      <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
        ${[
          [
            'Designing a Veteran-first online experience',
            'How we help VA deliver consistent and useful information.',
            'https://medium.com/civicactions/designing-a-veteran-first-experience-for-va-gov-4ce3524203fb',
          ],
          [
            'Improving the ATO process with Compliance as Code',
            'Better and faster security for government IT systems.',
            'https://medium.com/civicactions/policy-recommendations-for-improving-the-ato-process-through-compliance-as-code-524e3005fceb',
          ],
          [
            'One Drupal platform, multiple government products',
            'One Drupal platform, multiple government products.',
            'https://medium.com/civicactions/one-drupal-platform-multiple-government-products-bb1c401315cc',
          ],
        ]
          .map(renderEditorial)
          .join('')}
      </div>
    </section>

    <section class="ca-page-fixture__section ca-page-fixture__section--band">
      <div class="ca-page-fixture__section-inner">
        <h2 class="ca-page-fixture__section-heading">Our people make the difference.</h2>
        <div class="ca-page-fixture__two-column">
          ${content({
            body: '<p>We are leaders in civic tech and design, committed to working in ways that make life better for our clients and each other.</p><p><a href="/team/">Meet our team</a></p>',
          })}
          ${media({
            image: fixtureImage,
            video_url: '',
            video_title: 'CivicActions team story',
            caption:
              'Large group of smiling CivicActions team members on a video call.',
            transcript_url: '',
          })}
        </div>
      </div>
    </section>

    <section class="ca-page-fixture__section">
      ${quote({
        quote:
          '“CivicActions always looked for the optimal solutions to difficult problems and improved constantly on delivered functionality. They responded with agility, creativity, and skill to any challenge that was thrown at them.”',
        name: 'Katrina Barry',
        role: 'Contracting Officer, National Science Foundation',
        background: 'gray',
      })}
    </section>

    <section class="ca-page-fixture__cta">
      ${primaryPageCta({
        title: "Let's build a public success story.",
        subtitle: 'Get in touch to start.',
        variant: 'home',
        primary_button_text: 'Put us to work',
        primary_button_url: '/contact/',
        secondary_button_text: 'Join our team',
        secondary_button_url: '/careers/',
      })}
    </section>
  `);

const services = () =>
  shell(`
    <section class="ca-page-fixture__intro ca-page-fixture__hero">
      ${hero({
        title: 'Government services that build public trust',
        summary:
          'At its core, digital transformation is about improving the customer experience of government. We use thoughtful design and open source technologies to help you deliver modern public services that put people first.',
        variant: 'flush',
        primary_button_text: '',
        primary_button_url: '',
        secondary_button_text: '',
        secondary_button_url: '',
      })}
    </section>
    <section class="ca-page-fixture__section">
      <div class="ca-page-fixture__sidebar-layout">
        <aside class="ca-page-fixture__sidebar">
          <h2 class="ca-page-fixture__sidebar-title">Services page sections in sidebar</h2>
          <nav aria-label="Services page sections">
            <ul class="ca-page-fixture__sidebar-links">
              ${[
                ['web-cms', 'Web & CMS'],
                ['service-modernization', 'IT & Service Modernization'],
                ['product-design', 'Product & Design'],
                ['security-compliance', 'Security & Compliance'],
                ['data-services', 'Data Services'],
                ['workforce-development', 'Workforce Development'],
              ]
                .map(
                  ([id, label]) =>
                    `<li><a class="ca-page-fixture__jump-link" href="#${id}">${label}</a></li>`,
                )
                .join('')}
            </ul>
          </nav>
        </aside>
        <div class="ca-page-fixture__services-main">
          ${serviceBlock({
            id: 'web-cms',
            title: 'Accessible and secure government websites at scale',
            body: '<p>Government websites have complex information and diverse user groups, but they can be made surprisingly usable and maintainable.</p><ul><li>CMS development and migration</li><li>User experience and visual design</li><li>Content design and strategy</li><li>Maintenance and support</li></ul>',
            cards: caseStudies.slice(0, 2),
            cta: 'Improve your website',
          })}
          ${serviceBlock({
            id: 'service-modernization',
            title: 'Modernization of legacy government systems and services',
            body: '<p>We help agencies transform legacy applications and improve workflows using human-centered design, automation, and secure infrastructure.</p><ul><li>Service design</li><li>Cloud adoption and migration</li><li>DevSecOps</li><li>Technology strategy consulting</li></ul>',
            cards: caseStudies.slice(1),
            cta: 'Work smarter',
          })}
          ${serviceBlock({
            id: 'product-design',
            title: 'Human-centered problem solving and strategy',
            body: '<p>Before building anything new, we define problems and desired outcomes, understand the ecosystem, and choose an approach that serves people and business goals.</p>',
            cards: caseStudies.slice(0, 2),
            cta: 'Design a better future',
          })}
          ${serviceBlock({
            id: 'security-compliance',
            title:
              'Modern security practices for continuous compliance and reliability',
            body: '<p>We help teams shift left with automated processes that keep development and operations in sync, with security and compliance woven in from the start.</p><ul><li>DevSecOps</li><li>Continuous compliance</li><li>Site Reliability Engineering</li><li>Security consulting and training</li></ul>',
            cards: caseStudies.slice(0, 2),
            cta: 'Re-think security',
          })}
          ${serviceBlock({
            id: 'data-services',
            title: 'Open data sharing to drive evidence-based decisions',
            body: '<p>Open, discoverable, and usable data helps government serve people better and powers useful applications.</p><ul><li>Data program strategy</li><li>Data cataloging and maintenance</li><li>Data platform migration</li><li>Data visualizations and dashboards</li></ul>',
            cards: caseStudies.slice(0, 2),
            cta: 'Be data-driven',
          })}
          ${serviceBlock({
            id: 'workforce-development',
            title: 'Modern skills for an adaptable government workforce',
            body: '<p>Consulting and training help teams build skills in modern ways of working and increase resilience.</p><ul><li>DITAP program certification</li><li>Agile and human-centered design coaching</li><li>Technology strategy consulting</li></ul>',
            cards: caseStudies.slice(1),
            cta: 'Upskill your team',
          })}
          <section class="ca-page-fixture__service-block ca-page-fixture__service-block--band">
            <h2 class="ca-page-fixture__section-heading">Open standards. Inclusive practices. Better outcomes.</h2>
            ${content({ body: '<p>Accessibility, Agile, DevSecOps, distributed teams, Drupal, human-centered design, open source, and open data power the work.</p>' })}
          </section>
        </div>
      </div>
    </section>
    <section class="ca-page-fixture__cta">
      ${primaryPageCta({
        title: 'Start building public trust.',
        subtitle: "Let's create better government services.",
        variant: 'default',
        primary_button_text: 'Hire us',
        primary_button_url: '/contact/',
        secondary_button_text: 'Contracting info',
        secondary_button_url: '/contracting/',
      })}
    </section>
  `);

const team = () =>
  shell(`
    <section class="ca-page-fixture__intro">
      ${pageTitle({
        title: 'Meet the humans of CivicActions',
        subtitle:
          'People who work with us say there is something special about our team.',
        heading_level: 1,
        alignment: 'left',
      })}
      ${content({
        body: "<p>We are good listeners, strategic thinkers, honest communicators, and problem solvers. Let's get to know each other.</p>",
        narrow: true,
      })}
      <ul class="ca-page-fixture__filters" aria-label="Team filters by role">
        <li><a class="ca-page-fixture__filter ca-page-fixture__filter--active" href="#team-grid">All</a></li>
        <li><a class="ca-page-fixture__filter" href="#team-grid">Leadership</a></li>
        <li><a class="ca-page-fixture__filter" href="#team-grid">Product & Design</a></li>
        <li><a class="ca-page-fixture__filter" href="#team-grid">Engineering</a></li>
        <li><a class="ca-page-fixture__filter" href="#team-grid">Client Services</a></li>
      </ul>
    </section>
    <section id="team-grid" class="ca-page-fixture__grid-region">
      <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
        ${people.map(renderPerson).join('')}
      </div>
    </section>
    <section class="ca-page-fixture__cta">
      ${primaryPageCta({
        title: "Let's build a public success story.",
        subtitle: 'Get in touch to start.',
        variant: 'default',
        primary_button_text: 'Put us to work',
        primary_button_url: '/contact/',
        secondary_button_text: 'Join our team',
        secondary_button_url: '/careers/',
      })}
    </section>
  `);

const caseStudiesPage = () =>
  shell(`
    <section class="ca-page-fixture__intro">
      ${pageTitle({
        title: 'Work that makes a difference',
        subtitle: 'Our work impacts the daily lives of millions of people.',
        heading_level: 1,
        alignment: 'left',
      })}
      ${content({
        body: '<p>See how we have helped agencies build resilient services at scale.</p>',
        narrow: true,
      })}
      <ul class="ca-page-fixture__filters" aria-label="Filter by service category">
        <li><a class="ca-page-fixture__filter ca-page-fixture__filter--active" href="#case-study-grid">All work</a></li>
        <li><a class="ca-page-fixture__filter" href="#case-study-grid">Web & CMS</a></li>
        <li><a class="ca-page-fixture__filter" href="#case-study-grid">Product & Design</a></li>
        <li><a class="ca-page-fixture__filter" href="#case-study-grid">Data Services</a></li>
        <li><a class="ca-page-fixture__filter" href="#case-study-grid">Security & Compliance</a></li>
      </ul>
    </section>
    <section id="case-study-grid" class="ca-page-fixture__grid-region">
      <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
        ${caseStudies.concat(caseStudies).map(renderCaseStudy).join('')}
      </div>
    </section>
    <section class="ca-page-fixture__cta">
      ${primaryPageCta({
        title: "Let's build a public success story.",
        subtitle: 'Get in touch to start.',
        variant: 'default',
        primary_button_text: 'Put us to work',
        primary_button_url: '/contact/',
        secondary_button_text: 'Join our team',
        secondary_button_url: '/careers/',
      })}
    </section>
  `);

const meta = {
  title: 'Pages/Legacy Reconstructions',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Homepage = {
  render: homepage,
};

export const Services = {
  render: services,
};

export const Team = {
  render: team,
};

export const CaseStudies = {
  render: caseStudiesPage,
};
