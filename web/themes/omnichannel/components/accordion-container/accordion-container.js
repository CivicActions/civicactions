/**
 * @file
 * Keeps one Accordion item open within each Accordion Container.
 */

/**
 * Close open Accordion items other than the item that was just opened.
 *
 * @param {Element} container
 *   The Accordion Container element.
 * @param {HTMLDetailsElement} openedItem
 *   The item that should remain open.
 */
function closeOtherItems(container, openedItem) {
  container.querySelectorAll('.ca-accordion[open]').forEach((item) => {
    if (item !== openedItem) {
      item.open = false;
    }
  });
}

/**
 * Handle a summary click inside an Accordion Container.
 *
 * @param {MouseEvent} event
 *   The click event.
 */
function handleSummaryClick(event) {
  const summary = event.target.closest('.ca-accordion__summary');
  const container = summary?.closest('.ca-accordion-container');
  if (!container) {
    return;
  }

  window.requestAnimationFrame(() => {
    const openedItem = summary.parentElement;
    if (openedItem?.open) {
      closeOtherItems(container, openedItem);
    }
  });
}

/**
 * Register the Accordion Container behavior.
 *
 * @param {object} Drupal
 *   Drupal's behavior registry.
 * @param {Function} once
 *   Drupal's once utility.
 */
((Drupal, once) => {
  /**
   * Attach Accordion Container behavior to one container.
   *
   * @param {Element} container
   *   The Accordion Container element.
   */
  const attachContainer = (container) => {
    container.addEventListener('click', handleSummaryClick);
  };

  /**
   * Attach behavior to Accordion Containers in a render context.
   *
   * @param {Element|Document} context
   *   The render context to scan.
   */
  const attachContainers = (context) => {
    once('accordion-container', '.ca-accordion-container', context).forEach(
      attachContainer,
    );
  };

  const attachDocumentBehavior = () => {
    attachContainers(document);

    once('accordion-container-observer', document).forEach(() => {
      const observer = new MutationObserver(() => {
        attachContainers(document);
      });
      observer.observe(document, { childList: true, subtree: true });
    });
  };

  Drupal.behaviors.accordionContainer = {
    attach: attachDocumentBehavior,
  };

  attachDocumentBehavior();
})(Drupal, once);
