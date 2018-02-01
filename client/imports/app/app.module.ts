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
import {ConfigsPipe, CriteriaSortPipe, FilterPipe, FlagTranslate, SearchFilterPipe, StringSort, UserProjects} from "../helpers/filter.pipe";
import {SearchService} from "../services/search.service";
import {ParamExtractor} from "../helpers/param-extractor";
import {ConfigComponent} from "./config/config.component";
import {MappingComponent} from "./mapping/mapping.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LoginComponent} from "./login/login.component";
import {ConfirmationModalService} from "../services/confirmationModal.service";
import {ConfigFilterComponent} from "./configFilter/configFilter.component";
import {MappingsDataService} from "../services/mappings-data.service";
import {AliasFinder} from "../helpers/alias-finder";
import {FilterService} from "../services/filter.service";
import {DynamicTable} from "../helpers/dynamic.table/dynamic.table";
import {IsLoggedIn} from "../helpers/isLoggedIn";
import {ConfigresultParser} from "../helpers/configresult-parser";
import {InfoCardComponent} from "./infoCard/infoCard.component";

/**
 * This is the app module configuration. Every created component, filter, service, submodule for the main module must be declared here.
 * Also the routes for the router are declared here.
 */


/**
 * App Routes.
 * Path: url part
 * Component: responsible component
 * CanActivate: Guard for access control
 * Data: any data you like to pass with the route
 */
const appRoutes: Routes = [
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [IsLoggedIn],
        data: {depth: 1}
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'mapping',
        component: MappingComponent,
        canActivate: [IsLoggedIn],
        data: {depth: 2}
    },
    {
        path: 'mapping/:id',
        component: MappingComponent,
        canActivate: [IsLoggedIn],
        data: {depth: 2}
    },
    {
        path: 'project/:id',
        component: ProjectComponent,
        canActivate: [IsLoggedIn],
        data: {depth: 2}
    },
    {
        path: 'config/:id',
        component: ConfigComponent,
        canActivate: [IsLoggedIn],
        data: {depth: 3}
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
        ConfigFilterComponent,
        InfoCardComponent,
        SearchFilterPipe,
        FilterPipe,
        ConfigsPipe,
        DynamicTable,
        CriteriaSortPipe,
        StringSort,
        UserProjects,
        FlagTranslate
    ],
    // Entry Components
    entryComponents: [
        AppComponent
    ],
    // Providers
    providers: [
        ProjectsDataService,
        ConfigSetsDataService,
        MappingsDataService,
        NotificationService,
        ConfirmationModalService,
        FilterService,
        SearchService,
        ParamExtractor,
        AliasFinder,
        IsLoggedIn,
        ConfigresultParser
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
