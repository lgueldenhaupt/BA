import { MongoObservable } from "meteor-rxjs";
import { Project} from "../models/project.model";

export const ProjectsCollection = new MongoObservable.Collection<Project>("projects-collection");