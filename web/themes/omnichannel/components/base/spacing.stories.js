const spacing = [
  ['--size-1', '4px'],
  ['--size-2', '8px'],
  ['--size-4', '16px'],
  ['--size-5', '20px'],
  ['--size-6', '24px'],
  ['--size-8', '32px'],
  ['--size-9', '36px'],
  ['--size-12', '48px'],
  ['--size-14', '56px'],
  ['--size-20', '80px'],
];

export default {
  title: 'Base/Spacing',
};

export const Scale = {
  render: () => `
    <div style="display:grid;gap:12px;font-family:var(--font-body)">
      ${spacing
        .map(
          ([token, value]) => `
            <div style="display:flex;align-items:center;gap:12px">
              <code style="width:80px">${token}</code>
              <div style="height:16px;width:var(${token});background:var(--primary-blue)"></div>
              <span>${value}</span>
            </div>`,
        )
        .join('')}
    </div>
  `,
};
