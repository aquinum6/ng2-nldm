import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    template: `
    <h1>
        My First Angular 2 App
    </h1>
    <native-drawer width="300px">
        <div style="width: 100%; height: 2000px; background-color: white;"></div>
    </native-drawer>
    `
})
export class AppComponent { }
