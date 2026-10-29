import template from './icon.twig';
import './icon.css';

const meta = {
  title: 'Components/Icon',
  render: (args) => template(args),
  argTypes: {
    name: {
      control: 'select',
      options: [
        'check',
        'calendar',
        'certificate',
        'users',
        'arrow',
        'document',
        'star',
        'web-cms',
        'it-modernization',
        'data-services',
        'product-design',
        'security-compliance',
        'workforce-dev',
        'health-benefits',
        '401k-program',
        'time-off',
        'remote-life',
        'annual-upgrades',
        'family-friendly',
      ],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary-red',
        'primary-blue',
        'light-blue',
        'gray-90',
      ],
    },
    aria_label: { control: 'text' },
  },
  args: {
    name: 'check',
    size: 'md',
    color: 'inherit',
    aria_label: '',
  },
};

export default meta;

export const Default = {};

export const PrimaryRed = {
  args: {
    name: 'star',
    size: 'lg',
    color: 'primary-red',
  },
};

export const PrimaryBlue = {
  args: {
    name: 'users',
    size: 'lg',
    color: 'primary-blue',
  },
};

export const LightBlue = {
  args: {
    name: 'certificate',
    size: 'lg',
    color: 'light-blue',
  },
};

export const WithAccessibleLabel = {
  args: {
    name: 'check',
    size: 'md',
    color: 'primary-blue',
    aria_label: 'Completed verification',
  },
};

export const Catalog = {
  render: () => {
    const icons = [
      'check',
      'calendar',
      'certificate',
      'users',
      'arrow',
      'document',
      'star',
      'web-cms',
      'it-modernization',
      'data-services',
      'product-design',
      'security-compliance',
      'workforce-dev',
      'health-benefits',
      '401k-program',
      'time-off',
      'remote-life',
      'annual-upgrades',
      'family-friendly',
    ];
    const sizes = ['sm', 'md', 'lg', 'xl'];
    return `
      <div style="display: flex; flex-direction: column; gap: 2rem; font-family: Nunito, sans-serif;">
        <h3 style="margin: 0;">Icon Sizes</h3>
        <div style="display: flex; gap: 2rem; align-items: center;">
          ${sizes
            .map(
              (size) => `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem;">
                  ${template({ name: 'certificate', size, color: 'primary-blue' })}
                  <small style="color: #757575;">${size}</small>
                </div>
              `,
            )
            .join('')}
        </div>
        <h3 style="margin: 0;">All Bundled Icons</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1.5rem;">
          ${icons
            .map(
              (name) => `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem; border: 1px solid #e6e6e6; border-radius: 4px;">
                  ${template({ name, size: 'lg', color: 'primary-red' })}
                  <span style="font-size: 0.875rem; color: #171717;">${name}</span>
                </div>
              `,
            )
            .join('')}
        </div>
      </div>
    `;
  },
};
