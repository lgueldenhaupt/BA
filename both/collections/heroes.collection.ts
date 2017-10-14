import { MongoObservable } from "meteor-rxjs";
import {Hero} from "../models/hero.model";

export const HeroCollection = new MongoObservable.Collection<Hero>("hero-collection");