import joplin from 'api';
import { Path } from 'api/types';

/**
 * Helper class for data accesses.
 */
export class DA {

  private static async getAll(path: Path, query: any): Promise<any[]> {
    console.log(`getAll:`);
    query.page = 1;
    let response = await joplin.data.get(path, query);
    console.log(`response: ${JSON.stringify(response)}`);
    let result = !!response.items ? response.items : [];
    while (!!response.has_more) {
      console.log(`has_more`);
      query.page += 1;
      response = await joplin.data.get(path, query);
      result.concat(response.items)
    }
    console.log(`result: ${JSON.stringify(result)}`);
    return result;
  }

  /**
   * Gets All folders from the database.
   * By default it includes the fields: id, title
   */
  static async getAllFolders(additionalFields?: string[]): Promise<any[]> {
    // TODO implement additionalFields
    const fields: string[] = ['id', 'title'];
    return await DA.getAll(['folders'], { fields: fields, page: 1 });
  }

  /**
   * Gets the folder with the handle ID from the database or null. Including the specified fields.
   * By default it includes the fields: id, title
   */
  static async getFolderWithId(id: string, additionalFields?: string[]): Promise<any> {
    return await joplin.data.get(['folders', id], { fields: ['id', 'title'] });
    // return (await DA.getAllFolders(additionalFields)).find(x => x.id === id);
  }

  /**
   * Gets the folder with the handle title from the database or null. Including the specified fields.
   * By default it includes the fields: id, title
   */
  static async getFolderWithTitle(title: string, additionalFields?: string[]): Promise<any> {
    return (await DA.getAllFolders(additionalFields)).find(x => x.title === title);
  }

  /**
   * Gets All notes from the database.
   * By default it includes the fields: id, title, is_todo, todo_completed
   */
  static async getAllNotes(additionalFields?: string[]): Promise<any[]> {
    // TODO implement additionalFields
    const fields: string[] = ['id', 'title', 'is_todo', 'todo_completed'];
    return await DA.getAll(['notes'], { fields: fields, page: 1 });
    // console.log(`notes: ${JSON.stringify(notes)}`);
    // return notes;
  }

  /**
   * Gets the note with the handle ID from the database or null. Including the specified fields.
   * By default it includes the fields: id, title, is_todo, todo_completed
   */
  static async getNoteWithId(id: string, additionalFields?: string[]): Promise<any> {
    // TODO implement additionalFields
    return await joplin.data.get(['notes', id], { fields: ['id', 'title', 'is_todo', 'todo_completed'] });
    // const notes: any[] = await DA.getAllNotes(additionalFields);
    // return notes.find(x => x.id === id);
  }

  /**
   * Gets the note with the handle title from the database or null. Including the specified fields.
   * By default it includes the fields: id, title, is_todo, todo_completed
   */
  static async getNoteWithTitle(title: string, additionalFields?: string[]): Promise<any> {
    return (await DA.getAllNotes(additionalFields)).find(x => x.title === title);
  }

}