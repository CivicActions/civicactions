/**
 * @file
 * Supports optional single-open Accordion groups and Canvas editor visibility.
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
  if (
    !container ||
    !container.classList.contains('ca-accordion-container--single-open')
  ) {
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
 * Detect the Canvas editor when this component is rendered in its preview iframe.
 *
 * @return {boolean}
 *   TRUE when the parent Canvas route is the editor.
 */
function isCanvasEditor() {
  const paths = [window.location.pathname];

  try {
    paths.push(window.top.location.pathname);
  } catch {
    // The parent may be cross-origin in an embedded consumer.
  }

  return paths.some((path) => path.includes('/canvas/editor/'));
}

/**
 * Keep newly inserted Accordion slot content visible to Canvas authors.
 *
 * @param {Element|Document} context
 *   The render context to scan.
 */
function openEditorItems(context) {
  if (!isCanvasEditor()) {
    return;
  }

  once('accordion-editor-open', '.ca-accordion', context).forEach((item) => {
    item.open = true;
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
    openEditorItems(context);
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
