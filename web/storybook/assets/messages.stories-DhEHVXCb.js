const s={title:"Base/Messages"},e={render:()=>`
    <div data-drupal-messages>
      <div class="messages messages--status" role="status" aria-label="Status message">
        <h2 class="visually-hidden">Status message</h2>
        <p>Your changes have been saved.</p>
      </div>
    </div>
  `},a={render:()=>`
    <div data-drupal-messages>
      <div class="messages messages--warning" role="status" aria-label="Warning message">
        <h2 class="visually-hidden">Warning message</h2>
        <p>This action may affect other content on the site.</p>
      </div>
    </div>
  `},r={render:()=>`
    <div data-drupal-messages>
      <div class="messages messages--error" role="alert" aria-label="Error message">
        <h2 class="visually-hidden">Error message</h2>
        <p class="error">We could not save your changes. Please try again.</p>
      </div>
    </div>
  `},l={render:()=>`
    <div data-drupal-messages>
      <div class="messages messages--status" role="status" aria-label="Status message">
        <h2 class="visually-hidden">Status message</h2>
        <ul class="messages__list">
          <li class="messages__item">Your profile has been updated.</li>
          <li class="messages__item">A confirmation email has been sent.</li>
        </ul>
      </div>
    </div>
  `},i={render:()=>`
    <div data-drupal-messages>
      <div class="messages messages--status" role="status" aria-label="Status message">
        <h2 class="visually-hidden">Status message</h2>
        <p>Your profile has been updated.</p>
      </div>
      <div class="messages messages--warning" role="status" aria-label="Warning message">
        <h2 class="visually-hidden">Warning message</h2>
        <p>Your profile is missing a recovery email address.</p>
      </div>
      <div class="messages messages--error" role="alert" aria-label="Error message">
        <h2 class="visually-hidden">Error message</h2>
        <p class="error">The recovery email address could not be saved.</p>
      </div>
    </div>
  `},t=["StatusMessage","WarningMessage","ErrorMessage","MultipleMessages","CombinedMessages"];export{i as CombinedMessages,r as ErrorMessage,l as MultipleMessages,e as StatusMessage,a as WarningMessage,t as __namedExportsOrder,s as default};
