import { Component, ChangeDetectionStrategy, trigger, state, style, transition, animate } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DrawerService } from './drawer.service';
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

@Component({
    moduleId: module.id,
    selector: 'native-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.css'],
    animations: [
        trigger('overall', [
            transition('* => void', [
                animate('0.3s', style({
                    opacity: '0'
                }))
            ])
        ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NativeDrawer {

    //TODO: make sure that only one instance of drawer is active at given time
    //TODO: deactivate "second" event. example: if movement is done by handler deactivate drawer. Device can catch second event during motion and it will broke movement

    private drawerWidth: number = 300;
    private inmotion: boolean = false;

    private handlerRx$: Subject<Event> = new Subject<Event>();
    private drawerRx$: Subject<Event> = new Subject<Event>();
    private position$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    private force$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    //Position of start point
    private start$: Observable<number> =
        this.handlerRx$
            .filter((ev: any) => ev.type === 'start')
            //.do((ev) => this.inmotion = true)
            .map((ev: any) => ev.ev.center.x - ev.ev.target.getBoundingClientRect().left)
            .merge(
                //Drawer Event start stream
                this.drawerRx$
                    .filter((ev: any) => ev.type === 'start')
                    .map((ev: any) => ev.ev.center.x - this.drawerWidth));

    private end$: Observable<boolean> =
        this.handlerRx$
            .merge(this.drawerRx$)
            .filter((ev: any) => ev.type === 'end')
            .do((ev) => this.inmotion = false)
            .do((ev: any) => ev.ev.preventDefault())
            .mergeMap(() => new BehaviorSubject((fn: any) =>
                this.force$
                    .last()
                    .filter(e => e)
                    .subscribe(fn)))
            .mergeMap(() => this.position$.take(1)
                .map(pos => pos > this.drawerWidth/2));

    constructor(__drawerService: DrawerService, private __sanitizer: DomSanitizer){

        Observable.combineLatest(
            this.start$, this.drawerRx$
                .merge(this.handlerRx$)
                .filter((ev: any) => ev.type === 'move'))
            .do((ev) => this.inmotion = true)
            .map((val: any) => {
                let [start, ev] = val;
                return {
                    pos: ev.ev.center.x - start,
                    isFinal: ev.ev.isFinal,
                    lor: ev.ev.type //TODO: add velocity
                }
            })
            .subscribe(ev => {
                //console.log(ev);
                this.position$.next(ev.pos > this.drawerWidth ? this.drawerWidth : ev.pos < 0 ? 0 : ev.pos);
                if(ev.isFinal){
                    if(ev.lor === 'panleft'){
                        this.close();
                    } else {
                        this.open();
                    }
                    this.force$.next(false);
                } else {
                    this.force$.next(true);
                }
            });

        //TODO: is invoked also if isFinal true need to be changed
        this.end$
            .subscribe(bigger => {
                //console.log(bigger);
                if(bigger){
                    this.open();
                } else {
                    this.close();
                }
                this.force$.next(false);
            });

    }

    open(){
        this.position$.next(this.drawerWidth);
    }

    close(){
        this.position$.next(0);
    }

    styleSanitize(val) {
        return this.__sanitizer.bypassSecurityTrustStyle('translate(' + val + 'px, 0) translateZ(0)');
    }

    getOpacity(pos){
        let op: number = (pos / this.drawerWidth).toFixed(2);
        return op < 1 ? op : 1;
    }
}