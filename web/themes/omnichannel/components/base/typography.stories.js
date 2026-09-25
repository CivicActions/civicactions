export default {
  title: 'Base/Typography',
};

export const TypeScale = {
  render: () => `
    <div style="font-family:var(--font-body);color:var(--gray-90)">
      <h1>Heading 1, Merriweather</h1>
      <h2>Heading 2, Merriweather</h2>
      <h3>Heading 3, Merriweather</h3>
      <h4>Heading 4, Merriweather</h4>
      <h5>Heading 5, Merriweather</h5>
      <p>Body copy in Nunito. CivicActions builds accessible digital services for the public good.</p>
      <p><strong>Bold body copy</strong>, <em>italic body copy</em>, and <a href="#">linked body copy</a>.</p>
    </div>
  `,
};
