const e={title:"Base/Forms"},t={render:()=>`
    <div style="max-width: 955px; margin: 0 auto; padding: 20px; font-family: var(--font-body);">
      <h2 style="font-family: var(--font-heading); color: var(--primary-blue); margin-bottom: 32px; font-size: 28px;">Contact Us</h2>
      <form class="ca-form ca-form--contact webform-submission-contact-form" novalidate>
        <div class="form-item form-type-textfield form-item-name js-form-item-name">
          <label for="edit-name" class="form-required">Name</label>
          <input type="text" id="edit-name" name="name" class="form-text" required placeholder="Your Name" />
        </div>
        <div class="form-item form-type-textfield form-item-subject js-form-item-subject">
          <label for="edit-organization">Organization (optional)</label>
          <input type="text" id="edit-organization" name="organization" class="form-text" placeholder="Organization" />
        </div>
        <div class="form-item form-type-email form-item-email js-form-item-email">
          <label for="edit-email" class="form-required">Email</label>
          <input type="email" id="edit-email" name="email" class="form-email" required placeholder="name@example.com" />
        </div>
        <div class="form-item form-type-textarea form-item-message js-form-item-message">
          <label for="edit-message" class="form-required">Message</label>
          <div class="form-textarea-wrapper">
            <textarea id="edit-message" name="message" class="form-textarea" rows="6" required placeholder="Tell us about your challenge or idea..."></textarea>
          </div>
        </div>
        <div class="form-actions">
          <input type="submit" value="Send Message" class="button button--primary form-submit" />
        </div>
      </form>
    </div>
  `},a={render:()=>`
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: var(--font-body);">
      <h2 style="font-family: var(--font-heading); color: var(--primary-blue); margin-bottom: 24px;">Form Elements</h2>
      <form class="ca-form">
        <div class="form-item form-type-textfield">
          <label for="sample-text" class="form-required">Text Field (Required)</label>
          <input type="text" id="sample-text" class="form-text" placeholder="Enter text..." />
          <div class="description">Standard helper text describing the input field.</div>
        </div>
        <div class="form-item form-type-select">
          <label for="sample-select">Select Dropdown</label>
          <select id="sample-select" class="form-select">
            <option value="">Choose an option...</option>
            <option value="1">Option One</option>
            <option value="2">Option Two</option>
            <option value="3">Option Three</option>
          </select>
        </div>
        <div class="form-item form-type-textarea">
          <label for="sample-textarea">Textarea</label>
          <div class="form-textarea-wrapper">
            <textarea id="sample-textarea" class="form-textarea" rows="4" placeholder="Enter long text..."></textarea>
          </div>
        </div>
        <div class="form-item form-type-checkbox">
          <input type="checkbox" id="sample-check" class="form-checkbox" />
          <label for="sample-check" class="option">I agree to the terms and privacy statement</label>
        </div>
        <div class="form-item form-type-textfield form-item--error">
          <label for="sample-error" class="form-required">Field with Validation Error</label>
          <input type="text" id="sample-error" class="form-text error" value="invalid-value" aria-invalid="true" />
          <div class="form-item--error-message">
            <strong>Please enter a valid format.</strong>
          </div>
        </div>
        <div class="form-actions">
          <input type="submit" value="Submit Form" class="button button--primary form-submit" />
          <input type="button" value="Cancel" class="button button--secondary" />
        </div>
      </form>
    </div>
  `},r=["ContactForm","FormElements"];export{t as ContactForm,a as FormElements,r as __namedExportsOrder,e as default};
