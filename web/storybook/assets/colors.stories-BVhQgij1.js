import{n as e}from"./rolldown-runtime-sJBDdmOt.js";var t,n,r,i;function a(){return(a=e((()=>{t=[[`Primary red`,`--primary-red`],[`Primary blue`,`--primary-blue`],[`Light blue`,`--light-blue`],[`Accent gold`,`--accent-gold`],[`Accent light gold`,`--accent-light-gold`],[`Secondary red`,`--sec-red`],[`Secondary blue`,`--sec-blue`],[`Secondary alternate blue`,`--sec-alt-blue`],[`Gray 05`,`--gray-05`],[`Gray 10`,`--gray-10`],[`Gray 30`,`--gray-30`],[`Gray 50`,`--gray-50`],[`Gray 70`,`--gray-70`],[`Gray 90`,`--gray-90`],[`White`,`--white`],[`Black`,`--black`]],n={title:`Base/Colors`},r={render:()=>`
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;font-family:var(--font-body)">
      ${t.map(([e,t])=>`
            <div>
              <div style="height:72px;background:var(${t});border:1px solid var(--gray-30)"></div>
              <strong>${e}</strong><br>
              <code>${t}</code>
            </div>`).join(``)}
    </div>
  `},i=[`BrandPalette`]})))()}a();export{r as BrandPalette,i as __namedExportsOrder,n as default};