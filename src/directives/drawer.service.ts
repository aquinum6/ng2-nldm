import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx'; //TODO: this is not proper import for rxjs!
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/debounceTime';

@Injectable()
export class DrawerService {

    private _drawerWidth: number = 300;
    private _width$: BehaviorSubject<number> = new BehaviorSubject<number>(this._drawerWidth);
    private _touched$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private _handlerRx$: Subject<Event> = new Subject<Event>();
    private _position$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private _force$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    //Get reference point
    private _start$: Observable<number> =
        this._handlerRx$
            .filter((ev: any) => ev.type === 'start')
            .map((ev: any) => ev.ev.center.x - ev.ev.target.getBoundingClientRect().left - this._drawerWidth);

    //Event triggered when touch finished and isFinal was not triggered, returns true if half of a drawer is still visible
    private _end$: Observable<boolean> =
        this._handlerRx$
            .filter((ev: any) => ev.type === 'end')
            .do((ev) => this._touched$.next(false))
            .do((ev: any) => ev.ev.preventDefault())
            .mergeMap(() => new BehaviorSubject((fn: any) =>
                this._force$
                    .last()
                    .filter(e => e)
                    .subscribe(fn)))
            .mergeMap(() => this._position$.take(1)
                .map(pos => pos > this._drawerWidth/2));

    constructor(){
//TODO: deactivate "second" event. example: if movement is done by handler deactivate drawer. Device can catch second event during motion and it will broke movement


        Observable.combineLatest(
            this._start$,
            this._handlerRx$
                .filter((ev: any) => ev.type === 'move'))
            .do((ev) => this._touched$.next(true))
            .map((val: any) => {
                let [start, ev] = val;
                return {
                    pos: ev.ev.center.x - start,
                    isFinal: ev.ev.isFinal,
                    ev: ev.ev,
                    type: ev.ev.type //TODO: add velocity
                }
            })
            .subscribe(ev => {

                this._position$.next(ev.pos > this._drawerWidth ? this._drawerWidth : ev.pos < 0 ? 0 : ev.pos);
                if(ev.isFinal){
                    if(ev.type === 'panleft'){
                        this.close();
                    } else {
                        this.open();
                    }

                    this._force$.next(false);
                } else {
                    this._force$.next(true);
                }
            });

        //Handle events that have ended but isFinal was not triggered
        this._end$
            .subscribe(bigger => {

                if(bigger){
                    this.open();
                } else {
                    this.close();
                }

                this._force$.next(false);
            });
    }

    get position$(){
        return this._position$;
    }

    get handler$(){
        return this._handlerRx$;
    }

    get width$(){
        return this._width$;
    }

    set width(val: number){
        this.close();
        this._drawerWidth = val;
        this._width$.next(val);
    }

    get active$(){
        return this._touched$;
    }

    open(){
        this._position$.next(this._drawerWidth);
    }

    close(){
        this._position$.next(0);
    }

    reset(){
        //Reset all information in instance
    }

    toggle(){
        //Toggle between open and close (really good for burger button)
    }

    disable(){

    }

    lock(){
        //Lock in position, should be able to move programatically but not by events
    }

    instantOpen(){
        //Open without animation
    }

    instantClose(){
        //Close without animation
    }

}