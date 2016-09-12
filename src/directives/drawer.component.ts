import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DrawerService } from './drawer.service';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/take';

@Component({
    moduleId: module.id,
    selector: 'native-drawer',
    templateUrl: './drawer.component.html',
    styleUrls: ['./drawer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NativeDrawer {

    private drawerWidth = 300;

    private handlerRx$: Subject<Event> = new Subject<Event>();
    private drawerRx$: Subject<Event> = new Subject<Event>();
    private position$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

    //Position of start point
    private start$: Subject<number> =
        this.handlerRx$
            .filter((ev: any) => ev.type === 'start')
            .map((ev: any) => ev.ev.center.x - ev.ev.target.getBoundingClientRect().left)
            .merge(
                //Drawer Event start stream
                this.drawerRx$
                    .filter((ev: any) => ev.type === 'start')
                    .map((ev: any) => ev.ev.center.x - this.drawerWidth));

    private end$: Subject<boolean> =
        this.handlerRx$
            .merge(this.drawerRx$)
            .filter((ev: any) => ev.type === 'end')
            .do((ev: any) => ev.ev.preventDefault())
            .mergeMap(() => this.position$.take(1)
                .map(pos => pos > this.drawerWidth/2));

    constructor(__drawerService: DrawerService, private __sanitizer: DomSanitizer){

        //TODO: subscribe 1 ??
        this.start$.subscribe(start => {
            this.drawerRx$
                .merge(this.handlerRx$)
                .filter((ev: any) => ev.type === 'move')
                .map((ev: any) => {
                    return {
                        pos: ev.ev.center.x - start,
                        isFinal: ev.ev.isFinal, //TODO: add velocity!!!
                        lor: ev.ev.type
                    };
                })
                //TODO: subscribe 2 ??
                .subscribe(ev => {

                    this.position$.next(ev.pos > this.drawerWidth ? this.drawerWidth : ev.pos < 0 ? 0 : ev.pos);
                    if(ev.isFinal){
                        if(ev.lor === 'panleft'){
                            this.close();
                        }

                        if(ev.lor === 'panright'){
                            this.open();
                        }
                    } else {

                        //TODO: subscribe 3 ??
                        this.end$.subscribe(open => {
                            if(open){
                                this.open();
                            } else {
                                this.close();
                            }
                        })
                    }
                });
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
}