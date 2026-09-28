const colors = [
  ['Primary red', '--primary-red'],
  ['Primary blue', '--primary-blue'],
  ['Light blue', '--light-blue'],
  ['Accent gold', '--accent-gold'],
  ['Accent light gold', '--accent-light-gold'],
  ['Secondary red', '--sec-red'],
  ['Secondary blue', '--sec-blue'],
  ['Secondary alternate blue', '--sec-alt-blue'],
  ['Gray 05', '--gray-05'],
  ['Gray 10', '--gray-10'],
  ['Gray 30', '--gray-30'],
  ['Gray 50', '--gray-50'],
  ['Gray 70', '--gray-70'],
  ['Gray 90', '--gray-90'],
  ['White', '--white'],
  ['Black', '--black'],
];

export default {
  title: 'Base/Colors',
};

export const BrandPalette = {
  render: () => `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;font-family:var(--font-body)">
      ${colors
        .map(
          ([label, token]) => `
            <div>
              <div style="height:72px;background:var(${token});border:1px solid var(--gray-30)"></div>
              <strong>${label}</strong><br>
              <code>${token}</code>
            </div>`,
        )
        .join('')}
    </div>
  `,
};
