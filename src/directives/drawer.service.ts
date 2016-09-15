import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/never';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/last';

//noinspection SpellCheckingInspection
const PAN_START: string = 'panstart';
//noinspection SpellCheckingInspection
const PAN_LEFT: string = 'panleft';
//noinspection SpellCheckingInspection
const PAN_RIGHT: string = 'panright';
//noinspection SpellCheckingInspection
const PAN_END: string = 'panend';

@Injectable()
export class DrawerService {

    private _width: number = 300;
    private _width$: BehaviorSubject<number> = new BehaviorSubject<number>(this._width);
    private _handler$: Subject<Event> = new Subject<Event>();
    private _position$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private _lock$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _disable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    //If drawer should be forced to open or close, only used for missed isFinal events during pan-end
    private _force$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    //If element is currently touched
    private _touched$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private _mainEventStream$: any =
        this._lock$.switchMap(locked => locked ? Observable.never() : this._handler$);

    constructor(){
        //Get reference point
        let _start$: Observable<number> =
            this._mainEventStream$
                .filter((ev: any) => ev.type === PAN_START)
                .map((ev: any) => ev.center.x - ev.target.getBoundingClientRect().left - this._width);

        //Movement event
        let _move: Observable<{pos: number, isFinal: boolean, type: string}> =
            Observable.combineLatest(
                _start$,
                this._mainEventStream$
                    .filter((ev: any) => ev.type === PAN_LEFT || ev.type === PAN_RIGHT))
                .do((ev) => this._touched$.next(true))
                .map((val: any) => {
                    let [start, ev] = val;
                    return {
                        pos: ev.center.x - start,
                        isFinal: ev.isFinal,
                        type: ev.type
                        //TODO: add velocity
                    }
                });

        //Event triggered when touch finished and isFinal was not triggered, returns true if half of a drawer is still visible
        let _end$: Observable<boolean> =
            this._mainEventStream$
                .filter((ev: any) => ev.type === PAN_END)
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

        //Handle movement
        _move.subscribe(ev => {
                this._position$.next(ev.pos > this._width ? this._width : ev.pos < 0 ? 0 : ev.pos);
                if(ev.isFinal){
                    if(ev.type === PAN_LEFT){
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
        _end$.subscribe(bigger => {
                if(bigger){
                    this.open();
                } else {
                    this.close();
                }
                this._force$.next(false);
            });
    }

    /* Cloaking stream for dealing with drawer animation during window resizing */
    get resizeCloak$(): Observable<boolean>{
        return this._width$
            .map(() => true)
            .merge(this._width$
                .debounceTime(350) //Animation time + .05s
                .map(() => false));
    }

    get position$(): Observable<number>{
        return this._position$
            .mergeMap(pos => this._disable$
                .map(d => d ? 0 : pos));
    }

    get width$(): Observable<number>{
        return new Observable<number>((fn: any) =>
            this._width$.subscribe(fn));
    }

    set width(val: number){
        this.close();
        this._width = val;
        this._width$.next(val);
    }

    get onTouch$(): Observable<boolean>{
        return new Observable<boolean>((fn: any) =>
            this._touched$.subscribe(fn));
    }

    private _OpenClose(val: number, isLockable?: boolean): void{
        if(isLockable){
            this._lock$
                .filter(e => !e)
                .subscribe(() => this._position$.next(val));
        } else {
            this._position$.next(val);
        }
    }

    getMove(ev: Event): void{
        this._handler$.next(ev);
    }

    open(isLockable?: boolean): void{
        this._OpenClose(this._width, isLockable);
    }

    close(isLockable?: boolean): void{
        this._OpenClose(0, isLockable);
    }

    reset(): void{
        this.close();
        this._width = 300;
        this._width$.next(300);
    }
    /* Gets any event stream and perform toggle action */
    toggle(stream: Subject<any>): void{
        stream
            .mergeMap(() => this._position$
                .take(1)
                .map(pos => pos === 0))
            .subscribe(e => {
                if(e) this.open();
                else this.close();
            });
    }

    disable(isDisabled?: boolean): void{
        this._disable$.next(isDisabled === true || typeof isDisabled === "undefined");
    }

    lock(isLocked?: boolean): void{
        this._lock$.next(isLocked === true || typeof isLocked === "undefined");
    }
}