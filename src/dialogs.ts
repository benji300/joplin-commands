import joplin from 'api';
import { DialogResult } from 'api/types';

/**
 * User input dialog which retrieves a simple string input.
 */
export class TextInputDialog {
  private _dialog: any;
  private _title: string;
  private _placeholder: string;

  constructor(title: string, placeholder: string) {
    this._title = title;
    this._placeholder = placeholder;
  }

  private prepareDialogHtml(value: string): string {
    return `
      <div>
        <h3>${this._title}</h3>
        <form name="inputForm">
          <input type="text" id="val" name="val" value="${value}" placeholder="${this._placeholder}" tabindex="0" autofocus required>
        </form>
      </div>
    `;
  }

  /**
   * Register the dialog.
   */
  async register() {
    this._dialog = await joplin.views.dialogs.create('dialog' + this._title.replace(' ', ''));
    await joplin.views.dialogs.addScript(this._dialog, './webview_dialog.css');
  }

  /**
   * Open the dialog width the handled values and returns the input string. Might be empty string.
   */
  async open(value: string): Promise<string> {
    const dialogHtml: string = await this.prepareDialogHtml(value);
    await joplin.views.dialogs.setHtml(this._dialog, dialogHtml);
    const result: DialogResult = await joplin.views.dialogs.open(this._dialog);
    if (result.id == 'ok' && result.formData != null) {
      return result.formData.inputForm.val;
    }
    return '';
  }
}