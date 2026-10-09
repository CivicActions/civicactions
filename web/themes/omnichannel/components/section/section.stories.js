import template from './section-preview.twig';
import './section.css';

const meta = {
  title: 'Components/Section',
  render: (args) => template(args),
  argTypes: {
    layout: {
      control: 'select',
      options: [
        'one',
        'two-equal',
        'three-equal',
        'two-one',
        'one-two',
        'four-equal',
      ],
    },
    padding: { control: 'select', options: ['small', 'medium', 'large'] },
    alignment: { control: 'select', options: ['top', 'center', 'bottom'] },
    background_color: {
      control: 'select',
      options: ['white', 'gray', 'blue', 'red'],
    },
    width: { control: 'select', options: ['full', 'constrained'] },
    section_id: { control: 'text' },
    title: { control: 'text' },
    heading_level: { control: 'select', options: [2, 3, 4] },
  },
  args: {
    layout: 'two-equal',
    padding: 'medium',
    alignment: 'top',
    background_color: 'gray',
    width: 'full',
    section_id: '',
    title: '',
    heading_level: 2,
  },
};

export default meta;

export const TwoColumns = {};

export const OneColumn = {
  args: {
    layout: 'one',
  },
};

export const ThreeColumns = {
  args: {
    layout: 'three-equal',
  },
};

export const FourColumns = {
  args: {
    layout: 'four-equal',
  },
};

export const TwoOne = {
  args: {
    layout: 'two-one',
  },
};

export const OneTwo = {
  args: {
    layout: 'one-two',
  },
};

export const WithTitleAndAnchor = {
  args: {
    section_id: 'services',
    title: 'Services',
  },
};
