import { MongoObservable } from "meteor-rxjs";
import { Mapping } from "../models/mapping.model";

export const MappingsCollection = new MongoObservable.Collection<Mapping>("mappings-collection");