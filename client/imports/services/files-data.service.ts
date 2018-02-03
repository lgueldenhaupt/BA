import {Files, FileStore} from "../../../both/collections/file.collection";
import {Injectable} from "@angular/core";
import {MongoObservable} from "meteor-rxjs";
import {Observable} from "rxjs/Observable";
import {UserFile} from "../../../both/models/file";

declare const UploadFS: any;

@Injectable()
export class FilesDataService {


    public uploadFile(data: File, configID): Promise<any> {
        return new Promise((resolve, reject) => {
            // pick from an object only: name, type and size
            const file = {
                name: data.name,
                type: data.type,
                size: data.size,
                configID: configID
            };

            const upload = new UploadFS.Uploader({
                data,
                file,
                store: FileStore,
                onError: reject,
                onComplete: resolve
            });

            upload.start();
        });
    }

    public getConfigFiles(configID: string) : Observable<any> {
        return Files.find({configID: configID});
    }

    public removeFile(data : UserFile) : Observable<number> {
        return Files.remove(data._id);
    }
}