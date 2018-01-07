

import {ProjectsCollection} from "../../../both/collections/projects.collection";
import {ConfigSetsCollection} from "../../../both/collections/configsets.collection";
import {MappingsCollection} from "../../../both/collections/mappings.collection";

declare let SSL : any;

export class Main {
    start(): void {
        SSL('C:/Users/lguel/server.key', 'C:/Users/lguel/server.cert', 442);
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
        Meteor.publish('projects-collection', () => {
            return ProjectsCollection.find();
        });
        Meteor.publish('configsets-collection', () => {
            return ConfigSetsCollection.find();
        });
        Meteor.publish('mappings-collection', () => {
            return MappingsCollection.find();
        });
        //publish the custom user data
        Meteor.publish(null, () => {
            return Meteor.users.find({}, {fields: {preferences: 1}});
        });
    }
}

export function serverTest() {
    console.log("alles okay sagt der server");
}

Meteor.methods({
    serverTest
});