import { MongoObservable } from "meteor-rxjs";
import {ConfigSet} from "../models/configSet.model";

export const ConfigSetsCollection = new MongoObservable.Collection<ConfigSet>("configsets-collection");