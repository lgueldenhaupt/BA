import {NgModule} from "@angular/core";
import { FormsModule } from '@angular/forms';
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ProjectComponent} from "./project/project.component";
import {RouterModule, Routes} from '@angular/router';
import {ProjectsDataService} from "../services/projects-data.service";
import {ConfigSetsDataService} from "../services/configsets-data.service";
import {NotificationService} from "../services/notification.service";
import {FilterPipe, ProjectFilterPipe} from "../helpers/filter.pipe";
import {SearchService} from "../services/search.service";
import {ParamExtractor} from "../helpers/param-extractor";
import {ConfigComponent} from "./config/config.component";
import {MappingComponent} from "./mapping/mapping.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LoginComponent} from "./login/login.component";

const appRoutes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'mapping',
        component: MappingComponent
    },
    {
        path: 'project/:id',
        component: ProjectComponent
    },
    {
        path: 'config/:id',
        component: ConfigComponent
    },
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'prefix'
    },
    {path: '**', component: AppComponent}
];

@NgModule({
    // Components, Pipes, Directive
    declarations: [
        AppComponent,
        LoginComponent,
        DashboardComponent,
        ProjectComponent,
        ConfigComponent,
        MappingComponent,
        ProjectFilterPipe,
        FilterPipe
    ],
    // Entry Components
    entryComponents: [
        AppComponent
    ],
    // Providers
    providers: [
        ProjectsDataService,
        ConfigSetsDataService,
        NotificationService,
        SearchService,
        ParamExtractor,
    ],
    // Modules
    imports: [
        BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(
            appRoutes,
        )
    ],
    // Main Component
    bootstrap: [AppComponent]
})
export class AppModule {
    constructor() {

    }
}
