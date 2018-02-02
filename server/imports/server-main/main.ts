import {ProjectsCollection} from "../../../both/collections/projects.collection";
import {ConfigSetsCollection} from "../../../both/collections/configsets.collection";
import {MappingsCollection} from "../../../both/collections/mappings.collection";
import {Files} from "../../../both/collections/file.collection";

export class Main {
    start(): void {
        Meteor.users.allow({
            update: function() {
                return true;
            }
        });
        Meteor.publish('Meteor.users.initials', function ({ userIds }) {
            const selector = {
                _id: { $in: userIds }
            };
            const options = {
                fields: { preferences: 1 }
            };
            return Meteor.users.find(selector, options);
        });
        Meteor.publish('projects-collection', function () {
            return ProjectsCollection.find({ $or: [ {creator: this.userId}, {privateProject: false}]});
        });
        Meteor.publish('configsets-collection', () => {
            return ConfigSetsCollection.find();
        });
        Meteor.publish('mappings-collection', function() {
            return MappingsCollection.find({creator: this.userId});
        });
        //publish the custom user data
        Meteor.publish(null, () => {
            return Meteor.users.find({}, {fields: {preferences: 1}});
        });
        Meteor.publish('files', function (ids: string[]) {
            return Files.collection.find({});
        });
    }
}

export function serverTest() {
    console.log("alles okay sagt der server");
}

Meteor.methods({
    serverTest
});