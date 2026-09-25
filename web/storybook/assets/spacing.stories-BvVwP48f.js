const s=[["--size-1","4px"],["--size-2","8px"],["--size-4","16px"],["--size-5","20px"],["--size-6","24px"],["--size-8","32px"],["--size-9","36px"],["--size-12","48px"],["--size-14","56px"],["--size-20","80px"]],p={title:"Base/Spacing"},a={render:()=>`
    <div style="display:grid;gap:12px;font-family:var(--font-body)">
      ${s.map(([e,i])=>`
            <div style="display:flex;align-items:center;gap:12px">
              <code style="width:80px">${e}</code>
              <div style="height:16px;width:var(${e});background:var(--primary-blue)"></div>
              <span>${i}</span>
            </div>`).join("")}
    </div>
  `},t=["Scale"];export{a as Scale,t as __namedExportsOrder,p as default};
