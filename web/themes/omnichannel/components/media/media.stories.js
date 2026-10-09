import template from './media.twig';
import './media.css';
import { placeholderImage } from '../../.storybook/fixtures';

const meta = {
  title: 'Components/Media',
  render: (args) => template(args),
  argTypes: {
    image: { control: 'object' },
    video_url: { control: 'text' },
    video_title: { control: 'text' },
    caption: { control: 'text' },
    transcript_url: { control: 'text' },
  },
  args: {
    image: placeholderImage,
    video_url: '',
    video_title: 'CivicActions project video',
    caption: 'CivicActions project media.',
    transcript_url: '',
  },
};

export default meta;

export const ImageDefault = {};

export const ImageWithCaption = {
  args: {
    caption: 'A traffic signal against a clear sky.',
  },
};

export const VideoEmbed = {
  args: {
    image: null,
    video_url: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    video_title: 'Big Buck Bunny, an animated short film',
    caption: 'An example remote video embed.',
  },
};

export const VideoWithTranscript = {
  args: {
    image: null,
    video_url: 'https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ',
    video_title: 'Big Buck Bunny, an animated short film',
    caption: 'An example remote video embed with a text alternative.',
    transcript_url: '/transcripts/example-video',
  },
};
