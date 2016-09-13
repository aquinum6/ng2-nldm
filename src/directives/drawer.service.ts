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

    private _width: number = 300;
    private _width$: BehaviorSubject<number> = new BehaviorSubject<number>(this._width);
    private _handler$: Subject<Event> = new Subject<Event>();
    private _position$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    //If drawer should be forced to open or close, only used for missed isFinal events during panend
    private _force$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    //If element is currently touched
    private _touched$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    //Get reference point
    private _start$: Observable<number> =
        this._handler$
            .filter((ev: any) => ev.type === 'panstart')
            .map((ev: any) => ev.center.x - ev.target.getBoundingClientRect().left - this._width);

    //Event triggered when touch finished and isFinal was not triggered, returns true if half of a drawer is still visible
    private _end$: Observable<boolean> =
        this._handler$
            .filter((ev: any) => ev.type === 'panend')
            .do((ev: any) => {
                this._touched$.next(false);
                ev.preventDefault();
            })
            .mergeMap(() => new BehaviorSubject((fn: any) =>
                this._force$
                    .last()
                    .filter(e => e)
                    .subscribe(fn)))
            .mergeMap(() => this._position$.take(1)
                .map(pos => pos > this._width/2));

    constructor(){
        Observable.combineLatest(
            this._start$,
            this._handler$
                .filter((ev: any) => ev.type === 'panleft' || ev.type === 'panright'))
            .do((ev) => this._touched$.next(true))
            .map((val: any) => {
                let [start, ev] = val;
                return {
                    pos: ev.center.x - start,
                    isFinal: ev.isFinal,
                    type: ev.type //TODO: add velocity
                }
            })
            .subscribe(ev => {
                this._position$.next(ev.pos > this._width ? this._width : ev.pos < 0 ? 0 : ev.pos);
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

    getMove(ev){
        this._handler$.next(ev);
    }

    /* Cloaking stream for dealing with drawer animation during window resizing */
    get resizeCloak$(){
        return this._width$
            .map(() => true)
            .merge(this._width$
                .debounceTime(350) //Animation time + .05s
                .map(() => false));
    }

    get position$(){
        return this._position$;
    }

    get width$(){
        return this._width$;
    }

    set width(val: number){
        this.close();
        this._width = val;
        this._width$.next(val);
    }

    get onTouch$(){
        return this._touched$;
    }

    open(){
        this._position$.next(this._width);
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