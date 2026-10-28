import{t as i}from"./icon-CoDQ1iRK.js";/* empty css             */import"./twig-D3MA_jaS.js";const o={title:"Components/Icon",render:r=>i(r),argTypes:{name:{control:"select",options:["check","calendar","certificate","users","arrow","document","star"]},size:{control:"select",options:["sm","md","lg","xl"]},color:{control:"select",options:["inherit","primary-red","primary-blue","light-blue","gray-90"]},aria_label:{control:"text"}},args:{name:"check",size:"md",color:"inherit",aria_label:""}},c={},n={args:{name:"star",size:"lg",color:"primary-red"}},m={args:{name:"users",size:"lg",color:"primary-blue"}},d={args:{name:"certificate",size:"lg",color:"light-blue"}},p={args:{name:"check",size:"md",color:"primary-blue",aria_label:"Completed verification"}},g={render:()=>{const r=["check","calendar","certificate","users","arrow","document","star"];return`
      <div style="display: flex; flex-direction: column; gap: 2rem; font-family: Nunito, sans-serif;">
        <h3 style="margin: 0;">Icon Sizes</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          ${["sm","md","lg","xl"].map(e=>`
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                  ${i({name:"certificate",size:e,color:"primary-blue"})}
                  <small style="color: #757575;">${e}</small>
                </div>
              `).join("")}
        </div>
        <h3 style="margin: 0;">All Bundled Icons</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1.5rem;">
          ${r.map(e=>`
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 1px solid #e6e6e6; border-radius: 4px;">
                  ${i({name:e,size:"lg",color:"primary-red"})}
                  <span style="font-size: 0.875rem; color: #171717;">${e}</span>
                </div>
              `).join("")}
        </div>
      </div>
    `}},y=["Default","PrimaryRed","PrimaryBlue","LightBlue","WithAccessibleLabel","Catalog"];export{g as Catalog,c as Default,d as LightBlue,m as PrimaryBlue,n as PrimaryRed,p as WithAccessibleLabel,y as __namedExportsOrder,o as default};
