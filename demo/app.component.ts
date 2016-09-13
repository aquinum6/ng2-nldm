import { Component } from '@angular/core';
import { DrawerService } from '../src';
import { Subject } from 'rxjs/Subject';

@Component({
    selector: 'my-app',
    template: `
    <h1>
        My First Angular 2 App
    </h1>
    <native-drawer width="300px">
        <div style="width: 100%; height: 2000px; background-color: white;"></div>
    </native-drawer>
    <button style="position: fixed; z-index: 10001; right: 0; top: 0;"
            (click)="_toggleButton$.next($event)">Toggle</button>
    `
})
export class AppComponent {

    private _toggleButton$: Subject<Event> = new Subject<Event>();

    constructor(private dW: DrawerService){

        dW.toggle(this._toggleButton$);

    }

}
