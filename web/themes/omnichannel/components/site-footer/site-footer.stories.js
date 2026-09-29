import template from './site-footer-preview.twig';
import './site-footer.css';
import brandingLogo from './ca-extended-logo.svg?raw';
import socialLinksTemplate from '../social-links/social-links-preview.twig';
import '../social-links/social-links.css';
import { socialLinkIcons } from '../social-links/social-links-fixtures';

const meta = {
  title: 'Components/Site Footer',
  render: (args) =>
    template({
      ...args,
      branding_logo: brandingLogo,
      social_links: socialLinksTemplate({ ...args, ...socialLinkIcons }),
    }),
  argTypes: {
    heading_id: { control: 'text' },
    vimeo_url: { control: 'text' },
    bluesky_url: { control: 'text' },
    x_url: { control: 'text' },
    linkedin_url: { control: 'text' },
  },
  args: {
    heading_id: 'storybook-footer-menu',
    vimeo_url: 'https://vimeo.com/civicactions',
    bluesky_url: 'https://bsky.app/profile/civicactions.com',
    x_url: 'https://twitter.com/civicactions?lang=en',
    linkedin_url: 'https://www.linkedin.com/company/civicactions/mycompany/',
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Default = {};
