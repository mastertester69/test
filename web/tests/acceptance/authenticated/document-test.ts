import {
  click,
  currentURL,
  fillIn,
  find,
  findAll,
  triggerEvent,
  triggerKeyEvent,
  visit,
  waitFor,
} from "@ember/test-helpers";
import { setupApplicationTest } from "ember-qunit";
import { module, test } from "qunit";
import { authenticateSession } from "ember-simple-auth/test-support";
import { MirageTestContext, setupMirage } from "ember-cli-mirage/test-support";
import { getPageTitle } from "ember-page-title/test-support";
import {
  DraftVisibility,
  DraftVisibilityDescription,
  DraftVisibilityIcon,
} from "hermes/components/document/sidebar";
import { capitalize } from "@ember/string";
import window from "ember-window-mock";
import {
  TEST_USER_2_EMAIL,
  TEST_USER_3_EMAIL,
  TEST_USER_EMAIL,
  TEST_SHORT_LINK_BASE_URL,
} from "hermes/mirage/utils";

const ADD_RELATED_RESOURCE_BUTTON_SELECTOR =
  "[data-test-section-header-button-for='Related resources']";
const ADD_RELATED_DOCUMENT_OPTION_SELECTOR = ".related-document-option";
const ADD_RELATED_RESOURCE_MODAL_SELECTOR =
  "[data-test-add-related-resource-modal]";
const FLASH_MESSAGE_SELECTOR = "[data-test-flash-notification]";
const SIDEBAR_TITLE_BADGE_SELECTOR = "[data-test-sidebar-title-badge]";
const TOOLTIP_SELECTOR = ".hermes-tooltip";
const DRAFT_VISIBILITY_DROPDOWN_SELECTOR =
  "[data-test-draft-visibility-dropdown]";
const DRAFT_VISIBILITY_TOGGLE_SELECTOR = "[data-test-draft-visibility-toggle]";
const COPY_URL_BUTTON_SELECTOR = "[data-test-sidebar-copy-url-button]";
const DRAFT_VISIBILITY_OPTION_SELECTOR = "[data-test-draft-visibility-option]";
const SECOND_DRAFT_VISIBILITY_LIST_ITEM_SELECTOR = `${DRAFT_VISIBILITY_DROPDOWN_SELECTOR} li:nth-child(2)`;

const TITLE_SELECTOR = "[data-test-document-title]";
const SUMMARY_SELECTOR = "[data-test-document-summary]";
const CONTRIBUTORS_SELECTOR = "[data-test-document-contributors]";
const APPROVERS_SELECTOR = "[data-test-document-approvers]";
const APPROVED_BADGE_SELECTOR = "[data-test-person-approved-badge]";
const PRODUCT_SELECT_SELECTOR = "[data-test-product-select]";
const PRODUCT_SELECT_PRODUCT_NAME = "[data-test-product-value]";
const POPOVER = "[data-test-x-dropdown-list-content]";
const PRODUCT_SELECT_DROPDOWN_ITEM = `${POPOVER} [data-test-product-select-item]`;
const TOGGLE_SELECT = "[data-test-x-dropdown-list-toggle-select]";
const SIDEBAR_FOOTER = "[data-test-sidebar-footer]";

const DISABLED_FOOTER_H5 = "[data-test-read-only-footer-headline]";

const EDITABLE_FIELD_READ_VALUE = "[data-test-editable-field-read-value]";
const EDITABLE_PRODUCT_AREA_SELECTOR =
  "[data-test-document-product-area-editable]";
const READ_ONLY_PRODUCT_AREA_SELECTOR =
  "[data-test-document-product-area-read-only]";
const SIDEBAR_FOOTER_PRIMARY_BUTTON =
  "[data-test-sidebar-footer-primary-button]";
const SIDEBAR_FOOTER_PRIMARY_BUTTON_READ_ONLY =
  "[data-test-sidebar-footer-primary-button-read-only]";
const SIDEBAR_FOOTER_SECONDARY_BUTTON =
  "[data-test-sidebar-footer-secondary-button]";
const SIDEBAR_FOOTER_SECONDARY_DROPDOWN_BUTTON =
  "[data-test-sidebar-footer-secondary-dropdown-button]";
const SIDEBAR_FOOTER_OVERFLOW_MENU = "[data-test-sidebar-footer-overflow-menu]";
const SIDEBAR_FOOTER_OVERFLOW_ITEM = `${SIDEBAR_FOOTER_OVERFLOW_MENU} button`;
const ARCHIVE_MODAL = "[data-test-archive-modal]";
const DELETE_MODAL = "[data-test-delete-modal]";
const PUBLISH_FOR_REVIEW_MODAL_SELECTOR =
  "[data-test-publish-for-review-modal]";
const DOCUMENT_MODAL_PRIMARY_BUTTON_SELECTOR =
  "[data-test-document-modal-primary-button]";
const PUBLISHING_FOR_REVIEW_MESSAGE_SELECTOR =
  "[data-test-publishing-for-review-message]";
const DOC_PUBLISHED_MODAL_SELECTOR = "[data-test-doc-published-modal]";
const SHARE_DOCUMENT_URL_INPUT_SELECTOR =
  "[data-test-share-document-url-input]";
const CONTINUE_TO_DOCUMENT_BUTTON_SELECTOR =
  "[data-test-continue-to-document-button]";
const DOC_PUBLISHED_COPY_URL_BUTTON_SELECTOR =
  "[data-test-doc-published-copy-url-button]";

const CHANGE_DOC_STATUS_BUTTON = "[data-test-change-doc-status-button]";
const DOC_STATUS = "[data-test-doc-status]";

const CUSTOM_STRING_FIELD_SELECTOR = "[data-test-custom-field-type='string']";
const CUSTOM_PEOPLE_FIELD_SELECTOR = "[data-test-custom-field-type='people']";
const EDITABLE_FIELD_SAVE_BUTTON_SELECTOR =
  ".editable-field [data-test-save-button]";
const PEOPLE_SELECT_REMOVE_BUTTON_SELECTOR =
  ".ember-power-select-multiple-remove-btn";

const PROJECT_LINK = "[data-test-project-link]";
const ADD_TO_PROJECT_BUTTON = "[data-test-projects-section-header] button";
const ADD_TO_PROJECT_MODAL = "[data-test-add-to-or-create-project-modal]";
const PROJECT_OPTION = "[data-test-project-option]";

const PROJECT_DOCUMENT =
  "[data-test-document-list] [data-test-resource-list-item]";
const START_NEW_PROJECT_BUTTON = "[data-test-start-new-project-button]";

const PROJECT_FORM = "[data-test-project-form]";
const PROJECT_TITLE_INPUT = `${PROJECT_FORM} [data-test-title]`;
const CREATE_PROJECT_BUTTON = `${PROJECT_FORM} [data-test-submit]`;
const CREATING_PROJECT_MESSAGE = "[data-test-creating-project-message]";
const PROJECT_DOCUMENT_LINK = "[data-test-document-link]";
const OVERFLOW_MENU_BUTTON = "[data-test-overflow-menu-button]";
const REMOVE_FROM_PROJECT_BUTTON =
  "[data-test-overflow-menu-action='remove-from-project']";
const DOCUMENT_PROJECT = "[data-test-document-project]";

const assertEditingIsDisabled = (assert: Assert) => {
  assert.dom(TITLE_SELECTOR).doesNotHaveAttribute("data-test-editable");
  assert.dom(SUMMARY_SELECTOR).doesNotHaveAttribute("data-test-editable");
  assert.dom(CONTRIBUTORS_SELECTOR).doesNotHaveAttribute("data-test-editable");
  assert.dom(APPROVERS_SELECTOR).doesNotHaveAttribute("data-test-editable");

  assert.dom(EDITABLE_PRODUCT_AREA_SELECTOR).doesNotExist();
  assert.dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR).doesNotExist();
  assert.dom(ADD_RELATED_RESOURCE_BUTTON_SELECTOR).doesNotExist();

  assert.dom(READ_ONLY_PRODUCT_AREA_SELECTOR).exists();
};

interface AuthenticatedDocumentRouteTestContext extends MirageTestContext {}

module("Acceptance | authenticated/document", function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateSession({});
  });

  test("it redirects to the dashboard by default if the document doesn't exist", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    await visit("/document/1");
    assert.equal(currentURL(), "/dashboard");
  });

  test("it redirects to the previous page if the document doesn't exist", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    await visit("/documents");
    assert.equal(currentURL(), "/documents");

    await visit("/document/1");
    assert.equal(currentURL(), "/documents");
  });

  test("the page title is correct (published doc)", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", { objectID: 1, title: "Test Document" });
    await visit("/document/1");
    assert.equal(getPageTitle(), "Test Document | Hermes");
  });

  test("the application footer is not shown", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", { objectID: 1, title: "Test Document" });
    await visit("/document/1");
    assert.dom(".footer").doesNotExist();
  });

  test("the sidebar footer is conditionally shown (published doc)", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
    }); // User is owner by default

    await visit("/document/1");

    assert.dom(SIDEBAR_FOOTER).exists("owners will always see a footer");

    this.server.create("document", {
      objectID: 2,
      owners: [TEST_USER_2_EMAIL],
      collaborators: [TEST_USER_EMAIL],
    });

    await visit("/document/2");

    assert.dom(SIDEBAR_FOOTER).doesNotExist("collaborators don't see a footer");

    this.server.create("document", {
      objectID: 3,
      owners: [TEST_USER_2_EMAIL],
      approvers: [TEST_USER_EMAIL],
    });

    await visit("/document/3");

    assert.dom(SIDEBAR_FOOTER).exists("approvers see a footer");
  });

  test("the page title is correct (draft)", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      title: "Test Document",
      status: "Draft",
    });
    await visit("/document/1?draft=true");
    assert.equal(getPageTitle(), "Test Document | Hermes");
  });

  test("you can change a draft's product area", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    const docID = "test-doc-0";

    this.server.createList("product", 3);

    const initialProduct = this.server.schema.products.find(2).attrs;

    const initialProductName = initialProduct.name;

    this.server.create("document", {
      objectID: docID,
      isDraft: true,
      product: initialProductName,
    });

    await visit(`/document/${docID}?draft=true`);

    const productSelectSelector = "[data-test-product-select]";

    assert
      .dom(productSelectSelector)
      .exists("drafts show a product select element");

    assert
      .dom(PRODUCT_SELECT_PRODUCT_NAME)
      .hasText(initialProductName, "The document product is selected");

    await click(TOGGLE_SELECT);
    const options = findAll(PRODUCT_SELECT_DROPDOWN_ITEM);

    const expectedProducts = ["TP0", "TP1", "TP2"];
    options.forEach((option: Element, index: number) => {
      assert.equal(
        option
          .querySelector("[data-test-product-select-item-abbreviation]")
          ?.textContent?.trim(),
        expectedProducts[index],
        "the product list item is correct",
      );
    });

    await click(PRODUCT_SELECT_DROPDOWN_ITEM);

    assert
      .dom(productSelectSelector)
      .containsText(
        "Test Product 0",
        "The document product is updated to the selected product",
      );
  });

  test("a published doc's productArea can't be changed ", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      title: "Test Document",
      status: "In-Review",
      product: "Test Product 0",
    });

    await visit("/document/1");

    assert
      .dom("[data-test-product-select]")
      .doesNotExist("published docs don't show a product select element");
  });

  test("the shortLinkURL is loaded by the config service", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 500,
      title: "Test Document",
      status: "In-Review",
    });

    await visit("/document/500");
    const shortLinkURL = find(COPY_URL_BUTTON_SELECTOR)?.getAttribute(
      "data-test-url",
    );

    assert.true(shortLinkURL?.startsWith(TEST_SHORT_LINK_BASE_URL));
  });

  test("a flash message displays when a related resource fails to save", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.put("/documents/:document_id/related-resources", {}, 500);

    this.server.create("document", {
      objectID: 1,
      title: "Test Document",
      product: "Test Product 0",
      appCreated: true,
      status: "In review",
    });

    await visit("/document/1");

    await click(ADD_RELATED_RESOURCE_BUTTON_SELECTOR);

    await waitFor(ADD_RELATED_DOCUMENT_OPTION_SELECTOR);

    await click(ADD_RELATED_DOCUMENT_OPTION_SELECTOR);

    await waitFor(FLASH_MESSAGE_SELECTOR);

    assert.dom(FLASH_MESSAGE_SELECTOR).containsText("Unable to save resource");
  });

  test("a draft can toggle its `isShareable` property", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      title: "Test Document",
      product: "Test Product 0",
      appCreated: true,
      status: "WIP",
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    assert.dom(COPY_URL_BUTTON_SELECTOR).doesNotExist("not yet shareable");
    assert.dom(SIDEBAR_TITLE_BADGE_SELECTOR).containsText("Draft");
    assert.dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR).exists();
    assert
      .dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR)
      .hasAttribute("data-test-icon", DraftVisibilityIcon.Restricted);

    assert.dom(TOOLTIP_SELECTOR).doesNotExist();

    await triggerEvent(DRAFT_VISIBILITY_TOGGLE_SELECTOR, "mouseenter");

    assert
      .dom(TOOLTIP_SELECTOR)
      .hasText(capitalize(DraftVisibility.Restricted));

    await click(DRAFT_VISIBILITY_TOGGLE_SELECTOR);

    assert.dom(DRAFT_VISIBILITY_DROPDOWN_SELECTOR).exists("dropdown is open");

    assert.dom(DRAFT_VISIBILITY_OPTION_SELECTOR).exists({ count: 2 });

    assert
      .dom(DRAFT_VISIBILITY_OPTION_SELECTOR + " h4")
      .containsText(capitalize(DraftVisibility.Restricted));

    assert
      .dom(DRAFT_VISIBILITY_OPTION_SELECTOR + " p")
      .containsText(DraftVisibilityDescription.Restricted);

    assert
      .dom(DRAFT_VISIBILITY_OPTION_SELECTOR)
      .hasAttribute("data-test-is-checked")
      .hasAttribute("data-test-value", DraftVisibility.Restricted);

    // assert that the second option has the correct text

    assert
      .dom(`${SECOND_DRAFT_VISIBILITY_LIST_ITEM_SELECTOR} h4`)
      .containsText(capitalize(DraftVisibility.Shareable));

    assert
      .dom(`${SECOND_DRAFT_VISIBILITY_LIST_ITEM_SELECTOR} p`)
      .containsText(DraftVisibilityDescription.Shareable);

    assert
      .dom(
        `${SECOND_DRAFT_VISIBILITY_LIST_ITEM_SELECTOR} ${DRAFT_VISIBILITY_OPTION_SELECTOR}`,
      )
      .doesNotHaveAttribute("data-test-is-checked")
      .hasAttribute("data-test-value", DraftVisibility.Shareable);

    const clickPromise = click(
      `${DRAFT_VISIBILITY_DROPDOWN_SELECTOR} li:nth-child(2) ${DRAFT_VISIBILITY_OPTION_SELECTOR}`,
    );

    await waitFor(`${COPY_URL_BUTTON_SELECTOR}[data-test-icon="running"]`);

    assert
      .dom(`${COPY_URL_BUTTON_SELECTOR}[data-test-icon="running"]`)
      .exists('a "running" state is shown');
    assert.dom(TOOLTIP_SELECTOR).hasText("Creating link...");

    await waitFor(`${COPY_URL_BUTTON_SELECTOR}[data-test-icon="smile"]`);

    assert
      .dom(`${COPY_URL_BUTTON_SELECTOR}[data-test-icon="smile"]`)
      .exists('a "smile" state is shown');
    assert.dom(TOOLTIP_SELECTOR).hasText("Link created!");

    await clickPromise;

    await waitFor(`${COPY_URL_BUTTON_SELECTOR}[data-test-icon="link"]`);

    assert
      .dom(DRAFT_VISIBILITY_DROPDOWN_SELECTOR)
      .doesNotExist("dropdown is closed");

    assert
      .dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR)
      .hasAttribute("data-test-icon", DraftVisibilityIcon.Shareable);

    assert.dom(TOOLTIP_SELECTOR).doesNotExist("the tooltip is force-closed");

    await triggerEvent(DRAFT_VISIBILITY_TOGGLE_SELECTOR, "mouseenter");

    assert.dom(TOOLTIP_SELECTOR).hasText(capitalize(DraftVisibility.Shareable));

    assert
      .dom(COPY_URL_BUTTON_SELECTOR)
      .exists("now shareable")
      .hasAttribute(
        "data-test-url",
        window.location.href,
        "the URL to be copied is correct",
      );

    await click(DRAFT_VISIBILITY_TOGGLE_SELECTOR);

    assert
      .dom(DRAFT_VISIBILITY_OPTION_SELECTOR)
      .doesNotHaveAttribute("data-test-is-checked");

    assert
      .dom(
        `${SECOND_DRAFT_VISIBILITY_LIST_ITEM_SELECTOR} ${DRAFT_VISIBILITY_OPTION_SELECTOR}`,
      )
      .hasAttribute("data-test-is-checked");

    // Turn it back to restricted
    await click(DRAFT_VISIBILITY_OPTION_SELECTOR);

    assert
      .dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR)
      .hasAttribute("data-test-icon", DraftVisibilityIcon.Restricted);

    assert
      .dom(COPY_URL_BUTTON_SELECTOR)
      .doesNotExist("copyURLButton is removed");
  });

  test("owners can edit a draft's document metadata", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    assert.dom(TITLE_SELECTOR).hasAttribute("data-test-editable");
    assert.dom(SUMMARY_SELECTOR).hasAttribute("data-test-editable");
    assert.dom(CONTRIBUTORS_SELECTOR).hasAttribute("data-test-editable");
    assert.dom(APPROVERS_SELECTOR).hasAttribute("data-test-editable");

    assert.dom(EDITABLE_PRODUCT_AREA_SELECTOR).exists();
    assert.dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR).exists();
    assert.dom(ADD_RELATED_RESOURCE_BUTTON_SELECTOR).exists();

    assert.dom(READ_ONLY_PRODUCT_AREA_SELECTOR).doesNotExist();
  });

  test("owners can edit everything but the product area of a published doc", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: false,
      status: "In review",
    });

    await visit("/document/1");

    assert.dom(TITLE_SELECTOR).hasAttribute("data-test-editable");
    assert.dom(SUMMARY_SELECTOR).hasAttribute("data-test-editable");
    assert.dom(CONTRIBUTORS_SELECTOR).hasAttribute("data-test-editable");
    assert.dom(APPROVERS_SELECTOR).hasAttribute("data-test-editable");

    assert.dom(EDITABLE_PRODUCT_AREA_SELECTOR).doesNotExist();
    assert.dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR).doesNotExist();

    assert.dom(ADD_RELATED_RESOURCE_BUTTON_SELECTOR).exists();

    assert.dom(READ_ONLY_PRODUCT_AREA_SELECTOR).exists();
  });

  test("collaborators cannot edit the metadata of a draft", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: true,
      owners: [TEST_USER_2_EMAIL],
      collaborators: [TEST_USER_EMAIL],
    });

    await visit("/document/1?draft=true");

    assertEditingIsDisabled(assert);
  });

  test("collaborators cannot edit the metadata of published docs", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: false,
      status: "In review",
      owners: [TEST_USER_2_EMAIL],
      collaborators: [TEST_USER_EMAIL],
    });

    await visit("/document/1");

    assertEditingIsDisabled(assert);
  });

  test("approvers cannot edit the metadata of a published doc", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: false,
      status: "In review",
      owners: [TEST_USER_2_EMAIL],
      approvers: [TEST_USER_EMAIL],
    });

    await visit("/document/1");

    assertEditingIsDisabled(assert);
  });

  test("approvers can approve a document", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: false,
      status: "In review",
      owners: [TEST_USER_2_EMAIL],
      approvers: [TEST_USER_EMAIL],
      approvedBy: [],
    });

    await visit("/document/1");

    assert.dom(DOC_STATUS).hasText("In review");

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).hasText("Approve");

    await click(SIDEBAR_FOOTER_PRIMARY_BUTTON);

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).doesNotExist();
    assert
      .dom(SIDEBAR_FOOTER_PRIMARY_BUTTON_READ_ONLY)
      .exists()
      .hasText("Approved");

    assert
      .dom(FLASH_MESSAGE_SELECTOR)
      .exists({ count: 1 })
      .hasAttribute("data-test-flash-notification-type", "success")
      .containsText("Document approved");

    const doc = this.server.schema.document.first();
    const { approvedBy } = doc.attrs;

    assert.true(approvedBy?.includes(TEST_USER_EMAIL));
  });

  test("approvers can reject an FRD", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: false,
      status: "In review",
      docType: "FRD",
      owners: [TEST_USER_2_EMAIL],
      approvers: [TEST_USER_EMAIL],
    });

    await visit("/document/1");

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).hasText("Approve");

    await click(SIDEBAR_FOOTER_SECONDARY_DROPDOWN_BUTTON);

    assert.dom(SIDEBAR_FOOTER_OVERFLOW_MENU).exists();
    assert.dom(SIDEBAR_FOOTER_OVERFLOW_ITEM).exists({ count: 2 });

    const firstItem = find(SIDEBAR_FOOTER_OVERFLOW_ITEM);
    const secondItem = findAll(SIDEBAR_FOOTER_OVERFLOW_ITEM)[1];

    const overflowMenuFlightIcons = findAll(
      `${SIDEBAR_FOOTER_OVERFLOW_ITEM} .flight-icon`,
    );

    const firstIcon = overflowMenuFlightIcons[0];
    const secondIcon = overflowMenuFlightIcons[1];

    assert.dom(firstItem).hasText("Reject");
    assert.dom(firstIcon).hasAttribute("data-test-icon", "thumbs-down");

    assert.dom(secondItem).hasText("Leave approver role");
    assert.dom(secondIcon).hasAttribute("data-test-icon", "user-minus");

    await click(SIDEBAR_FOOTER_OVERFLOW_ITEM);

    assert
      .dom(SIDEBAR_FOOTER_OVERFLOW_MENU)
      .doesNotExist("dropdown closes on click");

    assert
      .dom(FLASH_MESSAGE_SELECTOR)
      .exists({ count: 1 })
      .hasAttribute("data-test-flash-notification-type", "success")
      .containsText("rejected");

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).doesNotExist();

    assert
      .dom(SIDEBAR_FOOTER_PRIMARY_BUTTON_READ_ONLY)
      .exists()
      .hasText(
        "Rejected",
        "the primary button is replaced with a read-only label",
      );

    const doc = this.server.schema.document.first();
    const { changesRequestedBy } = doc.attrs;

    assert.true(changesRequestedBy?.includes(TEST_USER_EMAIL));
  });

  test("non-owner viewers of shareable drafts cannot edit the metadata of a draft", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: true,
      owners: [TEST_USER_2_EMAIL],
      isShareable: true,
    });

    await visit("/document/1?draft=true");

    assertEditingIsDisabled(assert);
  });

  test("doc owners can publish their docs for review", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: true,
      docType: "PRD",
    });

    await visit("/document/1?draft=true");

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).hasText("Publish for review...");

    await click(SIDEBAR_FOOTER_PRIMARY_BUTTON);

    assert.dom(PUBLISH_FOR_REVIEW_MODAL_SELECTOR).exists();

    let clickPromise = click(DOCUMENT_MODAL_PRIMARY_BUTTON_SELECTOR);

    await waitFor(PUBLISHING_FOR_REVIEW_MESSAGE_SELECTOR);
    assert.dom(PUBLISHING_FOR_REVIEW_MESSAGE_SELECTOR).exists();

    await clickPromise;

    await waitFor(DOC_PUBLISHED_MODAL_SELECTOR);
    assert.dom(DOC_PUBLISHED_MODAL_SELECTOR).exists();

    assert
      .dom(SHARE_DOCUMENT_URL_INPUT_SELECTOR)
      .exists()
      .hasValue(`${TEST_SHORT_LINK_BASE_URL}/prd/hcp-001`);

    assert.dom(DOC_PUBLISHED_COPY_URL_BUTTON_SELECTOR).hasText("Copy link");
    assert
      .dom(CONTINUE_TO_DOCUMENT_BUTTON_SELECTOR)
      .hasText("Continue to document")
      .hasAttribute("data-test-color", "tertiary");

    // TODO: Assert that clicking the modal dismisses it.
    // Requires @hashicorp/design-system-components 2.9.0+
    // https://github.com/hashicorp/design-system/commit/a6553ea032f70f0167f149589801b72154c3cf75
  });

  test('the "document published" modal hides the share elements if the docNumber fails to load', async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      isDraft: true,
      docType: "PRD",
      docNumber: "LAB-???",
    });

    await visit("/document/1?draft=true");

    await click(SIDEBAR_FOOTER_PRIMARY_BUTTON);
    await click(DOCUMENT_MODAL_PRIMARY_BUTTON_SELECTOR);

    await waitFor(DOC_PUBLISHED_MODAL_SELECTOR);
    assert.dom(DOC_PUBLISHED_MODAL_SELECTOR).exists();

    assert.dom(SHARE_DOCUMENT_URL_INPUT_SELECTOR).doesNotExist();
    assert.dom(DOC_PUBLISHED_COPY_URL_BUTTON_SELECTOR).doesNotExist();

    assert
      .dom(CONTINUE_TO_DOCUMENT_BUTTON_SELECTOR)
      .hasAttribute(
        "data-test-color",
        "primary",
        "the Continue button becomes the primary button when the copy link is hidden",
      );
  });

  test("non-required values can be reset by saving an empty value", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      summary: "foo bar baz",
    });

    await visit("/document/1?draft=true");

    await click(`${SUMMARY_SELECTOR} button`);

    await fillIn(`${SUMMARY_SELECTOR} textarea`, "");

    await triggerKeyEvent(`${SUMMARY_SELECTOR} textarea`, "keydown", "Enter");

    assert.dom(SUMMARY_SELECTOR).hasText("Enter a summary");
  });

  test('"people" inputs receive focus on click', async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      title: "Test Document",
      isDraft: true,
      customEditableFields: {
        Stakeholders: {
          displayName: "Stakeholders",
          type: "PEOPLE",
        },
      },
    });

    await visit("/document/1?draft=true");

    await click(`${CONTRIBUTORS_SELECTOR} .field-toggle`);

    assert.true(
      document.activeElement === find(`${CONTRIBUTORS_SELECTOR} input`),
    );

    await click(`${APPROVERS_SELECTOR} .field-toggle`);

    assert.true(document.activeElement === find(`${APPROVERS_SELECTOR} input`));
  });

  test('clicking the empty state of the related resources list opens the "add related resource" modal', async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      title: "Test Document",
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    await click("[data-test-related-resources-list-empty-state]");
    await waitFor(ADD_RELATED_RESOURCE_MODAL_SELECTOR);

    assert.dom(ADD_RELATED_RESOURCE_MODAL_SELECTOR).exists();
  });

  test("the title attribute saves", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      title: "Test Document",
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    await click(`${TITLE_SELECTOR} button`);

    await fillIn(`${TITLE_SELECTOR} textarea`, "New Title");

    await triggerKeyEvent(`${TITLE_SELECTOR} textarea`, "keydown", "Enter");

    assert.dom(TITLE_SELECTOR).hasText("New Title");
  });

  test("the summary attribute saves", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      summary: "foo bar baz",
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    await click(`${SUMMARY_SELECTOR} button`);

    await fillIn(`${SUMMARY_SELECTOR} textarea`, "New Summary");

    await triggerKeyEvent(`${SUMMARY_SELECTOR} textarea`, "keydown", "Enter");

    assert.dom(SUMMARY_SELECTOR).hasText("New Summary");
  });

  test("the contributors attribute saves", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      contributors: [TEST_USER_2_EMAIL],
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    await click(`${CONTRIBUTORS_SELECTOR} button`);

    // Delete the existing contributor and save
    await click(PEOPLE_SELECT_REMOVE_BUTTON_SELECTOR);
    await click(EDITABLE_FIELD_SAVE_BUTTON_SELECTOR);

    assert.dom(CONTRIBUTORS_SELECTOR).hasText("None");
  });

  test("the approvers attribute saves", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      approvers: [TEST_USER_2_EMAIL],
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    await click(`${APPROVERS_SELECTOR} button`);

    // Delete the existing approver and save
    await click(PEOPLE_SELECT_REMOVE_BUTTON_SELECTOR);
    await click(EDITABLE_FIELD_SAVE_BUTTON_SELECTOR);

    assert.dom(APPROVERS_SELECTOR).hasText("None");
  });

  test("the product area attribute saves", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("product", {
      name: "Foo",
    });

    this.server.create("product", {
      name: "Bar",
    });

    this.server.create("document", {
      objectID: 1,
      product: "Bar",
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    assert.dom(PRODUCT_SELECT_SELECTOR).containsText("Bar");

    await click(`${PRODUCT_SELECT_SELECTOR} button`);

    await click(PRODUCT_SELECT_DROPDOWN_ITEM);

    assert.dom(PRODUCT_SELECT_SELECTOR).containsText("Foo");

    // confirm with the back end

    assert.equal(
      this.server.schema.document.first().attrs.product,
      "Foo",
      "the product is updated in the back end",
    );
  });

  test("customEditableFields save (STRING)", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      customEditableFields: {
        foo: {
          displayName: "Foo",
          type: "STRING",
        },
      },
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    await click(`${CUSTOM_STRING_FIELD_SELECTOR} button`);

    await fillIn("textarea", "Bar");

    await click(EDITABLE_FIELD_SAVE_BUTTON_SELECTOR);

    assert.dom(CUSTOM_STRING_FIELD_SELECTOR).hasText("Bar");
  });

  test("customEditableFields save (PEOPLE)", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      customEditableFields: {
        foo: {
          displayName: "Foo",
          type: "PEOPLE",
        },
      },
      foo: [TEST_USER_2_EMAIL],
      isDraft: true,
    });

    await visit("/document/1?draft=true");

    await click(`${CUSTOM_PEOPLE_FIELD_SELECTOR} button`);

    // Delete the existing contributor and save
    await click(PEOPLE_SELECT_REMOVE_BUTTON_SELECTOR);
    await click(EDITABLE_FIELD_SAVE_BUTTON_SELECTOR);

    assert.dom(CUSTOM_PEOPLE_FIELD_SELECTOR).hasText("None");
  });

  test(`you can move a doc into the "approved" status`, async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      status: "In-Review",
      approvers: [],
      approvedBy: [],
    });

    await visit("/document/1");

    assert.dom(DOC_STATUS).hasText("In review");

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).hasText("Move to Approved");

    await click(SIDEBAR_FOOTER_PRIMARY_BUTTON);

    assert.dom(DOC_STATUS).hasText("Approved");

    const doc = this.server.schema.document.first();

    assert.equal(doc.attrs.status, "Approved");
  });

  test("you can approve your own doc", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      status: "In-Review",
      approvers: [TEST_USER_EMAIL],
      approvedBy: [],
    });

    await visit("/document/1");

    await click(SIDEBAR_FOOTER_PRIMARY_BUTTON);

    const doc = this.server.schema.document.first();

    assert.true(doc.attrs.approvedBy?.includes(TEST_USER_EMAIL));

    assert
      .dom(`${APPROVERS_SELECTOR} li ${APPROVED_BADGE_SELECTOR}`)
      .exists("the approver is badged with a check");

    assert.equal(doc.attrs.status, "Approved");
    assert.true(doc.attrs.approvedBy?.includes(TEST_USER_EMAIL));
  });

  test("owners can move a previously approved from in-review to approved", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      status: "Approved",
      owners: [TEST_USER_EMAIL],
    });

    await visit("/document/1");

    await click(SIDEBAR_FOOTER_SECONDARY_DROPDOWN_BUTTON);

    assert.dom(SIDEBAR_FOOTER_OVERFLOW_MENU).exists();
    assert.dom(SIDEBAR_FOOTER_OVERFLOW_ITEM).exists({ count: 2 });

    const firstItem = find(SIDEBAR_FOOTER_OVERFLOW_ITEM);
    const secondItem = findAll(SIDEBAR_FOOTER_OVERFLOW_ITEM)[1];

    const overflowMenuFlightIcons = findAll(
      `${SIDEBAR_FOOTER_OVERFLOW_ITEM} .flight-icon`,
    );

    const firstIcon = overflowMenuFlightIcons[0];
    const secondIcon = overflowMenuFlightIcons[1];

    assert.dom(firstItem).hasText("Move to In Review");
    assert.dom(firstIcon).hasAttribute("data-test-icon", "history");

    assert.dom(secondItem).hasText("Move to Obsolete...");
    assert.dom(secondIcon).hasAttribute("data-test-icon", "archive");

    await click(SIDEBAR_FOOTER_OVERFLOW_ITEM);

    assert.dom(SIDEBAR_FOOTER_OVERFLOW_MENU).doesNotExist();

    assert
      .dom(FLASH_MESSAGE_SELECTOR)
      .hasAttribute("data-test-flash-notification-type", "success")
      .containsText('Document status changed to "In-Review"');

    const doc = this.server.schema.document.first();

    assert.equal(doc.attrs.status, "In-Review");
  });

  test("approvers who have approved a document are badged with a checkmark", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      approvers: [TEST_USER_2_EMAIL, TEST_USER_3_EMAIL],
      approvedBy: [TEST_USER_2_EMAIL],
    });

    await visit("/document/1");

    assert.dom(`${APPROVERS_SELECTOR} li`).exists({ count: 2 });

    assert
      .dom(`${APPROVERS_SELECTOR} li:nth-child(1) ${APPROVED_BADGE_SELECTOR}`)
      .exists("the first approver is badged with a check");

    assert
      .dom(`${APPROVERS_SELECTOR} li:nth-child(2) ${APPROVED_BADGE_SELECTOR}`)
      .doesNotExist("the second approver is not badged");
  });

  test("a locked doc can't be edited", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      locked: true,
    });

    await visit("/document/doc-0?draft=true");

    assert
      .dom(`${TITLE_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only title");
    assert
      .dom(`${SUMMARY_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only summary")
      .hasText("None", 'correctly does not say "enter a summary"');

    assert
      .dom(`${CONTRIBUTORS_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only contributors list");
    assert
      .dom(`${APPROVERS_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only approvers list");
    assert
      .dom(ADD_RELATED_DOCUMENT_OPTION_SELECTOR)
      .doesNotExist("no add related resource option");

    assert.dom(PRODUCT_SELECT_SELECTOR).doesNotExist("no product select");
    assert.dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR).doesNotExist();

    assert
      .dom(DISABLED_FOOTER_H5)
      .hasText("Document is locked", "shows the locked-doc message");
  });

  test("the doc owner can move an in-review doc to approved", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      status: "In-review",
      isDraft: false,
    });

    await visit("/document/1");

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).hasText("Move to Approved");

    await click(SIDEBAR_FOOTER_PRIMARY_BUTTON);

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).doesNotExist();
    assert
      .dom(SIDEBAR_FOOTER_PRIMARY_BUTTON_READ_ONLY)
      .exists()
      .hasText("Approved");

    assert
      .dom(FLASH_MESSAGE_SELECTOR)
      .hasAttribute("data-test-flash-notification-type", "success")
      .containsText('Document status changed to "Approved"');

    const doc = this.server.schema.document.first();

    assert.equal(doc.attrs.status, "Approved");

    assert.dom(DOC_STATUS).hasText("Approved");
  });

  test("drafts can be deleted", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
    });

    await visit("/document/1?draft=true");

    assert
      .dom(`${SIDEBAR_FOOTER_SECONDARY_BUTTON} .flight-icon`)
      .hasAttribute("data-test-icon", "trash");

    await click(SIDEBAR_FOOTER_SECONDARY_BUTTON);

    assert.dom(DELETE_MODAL).exists("the user is shown a confirmation screen");

    assert.dom(DOCUMENT_MODAL_PRIMARY_BUTTON_SELECTOR).hasText("Yes, delete");

    await click(DOCUMENT_MODAL_PRIMARY_BUTTON_SELECTOR);

    assert.dom(DELETE_MODAL).doesNotExist("the modal is dismissed");

    assert.dom(FLASH_MESSAGE_SELECTOR).containsText("Document draft deleted");

    assert.equal(
      currentURL(),
      "/my/documents",
      'the user is redirected to the "my documents" page',
    );
  });

  test("in-review docs can be archived", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      status: "In-review",
      isDraft: false,
    });

    await visit("/document/1");

    assert.dom(SIDEBAR_FOOTER_PRIMARY_BUTTON).hasText("Move to Approved");
    assert
      .dom(`${SIDEBAR_FOOTER_SECONDARY_BUTTON} .flight-icon`)
      .hasAttribute(
        "data-test-icon",
        "archive",
        "the icon-only button is shown",
      );

    await click(SIDEBAR_FOOTER_SECONDARY_BUTTON);

    assert.dom(ARCHIVE_MODAL).exists("the user is shown a confirmation screen");

    assert.dom(DOCUMENT_MODAL_PRIMARY_BUTTON_SELECTOR).hasText("Yes, archive");

    await click(DOCUMENT_MODAL_PRIMARY_BUTTON_SELECTOR);

    assert.dom(ARCHIVE_MODAL).doesNotExist("the modal is dismissed");

    assert
      .dom(SIDEBAR_FOOTER_PRIMARY_BUTTON)
      .doesNotExist("the primary button is removed");
    assert
      .dom(SIDEBAR_FOOTER_SECONDARY_BUTTON)
      .doesNotExist("the secondary button is removed");

    assert
      .dom(FLASH_MESSAGE_SELECTOR)
      .exists({ count: 1 })
      .hasAttribute("data-test-flash-notification-type", "success")
      .containsText('Document status changed to "Obsolete"');

    assert
      .dom(SIDEBAR_FOOTER_PRIMARY_BUTTON_READ_ONLY)
      .hasText(
        "Document is obsolete",
        "A read-only message is shown in place of the buttons",
      );

    const doc = this.server.schema.document.first();

    assert.equal(doc.attrs.status, "Obsolete");
  });

  test("the doc is locked if it's not app-created", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      appCreated: false,
    });

    await visit("/document/doc-0?draft=true");

    assert
      .dom(`${TITLE_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only title");
    assert
      .dom(`${SUMMARY_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only summary")
      .hasText("None", 'correctly does not say "enter a summary"');

    assert
      .dom(`${CONTRIBUTORS_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only contributors list");

    assert
      .dom(`${APPROVERS_SELECTOR} ${EDITABLE_FIELD_READ_VALUE}`)
      .exists("read-only approvers list");
    assert
      .dom(ADD_RELATED_DOCUMENT_OPTION_SELECTOR)
      .doesNotExist("no add related resource option");

    assert.dom(PRODUCT_SELECT_SELECTOR).doesNotExist("no product select");
    assert.dom(DRAFT_VISIBILITY_TOGGLE_SELECTOR).doesNotExist();

    assert
      .dom(DISABLED_FOOTER_H5)
      .hasText("Read-only headers", "shows the locked-doc message");
  });

  test("it displays a list of projects the document is in", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      objectID: 1,
      projects: [1, 2],
    });

    this.server.create("project", {
      id: 1,
      title: "Project 1",
    });

    this.server.create("project", {
      id: 2,
      title: "Project 2",
    });

    await visit("/document/1");

    assert.dom(PROJECT_LINK).exists({ count: 2 });

    const firstProjectLink = find(PROJECT_LINK);
    const secondProjectLink = findAll(PROJECT_LINK)[1];

    assert.dom(firstProjectLink).hasText("Project 1");
    assert.dom(firstProjectLink).hasAttribute("href", "/projects/1");

    assert.dom(secondProjectLink).hasText("Project 2");
    assert.dom(secondProjectLink).hasAttribute("href", "/projects/2");
  });

  test("you can't add a draft to a project", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document");

    await visit("/document/doc-0?draft=true");

    assert.dom(ADD_TO_PROJECT_BUTTON).hasAttribute("aria-disabled");
  });

  test("you can add a published doc to a project", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      isDraft: false,
      status: "In-review",
    });

    this.server.create("project", {
      id: 1,
    });

    // Remove the factory-created document
    this.server.schema.projects.first().update({
      hermesDocuments: [],
    });

    await visit("/document/doc-0");

    assert.dom(PROJECT_LINK).doesNotExist();

    await click(ADD_TO_PROJECT_BUTTON);

    assert.dom(ADD_TO_PROJECT_MODAL).exists();

    await click(PROJECT_OPTION);

    assert.dom(ADD_TO_PROJECT_MODAL).doesNotExist();

    assert.dom(PROJECT_LINK).exists().hasAttribute("href", "/projects/1");

    const project = this.server.schema.projects.first();
    const document = this.server.schema.document.first();

    assert.true(document.projects.includes(project.id));
  });

  test("you can create a new project to add the document to", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    const title = "Foo";
    const id = 500;

    this.server.create("document", {
      objectID: id,
      title,
      isDraft: false,
      status: "In-review",
    });

    this.server.create("related-hermes-document", {
      id,
      title,
    });

    await visit(`/document/${id}`);

    await click(ADD_TO_PROJECT_BUTTON);

    assert.dom(ADD_TO_PROJECT_MODAL).exists();

    await click(START_NEW_PROJECT_BUTTON);

    await fillIn(PROJECT_TITLE_INPUT, "New Project");

    const clickPromise = click(CREATE_PROJECT_BUTTON);

    // Confirm the "creating..." state
    await waitFor(CREATING_PROJECT_MESSAGE);

    await clickPromise;

    assert.equal(
      currentURL(),
      "/projects/1",
      "you're redirected to the new project",
    );

    assert.dom(PROJECT_DOCUMENT).containsText(title);

    assert.dom(PROJECT_DOCUMENT_LINK).hasAttribute("href", `/document/${id}`);
  });

  test("you can remove a document from a project", async function (this: AuthenticatedDocumentRouteTestContext, assert) {
    this.server.create("document", {
      isDraft: false,
      status: "In-review",
      projects: [1],
    });

    this.server.create("project", {
      id: 1,
    });

    await visit("/document/doc-0");

    assert.dom(PROJECT_LINK).exists();

    await click(`${DOCUMENT_PROJECT} ${OVERFLOW_MENU_BUTTON}`);

    await click(REMOVE_FROM_PROJECT_BUTTON);

    assert.dom(PROJECT_LINK).doesNotExist();

    const document = this.server.schema.document.first();

    assert.true(document.projects.length === 0);
  });
});
