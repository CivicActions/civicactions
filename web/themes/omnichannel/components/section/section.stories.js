import template from './section.twig';
import './section.css';

const meta = {
  title: 'Components/Section',
  render: (args) => template(args),
  argTypes: {
    layout: {
      control: 'select',
      options: ['two-equal', 'three-equal', 'two-one', 'one-two', 'four-equal'],
    },
    padding: { control: 'select', options: ['small', 'medium', 'large'] },
    alignment: { control: 'select', options: ['top', 'center', 'bottom'] },
    background_color: {
      control: 'select',
      options: ['white', 'gray', 'blue', 'red'],
    },
    width: { control: 'select', options: ['full', 'constrained'] },
  },
  args: {
    layout: 'two-equal',
    padding: 'medium',
    alignment: 'top',
    background_color: 'gray',
    width: 'full',
  },
};

export default meta;

export const TwoColumns = {};

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
