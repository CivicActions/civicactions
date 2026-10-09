import{c as f}from"./card-yNy09W4A.js";import{c as t}from"./content-_twuiEXK.js";import{e as _}from"./editorial-teaser-DefdmH92.js";import{h as u}from"./hero-FSyKTiQA.js";import{m as v}from"./media-BmSvd4Gf.js";import{t as p}from"./page-title-px6dX6eH.js";import{t as h}from"./person-teaser-CCNlPr8v.js";import{c as b}from"./case-study-teaser-D6uofe-A.js";import{t as n}from"./primary-page-cta-CKGoKZLZ.js";import{t as y}from"./quote-BftUksXy.js";import{a as x,p as w,q as k}from"./fixtures-dG6oNeFV.js";import"./twig-CXPxoFJk.js";const g={...x,alt:"Government service project image"},a=[{client:"Department of Veterans Affairs",title:"Helping Veterans access care and benefits online",summary:"A modern content platform for a service people depend on.",teaserlink:"/case-studies/va-cms-modernization/"},{client:"National Science Foundation",title:"A smoother path to scientific research and discovery",summary:"A clearer digital experience for complex research workflows.",teaserlink:"/case-studies/nsf-website-redesign/"},{client:"Centers for Medicare and Medicaid Services",title:"Improving the online experience for Medicare beneficiaries",summary:"Human-centered design for people navigating important benefits.",teaserlink:"/case-studies/cms-web-experience-services/"}],S=[{client:"U.S. Department of Veterans Affairs",title:"Helping Veterans access care and benefits online",summary:"A modern content platform for a service people depend on.",teaserlink:"/case-studies/va-cms-modernization/"},{client:"U.S. Department of Education",title:"Modern learning platforms for adult education practitioners",summary:"A clearer digital experience for adult education practitioners.",teaserlink:"/case-studies/dept-of-education-system-lifecycle-development-management/"},{client:"Centers for Medicare and Medicaid Services",title:"Improving the online experience for Medicare beneficiaries with WECMS",summary:"Human-centered design for people navigating important benefits.",teaserlink:"/case-studies/cms-web-experience-services/"}],$=[["Alex Rivera","Co-Founder & Government Solutions Lead"],["Jordan Lee","Director of Digital Services"],["Taylor Morgan","Front End Engineer"],["Casey Nguyen","Learning Experience Designer"],["Riley Brooks","Product Designer"],["Morgan Ellis","Back End Engineer"]],C=`
  <header class="ca-page-fixture__header">
    <a class="ca-page-fixture__brand" href="/">CivicActions</a>
    <nav class="ca-page-fixture__nav" aria-label="Primary navigation">
      <a class="ca-page-fixture__nav-link" href="/services/">Services</a>
      <a class="ca-page-fixture__nav-link" href="/case-studies/">Case studies</a>
      <a class="ca-page-fixture__nav-link" href="/team/">Team</a>
      <a class="ca-page-fixture__nav-link" href="/contact/">Contact</a>
    </nav>
  </header>
`,D=`
  <footer class="ca-page-fixture__footer">
    CivicActions builds trusted public services through open technology and design.
  </footer>
`,c=e=>`
  <div class="ca-page-fixture">
    ${C}
    <main class="ca-page-fixture__main">${e}</main>
    ${D}
  </div>
`,o=e=>b({...e,image:g}),A=([e,i])=>h({heading_level:3,name:e,role:i,image:k,teaserlink:"",bio:""}),d=(e,i)=>`
  <aside class="ca-page-fixture__todo">
    <strong class="ca-page-fixture__todo-label">TODO: ${e}</strong>
    <span class="ca-page-fixture__todo-detail">${i}</span>
  </aside>
`,M=([e,i,s])=>f({heading_level:3,title:e,link:s,icon:w,icon_alt:"Service category icon",body:i}),T=([e,i,s])=>_({variant:"press",layout:"compact",title:e,description:i,teaserlink:s}),r=({id:e,title:i,body:s,cards:m,cta:l})=>`
  <section id="${e}" class="ca-page-fixture__service-block">
    <h2 class="ca-page-fixture__section-heading">${i}</h2>
    <div class="ca-page-fixture__two-column">
      ${t({body:s})}
      <div class="ca-page-fixture__card-grid">
        ${m.map(o).join("")}
      </div>
    </div>
    ${l?`<p><a class="ca-page-fixture__jump-link" href="/contact/">${l}</a></p>`:""}
  </section>
`,H=()=>c(`
    <section class="ca-page-fixture__intro">
      ${u({title:"We help government deliver trusted public services through open technology and design.",eyebrow:"",summary:"",variant:"flush",primary_button_text:"",primary_button_url:"",secondary_button_text:"",secondary_button_url:""})}
      ${d("Hero media treatment","Legacy uses a full hero image. The current Hero SDC does not yet expose an image/media prop.")}
    </section>

    <section class="ca-page-fixture__section ca-page-fixture__section--band">
      <div class="ca-page-fixture__section-inner">
        <h2 class="ca-page-fixture__section-heading">Trusted by organizations that serve the people.</h2>
        ${d("Client logo rail","The legacy page uses a responsive strip of client logos. A reusable logo-grid SDC is still needed.")}
        <ul class="ca-page-fixture__client-list">
          ${["State of Georgia","U.S. Veterans Affairs","National Science Foundation","U.S. Department of Education","Centers for Medicare and Medicaid Services","U.S. Department of Health & Human Services","U.S. Department of Agriculture","Federal Communications Commission","Smithsonian"].map(e=>`<li class="ca-page-fixture__client-name">${e}</li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="ca-page-fixture__section">
      <h2 class="ca-page-fixture__section-heading">Digital first. Data driven. Human centered.</h2>
      ${t({body:"<p>Bringing government services up to today's standards requires new ways of thinking and working.</p><p>We can help you improve how people, process, and technology work together at your agency for lasting digital transformation.</p>",narrow:!0})}
      <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
        ${[["Web & CMS","Accessible and secure government websites at scale.","/services/#web-cms"],["IT & Service Modernization","Modernization of legacy government systems and services.","/services/#service-modernization"],["Product & Design","Human-centered problem solving and strategy.","/services/#product-design"],["Security & Compliance","Modern security practices for continuous compliance and reliability.","/services/#security-compliance"],["Data Services","Open data sharing to drive evidence-based decisions.","/services/#data-services"],["Workforce Development","Modern skills for an adaptable government workforce.","/services/#workforce-development"]].map(M).join("")}
      </div>
    </section>

    <section class="ca-page-fixture__section ca-page-fixture__section--band">
      <div class="ca-page-fixture__section-inner">
        <h2 class="ca-page-fixture__section-heading">Resilient agencies. Accessible services. Happier people.</h2>
        <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
          ${S.map(o).join("")}
        </div>
      </div>
    </section>

    <section class="ca-page-fixture__section">
      <h2 class="ca-page-fixture__section-heading">Learn with us.</h2>
      ${t({body:"<p>Thoughts and takeaways from our work in the field.</p>",narrow:!0})}
      <div class="ca-page-fixture__card-grid ca-page-fixture__card-grid--three">
        ${[["Designing a Veteran-first online experience","How we help VA deliver consistent and useful information.","https://medium.com/civicactions/designing-a-veteran-first-experience-for-va-gov-4ce3524203fb"],["Improving the ATO process with Compliance as Code","Better and faster security for government IT systems.","https://medium.com/civicactions/policy-recommendations-for-improving-the-ato-process-through-compliance-as-code-524e3005fceb"],["One Drupal platform, multiple government products","One Drupal platform, multiple government products.","https://medium.com/civicactions/one-drupal-platform-multiple-government-products-bb1c401315cc"]].map(T).join("")}
      </div>
    </section>

    <section class="ca-page-fixture__section ca-page-fixture__section--band">
      <div class="ca-page-fixture__section-inner">
        <h2 class="ca-page-fixture__section-heading">Our people make the difference.</h2>
        <div class="ca-page-fixture__two-column">
          ${t({body:'<p>We are leaders in civic tech and design, committed to working in ways that make life better for our clients and each other.</p><p><a href="/team/">Meet our team</a></p>'})}
          ${v({image:g,video_url:"",video_title:"CivicActions team story",caption:"Large group of smiling CivicActions team members on a video call.",transcript_url:""})}
        </div>
      </div>
    </section>

    <section class="ca-page-fixture__section">
      ${y({quote:"“CivicActions always looked for the optimal solutions to difficult problems and improved constantly on delivered functionality. They responded with agility, creativity, and skill to any challenge that was thrown at them.”",name:"Katrina Barry",role:"Contracting Officer, National Science Foundation",background:"gray"})}
    </section>

    <section class="ca-page-fixture__cta">
      ${n({title:"Let's build a public success story.",subtitle:"Get in touch to start.",variant:"home",primary_button_text:"Put us to work",primary_button_url:"/contact/",secondary_button_text:"Join our team",secondary_button_url:"/careers/"})}
    </section>
  `),O=()=>c(`
    <section class="ca-page-fixture__intro ca-page-fixture__hero">
      ${u({title:"Government services that build public trust",summary:"At its core, digital transformation is about improving the customer experience of government. We use thoughtful design and open source technologies to help you deliver modern public services that put people first.",variant:"flush",primary_button_text:"",primary_button_url:"",secondary_button_text:"",secondary_button_url:""})}
    </section>
    <section class="ca-page-fixture__section">
      <div class="ca-page-fixture__sidebar-layout">
        <aside class="ca-page-fixture__sidebar">
          <h2 class="ca-page-fixture__sidebar-title">Services page sections in sidebar</h2>
          <nav aria-label="Services page sections">
            <ul class="ca-page-fixture__sidebar-links">
              ${[["web-cms","Web & CMS"],["service-modernization","IT & Service Modernization"],["product-design","Product & Design"],["security-compliance","Security & Compliance"],["data-services","Data Services"],["workforce-development","Workforce Development"]].map(([e,i])=>`<li><a class="ca-page-fixture__jump-link" href="#${e}">${i}</a></li>`).join("")}
            </ul>
          </nav>
        </aside>
        <div class="ca-page-fixture__services-main">
          ${r({id:"web-cms",title:"Accessible and secure government websites at scale",body:"<p>Government websites have complex information and diverse user groups, but they can be made surprisingly usable and maintainable.</p><ul><li>CMS development and migration</li><li>User experience and visual design</li><li>Content design and strategy</li><li>Maintenance and support</li></ul>",cards:a.slice(0,2),cta:"Improve your website"})}
          ${r({id:"service-modernization",title:"Modernization of legacy government systems and services",body:"<p>We help agencies transform legacy applications and improve workflows using human-centered design, automation, and secure infrastructure.</p><ul><li>Service design</li><li>Cloud adoption and migration</li><li>DevSecOps</li><li>Technology strategy consulting</li></ul>",cards:a.slice(1),cta:"Work smarter"})}
          ${r({id:"product-design",title:"Human-centered problem solving and strategy",body:"<p>Before building anything new, we define problems and desired outcomes, understand the ecosystem, and choose an approach that serves people and business goals.</p>",cards:a.slice(0,2),cta:"Design a better future"})}
          ${r({id:"security-compliance",title:"Modern security practices for continuous compliance and reliability",body:"<p>We help teams shift left with automated processes that keep development and operations in sync, with security and compliance woven in from the start.</p><ul><li>DevSecOps</li><li>Continuous compliance</li><li>Site Reliability Engineering</li><li>Security consulting and training</li></ul>",cards:a.slice(0,2),cta:"Re-think security"})}
          ${r({id:"data-services",title:"Open data sharing to drive evidence-based decisions",body:"<p>Open, discoverable, and usable data helps government serve people better and powers useful applications.</p><ul><li>Data program strategy</li><li>Data cataloging and maintenance</li><li>Data platform migration</li><li>Data visualizations and dashboards</li></ul>",cards:a.slice(0,2),cta:"Be data-driven"})}
          ${r({id:"workforce-development",title:"Modern skills for an adaptable government workforce",body:"<p>Consulting and training help teams build skills in modern ways of working and increase resilience.</p><ul><li>DITAP program certification</li><li>Agile and human-centered design coaching</li><li>Technology strategy consulting</li></ul>",cards:a.slice(1),cta:"Upskill your team"})}
          <section class="ca-page-fixture__service-block ca-page-fixture__service-block--band">
            <h2 class="ca-page-fixture__section-heading">Open standards. Inclusive practices. Better outcomes.</h2>
            ${t({body:"<p>Accessibility, Agile, DevSecOps, distributed teams, Drupal, human-centered design, open source, and open data power the work.</p>"})}
          </section>
        </div>
      </div>
    </section>
    <section class="ca-page-fixture__cta">
      ${n({title:"Start building public trust.",subtitle:"Let's create better government services.",variant:"default",primary_button_text:"Hire us",primary_button_url:"/contact/",secondary_button_text:"Contracting info",secondary_button_url:"/contracting/"})}
    </section>
  `),P=()=>c(`
    <section class="ca-page-fixture__intro">
      ${p({title:"Meet the humans of CivicActions",subtitle:"People who work with us say there is something special about our team.",heading_level:1,alignment:"left"})}
      ${t({body:"<p>We are good listeners, strategic thinkers, honest communicators, and problem solvers. Let's get to know each other.</p>",narrow:!0})}
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
        ${$.map(A).join("")}
      </div>
    </section>
    <section class="ca-page-fixture__cta">
      ${n({title:"Let's build a public success story.",subtitle:"Get in touch to start.",variant:"default",primary_button_text:"Put us to work",primary_button_url:"/contact/",secondary_button_text:"Join our team",secondary_button_url:"/careers/"})}
    </section>
  `),W=()=>c(`
    <section class="ca-page-fixture__intro">
      ${p({title:"Work that makes a difference",subtitle:"Our work impacts the daily lives of millions of people.",heading_level:1,alignment:"left"})}
      ${t({body:"<p>See how we have helped agencies build resilient services at scale.</p>",narrow:!0})}
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
        ${a.concat(a).map(o).join("")}
      </div>
    </section>
    <section class="ca-page-fixture__cta">
      ${n({title:"Let's build a public success story.",subtitle:"Get in touch to start.",variant:"default",primary_button_text:"Put us to work",primary_button_url:"/contact/",secondary_button_text:"Join our team",secondary_button_url:"/careers/"})}
    </section>
  `),J={title:"Pages/Legacy Reconstructions",parameters:{layout:"fullscreen"}},N={render:H},K={render:O},Q={render:P},X={render:W},Y=["Homepage","Services","Team","CaseStudies"];export{X as CaseStudies,N as Homepage,K as Services,Q as Team,Y as __namedExportsOrder,J as default};
