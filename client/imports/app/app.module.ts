import {NgModule} from "@angular/core";
import { FormsModule } from '@angular/forms';
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {DemoComponent} from "./demo/demo.component";
import {HeroesComponent} from "./Heroes/heroes.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ProjectComponent} from "./project/project.component";
import {DemoDataService} from "./demo/demo-data.service";
import {HeroDataService} from "./Heroes/hero-data.service";
import {RouterModule, Routes} from '@angular/router';
import {ProjectsDataService} from "./dashboard/projects-data.service";

const appRoutes: Routes = [
    {path: 'crisis-center', component: DemoComponent},
    {path: 'hero', component: DemoComponent},
    {
        path: 'heroes',
        component: HeroesComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent
    },
    {
        path: 'project/:id',
        component: ProjectComponent
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
        DemoComponent,
        HeroesComponent,
        DashboardComponent,
        ProjectComponent
    ],
    // Entry Components
    entryComponents: [
        AppComponent
    ],
    // Providers
    providers: [
        DemoDataService,
        HeroDataService,
        ProjectsDataService
    ],
    // Modules
    imports: [
        BrowserModule,
        FormsModule,
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
