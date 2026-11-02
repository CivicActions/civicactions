import{a as n,T as i,t as s,D as r}from"./twig-CXPxoFJk.js";const p=t=>t.extendFilter("toSrcSet",()=>()=>null);p(i);n(i);i.cache(!1);const l=t=>t.extendFilter("toSrcSet",()=>()=>null);l(i);n(i);i.cache(!1);s.twig({id:"./site-footer.twig",data:[{type:"raw",value:`
`,position:{start:454,end:455}},{type:"logic",token:{type:"Twig.logic.type.set",key:"heading_id",expression:[{type:"Twig.expression.type.variable",value:"heading_id",match:["heading_id"]},{type:"Twig.expression.type.filter",value:"default",match:["|default","default"],params:[{type:"Twig.expression.type.parameter.start",value:"(",match:["("]},{type:"Twig.expression.type.string",value:"footer--menu"},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],expression:!1}]}],position:{start:455,end:512}},position:{start:455,end:512}},{type:"logic",token:{type:"Twig.logic.type.set",key:"footer_attributes",expression:[{type:"Twig.expression.type.variable",value:"attributes",match:["attributes"]},{type:"Twig.expression.type.filter",value:"default",match:["|default","default"],params:[{type:"Twig.expression.type.parameter.start",value:"(",match:["("]},{type:"Twig.expression.type._function",fn:"create_attribute",params:[{type:"Twig.expression.type.parameter.start",value:"(",match:["("]},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],expression:!1}]},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],expression:!1}]}],position:{start:513,end:581}},position:{start:513,end:581}},{type:"raw",value:`
<footer`,position:{start:582,end:590}},{type:"output",position:{start:590,end:701},stack:[{type:"Twig.expression.type.variable",value:"footer_attributes",match:["footer_attributes"],position:{start:590,end:701}},{type:"Twig.expression.type.key.period",position:{start:590,end:701},key:"addClass"},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],position:{start:590,end:701},expression:!0,params:[{type:"Twig.expression.type.string",value:"footer",position:{start:590,end:701}}]},{type:"Twig.expression.type.key.period",position:{start:590,end:701},key:"setAttribute"},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],position:{start:590,end:701},expression:!0,params:[{type:"Twig.expression.type.string",value:"id",position:{start:590,end:701}},{type:"Twig.expression.type.comma",position:{start:590,end:701}},{type:"Twig.expression.type.string",value:"footer--section",position:{start:590,end:701}}]},{type:"Twig.expression.type.key.period",position:{start:590,end:701},key:"setAttribute"},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],position:{start:590,end:701},expression:!0,params:[{type:"Twig.expression.type.string",value:"tabindex",position:{start:590,end:701}},{type:"Twig.expression.type.comma",position:{start:590,end:701}},{type:"Twig.expression.type.string",value:"-1",position:{start:590,end:701}}]}]},{type:"raw",value:`>
  <div class="footer__inner">
    <div class="footer__area footer__branding">
      `,position:{start:701,end:787}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"branding",position:{start:787,end:807},output:[{type:"raw",value:'        <a class="footer__branding-link" href="',position:{start:808,end:855}},{type:"output",position:{start:855,end:876},stack:[{type:"Twig.expression.type._function",position:{start:855,end:876},fn:"path",params:[{type:"Twig.expression.type.parameter.start",value:"(",match:["("],position:{start:855,end:876}},{type:"Twig.expression.type.string",value:"<front>",position:{start:855,end:876}},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],position:{start:855,end:876},expression:!1}]}]},{type:"raw",value:'" aria-label="',position:{start:876,end:890}},{type:"output",position:{start:890,end:922},stack:[{type:"Twig.expression.type.string",value:"CivicActions home page",position:{start:890,end:922}},{type:"Twig.expression.type.filter",value:"t",match:["|t","t"],position:{start:890,end:922}}]},{type:"raw",value:`">
          `,position:{start:922,end:935}},{type:"output",position:{start:935,end:997},stack:[{type:"Twig.expression.type._function",position:{start:935,end:997},fn:"source",params:[{type:"Twig.expression.type.parameter.start",value:"(",match:["("],position:{start:935,end:997}},{type:"Twig.expression.type.variable",value:"componentMetadata",match:["componentMetadata"],position:{start:935,end:997}},{type:"Twig.expression.type.key.period",position:{start:935,end:997},key:"path"},{type:"Twig.expression.type.string",value:"/ca-extended-logo.svg",position:{start:935,end:997}},{type:"Twig.expression.type.operator.binary",value:"~",position:{start:935,end:997},precidence:6,associativity:"leftToRight",operator:"~"},{type:"Twig.expression.type.parameter.end",value:")",match:[")"],position:{start:935,end:997},expression:!1}]}]},{type:"raw",value:`
        </a>
      `,position:{start:997,end:1017}}]},position:{open:{start:787,end:807},close:{start:1017,end:1031}}},{type:"raw",value:`    </div>

    <div class="footer__area footer__about">
      `,position:{start:1032,end:1095}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"about",position:{start:1095,end:1112},output:[]},position:{open:{start:1095,end:1112},close:{start:1112,end:1126}}},{type:"raw",value:`    </div>

    <div class="footer__area footer__contact">
      `,position:{start:1127,end:1192}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"contact",position:{start:1192,end:1211},output:[]},position:{open:{start:1192,end:1211},close:{start:1211,end:1225}}},{type:"raw",value:`    </div>

    <div class="footer__area footer__menu--wrapper">
      <h2 id="`,position:{start:1226,end:1305}},{type:"output",position:{start:1305,end:1321},stack:[{type:"Twig.expression.type.variable",value:"heading_id",match:["heading_id"],position:{start:1305,end:1321}}]},{type:"raw",value:'" class="visually-hidden">',position:{start:1321,end:1347}},{type:"output",position:{start:1347,end:1363},stack:[{type:"Twig.expression.type.string",value:"Footer",position:{start:1347,end:1363}},{type:"Twig.expression.type.filter",value:"t",match:["|t","t"],position:{start:1347,end:1363}}]},{type:"raw",value:`</h2>
      <nav class="footer__menu" aria-labelledby="`,position:{start:1363,end:1418}},{type:"output",position:{start:1418,end:1434},stack:[{type:"Twig.expression.type.variable",value:"heading_id",match:["heading_id"],position:{start:1418,end:1434}}]},{type:"raw",value:`">
        `,position:{start:1434,end:1445}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"menu",position:{start:1445,end:1461},output:[]},position:{open:{start:1445,end:1461},close:{start:1461,end:1475}}},{type:"raw",value:`      </nav>
    </div>

    <div class="footer__area footer__social">
      `,position:{start:1476,end:1553}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"social",position:{start:1553,end:1571},output:[]},position:{open:{start:1553,end:1571},close:{start:1571,end:1585}}},{type:"raw",value:`    </div>

    <div class="footer__area footer__bottom--links">
      `,position:{start:1586,end:1657}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"bottom_links",position:{start:1657,end:1681},output:[]},position:{open:{start:1657,end:1681},close:{start:1681,end:1695}}},{type:"raw",value:`    </div>
  </div>
</footer>
`,position:{start:1696,end:1696}}],precompiled:!0});const a=t=>t,d=(t={})=>{const o=s.twig({id:"/Users/jack.haas/Projects/civicactions/web/themes/omnichannel/components/site-footer/site-footer-preview.twig",data:[{type:"logic",token:{type:"Twig.logic.type.extends",stack:[{type:"Twig.expression.type.string",value:"./site-footer.twig"}],position:{start:0,end:34}},position:{start:0,end:34}},{type:"raw",value:`
`,position:{start:35,end:36}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"branding",position:{start:36,end:56},output:[{type:"raw",value:`  <a class="footer__branding-link" href="/" aria-label="CivicActions home page">
    `,position:{start:57,end:142}},{type:"output",position:{start:142,end:165},stack:[{type:"Twig.expression.type.variable",value:"branding_logo",match:["branding_logo"],position:{start:142,end:165}},{type:"Twig.expression.type.filter",value:"raw",match:["|raw","raw"],position:{start:142,end:165}}]},{type:"raw",value:`
  </a>
`,position:{start:165,end:173}}]},position:{open:{start:36,end:56},close:{start:173,end:187}}},{type:"raw",value:`
`,position:{start:188,end:189}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"about",position:{start:189,end:206},output:[{type:"raw",value:`  <p>
    We're a professional services firm providing design, technology, consulting, and training services to government.
  </p>
  <p>
    Want to help us make an impact?<br>
    <a href="/careers/">Check out our open positions.</a>
  </p>
`,position:{start:207,end:449}}]},position:{open:{start:189,end:206},close:{start:449,end:463}}},{type:"raw",value:`
`,position:{start:464,end:465}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"contact",position:{start:465,end:484},output:[{type:"raw",value:`  <p>
    Our mailing address is:<br>
    3527 Mt. Diablo Blvd., Unit 269<br>
    Lafayette, CA 94549
  </p>
  <a href="tel:510-408-7510">510-408-7510</a><br>
  <a href="mailto:contact@civicactions.com">contact@civicactions.com</a>
`,position:{start:485,end:717}}]},position:{open:{start:465,end:484},close:{start:717,end:731}}},{type:"raw",value:`
`,position:{start:732,end:733}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"menu",position:{start:733,end:749},output:[{type:"raw",value:`  <ul class="footer__menu--list">
    <li><a href="#">Team</a></li>
    <li><a href="#">Press</a></li>
    <li><a href="#">Impact</a></li>
    <li><a href="#">Services</a></li>
    <li><a href="#">Case Studies</a></li>
    <li><a href="#">Contracting</a></li>
    <li><a href="#">Contact</a></li>
    <li><a href="#">Insights</a></li>
    <li><a href="#">Careers</a></li>
  </ul>
`,position:{start:750,end:1130}}]},position:{open:{start:733,end:749},close:{start:1130,end:1144}}},{type:"raw",value:`
`,position:{start:1145,end:1146}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"social",position:{start:1146,end:1164},output:[{type:"raw",value:"  ",position:{start:1165,end:1167}},{type:"output",position:{start:1167,end:1189},stack:[{type:"Twig.expression.type.variable",value:"social_links",match:["social_links"],position:{start:1167,end:1189}},{type:"Twig.expression.type.filter",value:"raw",match:["|raw","raw"],position:{start:1167,end:1189}}]},{type:"raw",value:`
`,position:{start:1189,end:1190}}]},position:{open:{start:1146,end:1164},close:{start:1190,end:1204}}},{type:"raw",value:`
`,position:{start:1205,end:1206}},{type:"logic",token:{type:"Twig.logic.type.block",blockName:"bottom_links",position:{start:1206,end:1230},output:[{type:"raw",value:`  <ul>
    <li><a href="/accessibility-statement/">Accessibility</a></li>
    <li><a href="/licensing/">Licensing</a></li>
    <li><a href="/privacy/">Privacy</a></li>
    <li><a href="/sustainability/">Sustainability</a></li>
    <li><a href="/feedback/">Feedback</a></li>
    <li>&copy; 2026</li>
  </ul>
`,position:{start:1231,end:1538}}]},position:{open:{start:1206,end:1230},close:{start:1538,end:1552}}}],precompiled:!0});o.options.allowInlineIncludes=!0;try{let e=t.defaultAttributes?t.defaultAttributes:[];return Array.isArray(e)||(e=Object.entries(e)),a(o.render({attributes:new r(e),...t}))}catch(e){return a("An error occurred whilst rendering /Users/jack.haas/Projects/civicactions/web/themes/omnichannel/components/site-footer/site-footer-preview.twig: "+e.toString())}};export{d as t};
