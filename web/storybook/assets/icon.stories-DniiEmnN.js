import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./icon-Bkkgmr1J.js";import"./icon-BRZkzcBB.js";var r,i,a,o,s,c,l,u;function d(){return(d=e((()=>{t(),r={title:`Components/Icon`,render:e=>n(e),argTypes:{name:{control:`select`,options:[`check`,`calendar`,`certificate`,`users`,`arrow`,`document`,`star`,`web-cms`,`it-modernization`,`data-services`,`product-design`,`security-compliance`,`workforce-dev`,`health-benefits`,`401k-program`,`time-off`,`remote-life`,`annual-upgrades`,`family-friendly`]},size:{control:`select`,options:[`sm`,`md`,`lg`,`xl`]},color:{control:`select`,options:[`inherit`,`primary-red`,`primary-blue`,`light-blue`,`gray-90`]},aria_label:{control:`text`}},args:{name:`check`,size:`md`,color:`inherit`,aria_label:``}},i={},a={args:{name:`star`,size:`lg`,color:`primary-red`}},o={args:{name:`users`,size:`lg`,color:`primary-blue`}},s={args:{name:`certificate`,size:`lg`,color:`light-blue`}},c={args:{name:`check`,size:`md`,color:`primary-blue`,aria_label:`Completed verification`}},l={render:()=>`
      <div style="display: flex; flex-direction: column; gap: 2rem; font-family: Nunito, sans-serif;">
        <h3 style="margin: 0;">Icon Sizes</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          ${[`sm`,`md`,`lg`,`xl`].map(e=>`
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                  ${n({name:`certificate`,size:e,color:`primary-blue`})}
                  <small style="color: #757575;">${e}</small>
                </div>
              `).join(``)}
        </div>
        <h3 style="margin: 0;">All Bundled Icons</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1.5rem;">
          ${[`check`,`calendar`,`certificate`,`users`,`arrow`,`document`,`star`,`web-cms`,`it-modernization`,`data-services`,`product-design`,`security-compliance`,`workforce-dev`,`health-benefits`,`401k-program`,`time-off`,`remote-life`,`annual-upgrades`,`family-friendly`].map(e=>`
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 1px solid #e6e6e6; border-radius: 4px;">
                  ${n({name:e,size:`lg`,color:`primary-red`})}
                  <span style="font-size: 0.875rem; color: #171717;">${e}</span>
                </div>
              `).join(``)}
        </div>
      </div>
    `},u=[`Default`,`PrimaryRed`,`PrimaryBlue`,`LightBlue`,`WithAccessibleLabel`,`Catalog`]})))()}d();export{l as Catalog,i as Default,s as LightBlue,o as PrimaryBlue,a as PrimaryRed,c as WithAccessibleLabel,u as __namedExportsOrder,r as default};