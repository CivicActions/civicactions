import '../../css/layout.css';
import card from '../card/card.twig';
import '../card/card.css';
import content from '../content/content.twig';
import '../content/content.css';
import editorialTeaser from '../editorial-teaser/editorial-teaser.twig';
import '../editorial-teaser/editorial-teaser.css';
import hero from '../hero/hero.twig';
import '../hero/hero.css';
import linkButton from '../link-button/link-button.twig';
import '../link-button/link-button.css';
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
import '../section/section.css';
import sectionFixture from '../section/section-fixture.twig';
import siteFooter from '../site-footer/site-footer-preview.twig';
import '../site-footer/site-footer.css';
import socialLinksTemplate from '../social-links/social-links-preview.twig';
import '../social-links/social-links.css';
import {
  placeholderIcon,
  placeholderImage,
  quotePortrait,
} from '../../.storybook/fixtures';
import { socialLinkIcons } from '../social-links/social-links-fixtures';

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
  ['Aaron Pava', 'Chief Experience Officer'],
  ['Adrian Cooke', 'Content Designer'],
  ['Alaine Karoleff', 'Director of Digital Services'],
  ['Alanna Blinn', 'Technical Writer'],
  ['Alex Kerr', 'Front End Engineer'],
  ['Allison Conley', 'In-house Counsel'],
];

const ditapPeople = [
  [
    'Kristen Jernigan',
    'Learning Experience Designer',
    'Helps public servants build practical digital delivery skills.',
  ],
  [
    'Chianti Lomax',
    'Workforce Development Lead',
    'Brings procurement and product experience to the classroom.',
  ],
  [
    'Farooq Zakhilwal',
    'Program Manager',
    'Teaches teams how to turn policy goals into useful services.',
  ],
  [
    'Kelly Smith',
    'Associate Director of Design',
    'Supports learners as they apply the program in their agencies.',
  ],
];

const agencyNames = [
  'State of Georgia',
  'U.S. Veterans Affairs',
  'National Science Foundation',
  'U.S. Department of Education',
  'Centers for Medicare and Medicaid Services',
  'U.S. Department of Health & Human Services',
  'U.S. Department of Agriculture',
  'Federal Communications Commission',
  'Smithsonian',
];

const agencyDecision =
  'Agency names replace legacy agency seals in the Drupal MVP to reduce governance risk; no custom logo rail is planned.';

const todoDetails = {
  heroMedia:
    'Legacy pages use prominent hero media. Hero media support is a separate follow-up ticket.',
  proofpoints:
    'The planned Proofpoints SDC will own this 1 to 3 item metric pattern.',
  icon: 'Legacy DITAP feature cards use simple visual markers. The reusable Icon SDC belongs to MAHOM-1184.',
  accordion:
    'The legacy DITAP page uses expandable FAQs. The accessible Accordion SDC belongs to MAHOM-1184.',
};

const header = `
  <header class="ca-container">
    <a href="/">CivicActions</a>
    <nav aria-label="Primary navigation">
      <a href="/services/">Services</a>
      <a href="/case-studies/">Case studies</a>
      <a href="/team/">Team</a>
      <a href="/contact/">Contact</a>
    </nav>
  </header>
`;

const footer = () =>
  siteFooter({
    heading_id: 'fixture-footer-menu',
    branding_logo: '<span class="footer__branding-text">CivicActions</span>',
    social_links: socialLinksTemplate({
      ...socialLinkIcons,
      vimeo_url: 'https://vimeo.com/civicactions',
      bluesky_url: 'https://bsky.app/profile/civicactions.com',
      x_url: 'https://twitter.com/civicactions?lang=en',
      linkedin_url: 'https://www.linkedin.com/company/civicactions/mycompany/',
    }),
  });

const shell = (body) => `
  <div class="ca-page">
    ${header}
    <main class="ca-page__main">${body}</main>
    ${footer()}
  </div>
`;

const renderCaseStudy = (item) =>
  caseStudyTeaser({
    ...item,
    image: fixtureImage,
  });

const renderPerson = ([name, role, bio = '']) =>
  personTeaser({
    heading_level: 3,
    name,
    role,
    image: quotePortrait,
    teaserlink: '',
    bio,
  });

const todo = (label, detail) => `
  <aside>
    <mark><strong>TODO: ${label}</strong></mark>
    <span>${detail}</span>
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

const renderAgencyList = (agencies = agencyNames) => `
  <ul class="ca-grid ca-grid--3-col">
    ${agencies.map((agency) => `<li>${agency}</li>`).join('')}
  </ul>
`;

const renderProofpointPreview = (items) => `
  ${todo('Proofpoints SDC', todoDetails.proofpoints)}
  <ul class="ca-grid ca-grid--3-col">
    ${items
      .map(
        ([stat, label]) => `
          <li>
            <strong>${stat}</strong>
            <span>${label}</span>
          </li>
        `,
      )
      .join('')}
  </ul>
`;

const serviceBlock = ({ id, title, body, cards, cta }) => `
  ${sectionFixture({
    layout: 'one',
    padding: 'small',
    background_color: 'white',
    width: 'full',
    section_id: id,
    column_one: `
      <div class="ca-container">
        <h2>${title}</h2>
        <div class="ca-grid ca-grid--2-1">
          ${content({ body })}
          <div class="ca-grid">
            ${cards.map(renderCaseStudy).join('')}
          </div>
        </div>
        ${cta ? `<p>${linkButton({ text: cta, src: '/contact/' })}</p>` : ''}
      </div>
    `,
  })}
`;

const homepage = () =>
  shell(`
    <section class="ca-container ca-section ca-section--medium">
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
      ${todo('Hero media treatment', todoDetails.heroMedia)}
    </section>

    <section class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        <h2>Trusted by organizations that serve the people.</h2>
        <p>${agencyDecision}</p>
        ${renderAgencyList()}
      </div>
    </section>

    <section class="ca-container ca-section ca-section--medium">
      <h2>Digital first. Data driven. Human centered.</h2>
      ${content({
        body: "<p>Bringing government services up to today's standards requires new ways of thinking and working.</p><p>We can help you improve how people, process, and technology work together at your agency for lasting digital transformation.</p>",
        narrow: true,
      })}
      <div class="ca-grid ca-grid--3-col">
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

    <section class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        <h2>Resilient agencies. Accessible services. Happier people.</h2>
        <div class="ca-grid ca-grid--3-col">
          ${homepageCaseStudies.map(renderCaseStudy).join('')}
        </div>
      </div>
    </section>

    <section class="ca-container ca-section ca-section--medium">
      <h2>Learn with us.</h2>
      ${content({
        body: '<p>Thoughts and takeaways from our work in the field.</p>',
        narrow: true,
      })}
      <div class="ca-grid ca-grid--3-col">
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
          [
            'A community of practice for government accessibility',
            'Building shared accessibility knowledge across government teams.',
            'https://medium.com/civicactions/launching-a-community-of-practice-for-accessibility-in-government-services-b0b085cd90d6',
          ],
        ]
          .map(renderEditorial)
          .join('')}
      </div>
    </section>

    <section class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        <h2>Our people make the difference.</h2>
        <div class="ca-grid ca-grid--2-1">
          ${content({
            body: '<p>We are leaders in civic tech and design, committed to working in ways that make life better for our clients and each other.</p>',
          })}
          <p>${linkButton({ text: 'Meet our team', src: '/team/' })}</p>
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

    <section class="ca-container ca-section ca-section--medium">
      ${quote({
        quote:
          '“CivicActions always looked for the optimal solutions to difficult problems and improved constantly on delivered functionality. They responded with agility, creativity, and skill to any challenge that was thrown at them.”',
        name: 'Katrina Barry',
        role: 'Contracting Officer, National Science Foundation',
        background: 'gray',
      })}
    </section>

    <section class="ca-container">
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
    <section class="ca-container ca-section ca-section--medium">
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
    <section class="ca-container ca-section ca-section--medium">
      <nav aria-label="Services page sections">
        <h2>Services page sections</h2>
        <ul class="ca-grid">
          ${[
            ['web-cms', 'Web & CMS'],
            ['service-modernization', 'IT & Service Modernization'],
            ['product-design', 'Product & Design'],
            ['security-compliance', 'Security & Compliance'],
            ['data-services', 'Data Services'],
            ['workforce-development', 'Workforce Development'],
          ]
            .map(([id, label]) => `<li><a href="#${id}">${label}</a></li>`)
            .join('')}
        </ul>
      </nav>
      <div>
          ${serviceBlock({
            id: 'web-cms',
            title: 'Accessible and secure government websites at scale',
            body: '<p>Government websites have complex information and diverse user groups, but they can be made surprisingly usable and maintainable. We can help you plan a content strategy that merges business goals with user needs (and makes life easier for your staff!) then build a flexible and secure content management system that will grow with you into the future.</p><ul><li>Accessibility consulting and training</li><li>Research and discovery</li><li>CMS development and migration</li><li>User experience and visual design</li><li>Custom front end development</li><li>Content design and strategy</li><li>Maintenance and support</li><li>Cloud infrastructure</li><li>Product management</li><li>Agile delivery management</li></ul>',
            cards: caseStudies.slice(0, 2),
            cta: 'Improve your website',
          })}
          ${serviceBlock({
            id: 'service-modernization',
            title: 'Modernization of legacy government systems and services',
            body: '<p>Outdated systems and paper-based processes make it hard for agency staff to efficiently meet the needs of people who depend on critical government services. We help you transform legacy applications and improve workflows using human-centered design, automation, and scalable, secure infrastructure.</p><ul><li>Research and discovery</li><li>Service design</li><li>Cloud adoption and migration</li><li>DevSecOps</li><li>Site Reliability Engineering (SRE)</li><li>Custom front end development</li><li>Infrastructure and platform modernization</li><li>Accessibility consulting and training</li><li>API design and cloud native development</li><li>Technology strategy consulting</li></ul>',
            cards: caseStudies.slice(1),
            cta: 'Work smarter',
          })}
          ${serviceBlock({
            id: 'product-design',
            title: 'Human-centered problem solving and strategy',
            body: '<p>No matter what the challenge is, technology is only one part of the solution. Before building anything new, we work with you to define problems and desired outcomes, understand the customer and stakeholder ecosystem, decide on an approach that serves business goals and user needs, and make plans for facilitating adoption and measuring success.</p><ul><li>Research and discovery</li><li>Product management</li><li>Customer experience and service design</li><li>Accessibility consulting and training</li><li>User experience and visual design</li><li>Content design and strategy</li><li>Business and impact analysis</li><li>Agile and Human-Centered Design training</li><li>Change management consulting</li></ul>',
            cards: caseStudies.slice(0, 2),
            cta: 'Design a better future',
          })}
          ${serviceBlock({
            id: 'security-compliance',
            title:
              'Modern security practices for continuous compliance and reliability',
            body: '<p>People want to know their government will keep sensitive information safe, but traditional compliance regulations are cumbersome and do not provide an accurate measure of security. We help you shift left with automated processes that keep development and operations teams in sync, with security and compliance woven in from the start, for faster deployment of secure and stable code.</p><ul><li>DevSecOps</li><li>Continuous integration and deployment (CI/CD)</li><li>Site Reliability Engineering (SRE)</li><li>Continuous monitoring and automated compliance</li><li>Rapid and automated Authority to Operate (ATO)</li><li>Continuous compliance and Compliance as Code</li><li>Security consulting and training</li><li>Free and open source software (FOSS) security</li></ul>',
            cards: caseStudies.slice(0, 2),
            cta: 'Re-think security',
          })}
          ${serviceBlock({
            id: 'data-services',
            title: 'Open data sharing to drive evidence-based decisions',
            body: '<p>Government can serve people best when public data is open, discoverable, and usable. We can help you create a data strategy and comply with open data mandates using open source tools to aggregate, catalog, and standardize your data. Then it is ready to use, by your staff or the public, to make informed decisions, track metrics, and power useful apps.</p><ul><li>Data program strategy</li><li>Open data compliance</li><li>Research of data users and their needs</li><li>Data cataloging and maintenance</li><li>Data platform migration and modernization</li><li>Custom search and analysis applications</li><li>Data visualizations and dashboards</li><li>Helpdesk support for your data platform</li><li>Data science and analysis</li></ul>',
            cards: caseStudies.slice(0, 2),
            cta: 'Be data-driven',
          })}
          ${serviceBlock({
            id: 'workforce-development',
            title: 'Modern skills for an adaptable government workforce',
            body: '<p>Lasting transformation in government happens from the inside out. Organizational change is hard, but not impossible. We offer consulting and training to help your teams build skills in modern ways of working so your agency can increase resilience, save taxpayer dollars, and serve the public better in the digital age.</p><ul><li>DITAP program certification</li><li>Telework consulting and training</li><li>Agile and Human-Centered Design coaching</li><li>Team culture and performance coaching</li><li>Technology strategy consulting</li><li>Free and open source software (FOSS) education</li><li>Change management consulting</li></ul>',
            cards: caseStudies.slice(1),
            cta: 'Upskill your team',
          })}
          <section class="ca-section ca-section--small ca-section--gray">
            <h2>Open standards. Inclusive practices. Better outcomes.</h2>
            ${content({ body: '<p>No matter what problem we are solving, our core practices and communities power our work and align with current standards for government digital services.</p><p>Accessibility, Agile, DevSecOps, distributed teams, Drupal, human-centered design, open source, open data, and U.S. Web Design Standards.</p>' })}
          </section>
      </div>
    </section>
    <section class="ca-container">
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
    <section class="ca-container ca-section ca-section--medium">
      ${pageTitle({
        title: 'Meet the humans of CivicActions',
        subtitle:
          'People who work with us say there’s “something magical” about our team.',
        heading_level: 1,
        alignment: 'left',
      })}
      ${content({
        body: '<p>We are good listeners, strategic thinkers, honest communicators, and problem solvers. (We’re also cheerful and kind, which is a nice bonus.) Let’s get to know each other!</p>',
        narrow: true,
      })}
      <p>The listing is organized by the Team page category taxonomy. Legacy tab navigation is not carried into the Drupal MVP.</p>
    </section>
    <section id="team-grid" class="ca-container ca-section ca-section--medium">
      <div class="ca-grid ca-grid--3-col">
        ${people.map(renderPerson).join('')}
      </div>
    </section>
    <section class="ca-container ca-section ca-section--medium">
      ${quote({
        quote:
          '“My teammates are brilliant innovators, high performers, and conscientious human beings. Together we’re working to improve lives.”',
        name: 'Alanna Blinn',
        role: 'Technical Writer',
        background: 'gray',
      })}
    </section>
    <section class="ca-container">
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
    <section class="ca-container ca-section ca-section--medium">
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
      <p>Case studies can carry service taxonomy data for listings, but the legacy tab interface is not carried into the Drupal MVP.</p>
    </section>
    <section id="case-study-grid" class="ca-container ca-section ca-section--medium">
      <div class="ca-grid ca-grid--3-col">
        ${caseStudies.concat(caseStudies).map(renderCaseStudy).join('')}
      </div>
    </section>
    <section class="ca-container">
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

const ditap = () =>
  shell(`
    <section class="ca-container ca-section ca-section--medium">
      ${hero({
        eyebrow: 'Digital IT Acquisition Professional',
        title: 'Digital IT Acquisition Professional (DITAP) training',
        summary: 'Helping federal agencies adopt agile acquisition strategies.',
        variant: 'flush',
        primary_button_text: 'Get started',
        primary_button_url: '/services/ditap/register/',
        secondary_button_text: 'Read FAQs',
        secondary_button_url: '#faq',
      })}
      ${todo('Hero media treatment', todoDetails.heroMedia)}
    </section>

    <section class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        <div class="ca-grid ca-grid--2-1">
          <div>
            <h2>Lead the change</h2>
            ${content({
              body: '<p>Join the contracting officers who have already earned the Digital Services Credential (formerly the FAC-C-DS) to master successful procurement strategies and become agents of change in today’s digital world. After you graduate from DITAP, we help you stay connected with a strong community of leaders in the modern acquisition community.</p>',
              narrow: true,
            })}
            <p>${agencyDecision}</p>
            ${renderAgencyList([
              'U.S. Digital Service',
              'Office of Federal Procurement Policy',
              'Federal Acquisition Institute',
              'U.S. Department of Veterans Affairs',
              'Department of Homeland Security',
              'Department of Energy',
              'Department of Labor',
              'National Aeronautics and Space Administration',
              'National Archives and Records Administration',
            ])}
          </div>
          ${media({
            image: {
              ...fixtureImage,
              alt: 'Traffic signal against the sky',
            },
            video_url: '',
            video_title: 'DITAP training program image',
            caption: '',
            transcript_url: '',
          })}
        </div>
      </div>
    </section>

    <section class="ca-container ca-section ca-section--medium">
      <h2>The CivicActions difference</h2>
      ${renderProofpointPreview([
        [
          '92%',
          'of CivicActions DITAP participants would recommend it to a colleague',
        ],
        ['438', 'contracting officers graduated from our program to date'],
        [
          '100%',
          'of learners reported they have “clear takeaways from the course”',
        ],
      ])}
      <h2>What you’ll learn</h2>
      <h2>Dates and cost</h2>
      <div class="ca-grid ca-grid--3-col">
        ${[
          [
            'Start where you are',
            'Build a clear grasp of agile and human-centered design before diving into DITAP course content.',
            '/services/ditap/#learn',
          ],
          [
            'On your own time',
            'Complete some coursework asynchronously with flexible scheduling for your procurement season.',
            '/services/ditap/#learn',
          ],
          [
            'Real-world practice',
            'Practice the techniques through interviewing and shadowing assignments.',
            '/services/ditap/#learn',
          ],
          [
            'Expert, invested coaches',
            'Our facilitators bring years of experience leading procurement modernization and organizational transformation in government. They provide personalized support throughout your DITAP journey.',
            '/services/ditap/#learn',
          ],
          [
            'Ongoing community network',
            'Your colleagues from DITAP class become your future collaboration network through participation in CivicActions-supported DITAP alumni community activities.',
            '/services/ditap/#learn',
          ],
        ]
          .map(renderServiceCard)
          .join('')}
      </div>
      <h3>Ready to get certified?</h3>
      <p>${linkButton({
        text: 'Request training',
        src: '/services/ditap/register/',
      })}</p>
      ${todo('Icon SDC', todoDetails.icon)}
    </section>

    <div class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        <div class="ca-grid ca-grid--2-col">
          ${quote({
            quote:
              'A lot of us in government know we need to do procurement better, and DITAP is how we make that happen.',
            name: 'Mark Junda',
            role: 'U.S. Digital Service',
            background: 'gray',
          })}
        </div>
      </div>
    </div>

    <section class="ca-container ca-section ca-section--medium">
      <h2>Meet the team</h2>
      <div class="ca-grid ca-grid--4-col">
        ${ditapPeople.map(renderPerson).join('')}
      </div>
    </section>

    <section class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        <h2>DITAP alumni community</h2>
        ${content({
          body: '<p>By graduating from CivicActions DITAP, you gain more than a certification. You join a community of acquisition champions that are working to modernize procurement and build productive relationships between digital service vendors and the government. Proud alumni of the CivicActions DITAP program include:</p><ul><li>Jaime Gracia, Acquisition Manager, Internal Revenue Service</li><li>Scott Simpson, Digital Transformation Lead, U.S. Department of Homeland Security</li><li>Carolyn (CiCi) Taylor, Deputy Director, Health Resources and Services Administration</li><li>Marvin Horne, Director of IT Procurement Office, National Aeronautics and Space Administration (NASA)</li></ul>',
          narrow: true,
        })}
        <p>${linkButton({ text: 'Get started', src: '/contact/' })}</p>
      </div>
    </section>

    <section id="faq" class="ca-container ca-section ca-section--medium">
      <h2>Frequently asked questions</h2>
      ${todo('Accordion SDC', todoDetails.accordion)}
      <div class="ca-grid">
        ${[
          'What is the class size?',
          'Is the training customizable?',
          'How much does DITAP cost, and how do I pay?',
          'How was DITAP created?',
          'Is this training required?',
          'When does the next DITAP training begin?',
          'What is the application process?',
          'Terms of Service',
          "What if I don't have a full-cohort? What if I am an individual inquiring for a few colleagues at my agency?",
        ]
          .map(
            (question) => `
              <details>
                <summary>${question}</summary>
                <p>Contact the DITAP team for the current answer and enrollment details.</p>
              </details>
            `,
          )
          .join('')}
      </div>
    </section>

    <section class="ca-container ca-section ca-section--medium ca-section--gray">
      ${quote({
        quote:
          'DITAP has proven to be a great foundation to help me improve procurement across my agency. The skills I learned continue to inform the work I do every day.',
        name: 'Marvin Horne',
        role: 'NASA',
        background: 'gray',
      })}
    </section>

    <section class="ca-container">
      ${primaryPageCta({
        title: 'Ready to fix procurement?',
        subtitle: 'Build practical skills for better public services.',
        variant: 'default',
        primary_button_text: 'Get started',
        primary_button_url: '/services/ditap/register/',
        secondary_button_text: 'Ask a question',
        secondary_button_url: 'mailto:ditap-contact@civicactions.com',
      })}
    </section>
  `);

const utility = () =>
  shell(`
    <section class="ca-container ca-container--narrow ca-section ca-section--medium">
      ${pageTitle({
        title: 'Our privacy policy',
        subtitle:
          'How CivicActions handles information shared through this site.',
        heading_level: 1,
        alignment: 'left',
      })}
    </section>
    <section class="ca-container ca-container--narrow ca-section ca-section--medium">
      <div>
        ${content({
          body: `
            <p>This is a plain-language statement explaining how we collect information on our website, and how we use it. Our pledge is to be responsible stewards of any information we collect, and to protect the rights of our site visitors.</p>
            <h3>Have questions? Drop us a line.</h3>
            <h4>What information do we collect?</h4>
            <p>We collect information from you when you register on our site, subscribe to our newsletter, or fill out a form.</p>
            <p>When ordering or registering on our site, you may be asked to enter your name, company name, email address, mailing address, and phone number. You may, however, visit our site anonymously.</p>
            <h4>What do we use your information for?</h4>
            <ul>
              <li>To personalize your experience.</li>
              <li>To improve our website.</li>
              <li>To improve customer service.</li>
              <li>To administer a contest, promotion, survey, or other site feature.</li>
              <li>To send periodic emails about our services and company news.</li>
            </ul>
            <h4>How do we protect your information?</h4>
            <p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access it.</p>
            <h4>Do we use cookies?</h4>
            <p>Yes. We use cookies to understand and save your preferences for future visits and compile aggregate data about site traffic and interaction.</p>
            <h4>Do we disclose your information to outside parties?</h4>
            <p>We do not sell, trade, or otherwise transfer personally identifiable information to outside parties, except as needed to operate our website and business or comply with the law.</p>
            <h4>Contact us</h4>
            <p>If you have questions about this statement, <a href="mailto:contact@civicactions.com">send us an email</a> or contact us at CivicActions, 3527 Mt Diablo Blvd Unit 269, Lafayette, CA 94549, USA, (510) 408-7510.</p>
          `,
          narrow: true,
        })}
      </div>
    </section>
    <section class="ca-container">
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

const caseStudyDetail = () =>
  shell(`
    <section class="ca-container ca-section ca-section--medium">
      ${hero({
        eyebrow: 'Case study',
        title: 'Helping Veterans access care and benefits online',
        summary:
          'A modern content platform helps Veterans find clear, trusted information when they need it.',
        variant: 'flush',
        primary_button_text: '',
        primary_button_url: '',
        secondary_button_text: '',
        secondary_button_url: '',
      })}
      ${todo('Hero media treatment', todoDetails.heroMedia)}
    </section>

    <section class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        ${renderProofpointPreview([
          ['Millions', 'of people served by the platform'],
          ['24/7', 'access to essential information'],
          ['1', 'clearer path through a complex system'],
        ])}
      </div>
    </section>

    <section class="ca-container ca-section ca-section--medium">
      <div class="ca-grid ca-grid--2-1">
        ${content({
          body: `
            <h2>The challenge</h2>
            <p>Veterans and their families needed to navigate a large body of information across services, benefits, and support programs.</p>
            <h2>The solution</h2>
            <p>We helped the team create a clearer content model, improve findability, and build a platform that could evolve with changing needs.</p>
            <h2>The impact</h2>
            <p>The result is a more consistent experience for people looking for answers and for the teams responsible for keeping information current.</p>
          `,
          narrow: true,
        })}
        ${media({
          image: fixtureImage,
          video_url: '',
          video_title: 'Veterans services project image',
          caption: 'A representative image from the Veterans services project.',
          transcript_url: '/case-studies/va-cms-modernization/transcript/',
        })}
      </div>
    </section>

    <section class="ca-container ca-section ca-section--medium">
      ${quote({
        quote:
          'The team brought clarity to a difficult problem and kept the people using the service at the center of every decision.',
        name: 'CivicActions client partner',
        role: 'Department of Veterans Affairs',
        background: 'gray',
      })}
    </section>

    <section class="ca-section ca-section--medium ca-section--gray">
      <div class="ca-section__inner ca-section--one ca-section__inner--constrained">
        <h2>Related case studies</h2>
        <div class="ca-grid ca-grid--3-col">
          ${caseStudies.slice(1).concat(caseStudies.slice(0, 1)).map(renderCaseStudy).join('')}
        </div>
      </div>
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

export const Ditap = {
  render: ditap,
};

export const Utility = {
  render: utility,
};

export const CaseStudyDetail = {
  render: caseStudyDetail,
};
