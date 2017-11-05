import { Component, OnInit } from "@angular/core";
import {ProjectsDataService} from "../../services/projects-data.service";
import {ConfigSetsDataService} from "../../services/configsets-data.service";
import template from "./project.component.html";
import style from "./project.component.scss";
import {Project} from "../../../../both/models/project.model";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {ConfigSet} from "../../../../both/models/configSet.model";
import {NotificationService} from "../../services/notification.service";
import {SearchService} from "../../services/search.service";
import {FileReaderEvent} from "../../../../both/models/fileReaderInterface";
import {ParamExtractor} from "../../helpers/param-extractor";
import undefined = Match.undefined;
import {ConfirmationModalService} from "../../services/confirmationModal.service";

declare let $ :any;

@Component({
    selector: "project",
    template,
    styles: [ style ]
})
export class ProjectComponent implements OnInit{
    projectID: any;
    project: Project;
    sub: any;
    configSets: Observable<ConfigSet[]>;
    searchText: string;
    chosenConfig: Object;
    view: number;

    constructor(
        private projectsDS: ProjectsDataService,
        private configSetsDS: ConfigSetsDataService,
        private route: ActivatedRoute,
        private router: Router,
        private notification : NotificationService,
        private search: SearchService,
        private parser: ParamExtractor,
        private confirm: ConfirmationModalService
    ) {
        this.project = {name: '', description: ''};
        this.chosenConfig = null;
        this.view = 1;
    }

    ngOnInit(): void {
        //to use 'this' in inner functions
        let self = this;

        //parse route params to get the project
        this.sub = this.route.params.subscribe(params =>{
            this.projectID = params['id'];
            let project$ = this.projectsDS.getProject(this.projectID);
            project$.subscribe(
                data => {
                    self.project = data[0];
                }
            )
        });
        this.search.getSearchQuery().subscribe(x => {
            this.searchText = (<HTMLInputElement>x.target).value;
        });
        this.configSets = this.configSetsDS.getProjectConfigs(this.projectID).zone();

        $(document).ready(function () {
            $('.tooltipped').tooltip({delay: 50});
            $('select').material_select();
        });
    }

    openAddConfigSetModal() {
        $(document).ready(function(){
            $('.modal').modal();
        });
    }

    createConfigSet(name, desc, params) {
        if (name === '') {
            this.notification.error("Please enter a name!");
            return;
        }
        this.configSetsDS.addConfig({name: name, description: desc, projectID: this.projectID, params: params}).subscribe((newID) => {
            if (newID != '' || newID != undefined) {
                this.notification.success("ConfigSet added");
            }
            else {
                this.notification.error("Could not add Config Set");
            }
        });
        if ($('.modal').modal()) {
            $('.modal').modal('close');
        }

    }

    deleteConfigSet(id, name) {
        this.confirm.openModal('Delete ' + name, "Do you really want to delete that config?").then((fullfilled) => {
            if (fullfilled) {
                this.configSetsDS.delete(id).subscribe((changedEntries) => {
                    if (changedEntries === 1) {
                        this.notification.success("ConfigSet deleted");
                    } else {
                        this.notification.error("ConfigSet not deleted");
                    }
                });
            }
        });
    }

    goToConfig(id) {
        this.router.navigate(['/config', id]);
    }

    chooseConfig(configSet) {
        this.chosenConfig = configSet;
    }

    onDrop(e) {
        let file = e.dataTransfer.files[0];
        e.preventDefault();
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        let FR = new FileReader();
        FR.onload = (ev : FileReaderEvent) => {
            let result = ev.target.result ? ev.target.result : '';
            let params = this.parser.searchForParams(result);
            this.createConfigSet(file.name, file.lastModifiedDate + '', params);
        };
        FR.readAsText(file);
    }

    onDragOver(e) {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-4 dropCard';
        e.preventDefault();
        return false;
    }

    onDragLeave(e) {
        let card = document.getElementById('dropCard');
        card.className = 'card amber accent-2 dropCard';
        return false;
    }

    changeView(value: number) {
        if (value >= 0 && value <=1) {
            this.view = value;
        }
    }
}