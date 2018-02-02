import {MongoObservable} from "meteor-rxjs";
import {UserFile} from "../models/file";
declare const UploadFS: any;

export const Files = new MongoObservable.Collection<UserFile>('files');


export const FileStore = new UploadFS.store.GridFS({
    collection: Files.collection,
    name: 'files',
    permissions: new UploadFS.StorePermissions({
        insert(userId, doc) { return true},
        update(userId, doc) {return true},
        remove(userId, doc) {return true}
    })
});