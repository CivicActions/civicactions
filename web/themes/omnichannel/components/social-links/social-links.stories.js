import template from './social-links-preview.twig';
import './social-links.css';
import { socialLinkIcons } from './social-links-fixtures';

const meta = {
  title: 'Components/Social Links',
  render: (args) => template({ ...args, ...socialLinkIcons }),
  argTypes: {
    vimeo_url: { control: 'text' },
    bluesky_url: { control: 'text' },
    x_url: { control: 'text' },
    linkedin_url: { control: 'text' },
  },
  args: {
    vimeo_url: 'https://vimeo.com/civicactions',
    bluesky_url: 'https://bsky.app/profile/civicactions.com',
    x_url: 'https://twitter.com/civicactions?lang=en',
    linkedin_url: 'https://www.linkedin.com/company/civicactions/mycompany/',
  },
};

export default meta;

export const Default = {};
