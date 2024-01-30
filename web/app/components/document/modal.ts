import { assert } from "@ember/debug";
import { action } from "@ember/object";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { task } from "ember-concurrency";
import { HdsModalColor } from "hds/_shared";

interface DocumentModalComponentSignature {
  Element: HTMLDialogElement;
  Args: {
    headerText: string;
    bodyText?: string;
    errorTitle?: string;
    taskButtonText?: string;
    taskButtonLoadingText?: string;
    taskButtonIsDisabled?: boolean;
    taskButtonColor?: HdsModalColor;
    hideFooterWhileSaving?: boolean;
    close: () => void;
    task?: () => Promise<void> | void;
  };
  Blocks: {
    default: [{ taskIsRunning: boolean }];
  };
}

export default class DocumentModalComponent extends Component<DocumentModalComponentSignature> {
  @tracked taskIsRunning = false;

  @tracked protected errorIsShown = false;
  @tracked protected errorTitle = "";
  @tracked protected errorDescription = "";

  private showError(title: string, description: unknown | string) {
    this.errorIsShown = true;
    this.errorTitle = title;
    this.errorDescription = description as string;
  }

  protected get footerIsShown() {
    if (!this.args.task) {
      return false;
    }

    if (this.args.hideFooterWhileSaving && this.taskIsRunning) {
      return false;
    }

    return true;
  }

  protected get primaryButtonText() {
    if (this.taskIsRunning) {
      return this.args.taskButtonLoadingText ?? "Saving...";
    } else {
      return this.args.taskButtonText ?? "Save";
    }
  }

  @action protected resetErrors() {
    this.errorIsShown = false;
    this.errorTitle = "";
    this.errorDescription = "";
  }

  protected task = task(async () => {
    assert("task must be provided to the document modal", this.args.task);

    try {
      this.taskIsRunning = true;
      await this.args.task();
      this.args.close();
    } catch (error: unknown) {
      this.taskIsRunning = false;
      if (this.args.errorTitle) {
        this.showError(this.args.errorTitle, error);
      }
    }
  });
}

declare module "@glint/environment-ember-loose/registry" {
  export default interface Registry {
    "Document::Modal": typeof DocumentModalComponent;
  }
}
