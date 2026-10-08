import template from './person-teaser.twig';
import './person-teaser.css';
import './person-teaser.stories.css';
import { quotePortrait } from '../../.storybook/fixtures';

const renderPersonTeaser = (args) =>
  `<div class="ca-person-teaser-story">${template(args)}</div>`;

const meta = {
  title: 'Components/Person Teaser',
  render: renderPersonTeaser,
  argTypes: {
    heading_level: { control: 'select', options: [2, 3, 4, 5, 6] },
    name: { control: 'text' },
    role: { control: 'text' },
    image: { control: 'object' },
    teaserlink: { control: 'text' },
    bio: { control: 'text' },
  },
  args: {
    heading_level: 3,
    name: 'Alex Rivera',
    role: 'Co-Founder & Government Solutions Lead',
    image: quotePortrait,
    teaserlink: '/team/alex-rivera',
    bio: '',
  },
};

export default meta;

export const Default = {};

export const WithBio = {
  args: {
    name: 'Kristen Jernigan',
    role: 'Learning Experience Designer',
    teaserlink: '',
    bio: 'Kristen designs learning experiences that help public servants build practical skills for better digital services.',
  },
};

export const Unlinked = {
  args: {
    teaserlink: '',
    bio: '',
  },
};

export const NestedHeading = {
  args: {
    heading_level: 3,
  },
};
