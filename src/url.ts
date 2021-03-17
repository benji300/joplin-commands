import joplin from 'api';
import { exec } from 'child_process';

/**
 * Helper class for URLs.
 */
export class Url {

  /**
   * Open handled url in system's default browser
   */
  static open(url: string) {
    if (!url) return;

    try {
      var start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
      const subprocess = exec(start + ' ' + url);
      subprocess.unref();
    } catch (error) {
      joplin.views.dialogs.showMessageBox(`Something went wrong... could not open requested URL.`);
    }
  }
}
