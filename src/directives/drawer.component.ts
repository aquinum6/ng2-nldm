import { Component, ChangeDetectionStrategy, trigger, style, transition, animate, Input, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DrawerService } from './drawer.service';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

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
export class NativeDrawer implements OnDestroy{

    @Input() set width(_width: number){

        //TODO: allow % and px (px just in case)
        this.__drawerService.width = _width;
    }

    //TODO: make sure that only one instance of drawer is active at given time

    private _width: number;
    private _active$: BehaviorSubject<boolean>;

    private _handler$: Subject<Event>;
    private _drawer$: Subject<Event>;
    private _position$: BehaviorSubject<number>;

    constructor(private __drawerService: DrawerService, private __sanitizer: DomSanitizer){

        this._handler$ = __drawerService.handler$;
        this._drawer$ = __drawerService.drawer$;
        this._position$ = __drawerService.position$;

        this._width = __drawerService.width;
        this._active$ = __drawerService.active$;
    }

    styleSanitize(val) {
        return this.__sanitizer.bypassSecurityTrustStyle('translate(' + val + 'px, 0) translateZ(0)');
    }

    getOpacity(pos){
        let op: number = (pos / this._width).toFixed(2);
        return op < 1 ? op : 1;
    }

    ngOnDestroy(): void {
        this.__drawerService.reset();
    }
}